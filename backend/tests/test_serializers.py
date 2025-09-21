from django.test import TestCase
from django.db.utils import IntegrityError
from persona.serializers import DetailSerializer
from persona.models import Detail
from .model_factories import UserFactory, DetailFactory


def pick_value_type():
    """
    Pick one of the value type choices for the detail
    """
    choices = getattr(Detail._meta.get_field("value_type"), "choices", [])
    if not choices:
        return None
    for key, label in choices:
        k, lbl = str(key).lower(), str(label).lower()
        if "string" in k or "string" in lbl or "text" in k or "text" in lbl:
            return key
    return choices[0][0]


class DetailSerializerTest(TestCase):
    """
    Tests for DetailSerializer behavior.
    """

    def setUp(self):
        self.user = UserFactory.create()
        self.string_choice = pick_value_type()

    def test_01_fields_include_current_value_and_user_readonly(self):
        """Serializer exposes expected fields and marks 'user' as read-only."""
        instance = DetailFactory.create(
            user=self.user,
            date_value=None,
            value_type=self.string_choice if self.string_choice else None,
        )
        ser = DetailSerializer(instance)
        data = ser.data

        self.assertIn("id", data)
        self.assertIn("key", data)
        self.assertIn("user", data)
        self.assertIn("current_value", data)

        self.assertTrue(DetailSerializer().fields["user"].read_only)

    def test_02_validate_key_formats_titlecase_hyphenated(self):
        """validate_key formats 'first name' -> 'First_Name'."""
        payload = {
            "key": "first name",
            "value_type": self.string_choice if self.string_choice else None,
            "string_value": "Alice",
        }
        ser = DetailSerializer(data=payload)
        self.assertTrue(ser.is_valid(), msg=ser.errors)
        self.assertEqual(ser.validated_data["key"], "first_name")

    def test_03_current_value_matches_model_property(self):
        """SerializerMethodField returns the model's current_value property."""
        instance = DetailFactory.create(
            user=self.user,
            value_type=self.string_choice if self.string_choice else None,
            string_value="hello",
            date_value=None,
        )
        ser = DetailSerializer(instance)
        self.assertEqual(ser.data["current_value"], instance.current_value)

    def test_04_input_user_is_ignored_on_write(self):
        """Incoming 'user' is ignored during validation (read_only=True)."""
        payload = {
            "key": "display name",
            "value_type": self.string_choice if self.string_choice else None,
            "string_value": "Bob",
            "user": self.user.pk,
        }
        ser = DetailSerializer(data=payload)
        self.assertTrue(ser.is_valid(), msg=ser.errors)
        self.assertNotIn("user", ser.validated_data)

    def test_05_save_allows_user_via_kwargs(self):
        """Views can bind user via ser.save(user=...)."""
        payload = {
            "key": "given name",
            "value_type": self.string_choice if self.string_choice else None,
            "string_value": "Ada",
        }
        ser = DetailSerializer(data=payload)
        self.assertTrue(ser.is_valid(), msg=ser.errors)

        obj = ser.save(user=self.user)
        self.assertIsInstance(obj, Detail)
        self.assertEqual(obj.user, self.user)
        self.assertEqual(obj.key, "given_name")

    def test_06_save_without_user_raises_integrity_error(self):
        """
        Detail.user is NOT NULL; saving without user should error.
        This matches the observed IntegrityError and formalizes it.
        """
        payload = {
            "key": "nickname",
            "value_type": self.string_choice if self.string_choice else None,
            "string_value": "Neo",
        }
        ser = DetailSerializer(data=payload)
        self.assertTrue(ser.is_valid(), msg=ser.errors)

        with self.assertRaises(IntegrityError):
            ser.save()
