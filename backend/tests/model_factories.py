# --------------------------------------------- #
# Create model factories to reuse for testing
# --------------------------------------------- #
import factory
from factory.django import DjangoModelFactory
from factory.fuzzy import FuzzyDateTime

# Used to generate fake data
from faker import Faker
import random
import secrets

# Create factories for these models
from userauth.models import User, SocialAccount
from persona.models import (Detail, Persona, PersonaDetail, PersonaAPIKey)
import datetime
fake = Faker()


class UserFactory(factory.django.DjangoModelFactory):
    """
    Factory for User model
    """
    # Reference: https://stackoverflow.com/questions/63200276/how-can-i-generate-a-random-value-for-username-in-django-user-model

    # Get a fake random user name
    username = factory.LazyAttribute(
        lambda o: fake.first_name().lower() + str(random.randint(1000, 9999)))

    # Reference: https://docs.python.org/3/library/secrets.html

    # Get a fake random token hex as the wallet address
    wallet_address = factory.LazyFunction(lambda: secrets.token_hex(20))

    # ReferebceL https://factoryboy.readthedocs.io/en/stable/fuzzy.html#fuzzychoice

    # Get a random email
    email = factory.LazyAttribute(lambda o: '%s@gmail.org' % o.username)

    class Meta:
        model = User


class SocialAccountFactory(factory.django.DjangoModelFactory):
    """
    Factory for Social Account model
    """
    # User is the foreign key for social account
    user = factory.SubFactory(UserFactory)
    # Default social account
    social_account_provider = 'Google'
    social_account_id = factory.Faker('pystr', max_chars=50)

    class Meta:
        model = SocialAccount


class PersonaFactory(factory.django.DjangoModelFactory):
    """
    Factory for Persona
    """
    # User is the foreign key for persona instance
    user = factory.SubFactory(UserFactory)
    # Get a random persona name (in use would be like default, social, professional)
    # key = factory.LazyAttribute(
    #     lambda o: fake.first_name().lower() + str(random.randint(1000, 9999)))
    key = factory.Faker('pystr', max_chars=30)

    class Meta:
        model = Persona


class DetailFactory(factory.django.DjangoModelFactory):
    """
    Factory for Detail
    """
    # User is the foreign key for Detail instance
    user = factory.SubFactory(UserFactory)
    key = factory.Faker('pystr', max_chars=20)
    # Different data types
    string_value = factory.Faker('pystr', max_chars=20)
    date_value = FuzzyDateTime(
        datetime.datetime(2000, 1, 1, tzinfo=datetime.timezone.utc),
        datetime.datetime(2025, 12, 31, 20, tzinfo=datetime.timezone.utc)
    )
    file_value = factory.django.FileField(filename='the_file.dat')
    image_value = factory.django.ImageField(filename='image.jpg')
    value_type = 'String'

    class Meta:
        model = Detail


class PersonaDetailFactory(factory.django.DjangoModelFactory):
    """
    Factory for PersonaDetail
    """
    # Persona is the foreign key for the personaDetail
    persona = factory.SubFactory(PersonaFactory)
    # Detail is the foreign key for personaDetail instance
    detail = factory.SubFactory(DetailFactory)

    class Meta:
        model = PersonaDetail


class PersonaAPIKeyFactory(DjangoModelFactory):
    class Meta:
        model = PersonaAPIKey

    name = factory.Faker("word")
    description = factory.Faker("sentence")
    persona = factory.SubFactory(PersonaFactory)

    @classmethod
    def _create(cls, model_class, *args, **kwargs):
        # Pop off any fields not accepted by create_key
        name = kwargs.pop("name")
        description = kwargs.pop("description", None)
        persona = kwargs.pop("persona")

        # This will call .save() and return (instance, raw_key)
        api_key_obj, raw_key = model_class.objects.create_key(
            name=name,
            persona=persona,
            description=description,
        )
        return api_key_obj

    # @classmethod
    # def _create(cls, model_class, *args, **kwargs):
    #     kwargs.pop("api_key", None)
    #     key, key_instance = model_class.objects.create_key(**kwargs)
    #     return key_instance
