from django.urls import reverse  # to generate the api key
from rest_framework import status  # to check for 401 and 403 errors
from rest_framework.test import APITestCase, APIClient  # to test api
from django.contrib.auth import get_user_model  # get the user model from auth

# Import the models PersonaAPIKey
from persona.models import PersonaAPIKey
# Import the factories
from .model_factories import (UserFactory, PersonaFactory, DetailFactory, PersonaDetailFactory)

"""
This file contains test points for the Persona Endpoint.
"""
# Get user model defined in userauth.models, default in settings
User = get_user_model()

# Reference for writing unit tests
# https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-best-practices


# Test:
# Access to http://127.0.0.1:8000/api/persona/<personaID> should only be accessible to
# 1) users that own the persona or to
# 2) clients with a valid API Key
class PersonaEndpointTests(APITestCase):
    """
    Integration tests to test API Key generation for protected Persona endpoint.
    """

    def setUp(self):
        """
        Set up test data: users, personas, and details.
        """
        # Create two users for the purposes of this test
        self.user1 = UserFactory.create(username='dummy1',
                                        password='password123')
        self.user2 = UserFactory.create(username='dummy2',
                                        password='password123')

        # User 1 will have a social persona with a job and age
        self.persona1 = PersonaFactory.create(user=self.user1, key='social')
        self.detail1 = DetailFactory.create(user=self.user1, key='occupation',
                                            value_type='string',
                                            string_value='software_engineer')
        self.detail2 = DetailFactory.create(user=self.user1, key='age',
                                            value_type='string',
                                            string_value='21')
        PersonaDetailFactory.create(persona=self.persona1, detail=self.detail1)
        PersonaDetailFactory.create(persona=self.persona1, detail=self.detail2)

        # user 2 will have a social persona with only hobby
        self.persona2 = PersonaFactory.create(user=self.user2, key='social')
        self.detail3 = DetailFactory.create(user=self.user2, key="hobby", string_value='pottery')
        PersonaDetailFactory.create(persona=self.persona2, detail=self.detail3)

        # The url to generate api key for persona1 of user 1
        self.generate_api_key_url = reverse('generate-persona-api-key',
                                            kwargs={'pk': self.persona1.id})
        # The protected url endpoint for persona details for persona 1
        self.user1_persona = reverse('persona',
                                     kwargs={'pk': self.persona1.id})
        # The persona details for user 2
        self.user2_persona = reverse('persona',
                                     kwargs={'pk': self.persona2.id})

        # Client for authenticated requests
        self.client = APIClient()

    def test_01_authorised_generation_of_API_key_success(self):
        """
        Tests that an authenticated user generating an API key for a persona is successful
        """
        # Log in user
        self.client.force_authenticate(user=self.user1)

        # Generate the API key for the persona
        response = self.client.post(self.generate_api_key_url, {'description': 'Test API Key'}, format='json')

        # The key should be created
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Response should contain api_key, description and id
        self.assertIn('api_key', response.data)
        self.assertIn('description', response.data)
        self.assertIn('id', response.data)

        # Description should be accurate
        self.assertEqual(response.data['description'], 'Test API Key')

        # Store the generated key for the next tests
        self.generated_api_key_persona1 = response.data['api_key']

        # Get the object for verification
        self.persona1_api_key_obj = PersonaAPIKey.objects.get(id=response.data['id'])

        self.assertIsNotNone(self.generated_api_key_persona1)
        self.assertEqual(self.persona1_api_key_obj.persona, self.persona1)

    def test_02_unauthorised_generation_of_API_key_failure(self):
        """
        Test that a user generating an API key for a persona they do not own fails.
        """
        # Authenticate as USer 1
        self.client.force_authenticate(user=self.user1)

        # User 1 tries to generate a key for persona2 (owned by user2)
        response = self.client.post(reverse('generate-persona-api-key', kwargs={'pk': self.persona2.id}),
                                    {'description': 'Should fail'}, format='json')

        # The persona should not be accessible to user 1
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        # The response data should have an error field
        self.assertIn('error', response.data)
        # The error should be that the persona is not found
        self.assertEqual(response.data['error'], 'Persona not found.')

    def test_03_authorised_access_of_persona_endpoint_with_api_key_success(self):
        """
        Test that PersonaDetails can be accessed with a valid API key.
        """
        # Generate API key for persona 1 as user 1
        # Authenticate as User 1
        self.client.force_authenticate(user=self.user1)
        # Try to generate the response
        gen_api_key_response = self.client.post(self.generate_api_key_url, {
            'description': 'Temp Key'}, format='json')
        # Assert that API key is successfully created
        self.assertEqual(gen_api_key_response.status_code, status.HTTP_201_CREATED)
        # Retrieve the api key
        api_key = gen_api_key_response.data['api_key']
        # Attach the api key to credentials
        self.client.credentials(HTTP_AUTHORIZATION=f'Api-Key {api_key}')
        # Attempt to use the API key to access the protected endpoint
        response = self.client.get(self.user1_persona)
        # Assert that getting the persona is okay
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # The expected data is defined in setUp
        expected_data = {
            'occupation': 'software_engineer',
            'age': '21'
        }
        # Assert that the data is correct
        self.assertEqual(response.data, expected_data)

    def test_04_unauthorised_access_of_persona_endpoint_with_no_key_failure(self):
        """
        Test that Persona accessed without an API key results in a failure.
        """
        # No credentials
        self.client.credentials()
        # Get the response from the url
        response = self.client.get(self.user1_persona)
        # Assert that attempted access to this resource is unauthorised
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_05_unauthorised_access_of_persona_endpoint_with_invalid_key_failure(self):
        """
        Test that Persona accessed with an invalid API key results in a failure.
        """
        # Attach an invvalid api key to the credentials
        INVALID_KEY = 'Api-Key AN_INVALID_KEY'
        # self.client.credentials(HTTP_AUTHORIZATION='Api-Key INVALID_KEY_STRING_XYZ')
        self.client.credentials(HTTP_AUTHORIZATION=INVALID_KEY)
        # Try to access protected endpoint
        response = self.client.get(self.user1_persona)
        # Get a response error that attempted access resource is unauthorised
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        # No authentication credentials are provided.
        self.assertIn('detail', response.data)
        self.assertEqual(response.data['detail'], 'Authentication credentials were not provided.')

    def test_06_unauthorised_acess_of_persona_endpoint_with_valid_key_invalid_persona_failure(self):
        """
        Test that Persona accessed with a valid API key for a different persona still results in failure.
        """
        # Authenticate as user 2
        self.client.force_authenticate(user=self.user2)
        # Generate a api key for user 2's persona
        gen_api_key_response = self.client.post(reverse('generate-persona-api-key',
                                                kwargs={'pk': self.persona2.id}),
                                                {'description': 'Persona2 Key'},
                                                format='json')

        # Assert that creation of generated key is successful
        self.assertEqual(gen_api_key_response.status_code, status.HTTP_201_CREATED)
        # Retrieve the api key
        persona2_api_key = gen_api_key_response.data['api_key']

        # Attempt to use API key to access user 1's persona
        self.client.credentials(HTTP_AUTHORIZATION=f'Api-Key {persona2_api_key}')
        response = self.client.get(self.user1_persona)
        # Assert that this attempt is forbidden
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
