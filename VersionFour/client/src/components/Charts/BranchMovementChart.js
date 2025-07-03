// client/src/components/Charts/BranchMovementChart.js
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BranchMovementChart = ({ transactions, allBranches }) => {
    const branchIssued = {};
    const branchReceived = {};

    allBranches.forEach(branch => {
        branchIssued[branch.name] = 0;
        branchReceived[branch.name] = 0;
    });

    transactions.forEach(t => {
        if (t.type === 'Issued To Branch') {
            const actingBranchName = allBranches.find(b => b.id === t.actingBranchId)?.name;
            if (actingBranchName) {
                branchIssued[actingBranchName] = (branchIssued[actingBranchName] || 0) + t.quantity;
            }
        } else if (t.type === 'Received From Branch') {
            const targetBranchName = allBranches.find(b => b.id === t.actingBranchId)?.name; // The branch that received it
            if (targetBranchName) {
                branchReceived[targetBranchName] = (branchReceived[targetBranchName] || 0) + t.quantity;
            }
        }
    });

    const labels = allBranches.map(b => b.name);
    const issuedData = labels.map(branchName => branchIssued[branchName]);
    const receivedData = labels.map(branchName => branchReceived[branchName]);

    const chartData = {
        labels: labels,
        datasets: [
            {
                label: 'Issued FROM Branch',
                data: issuedData,
                backgroundColor: 'rgba(249, 115, 22, 0.7)',
                borderColor: 'rgba(249, 115, 22, 1)',
                borderWidth: 1
            },
            {
                label: 'Received BY Branch',
                data: receivedData,
                backgroundColor: 'rgba(20, 184, 166, 0.7)',
                borderColor: 'rgba(20, 184, 166, 1)',
                borderWidth: 1
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                stacked: false
            },
            y: {
                beginAtZero: true,
                stacked: false
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
                text: 'Materials Issued To & Received From Branches'
            }
        }
    };

    return (
        <div className="chart-container">
            <Bar data={chartData} options={options} />
        </div>
    );
};

export default BranchMovementChart;