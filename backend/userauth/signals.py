from allauth.account.signals import user_logged_in
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from persona.models import Detail
from django.db.models.signals import post_save

"""
This file contains a custom signal that creates 6 default "Detail" objects for 1 user
when the user instance is first created.
"""

User = get_user_model()


@receiver(post_save, sender=User)  # When User is called
def create_default_details_for_user(sender, instance, created, **kwargs):
    if created:
        default_details_config = {
            'name': {'type': 'String', 'value': ''},
            'date_of_birth': {'type': 'Date', 'value': None},
            'email': {'type': 'String', 'value': ''},
            'job': {'type': 'String', 'value': ''},
            'gender': {'type': 'String', 'value': ''},
            'profile_picture': {'type': 'Image', 'value': "default-profile.jpg"}
        }

        for key_name, config in default_details_config.items():
            # Iterate through the six details in the config to create the Detail
            if not Detail.objects.filter(user=instance, key=key_name).exists():
                detail_kwargs = {
                    'user': instance,
                    'key': key_name,
                    'value_type': config['type']
                }

                # Assign value to the correct field based on 'type'
                if config['type'] == 'String':
                    detail_kwargs['string_value'] = config['value']
                elif config['type'] == 'Date':
                    detail_kwargs['date_value'] = config['value']
                elif config['type'] == 'File':
                    detail_kwargs['file_value'] = config['value']
                elif config['type'] == 'Image':
                    detail_kwargs['image_value'] = config['value']

                Detail.objects.create(**detail_kwargs)
        print("Created default Detail objects for new user.")


@receiver(user_logged_in)
def post_login(sender, request, user, **kwargs):
    print(f"{user.email} just logged in via Google.")
