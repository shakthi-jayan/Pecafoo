"""
Shared media URL utilities for Pecafoo.

Provides helpers to build correct absolute image URLs regardless of whether
a file is stored locally or on Cloudinary.
"""

import logging
import os
import re
from pathlib import Path

from django.conf import settings
from rest_framework import serializers

logger = logging.getLogger("pecafoo")

# Pre-compiled pattern to detect absolute URLs.
_ABS_URL_RE = re.compile(r"^https?://", re.IGNORECASE)
_DOCUMENT_EXTENSIONS = {
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".ppt",
    ".pptx",
    ".txt",
    ".csv",
    ".rtf",
    ".zip",
}


def normalize_media_url(value, request=None):
    """
    Return a fully-qualified URL for a media value.

    Handles three storage scenarios:
      1. Already an absolute URL (Cloudinary / CDN) → return as-is.
      2. Protocol-relative URL (//res.cloudinary.com/…) → prepend https.
      3. Relative path from the DB (/media/… or restaurants/…) → build
         a full URL using the current request host or MEDIA_URL.
    """
    if not value:
        return None

    value = str(value)

    # Absolute URL — already good (e.g. Cloudinary)
    if _ABS_URL_RE.match(value):
        return value

    # Protocol-relative (unlikely but safe)
    if value.startswith("//"):
        return f"https:{value}"

    # Relative path — build absolute from request context
    if request is not None:
        return request.build_absolute_uri(
            value if value.startswith("/") else f"{settings.MEDIA_URL}{value}"
        )

    # Fallback: just prepend MEDIA_URL if no leading slash
    if not value.startswith("/"):
        return f"{settings.MEDIA_URL}{value}"

    return value


def _cloudinary_raw_url(url, name=None):
    """
    Convert Cloudinary delivery URLs for documents to raw delivery URLs.

    Cloudinary's media storage defaults to `image/upload`, which works for
    images but can return inaccessible document URLs for PDFs and similar
    files. Raw assets must be served from `raw/upload`.
    """
    if not url or "/image/upload/" not in url:
        return url

    suffix = Path(name or "").suffix.lower()
    if suffix in _DOCUMENT_EXTENSIONS:
        return url.replace("/image/upload/", "/raw/upload/", 1)

    return url


class SmartImageField(serializers.ImageField):
    """
    A DRF ImageField that always outputs a fully-qualified URL.

    Works correctly whether the underlying storage is local FileSystem
    or Cloudinary.  When Cloudinary is configured, Django's
    ``ImageField.url`` already returns an absolute Cloudinary URL.
    When local storage is in use, we build a full URL from the request.
    """

    def to_representation(self, value):
        if not value:
            return None

        try:
            url = value.url
        except Exception:
            # If .url blows up (e.g. file is missing), try to recover
            url = getattr(value, "name", None)
            if not url:
                return None

        request = self.context.get("request")
        return normalize_media_url(url, request)


class SmartFileField(serializers.FileField):
    """
    Same as SmartImageField but for generic file uploads (PDFs, docs etc).
    """

    def to_representation(self, value):
        if not value:
            return None

        try:
            url = value.url
        except Exception:
            url = getattr(value, "name", None)
            if not url:
                return None

        request = self.context.get("request")
        url = normalize_media_url(url, request)
        return _cloudinary_raw_url(url, getattr(value, "name", None))
