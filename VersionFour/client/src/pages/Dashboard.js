// client/src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import TransactionForm from '../components/TransactionForm'; // <--- Ensure this path is correct
import StockTable from '../components/StockTable';
import EngineerConsumptionChart from '../components/Charts/EngineerConsumptionChart';
import BranchMovementChart from '../components/Charts/BranchMovementChart';
import BranchStockChart from '../components/Charts/BranchStockChart';
import StockQuantityChart from '../components/Charts/StockQuantityChart';
import TransactionTrendChart from '../components/Charts/TransactionTrendChart';
import StockCategoryChart from '../components/Charts/StockCategoryChart';
import MessageBox from '../components/MessageBox';

const Dashboard = () => {
    const { user } = useAuth();
    // Destructure allEngineers from useData()
    const { allBranches, allEngineers, allStockData, allTransactionHistory, loadingData, errorData, refreshData } = useData();
    const [selectedBranchId, setSelectedBranchId] = useState(user?.branchId || (allBranches.length > 0 ? allBranches[0].id : ''));
    const [currentBranchStock, setCurrentBranchStock] = useState([]);
    const [appMessage, setAppMessage] = useState({ text: '', type: '' });

    // Update selectedBranchId if user's branch changes or initial branches load
    useEffect(() => {
        if (user?.branchId && selectedBranchId !== user.branchId) {
            setSelectedBranchId(user.branchId);
        } else if (!user?.branchId && allBranches.length > 0 && !selectedBranchId) {
            setSelectedBranchId(allBranches[0].id);
        }
    }, [user, allBranches, selectedBranchId]);

    // Filter stock data for the currently selected branch
    useEffect(() => {
        if (selectedBranchId && allStockData.length > 0) {
            setCurrentBranchStock(allStockData.filter(item => item.branchId === selectedBranchId));
        } else {
            setCurrentBranchStock([]);
        }
    }, [selectedBranchId, allStockData]);

    const handleAppMessage = (message, type) => {
        setAppMessage({ text: message, type: type });
        setTimeout(() => setAppMessage({ text: '', type: '' }), 3000);
    };

    const handleBranchChange = (e) => {
        setSelectedBranchId(e.target.value);
    };

    const totalUniqueItems = new Set(allStockData.map(item => item.itemId)).size;
    const totalStockQuantity = allStockData.reduce((sum, item) => sum + item.currentStock, 0);

    if (loadingData) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <p className="text-slate-700 text-lg">Loading data...</p>
            </div>
        );
    }

    if (errorData) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <MessageBox message={`Error: ${errorData}`} type="error" />
            </div>
        );
    }

    return (
        <>
            <section className="mb-12 bg-white p-6 rounded-lg shadow-lg border border-stone-200">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Manage Your Branch</h2>
                <p className="text-slate-600 mb-4">Select your branch to view its specific stock and enter transactions. Global reports will always reflect data from all branches.</p>
                <div className="flex items-center gap-4">
                    <label htmlFor="branchSelector" className="block text-lg font-medium text-slate-700">Current Branch:</label>
                    <select
                        id="branchSelector"
                        className="mt-1 block w-full md:w-1/3 border border-stone-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                        value={selectedBranchId}
                        onChange={handleBranchChange}
                        disabled={user?.role === 'engineer'} // Engineers cannot change branch
                    >
                        {allBranches.map(branch => (
                            <option key={branch.id} value={branch.id}>{branch.name}</option>
                        ))}
                    </select>
                </div>
            </section>

            {appMessage.text && <MessageBox message={appMessage.text} type={appMessage.type} />}

            {(user?.role === 'admin' || (user?.role === 'engineer' && user?.branchId === selectedBranchId)) && (
                <section id="input-data" className="mb-16 md:mb-24 bg-white p-6 md:p-8 rounded-lg shadow-lg border border-stone-200">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Add New Stock Transaction</h2>
                        <p className="max-w-xl mx-auto mt-4 text-slate-600">Enter material movements for your selected branch. This data will be centralized for company-wide reporting.</p>
                    </div>
                    <TransactionForm selectedBranchId={selectedBranchId} onTransactionSuccess={handleAppMessage} />
                </section>
            )}

            <section id="current-branch-stock" className="mb-16 md:mb-24 bg-white p-6 md:p-8 rounded-lg shadow-lg border border-stone-200">
                <div className="text-center mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Current Stock for <span id="currentBranchNameDisplay">{allBranches.find(b => b.id === selectedBranchId)?.name || 'Your Branch'}</span></h2>
                    <p className="max-w-xl mx-auto mt-4 text-slate-600">This table provides a real-time view of the inventory specifically for your selected branch, directly from the centralized database.</p>
                </div>
                <StockTable stockData={currentBranchStock} />
                <div className="mt-8 text-center">
                    <button
                        id="downloadDataBtn"
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                        onClick={() => {
                            // Implement download logic here, potentially calling a backend endpoint
                            // For simplicity, we'll download all data in CSV format from current state
                            const downloadDataAsExcel = () => {
                                let csvContent = "data:text/csv;charset=utf-8,";

                                csvContent += "Branches Data\n";
                                csvContent += "Branch ID,Branch Name,Location\n";
                                allBranches.forEach(branch => {
                                    csvContent += `${branch.id},"${branch.name}","${branch.location}"\n`;
                                });
                                csvContent += "\n\n";

                                csvContent += "Engineers Data\n";
                                csvContent += "Engineer ID,Engineer Name,Branch ID\n";
                                allEngineers.forEach(eng => { // <--- allEngineers is now defined
                                    csvContent += `${eng.id},"${eng.name}",${eng.branchId}\n`;
                                });
                                csvContent += "\n\n";

                                csvContent += "All Stock Data\n";
                                csvContent += "Branch ID,Item ID,Item Name,Category,Current Stock\n";
                                allStockData.forEach(item => {
                                    csvContent += `${item.branchId},${item.itemId},"${item.itemName}",${item.itemType},${item.currentStock}\n`;
                                });
                                csvContent += "\n\n";

                                csvContent += "All Transaction History\n";
                                csvContent += "Timestamp,Type,Item ID,Item Name,Item Type,Quantity,Acting Branch ID,Acting User ID,Acting User Role,Target Entity,Target Entity Type\n";
                                allTransactionHistory.forEach(t => {
                                    csvContent += `${t.timestamp},"${t.type}",${t.itemId},"${t.itemName || ''}",${t.itemType || ''},${t.quantity},${t.actingBranchId},${t.actingUserId},${t.actingUserRole},"${t.targetEntity}",${t.targetEntityType}\n`;
                                });

                                const encodedUri = encodeURI(csvContent);
                                const link = document.createElement("a");
                                link.setAttribute("href", encodedUri);
                                link.setAttribute("download", "company_stock_data.csv");
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                            };
                            downloadDataAsExcel();
                        }}
                    >
                        Download All Data (Excel CSV)
                    </button>
                </div>
            </section>

            <section id="overall-stock" className="mb-16 md:mb-24 bg-white p-6 md:p-8 rounded-lg shadow-lg border border-stone-200">
                <div className="text-center mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Overall Company Stock Summary</h2>
                    <p className="max-w-xl mx-auto mt-4 text-slate-600">This section provides a high-level overview of the total inventory available across all your branches, giving you a complete picture of your company's assets.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center">
                    <div className="bg-stone-50 p-6 rounded-lg border border-stone-200">
                        <h3 className="font-semibold text-slate-800 mb-2">Total Unique Items Across All Branches</h3>
                        <p id="totalItemsDisplay" className="text-5xl font-bold text-teal-600">{totalUniqueItems.toLocaleString()}</p>
                    </div>
                    <div className="bg-stone-50 p-6 rounded-lg border border-stone-200">
                        <h3 className="font-semibold text-slate-800 mb-2">Total Stock Quantity (All Items, All Branches)</h3>
                        <p id="totalStockQuantityDisplay" className="text-5xl font-bold text-orange-600">{totalStockQuantity.toLocaleString()}</p>
                    </div>
                </div>
            </section>

            <section id="engineer-analytics" className="mb-16 md:mb-24 bg-white p-6 md:p-8 rounded-lg shadow-lg border border-stone-200">
                <div className="text-center mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Engineer Consumption Analytics (Company-Wide)</h2>
                    <p className="max-w-xl mx-auto mt-4 text-slate-600">Gain insights into how much material each engineer across all branches has consumed monthly. This chart helps monitor field team resource usage and identify trends.</p>
                </div>
                <div className="bg-stone-50 p-6 rounded-lg border border-stone-200">
                    <h3 className="font-semibold text-slate-800 mb-4">Total Materials Issued to Engineers (Monthly)</h3>
                    <EngineerConsumptionChart transactions={allTransactionHistory} allEngineers={allEngineers} />
                </div>
            </section>

            <section id="branch-logistics" className="mb-16 md:mb-24 bg-white p-6 md:p-8 rounded-lg shadow-lg border border-stone-200">
                <div className="text-center mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Branch Logistics Overview (Inter-Branch Transfers)</h2>
                    <p className="max-w-xl mx-auto mt-4 text-slate-600">Track the flow of materials between your different branches. This section visualizes how much stock is issued to, and received from, each branch by other branches, offering a clear picture of inter-branch material movements.</p>
                </div>
                <div className="bg-stone-50 p-6 rounded-lg border border-stone-200">
                    <h3 className="font-semibold text-slate-800 mb-4">Materials Issued From & Received By Branches (Overall)</h3>
                    <BranchMovementChart transactions={allTransactionHistory} allBranches={allBranches} />
                </div>
                <div className="bg-stone-50 p-6 rounded-lg border border-stone-200 mt-8">
                    <h3 className="font-semibold text-slate-800 mb-4">Branch Stock Snapshot (Key Items Across Branches)</h3>
                    <p className="text-sm text-slate-600 mb-4">This chart provides a comparative view of inventory levels for key items across all your branches. Select an item to see its stock distribution.</p>
                    <BranchStockChart allStockData={allStockData} allBranches={allBranches} />
                </div>
            </section>

            <section id="charts" className="bg-white p-6 md:p-8 rounded-lg shadow-lg border border-stone-200">
                <div className="text-center mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Overall Company Data Visualizations</h2>
                    <p className="max-w-xl mx-auto mt-4 text-slate-600">Understand your overall company inventory health with these dynamic charts. See total stock distribution by category and track general transaction trends across all branches.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-stone-50 p-6 rounded-lg border border-stone-200">
                        <h3 className="font-semibold text-slate-800 mb-4">Current Stock by Item (Company-Wide)</h3>
                        <StockQuantityChart allStockData={allStockData} />
                    </div>
                    <div className="bg-stone-50 p-6 rounded-lg border border-stone-200">
                        <h3 className="font-semibold text-slate-800 mb-4">Overall Transaction Trend (Last 30 Days)</h3>
                        <TransactionTrendChart transactions={allTransactionHistory} />
                    </div>
                    <div className="lg:col-span-2 bg-stone-50 p-6 rounded-lg border border-stone-200">
                        <h3 className="font-semibold text-slate-800 mb-4">Overall Stock Distribution by Category (Company-Wide)</h3>
                        <StockCategoryChart allStockData={allStockData} />
                    </div>
                </div>
            </section>
        </>
    );
};

export default Dashboard;
