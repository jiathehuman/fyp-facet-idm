from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    """
    User model is created when users sign up for an account
    through social login or manual registration
    """
    username = models.CharField(max_length=100, unique=True)
    wallet_address = models.CharField(max_length=100, unique=True, null=True)
    email = models.CharField(max_length=100, unique=True, null=True)

    def save(self, *args, **kwargs):
        if not self.email:
            self.email = None
        print("The user is saved")
        super().save(*args, **kwargs)

    def __str__(self):
        return self.username


class SocialAccount(models.Model):
    """
    Social Account that is created when users log in with a social account
    A user can have many social accounts,
    but only one from each service provider.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE,
                             related_name="socials")
    social_account_id = models.CharField(max_length=100, unique=True)
    social_account_provider = models.CharField(max_length=50, default="google")

    class Meta:
        unique_together = ('user', 'social_account_provider')

    def __str__(self):
        return f"{self.user} {self.social_account_provider}"
