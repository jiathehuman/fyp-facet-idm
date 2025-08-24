from .serializers import (DetailSerializer,
                          PersonaSerializer, PersonaDetailSerializer,
                          PersonaAPIKeySerializer)

# Import models
from .models import PersonaDetail, Detail, Persona, PersonaAPIKey

# Import views templates
from rest_framework import generics
from rest_framework.views import APIView

# Import response and status to send data back to frontend
from rest_framework.response import Response
from rest_framework import status

# Permissions to access certain endpoints
from .permissions import HasPersonaAPIKey  # custom permission
from rest_framework.permissions import IsAuthenticated

from django.shortcuts import get_object_or_404


class DetailListCreate(generics.ListCreateAPIView):
    """
    API to create or list all Details related to a user
    URL: api/details/
    """
    serializer_class = DetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Get the user object accessing the route
        user = self.request.user
        return user.details.all()

    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(user=self.request.user)
        else:
            print(serializer.errors)


class DetailRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    """
    API to retrieve, update or delete a single Detail instance
    URL: api/details/<int:pk>/
    """
    serializer_class = DetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Get the user object accessing the route
        user = self.request.user
        return user.details.all()


class PersonaListCreate(generics.ListCreateAPIView):
    """
    API to list all Personas or create a new Persona
    URL: api/personas/
    """
    serializer_class = PersonaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Get the user instance accessing the route
        user = self.request.user
        return user.personas.all()

    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(user=self.request.user)
        else:
            print(serializer.errors)


class PersonaRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    """
    API to retreve, update or destroy a single Persona
    URL: api/personas/<int:pk>/
    """
    serializer_class = PersonaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return user.personas.all()


# class PersonaDetailDestroy(generics.DestroyAPIView):
#     """
#     API to destroy a certain PersonaDetail
#     """
#     queryset = PersonaDetail.objects.all()
#     serializer_class = PersonaDetailSerializer
#     permission_classes = [IsAuthenticated]


# class PersonaDetailDestroy(APIView):
#     """
#     API to destroy a single Persona Detail
#     URL: api/personas-detail/<int:pk>/
#     """
#     queryset = PersonaDetail.objects.all()
#     serializer_class = PersonaDetailSerializer
#     permission_classes = [IsAuthenticated]

#     def post(self, request, *args, **kwargs):
#         detail_id = request.data.get('id')

class PersonaDetailCreate(generics.CreateAPIView):
    """
    API to create a Persona Detail
    URL: /api/persona-detail-add/
    """
    queryset = PersonaDetail.objects.all()
    serializer_class = PersonaDetailSerializer
    permission_classes = [IsAuthenticated]


class PersonaDetailsList(generics.ListAPIView):
    """
    API to get all details related to a persona
    URL: /api/persona-details/<int:pk>/
    """
    serializer_class = DetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        persona_id = self.kwargs['pk']
        detail_ids = PersonaDetail.objects.filter(persona_id=persona_id).values_list('detail_id', flat=True)
        return Detail.objects.filter(id__in=detail_ids)


class PersonaDetailsUnassigned(generics.ListAPIView):
    """
    API to get Detail instances not assigned to a persona
    URL: /api/unassigned-details/<int:pk/
    """
    serializer_class = DetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        persona_id = self.kwargs['pk']
        current_detail_ids = PersonaDetail.objects.filter(persona_id=persona_id).values_list('detail_id', flat=True)
        return Detail.objects.filter(user=user).exclude(id__in=current_detail_ids)


class PersonaDetails(APIView):
    """
    Read-only endpoint for Persona Detail
    URL: api/persona/<int:pk>/
    """
    # Only clients with API key
    # Or authenticated users can have this
    permission_classes = [HasPersonaAPIKey]

    def get(self, request, pk):
        if not pk:
            return Response({'error': 'Missing persona_id or detail_id'},
                            status=status.HTTP_400_BAD_REQUEST)
        try:
            # Check if the request has a persona
            if not hasattr(request, 'persona'):
                return Response({'error': 'You need to provide a persona.'},
                                status=status.HTTP_403_FORBIDDEN)

            # Ensure the request's persona  matches the requested persona
            # if str(request.persona.id) != str(pk):
            #     return Response({'error': 'API key does not match.'},
            #                     status=status.HTTP_403_FORBIDDEN)

            # Get all the persona details related to this persona
            detail_ids = PersonaDetail.objects.filter(persona_id=pk).values_list('detail_id', flat=True)
            # Get all the details related to this persona
            persona_details = Detail.objects.filter(id__in=detail_ids)
            # Get the details in JSON
            details_data = DetailSerializer(persona_details, many=True).data
            key_value_data = {item['key']: item['current_value'] for item in details_data}
            return Response(key_value_data)

        except PersonaDetail.DoesNotExist:
            return Response({'error': 'Persona detail not found'},
                            status=status.HTTP_404_NOT_FOUND)


