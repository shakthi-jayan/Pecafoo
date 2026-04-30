"""
Accounts — Firebase Authentication Backend
=============================================
Initializes Firebase Admin SDK and provides a helper function
to verify Firebase ID tokens for Google/social login.
"""

import logging

import firebase_admin
from firebase_admin import auth as firebase_auth, credentials
from django.conf import settings

logger = logging.getLogger(__name__)




_firebase_app = None


def _get_firebase_app():
    """
    Lazily initialize Firebase Admin SDK using credentials from settings.
    Returns the Firebase app instance.
    """
    global _firebase_app
    if _firebase_app is not None:
        return _firebase_app

    firebase_config = settings.FIREBASE_CONFIG
    if not firebase_config.get("project_id"):
        logger.warning(
            "Firebase project_id is not configured. "
            "Social login will not work."
        )
        return None

    try:
        cred = credentials.Certificate(firebase_config)
        _firebase_app = firebase_admin.initialize_app(cred)
        logger.info("Firebase Admin SDK initialized successfully.")
        return _firebase_app
    except Exception as e:
        logger.error(f"Failed to initialize Firebase Admin SDK: {e}")
        return None


def verify_firebase_token(id_token: str) -> dict | None:
    """
    Verify a Firebase ID token and return the decoded claims.

    Args:
        id_token: The Firebase ID token string from the frontend.

    Returns:
        Decoded token claims dict if valid, None otherwise.
        Contains: uid, email, name, picture, sign_in_provider, etc.
    """
    app = _get_firebase_app()
    if app is None:
        logger.error("Firebase app not initialized. Cannot verify token.")
        return None

    try:
        decoded_token = firebase_auth.verify_id_token(id_token, app=app)
        return decoded_token
    except firebase_auth.ExpiredIdTokenError:
        logger.warning("Firebase token has expired.")
        return None
    except firebase_auth.RevokedIdTokenError:
        logger.warning("Firebase token has been revoked.")
        return None
    except firebase_auth.InvalidIdTokenError:
        logger.warning("Invalid Firebase token.")
        return None
    except Exception as e:
        logger.error(f"Unexpected error verifying Firebase token: {e}")
        return None
