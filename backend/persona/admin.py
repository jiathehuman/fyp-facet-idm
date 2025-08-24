from django.contrib import admin
from .models import (Detail, Persona, PersonaDetail,
                     PersonaAPIKey)
# Register your models here.
admin.site.register(Detail)
admin.site.register(Persona)
admin.site.register(PersonaDetail)
admin.site.register(PersonaAPIKey)
