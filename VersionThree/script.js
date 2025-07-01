document.addEventListener('DOMContentLoaded', function() {
            const mobileMenuBtn = document.getElementById('mobile-menu-btn');
            const mobileMenu = document.getElementById('mobile-menu');
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });

            const branchSelector = document.getElementById('branchSelector');
            const currentBranchNameDisplay = document.getElementById('currentBranchNameDisplay');
            const transactionForm = document.getElementById('transactionForm');
            const stockTableBody = document.getElementById('stockTableBody');
            const messageBox = document.getElementById('messageBox');
            const downloadDataBtn = document.getElementById('downloadDataBtn');
            const itemForBranchStockSelector = document.getElementById('itemForBranchStockSelector');
            const sourceDestinationContainer = document.getElementById('sourceDestinationContainer');
            const transactionTypeSelector = document.getElementById('transactionType');
            const totalItemsDisplay = document.getElementById('totalItemsDisplay');
            const totalStockQuantityDisplay = document.getElementById('totalStockQuantityDisplay');


            let allBranches = [];
            let allEngineers = [];
            let allStockData = []; // All stock items from all branches
            let allTransactionHistory = []; // All transactions from all branches

            let currentBranchStock = []; // Filtered stock for the selected branch
            let selectedBranchId = 'Delhi'; // Default selected branch

            let stockQuantityChartInstance;
            let transactionTrendChartInstance;
            let stockCategoryChartInstance;
            let engineerConsumptionChartInstance;
            let branchMovementChartInstance;
            let branchStockChartInstance; // For branch stock snapshot

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

            const populateBranchSelector = () => {
                branchSelector.innerHTML = '';
                allBranches.forEach(branch => {
                    const option = document.createElement('option');
                    option.value = branch.id;
                    option.textContent = branch.name;
                    branchSelector.appendChild(option);
                });
                // Set default selected branch
                branchSelector.value = selectedBranchId;
                currentBranchNameDisplay.textContent = allBranches.find(b => b.id === selectedBranchId)?.name || 'Your Branch';
            };

            const populateItemForBranchStockSelector = () => {
                itemForBranchStockSelector.innerHTML = '';
                const uniqueItems = new Set();
                allStockData.forEach(item => uniqueItems.add(item.itemId));

                uniqueItems.forEach(itemId => {
                    const option = document.createElement('option');
                    option.value = itemId;
                    const itemDetails = allStockData.find(s => s.itemId === itemId); // Get name from any stock entry
                    option.textContent = itemDetails ? itemDetails.itemName : itemId;
                    itemForBranchStockSelector.appendChild(option);
                });
                if (itemForBranchStockSelector.options.length > 0) {
                    itemForBranchStockSelector.value = itemForBranchStockSelector.options[0].value;
                }
            };

            const populateSourceDestinationDropdowns = () => {
                const transactionType = transactionTypeSelector.value;
                sourceDestinationContainer.innerHTML = ''; // Clear previous input

                const label = document.createElement('label');
                label.htmlFor = 'sourceDestination';
                label.classList.add('block', 'text-sm', 'font-medium', 'text-slate-700', 'mb-1');
                label.textContent = 'Source/Destination';
                sourceDestinationContainer.appendChild(label);

                const select = document.createElement('select');
                select.id = 'sourceDestination';
                select.classList.add('mt-1', 'block', 'w-full', 'border', 'border-stone-300', 'rounded-md', 'shadow-sm', 'py-2', 'px-3', 'focus:outline-none', 'focus:ring-teal-500', 'focus:border-teal-500', 'sm:text-sm');
                select.required = true;
                sourceDestinationContainer.appendChild(select);

                const defaultOption = document.createElement('option');
                defaultOption.value = '';
                defaultOption.textContent = 'Select Source/Destination';
                select.appendChild(defaultOption);

                if (transactionType === 'Issued To Engineer') {
                    const branchEngineers = allEngineers.filter(eng => eng.branchId === selectedBranchId);
                    branchEngineers.forEach(eng => {
                        const option = document.createElement('option');
                        option.value = eng.name;
                        option.textContent = eng.name;
                        select.appendChild(option);
                    });
                } else if (transactionType === 'Issued To Branch' || transactionType === 'Received From Branch') {
                    const otherBranches = allBranches.filter(branch => branch.id !== selectedBranchId);
                    otherBranches.forEach(branch => {
                        const option = document.createElement('option');
                        option.value = branch.name; // Use branch name as identifier
                        option.textContent = branch.name;
                        select.appendChild(option);
                    });
                } else if (transactionType === 'Received From Supplier') {
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.id = 'sourceDestination';
                    input.classList.add('mt-1', 'block', 'w-full', 'border', 'border-stone-300', 'rounded-md', 'shadow-sm', 'py-2', 'px-3', 'focus:outline-none', 'focus:ring-teal-500', 'focus:border-teal-500', 'sm:text-sm');
                    input.placeholder = 'e.g., Supplier XYZ';
                    input.required = true;
                    sourceDestinationContainer.replaceChild(input, select); // Replace select with input
                } else if (transactionType === 'Stock Correction') {
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.id = 'sourceDestination';
                    input.classList.add('mt-1', 'block', 'w-full', 'border', 'border-stone-300', 'rounded-md', 'shadow-sm', 'py-2', 'px-3', 'focus:outline-none', 'focus:ring-teal-500', 'focus:border-teal-500', 'sm:text-sm');
                    input.placeholder = 'e.g., Inventory Audit';
                    input.required = true;
                    sourceDestinationContainer.replaceChild(input, select);
                }
            };

            const updateUIForSelectedBranch = () => {
                currentBranchNameDisplay.textContent = allBranches.find(b => b.id === selectedBranchId)?.name || 'Your Branch';
                currentBranchStock = allStockData.filter(item => item.branchId === selectedBranchId);
                updateStockTable();
                populateSourceDestinationDropdowns(); // Re-populate dropdown based on new branch
                // No need to call updateAllCharts here, as onSnapshot will trigger it
            };

            const updateStockTable = () => {
                stockTableBody.innerHTML = '';
                currentBranchStock.forEach(item => {
                    const row = stockTableBody.insertRow();
                    row.classList.add('bg-white', 'border-b');
                    row.innerHTML = `
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">${item.itemId}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">${item.itemName}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">${item.itemType}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-semibold">${item.currentStock}</td>
                    `;
                });
            };

            const updateOverallStockSummary = () => {
                const totalItems = new Set(allStockData.map(item => item.itemId)).size;
                const totalQuantity = allStockData.reduce((sum, item) => sum + item.currentStock, 0);
                totalItemsDisplay.textContent = totalItems.toLocaleString();
                totalStockQuantityDisplay.textContent = totalQuantity.toLocaleString();
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
                renderBranchStockChart(itemForBranchStockSelector.value); // Use selected item for comparison
                updateOverallStockSummary();
                populateItemForBranchStockSelector(); // Ensure item selector is updated
            };

            const renderStockQuantityChart = () => {
                const aggregatedStock = {};
                allStockData.forEach(item => {
                    aggregatedStock[item.itemName] = (aggregatedStock[item.itemName] || 0) + item.currentStock;
                });

                const labels = Object.keys(aggregatedStock).map(name => name.length > 16 ? name.substring(0, 13) + '...' : name);
                const data = Object.values(aggregatedStock);

                const ctx = document.getElementById('stockQuantityChart').getContext('2d');
                stockQuantityChartInstance = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Total Stock',
                            data: data,
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
                                        const originalName = Object.keys(aggregatedStock)[context[0].dataIndex];
                                        return originalName;
                                    }
                                }
                            }
                        }
                    }
                });
            };

            const renderTransactionTrendChart = () => {
                const ctx = document.getElementById('transactionTrendChart').getContext('2d');

                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29); // Last 30 days including today
                const recentTransactions = allTransactionHistory.filter(t => new Date(t.timestamp) >= thirtyDaysAgo);

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

                transactionTrendChartInstance = new Chart(ctx, {
                    type: 'line',
                    data: {
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
                // Filter transactions for 'Issued To Engineer'
                allTransactionHistory.forEach(t => {
                    if (t.type === 'Issued To Engineer' && t.targetEntity) {
                        engineerConsumption[t.targetEntity] = (engineerConsumption[t.targetEntity] || 0) + t.quantity;
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
                const branchIssued = {}; // Issued FROM this branch TO other branches
                const branchReceived = {}; // Received BY this branch FROM other branches

                allBranches.forEach(branch => {
                    branchIssued[branch.name] = 0;
                    branchReceived[branch.name] = 0;
                });

                allTransactionHistory.forEach(t => {
                    if (t.type === 'Issued To Branch') {
                        const actingBranchName = allBranches.find(b => b.id === t.actingBranchId)?.name;
                        if (actingBranchName) {
                            branchIssued[actingBranchName] = (branchIssued[actingBranchName] || 0) + t.quantity;
                        }
                    } else if (t.type === 'Received From Branch') {
                        const actingBranchName = allBranches.find(b => b.id === t.actingBranchId)?.name;
                         if (actingBranchName) { // This means this branch received it
                            branchReceived[actingBranchName] = (branchReceived[actingBranchName] || 0) + t.quantity;
                        }
                    }
                });

                const labels = allBranches.map(b => b.name);
                const issuedData = labels.map(branchName => branchIssued[branchName]);
                const receivedData = labels.map(branchName => branchReceived[branchName]);

                branchMovementChartInstance = new Chart(ctx, {
                    type: 'bar',
                    data: {
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

            const renderBranchStockChart = (selectedItemId) => {
                const ctx = document.getElementById('branchStockChart').getContext('2d');

                if (!selectedItemId || allStockData.length === 0) {
                    branchStockChartInstance = new Chart(ctx, { type: 'bar', data: { labels: [], datasets: [] }, options: { responsive: true, maintainAspectRatio: false } });
                    return;
                }

                const stockByBranchForItem = {};
                allBranches.forEach(branch => stockByBranchForItem[branch.name] = 0);

                allStockData.filter(s => s.itemId === selectedItemId).forEach(item => {
                    const branchName = allBranches.find(b => b.id === item.branchId)?.name;
                    if (branchName) {
                        stockByBranchForItem[branchName] = item.currentStock;
                    }
                });

                const labels = Object.keys(stockByBranchForItem);
                const data = Object.values(stockByBranchForItem);

                branchStockChartInstance = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: `Stock of ${allStockData.find(s => s.itemId === selectedItemId)?.itemName || selectedItemId}`,
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

            transactionForm.addEventListener('submit', async function(event) {
                event.preventDefault();

                if (!window.currentUserId || !selectedBranchId) {
                    displayMessage('Application not fully initialized or branch not selected. Please wait.', 'error');
                    return;
                }

                const itemId = document.getElementById('itemId').value.trim().toUpperCase();
                const itemName = document.getElementById('itemName').value.trim();
                const itemType = document.getElementById('itemType').value;
                let quantity = parseInt(document.getElementById('quantity').value);
                const transactionType = transactionTypeSelector.value;
                const sourceDestinationInput = document.getElementById('sourceDestination');
                const sourceDestination = sourceDestinationInput.value.trim();
                const transactionTimestamp = new Date().toISOString();

                if (!itemId || !itemName || !itemType || isNaN(quantity) || quantity <= 0 || !transactionType || !sourceDestination) {
                    displayMessage('Please fill in all required fields with valid input.', 'error');
                    return;
                }

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
                    // 1. Update stock for the actingBranchId
                    const stockRef = window.collection(window.db, `artifacts/${window.appId}/public/stock`);
                    const existingStockItemDoc = allStockData.find(item => item.itemId === itemId && item.branchId === selectedBranchId);

                    let newStockQuantity = 0;
                    if (existingStockItemDoc) {
                        newStockQuantity = existingStockItemDoc.currentStock;
                    }

                    if (transactionType.includes('Issued')) {
                        if (!existingStockItemDoc || existingStockItemDoc.currentStock < quantity) {
                            displayMessage(`Insufficient stock for ${itemName} (${itemId}) at ${allBranches.find(b => b.id === selectedBranchId)?.name}. Available: ${existingStockItemDoc ? existingStockItemDoc.currentStock : 0}`, 'error');
                            return;
                        }
                        newStockQuantity -= quantity;
                    } else if (transactionType.includes('Received')) {
                        newStockQuantity += quantity;
                    } else if (transactionType === 'Stock Correction') {
                         newStockQuantity += quantity; // Quantity can be positive or negative for correction
                         if (newStockQuantity < 0) {
                             displayMessage(`Stock correction would result in negative stock for ${itemName} (${itemId}). Adjust quantity.`, 'error');
                             return;
                         }
                    }

                    if (existingStockItemDoc) {
                        const itemDocRef = window.doc(stockRef, existingStockItemDoc.docId);
                        await window.updateDoc(itemDocRef, { currentStock: newStockQuantity });
                    } else {
                        // Only add new stock if it's a 'Received' transaction
                        if (transactionType.includes('Received') || transactionType === 'Stock Correction') {
                            await window.addDoc(stockRef, {
                                branchId: selectedBranchId,
                                itemId: itemId,
                                itemName: itemName,
                                itemType: itemType,
                                currentStock: newStockQuantity
                            });
                        } else {
                            displayMessage(`Cannot issue ${itemName} (${itemId}). Item not found in stock at ${allBranches.find(b => b.id === selectedBranchId)?.name}.`, 'error');
                            return;
                        }
                    }

                    // 2. Add transaction to centralized history
                    await window.addDoc(window.collection(window.db, `artifacts/${window.appId}/public/transactions`), {
                        timestamp: transactionTimestamp,
                        type: transactionType,
                        itemId: itemId,
                        itemName: itemName,
                        itemType: itemType,
                        quantity: Math.abs(parseInt(document.getElementById('quantity').value)), // Store original quantity
                        actingBranchId: selectedBranchId,
                        targetEntity: sourceDestination,
                        targetEntityType: targetEntityType
                    });

                    // 3. If it's an inter-branch transfer, update the target branch's stock as well
                    if (transactionType === 'Issued To Branch' || transactionType === 'Received From Branch') {
                        const targetBranch = allBranches.find(b => b.name === sourceDestination);
                        if (targetBranch) {
                            const targetBranchId = targetBranch.id;
                            const existingTargetStockItemDoc = allStockData.find(item => item.itemId === itemId && item.branchId === targetBranchId);

                            let targetNewStockQuantity = 0;
                            if (existingTargetStockItemDoc) {
                                targetNewStockQuantity = existingTargetStockItemDoc.currentStock;
                            }

                            if (transactionType === 'Issued To Branch') {
                                targetNewStockQuantity += Math.abs(parseInt(document.getElementById('quantity').value));
                            } else if (transactionType === 'Received From Branch') {
                                // This means the selected branch received, so the other branch issued.
                                // We don't need to update the other branch's stock here, as their own 'Issued To Branch'
                                // transaction would handle it. This part might need careful thought in a real system
                                // to avoid double counting or missed updates. For now, we assume the other branch
                                // will also make a corresponding 'Issued To Branch' entry.
                                // If this app is the *only* entry point, then this logic needs to be more robust.
                                // For simplicity, we'll just update the acting branch's stock and record the transaction.
                                // The receiving branch would make their own 'Received From Branch' entry.
                            }

                            if (existingTargetStockItemDoc) {
                                const targetItemDocRef = window.doc(stockRef, existingTargetStockItemDoc.docId);
                                await window.updateDoc(targetItemDocRef, { currentStock: targetNewStockQuantity });
                            } else if (transactionType === 'Issued To Branch') { // Only add if issued to a new branch
                                await window.addDoc(stockRef, {
                                    branchId: targetBranchId,
                                    itemId: itemId,
                                    itemName: itemName,
                                    itemType: itemType,
                                    currentStock: targetNewStockQuantity
                                });
                            }
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
                selectedBranchId = branchSelector.value;
                updateUIForSelectedBranch();
            });

            transactionTypeSelector.addEventListener('change', populateSourceDestinationDropdowns);
            itemForBranchStockSelector.addEventListener('change', function() {
                renderBranchStockChart(itemForBranchStockSelector.value);
            });

            downloadDataBtn.addEventListener('click', function() {
                downloadDataAsExcel();
            });

            const downloadDataAsExcel = () => {
                let csvContent = "data:text/csv;charset=utf-8,";

                // Branches Data
                csvContent += "Branches Data\n";
                csvContent += "Branch ID,Branch Name,Location\n";
                allBranches.forEach(branch => {
                    csvContent += `${branch.id},"${branch.name}","${branch.location}"\n`;
                });
                csvContent += "\n\n";

                // Engineers Data
                csvContent += "Engineers Data\n";
                csvContent += "Engineer ID,Engineer Name,Branch ID\n";
                allEngineers.forEach(eng => {
                    csvContent += `${eng.id},"${eng.name}",${eng.branchId}\n`;
                });
                csvContent += "\n\n";

                // All Stock Data (across all branches)
                csvContent += "All Stock Data\n";
                csvContent += "Branch ID,Item ID,Item Name,Category,Current Stock\n";
                allStockData.forEach(item => {
                    csvContent += `${item.branchId},${item.itemId},"${item.itemName}",${item.itemType},${item.currentStock}\n`;
                });
                csvContent += "\n\n";

                // All Transaction History
                csvContent += "All Transaction History\n";
                csvContent += "Timestamp,Type,Item ID,Item Name,Item Type,Quantity,Acting Branch ID,Target Entity,Target Entity Type\n";
                allTransactionHistory.forEach(t => {
                    csvContent += `${t.timestamp},"${t.type}",${t.itemId},"${t.itemName}",${t.itemType},${t.quantity},${t.actingBranchId},"${t.targetEntity}",${t.targetEntityType}\n`;
                });

                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", "company_stock_data.csv");
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            };

            // Initial data setup (for demonstration purposes if Firestore is empty)
            const setupInitialData = async () => {
                if (!window.currentUserId) return;

                const branchColRef = window.collection(window.db, `artifacts/${window.appId}/public/branches`);
                const engineerColRef = window.collection(window.db, `artifacts/${window.appId}/public/engineers`);

                // Check if branches already exist
                const existingBranches = await window.getDocs(branchColRef);
                if (existingBranches.empty) {
                    console.log("Setting up initial branch data...");
                    await window.addDoc(branchColRef, { id: 'Delhi', name: 'Delhi', location: 'Delhi, India' });
                    await window.addDoc(branchColRef, { id: 'Faridabad', name: 'Faridabad', location: 'Faridabad, India' });
                    await window.addDoc(branchColRef, { id: 'Kanpur', name: 'Kanpur', location: 'Kanpur, India' });
                    await window.addDoc(branchColRef, { id: 'Chandigarh', name: 'Chandigarh', location: 'Chandigarh, India' });
                    await window.addDoc(branchColRef, { id: 'Lucknow', name: 'Lucknow', location: 'Lucknow, India' });
                    await window.addDoc(branchColRef, { id: 'Jaipur', name: 'Jaipur', location: 'Jaipur, India' });
                }

                // Check if engineers already exist
                const existingEngineers = await window.getDocs(engineerColRef);
                if (existingEngineers.empty) {
                    console.log("Setting up initial engineer data...");
                    await window.addDoc(engineerColRef, { id: 'eng1', name: 'John Doe', branchId: 'Delhi' });
                    await window.addDoc(engineerColRef, { id: 'eng2', name: 'Jane Smith', branchId: 'Faridabad' });
                    await window.addDoc(engineerColRef, { id: 'eng3', name: 'Peter Jones', branchId: 'Delhi' });
                    await window.addDoc(engineerColRef, { id: 'eng4', name: 'Alice Brown', branchId: 'Kanpur' });
                }
            };

            window.initAppData = () => {
                const branchColRef = window.collection(window.db, `artifacts/${window.appId}/public/branches`);
                const engineerColRef = window.collection(window.db, `artifacts/${window.appId}/public/engineers`);
                const stockColRef = window.collection(window.db, `artifacts/${window.appId}/public/stock`);
                const transactionColRef = window.collection(window.db, `artifacts/${window.appId}/public/transactions`);

                // Listeners for all public collections
                window.onSnapshot(branchColRef, (snapshot) => {
                    allBranches = snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
                    populateBranchSelector();
                    updateUIForSelectedBranch(); // Update UI after branches are loaded
                    document.getElementById('loadingStatus').textContent = 'Branches loaded.';
                }, (error) => {
                    console.error("Error fetching branch data:", error);
                    document.getElementById('loadingStatus').textContent = 'Error loading branch data.';
                });

                window.onSnapshot(engineerColRef, (snapshot) => {
                    allEngineers = snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
                    populateSourceDestinationDropdowns(); // Update dropdowns after engineers are loaded
                    document.getElementById('loadingStatus').textContent = 'Engineers loaded.';
                }, (error) => {
                    console.error("Error fetching engineer data:", error);
                });

                window.onSnapshot(stockColRef, (snapshot) => {
                    allStockData = snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
                    updateUIForSelectedBranch(); // Update stock table for selected branch
                    updateAllCharts(); // Re-render all charts
                    document.getElementById('loadingStatus').textContent = 'Stock data loaded.';
                }, (error) => {
                    console.error("Error fetching stock data:", error);
                });

                window.onSnapshot(transactionColRef, (snapshot) => {
                    allTransactionHistory = snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
                    updateAllCharts(); // Re-render charts that depend on transactions
                    document.getElementById('loadingStatus').textContent = 'Transaction history loaded.';
                }, (error) => {
                    console.error("Error fetching transaction history:", error);
                });
                
                // Call initial data setup, but only once and non-blocking
                setupInitialData().catch(e => console.error("Error setting up initial data:", e));
            };
        });
