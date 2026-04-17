const fs = require('fs');

const newLookAheadCode = `
        // --- Look Ahead Logic ---
        let lookAheadForecasts = [];
        let currentForecastId = null;
        let forecastLineItems = [];
        let forecastExpenseLogs = [];

        window.renderLookAheadView = function() {
            if (!currentProjectId) return;
            currentView = 'look-ahead';
            updateSubNavVisibility();
            
            if (currentForecastId) {
                renderForecastDetail(currentForecastId);
            } else {
                renderForecastList();
            }
        };

        window.renderForecastList = function() {
            const projectForecasts = lookAheadForecasts.filter(f => f.projectId === currentProjectId).sort((a, b) => b.id - a.id);
            
            const getStatusBadge = (status) => {
                switch(status) {
                    case 'Draft': return '<span style="background: #f1f5f9; color: #475569; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">Draft</span>';
                    case 'Submitted': return '<span style="background: #fef3c7; color: #d97706; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">Submitted</span>';
                    case 'Approved': return '<span style="background: #dcfce3; color: #16a34a; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">Approved</span>';
                    case 'Archived': return '<span style="background: #f3e8ff; color: #9333ea; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">Archived</span>';
                    default: return '';
                }
            };

            let listHtml = projectForecasts.map(f => \`
                <div class="card" style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all 0.2s;" onclick="viewForecast(\${f.id})" onmouseover="this.style.borderColor='var(--primary-color)'; this.style.transform='translateY(-2px)';" onmouseout="this.style.borderColor='var(--border-color)'; this.style.transform='none';">
                    <div>
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                            <div style="font-weight: 600; font-size: 1.1rem; color: var(--text-main);">\${f.period}</div>
                            \${getStatusBadge(f.status)}
                            <span style="font-size: 0.75rem; color: var(--text-muted);">\${f.version}</span>
                        </div>
                        <div style="font-size: 0.85rem; color: var(--text-muted);">Created on \${f.dateCreated} by \${f.createdBy || 'User'}</div>
                    </div>
                    <div style="display: flex; gap: 24px; text-align: right;">
                        <div>
                            <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Starting Balance</div>
                            <div style="font-weight: 600; color: #3b82f6;">₱\${f.startingBalance.toLocaleString('en-PH', {minimumFractionDigits: 2})}</div>
                        </div>
                        <div>
                            <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Cash Remaining</div>
                            <div style="font-weight: 600; color: \${f.cashRemaining < 0 ? '#ef4444' : '#22c55e'};">₱\${f.cashRemaining.toLocaleString('en-PH', {minimumFractionDigits: 2})}</div>
                        </div>
                        <div style="display: flex; align-items: center; color: var(--text-muted);">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                        </div>
                    </div>
                </div>
            \`).join('');

            if (projectForecasts.length === 0) {
                listHtml = \`
                    <div style="text-align: center; padding: 48px 24px; background: var(--bg-surface); border: 1px dashed var(--border-color); border-radius: var(--radius-lg);">
                        <div style="width: 48px; height: 48px; background: var(--bg-body); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; color: var(--text-muted);">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>
                        </div>
                        <h3 style="font-size: 1.1rem; font-weight: 600; color: var(--text-main); margin-bottom: 8px;">No Forecasts Yet</h3>
                        <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 24px;">Create your first weekly cash forecast to start tracking.</p>
                        <button class="btn btn-primary" onclick="openForecastModal()">Create First Forecast</button>
                    </div>
                \`;
            }

            contentArea.innerHTML = \`
                <div class="view-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
                    <div>
                        <h1 style="font-size: 1.5rem; font-weight: 700; color: var(--text-main); margin-bottom: 4px;">Look Ahead</h1>
                        <div style="color: var(--text-muted); font-size: 0.9rem;">Weekly cash forecasting, revolving fund management, and history</div>
                    </div>
                    <div style="display: flex; gap: 12px;">
                        <button class="btn btn-secondary" onclick="alert('Export functionality coming soon')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg> Export</button>
                        <button class="btn btn-primary" onclick="openForecastModal()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> New Forecast</button>
                    </div>
                </div>
                
                <div style="display: flex; gap: 16px; margin-bottom: 24px;">
                    <input type="text" class="form-control" placeholder="Search by period, ID, or prepared by..." style="max-width: 300px;">
                    <select class="form-control" style="width: auto;">
                        <option value="">All Statuses</option>
                        <option value="Draft">Draft</option>
                        <option value="Submitted">Submitted</option>
                        <option value="Approved">Approved</option>
                        <option value="Archived">Archived</option>
                    </select>
                </div>

                <div style="margin-bottom: 24px;">
                    <h2 style="font-size: 1.1rem; font-weight: 600; margin-bottom: 16px; color: var(--text-main);">Forecast Archive</h2>
                    \${listHtml}
                </div>
            \`;
        };

        window.viewForecast = function(id) {
            currentForecastId = id;
            renderLookAheadView();
        };

        window.backToForecastList = function() {
            currentForecastId = null;
            renderLookAheadView();
        };

        window.updateForecastStatus = function(id, newStatus) {
            const f = lookAheadForecasts.find(x => x.id === id);
            if (f) {
                f.status = newStatus;
                
                const now = new Date().toLocaleString();
                if (newStatus === 'Submitted') {
                    f.signatures.preparedBy = 'Current User (Acct Asst)';
                    f.signatures.preparedAt = now;
                } else if (newStatus === 'Approved') {
                    f.signatures.checkedBy = 'Deputy PM';
                    f.signatures.checkedAt = now;
                    f.signatures.approvedBy = 'Project Manager';
                    f.signatures.approvedAt = now;
                    
                    // Archive others
                    lookAheadForecasts.forEach(other => {
                        if (other.projectId === currentProjectId && other.id !== id && other.status === 'Approved') {
                            other.status = 'Archived';
                        }
                    });
                }
                renderLookAheadView();
            }
        };

        window.inlineEditForecastItem = function(id, itemId, field, value) {
            const f = lookAheadForecasts.find(x => x.id === id);
            if (f && f.status === 'Draft') {
                const item = f.items.find(i => i.id === itemId);
                if (item) {
                    if (['currentWeek', 'week1', 'week2', 'week3', 'week4'].includes(field)) {
                        item[field] = parseFloat(value) || 0;
                    } else {
                        item[field] = value;
                    }
                    // Recalculate cash remaining
                    let totalOutflows = 0;
                    f.items.forEach(i => {
                        totalOutflows += (i.currentWeek || 0) + (i.week1 || 0) + (i.week2 || 0) + (i.week3 || 0) + (i.week4 || 0);
                    });
                    f.cashRemaining = f.startingBalance + f.expectedReplenishments - totalOutflows;
                    renderLookAheadView();
                }
            }
        };

        window.renderForecastDetail = function(id) {
            const f = lookAheadForecasts.find(x => x.id === id);
            if (!f) return backToForecastList();

            const isDraft = f.status === 'Draft';
            const formatCurrency = (val) => '₱' + (val || 0).toLocaleString('en-PH', {minimumFractionDigits: 0, maximumFractionDigits: 0});
            const formatCurrencyDec = (val) => '₱' + (val || 0).toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2});

            // Calculate totals
            let totalOutflows = 0;
            let currentWeekTotal = 0, week1Total = 0, week2Total = 0, week3Total = 0, week4Total = 0;

            f.items.forEach(item => {
                totalOutflows += (item.currentWeek || 0) + (item.week1 || 0) + (item.week2 || 0) + (item.week3 || 0) + (item.week4 || 0);
                currentWeekTotal += (item.currentWeek || 0);
                week1Total += (item.week1 || 0);
                week2Total += (item.week2 || 0);
                week3Total += (item.week3 || 0);
                week4Total += (item.week4 || 0);
            });

            const cashRemaining = f.startingBalance + f.expectedReplenishments - totalOutflows;
            const revolvingFund = f.revolvingFund || 2300000;
            const fundUtilization = (totalOutflows / revolvingFund) * 100;

            // Group items by category
            const categories = ['Manpower Payroll & Allowances', 'Procurement and Admin Expenses', 'Unliquidated & On-Hold Expenses'];
            
            let tableHtml = '';
            categories.forEach(cat => {
                const catItems = f.items.filter(i => i.category === cat);
                
                let catCurrentWeek = 0, catWeek1 = 0, catWeek2 = 0, catWeek3 = 0, catWeek4 = 0;
                catItems.forEach(i => {
                    catCurrentWeek += (i.currentWeek || 0);
                    catWeek1 += (i.week1 || 0);
                    catWeek2 += (i.week2 || 0);
                    catWeek3 += (i.week3 || 0);
                    catWeek4 += (i.week4 || 0);
                });

                tableHtml += \`
                    <tr style="background: #f8fafc; border-bottom: 1px solid var(--border-color);">
                        <td colspan="2" style="padding: 12px 16px; font-weight: 700; color: var(--text-main);"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; vertical-align: middle;"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg> \${cat}</td>
                        <td style="padding: 12px 16px; text-align: right; font-weight: 700;">\${catCurrentWeek ? formatCurrency(catCurrentWeek) : '-'}</td>
                        <td style="padding: 12px 16px; text-align: right; font-weight: 700;">\${catWeek1 ? formatCurrency(catWeek1) : '-'}</td>
                        <td style="padding: 12px 16px; text-align: right; font-weight: 700;">\${catWeek2 ? formatCurrency(catWeek2) : '-'}</td>
                        <td style="padding: 12px 16px; text-align: right; font-weight: 700;">\${catWeek3 ? formatCurrency(catWeek3) : '-'}</td>
                        <td style="padding: 12px 16px; text-align: right; font-weight: 700;">\${catWeek4 ? formatCurrency(catWeek4) : '-'}</td>
                        <td style="padding: 12px 16px;"></td>
                    </tr>
                \`;

                if (catItems.length === 0) {
                    tableHtml += \`
                        <tr style="border-bottom: 1px solid var(--border-color);">
                            <td style="padding: 12px 16px; color: var(--text-muted); font-size: 0.85rem;">No records</td>
                            <td colspan="7"></td>
                        </tr>
                    \`;
                } else {
                    catItems.forEach(item => {
                        const renderCell = (field, val) => {
                            if (isDraft) {
                                return \`<input type="number" value="\${val || ''}" onchange="inlineEditForecastItem(\${f.id}, \${item.id}, '\${field}', this.value)" style="width: 100%; text-align: right; border: 1px solid transparent; background: transparent; padding: 4px; border-radius: 4px;" onfocus="this.style.borderColor='var(--primary-color)'; this.style.background='var(--bg-body)';" onblur="this.style.borderColor='transparent'; this.style.background='transparent';">\`;
                            }
                            return val ? formatCurrency(val) : '-';
                        };

                        const renderTextCell = (field, val) => {
                            if (isDraft) {
                                return \`<input type="text" value="\${val || ''}" onchange="inlineEditForecastItem(\${f.id}, \${item.id}, '\${field}', this.value)" style="width: 100%; border: 1px solid transparent; background: transparent; padding: 4px; border-radius: 4px;" onfocus="this.style.borderColor='var(--primary-color)'; this.style.background='var(--bg-body)';" onblur="this.style.borderColor='transparent'; this.style.background='transparent';">\`;
                            }
                            return val || '-';
                        };

                        tableHtml += \`
                            <tr style="border-bottom: 1px solid var(--border-color); background: \${cat === 'Procurement and Admin Expenses' ? '#fffbeb' : 'transparent'};">
                                <td style="padding: 12px 16px; font-size: 0.85rem;">\${renderTextCell('description', item.description)}</td>
                                <td style="padding: 12px 16px; font-size: 0.85rem;">\${renderTextCell('details', item.details)}</td>
                                <td style="padding: 12px 16px; text-align: right; font-size: 0.85rem;">\${renderCell('currentWeek', item.currentWeek)}</td>
                                <td style="padding: 12px 16px; text-align: right; font-size: 0.85rem;">\${renderCell('week1', item.week1)}</td>
                                <td style="padding: 12px 16px; text-align: right; font-size: 0.85rem;">\${renderCell('week2', item.week2)}</td>
                                <td style="padding: 12px 16px; text-align: right; font-size: 0.85rem;">\${renderCell('week3', item.week3)}</td>
                                <td style="padding: 12px 16px; text-align: right; font-size: 0.85rem;">\${renderCell('week4', item.week4)}</td>
                                <td style="padding: 12px 16px; font-size: 0.85rem;">\${renderTextCell('remarks', item.remarks)}</td>
                            </tr>
                        \`;
                    });
                }
            });

            // Summary Row
            tableHtml += \`
                <tr style="background: #f8fafc; border-bottom: 1px solid var(--border-color);">
                    <td colspan="2" style="padding: 12px 16px; font-weight: 800; color: var(--text-main);"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; vertical-align: middle;"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg> SUMMARY</td>
                    <td style="padding: 12px 16px; text-align: right; font-weight: 800;">\${currentWeekTotal ? formatCurrency(currentWeekTotal) : '-'}</td>
                    <td style="padding: 12px 16px; text-align: right; font-weight: 800;">\${week1Total ? formatCurrency(week1Total) : '-'}</td>
                    <td style="padding: 12px 16px; text-align: right; font-weight: 800;">\${week2Total ? formatCurrency(week2Total) : '-'}</td>
                    <td style="padding: 12px 16px; text-align: right; font-weight: 800;">\${week3Total ? formatCurrency(week3Total) : '-'}</td>
                    <td style="padding: 12px 16px; text-align: right; font-weight: 800;">\${week4Total ? formatCurrency(week4Total) : '-'}</td>
                    <td style="padding: 12px 16px;"></td>
                </tr>
            \`;

            // Detailed Expense Logs HTML
            let expenseLogsHtml = '';
            if (f.expenseLogs && f.expenseLogs.length > 0) {
                expenseLogsHtml = \`
                    <div class="card" style="margin-bottom: 24px; padding: 0; overflow-x: auto;">
                        <div style="padding: 16px 24px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
                            <h3 style="font-size: 1.1rem; font-weight: 800;">Detailed Expense Logs</h3>
                            <div style="display: flex; gap: 8px;">
                                <select class="form-control" style="padding: 4px 8px; font-size: 0.85rem;">
                                    <option>All Categories</option>
                                    <option>Materials</option>
                                    <option>Admin</option>
                                    <option>Freight</option>
                                </select>
                            </div>
                        </div>
                        <table style="width: 100%; border-collapse: collapse; text-align: left;">
                            <thead style="background: var(--bg-body);">
                                <tr>
                                    <th style="padding: 12px 16px; font-size: 0.75rem; font-weight: 800; color: var(--text-muted);">SUPPLIER / VENDOR</th>
                                    <th style="padding: 12px 16px; font-size: 0.75rem; font-weight: 800; color: var(--text-muted);">ITEM DESCRIPTION</th>
                                    <th style="padding: 12px 16px; font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-align: right;">AMOUNT (₱)</th>
                                    <th style="padding: 12px 16px; font-size: 0.75rem; font-weight: 800; color: var(--text-muted);">DELIVERY STATUS</th>
                                    <th style="padding: 12px 16px; font-size: 0.75rem; font-weight: 800; color: var(--text-muted);">PAYMENT STATUS</th>
                                    <th style="padding: 12px 16px; font-size: 0.75rem; font-weight: 800; color: var(--text-muted);">WEEK ALLOCATED</th>
                                </tr>
                            </thead>
                            <tbody>
                                \${f.expenseLogs.map(log => \`
                                    <tr style="border-bottom: 1px solid var(--border-color);">
                                        <td style="padding: 12px 16px; font-size: 0.85rem; font-weight: 600;">\${log.supplier}</td>
                                        <td style="padding: 12px 16px; font-size: 0.85rem;">\${log.description}</td>
                                        <td style="padding: 12px 16px; font-size: 0.85rem; text-align: right; font-weight: 600;">\${formatCurrencyDec(log.amount)}</td>
                                        <td style="padding: 12px 16px; font-size: 0.85rem;">
                                            <span style="padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; font-weight: 600; background: \${log.deliveryStatus === 'Delivered' ? '#dcfce3' : '#fef3c7'}; color: \${log.deliveryStatus === 'Delivered' ? '#16a34a' : '#d97706'};">\${log.deliveryStatus}</span>
                                        </td>
                                        <td style="padding: 12px 16px; font-size: 0.85rem;">
                                            <span style="padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; font-weight: 600; background: \${log.paymentStatus === 'Paid' ? '#dcfce3' : '#fee2e2'}; color: \${log.paymentStatus === 'Paid' ? '#16a34a' : '#ef4444'};">\${log.paymentStatus}</span>
                                        </td>
                                        <td style="padding: 12px 16px; font-size: 0.85rem; color: var(--text-muted);">\${log.weekAllocated}</td>
                                    </tr>
                                \`).join('')}
                            </tbody>
                        </table>
                    </div>
                \`;
            }

            // Action Buttons based on status
            let actionButtonsHtml = '';
            if (f.status === 'Draft') {
                actionButtonsHtml = \`
                    <button class="btn btn-primary" onclick="updateForecastStatus(\${f.id}, 'Submitted')">Submit for Review</button>
                \`;
            } else if (f.status === 'Submitted') {
                actionButtonsHtml = \`
                    <button class="btn btn-secondary" style="color: #ef4444; border-color: #fca5a5;" onclick="updateForecastStatus(\${f.id}, 'Draft')">Return to Draft</button>
                    <button class="btn btn-primary" onclick="updateForecastStatus(\${f.id}, 'Approved')" style="background: #16a34a;">Approve Forecast</button>
                \`;
            } else if (f.status === 'Approved') {
                actionButtonsHtml = \`
                    <div style="display: flex; align-items: center; gap: 8px; color: #16a34a; font-weight: 600;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        Approved & Active
                    </div>
                    <button class="btn btn-secondary" onclick="openForecastModal(\${f.id})">Create Revised Version</button>
                \`;
            }

            contentArea.innerHTML = \`
                <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
                    <button class="btn btn-secondary" onclick="backToForecastList()" style="padding: 6px 12px; font-size: 0.85rem;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><path d="m15 18-6-6 6-6"/></svg> Back to Archive</button>
                    <div style="display: flex; gap: 12px; align-items: center;">
                        \${actionButtonsHtml}
                        <button class="btn btn-secondary" style="color: #3b82f6; border-color: #bfdbfe; background: #eff6ff;">Export PDF</button>
                    </div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px;">
                    <div>
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                            <h2 style="font-size: 1.5rem; font-weight: 800; color: var(--text-main);">\${f.period}</h2>
                            <span style="background: \${f.status === 'Draft' ? '#f1f5f9' : f.status === 'Submitted' ? '#fef3c7' : f.status === 'Approved' ? '#dcfce3' : '#f3e8ff'}; color: \${f.status === 'Draft' ? '#475569' : f.status === 'Submitted' ? '#d97706' : f.status === 'Approved' ? '#16a34a' : '#9333ea'}; padding: 4px 12px; border-radius: 16px; font-size: 0.85rem; font-weight: 700;">\${f.status}</span>
                            <span style="color: var(--text-muted); font-size: 0.85rem;">\${f.version}</span>
                        </div>
                        <div style="color: var(--text-muted); font-size: 0.9rem;">Report ID: \${f.id} | Generated: \${f.dateCreated}</div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; margin-bottom: 24px;">
                    <div class="card" style="padding: 16px; border-top: 4px solid #3b82f6;">
                        <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; margin-bottom: 4px;">Revolving Fund</div>
                        <div style="font-size: 1.25rem; font-weight: 800; color: var(--text-main);">\${formatCurrencyDec(revolvingFund)}</div>
                    </div>
                    <div class="card" style="padding: 16px; border-top: 4px solid #8b5cf6;">
                        <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; margin-bottom: 4px;">Starting Balance</div>
                        <div style="font-size: 1.25rem; font-weight: 800; color: var(--text-main);">\${formatCurrencyDec(f.startingBalance)}</div>
                    </div>
                    <div class="card" style="padding: 16px; border-top: 4px solid #f59e0b;">
                        <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; margin-bottom: 4px;">Total Outflows</div>
                        <div style="font-size: 1.25rem; font-weight: 800; color: var(--text-main);">\${formatCurrencyDec(totalOutflows)}</div>
                        <div style="font-size: 0.75rem; color: \${fundUtilization > 100 ? '#ef4444' : 'var(--text-muted)'}; margin-top: 4px;">\${fundUtilization.toFixed(1)}% of Fund</div>
                    </div>
                    <div class="card" style="padding: 16px; border-top: 4px solid #14b8a6;">
                        <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; margin-bottom: 4px;">Expected Inflows</div>
                        <div style="font-size: 1.25rem; font-weight: 800; color: var(--text-main);">\${formatCurrencyDec(f.expectedReplenishments)}</div>
                    </div>
                    <div class="card" style="padding: 16px; border-top: 4px solid \${cashRemaining < 0 ? '#ef4444' : '#22c55e'};">
                        <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; margin-bottom: 4px;">Closing Balance</div>
                        <div style="font-size: 1.25rem; font-weight: 800; color: \${cashRemaining < 0 ? '#ef4444' : '#22c55e'};">\${formatCurrencyDec(cashRemaining)}</div>
                    </div>
                </div>

                \${isDraft ? \`<div style="background: #eff6ff; border: 1px solid #bfdbfe; color: #1e3a8a; padding: 12px 16px; border-radius: var(--radius-md); margin-bottom: 24px; font-size: 0.9rem; display: flex; align-items: center; gap: 8px;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> <strong>Draft Mode:</strong> You can click directly on the table cells below to edit amounts and descriptions. Changes are saved automatically.</div>\` : ''}

                <div class="card" style="margin-bottom: 24px; padding: 0; overflow-x: auto;">
                    <div style="padding: 16px 24px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
                        <h3 style="font-size: 1.1rem; font-weight: 800;">Weekly Breakdown</h3>
                    </div>
                    <table style="width: 100%; border-collapse: collapse; text-align: left;">
                        <thead style="background: var(--bg-body); position: sticky; top: 0; z-index: 10;">
                            <tr>
                                <th style="padding: 16px; font-size: 0.75rem; font-weight: 800; color: var(--text-muted); width: 20%;">PARTICULARS</th>
                                <th style="padding: 16px; font-size: 0.75rem; font-weight: 800; color: var(--text-muted); width: 15%;">DETAILS</th>
                                <th style="padding: 16px; font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-align: right; width: 10%;">CURRENT WEEK</th>
                                <th style="padding: 16px; font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-align: right; width: 10%;">1ST WEEK</th>
                                <th style="padding: 16px; font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-align: right; width: 10%;">2ND WEEK</th>
                                <th style="padding: 16px; font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-align: right; width: 10%;">3RD WEEK</th>
                                <th style="padding: 16px; font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-align: right; width: 10%;">4TH WEEK</th>
                                <th style="padding: 16px; font-size: 0.75rem; font-weight: 800; color: var(--text-muted); width: 15%;">REMARKS</th>
                            </tr>
                        </thead>
                        <tbody>
                            \${tableHtml}
                        </tbody>
                    </table>
                </div>

                \${expenseLogsHtml}

                <div class="card" style="margin-bottom: 24px;">
                    <h3 style="font-size: 1.1rem; font-weight: 800; margin-bottom: 16px; text-transform: uppercase;">Approval & Sign-Off</h3>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;">
                        <div style="border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px; background: \${f.signatures.preparedBy ? '#f8fafc' : 'transparent'};">
                            <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 12px; font-weight: 600;">PREPARED BY</div>
                            \${f.signatures.preparedBy ? \`
                                <div style="font-weight: 700; color: var(--text-main); font-size: 1.1rem; font-family: 'Brush Script MT', cursive;">\${f.signatures.preparedBy}</div>
                                <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">Accounting Assistant</div>
                                <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 8px;">\${f.signatures.preparedAt}</div>
                            \` : \`<div style="color: var(--text-muted); font-size: 0.85rem; font-style: italic;">Pending Submission</div>\`}
                        </div>
                        <div style="border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px; background: \${f.signatures.checkedBy ? '#f8fafc' : 'transparent'};">
                            <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 12px; font-weight: 600;">CHECKED & REVIEWED BY</div>
                            \${f.signatures.checkedBy ? \`
                                <div style="font-weight: 700; color: var(--text-main); font-size: 1.1rem; font-family: 'Brush Script MT', cursive;">\${f.signatures.checkedBy}</div>
                                <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">Deputy Project Manager</div>
                                <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 8px;">\${f.signatures.checkedAt}</div>
                            \` : \`<div style="color: var(--text-muted); font-size: 0.85rem; font-style: italic;">Pending Approval</div>\`}
                        </div>
                        <div style="border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px; background: \${f.signatures.approvedBy ? '#dcfce3' : 'transparent'};">
                            <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 12px; font-weight: 600;">APPROVED BY</div>
                            \${f.signatures.approvedBy ? \`
                                <div style="font-weight: 700; color: #16a34a; font-size: 1.1rem; font-family: 'Brush Script MT', cursive;">\${f.signatures.approvedBy}</div>
                                <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">Project Manager</div>
                                <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 8px;">\${f.signatures.approvedAt}</div>
                            \` : \`<div style="color: var(--text-muted); font-size: 0.85rem; font-style: italic;">Pending Approval</div>\`}
                        </div>
                    </div>
                </div>
            \`;
        };

        window.openForecastModal = function(cloneId = null) {
            forecastLineItems = [];
            forecastExpenseLogs = [];
            const modal = document.getElementById('forecastModal');
            if (modal) {
                document.getElementById('forecastForm').reset();
                
                if (cloneId) {
                    const source = lookAheadForecasts.find(f => f.id === cloneId);
                    if (source) {
                        document.getElementById('forecastStartingBalance').value = source.startingBalance;
                        document.getElementById('forecastExpected').value = source.expectedReplenishments;
                        document.getElementById('forecastRevolvingFund').value = source.revolvingFund || 2300000;
                        forecastLineItems = JSON.parse(JSON.stringify(source.items));
                        // Generate new IDs for cloned items
                        forecastLineItems.forEach(i => i.id = Date.now() + Math.random());
                        forecastExpenseLogs = JSON.parse(JSON.stringify(source.expenseLogs || []));
                    }
                } else {
                    document.getElementById('forecastRevolvingFund').value = 2300000;
                    // Add some mock expense logs for demonstration if blank
                    forecastExpenseLogs = [
                        { supplier: 'FADERON Hardware', description: 'Cement & Rebars', amount: 45000, deliveryStatus: 'Delivered', paymentStatus: 'Unpaid', weekAllocated: 'Current Week' },
                        { supplier: 'CHIONG GIOK', description: 'Lumber', amount: 12500, deliveryStatus: 'Pending', paymentStatus: 'Unpaid', weekAllocated: '1st Week' },
                        { supplier: 'RSB Aircon', description: 'Site Office AC Repair', amount: 8000, deliveryStatus: 'Delivered', paymentStatus: 'Paid', weekAllocated: 'Current Week' }
                    ];
                }
                
                renderForecastLineItems();
                modal.classList.add('active');
            }
        };

        window.closeForecastModal = function() {
            const modal = document.getElementById('forecastModal');
            if (modal) modal.classList.remove('active');
        };

        window.addForecastLineItem = function() {
            forecastLineItems.push({
                id: Date.now(),
                category: 'Manpower Payroll & Allowances',
                description: '',
                details: '',
                remarks: '',
                currentWeek: 0,
                week1: 0,
                week2: 0,
                week3: 0,
                week4: 0
            });
            renderForecastLineItems();
        };

        window.removeForecastLineItem = function(id) {
            forecastLineItems = forecastLineItems.filter(i => i.id !== id);
            renderForecastLineItems();
        };

        window.updateForecastLineItemModal = function(id, field, value) {
            const item = forecastLineItems.find(i => i.id === id);
            if (item) {
                if (['currentWeek', 'week1', 'week2', 'week3', 'week4'].includes(field)) {
                    item[field] = parseFloat(value) || 0;
                } else {
                    item[field] = value;
                }
            }
        };

        window.renderForecastLineItems = function() {
            const container = document.getElementById('forecastLineItemsContainer');
            if (!container) return;

            if (forecastLineItems.length === 0) {
                container.innerHTML = '<div style="text-align: center; padding: 24px; color: var(--text-muted); font-size: 0.9rem; border: 1px dashed var(--border-color); border-radius: var(--radius-md);">No line items added yet. Click "Add Line Item" below.</div>';
                return;
            }

            container.innerHTML = forecastLineItems.map((item, index) => \`
                <div style="background: var(--bg-body); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px; margin-bottom: 16px; position: relative;">
                    <button type="button" onclick="removeForecastLineItem(\${item.id})" style="position: absolute; top: 12px; right: 12px; background: none; border: none; color: var(--danger); cursor: pointer;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg></button>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 12px; padding-right: 24px;">
                        <div class="form-group" style="margin: 0;">
                            <label>Category</label>
                            <select class="form-control" onchange="updateForecastLineItemModal(\${item.id}, 'category', this.value)">
                                <option value="Manpower Payroll & Allowances" \${item.category === 'Manpower Payroll & Allowances' ? 'selected' : ''}>Manpower Payroll & Allowances</option>
                                <option value="Procurement and Admin Expenses" \${item.category === 'Procurement and Admin Expenses' ? 'selected' : ''}>Procurement and Admin Expenses</option>
                                <option value="Unliquidated & On-Hold Expenses" \${item.category === 'Unliquidated & On-Hold Expenses' ? 'selected' : ''}>Unliquidated & On-Hold Expenses</option>
                            </select>
                        </div>
                        <div class="form-group" style="margin: 0;">
                            <label>Particulars</label>
                            <input type="text" class="form-control" value="\${item.description}" oninput="updateForecastLineItemModal(\${item.id}, 'description', this.value)" placeholder="e.g. FOR 11/16/25 to 11/22/25">
                        </div>
                        <div class="form-group" style="margin: 0;">
                            <label>Details</label>
                            <input type="text" class="form-control" value="\${item.details}" oninput="updateForecastLineItemModal(\${item.id}, 'details', this.value)" placeholder="e.g. Release 11/28/25">
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 12px;">
                        <div class="form-group" style="margin: 0;">
                            <label style="font-size: 0.75rem;">Current Week</label>
                            <input type="number" class="form-control" value="\${item.currentWeek || ''}" oninput="updateForecastLineItemModal(\${item.id}, 'currentWeek', this.value)" placeholder="0.00">
                        </div>
                        <div class="form-group" style="margin: 0;">
                            <label style="font-size: 0.75rem;">1st Week</label>
                            <input type="number" class="form-control" value="\${item.week1 || ''}" oninput="updateForecastLineItemModal(\${item.id}, 'week1', this.value)" placeholder="0.00">
                        </div>
                        <div class="form-group" style="margin: 0;">
                            <label style="font-size: 0.75rem;">2nd Week</label>
                            <input type="number" class="form-control" value="\${item.week2 || ''}" oninput="updateForecastLineItemModal(\${item.id}, 'week2', this.value)" placeholder="0.00">
                        </div>
                        <div class="form-group" style="margin: 0;">
                            <label style="font-size: 0.75rem;">3rd Week</label>
                            <input type="number" class="form-control" value="\${item.week3 || ''}" oninput="updateForecastLineItemModal(\${item.id}, 'week3', this.value)" placeholder="0.00">
                        </div>
                        <div class="form-group" style="margin: 0;">
                            <label style="font-size: 0.75rem;">4th Week</label>
                            <input type="number" class="form-control" value="\${item.week4 || ''}" oninput="updateForecastLineItemModal(\${item.id}, 'week4', this.value)" placeholder="0.00">
                        </div>
                    </div>
                </div>
            \`).join('');
        };

        window.saveForecast = function() {
            const period = document.getElementById('forecastPeriod').value;
            const startingBalance = parseFloat(document.getElementById('forecastStartingBalance').value) || 0;
            const expectedReplenishments = parseFloat(document.getElementById('forecastExpected').value) || 0;
            const revolvingFund = parseFloat(document.getElementById('forecastRevolvingFund').value) || 2300000;

            if (!period) {
                alert('Please enter a forecast period.');
                return;
            }

            let totalOutflows = 0;
            forecastLineItems.forEach(item => {
                totalOutflows += (item.currentWeek || 0) + (item.week1 || 0) + (item.week2 || 0) + (item.week3 || 0) + (item.week4 || 0);
            });

            const newForecast = {
                id: Date.now(),
                projectId: currentProjectId,
                dateCreated: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
                period: period,
                status: 'Draft',
                version: 'v1.0',
                startingBalance: startingBalance,
                expectedReplenishments: expectedReplenishments,
                revolvingFund: revolvingFund,
                cashRemaining: startingBalance + expectedReplenishments - totalOutflows,
                items: JSON.parse(JSON.stringify(forecastLineItems)),
                expenseLogs: JSON.parse(JSON.stringify(forecastExpenseLogs)),
                signatures: {
                    preparedBy: null, preparedAt: null,
                    checkedBy: null, checkedAt: null,
                    approvedBy: null, approvedAt: null
                }
            };

            lookAheadForecasts.push(newForecast);
            closeForecastModal();
            currentForecastId = newForecast.id;
            renderLookAheadView();
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
                        <div class="modal-body" style="overflow-y: auto; flex-grow: 1; padding: 24px;">
                            <form id="forecastForm" onsubmit="event.preventDefault(); saveForecast();">
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
                                    <div class="form-group" style="margin: 0;">
                                        <label>Reporting Period</label>
                                        <input type="text" id="forecastPeriod" class="form-control" placeholder="e.g. Mar 30 - May 3, 2025" required>
                                    </div>
                                    <div class="form-group" style="margin: 0;">
                                        <label>Revolving Fund Limit</label>
                                        <input type="number" id="forecastRevolvingFund" class="form-control" value="2300000" step="0.01">
                                    </div>
                                    <div class="form-group" style="margin: 0;">
                                        <label>Starting Balance</label>
                                        <input type="number" id="forecastStartingBalance" class="form-control" placeholder="0.00" step="0.01">
                                    </div>
                                    <div class="form-group" style="margin: 0;">
                                        <label>Expected Replenishments (Inflows)</label>
                                        <input type="number" id="forecastExpected" class="form-control" placeholder="0.00" step="0.01">
                                    </div>
                                </div>
                                
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-top: 16px; border-top: 1px solid var(--border-color);">
                                    <h3 style="font-size: 1.1rem; font-weight: 600;">Weekly Breakdown Items</h3>
                                    <button type="button" class="btn btn-secondary" onclick="addForecastLineItem()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> Add Line Item</button>
                                </div>
                                
                                <div id="forecastLineItemsContainer"></div>
                                
                                <div style="margin-top: 24px; display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid var(--border-color); padding-top: 16px;">
                                    <button type="button" class="btn btn-secondary" onclick="closeForecastModal()">Cancel</button>
                                    <button type="submit" class="btn btn-primary">Save as Draft</button>
                                </div>
                            </form>
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

// Find start of Look Ahead Logic
const startIndex = lines.findIndex(l => l.includes('// --- Look Ahead Logic ---'));
// Find end of Look Ahead Logic (the next window.populateExpenseMonthFilter)
const endIndex = lines.findIndex(l => l.includes('window.populateExpenseMonthFilter = function'));

if (startIndex !== -1 && endIndex !== -1) {
    lines.splice(startIndex, endIndex - startIndex, newLookAheadCode);
    fs.writeFileSync('index.html', lines.join('\n'));
    console.log("Successfully replaced Look Ahead logic.");
} else {
    console.log("Could not find start or end index.");
}
