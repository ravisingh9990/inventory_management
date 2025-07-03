// client/src/components/StockTable.js
import React from 'react';

const StockTable = ({ stockData }) => {
    return (
        <div className="overflow-x-auto rounded-lg border border-stone-200 shadow-sm">
            <table className="min-w-full divide-y divide-stone-200">
                <thead className="bg-stone-100">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Item ID</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Item Name</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Current Stock</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-stone-200">
                    {stockData.length === 0 ? (
                        <tr>
                            <td colSpan="4" className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-center">No stock data available for this branch.</td>
                        </tr>
                    ) : (
                        stockData.map(item => (
                            <tr key={item._id} className="bg-white border-b">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{item.itemId}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.itemName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.itemType}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-semibold">{item.currentStock}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default StockTable;