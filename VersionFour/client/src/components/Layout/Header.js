// client/src/components/Layout/Header.js
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { isAuthenticated, logout } = useAuth();

    const handleLogout = () => {
        logout();
        setIsMobileMenuOpen(false); // Close mobile menu on logout
    };

    return (
        <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-50 border-b border-stone-200 shadow-sm">
            <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                <a href="#" className="text-2xl font-bold text-slate-900">🗄️ StockWise Pro</a>
                {isAuthenticated && (
                    <div className="hidden md:flex items-center space-x-6">
                        <a href="#input-data" className="text-slate-600 hover:text-teal-600 transition-colors">Input</a>
                        <a href="#current-branch-stock" className="text-slate-600 hover:text-teal-600 transition-colors">My Stock</a>
                        <a href="#overall-stock" className="text-slate-600 hover:text-teal-600 transition-colors">Total Stock</a>
                        <a href="#engineer-analytics" className="text-slate-600 hover:text-teal-600 transition-colors">Engineers</a>
                        <a href="#branch-logistics" className="text-slate-600 hover:text-teal-600 transition-colors">Branches</a>
                        <a href="#charts" className="text-slate-600 hover:text-teal-600 transition-colors">Visuals</a>
                    </div>
                )}
                <button id="mobile-menu-btn" className="md:hidden text-slate-800 focus:outline-none" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                </button>
                {isAuthenticated && (
                    <button id="logoutBtn" className="hidden md:block ml-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors" onClick={handleLogout}>Logout</button>
                )}
            </nav>
            {isAuthenticated && (
                <div id="mobile-menu" className={`md:hidden bg-white border-t border-stone-200 ${isMobileMenuOpen ? '' : 'hidden'}`}>
                    <a href="#input-data" className="block py-2 px-6 text-slate-700 hover:bg-stone-100" onClick={() => setIsMobileMenuOpen(false)}>Input Data</a>
                    <a href="#current-branch-stock" className="block py-2 px-6 text-slate-700 hover:bg-stone-100" onClick={() => setIsMobileMenuOpen(false)}>My Branch Stock</a>
                    <a href="#overall-stock" className="block py-2 px-6 text-slate-700 hover:bg-stone-100" onClick={() => setIsMobileMenuOpen(false)}>Overall Stock Summary</a>
                    <a href="#engineer-analytics" className="block py-2 px-6 text-slate-700 hover:bg-stone-100" onClick={() => setIsMobileMenuOpen(false)}>Engineer Analytics</a>
                    <a href="#branch-logistics" className="block py-2 px-6 text-slate-700 hover:bg-stone-100" onClick={() => setIsMobileMenuOpen(false)}>Branch Logistics</a>
                    <a href="#charts" className="block py-2 px-6 text-slate-700 hover:bg-stone-100" onClick={() => setIsMobileMenuOpen(false)}>Data Visualizations</a>
                    <button id="logoutBtnMobile" className="block w-full text-left py-2 px-6 text-red-700 hover:bg-red-100" onClick={handleLogout}>Logout</button>
                </div>
            )}
        </header>
    );
};

export default Header;