class PersonaDetailDelete(generics.DestroyAPIView):
    """
    API to destroy a PersonaDetail instance using persona_id and detail_id
    provided as URL parameters.

    URL: /api/persona-details/delete-composite/<int:persona_pk>/<int:detail_pk>/
    """
    queryset = PersonaDetail.objects.all()
    serializer_class = PersonaDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        """Get the PersonaDetail to delete"""
        # Retrieve the persona_pk and detail_pk from url kwargs
        persona_pk = self.kwargs.get('persona_pk')
        detail_pk = self.kwargs.get('detail_pk')

        # Find the PersonaDetail instance using composite unique_together fields
        obj = get_object_or_404(
            self.get_queryset(),
            persona_id=persona_pk,
            detail_id=detail_pk
        )
        # Ensure the user has permission to delete this specific object
        self.check_object_permissions(self.request, obj)
        return obj


class GeneratePersonaAPIKey(APIView):
    """
    API that allows an authenticated user to generate an API key
    URL: /api/personas/<int:pk>/generate-api-key/
    """
    throttle_scope = "low"  # only 50 requests per day
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        # persona = get_object_or_404(Persona, pk=pk, user=request.user)
        try:
            # Get the persona owned by the authenticated user
            persona = Persona.objects.get(pk=pk, user=request.user)
        except Persona.DoesNotExist:
            return Response({'error': 'Persona not found.'},
                            status=status.HTTP_404_NOT_FOUND)

        # AbstractAPIKey provides a `create_key` method
        api_key_instance, key = PersonaAPIKey.objects.create_key(
            name=f"API Key for {persona.key}",
            persona=persona,
            description=request.data.get('description', 'Generated API Key')
        )

        # Return the raw key to the user and prompt them to save it somewhere
        response_data = PersonaAPIKeySerializer(api_key_instance).data
        response_data['id'] = api_key_instance.id
        response_data['api_key'] = key
        return Response(response_data, status=status.HTTP_201_CREATED)


class APIKeysList(generics.ListAPIView):
    """
    API to get all API Keys related to a persona
    URL: api/personas/api-keys/<int:pk>/
    """
    serializer_class = PersonaAPIKeySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        persona_id = self.kwargs['pk']
        api_keys = PersonaAPIKey.objects.filter(persona_id=persona_id)
        return api_keys


class APIKeysDestroy(generics.DestroyAPIView):
    """
    API to Destroy all API Keys related to a persona
    URL: api/personas/api-keys-delete/<int:pk>/
    """
    serializer_class = PersonaAPIKeySerializer
    permission_classes = [IsAuthenticated]
    throttle_scope = "low"

    def get_queryset(self, request, pk):
        # Get the persona requested
        persona = get_object_or_404(Persona, pk=pk)
        try:
            count, _ = PersonaAPIKey.objects.filter(persona=persona).delete()
            return Response({
                "detail": f"All {count} keys deleted for this Persona."
            })
        except Exception:
            return Response(
                {"detail": "Deletion for persona went wrong"},
                status=status.HTTP_400_BAD_REQUEST
            )


class APIKeyDestroy(generics.DestroyAPIView):
    """
    API to destroy a single specific API Key
    URL: api/personas/api-key-delete/<int:pk>/
    """
    queryset = PersonaAPIKey.objects.all()
    serializer_class = PersonaAPIKeySerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        prefix = self.kwargs.get('prefix')
        api_key = get_object_or_404(PersonaAPIKey, prefix=prefix)
        # try:
        #     api_key = PersonaAPIKey.objects.get(prefix=prefix)
        # except PersonaAPIKey.DoesNotExist:
        #     return Response(
        #         {"detail": "Persona API Key does not exist"},
        #         status=status.HTTP_400_BAD_REQUEST
        #     )

        if api_key.persona.user != self.request.user:
            return Response(
                {"detail": "This is not a key."},
                status=status.HTTP_403_FORBIDDEN
            )

        return api_key
