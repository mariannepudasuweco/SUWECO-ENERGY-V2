const fs = require('fs');

const newModalCode = `
        // --- Wizard State ---
        let currentWizardStep = 1;
        let wizardData = {
            projectName: '',
            reportDate: '',
            referenceDate: '',
            dataSource: 'blank',
            cloneId: '',
            revolvingFund: 2300000,
            startingCashOnHand: 0,
            startingCashOnBank: 0,
            expectedReplenishments: { payroll: 0, procurement: 0, admin: 0 },
            lateFunding: 0,
            allocations: {
                manpower: { current: 0, w1: 0, w2: 0, w3: 0, w4: 0 },
                procurement: { current: 0, w1: 0, w2: 0, w3: 0, w4: 0 },
                admin: { current: 0, w1: 0, w2: 0, w3: 0, w4: 0 },
                unliquidated: { current: 0, w1: 0, w2: 0, w3: 0, w4: 0 },
                replenishments: { current: 0, w1: 0, w2: 0, w3: 0, w4: 0 }
            },
            procurementItems: [],
            adminItems: [],
            manpowerItems: []
        };

        window.openForecastModal = function(cloneId = null) {
            currentWizardStep = 1;
            
            // Reset data
            wizardData = {
                projectName: projects.find(p => p.id === currentProjectId)?.name || '',
                reportDate: new Date().toISOString().split('T')[0],
                referenceDate: new Date().toISOString().split('T')[0],
                dataSource: cloneId ? 'clone' : 'blank',
                cloneId: cloneId || '',
                revolvingFund: 2300000,
                startingCashOnHand: 0,
                startingCashOnBank: 0,
                expectedReplenishments: { payroll: 0, procurement: 0, admin: 0 },
                lateFunding: 0,
                allocations: {
                    manpower: { current: 0, w1: 0, w2: 0, w3: 0, w4: 0 },
                    procurement: { current: 0, w1: 0, w2: 0, w3: 0, w4: 0 },
                    admin: { current: 0, w1: 0, w2: 0, w3: 0, w4: 0 },
                    unliquidated: { current: 0, w1: 0, w2: 0, w3: 0, w4: 0 },
                    replenishments: { current: 0, w1: 0, w2: 0, w3: 0, w4: 0 }
                },
                procurementItems: [],
                adminItems: [],
                manpowerItems: []
            };

            if (cloneId) {
                const source = lookAheadForecasts.find(f => f.id === cloneId);
                if (source) {
                    wizardData.revolvingFund = source.revolvingFund || 2300000;
                    wizardData.startingCashOnHand = source.startingBalance || 0;
                    // Map items back to wizard structure...
                    // For simplicity in this demo, we just set the basic info
                }
            }

            renderWizardStep();
            document.getElementById('forecastModal').classList.add('active');
        };

        window.closeForecastModal = function() {
            document.getElementById('forecastModal').classList.remove('active');
        };

        window.nextWizardStep = function() {
            if (currentWizardStep < 7) {
                currentWizardStep++;
                renderWizardStep();
            }
        };

        window.prevWizardStep = function() {
            if (currentWizardStep > 1) {
                currentWizardStep--;
                renderWizardStep();
            }
        };

        window.updateWizardData = function(field, value, category = null, subfield = null) {
            if (category && subfield) {
                wizardData[category][subfield][field] = parseFloat(value) || 0;
            } else if (category) {
                wizardData[category][field] = parseFloat(value) || 0;
            } else {
                wizardData[field] = value;
            }
            
            if (currentWizardStep === 1 && field === 'referenceDate') {
                renderWizardStep(); // Re-render to update calculated dates
            } else if (currentWizardStep === 3 || currentWizardStep === 5) {
                renderWizardStep(); // Re-render to update calculations
            }
        };

        window.addDetailedItem = function(type) {
            const newItem = { id: Date.now(), description: '', amount: 0, week: 'current', remarks: '' };
            if (type === 'procurement') {
                newItem.supplier = '';
                newItem.deliveryStatus = 'Undelivered';
                newItem.paymentStatus = 'Unpaid';
                wizardData.procurementItems.push(newItem);
            } else if (type === 'admin') {
                newItem.expenseType = '';
                newItem.status = 'Pending';
                wizardData.adminItems.push(newItem);
            }
            renderWizardStep();
        };

        window.removeDetailedItem = function(type, id) {
            if (type === 'procurement') {
                wizardData.procurementItems = wizardData.procurementItems.filter(i => i.id !== id);
            } else if (type === 'admin') {
                wizardData.adminItems = wizardData.adminItems.filter(i => i.id !== id);
            }
            renderWizardStep();
        };

        window.updateDetailedItem = function(type, id, field, value) {
            let items = type === 'procurement' ? wizardData.procurementItems : wizardData.adminItems;
            let item = items.find(i => i.id === id);
            if (item) {
                item[field] = (field === 'amount') ? (parseFloat(value) || 0) : value;
            }
            renderWizardStep();
        };

        window.saveWizardForecast = function(isSubmit = false) {
            // Convert wizard data back to forecast structure
            const totalOutflows = 
                Object.values(wizardData.allocations.manpower).reduce((a,b)=>a+b,0) +
                Object.values(wizardData.allocations.procurement).reduce((a,b)=>a+b,0) +
                Object.values(wizardData.allocations.admin).reduce((a,b)=>a+b,0) +
                Object.values(wizardData.allocations.unliquidated).reduce((a,b)=>a+b,0);
                
            const totalInflows = 
                wizardData.expectedReplenishments.payroll + 
                wizardData.expectedReplenishments.procurement + 
                wizardData.expectedReplenishments.admin + 
                wizardData.lateFunding;

            const items = [];
            
            // Map allocations to items
            const mapAlloc = (catName, alloc) => {
                if (Object.values(alloc).some(v => v > 0)) {
                    items.push({
                        id: Date.now() + Math.random(),
                        category: catName,
                        description: 'Weekly Allocation',
                        details: '',
                        remarks: '',
                        currentWeek: alloc.current,
                        week1: alloc.w1,
                        week2: alloc.w2,
                        week3: alloc.w3,
                        week4: alloc.w4
                    });
                }
            };
            
            mapAlloc('Manpower Payroll & Allowances', wizardData.allocations.manpower);
            mapAlloc('Procurement and Admin Expenses', wizardData.allocations.procurement);
            mapAlloc('Procurement and Admin Expenses', wizardData.allocations.admin);
            mapAlloc('Unliquidated & On-Hold Expenses', wizardData.allocations.unliquidated);

            // Map detailed items to expenseLogs
            const expenseLogs = [];
            wizardData.procurementItems.forEach(i => {
                expenseLogs.push({
                    supplier: i.supplier,
                    description: i.description,
                    amount: i.amount,
                    deliveryStatus: i.deliveryStatus,
                    paymentStatus: i.paymentStatus,
                    weekAllocated: i.week
                });
            });
            wizardData.adminItems.forEach(i => {
                expenseLogs.push({
                    supplier: i.expenseType,
                    description: i.description,
                    amount: i.amount,
                    deliveryStatus: 'N/A',
                    paymentStatus: i.status,
                    weekAllocated: i.week
                });
            });

            const newForecast = {
                id: Date.now(),
                projectId: currentProjectId,
                dateCreated: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
                period: \`FOR \${wizardData.referenceDate}\`,
                status: isSubmit ? 'Submitted' : 'Draft',
                version: 'v1.0',
                startingBalance: wizardData.startingCashOnHand + wizardData.startingCashOnBank,
                expectedReplenishments: totalInflows,
                revolvingFund: wizardData.revolvingFund,
                cashRemaining: (wizardData.startingCashOnHand + wizardData.startingCashOnBank) + totalInflows - totalOutflows,
                items: items,
                expenseLogs: expenseLogs,
                signatures: {
                    preparedBy: isSubmit ? 'Current User (Acct Asst)' : null, 
                    preparedAt: isSubmit ? new Date().toLocaleString() : null,
                    checkedBy: null, checkedAt: null,
                    approvedBy: null, approvedAt: null
                }
            };

            lookAheadForecasts.push(newForecast);
            closeForecastModal();
            currentForecastId = newForecast.id;
            renderLookAheadView();
        };

        window.renderWizardStep = function() {
            const body = document.getElementById('wizardBody');
            if (!body) return;

            const formatCurrency = (val) => '₱' + (val || 0).toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2});

            let html = '';
            
            // Progress Stepper
            html += \`
                <div style="display: flex; justify-content: space-between; margin-bottom: 24px; position: relative;">
                    <div style="position: absolute; top: 12px; left: 0; right: 0; height: 2px; background: var(--border-color); z-index: 0;"></div>
                    \${[1,2,3,4,5,6,7].map(step => \`
                        <div style="position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; gap: 8px;">
                            <div style="width: 24px; height: 24px; border-radius: 50%; background: \${currentWizardStep >= step ? 'var(--primary-color)' : 'var(--bg-body)'}; border: 2px solid \${currentWizardStep >= step ? 'var(--primary-color)' : 'var(--border-color)'}; color: \${currentWizardStep >= step ? '#fff' : 'var(--text-muted)'}; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: bold;">\${step}</div>
                        </div>
                    \`).join('')}
                </div>
            \`;

            if (currentWizardStep === 1) {
                // Calculate dates based on referenceDate
                const refDate = new Date(wizardData.referenceDate || new Date());
                const addDays = (date, days) => {
                    const d = new Date(date);
                    d.setDate(d.getDate() + days);
                    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                };

                html += \`
                    <h3 style="margin-bottom: 16px;">Step 1: Basic Information & Period Setup</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
                        <div class="form-group">
                            <label>Project Name</label>
                            <input type="text" class="form-control" value="\${wizardData.projectName}" oninput="updateWizardData('projectName', this.value)">
                        </div>
                        <div class="form-group">
                            <label>Report Date</label>
                            <input type="date" class="form-control" value="\${wizardData.reportDate}" oninput="updateWizardData('reportDate', this.value)">
                        </div>
                        <div class="form-group" style="grid-column: span 2;">
                            <label>Reference Date ($U$3 equivalent) - Anchor for formulas</label>
                            <input type="date" class="form-control" value="\${wizardData.referenceDate}" oninput="updateWizardData('referenceDate', this.value)">
                        </div>
                    </div>
                    
                    <div class="card" style="background: #f8fafc; margin-bottom: 24px;">
                        <h4 style="font-size: 0.9rem; margin-bottom: 12px;">Auto-Calculated Periods</h4>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 0.85rem;">
                            <div><strong>Current Week:</strong> FOR \${addDays(refDate, -7)} to \${addDays(refDate, -1)}</div>
                            <div><strong>1st Week:</strong> FOR \${addDays(refDate, 0)} to \${addDays(refDate, 6)}</div>
                            <div><strong>2nd Week:</strong> FOR \${addDays(refDate, 7)} to \${addDays(refDate, 13)}</div>
                            <div><strong>3rd Week:</strong> FOR \${addDays(refDate, 14)} to \${addDays(refDate, 20)}</div>
                            <div><strong>4th Week:</strong> FOR \${addDays(refDate, 21)} to \${addDays(refDate, 27)}</div>
                            <div style="grid-column: span 2; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border-color);">
                                <strong>Release Date:</strong> \${addDays(refDate, 5)} &nbsp;&nbsp;|&nbsp;&nbsp; <strong>Replenishment Date:</strong> \${addDays(refDate, 5)}
                            </div>
                        </div>
                    </div>
                \`;
            } else if (currentWizardStep === 2) {
                html += \`
                    <h3 style="margin-bottom: 16px;">Step 2: Data Source Selection</h3>
                    <div style="display: flex; flex-direction: column; gap: 16px;">
                        <label style="display: flex; align-items: flex-start; gap: 12px; padding: 16px; border: 1px solid \${wizardData.dataSource === 'blank' ? 'var(--primary-color)' : 'var(--border-color)'}; border-radius: var(--radius-md); cursor: pointer; background: \${wizardData.dataSource === 'blank' ? '#eff6ff' : 'transparent'};">
                            <input type="radio" name="dataSource" value="blank" \${wizardData.dataSource === 'blank' ? 'checked' : ''} onchange="updateWizardData('dataSource', this.value)" style="margin-top: 4px;">
                            <div>
                                <div style="font-weight: 600; margin-bottom: 4px;">Blank Template</div>
                                <div style="font-size: 0.85rem; color: var(--text-muted);">Starts with zero values. Uses default revolving fund (₱2,300,000.00).</div>
                            </div>
                        </label>
                        
                        <label style="display: flex; align-items: flex-start; gap: 12px; padding: 16px; border: 1px solid \${wizardData.dataSource === 'clone' ? 'var(--primary-color)' : 'var(--border-color)'}; border-radius: var(--radius-md); cursor: pointer; background: \${wizardData.dataSource === 'clone' ? '#eff6ff' : 'transparent'};">
                            <input type="radio" name="dataSource" value="clone" \${wizardData.dataSource === 'clone' ? 'checked' : ''} onchange="updateWizardData('dataSource', this.value)" style="margin-top: 4px;">
                            <div style="flex-grow: 1;">
                                <div style="font-weight: 600; margin-bottom: 4px;">Clone Previous Forecast</div>
                                <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 8px;">Copies all line items, amounts, suppliers, remarks. Resets status to Draft.</div>
                                <select class="form-control" \${wizardData.dataSource !== 'clone' ? 'disabled' : ''} onchange="updateWizardData('cloneId', this.value)">
                                    <option value="">Select forecast to clone...</option>
                                    \${lookAheadForecasts.map(f => \`<option value="\${f.id}" \${wizardData.cloneId == f.id ? 'selected' : ''}>\${f.period} (\${f.status})</option>\`).join('')}
                                </select>
                            </div>
                        </label>
                        
                        <label style="display: flex; align-items: flex-start; gap: 12px; padding: 16px; border: 1px solid \${wizardData.dataSource === 'carry' ? 'var(--primary-color)' : 'var(--border-color)'}; border-radius: var(--radius-md); cursor: pointer; background: \${wizardData.dataSource === 'carry' ? '#eff6ff' : 'transparent'};">
                            <input type="radio" name="dataSource" value="carry" \${wizardData.dataSource === 'carry' ? 'checked' : ''} onchange="updateWizardData('dataSource', this.value)" style="margin-top: 4px;">
                            <div>
                                <div style="font-weight: 600; margin-bottom: 4px;">Carry Forward Unliquidated/On-Hold Only</div>
                                <div style="font-size: 0.85rem; color: var(--text-muted);">Automatically pulls unliquidated and on-hold expenses from previous closing. Fresh start for new payroll/procurement.</div>
                            </div>
                        </label>
                    </div>
                \`;
            } else if (currentWizardStep === 3) {
                const renderAllocRow = (label, key, isAuto = false) => \`
                    <tr>
                        <td style="padding: 8px; font-size: 0.85rem; font-weight: 600;">\${label}</td>
                        \${['current', 'w1', 'w2', 'w3', 'w4'].map(w => \`
                            <td style="padding: 4px;">
                                <input type="number" class="form-control" style="padding: 4px; font-size: 0.8rem; text-align: right;" 
                                    value="\${wizardData.allocations[key][w] || ''}" 
                                    \${isAuto ? 'readonly style="background: #f1f5f9;"' : ''}
                                    oninput="updateWizardData('\${w}', this.value, 'allocations', '\${key}')">
                            </td>
                        \`).join('')}
                    </tr>
                \`;

                html += \`
                    <h3 style="margin-bottom: 16px;">Step 3: Budget Allocation Inputs</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 24px;">
                        <div class="form-group">
                            <label>Total Revolving Fund</label>
                            <input type="number" class="form-control" value="\${wizardData.revolvingFund}" oninput="updateWizardData('revolvingFund', this.value)">
                        </div>
                        <div class="form-group">
                            <label>Starting Cash on Hand</label>
                            <input type="number" class="form-control" value="\${wizardData.startingCashOnHand}" oninput="updateWizardData('startingCashOnHand', this.value)">
                        </div>
                        <div class="form-group">
                            <label>Starting Cash on Bank</label>
                            <input type="number" class="form-control" value="\${wizardData.startingCashOnBank}" oninput="updateWizardData('startingCashOnBank', this.value)">
                        </div>
                    </div>
                    
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead style="background: var(--bg-body);">
                                <tr>
                                    <th style="padding: 8px; text-align: left; font-size: 0.75rem;">CATEGORY</th>
                                    <th style="padding: 8px; text-align: right; font-size: 0.75rem;">CURRENT WEEK</th>
                                    <th style="padding: 8px; text-align: right; font-size: 0.75rem;">1ST WEEK</th>
                                    <th style="padding: 8px; text-align: right; font-size: 0.75rem;">2ND WEEK</th>
                                    <th style="padding: 8px; text-align: right; font-size: 0.75rem;">3RD WEEK</th>
                                    <th style="padding: 8px; text-align: right; font-size: 0.75rem;">4TH WEEK</th>
                                </tr>
                            </thead>
                            <tbody>
                                \${renderAllocRow('Manpower Payroll', 'manpower')}
                                \${renderAllocRow('Procurement Expenses', 'procurement')}
                                \${renderAllocRow('Admin Expenses', 'admin')}
                                \${renderAllocRow('Unliquidated/On-Hold', 'unliquidated', true)}
                                \${renderAllocRow('Replenishments', 'replenishments')}
                            </tbody>
                        </table>
                    </div>
                \`;
            } else if (currentWizardStep === 4) {
                html += \`
                    <h3 style="margin-bottom: 16px;">Step 4: Detailed Line Items</h3>
                    
                    <div class="card" style="margin-bottom: 16px; padding: 16px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                            <h4 style="margin: 0;">A. PROCUREMENT EXPENSES</h4>
                            <button type="button" class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.75rem;" onclick="addDetailedItem('procurement')">+ Add Item</button>
                        </div>
                        \${wizardData.procurementItems.length === 0 ? '<div style="font-size: 0.85rem; color: var(--text-muted);">No items added.</div>' : ''}
                        \${wizardData.procurementItems.map(item => \`
                            <div style="display: grid; grid-template-columns: 2fr 2fr 1fr 1fr 1fr 1fr auto; gap: 8px; margin-bottom: 8px; align-items: center;">
                                <select class="form-control" style="padding: 4px; font-size: 0.8rem;" onchange="updateDetailedItem('procurement', \${item.id}, 'supplier', this.value)">
                                    <option value="">Select Supplier...</option>
                                    <option value="Faderon's Hardware" \${item.supplier === "Faderon's Hardware" ? 'selected' : ''}>Faderon's Hardware</option>
                                    <option value="Chiong Giok" \${item.supplier === "Chiong Giok" ? 'selected' : ''}>Chiong Giok</option>
                                    <option value="De Juan One Stop Shop" \${item.supplier === "De Juan One Stop Shop" ? 'selected' : ''}>De Juan One Stop Shop</option>
                                </select>
                                <input type="text" class="form-control" style="padding: 4px; font-size: 0.8rem;" placeholder="Description" value="\${item.description}" oninput="updateDetailedItem('procurement', \${item.id}, 'description', this.value)">
                                <input type="number" class="form-control" style="padding: 4px; font-size: 0.8rem;" placeholder="Amount" value="\${item.amount || ''}" oninput="updateDetailedItem('procurement', \${item.id}, 'amount', this.value)">
                                <select class="form-control" style="padding: 4px; font-size: 0.8rem;" onchange="updateDetailedItem('procurement', \${item.id}, 'week', this.value)">
                                    <option value="current" \${item.week === 'current' ? 'selected' : ''}>Current</option>
                                    <option value="w1" \${item.week === 'w1' ? 'selected' : ''}>1st Week</option>
                                    <option value="w2" \${item.week === 'w2' ? 'selected' : ''}>2nd Week</option>
                                </select>
                                <select class="form-control" style="padding: 4px; font-size: 0.8rem;" onchange="updateDetailedItem('procurement', \${item.id}, 'deliveryStatus', this.value)">
                                    <option value="Delivered" \${item.deliveryStatus === 'Delivered' ? 'selected' : ''}>Delivered</option>
                                    <option value="Undelivered" \${item.deliveryStatus === 'Undelivered' ? 'selected' : ''}>Undelivered</option>
                                    <option value="Partial" \${item.deliveryStatus === 'Partial' ? 'selected' : ''}>Partial</option>
                                </select>
                                <select class="form-control" style="padding: 4px; font-size: 0.8rem;" onchange="updateDetailedItem('procurement', \${item.id}, 'paymentStatus', this.value)">
                                    <option value="Paid & Liquidated" \${item.paymentStatus === 'Paid & Liquidated' ? 'selected' : ''}>Paid</option>
                                    <option value="Unliquidated" \${item.paymentStatus === 'Unliquidated' ? 'selected' : ''}>Unliquidated</option>
                                    <option value="On-Hold" \${item.paymentStatus === 'On-Hold' ? 'selected' : ''}>On-Hold</option>
                                </select>
                                <button type="button" onclick="removeDetailedItem('procurement', \${item.id})" style="background: none; border: none; color: var(--danger); cursor: pointer;">&times;</button>
                            </div>
                        \`).join('')}
                    </div>

                    <div class="card" style="margin-bottom: 16px; padding: 16px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                            <h4 style="margin: 0;">B. ADMIN EXPENSES</h4>
                            <button type="button" class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.75rem;" onclick="addDetailedItem('admin')">+ Add Item</button>
                        </div>
                        \${wizardData.adminItems.length === 0 ? '<div style="font-size: 0.85rem; color: var(--text-muted);">No items added.</div>' : ''}
                        \${wizardData.adminItems.map(item => \`
                            <div style="display: grid; grid-template-columns: 2fr 2fr 1fr 1fr 1fr auto; gap: 8px; margin-bottom: 8px; align-items: center;">
                                <select class="form-control" style="padding: 4px; font-size: 0.8rem;" onchange="updateDetailedItem('admin', \${item.id}, 'expenseType', this.value)">
                                    <option value="">Select Type...</option>
                                    <option value="Diesel" \${item.expenseType === 'Diesel' ? 'selected' : ''}>Diesel</option>
                                    <option value="Meals & Travel" \${item.expenseType === 'Meals & Travel' ? 'selected' : ''}>Meals & Travel</option>
                                    <option value="Staff House Rental" \${item.expenseType === 'Staff House Rental' ? 'selected' : ''}>Staff House Rental</option>
                                    <option value="Electric Bill" \${item.expenseType === 'Electric Bill' ? 'selected' : ''}>Electric Bill</option>
                                </select>
                                <input type="text" class="form-control" style="padding: 4px; font-size: 0.8rem;" placeholder="Description" value="\${item.description}" oninput="updateDetailedItem('admin', \${item.id}, 'description', this.value)">
                                <input type="number" class="form-control" style="padding: 4px; font-size: 0.8rem;" placeholder="Amount" value="\${item.amount || ''}" oninput="updateDetailedItem('admin', \${item.id}, 'amount', this.value)">
                                <select class="form-control" style="padding: 4px; font-size: 0.8rem;" onchange="updateDetailedItem('admin', \${item.id}, 'week', this.value)">
                                    <option value="current" \${item.week === 'current' ? 'selected' : ''}>Current</option>
                                    <option value="w1" \${item.week === 'w1' ? 'selected' : ''}>1st Week</option>
                                    <option value="w2" \${item.week === 'w2' ? 'selected' : ''}>2nd Week</option>
                                </select>
                                <select class="form-control" style="padding: 4px; font-size: 0.8rem;" onchange="updateDetailedItem('admin', \${item.id}, 'status', this.value)">
                                    <option value="Pending" \${item.status === 'Pending' ? 'selected' : ''}>Pending</option>
                                    <option value="Paid" \${item.status === 'Paid' ? 'selected' : ''}>Paid</option>
                                </select>
                                <button type="button" onclick="removeDetailedItem('admin', \${item.id})" style="background: none; border: none; color: var(--danger); cursor: pointer;">&times;</button>
                            </div>
                        \`).join('')}
                    </div>
                \`;
            } else if (currentWizardStep === 5) {
                const sumAlloc = (alloc) => Object.values(alloc).reduce((a,b) => a + b, 0);
                const totalManpower = sumAlloc(wizardData.allocations.manpower);
                const totalProcurement = sumAlloc(wizardData.allocations.procurement);
                const totalAdmin = sumAlloc(wizardData.allocations.admin);
                const totalUnliquidated = sumAlloc(wizardData.allocations.unliquidated);
                const totalOutflow = totalManpower + totalProcurement + totalAdmin + totalUnliquidated;

                const totalInflow = wizardData.expectedReplenishments.payroll + 
                                  wizardData.expectedReplenishments.procurement + 
                                  wizardData.expectedReplenishments.admin + 
                                  wizardData.lateFunding;

                const startingTotal = wizardData.startingCashOnHand + wizardData.startingCashOnBank;
                const closingBalance = startingTotal + totalInflow - totalOutflow;
                const remainingFund = wizardData.revolvingFund - totalOutflow;

                html += \`
                    <h3 style="margin-bottom: 16px;">Step 5: Cash Flow Summary</h3>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                        <div>
                            <h4 style="font-size: 0.9rem; margin-bottom: 12px; color: var(--danger);">CASH OUTFLOW (Cash to be Released)</h4>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.85rem;"><span>Total Manpower Payroll:</span> <strong>\${formatCurrency(totalManpower)}</strong></div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.85rem;"><span>Total Procurement:</span> <strong>\${formatCurrency(totalProcurement)}</strong></div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.85rem;"><span>Total Admin:</span> <strong>\${formatCurrency(totalAdmin)}</strong></div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.85rem;"><span>Total Unliquidated & On-Hold:</span> <strong>\${formatCurrency(totalUnliquidated)}</strong></div>
                            <div style="display: flex; justify-content: space-between; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border-color); font-weight: bold; font-size: 1rem;"><span>TOTAL OUTFLOW:</span> <span>\${formatCurrency(totalOutflow)}</span></div>
                        </div>
                        
                        <div>
                            <h4 style="font-size: 0.9rem; margin-bottom: 12px; color: var(--success);">CASH INFLOWS (Replenishments)</h4>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.85rem; align-items: center;">
                                <span>Expected Replenishment - Payroll:</span> 
                                <input type="number" class="form-control" style="width: 120px; padding: 4px; text-align: right;" value="\${wizardData.expectedReplenishments.payroll || ''}" oninput="updateWizardData('payroll', this.value, 'expectedReplenishments')">
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.85rem; align-items: center;">
                                <span>Expected Replenishment - Procurement:</span> 
                                <input type="number" class="form-control" style="width: 120px; padding: 4px; text-align: right;" value="\${wizardData.expectedReplenishments.procurement || ''}" oninput="updateWizardData('procurement', this.value, 'expectedReplenishments')">
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.85rem; align-items: center;">
                                <span>Expected Replenishment - Admin:</span> 
                                <input type="number" class="form-control" style="width: 120px; padding: 4px; text-align: right;" value="\${wizardData.expectedReplenishments.admin || ''}" oninput="updateWizardData('admin', this.value, 'expectedReplenishments')">
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.85rem; align-items: center;">
                                <span>Late Funding Adjustments:</span> 
                                <input type="number" class="form-control" style="width: 120px; padding: 4px; text-align: right;" value="\${wizardData.lateFunding || ''}" oninput="updateWizardData('lateFunding', this.value)">
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border-color); font-weight: bold; font-size: 1rem;"><span>TOTAL INFLOW:</span> <span>\${formatCurrency(totalInflow)}</span></div>
                        </div>
                    </div>
                    
                    <div class="card" style="margin-top: 24px; background: #f8fafc;">
                        <h4 style="font-size: 0.9rem; margin-bottom: 12px;">CLOSING BALANCES</h4>
                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;">
                            <div>
                                <div style="font-size: 0.75rem; color: var(--text-muted);">Projected Closing Balance</div>
                                <div style="font-size: 1.25rem; font-weight: bold; color: \${closingBalance < 0 ? 'var(--danger)' : 'var(--success)'};">\${formatCurrency(closingBalance)}</div>
                            </div>
                            <div>
                                <div style="font-size: 0.75rem; color: var(--text-muted);">Remaining Revolving Fund</div>
                                <div style="font-size: 1.25rem; font-weight: bold;">\${formatCurrency(remainingFund)}</div>
                            </div>
                        </div>
                    </div>
                \`;
            } else if (currentWizardStep === 6) {
                const sumAlloc = (alloc) => Object.values(alloc).reduce((a,b) => a + b, 0);
                const totalOutflow = sumAlloc(wizardData.allocations.manpower) + sumAlloc(wizardData.allocations.procurement) + sumAlloc(wizardData.allocations.admin) + sumAlloc(wizardData.allocations.unliquidated);
                const totalInflow = wizardData.expectedReplenishments.payroll + wizardData.expectedReplenishments.procurement + wizardData.expectedReplenishments.admin + wizardData.lateFunding;
                const closingBalance = (wizardData.startingCashOnHand + wizardData.startingCashOnBank) + totalInflow - totalOutflow;

                let warnings = [];
                if (totalOutflow > wizardData.revolvingFund) {
                    warnings.push(\`Total weekly expenses (\${formatCurrency(totalOutflow)}) exceed revolving fund limit (\${formatCurrency(wizardData.revolvingFund)})\`);
                }
                if (closingBalance < 0) {
                    warnings.push(\`Closing balance is negative (\${formatCurrency(closingBalance)})\`);
                }
                if (wizardData.dataSource !== 'carry' && sumAlloc(wizardData.allocations.unliquidated) === 0) {
                    warnings.push("Unliquidated expenses from previous period not carried forward");
                }

                html += \`
                    <h3 style="margin-bottom: 16px;">Step 6: Validation & Warnings</h3>
                    
                    \${warnings.length > 0 ? \`
                        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: var(--radius-md); padding: 16px;">
                            <h4 style="color: #b91c1c; margin-bottom: 12px; font-size: 0.9rem; display: flex; align-items: center; gap: 8px;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg> Please review the following warnings:</h4>
                            <ul style="color: #991b1b; font-size: 0.85rem; margin: 0; padding-left: 20px;">
                                \${warnings.map(w => \`<li style="margin-bottom: 4px;">\${w}</li>\`).join('')}
                            </ul>
                        </div>
                    \` : \`
                        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: var(--radius-md); padding: 16px; display: flex; align-items: center; gap: 12px;">
                            <div style="color: #15803d;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg></div>
                            <div>
                                <h4 style="color: #166534; margin: 0 0 4px 0; font-size: 0.9rem;">All validations passed</h4>
                                <div style="color: #15803d; font-size: 0.85rem;">Your forecast is within limits and balanced.</div>
                            </div>
                        </div>
                    \`}
                \`;
            } else if (currentWizardStep === 7) {
                html += \`
                    <h3 style="margin-bottom: 16px;">Step 7: Approval & Submission</h3>
                    
                    <div class="card" style="background: #f8fafc; margin-bottom: 24px;">
                        <h4 style="font-size: 0.9rem; margin-bottom: 16px; color: var(--text-muted); text-transform: uppercase;">Prepared By Section</h4>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                            <div>
                                <div style="font-size: 0.75rem; color: var(--text-muted);">Name</div>
                                <div style="font-weight: 600;">Current User</div>
                            </div>
                            <div>
                                <div style="font-size: 0.75rem; color: var(--text-muted);">Role</div>
                                <div style="font-weight: 600;">Accounting Assistant - \${wizardData.projectName || 'STEC SANTA FE DPP'}</div>
                            </div>
                            <div>
                                <div style="font-size: 0.75rem; color: var(--text-muted);">Date</div>
                                <div style="font-weight: 600;">\${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                            </div>
                        </div>
                        <div style="border: 1px dashed var(--border-color); border-radius: var(--radius-md); padding: 24px; text-align: center; background: #fff;">
                            <div style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 8px;">Digital Signature</div>
                            <div style="font-family: 'Brush Script MT', cursive; font-size: 1.5rem; color: var(--primary-color);">Current User</div>
                        </div>
                    </div>
                \`;
            }

            // Footer Buttons
            html += \`
                <div style="display: flex; justify-content: space-between; margin-top: 32px; padding-top: 16px; border-top: 1px solid var(--border-color);">
                    <button type="button" class="btn btn-secondary" onclick="closeForecastModal()">Cancel</button>
                    <div style="display: flex; gap: 12px;">
                        \${currentWizardStep > 1 ? \`<button type="button" class="btn btn-secondary" onclick="prevWizardStep()">Back</button>\` : ''}
                        \${currentWizardStep < 7 ? \`<button type="button" class="btn btn-primary" onclick="nextWizardStep()">Next Step</button>\` : ''}
                        \${currentWizardStep === 7 ? \`
                            <button type="button" class="btn btn-secondary" onclick="saveWizardForecast(false)">💾 Save as Draft</button>
                            <button type="button" class="btn btn-primary" onclick="saveWizardForecast(true)">📤 Submit for Review</button>
                        \` : ''}
                    </div>
                </div>
            \`;

            body.innerHTML = html;
        };

        const initLookAheadModal = () => {
            if (document.getElementById('forecastModal')) return;
            const modalHtml = \`
                <div class="modal-overlay" id="forecastModal">
                    <div class="modal" style="max-width: 900px; max-height: 90vh; display: flex; flex-direction: column; padding: 0;">
                        <div class="modal-header" style="flex-shrink: 0; padding: 24px 24px 16px; border-bottom: 1px solid var(--border-color);">
                            <h2>Create New Forecast</h2>
                            <button class="close-modal" onclick="closeForecastModal()">&times;</button>
                        </div>
                        <div class="modal-body" id="wizardBody" style="overflow-y: auto; flex-grow: 1; padding: 24px;">
                            <!-- Wizard content injected here -->
                        </div>
                    </div>
                </div>
            \`;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initLookAheadModal);
        } else {
            initLookAheadModal();
        }
`;

const htmlContent = fs.readFileSync('index.html', 'utf8');
const lines = htmlContent.split('\n');

// Find start of initLookAheadModal
const startIndex = lines.findIndex(l => l.includes('window.openForecastModal = function'));
// Find end of initLookAheadModal block
const endIndex = lines.findIndex(l => l.includes('window.populateExpenseMonthFilter = function'));

if (startIndex !== -1 && endIndex !== -1) {
    lines.splice(startIndex, endIndex - startIndex, newModalCode);
    fs.writeFileSync('index.html', lines.join('\n'));
    console.log("Successfully replaced Modal logic.");
} else {
    console.log("Could not find start or end index.");
}
