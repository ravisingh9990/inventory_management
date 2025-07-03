// client/src/components/Charts/EngineerConsumptionChart.js
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const EngineerConsumptionChart = ({ transactions, allEngineers }) => {
    const engineerConsumption = {};
    transactions.forEach(t => {
        if (t.type === 'Issued To Engineer' && t.targetEntity) {
            engineerConsumption[t.targetEntity] = (engineerConsumption[t.targetEntity] || 0) + t.quantity;
        }
    });

    const labels = Object.keys(engineerConsumption);
    const data = Object.values(engineerConsumption);

    const chartData = {
        labels: labels,
        datasets: [{
            label: 'Quantity Issued',
            data: data,
            backgroundColor: 'rgba(249, 115, 22, 0.7)',
            borderColor: 'rgba(249, 115, 22, 1)',
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
                    text: 'Quantity'
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
                text: 'Total Materials Issued to Engineers (Monthly)'
            }
        }
    };

    return (
        <div className="chart-container">
            <Bar data={chartData} options={options} />
        </div>
    );
};

export default EngineerConsumptionChart;