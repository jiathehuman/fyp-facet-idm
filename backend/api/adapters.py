from allauth.socialaccount.adapter import DefaultSocialAccountAdapter

"""
Adapter for social account
Reference: https://docs.allauth.org/en/dev/socialaccount/adapter.html
The adapter class overides the functionality of the allaouth.socialaccount app
"""


class SocialAccountsAdapter(DefaultSocialAccountAdapter):
    def pre_social_login(self, request, sociallogin):
        """Get the email from the social login account
        to set it as user's email"""
        email = sociallogin.account.extra_data.get("email")

        if not email:
            return

    def get_login_redirect_url(self, request):
        """Returns the root url"""
        return "/"

    def is_open_for_signup(self, request, sociallogin):
        """Users are allowed to sign up with social account"""
        return True
