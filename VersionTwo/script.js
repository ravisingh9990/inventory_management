   document.addEventListener('DOMContentLoaded', function() {
            const mobileMenuBtn = document.getElementById('mobile-menu-btn');
            const mobileMenu = document.getElementById('mobile-menu');
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });

            const transactionForm = document.getElementById('transactionForm');
            const stockTableBody = document.getElementById('stockTableBody');
            const messageBox = document.getElementById('messageBox');
            const branchSelector = document.getElementById('branchSelector');
            const downloadDataBtn = document.getElementById('downloadDataBtn');

            let stockData = [];
            let transactionHistory = [];
            let branchStockData = [];

            const engineers = ['John Doe', 'Jane Smith', 'Peter Jones'];
            const branches = ['North Branch', 'South Branch', 'East Branch'];
            const suppliers = ['Supplier XYZ', 'Supplier ABC'];

            let stockQuantityChartInstance;
            let transactionTrendChartInstance;
            let stockCategoryChartInstance;
            let engineerConsumptionChartInstance;
            let branchMovementChartInstance;
            let branchStockChartInstance;

            const displayMessage = (message, type = 'success') => {
                messageBox.textContent = message;
                messageBox.classList.remove('hidden', 'bg-red-100', 'text-red-700', 'bg-green-100', 'text-green-700');
                if (type === 'success') {
                    messageBox.classList.add('bg-green-100', 'text-green-700');
                } else if (type === 'error') {
                    messageBox.classList.add('bg-red-100', 'text-red-700');
                }
                setTimeout(() => {
                    messageBox.classList.add('hidden');
                }, 3000);
            };

            const updateStockTable = () => {
                stockTableBody.innerHTML = '';
                stockData.forEach(item => {
                    const row = stockTableBody.insertRow();
                    row.classList.add('bg-white', 'border-b');
                    row.innerHTML = `
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">${item.id}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">${item.name}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">${item.type}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-semibold">${item.currentStock}</td>
                    `;
                });
            };

            const updateAllCharts = () => {
                if (stockQuantityChartInstance) stockQuantityChartInstance.destroy();
                if (transactionTrendChartInstance) transactionTrendChartInstance.destroy();
                if (stockCategoryChartInstance) stockCategoryChartInstance.destroy();
                if (engineerConsumptionChartInstance) engineerConsumptionChartInstance.destroy();
                if (branchMovementChartInstance) branchMovementChartInstance.destroy();
                if (branchStockChartInstance) branchStockChartInstance.destroy();

                renderStockQuantityChart();
                renderTransactionTrendChart();
                renderStockCategoryChart();
                renderEngineerConsumptionChart();
                renderBranchMovementChart();
                renderBranchStockChart(branchSelector.value);
            };

            const renderStockQuantityChart = () => {
                const ctx = document.getElementById('stockQuantityChart').getContext('2d');
                stockQuantityChartInstance = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: stockData.map(item => {
                            const name = item.name;
                            return name.length > 16 ? name.substring(0, 13) + '...' : name;
                        }),
                        datasets: [{
                            label: 'Current Stock',
                            data: stockData.map(item => item.currentStock),
                            backgroundColor: 'rgba(20, 184, 166, 0.7)',
                            borderColor: 'rgba(20, 184, 166, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: {
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
                                        return stockData[context[0].dataIndex].name;
                                    }
                                }
                            }
                        }
                    }
                });
            };

            const renderTransactionTrendChart = () => {
                const ctx = document.getElementById('transactionTrendChart').getContext('2d');

                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
                const recentTransactions = transactionHistory.filter(t => new Date(t.date) >= sevenDaysAgo);

                const dailyData = {};
                for (let i = 0; i < 7; i++) {
                    const d = new Date(sevenDaysAgo);
                    d.setDate(d.getDate() + i);
                    const dateStr = d.toISOString().split('T')[0];
                    dailyData[dateStr] = { issued: 0, received: 0 };
                }

                recentTransactions.forEach(t => {
                    const dateStr = new Date(t.date).toISOString().split('T')[0];
                    if (dailyData[dateStr]) {
                        if (t.type === 'Issued') {
                            dailyData[dateStr].issued += t.quantity;
                        } else if (t.type === 'Received') {
                            dailyData[dateStr].received += t.quantity;
                        }
                    }
                });

                const labels = Object.keys(dailyData).map(d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
                const issuedData = Object.values(dailyData).map(d => d.issued);
                const receivedData = Object.values(dailyData).map(d => d.received);

                transactionTrendChartInstance = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [
                            {
                                label: 'Issued Quantity',
                                data: issuedData,
                                borderColor: '#F97316',
                                backgroundColor: 'rgba(249, 115, 22, 0.2)',
                                fill: true,
                                tension: 0.3
                            },
                            {
                                label: 'Received Quantity',
                                data: receivedData,
                                borderColor: '#14B8A6',
                                backgroundColor: 'rgba(20, 184, 166, 0.2)',
                                fill: true,
                                tension: 0.3
                            }
                        ]
                    },
                    options: {
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
                            }
                        }
                    }
                });
            };

            const renderStockCategoryChart = () => {
                const ctx = document.getElementById('stockCategoryChart').getContext('2d');
                const categoryData = {};
                stockData.forEach(item => {
                    categoryData[item.type] = (categoryData[item.type] || 0) + item.currentStock;
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

                stockCategoryChartInstance = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: labels,
                        datasets: [{
                            data: data,
                            backgroundColor: backgroundColors.slice(0, labels.length),
                            borderColor: borderColors.slice(0, labels.length),
                            borderWidth: 1
                        }]
                    },
                    options: {
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
                            }
                        }
                    }
                });
            };

            const renderEngineerConsumptionChart = () => {
                const ctx = document.getElementById('engineerConsumptionChart').getContext('2d');
                const engineerConsumption = {};
                transactionHistory.forEach(t => {
                    if (t.type === 'Issued' && engineers.includes(t.sourceDestination)) {
                        engineerConsumption[t.sourceDestination] = (engineerConsumption[t.sourceDestination] || 0) + t.quantity;
                    }
                });

                const labels = Object.keys(engineerConsumption);
                const data = Object.values(engineerConsumption);

                engineerConsumptionChartInstance = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Quantity Issued',
                            data: data,
                            backgroundColor: 'rgba(249, 115, 22, 0.7)',
                            borderColor: 'rgba(249, 115, 22, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: {
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
                            }
                        }
                    }
                });
            };

            const renderBranchMovementChart = () => {
                const ctx = document.getElementById('branchMovementChart').getContext('2d');
                const branchIssued = {};
                const branchReceived = {};

                branches.forEach(branch => {
                    branchIssued[branch] = 0;
                    branchReceived[branch] = 0;
                });

                transactionHistory.forEach(t => {
                    if (branches.includes(t.sourceDestination)) {
                        if (t.type === 'Issued') {
                            branchIssued[t.sourceDestination] += t.quantity;
                        } else if (t.type === 'Received') {
                            branchReceived[t.sourceDestination] += t.quantity;
                        }
                    }
                });

                const labels = branches;
                const issuedData = labels.map(branch => branchIssued[branch]);
                const receivedData = labels.map(branch => branchReceived[branch]);

                branchMovementChartInstance = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [
                            {
                                label: 'Issued To Branch',
                                data: issuedData,
                                backgroundColor: 'rgba(249, 115, 22, 0.7)',
                                borderColor: 'rgba(249, 115, 22, 1)',
                                borderWidth: 1
                            },
                            {
                                label: 'Received From Branch',
                                data: receivedData,
                                backgroundColor: 'rgba(20, 184, 166, 0.7)',
                                borderColor: 'rgba(20, 184, 166, 1)',
                                borderWidth: 1
                            }
                        ]
                    },
                    options: {
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
                            }
                        }
                    }
                });
            };

            const renderBranchStockChart = (selectedBranch = 'All') => {
                const ctx = document.getElementById('branchStockChart').getContext('2d');

                if (branchStockChartInstance) branchStockChartInstance.destroy();

                let filteredData;
                if (selectedBranch === 'All') {
                    const aggregatedStock = {};
                    branchStockData.forEach(entry => {
                        if (!aggregatedStock[entry.itemId]) {
                            aggregatedStock[entry.itemId] = {};
                            branches.forEach(b => aggregatedStock[entry.itemId][b] = 0);
                        }
                        aggregatedStock[entry.itemId][entry.branch] = entry.stock;
                    });

                    const itemLabels = Object.keys(aggregatedStock);
                    const datasets = branches.map((branch, index) => ({
                        label: branch,
                        data: itemLabels.map(itemId => aggregatedStock[itemId][branch] || 0),
                        backgroundColor: [
                            'rgba(20, 184, 166, 0.7)',
                            'rgba(249, 115, 22, 0.7)',
                            'rgba(148, 163, 184, 0.7)'
                        ][index % 3],
                        borderColor: [
                            'rgba(20, 184, 166, 1)',
                            'rgba(249, 115, 22, 1)',
                            'rgba(148, 163, 184, 1)'
                        ][index % 3],
                        borderWidth: 1
                    }));

                    branchStockChartInstance = new Chart(ctx, {
                        type: 'bar',
                        data: {
                            labels: itemLabels,
                            datasets: datasets
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    title: {
                                        display: true,
                                        text: 'Stock Quantity'
                                    }
                                },
                                x: {
                                    ticks: {
                                        autoSkip: false,
                                        maxRotation: 45,
                                        minRotation: 45,
                                        callback: function(value, index, values) {
                                            const label = this.getLabelForValue(value);
                                            const item = stockData.find(s => s.id === label);
                                            const displayName = item ? item.name : label;
                                            return displayName.length > 16 ? displayName.match(/.{1,16}/g) : displayName;
                                        }
                                    }
                                }
                            },
                            plugins: {
                                tooltip: {
                                    mode: 'index',
                                    intersect: false,
                                    callbacks: {
                                        title: function(context) {
                                            const itemId = context[0].label;
                                            const item = stockData.find(s => s.id === itemId);
                                            return item ? item.name : itemId;
                                        }
                                    }
                                }
                            }
                        }
                    });
                } else {
                    filteredData = branchStockData.filter(entry => entry.branch === selectedBranch);
                    const labels = filteredData.map(entry => {
                        const item = stockData.find(s => s.id === entry.itemId);
                        const name = item ? item.name : entry.itemId;
                        return name.length > 16 ? name.substring(0, 13) + '...' : name;
                    });
                    const data = filteredData.map(entry => entry.stock);

                    branchStockChartInstance = new Chart(ctx, {
                        type: 'bar',
                        data: {
                            labels: labels,
                            datasets: [{
                                label: `Stock in ${selectedBranch}`,
                                data: data,
                                backgroundColor: 'rgba(52, 211, 153, 0.7)',
                                borderColor: 'rgba(52, 211, 153, 1)',
                                borderWidth: 1
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    title: {
                                        display: true,
                                        text: 'Stock Quantity'
                                    }
                                },
                                x: {
                                    ticks: {
                                        autoSkip: false,
                                        maxRotation: 45,
                                        minRotation: 45,
                                        callback: function(value, index, values) {
                                            const label = this.getLabelForValue(value);
                                            const item = stockData.find(s => s.id === label);
                                            const displayName = item ? item.name : label;
                                            return displayName.length > 16 ? displayName.match(/.{1,16}/g) : displayName;
                                        }
                                    }
                                }
                            },
                            plugins: {
                                tooltip: {
                                    callbacks: {
                                        title: function(context) {
                                            const itemId = context[0].label;
                                            const item = stockData.find(s => s.id === itemId);
                                            return item ? item.name : itemId;
                                        }
                                    }
                                }
                            }
                        }
                    });
                }
            };

            transactionForm.addEventListener('submit', async function(event) {
                event.preventDefault();

                if (!window.currentUserId) {
                    displayMessage('Application not authenticated yet. Please wait.', 'error');
                    return;
                }

                const itemId = document.getElementById('itemId').value.trim().toUpperCase();
                const itemName = document.getElementById('itemName').value.trim();
                const itemType = document.getElementById('itemType').value;
                let quantity = parseInt(document.getElementById('quantity').value);
                const transactionType = document.getElementById('transactionType').value;
                const sourceDestination = document.getElementById('sourceDestination').value.trim();
                const transactionDate = new Date().toISOString().split('T')[0];

                if (!itemId || !itemName || !itemType || isNaN(quantity) || quantity <= 0 || !transactionType || !sourceDestination) {
                    displayMessage('Please fill in all required fields with valid input.', 'error');
                    return;
                }

                let existingItem = stockData.find(item => item.id === itemId);
                let transactionCategory;

                if (engineers.includes(sourceDestination)) {
                    transactionCategory = 'Engineer';
                } else if (branches.includes(sourceDestination)) {
                    transactionCategory = 'Branch';
                } else if (suppliers.includes(sourceDestination)) {
                    transactionCategory = 'Supplier';
                } else {
                    transactionCategory = 'Other';
                }

                try {
                    if (transactionType === 'Issued') {
                        if (!existingItem || existingItem.currentStock < quantity) {
                            displayMessage(`Insufficient stock for ${itemName} (${itemId}). Available: ${existingItem ? existingItem.currentStock : 0}`, 'error');
                            return;
                        }
                        quantity = -quantity;
                    } else if (transactionType === 'Correction' && existingItem && existingItem.currentStock + quantity < 0) {
                         displayMessage(`Correction would result in negative stock for ${itemName} (${itemId}). Adjust quantity.`, 'error');
                         return;
                    }

                    const stockRef = window.collection(window.db, `artifacts/${window.appId}/users/${window.currentUserId}/stockData`);
                    const transactionRef = window.collection(window.db, `artifacts/${window.appId}/users/${window.currentUserId}/transactionHistory`);
                    const branchStockRef = window.collection(window.db, `artifacts/${window.appId}/users/${window.currentUserId}/branchStockData`);

                    if (existingItem) {
                        const itemDocRef = window.doc(stockRef, existingItem.docId);
                        await window.updateDoc(itemDocRef, { currentStock: existingItem.currentStock + quantity });
                    } else {
                        if (transactionType === 'Issued') {
                            displayMessage(`Cannot issue ${itemName} (${itemId}). Item not in stock.`, 'error');
                            return;
                        }
                        await window.addDoc(stockRef, {
                            id: itemId,
                            name: itemName,
                            type: itemType,
                            currentStock: quantity
                        });
                    }

                    await window.addDoc(transactionRef, {
                        date: transactionDate,
                        type: transactionType,
                        itemId: itemId,
                        quantity: Math.abs(parseInt(document.getElementById('quantity').value)),
                        sourceDestination: sourceDestination,
                        category: transactionCategory
                    });

                    if (transactionType === 'Received' && transactionCategory === 'Branch') {
                        let branchItem = branchStockData.find(b => b.branch === sourceDestination && b.itemId === itemId);
                        if (branchItem) {
                            const branchDocRef = window.doc(branchStockRef, branchItem.docId);
                            await window.updateDoc(branchDocRef, { stock: branchItem.stock + Math.abs(parseInt(document.getElementById('quantity').value)) });
                        } else {
                            await window.addDoc(branchStockRef, {
                                branch: sourceDestination,
                                itemId: itemId,
                                stock: Math.abs(parseInt(document.getElementById('quantity').value))
                            });
                        }
                    } else if (transactionType === 'Issued' && transactionCategory === 'Branch') {
                        let branchItem = branchStockData.find(b => b.branch === sourceDestination && b.itemId === itemId);
                        if (branchItem) {
                            const branchDocRef = window.doc(branchStockRef, branchItem.docId);
                            await window.updateDoc(branchDocRef, { stock: branchItem.stock - Math.abs(parseInt(document.getElementById('quantity').value)) });
                        }
                    }

                    transactionForm.reset();
                    displayMessage('Transaction recorded and stock updated successfully!', 'success');

                } catch (e) {
                    console.error("Error adding document: ", e);
                    displayMessage('Error saving transaction. Check console for details.', 'error');
                }
            });

            branchSelector.addEventListener('change', function() {
                renderBranchStockChart(branchSelector.value);
            });

            downloadDataBtn.addEventListener('click', function() {
                downloadDataAsExcel();
            });

            const downloadDataAsExcel = () => {
                let csvContent = "data:text/csv;charset=utf-8,";

                // Stock Data
                csvContent += "Stock Data\n";
                csvContent += "Item ID,Item Name,Category,Current Stock\n";
                stockData.forEach(item => {
                    csvContent += `${item.id},"${item.name}",${item.type},${item.currentStock}\n`;
                });
                csvContent += "\n\n";

                // Transaction History
                csvContent += "Transaction History\n";
                csvContent += "Date,Type,Item ID,Quantity,Source/Destination,Category\n";
                transactionHistory.forEach(t => {
                    csvContent += `${t.date},${t.type},${t.itemId},${t.quantity},"${t.sourceDestination}",${t.category}\n`;
                });
                csvContent += "\n\n";

                // Branch Stock Data
                csvContent += "Branch Stock Data\n";
                csvContent += "Branch,Item ID,Stock\n";
                branchStockData.forEach(b => {
                    csvContent += `${b.branch},${b.itemId},${b.stock}\n`;
                });

                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", "stock_data.csv");
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            };

            window.initAppData = () => {
                const stockColRef = window.collection(window.db, `artifacts/${window.appId}/users/${window.currentUserId}/stockData`);
                const transactionColRef = window.collection(window.db, `artifacts/${window.appId}/users/${window.currentUserId}/transactionHistory`);
                const branchStockColRef = window.collection(window.db, `artifacts/${window.appId}/users/${window.currentUserId}/branchStockData`);

                window.onSnapshot(stockColRef, (snapshot) => {
                    stockData = snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
                    updateStockTable();
                    updateAllCharts();
                    document.getElementById('loadingStatus').textContent = 'Data loaded.';
                }, (error) => {
                    console.error("Error fetching stock data:", error);
                    document.getElementById('loadingStatus').textContent = 'Error loading stock data.';
                });

                window.onSnapshot(transactionColRef, (snapshot) => {
                    transactionHistory = snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
                    updateAllCharts();
                }, (error) => {
                    console.error("Error fetching transaction history:", error);
                });

                window.onSnapshot(branchStockColRef, (snapshot) => {
                    branchStockData = snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
                    updateAllCharts();
                }, (error) => {
                    console.error("Error fetching branch stock data:", error);
                });
            };
        });
