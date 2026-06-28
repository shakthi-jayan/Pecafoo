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
