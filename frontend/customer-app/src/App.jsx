import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WebSocketProvider } from './context/WebSocketProvider';
import { LocationProvider } from './context/LocationContext';
import { WishlistProvider } from './context/WishlistContext';
import BottomNav from './components/BottomNav';
import ProtectedRoute from './components/ProtectedRoute';
import CartDrawer from './components/cart/CartDrawer';
import CartConflictModal from './components/cart/CartConflictModal';


const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const RestaurantDetailPage = lazy(() => import('./pages/RestaurantDetailPage'));
const ReviewsPage = lazy(() => import('./pages/ReviewsPage'));
const FoodProductsPage = lazy(() => import('./pages/FoodProductsPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage'));
const AddressesPage = lazy(() => import('./pages/AddressesPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const SavedItemsPage = lazy(() => import('./pages/SavedItemsPage'));
const SplashScreen = lazy(() => import('./pages/SplashScreen'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const ONBOARDING_KEY = 'pecafoo_onboarding_seen';

function PageLoader() {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <div className="skeleton" style={{ width: 120, height: 120, borderRadius: 24 }} />
        </div>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <WebSocketProvider>
                    <LocationProvider>
                        <WishlistProvider>
                            <CartProvider>
                                <WorkflowGate />
                            </CartProvider>
                        </WishlistProvider>
                    </LocationProvider>
                </WebSocketProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

function WorkflowGate() {
    const { user, loading } = useAuth();
    const [stage, setStage] = useState('splash');

    useEffect(() => {
        const timer = window.setTimeout(() => {
            const hasSeenOnboarding = localStorage.getItem(ONBOARDING_KEY) === 'true';
            if (!hasSeenOnboarding && !user) {
                setStage('onboarding');
                return;
            }


            setStage('app');
        }, 2000);

        return () => window.clearTimeout(timer);
    }, [user]);

    if (loading || stage === 'splash') {
        return (
            <Suspense fallback={<PageLoader />}>
                <SplashScreen />
            </Suspense>
        );
    }

    if (stage === 'onboarding') {
        return (
            <Suspense fallback={<PageLoader />}>
                <OnboardingPage
                    onFinish={() => {
                        localStorage.setItem(ONBOARDING_KEY, 'true');
                        setStage('app');
                    }}
                />
            </Suspense>
        );
    }

    return (
        <>
            <div className="app-container">
                <Suspense fallback={<PageLoader />}>
                    <AnimatedRoutes />
                </Suspense>
                <BottomNav />
                <CartDrawer />
                <CartConflictModal />
            </div>
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: '#ffffff',
                        color: '#241b35',
                        border: '1px solid #f8d8ca',
                        borderRadius: '16px',
                        boxShadow: '0 18px 40px rgba(255, 90, 31, 0.14)',
                        fontFamily: 'Inter, sans-serif',
                    },
                    duration: 3200,
                }}
            />
        </>
    );
}

function AnimatedRoutes() {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
            >
                <Routes location={location}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/restaurant/:slug" element={<RestaurantDetailPage />} />
                    <Route path="/restaurant/:slug/reviews" element={<ReviewsPage />} />
                    <Route path="/food-products" element={<FoodProductsPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
                    <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
                    <Route path="/addresses" element={<ProtectedRoute><AddressesPage /></ProtectedRoute>} />
                    <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
                    <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
                    <Route path="/saved-items" element={<ProtectedRoute><SavedItemsPage /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </motion.div>
        </AnimatePresence>
    );
}
