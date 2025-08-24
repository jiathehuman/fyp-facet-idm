from .models import User
from rest_framework import serializers


class UserSerializer(serializers.ModelSerializer):
    """
    Serialize from JSON to User Django querysets and vice versa
    """
    class Meta:
        model = User
        fields = ["id", "username", "password", "email"]
        # To ensure that no one can read the password
        extra_kwargs = {"password": {"write_only": True}}

    def validate_email(self, value):
        """If user with email exists, raise an error."""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered.")
        return value

    def create(self, validated_data):
        """Create a new User instance"""
        user = User.objects.create_user(**validated_data)
        return user


class UserWalletSerializer(serializers.ModelSerializer):
    """
    Serialize from JSON to UserWallet Django querysets and vice versa
    """
    class Meta:
        model = User
        fields = ['wallet_address']

    def update(self, instance, validated_data):
        instance.wallet_address = validated_data.get('wallet_address', instance.wallet_address)
        instance.save()
        return instance
