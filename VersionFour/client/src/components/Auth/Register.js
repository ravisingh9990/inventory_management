// client/src/components/Auth/Register.js
import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

const Register = ({ onAuthSuccess, onAuthError }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');
    const [branchId, setBranchId] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const { allBranches, loadingData } = useData(); // Get branches for engineer registration

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/auth/register', { email, password, role, branchId: role === 'engineer' ? branchId : null });
            login(res.data.token, res.data.role, res.data.branchId);
            onAuthSuccess('Registration successful! You are now logged in.');
        } catch (error) {
            console.error("Registration error:", error);
            onAuthError(error.response?.data?.message || 'Registration failed. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-slate-600 text-center">Use `admin@telecom.com` / `admin123` for Admin, or `engineer@telecom.com` / `engineer123` for Engineer (assigned to Delhi).</p>
            <div>
                <label htmlFor="registerEmail" className="block text-sm font-medium text-slate-700">Email</label>
                <input
                    type="email"
                    id="registerEmail"
                    className="mt-1 block w-full border border-stone-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="registerPassword" className="block text-sm font-medium text-slate-700">Password</label>
                <input
                    type="password"
                    id="registerPassword"
                    className="mt-1 block w-full border border-stone-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="registerRole" className="block text-sm font-medium text-slate-700">Role</label>
                <select
                    id="registerRole"
                    className="mt-1 block w-full border border-stone-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                >
                    <option value="">Select Role</option>
                    <option value="admin">Admin</option>
                    <option value="engineer">Engineer</option>
                </select>
            </div>
            {role === 'engineer' && (
                <div id="registerBranchContainer">
                    <label htmlFor="registerBranch" className="block text-sm font-medium text-slate-700">Assigned Branch (for Engineer)</label>
                    <select
                        id="registerBranch"
                        className="mt-1 block w-full border border-stone-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                        value={branchId}
                        onChange={(e) => setBranchId(e.target.value)}
                        required={role === 'engineer'}
                        disabled={loadingData}
                    >
                        <option value="">Select Branch</option>
                        {allBranches.map((b) => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                    </select>
                </div>
            )}
            <button
                type="submit"
                className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
                disabled={loading}
            >
                {loading ? 'Registering...' : 'Register'}
            </button>
        </form>
    );
};

export default Register;