# config/views.py
from django.http import JsonResponse
from django.views.decorators.csrf import requires_csrf_token
from django.views.decorators.http import require_http_methods

@requires_csrf_token
@require_http_methods(['GET', 'POST', 'PUT', 'DELETE'])
def csrf_failure(request, reason=''):
    return JsonResponse({
        'error': 'CSRF verification failed',
        'message': 'Please ensure you are sending the CSRF token correctly',
        'detail': reason,
        'status': 403
    }, status=403)
