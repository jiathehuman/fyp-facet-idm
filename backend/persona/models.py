from django.db import models
from userauth.models import User
# Using the API key
from rest_framework_api_key.models import AbstractAPIKey


class Detail(models.Model):
    """
    Detal model stores a particular attribute associated with user
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE,
                             related_name="details")
    key = models.CharField(max_length=50)

    # Different data types
    string_value = models.CharField(max_length=255, blank=True, null=True)
    date_value = models.DateField(blank=True, null=True)
    # Upload files to a set folder
    file_value = models.FileField(upload_to='user_details_files/', blank=True,
                                  null=True)
    # Upload images to a set folder
    image_value = models.ImageField(upload_to='user_details_photos/',
                                    default="default-profile.jpg",
                                    blank=True, null=True)

    # A field to indicate which 'value' field is active
    VALUE_TYPE_CHOICES = [
        ('string', 'String'),
        ('date', 'Date'),
        ('file', 'File'),
        ('image', 'Image')
    ]
    value_type = models.CharField(
        max_length=10,
        choices=VALUE_TYPE_CHOICES,
        default='string'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'key')  # Ensure key is unique per user

    def __str__(self):
        # Dynamically return the appropriate value
        return str(f"{self.key} {self.value_type} {self.current_value}")

    # Property decorator makes this a dynamically generated property of the value
    @property
    def current_value(self):
        """
        Convenience property to get the active value regardless of type.
        """
        if self.value_type == 'string':
            return self.string_value
        elif self.value_type == 'date':
            return self.date_value
        elif self.value_type == 'file':
            if self.file_value and hasattr(self.file_value, 'url'):
                return self.file_value.url
            return None
        elif self.value_type == 'image':
            if self.image_value and hasattr(self.image_value, 'url'):
                return self.image_value.url
            return "default-profile.jpg"
        return None


class Persona(models.Model):
    """
    Persona model stores a user persona (eg. Social, Professional)
    """
    key = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE,
                             related_name="personas")

    class Meta:
        unique_together = ('key', 'user')

    def __str__(self):
        return f"{self.user}'s persona"


class PersonaDetail(models.Model):
    """
    PersonaDetail model is a Bridging table between Persona and Detail
    """
    persona = models.ForeignKey(Persona, on_delete=models.CASCADE)
    detail = models.ForeignKey(Detail, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('persona', 'detail')

    def __str__(self):
        return f"{self.persona} {self.detail}"


class PersonaAPIKey(AbstractAPIKey):
    """
    PersonaAPIKey model holds API keys to specific persona endpoints
    """
    persona = models.ForeignKey(Persona, on_delete=models.CASCADE,
                                related_name='api_keys')
    description = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"API Key for {self.persona}"
