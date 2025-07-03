// client/src/components/Charts/StockQuantityChart.js
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const StockQuantityChart = ({ allStockData }) => {
    const aggregatedStock = {};
    allStockData.forEach(item => {
        aggregatedStock[item.itemName] = (aggregatedStock[item.itemName] || 0) + item.currentStock;
    });

    const labels = Object.keys(aggregatedStock).map(name => name.length > 16 ? name.substring(0, 13) + '...' : name);
    const data = Object.values(aggregatedStock);

    const chartData = {
        labels: labels,
        datasets: [{
            label: 'Total Stock',
            data: data,
            backgroundColor: 'rgba(20, 184, 166, 0.7)',
            borderColor: 'rgba(20, 184, 166, 1)',
            borderWidth: 1
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true
            },
            x: {
                ticks: {
                    autoSkip: false,
                    maxRotation: 45,
                    minRotation: 45,
                    callback: function(value, index, values) {
                        const label = this.getLabelForValue(value);
                        if (label && label.length > 16) {
                            return label.match(/.{1,16}/g);
                        }
                        return label;
                    }
                }
            }
        },
        plugins: {
            tooltip: {
                callbacks: {
                    title: function(context) {
                        const originalName = Object.keys(aggregatedStock)[context[0].dataIndex];
                        return originalName;
                    }
                }
            },
            legend: {
                position: 'top',
            },
            title: {
                display: false,
                text: 'Current Stock by Item (Company-Wide)'
            }
        }
    };

    return (
        <div className="chart-container">
            <Bar data={chartData} options={options} />
        </div>
    );
};

export default StockQuantityChart;