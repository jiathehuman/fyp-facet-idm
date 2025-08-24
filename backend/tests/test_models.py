from django.test import TestCase  # Test the models
# Test the models related to user auth
from userauth.models import User, SocialAccount
# Test the models related to Persona
from persona.models import Persona, Detail, PersonaDetail, PersonaAPIKey
# Get the model factories
from .model_factories import (UserFactory, SocialAccountFactory,
                              PersonaFactory, DetailFactory,
                              PersonaDetailFactory, PersonaAPIKeyFactory)
# To handle violations of db integrity
from django.db.utils import IntegrityError

"""
This file contains tests that test the models
"""


class UserModelTest(TestCase):
    """
    Test that User Model works.
    """
    def setUp(self):
        self.user = UserFactory.create()

    def test_01_user_create(self):
        """Test that user creation is successful"""
        self.assertIsInstance(self.user, User)
        self.assertIsNotNone(self.user)

    def test_02_creating_multiple_users_success(self):
        """Test that creating multiple users is successful"""
        user1 = UserFactory.create(username="user1", password="password")
        user2 = UserFactory.create(username="user2", password="password")
        self.assertIsInstance(user1, User)
        self.assertIsInstance(user2, User)
        # 2 users created here + 1 user in setup
        self.assertEqual(User.objects.count(), 3)


class SocialAccountModelTest(TestCase):
    """
    Test that social account model works
    """
    def setUp(self):
        self.user = UserFactory.create()
        self.socialaccount = SocialAccountFactory.create(user=self.user)

    def test_01_socialaccount_create(self):
        """Test that creating social account is successful"""
        self.assertIsInstance(self.socialaccount, SocialAccount)
        self.assertIsNotNone(self.socialaccount)

    def test_02_multiple_socialaccount_create_successful(self):
        """Test that crreating multiple social accounts for a single user is successful"""
        # While I am not sure if I will be including more social logins aside from Google
        # Good to have for future expansion
        # Default provider is Google
        self.socialaccount = SocialAccountFactory.create(user=self.user,
                                                         social_account_provider='Github')
        self.assertEqual(SocialAccount.objects.count(), 2)


class PersonaAPIKeyModelTest(TestCase):
    """
    Test that PersonaAPIKey Model works
    """
    def setUp(self):
        self.user = UserFactory.create()
        self.persona = PersonaFactory.create(user=self.user)
        self.persona_key = PersonaAPIKeyFactory.create(persona=self.persona)

    def test_01_persona_api_key_create_success(self):
        """Test that creating an api key is successful"""
        self.assertIsInstance(self.persona_key, PersonaAPIKey)
        self.assertIsNotNone(self.persona_key)

    def test_02_persona_api_key_multiple_success(self):
        """Test that creating multiple api keys is successful"""
        persona_key2 = PersonaAPIKeyFactory.create(persona=self.persona)
        self.assertIsInstance(persona_key2, PersonaAPIKey)
        self.assertEqual(PersonaAPIKey.objects.count(), 2)

    def test_03_deletion_of_persona_cascade_delete_api_key(self):
        """Test that deleting a persona will delete api key"""
        self.persona.delete()
        self.assertEqual(PersonaAPIKey.objects.count(), 0)


class PersonaModelTest(TestCase):
    """
    Test that Persona Model works
    """
    def setUp(self):
        self.user = UserFactory.create()
        self.persona = PersonaFactory.create(user=self.user)

    def test_01_persona_create(self):
        """Test that creating a persona is successful"""
        self.assertIsInstance(self.persona, Persona)
        self.assertIsNotNone(self.persona)

    def test_02_multiple_persona_create_success(self):
        """Test that creating multiple personas is successful"""
        self.persona2 = PersonaFactory.create(user=self.user)
        self.assertIsInstance(self.persona2, Persona)
        self.assertEqual(Persona.objects.count(), 2)


class DetailModelTest(TestCase):
    """
    Test that Detail Model works
    """
    def setUp(self):
        self.user = UserFactory.create()
        self.detail = DetailFactory.create(user=self.user)

    def test_01_detail_create_successful(self):
        """Test that creating a detail is successful"""
        self.assertIsInstance(self.detail, Detail)
        self.assertIsNotNone(self.detail)

    def test_02_multiple_detail_create_successful(self):
        """Test that creating multiple details is successful"""
        detail2 = DetailFactory.create(user=self.user)
        self.assertIsInstance(detail2, Detail)
        self.assertEqual(Detail.objects.count(), 8)


class PersonaDetailModelTest(TestCase):
    """
    Test that Persona Detail Model works
    """
    def setUp(self):
        self.user = UserFactory.create()
        self.persona = PersonaFactory.create(user=self.user)
        self.detail = DetailFactory.create(user=self.user)
        self.persona_detail = PersonaDetailFactory.create(persona=self.persona,
                                                          detail=self.detail)

    def test_01_persona_detail_create_success(self):
        """Test that creating a persona detail is successful"""
        self.assertIsInstance(self.persona_detail, PersonaDetail)
        self.assertIsNotNone(self.persona_detail)

    def test_02_multiple_persona_detail_create_success(self):
        """Test that creating multiple persona details is successful"""
        detail2 = DetailFactory.create(user=self.user)
        persona_detail2 = PersonaDetailFactory.create(persona=self.persona,
                                                      detail=detail2)
        self.assertIsInstance(persona_detail2, PersonaDetail)
        self.assertEqual(Detail.objects.count(), 8)

    def test_03_unique_together_constraint_violation_fail(self):
        with self.assertRaises(IntegrityError):  # an integrity error is raised
            PersonaDetailFactory.create(persona=self.persona, detail=self.detail)

    def test_03_deletion_of_persona_cascade_delete_personadetails_success(self):
        """Test that deleting a persona will delete persona details"""
        self.persona.delete()
        self.assertEqual(PersonaDetail.objects.count(), 0)
