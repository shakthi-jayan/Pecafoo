import re

with open('backend/accounts/views.py', 'r', encoding='utf-8') as f:
    content = f.read()

old_firebase_logic = '''        from accounts.utils import get_owned_roles, safe_log_auth, generate_login_ticket
        owned_roles = get_owned_roles(user)
        
        if not is_new_user and len(owned_roles) > 1:
            safe_log_auth(request, action="FIREBASE_LOGIN_ROLE_SELECTION_REQUIRED", user=user, status_code=200)
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
        
        safe_log_auth(request, action="FIREBASE_LOGIN", user=user, status_code=200)

        return Response(
            {
                "message": "Firebase login successful.",
                "tokens": tokens,
                "user": UserSerializer(user).data,
                "is_new_user": is_new_user,
            },
            status=status.HTTP_200_OK,
        )'''

new_firebase_logic = '''        from accounts.utils import get_owned_roles, safe_log_auth, generate_login_ticket
        owned_roles = get_owned_roles(user)
        owned_role_ids = [r["id"] for r in owned_roles]
        
        if requested_role and requested_role != "customer":
            if requested_role in owned_role_ids:
                tokens = _get_tokens_for_user(user, active_role=requested_role)
                safe_log_auth(request, action="FIREBASE_LOGIN", user=user, status_code=200)
                return Response({
                    "next_action": AuthNextAction.LOGIN_COMPLETE,
                    "message": "Firebase login successful.",
                    "tokens": tokens,
                    "user": UserSerializer(user).data,
                    "is_new_user": is_new_user,
                }, status=status.HTTP_200_OK)
            else:
                safe_log_auth(request, action="FIREBASE_LOGIN_ONBOARDING_REQUIRED", user=user, status_code=200)
                return Response({
                    "next_action": AuthNextAction.ONBOARD_ROLE,
                    "requested_role": requested_role,
                    "login_ticket": generate_login_ticket(user),
                    "user": UserSerializer(user).data,
                    "is_new_user": is_new_user,
                }, status=status.HTTP_200_OK)
                
        if len(owned_roles) > 1:
            safe_log_auth(request, action="FIREBASE_LOGIN_ROLE_SELECTION_REQUIRED", user=user, status_code=200)
            return Response({
                "next_action": AuthNextAction.ROLE_SELECTION,
                "login_ticket": generate_login_ticket(user),
                "roles": owned_roles,
                "user": UserSerializer(user).data,
            }, status=status.HTTP_200_OK)
            
        active_role = owned_role_ids[0] if owned_role_ids else user.role
        tokens = _get_tokens_for_user(user, active_role=active_role)
        safe_log_auth(request, action="FIREBASE_LOGIN", user=user, status_code=200)

        return Response({
            "next_action": AuthNextAction.LOGIN_COMPLETE,
            "message": "Firebase login successful.",
            "tokens": tokens,
            "user": UserSerializer(user).data,
            "is_new_user": is_new_user,
        }, status=status.HTTP_200_OK)'''

content = content.replace(old_firebase_logic, new_firebase_logic)

with open('backend/accounts/views.py', 'w', encoding='utf-8') as f:
    f.write(content)
