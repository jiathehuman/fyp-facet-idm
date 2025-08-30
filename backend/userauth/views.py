from rest_framework import generics
from .serializers import UserSerializer, UserWalletSerializer
from django.contrib.auth.decorators import login_required
from rest_framework.permissions import AllowAny
from .models import User, SocialAccount
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import redirect
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from google.oauth2 import id_token
from google.auth.transport import requests as g_requests
from django.conf import settings
from rest_framework import status
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

# Message signing and verification
from eth_account.messages import encode_defunct
from eth_account import Account
import secrets
from rest_framework.permissions import IsAuthenticated
from rest_framework.throttling import ScopedRateThrottle
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle


@method_decorator(csrf_exempt, name='dispatch')
class CreateUserView(generics.CreateAPIView):
    """Create a user"""
    throttle_classes = [AnonRateThrottle]  # Throttle based on the IP adddress
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
    authentication_classes = []


@api_view(["GET"])
def check_user_exists(request):
    email = request.query_params.get("email")
    if not email:
        return Response({"error": "Email required"}, status=400)

    exists = User.objects.get(email=email).exists()
    return Response({"exists": exists})


@login_required
def post_login_redirect(request):
    """Redirect user after login"""
    user = request.user
    print(f"User {user.username} successfully logged in.")

    REACT_APP_BASE_URL = "http://localhost:5173/"

    # Check if this user logged in via a social provider
    is_social = SocialAccount.objects.filter(user=user).exists()
    print("Is this a social login: ", is_social)

    if is_social:
        # Redirect to React with params for social login handling
        return redirect(REACT_APP_BASE_URL)

    else:
        # Regular login: go to home or dashboard
        return redirect(REACT_APP_BASE_URL)


