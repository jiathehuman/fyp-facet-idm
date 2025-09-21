from .models import Detail, Persona, PersonaDetail, PersonaAPIKey
from rest_framework import serializers

"""
Defines
DetailSerializer,
PersonaSerializer,
PersonaDetailSerializer,
PersonaAPIKeySerializer
"""


class DetailSerializer(serializers.ModelSerializer):
    """
    Serialize from JSON to Django querysets for Detail instance and vice versa
    """
    current_value = serializers.SerializerMethodField()
    image_value = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Detail
        fields = '__all__'
        extra_kwargs = {"user": {"read_only": True}}

    def validate_key(self, value):
        """
        Reference: https://www.django-rest-framework.org/api-guide/serializers/
        Format the key
        """
        # format_string = '-'.join(word.capitalize() for word in value.split())
        return '_'.join(value.strip().split()).lower()
        # return format_string

    def get_current_value(self, obj):
        """
        Call the model's current_value property -
        since Detail model supports multiple file types.
        'obj' refers to the current Detail model instance being serialized.
        """
        return obj.current_value


class PersonaSerializer(serializers.ModelSerializer):
    """
    Serialize from JSON to Django querysets for Persona instance and vice versa
    """
    class Meta:
        model = Persona
        fields = ['id', 'key', 'created_at']
        # cannot change the user
        extra_kwargs = {"user": {"read_only": True}}


class PersonaDetailSerializer(serializers.ModelSerializer):
    """
    Serialize from JSON to Django querysets for PersonaDetail instance
    and vice versa
    """
    class Meta:
        model = PersonaDetail
        fields = ['id', 'persona', 'detail']


class PersonaAPIKeySerializer(serializers.ModelSerializer):
    """
    Serialize from JSON to Django querysets for PersonaAPIKey instance
    and vice versa
    """
    class Meta:
        model = PersonaAPIKey
        fields = ['prefix', 'description', 'created_at', 'persona']
        read_only_fields = ['prefix', 'created_at']
