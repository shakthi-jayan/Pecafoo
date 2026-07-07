import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { onForceLogout } from '@pecafoo/api';
import {
  getTokens, setTokens, clearTokens,
  getUser, setUser, clearUser,
  getActiveRole, setActiveRole, clearRole,
} from '@pecafoo/storage';
import authService from './authService';

WebBrowser.maybeCompleteAuthSession();

const AuthContext = createContext(null);

const hasUsableTokens = (tokens) => Boolean(tokens?.access || tokens?.refresh);

export const AuthProvider = ({ children, defaultRole }) => {
  const [user, setUserState] = useState(null);
  const [pendingLogin, setPendingLogin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeRoleState, setActiveRoleState] = useState(defaultRole);
  const unsubRef = useRef(null);

  // ── Hydrate from AsyncStorage on mount ──
  useEffect(() => {
    const hydrate = async () => {
      try {
        const [storedUser, storedTokens, storedRole] = await Promise.all([
          getUser(),
          getTokens(),
          getActiveRole(),
        ]);

        if (storedUser && hasUsableTokens(storedTokens)) {
          setUserState(storedUser);
          if (storedRole) setActiveRoleState(storedRole);
        } else {
          await Promise.all([clearTokens(), clearUser(), clearRole()]);
        }
      } catch {
        // Storage read failed — start fresh
      } finally {
        setLoading(false);
      }
    };

    hydrate();

    // Listen for force-logout from API interceptor
    unsubRef.current = onForceLogout(() => {
      setUserState(null);
      setPendingLogin(null);
    });

    return () => {
      if (unsubRef.current) unsubRef.current();
    };
  }, []);

  // ── Persist auth state ──
  const saveAuth = useCallback(async (userData, tokens) => {
    await Promise.all([
      setUser(userData),
      setTokens(tokens),
    ]);
    setPendingLogin(null);
    setUserState(userData);
  }, []);

  // ── Register ──
  const register = useCallback(async (formData) => {
    try {
      const { data } = await authService.register(formData);
      await saveAuth(data.user, data.tokens);
      return data;
    } catch (error) {
      const errData = error.response?.data;
      const errString = JSON.stringify(errData || {});

      if (error.response?.status === 409 || errString.includes('ACCOUNT_EXISTS') || errString.includes('already exists')) {
        error.isAccountExists = true;
      }
      throw error;
    }
  }, [saveAuth]);

  // ── Login ──
  const login = useCallback(async (email, password, requestedRole) => {
    const { data } = await authService.login({
      email,
      password,
      requested_role: requestedRole || defaultRole,
    });

    if (data.next_action === 'ROLE_SELECTION' || data.next_action === 'ONBOARD_ROLE') {
      setPendingLogin(data);
      return data;
    }

    await saveAuth(data.user, data.tokens);
    if (data.user?.active_role) {
      await setActiveRole(data.user.active_role);
      setActiveRoleState(data.user.active_role);
    }
    return data;
  }, [saveAuth, defaultRole]);

  // ── Google Login via expo-auth-session ──
  const googleLogin = useCallback(async (idToken) => {
    const { data } = await authService.firebaseAuth({
      firebase_token: idToken,
    });

    if (data.needs_role_selection) {
      setPendingLogin(data);
      return data;
    }

    await saveAuth(data.user, data.tokens);
    return data;
  }, [saveAuth]);

  // ── Complete Login (role selection) ──
  const completeLogin = useCallback(async (ticket, roleId) => {
    const { data } = await authService.completeLogin({
      login_ticket: ticket,
      role: roleId,
    });
    await saveAuth(data.user, data.tokens);
    if (roleId) {
      await setActiveRole(roleId);
      setActiveRoleState(roleId);
    }
    return data;
  }, [saveAuth]);

  // ── Partner Onboarding ──
  const partnerOnboard = useCallback(async (payload) => {
    const { data } = await authService.partnerOnboard(payload);
    await saveAuth(data.user, data.tokens);
    return data;
  }, [saveAuth]);

  // ── Phone OTP ──
  const requestPhoneOtp = useCallback(async (phoneNumber) => {
    const { data } = await authService.requestPhoneOtp({ phone_number: phoneNumber });
    return data;
  }, []);

  const verifyPhoneOtp = useCallback(async (payload) => {
    const { data } = await authService.verifyPhoneOtp(payload);
    await saveAuth(data.user, data.tokens);
    return data;
  }, [saveAuth]);

  // ── Logout ──
  const logout = useCallback(async () => {
    try {
      const tokens = await getTokens();
      if (tokens?.refresh) {
        await authService.logout({ refresh: tokens.refresh });
      }
    } catch {
      // Silent — we're logging out regardless
    } finally {
      await Promise.all([clearTokens(), clearUser(), clearRole()]);
      setUserState(null);
      setPendingLogin(null);
    }
  }, []);

  // ── Update Profile ──
  const updateProfile = useCallback(async (profileData) => {
    const { data: updatedUser } = await authService.updateProfile(profileData);
    const currentUser = await getUser();
    const mergedUser = { ...currentUser, ...updatedUser };
    await setUser(mergedUser);
    setUserState(mergedUser);
    return mergedUser;
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    activeRole: activeRoleState,
    pendingLogin,
    register,
    login,
    googleLogin,
    completeLogin,
    partnerOnboard,
    requestPhoneOtp,
    verifyPhoneOtp,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
