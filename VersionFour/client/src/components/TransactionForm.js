// client/src/components/TransactionForm.js
import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

const TransactionForm = ({ selectedBranchId, onTransactionSuccess }) => {
    const { user } = useAuth();
    const { allBranches, allEngineers, refreshData } = useData();

    const [itemId, setItemId] = useState('');
    const [itemName, setItemName] = useState('');
    const [itemType, setItemType] = useState('');
    const [quantity, setQuantity] = useState('');
    const [transactionType, setTransactionType] = useState('');
    const [sourceDestination, setSourceDestination] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Dynamic options for Source/Destination
    useEffect(() => {
        populateSourceDestinationDropdowns();
    }, [transactionType, selectedBranchId, allBranches, allEngineers]);

    const populateSourceDestinationDropdowns = () => {
        let options = [];
        if (transactionType === 'Issued To Engineer') {
            const engineersInCurrentBranch = allEngineers.filter(eng => eng.branchId === selectedBranchId);
            options = engineersInCurrentBranch.map(eng => ({ value: eng.name, label: eng.name }));
        } else if (transactionType === 'Issued To Branch' || transactionType === 'Received From Branch') {
            const otherBranches = allBranches.filter(branch => branch.id !== selectedBranchId);
            options = otherBranches.map(branch => ({ value: branch.name, label: branch.name }));
        }
        // For 'Received From Supplier' or 'Stock Correction', it will be a text input
        setSourceDestination(''); // Reset sourceDestination when transactionType changes
        return options;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });

        let targetEntityType;
        if (allEngineers.some(e => e.name === sourceDestination)) {
            targetEntityType = 'Engineer';
        } else if (allBranches.some(b => b.name === sourceDestination)) {
            targetEntityType = 'OtherBranch';
        } else if (transactionType === 'Received From Supplier') {
            targetEntityType = 'Supplier';
        } else if (transactionType === 'Stock Correction') {
            targetEntityType = 'CorrectionReason';
        } else {
            targetEntityType = 'Other';
        }

        try {
            await api.post('/transactions', {
                type: transactionType,
                itemId: itemId.toUpperCase(),
                itemName,
                itemType,
                quantity: parseInt(quantity),
                actingBranchId: selectedBranchId,
                targetEntity: sourceDestination,
                targetEntityType: targetEntityType,
            });
            setMessage({ text: 'Transaction recorded and stock updated successfully!', type: 'success' });
            onTransactionSuccess('Transaction recorded and stock updated successfully!', 'success');
            // Clear form
            setItemId('');
            setItemName('');
            setItemType('');
            setQuantity('');
            setTransactionType('');
            setSourceDestination('');
            refreshData(); // Refresh data in DataContext
        } catch (error) {
            console.error("Transaction error:", error.response?.data || error);
            setMessage({ text: error.response?.data?.message || 'Error saving transaction. Check console for details.', type: 'error' });
            onTransactionSuccess(error.response?.data?.message || 'Error saving transaction.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const renderSourceDestinationInput = () => {
        if (transactionType === 'Received From Supplier' || transactionType === 'Stock Correction') {
            return (
                <input
                    type="text"
                    id="sourceDestination"
                    className="mt-1 block w-full border border-stone-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    placeholder={transactionType === 'Received From Supplier' ? 'e.g., Supplier XYZ' : 'e.g., Inventory Audit'}
                    value={sourceDestination}
                    onChange={(e) => setSourceDestination(e.target.value)}
                    required
                />
            );
        } else {
            const options = populateSourceDestinationDropdowns();
            return (
                <select
                    id="sourceDestination"
                    className="mt-1 block w-full border border-stone-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    value={sourceDestination}
                    onChange={(e) => setSourceDestination(e.target.value)}
                    required
                >
                    <option value="">Select Source/Destination</option>
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
            );
        }
    };


    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="itemId" className="block text-sm font-medium text-slate-700 mb-1">Item ID</label>
                <input type="text" id="itemId" className="mt-1 block w-full border border-stone-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm" placeholder="e.g., FOC-100m" value={itemId} onChange={(e) => setItemId(e.target.value)} required />
            </div>
            <div>
                <label htmlFor="itemName" className="block text-sm font-medium text-slate-700 mb-1">Item Name</label>
                <input type="text" id="itemName" className="mt-1 block w-full border border-stone-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm" placeholder="e.g., Fiber Optic Cable 100m" value={itemName} onChange={(e) => setItemName(e.target.value)} required />
            </div>
            <div>
                <label htmlFor="itemType" className="block text-sm font-medium text-slate-700 mb-1">Item Category</label>
                <select id="itemType" className="mt-1 block w-full border border-stone-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm" value={itemType} onChange={(e) => setItemType(e.target.value)} required>
                    <option value="">Select Category</option>
                    <option value="Cable">Cable</option>
                    <option value="Device">Device</option>
                    <option value="Connector">Connector</option>
                    <option value="Tool">Tool</option>
                    <option value="Other">Other</option>
                </select>
            </div>
            <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                <input type="number" id="quantity" className="mt-1 block w-full border border-stone-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
            </div>
            <div>
                <label htmlFor="transactionType" className="block text-sm font-medium text-slate-700 mb-1">Transaction Type</label>
                <select id="transactionType" className="mt-1 block w-full border border-stone-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm" value={transactionType} onChange={(e) => setTransactionType(e.target.value)} required>
                    <option value="">Select Type</option>
                    <option value="Received From Supplier">Received From Supplier</option>
                    <option value="Received From Branch">Received From Branch</option>
                    <option value="Issued To Engineer">Issued To Engineer</option>
                    <option value="Issued To Branch">Issued To Branch</option>
                    <option value="Stock Correction">Stock Correction</option>
                </select>
            </div>
            <div id="sourceDestinationContainer">
                <label htmlFor="sourceDestination" className="block text-sm font-medium text-slate-700 mb-1">Source/Destination</label>
                {renderSourceDestinationInput()}
            </div>
            <div className="md:col-span-2 flex justify-end">
                <button type="submit" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors disabled:opacity-50" disabled={loading}>
                    {loading ? 'Adding...' : 'Add Transaction Record'}
                </button>
            </div>
            {message.text && <div className={`mt-4 p-3 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{message.text}</div>}
        </form>
    );
};

export default TransactionForm;