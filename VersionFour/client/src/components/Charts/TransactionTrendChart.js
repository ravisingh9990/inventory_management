// client/src/components/Charts/TransactionTrendChart.js
import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const TransactionTrendChart = ({ transactions }) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    const recentTransactions = transactions.filter(t => new Date(t.timestamp) >= thirtyDaysAgo);

    const dailyData = {};
    for (let i = 0; i < 30; i++) {
        const d = new Date(thirtyDaysAgo);
        d.setDate(d.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        dailyData[dateStr] = { issued: 0, received: 0 };
    }

    recentTransactions.forEach(t => {
        const dateStr = new Date(t.timestamp).toISOString().split('T')[0];
        if (dailyData[dateStr]) {
            if (t.type.includes('Issued')) {
                dailyData[dateStr].issued += t.quantity;
            } else if (t.type.includes('Received')) {
                dailyData[dateStr].received += t.quantity;
            }
        }
    });

    const labels = Object.keys(dailyData).map(d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    const issuedData = Object.values(dailyData).map(d => d.issued);
    const receivedData = Object.values(dailyData).map(d => d.received);

    const chartData = {
        labels: labels,
        datasets: [
            {
                label: 'Issued Quantity (Total)',
                data: issuedData,
                borderColor: '#F97316',
                backgroundColor: 'rgba(249, 115, 22, 0.2)',
                fill: true,
                tension: 0.3
            },
            {
                label: 'Received Quantity (Total)',
                data: receivedData,
                borderColor: '#14B8A6',
                backgroundColor: 'rgba(20, 184, 166, 0.2)',
                fill: true,
                tension: 0.3
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true
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
                text: 'Overall Transaction Trend (Last 30 Days)'
            }
        }
    };

    return (
        <div className="chart-container">
            <Line data={chartData} options={options} />
        </div>
    );
};

export default TransactionTrendChart;