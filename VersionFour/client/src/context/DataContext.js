// client/src/context/DataContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/api';
import { useAuth } from './AuthContext';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
    const { isAuthenticated, user } = useAuth();
    const [allBranches, setAllBranches] = useState([]);
    const [allEngineers, setAllEngineers] = useState([]);
    const [allStockData, setAllStockData] = useState([]);
    const [allTransactionHistory, setAllTransactionHistory] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [errorData, setErrorData] = useState(null);

    const fetchData = useCallback(async () => {
        if (!isAuthenticated || !user) {
            setLoadingData(false);
            return;
        }

        setLoadingData(true);
        setErrorData(null);

        try {
            // Fetch branches
            const branchesRes = await api.get('/branches');
            setAllBranches(branchesRes.data);

            // Fetch engineers
            const engineersRes = await api.get('/engineers');
            setAllEngineers(engineersRes.data);

            // Fetch stock data (admin gets all, engineer gets their branch's)
            let stockUrl = '/stock';
            if (user.role === 'engineer' && user.branchId) {
                stockUrl += `?branchId=${user.branchId}`;
            }
            const stockRes = await api.get(stockUrl);
            setAllStockData(stockRes.data);

            // Fetch transaction history (admin gets all, engineer gets their branch's)
            let transactionsUrl = '/transactions';
            if (user.role === 'engineer' && user.branchId) {
                transactionsUrl += `?branchId=${user.branchId}`;
            }
            const transactionsRes = await api.get(transactionsUrl);
            setAllTransactionHistory(transactionsRes.data);

        } catch (err) {
            console.error("Error fetching data:", err);
            setErrorData(err.response?.data?.message || 'Failed to fetch data.');
        } finally {
            setLoadingData(false);
        }
    }, [isAuthenticated, user]); // Re-run if auth state or user changes

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Function to refetch data manually (e.g., after a transaction)
    const refreshData = () => fetchData();

    return (
        <DataContext.Provider value={{
            allBranches,
            allEngineers,
            allStockData,
            allTransactionHistory,
            loadingData,
            errorData,
            refreshData
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => useContext(DataContext);