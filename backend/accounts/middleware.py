"""
Accounts — JWT Authentication Middleware for WebSockets
=========================================================
Custom middleware to authenticate WebSocket connections using JWT tokens.
Tokens are passed as query parameters: ws://host/ws/path/?token=<jwt_token>
"""

import logging
from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError

User = get_user_model()
logger = logging.getLogger(__name__)


@database_sync_to_async
def get_user_from_token(token_string: str):
    """
    Validate a JWT access token and return the corresponding user.
    Returns AnonymousUser if the token is invalid.
    """
    try:
        token = AccessToken(token_string)
        user_id = token.get("user_id")
        return User.objects.get(id=user_id)
    except (TokenError, User.DoesNotExist) as e:
        logger.warning(f"WebSocket auth failed: {e}")
        return AnonymousUser()


class JWTAuthMiddleware(BaseMiddleware):
    """
    Custom middleware for Django Channels that authenticates
    WebSocket connections using JWT tokens from query parameters.

    Usage in frontend:
        new WebSocket("ws://host/ws/orders/1/?token=<jwt_access_token>")
    """

    async def __call__(self, scope, receive, send):
        
        query_string = scope.get("query_string", b"").decode("utf-8")
        query_params = parse_qs(query_string)
        token_list = query_params.get("token", [])

        if token_list:
            scope["user"] = await get_user_from_token(token_list[0])
        else:
            scope["user"] = AnonymousUser()

        return await super().__call__(scope, receive, send)
