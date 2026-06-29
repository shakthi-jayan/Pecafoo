
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
import { signInWithGoogle, signOut as firebaseSignOut } from '../config/firebase';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedTokens = localStorage.getItem('tokens');

        if (storedUser && storedTokens) {
            setUser(JSON.parse(storedUser));
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
            const msg = error.response?.data;
            if (msg?.email) toast.error(msg.email[0]);
            else if (msg?.password_confirm) toast.error(msg.password_confirm[0]);
            else toast.error('Registration failed. Please try again.');
            throw error;
        }
    }, []);

    
    const login = useCallback(async (email, password) => {
        try {
            const { data } = await authAPI.login({ email, password });
            
            if (data.needs_role_selection) {
                const isRestaurant = data.roles.some(r => r.id === 'restaurant');
                if (isRestaurant) {
                    const res = await authAPI.completeLogin({ login_ticket: data.login_ticket, role: 'restaurant' });
                    saveAuth(res.data.user, res.data.tokens);
                    return { success: true };
                } else {
                    return { needsOnboarding: true, login_ticket: data.login_ticket };
                }
            }
            
            if (data.user.role !== 'restaurant') {
                return { needsOnboarding: true, direct_token: true };
            }
            
            saveAuth(data.user, data.tokens);
            toast.success('Welcome back!');
            return { success: true };
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
            toast.error('Google sign-in failed. Please try again.');
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
        isAuthenticated: !!user,
        register,
        login,
        googleLogin,
        logout,
        updateProfile,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
