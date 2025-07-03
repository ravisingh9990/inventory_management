// client/src/components/Charts/BranchStockChart.js
import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BranchStockChart = ({ allStockData, allBranches }) => {
    const [selectedItemId, setSelectedItemId] = useState('');
    const [uniqueItems, setUniqueItems] = useState([]);

    useEffect(() => {
        const items = Array.from(new Set(allStockData.map(item => item.itemId)))
            .map(itemId => {
                const itemDetails = allStockData.find(s => s.itemId === itemId);
                return { id: itemId, name: itemDetails ? itemDetails.itemName : itemId };
            });
        setUniqueItems(items);
        if (items.length > 0 && !selectedItemId) {
            setSelectedItemId(items[0].id);
        }
    }, [allStockData, selectedItemId]);

    const stockByBranchForItem = {};
    allBranches.forEach(branch => stockByBranchForItem[branch.name] = 0);

    if (selectedItemId) {
        allStockData.filter(s => s.itemId === selectedItemId).forEach(item => {
            const branchName = allBranches.find(b => b.id === item.branchId)?.name;
            if (branchName) {
                stockByBranchForItem[branchName] = item.currentStock;
            }
        });
    }

    const labels = Object.keys(stockByBranchForItem);
    const data = Object.values(stockByBranchForItem);

    const chartData = {
        labels: labels,
        datasets: [{
            label: `Stock of ${uniqueItems.find(item => item.id === selectedItemId)?.name || selectedItemId}`,
            data: data,
            backgroundColor: 'rgba(52, 211, 153, 0.7)',
            borderColor: 'rgba(52, 211, 153, 1)',
            borderWidth: 1
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Stock Quantity'
                }
            }
        },
        plugins: {
            tooltip: {
                mode: 'index',
                intersect: false
            },
            legend: {
                position: 'top',
            },
            title: {
                display: false,
                text: 'Branch Stock Snapshot (Key Items Across Branches)'
            }
        }
    };

    return (
        <>
            <div className="mb-4">
                <label htmlFor="itemForBranchStockSelector" className="block text-sm font-medium text-slate-700 mb-1">Select Item:</label>
                <select
                    id="itemForBranchStockSelector"
                    className="mt-1 block w-full md:w-1/2 border border-stone-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    value={selectedItemId}
                    onChange={(e) => setSelectedItemId(e.target.value)}
                >
                    {uniqueItems.length === 0 ? (
                        <option value="">No items available</option>
                    ) : (
                        uniqueItems.map(item => (
                            <option key={item.id} value={item.id}>{item.name}</option>
                        ))
                    )}
                </select>
            </div>
            <div className="chart-container">
                {selectedItemId ? (
                    <Bar data={chartData} options={options} />
                ) : (
                    <p className="text-center text-slate-500 mt-8">Select an item to view its stock across branches.</p>
                )}
            </div>
        </>
    );
};

export default BranchStockChart;