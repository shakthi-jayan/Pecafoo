
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
import { signInWithGoogle, signOut as firebaseSignOut } from '../config/firebaseClient';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

const parseStoredJson = (key) => {
    try {
        return JSON.parse(localStorage.getItem(key) || 'null');
    } catch {
        return null;
    }
};

const hasUsableTokens = (tokens) => Boolean(tokens?.access || tokens?.refresh);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    
    useEffect(() => {
        const storedUser = parseStoredJson('user');
        const storedTokens = parseStoredJson('tokens');

        if (storedUser && hasUsableTokens(storedTokens)) {
            setUser(storedUser);
        } else {
            localStorage.removeItem('user');
            localStorage.removeItem('tokens');
        }
        setLoading(false);
    }, []);

    
    const saveAuth = (userData, tokens) => {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('tokens', JSON.stringify(tokens));
        setUser(userData);
    };

    const register = useCallback(async (formData) => {
        try {
            const { data } = await authAPI.register(formData);
            saveAuth(data.user, data.tokens);
            toast.success('Account created successfully!');
            return data;
        } catch (error) {
            const errData = error.response?.data;
            if (!errData) {
                toast.error('Registration failed. Please check your connection.');
            } else if (typeof errData === 'string') {
                toast.error(errData);
            } else {
                const firstField = Object.keys(errData)[0];
                if (firstField) {
                    const msgs = errData[firstField];
                    const msg = Array.isArray(msgs) ? msgs[0] : msgs;
                    const label = firstField === 'non_field_errors' ? '' : firstField + ': ';
                    toast.error(label + (typeof msg === 'string' ? msg : JSON.stringify(msg)));
                } else {
                    toast.error('Registration failed. Please try again.');
                }
            }
            throw error;
        }
    }, []);

    const login = useCallback(async (email, password) => {
        try {
            const { data } = await authAPI.login({ email, password });
            saveAuth(data.user, data.tokens);
            toast.success('Welcome back!');
            return data;
        } catch (error) {
            const msg = error.response?.data;
            if (msg?.email) toast.error(msg.email[0]);
            else if (msg?.password) toast.error(msg.password[0]);
            else toast.error('Login failed. Please check your credentials.');
            throw error;
        }
    }, []);

    
    const googleLogin = useCallback(async () => {
        try {
            const firebaseToken = await signInWithGoogle();
            const { data } = await authAPI.firebaseAuth({
                firebase_token: firebaseToken,
                role: 'customer',
            });
            saveAuth(data.user, data.tokens);
            toast.success(data.is_new_user ? 'Account created!' : 'Welcome back!');
            return data;
        } catch (error) {
            console.error(error);
            toast.error(error.message);
            throw error;
        }
    }, []);

    const requestPhoneOtp = useCallback(async (phone_number) => {
        try {
            const { data } = await authAPI.requestPhoneOtp({ phone_number });
            if (data?.otp) {
                toast.success(`OTP sent. Use ${data.otp} for local testing.`);
            } else {
                toast.success('OTP sent successfully.');
            }
            return data;
        } catch (error) {
            toast.error(error.response?.data?.phone_number?.[0] || 'Failed to send OTP.');
            throw error;
        }
    }, []);

    const verifyPhoneOtp = useCallback(async (payload) => {
        try {
            const { data } = await authAPI.verifyPhoneOtp(payload);
            saveAuth(data.user, data.tokens);
            toast.success(data.is_new_user ? 'Account created with phone OTP!' : 'Logged in with OTP!');
            return data;
        } catch (error) {
            toast.error(error.response?.data?.otp?.[0] || 'OTP verification failed.');
            throw error;
        }
    }, []);

    
    const logout = useCallback(async () => {
        try {
            const tokens = JSON.parse(localStorage.getItem('tokens') || '{}');
            if (tokens.refresh) {
                await authAPI.logout({ refresh: tokens.refresh });
            }
            await firebaseSignOut();
        } catch {
            
        } finally {
            localStorage.removeItem('user');
            localStorage.removeItem('tokens');
            setUser(null);
            toast.success('Logged out successfully.');
        }
    }, []);

    
    const updateProfile = useCallback(async (data) => {
        try {
            const { data: updatedUser } = await authAPI.updateProfile(data);
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            const mergedUser = { ...currentUser, ...updatedUser };
            localStorage.setItem('user', JSON.stringify(mergedUser));
            setUser(mergedUser);
            toast.success('Profile updated!');
            return mergedUser;
        } catch (error) {
            toast.error('Failed to update profile.');
            throw error;
        }
    }, []);

    const value = {
        user,
        loading,
        isAuthenticated: !!user && hasUsableTokens(parseStoredJson('tokens')),
        register,
        login,
        googleLogin,
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
