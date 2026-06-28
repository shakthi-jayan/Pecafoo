from django.apps import AppConfig


class AccountsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "accounts"
    verbose_name = "Accounts & Authentication"

    def ready(self):
        import logging
        import firebase_admin
        from firebase_admin import credentials
        from django.conf import settings

        logger = logging.getLogger(__name__)

        if not firebase_admin._apps:
            firebase_config = settings.FIREBASE_CONFIG
            if not firebase_config.get("project_id"):
                logger.warning("Firebase project_id is not configured. Social login will not work.")
            else:
                try:
                    if "private_key" in firebase_config and firebase_config["private_key"]:
                        firebase_config["private_key"] = firebase_config["private_key"].replace("\\n", "\n")
                    
                    cred = credentials.Certificate(firebase_config)
                    firebase_admin.initialize_app(cred)
                    logger.info("Firebase Admin SDK initialized successfully at startup.")
                except Exception as e:
                    logger.error(f"Failed to initialize Firebase Admin SDK: {e}", exc_info=True)
                    # Raising exception here will cause Django to fail to start (Fail Fast)
                    raise
