"""
Management command to migrate locally-stored media files to Cloudinary.

Scans all ImageField/FileField instances across registered models, uploads
files that exist on disk but not yet in Cloudinary, then updates the DB
record with the Cloudinary public_id so future `.url` calls return the
correct CDN link.

Usage:
    python manage.py migrate_media_to_cloudinary          # dry-run (default)
    python manage.py migrate_media_to_cloudinary --apply  # actually migrate
"""

import logging
import os

import cloudinary
import cloudinary.uploader
from django.apps import apps
from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import models

logger = logging.getLogger("pecafoo")

IMAGE_EXTENSIONS = {
    ".jpg", ".jpeg", ".jpe", ".png", ".gif", ".webp",
    ".bmp", ".tif", ".tiff", ".ico", ".svg",
}
VIDEO_EXTENSIONS = {
    ".mp4", ".webm", ".flv", ".mov", ".ogv",
    ".3gp", ".3g2", ".wmv", ".mpeg", ".mkv", ".avi",
}


def _resource_type_for(filename):
    """Return the Cloudinary resource_type based on the file extension."""
    ext = os.path.splitext(filename)[1].lower()
    if ext in IMAGE_EXTENSIONS:
        return "image"
    if ext in VIDEO_EXTENSIONS:
        return "video"
    return "raw"


class Command(BaseCommand):
    help = "Migrate local media files to Cloudinary and update DB references."

    def add_arguments(self, parser):
        parser.add_argument(
            "--apply",
            action="store_true",
            default=False,
            help="Actually upload and update. Without this flag, only a dry-run report is produced.",
        )

    def handle(self, *args, **options):
        apply = options["apply"]
        media_root = str(settings.MEDIA_ROOT)

        if not os.path.isdir(media_root):
            self.stderr.write(self.style.ERROR(f"MEDIA_ROOT does not exist: {media_root}"))
            return

        mode = "APPLY" if apply else "DRY-RUN"
        self.stdout.write(self.style.NOTICE(f"\n{'='*60}"))
        self.stdout.write(self.style.NOTICE(f"  Cloudinary Media Migration  [{mode}]"))
        self.stdout.write(self.style.NOTICE(f"{'='*60}\n"))

        migrated = 0
        skipped = 0
        errors = 0

        for model in apps.get_models():
            file_fields = [
                f for f in model._meta.get_fields()
                if isinstance(f, (models.FileField, models.ImageField))
            ]
            if not file_fields:
                continue

            for obj in model.objects.all().iterator():
                for field in file_fields:
                    field_file = getattr(obj, field.name)
                    if not field_file or not field_file.name:
                        continue

                    name = field_file.name
                    local_path = os.path.join(media_root, name)

                    # Skip if already a Cloudinary public_id (no extension in path
                    # or path does not exist locally)
                    if not os.path.isfile(local_path):
                        # Try common image extensions since Cloudinary storage might have stripped it
                        found_path = None
                        for ext in [".png", ".jpg", ".jpeg", ".webp"]:
                            if os.path.isfile(local_path + ext):
                                found_path = local_path + ext
                                break
                        
                        if not found_path:
                            self.stdout.write(
                                f"  SKIP  {model.__name__}.{field.name} = {name}  "
                                f"(file not found locally — may already be on Cloudinary)"
                            )
                            skipped += 1
                            continue
                        local_path = found_path
                        # Fix the DB name to include the extension so _resource_type_for works
                        name = name + os.path.splitext(local_path)[1]

                    # Determine resource type and upload folder
                    resource_type = _resource_type_for(name)
                    folder = os.path.dirname(name).replace("\\", "/")

                    self.stdout.write(
                        f"  {'UPLOAD' if apply else 'WOULD UPLOAD'}  "
                        f"{model.__name__}.{field.name} = {name}  "
                        f"(resource_type={resource_type}, folder={folder})"
                    )

                    if apply:
                        try:
                            result = cloudinary.uploader.upload(
                                local_path,
                                resource_type=resource_type,
                                folder=folder,
                                use_filename=True,
                                unique_filename=False,
                                overwrite=True,
                                tags=["media", "migrated"],
                            )
                            public_id = result["public_id"]
                            # Update the field to the Cloudinary public_id
                            setattr(obj, field.name, public_id)
                            obj.save(update_fields=[field.name])
                            self.stdout.write(
                                self.style.SUCCESS(
                                    f"         -> Uploaded as {public_id}  |  "
                                    f"URL: {result.get('secure_url', 'N/A')}"
                                )
                            )
                            migrated += 1
                        except Exception as exc:
                            self.stderr.write(
                                self.style.ERROR(
                                    f"         -> FAILED: {exc}"
                                )
                            )
                            logger.exception(
                                "Cloudinary migration failed for %s.%s pk=%s",
                                model.__name__, field.name, obj.pk,
                            )
                            errors += 1
                    else:
                        migrated += 1

        self.stdout.write(f"\n{'='*60}")
        self.stdout.write(
            f"  Results: {migrated} {'migrated' if apply else 'would migrate'}, "
            f"{skipped} skipped, {errors} errors"
        )
        self.stdout.write(f"{'='*60}\n")

        if not apply and migrated > 0:
            self.stdout.write(
                self.style.WARNING(
                    "  Run with --apply to actually upload files and update the database.\n"
                )
            )
