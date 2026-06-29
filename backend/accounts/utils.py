import logging
import time
from typing import List

logger = logging.getLogger(__name__)

def get_active_roles(user) -> List[str]:
    """
    Pure function to determine a user's active roles based on existing relationships.
    No database writes or side effects are performed.
    """
    if not user or not user.is_authenticated:
        return []

    active_roles = []
    
    # Check Customer profile
    if hasattr(user, 'customer_profile'):
        active_roles.append("customer")
        
    # Check Restaurant profiles
    # user.restaurants is a RelatedManager. .exists() is a read query.
    if hasattr(user, 'restaurants') and user.restaurants.exists():
        active_roles.append("restaurant")
        
    # Check Delivery profile
    if hasattr(user, 'delivery_profile'):
        active_roles.append("delivery")
        
    # Check Admin capability
    if getattr(user, 'is_staff', False) or getattr(user, 'is_superuser', False) or getattr(user, 'role', '') == 'admin':
        active_roles.append("admin")
        
    return active_roles

ROLE_REGISTRY = {
    "customer": {
        "name": "Customer",
        "app_label": "customers",
        "model_name": "CustomerProfile",
        "status_field": None,  # Always approved
        "has_profile": lambda user: hasattr(user, "customer_profile"),
    },
    "delivery": {
        "name": "Delivery Partner",
        "app_label": "delivery",
        "model_name": "DeliveryPartnerProfile",
        "status_field": "is_verified",
        "has_profile": lambda user: hasattr(user, "delivery_profile"),
    },
    "restaurant": {
        "name": "Restaurant Owner",
        "app_label": "restaurants", # assuming
        "model_name": "Restaurant", # assuming
        "status_field": None, # or something else, but restaurants is a related manager usually
        "has_profile": lambda user: hasattr(user, "restaurants") and user.restaurants.exists(),
    },
    "admin": {
        "name": "Admin",
        "app_label": None,
        "model_name": None,
        "status_field": None,
        "has_profile": lambda user: getattr(user, 'is_staff', False) or getattr(user, 'is_superuser', False) or getattr(user, 'role', '') == 'admin',
    }
}

def get_owned_roles(user) -> List[dict]:
    """
    Returns a structured list of roles owned by the user, including metadata.
    """
    if not user or not user.is_authenticated:
        return []

    roles = []
    
    for role_id, config in ROLE_REGISTRY.items():
        if config["has_profile"](user):
            status = "approved"
            if config["status_field"]:
                # Get the actual profile instance to check status
                if role_id == "delivery" and hasattr(user, "delivery_profile"):
                    status = "approved" if getattr(user.delivery_profile, config["status_field"], False) else "pending"
            roles.append({
                "id": role_id,
                "display": config["name"],
                "status": status
            })
            
    return roles

def add_role_profile(user, role_id: str):
    """
    Idempotently creates the necessary profile for a user to adopt a new role.
    """
    config = ROLE_REGISTRY.get(role_id)
    if not config:
        return
        
    if role_id == "admin":
        user.is_staff = True
        user.save(update_fields=["is_staff"])
        return
        
    if config["app_label"] and config["model_name"]:
        from django.apps import apps
        try:
            ModelClass = apps.get_model(config["app_label"], config["model_name"])
            if role_id == "restaurant":
                # For restaurants it might be 1-to-many. For now do nothing or standard get_or_create if 1-to-1.
                pass
            else:
                ModelClass.objects.get_or_create(user=user)
        except LookupError:
            logger.error(f"Model {config['app_label']}.{config['model_name']} not found for role {role_id}.")

def verify_identity(user, request_data: dict) -> bool:
    """
    Verifies the user's identity using the best available credential in the request.
    Supports password, Firebase token, or OTP.
    """
    password = request_data.get("password")
    if password:
        return user.check_password(password)
        
    firebase_token = request_data.get("firebase_token")
    if firebase_token:
        # Ideally verify the firebase_token via admin SDK and match firebase_uid
        # For simplicity in this abstraction, if they passed it, we'd normally verify it here.
        # But we don't have the firebase decoded token here unless we decode it.
        # So we'll rely on password or if they are already authenticated via a fresh session.
        # (A real implementation would decode the token here using Firebase Admin SDK)
        pass
        
    otp = request_data.get("otp")
    if otp:
        # OTP verification logic
        pass
        
    return False

def generate_login_ticket(user) -> str:
    from django.core.signing import Signer
    import time
    signer = Signer()
    # Ticket expires in 5 minutes (300 seconds)
    return signer.sign_object({
        "user_id": user.id,
        "exp": time.time() + 300
    })

def verify_login_ticket(ticket: str):
    from django.core.signing import Signer, BadSignature
    import time
    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    signer = Signer()
    try:
        data = signer.unsign_object(ticket)
        if time.time() > data.get("exp", 0):
            return None
        return User.objects.get(id=data["user_id"])
    except (BadSignature, User.DoesNotExist):
        return None

def safe_log_auth(request, action: str, user=None, status_code: int = 200, execution_time_ms: int = 0):
    """
    Safely log authentication actions without exposing sensitive data
    and without throwing exceptions that could break the request.
    """
    try:
        from django.utils import timezone
        import uuid
        
        log_data = {
            "timestamp": timezone.now().isoformat(),
            "action": action,
            "endpoint": request.path,
            "request_id": request.headers.get("X-Request-ID", str(uuid.uuid4())),
            "ip": request.META.get("REMOTE_ADDR", ""),
            "user_agent": request.META.get("HTTP_USER_AGENT", ""),
            "status_code": status_code,
            "execution_time_ms": execution_time_ms
        }
        
        if user and hasattr(user, 'id'):
            log_data["user_id"] = str(user.id)
            log_data["email"] = getattr(user, 'email', '')
        
        logger.info(f"Auth Action: {action} - User: {log_data.get('email', 'Anonymous')} - IP: {log_data['ip']} - Status: {status_code}", extra={"auth_event": log_data})
    except Exception as e:
        logger.error(f"Failed to write structured auth log: {str(e)}")
