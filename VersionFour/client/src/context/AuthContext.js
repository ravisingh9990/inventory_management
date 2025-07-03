// client/src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api'; // Use the configured axios instance

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null); // Stores { id, email, role, branchId }
    const [loading, setLoading] = useState(true); // For initial auth check

    const login = async (token, role, branchId) => {
        localStorage.setItem('token', token);
        setIsAuthenticated(true);
        // Fetch full user profile to get all details
        try {
            const res = await api.get('/auth/profile');
            setUser({
                id: res.data._id,
                email: res.data.email,
                role: res.data.role,
                branchId: res.data.branchId
            });
        } catch (error) {
            console.error("Failed to fetch user profile after login:", error);
            logout(); // If profile fetch fails, logout
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
    };

    // Initial check on app load
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Attempt to fetch profile to validate token and get user data
            api.get('/auth/profile')
                .then(res => {
                    setUser({
                        id: res.data._id,
                        email: res.data.email,
                        role: res.data.role,
                        branchId: res.data.branchId
                    });
                    setIsAuthenticated(true);
                })
                .catch(err => {
                    console.error("Auto-login failed:", err);
                    localStorage.removeItem('token'); // Clear invalid token
                    setIsAuthenticated(false);
                    setUser(null);
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);