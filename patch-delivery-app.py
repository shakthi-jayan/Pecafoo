import re

with open('frontend/delivery-app/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_login = '''  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    
    if (data.needs_role_selection) {
      const isDelivery = data.roles.some(r => r.id === 'delivery');
      if (isDelivery) {
        // Silently complete login for delivery role
        const res = await authAPI.completeLogin({ login_ticket: data.login_ticket, role: 'delivery' });
        localStorage.setItem('delivery_user', JSON.stringify(res.data.user));
        localStorage.setItem('delivery_tokens', JSON.stringify(res.data.tokens));
        setUser(res.data.user);
        return { success: true };
      } else {
        // Needs onboarding
        return { needsOnboarding: true, login_ticket: data.login_ticket };
      }
    }
    
    // Direct JWT case
    if (data.user.role !== 'delivery') {
      return { needsOnboarding: true, direct_token: true };
    }
    
    localStorage.setItem('delivery_user', JSON.stringify(data.user));
    localStorage.setItem('delivery_tokens', JSON.stringify(data.tokens));
    setUser(data.user);
    return { success: true };
  }, []);'''

new_login = '''  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login({ email, password, requested_role: 'delivery' });
    
    if (data.next_action === 'LOGIN_COMPLETE') {
      localStorage.setItem('delivery_user', JSON.stringify(data.user));
      localStorage.setItem('delivery_tokens', JSON.stringify(data.tokens));
      setUser(data.user);
    }
    return data;
  }, []);

  const partnerOnboard = useCallback(async (payload) => {
    const { data } = await authAPI.partnerOnboard({ ...payload, role: 'delivery' });
    if (data.next_action === 'LOGIN_COMPLETE') {
      localStorage.setItem('delivery_user', JSON.stringify(data.user));
      localStorage.setItem('delivery_tokens', JSON.stringify(data.tokens));
      setUser(data.user);
    }
    return data;
  }, []);'''

content = content.replace(old_login, new_login)

old_provider = '''<AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, register, logout }}>'''
new_provider = '''<AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, register, logout, partnerOnboard }}>'''
content = content.replace(old_provider, new_provider)

with open('frontend/delivery-app/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