class GoogleSocialAuthView(APIView):
    """Google Social Login"""
    throttle_classes = [AnonRateThrottle]
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):

        id_token_string = request.data.get('idToken')  # get the idToken
        print("Extracted id_token_string from request.data:", id_token_string)

        # If not ID Token is present, return with the error response
        if not id_token_string:
            return Response(
                {"detail": "Google ID token is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        # When the ID Token is present
        try:
            # Get payload to check and verify token - done with oauth
            # Verifies ID Token issued by Google's OAuth 2.0 authorization server
            payload = id_token.verify_oauth2_token(
                id_token_string,
                g_requests.Request(),
                settings.GOOGLE_CLIENT_ID
            )

            # If the audience is not the client id for this app
            if payload['aud'] != settings.GOOGLE_CLIENT_ID:
                # Raise an error
                raise ValueError("Google token not meant for this app.")

            # Get google's unique user ID
            google_id = payload.get('sub')
            email = payload.get('email')
            name = payload.get('name')

            # Return an error if there is no email
            if not email:
                return Response(
                    {"detail": "Google token did not contain an email."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # user will contain the User instance for this login
            user = None
            try:
                # Get SocialAccount that is linked to this Google ID
                social_account = SocialAccount.objects.get(
                    social_account_id=google_id,
                    social_account_provider='google'
                )
                # Get User instance by foreign key
                user = social_account.user

            except SocialAccount.DoesNotExist:
                # If no SocialAccount exists for this google_id,
                # check if a User with this email already exists
                try:
                    user = User.objects.get(email=email)

                # If no user with this email exists, create the user
                except User.DoesNotExist:
                    # Let username be the name before '@' symbol
                    username = name if name else email.split('@')[0]
                    # There is no password for social log in
                    user = User.objects.create_user(
                        username=username,
                        email=email,
                        password=None
                    )
                    # Let the user not use password for security
                    user.set_unusable_password()
                    # Save the user
                    user.save()

                # Create and update the social account
                # The user and social account provider is unique together
                social_account, created = SocialAccount.objects.get_or_create(
                    user=user,
                    social_account_id=google_id,
                    social_account_provider='google'
                )
                if created:
                    print(f"New SocialAccount created for {user.email}")
                else:
                    print("SocialAccount exists")

            # Generate the Access and Refresh Token needed for secure frontend
            # Axios and React
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)

            user_data = {
                "id": user.pk,
                "email": user.email,
                "username": user.username,
                "wallet_address": user.wallet_address
            }

            return Response(
                {
                    "refresh": str(refresh),
                    "access": access_token,
                    "user": user_data
                },
                status=status.HTTP_200_OK
            )

        except ValueError as e:
            """Catch exception where Google ID is invalid"""
            return Response(
                {"detail": f"Invalid Google ID token: {e}"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        except Exception as e:
            """Catch general exception"""
            return Response(
                {"detail": f"An unexpected error occurred: {e}."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class EthereumAuthView(APIView):
    """Ethereum Social Login"""
    throttle_classes = [AnonRateThrottle]
    permission_classes = [AllowAny]

    def post(self, request):
        wallet_address = request.data.get('wallet_address')
        signature = request.data.get('signature')
        message = request.data.get('message')
        # If either of the three fields above are missing
        if not wallet_address or not signature or not message:
            return Response(
                {"detail": """Wallet address, signature,
                 and message are required."""},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Basic Ehereum wallet address format validation
        if not wallet_address.startswith('0x') or len(wallet_address) != 42:
            return Response(
                {"detail": "Invalid Ethereum wallet address format."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Step One: Verify the signature -----------------------------------
        try:
            # Reconstruct the message that was signed
            encoded_message = encode_defunct(text=message)
            # Recover the address from the signature
            recovered_address = Account.recover_message(encoded_message,
                                                        signature=signature)

            # Raise error if recovered address does not match provided wallet_address
            if recovered_address.lower() != wallet_address.lower():
                return Response(
                    {"detail": """Signature verification failed:
                     Addresses do not match."""},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            print(f"""Signature verified successfully for {wallet_address}.
                  Recovered: {recovered_address}""")

        except Exception as e:
            print(f"Signature verification error: {e}")
            return Response(
                {"detail": f"Signature verification failed: {e}"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Step Two: Authenticate/ Create user -----------------------------------
        user = None
        try:
            # Try to find user by wallet address
            # Use iexact for case-insensitive match
            # Reference: https://www.w3schools.com/django/ref_lookups_iexact.php
            user = User.objects.get(wallet_address__iexact=wallet_address)
            print(f"Existing user found by wallet address: {user.username}")

        except User.DoesNotExist:
            # If user with this wallet address doesn't exist, create a new one
            username = wallet_address  # Default username is wallet address
            # If there is already such a username
            if User.objects.filter(username=username).exists():
                # Append a short random string if username conflicts
                username = f"{username}_{secrets.token_hex(4)}"

            user = User.objects.create_user(
                username=username,
                password=None,  # No password
                wallet_address=wallet_address  # Store the verified address
            )
            # Set unusable password for wallet-authenticated users (no need for password)
            user.set_unusable_password()
            user.save()
            print(f"New Django User created for wallet: {user.wallet_address}")

        # Step One: Generate and return JWT for frontend -----------------------------------
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        user_data = {
            "id": user.pk,
            "username": user.username,
            "wallet_address": user.wallet_address,
            "email": user.email
        }

        return Response(
            {
                "refresh": str(refresh),
                "access": access_token,
                "user": user_data
            },
            status=status.HTTP_200_OK
        )


class UserProfileView(APIView):
    """View retrieves user's wallet or updates wallet"""
    throttle_classes = [UserRateThrottle]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Return user wallet"""
        serializer = UserWalletSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        """Update user wallet"""
        serializer = UserWalletSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ThrottledTokenObtainPairView(TokenObtainPairView):
    """THrottle token"""
    permission_classes = [AllowAny]              # allow unauthenticated login attempts
    throttle_classes = [ScopedRateThrottle]     # Throttle such that they cannot spam login
    throttle_scope = 'login'
