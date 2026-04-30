import logging

from django.core.exceptions import PermissionDenied as DjangoPermissionDenied
from django.db import OperationalError
from django.http import Http404
from rest_framework import status
from rest_framework.exceptions import PermissionDenied, ValidationError, NotFound
from rest_framework.response import Response
from rest_framework.views import exception_handler

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is not None:
        return response

    if isinstance(exc, (ValidationError, NotFound, PermissionDenied, DjangoPermissionDenied, Http404)):
        logger.warning("Handled API exception", exc_info=exc)
        if isinstance(exc, (PermissionDenied, DjangoPermissionDenied)):
            return Response(
                {"error": "Permission denied.", "detail": str(exc) or "You do not have access to this resource."},
                status=status.HTTP_403_FORBIDDEN,
            )
        if isinstance(exc, (NotFound, Http404)):
            return Response(
                {"error": "Resource not found.", "detail": str(exc) or "The requested resource could not be found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(
            {"error": "Validation failed.", "detail": getattr(exc, "detail", str(exc))},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if isinstance(exc, OperationalError):
        return Response(
            {
                "error": "Database temporarily unavailable.",
                "detail": "Please retry in a moment.",
            },
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    logger.exception("Unhandled API exception", exc_info=exc)
    return Response(
        {
            "error": "Internal server error.",
            "detail": "An unexpected error occurred. Please try again later.",
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
