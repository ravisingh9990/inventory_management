// client/src/App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext'; // Import DataProvider
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './pages/Dashboard';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import MessageBox from './components/MessageBox';

function AppContent() {
    const { isAuthenticated, login, logout, user, loading: authLoading } = useAuth();
    const [showLogin, setShowLogin] = useState(true);
    const [authMessage, setAuthMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        const checkAuthStatus = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // Try to fetch user profile to validate token
                    const config = {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    };
                    const res = await axios.get(`${process.env.REACT_APP_API_URL}/auth/profile`, config);
                    login(token, res.data.role, res.data.branchId); // Re-authenticate user
                } catch (error) {
                    console.error("Token validation failed:", error);
                    logout(); // Clear invalid token
                }
            }
        };
        checkAuthStatus();
    }, [login, logout]); // Depend on login/logout to avoid infinite loop

    const handleAuthMessage = (message, type) => {
        setAuthMessage({ text: message, type: type });
        setTimeout(() => setAuthMessage({ text: '', type: '' }), 3000);
    };

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-stone-50">
                <p className="text-slate-700 text-lg">Loading application...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto px-6 py-8 md:py-12">
                <div className="text-center mb-8 text-sm text-slate-500">
                    <p>Status: {isAuthenticated ? `Logged in as ${user?.role} (${user?.branchId || 'N/A'})` : 'Please log in or register.'}</p>
                    {user?.id && <p>User ID: {user.id}</p>}
                </div>

                {authMessage.text && (
                    <MessageBox message={authMessage.text} type={authMessage.type} />
                )}

                {/* Wrap both auth forms AND Dashboard with DataProvider */}
                <DataProvider>
                    {!isAuthenticated ? (
                        <section id="auth-section" className="mb-16 md:mb-24 bg-white p-6 md:p-8 rounded-lg shadow-lg border border-stone-200 max-w-md mx-auto">
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 text-center mb-6">Welcome to StockWise Pro</h2>
                            <div className="flex justify-center mb-6">
                                <button
                                    onClick={() => setShowLogin(true)}
                                    className={`px-6 py-2 rounded-l-md border border-r-0 border-teal-500 font-semibold ${showLogin ? 'bg-teal-500 text-white' : 'bg-white text-teal-600'}`}
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => setShowLogin(false)}
                                    className={`px-6 py-2 rounded-r-md border border-teal-500 font-semibold ${!showLogin ? 'bg-teal-500 text-white' : 'bg-white text-teal-600'}`}
                                >
                                    Register
                                </button>
                            </div>
                            {showLogin ? (
                                <Login onAuthSuccess={() => handleAuthMessage('Logged in successfully!', 'success')} onAuthError={handleAuthMessage} />
                            ) : (
                                <Register onAuthSuccess={() => handleAuthMessage('Registration successful! You are now logged in.', 'success')} onAuthError={handleAuthMessage} />
                            )}
                        </section>
                    ) : (
                        <Dashboard />
                    )}
                </DataProvider>
            </main>
            <Footer />
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;
