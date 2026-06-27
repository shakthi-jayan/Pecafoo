"""
Phone number normalization utilities for Indian phone numbers.
Converts various formats to E.164 format (+91XXXXXXXXXX).
"""

import phonenumbers
from rest_framework import serializers


def normalize_phone_number(phone_number: str) -> str:
    """
    Normalize an Indian phone number to E.164 format.
    
    Accepts formats:
    - 9876543210 (10 digits)
    - 09876543210 (11 digits with leading 0)
    - +919876543210 (E.164 format)
    - 919876543210 (country code without +)
    
    Returns: Normalized number in E.164 format (+91XXXXXXXXXX)
    Raises: serializers.ValidationError if invalid
    """
    if not phone_number or not isinstance(phone_number, str):
        raise serializers.ValidationError("Phone number must be a non-empty string.")
    
    phone_number = phone_number.strip()
    
    try:
        # Try to parse with India as the default region
        parsed = phonenumbers.parse(phone_number, region="IN")
        
        # Validate the number
        if not phonenumbers.is_valid_number(parsed):
            raise serializers.ValidationError(
                "Invalid phone number. Please enter a valid Indian mobile number (10 digits)."
            )
        
        # Return in E.164 format
        return phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.E164)
    
    except phonenumbers.NumberParseException as e:
        # Handle specific parse errors with friendly messages
        error_msg = str(e)
        if "Invalid country code" in error_msg or "The string supplied is too short" in error_msg:
            raise serializers.ValidationError(
                "Invalid phone number. Please enter a valid Indian mobile number (10 digits)."
            )
        raise serializers.ValidationError(f"Invalid phone number format: {error_msg}")
    except Exception as e:
        raise serializers.ValidationError(f"Error validating phone number: {str(e)}")
