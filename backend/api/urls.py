"""
URL configuration for api project.
Reference: https://docs.djangoproject.com/en/5.2/topics/http/urls/
"""

from django.contrib import admin
from django.urls import path, include
from userauth.views import (CreateUserView, check_user_exists,
                            post_login_redirect, GoogleSocialAuthView,
                            UserProfileView, EthereumAuthView,
                            ThrottledTokenObtainPairView, delete_account)
# Views that allow us to get access and refresh token
from rest_framework_simplejwt.views import (TokenObtainPairView,
                                            TokenRefreshView)
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

urlpatterns = [
    path("admin/", admin.site.urls),
    # ThrottledTokenObtainPairView provides a pair of JWT with rate-limiting
    path("user/token/", ThrottledTokenObtainPairView.as_view(),
         name="token_obtain_pair"),
    path("user/token/", TokenObtainPairView.as_view(), name="get_token"),
    path("user/token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("user/exists/", check_user_exists, name="user_exists"),
    path("social-login-success/", post_login_redirect),

    # Library to authenticate with JWT
    path('dj-rest-auth/', include('dj_rest_auth.urls')),
    path('dj-rest-auth/registration/', include('dj_rest_auth.registration.urls')),

    # Reference: https://allauth.org/
    # AllAuth is an authentication solution for Django framework
    # For social user accounts and MFA
    path('accounts/', include('allauth.urls')),
    path("auth/", include("rest_framework.urls")),
    path("auth/google/", GoogleSocialAuthView.as_view(), name="google_login"),
    path("auth/ethereum/", EthereumAuthView.as_view(), name="ethereum_login"),

    # Custom Views for the app
    path('user/profile/', UserProfileView.as_view(), name='user-profile'),
    path("user/register/", CreateUserView.as_view(), name="register"),
    path("api/delete-account/", delete_account, name="delete-account"),

    # Main functionality of the app
    path("api/", include("persona.urls")),
    path("schema/", SpectacularAPIView.as_view(), name="schema"),  # JSON/YAML schema
    path("docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
