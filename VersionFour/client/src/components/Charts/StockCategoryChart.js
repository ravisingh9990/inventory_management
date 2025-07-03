// client/src/components/Charts/StockCategoryChart.js
import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const StockCategoryChart = ({ allStockData }) => {
    const categoryData = {};
    allStockData.forEach(item => {
        categoryData[item.itemType] = (categoryData[item.itemType] || 0) + item.currentStock;
    });

    const labels = Object.keys(categoryData);
    const data = Object.values(categoryData);
    const backgroundColors = [
        'rgba(20, 184, 166, 0.8)',
        'rgba(249, 115, 22, 0.8)',
        'rgba(148, 163, 184, 0.8)',
        'rgba(74, 222, 128, 0.8)',
        'rgba(245, 158, 11, 0.8)'
    ];
    const borderColors = [
        'rgba(20, 184, 166, 1)',
        'rgba(249, 115, 22, 1)',
        'rgba(148, 163, 184, 1)',
        'rgba(74, 222, 128, 1)',
        'rgba(245, 158, 11, 1)'
    ];

    const chartData = {
        labels: labels,
        datasets: [{
            data: data,
            backgroundColor: backgroundColors.slice(0, labels.length),
            borderColor: borderColors.slice(0, labels.length),
            borderWidth: 1
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = context.parsed;
                        const total = context.dataset.data.reduce((acc, current) => acc + current, 0);
                        const percentage = ((value / total) * 100).toFixed(2) + '%';
                        return `${label}: ${value} units (${percentage})`;
                    }
                }
            },
            title: {
                display: false,
                text: 'Overall Stock Distribution by Category (Company-Wide)'
            }
        }
    };

    return (
        <div className="chart-container">
            <Doughnut data={chartData} options={options} />
        </div>
    );
};

export default StockCategoryChart;