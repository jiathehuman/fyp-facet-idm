from rest_framework.permissions import BasePermission
from .models import PersonaAPIKey, Persona
import logging
"""
HasPersonaAPIKey is a custom Permission class that limits access to persona
endpoints to only owners and clients with authorised API keys.
"""

logger = logging.getLogger(__name__)  # Get logging data


class HasPersonaAPIKey(BasePermission):
    """
    This permission definition only allows access in two scenerios:
    1) Requests are made with valid auth header in the form 'Api-Key <key>'
    2) Requests are made by users who own this persona
    """

    def has_permission(self, request, view):
        """
        Returns boolean whether client has permission to access endpoint.
        """
        # given that request is to http://127.0.0.1:8000/api/persona/<pk>/
        print("DEBUG: has_permission called")

        personaID = view.kwargs.get('pk')
        if not personaID:
            logger.warning("No persona ID (pk) provided in URL.")
            return False

        # Scenerio 1: Check for vlaid API Key
        header = request.META.get('HTTP_AUTHORIZATION', '')
        if header.lower().startswith('api-key '):
            api_key = header.split(' ', 1)[-1]
            # If the api key exists in authorization header
            if api_key:
                try:
                    # Get the associated PersonaAPIKey
                    APIKey_instance = PersonaAPIKey.objects.get_from_key(
                        api_key)
                    if APIKey_instance:
                        # If API key is valid, check
                        # if the API key instance matches persona requested
                        if str(APIKey_instance.persona.id) == str(personaID):
                            # Attach persona to the request
                            request.persona = APIKey_instance.persona
                            logger.info("Access granted via API Key.")
                            return True
                        else:
                            logger.info("API Key does not match persona.")
                except Exception as e:
                    logger.error(f"Error during API key validation: {e}")
            else:
                logger.warning("Empty API key provided in header.")

        # Scenerio 2: Check if the user is authenticated and owns persona
        if request.user and request.user.is_authenticated:
            try:
                # Get the persona related to personaID
                persona = Persona.objects.get(pk=personaID)
                # If persona is owned by request maker
                if persona.user == request.user:
                    # Attach persona to request
                    request.persona = persona
                    logger.info("Access granted to persona owned by user.")
                    return True
                else:
                    logger.warning("User does not own this persona.")
            except Persona.DoesNotExist:
                logger.warning("Persona not found")
            except Exception as e:
                logger.error(f"Error during user ownership check: {e}")

        logger.warning(f"Access denied for Persona ID: {personaID}.")
        return False
