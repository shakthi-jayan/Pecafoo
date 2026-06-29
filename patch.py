import re

with open('backend/accounts/views.py', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add AuthNextAction class
content = content.replace('class CustomRefreshToken', '''class AuthNextAction:
    LOGIN_COMPLETE = "LOGIN_COMPLETE"
    ROLE_SELECTION = "ROLE_SELECTION"
    ONBOARD_ROLE = "ONBOARD_ROLE"
    VERIFY_PHONE = "VERIFY_PHONE"

class CustomRefreshToken''')

# 2. Update LoginView
old_login = '''    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]
        requested_role = request.data.get("role")
        
        from accounts.utils import get_owned_roles, safe_log_auth, generate_login_ticket
        owned_roles = get_owned_roles(user)
        
        if len(owned_roles) > 1:
            safe_log_auth(request, action="LOGIN_ROLE_SELECTION_REQUIRED", user=user, status_code=200)
            return Response(
                {
                    "needs_role_selection": True,
                    "login_ticket": generate_login_ticket(user),
                    "roles": owned_roles,
                    "user": UserSerializer(user).data,
                },
                status=status.HTTP_200_OK,
            )
            
        active_role = owned_roles[0]["id"] if owned_roles else user.role
        
        tokens = _get_tokens_for_user(user, active_role=active_role)
        user_data = UserSerializer(user).data
        
        safe_log_auth(request, action="LOGIN", user=user, status_code=200)

        return Response(
            {
                "message": "Login successful.",
                "tokens": tokens,
                "user": user_data,
            },
            status=status.HTTP_200_OK,
        )'''

new_login = '''    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]
        requested_role = request.data.get("requested_role")
        
        from accounts.utils import get_owned_roles, safe_log_auth, generate_login_ticket
        owned_roles = get_owned_roles(user)
        owned_role_ids = [r["id"] for r in owned_roles]
        
        if requested_role:
            if requested_role in owned_role_ids:
                tokens = _get_tokens_for_user(user, active_role=requested_role)
                safe_log_auth(request, action="LOGIN", user=user, status_code=200)
                return Response({
                    "next_action": AuthNextAction.LOGIN_COMPLETE,
                    "message": "Login successful.",
                    "tokens": tokens,
                    "user": UserSerializer(user).data,
                }, status=status.HTTP_200_OK)
            else:
                safe_log_auth(request, action="LOGIN_ONBOARDING_REQUIRED", user=user, status_code=200)
                return Response({
                    "next_action": AuthNextAction.ONBOARD_ROLE,
                    "requested_role": requested_role,
                    "login_ticket": generate_login_ticket(user),
                    "user": UserSerializer(user).data,
                }, status=status.HTTP_200_OK)
                
        if len(owned_roles) > 1:
            safe_log_auth(request, action="LOGIN_ROLE_SELECTION_REQUIRED", user=user, status_code=200)
            return Response({
                "next_action": AuthNextAction.ROLE_SELECTION,
                "login_ticket": generate_login_ticket(user),
                "roles": owned_roles,
                "user": UserSerializer(user).data,
            }, status=status.HTTP_200_OK)
            
        active_role = owned_role_ids[0] if owned_role_ids else user.role
        tokens = _get_tokens_for_user(user, active_role=active_role)
        safe_log_auth(request, action="LOGIN", user=user, status_code=200)

        return Response({
            "next_action": AuthNextAction.LOGIN_COMPLETE,
            "message": "Login successful.",
            "tokens": tokens,
            "user": UserSerializer(user).data,
        }, status=status.HTTP_200_OK)'''

content = content.replace(old_login, new_login)

# 3. Update CompleteLoginView
old_complete = '''            return Response({
                "message": "Login completed.",
                "tokens": tokens,
                "user": UserSerializer(user).data
            }, status=status.HTTP_200_OK)'''

new_complete = '''            return Response({
                "next_action": AuthNextAction.LOGIN_COMPLETE,
                "message": "Login completed.",
                "tokens": tokens,
                "user": UserSerializer(user).data
            }, status=status.HTTP_200_OK)'''

content = content.replace(old_complete, new_complete)

# 4. Update PartnerOnboardView
old_partner = '''            return Response({
                "message": f"{role.title()} profile created successfully.",
                "tokens": tokens,
                "user": UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)'''

new_partner = '''            return Response({
                "next_action": AuthNextAction.LOGIN_COMPLETE,
                "message": f"{role.title()} profile created successfully.",
                "tokens": tokens,
                "user": UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)'''

content = content.replace(old_partner, new_partner)

with open('backend/accounts/views.py', 'w', encoding='utf-8') as f:
    f.write(content)
