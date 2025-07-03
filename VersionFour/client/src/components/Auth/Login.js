// client/src/components/Auth/Login.js
import React, { useState } from 'react';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';

const Login = ({ onAuthSuccess, onAuthError }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/auth/login', { email, password });
            login(res.data.token, res.data.role, res.data.branchId);
            onAuthSuccess('Logged in successfully!');
        } catch (error) {
            console.error("Login error:", error);
            onAuthError(error.response?.data?.message || 'Login failed. Please check your credentials.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="loginEmail" className="block text-sm font-medium text-slate-700">Email</label>
                <input
                    type="email"
                    id="loginEmail"
                    className="mt-1 block w-full border border-stone-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="loginPassword" className="block text-sm font-medium text-slate-700">Password</label>
                <input
                    type="password"
                    id="loginPassword"
                    className="mt-1 block w-full border border-stone-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>
            <button
                type="submit"
                className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
                disabled={loading}
            >
                {loading ? 'Logging in...' : 'Login'}
            </button>
        </form>
    );
};

export default Login;