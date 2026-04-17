const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

// We will insert the Look Ahead logic after renderExpenseOverview
const lookAheadCode = `
        // --- Look Ahead Logic ---
        let lookAheadForecasts = [];
        let currentForecastId = null;
        let forecastLineItems = [];

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
            
            let listHtml = projectForecasts.map(f => \`
                <div class="card" style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all 0.2s;" onclick="viewForecast(\${f.id})" onmouseover="this.style.borderColor='var(--primary-color)'; this.style.transform='translateY(-2px)';" onmouseout="this.style.borderColor='var(--border-color)'; this.style.transform='none';">
                    <div>
                        <div style="font-weight: 600; font-size: 1.1rem; color: var(--text-main); margin-bottom: 4px;">\${f.period}</div>
                        <div style="font-size: 0.85rem; color: var(--text-muted);">Created on \${f.dateCreated}</div>
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
                        <div style="color: var(--text-muted); font-size: 0.9rem;">Weekly cash forecasting and history</div>
                    </div>
                    \${projectForecasts.length > 0 ? \`<button class="btn btn-primary" onclick="openForecastModal()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> New Forecast</button>\` : ''}
                </div>
                
                <div style="margin-bottom: 24px;">
                    <h2 style="font-size: 1.1rem; font-weight: 600; margin-bottom: 16px; color: var(--text-main);">Forecast History</h2>
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

        window.renderForecastDetail = function(id) {
            const f = lookAheadForecasts.find(x => x.id === id);
            if (!f) return backToForecastList();

            const formatCurrency = (val) => '₱' + (val || 0).toLocaleString('en-PH', {minimumFractionDigits: 0, maximumFractionDigits: 0});
            const formatCurrencyDec = (val) => '₱' + (val || 0).toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2});

            // Calculate totals
            let totalOutflows = 0;
            let currentWeekTotal = 0;
            let week1Total = 0;
            let week2Total = 0;
            let week3Total = 0;
            let week4Total = 0;

            f.items.forEach(item => {
                totalOutflows += (item.currentWeek || 0) + (item.week1 || 0) + (item.week2 || 0) + (item.week3 || 0) + (item.week4 || 0);
                currentWeekTotal += (item.currentWeek || 0);
                week1Total += (item.week1 || 0);
                week2Total += (item.week2 || 0);
                week3Total += (item.week3 || 0);
                week4Total += (item.week4 || 0);
            });

            const cashRemaining = f.startingBalance + f.expectedReplenishments - totalOutflows;

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
                    </tr>
                \`;

                if (catItems.length === 0) {
                    tableHtml += \`
                        <tr style="border-bottom: 1px solid var(--border-color);">
                            <td style="padding: 12px 16px; color: var(--text-muted); font-size: 0.85rem;">No records</td>
                            <td style="padding: 12px 16px;"></td>
                            <td style="padding: 12px 16px; text-align: right; color: var(--text-muted);">-</td>
                            <td style="padding: 12px 16px; text-align: right; color: var(--text-muted);">-</td>
                            <td style="padding: 12px 16px; text-align: right; color: var(--text-muted);">-</td>
                            <td style="padding: 12px 16px; text-align: right; color: var(--text-muted);">-</td>
                            <td style="padding: 12px 16px; text-align: right; color: var(--text-muted);">-</td>
                        </tr>
                    \`;
                } else {
                    catItems.forEach(item => {
                        tableHtml += \`
                            <tr style="border-bottom: 1px solid var(--border-color); background: \${cat === 'Procurement and Admin Expenses' ? '#fffbeb' : 'transparent'};">
                                <td style="padding: 12px 16px; font-size: 0.85rem;">\${item.description}</td>
                                <td style="padding: 12px 16px; font-size: 0.85rem;">\${item.details}</td>
                                <td style="padding: 12px 16px; text-align: right; font-size: 0.85rem;">\${item.currentWeek ? formatCurrency(item.currentWeek) : '-'}</td>
                                <td style="padding: 12px 16px; text-align: right; font-size: 0.85rem;">\${item.week1 ? formatCurrency(item.week1) : '-'}</td>
                                <td style="padding: 12px 16px; text-align: right; font-size: 0.85rem;">\${item.week2 ? formatCurrency(item.week2) : '-'}</td>
                                <td style="padding: 12px 16px; text-align: right; font-size: 0.85rem;">\${item.week3 ? formatCurrency(item.week3) : '-'}</td>
                                <td style="padding: 12px 16px; text-align: right; font-size: 0.85rem;">\${item.week4 ? formatCurrency(item.week4) : '-'}</td>
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
                </tr>
            \`;

            // Chart Data Points
            // We'll simulate a simple line chart with SVG
            const chartPoints = [
                { label: 'Current Week', val: currentWeekTotal },
                { label: 'Week 1', val: week1Total },
                { label: '2nd WEEK', val: week2Total },
                { label: '3rd WEEK', val: week3Total },
                { label: '4th WEEK', val: week4Total }
            ];
            
            const maxVal = Math.max(...chartPoints.map(p => p.val), 1000000); // Minimum scale 1M
            const chartHeight = 200;
            const chartWidth = 1000;
            const padding = 40;
            
            let polylinePoints = chartPoints.map((p, i) => {
                const x = padding + (i * ((chartWidth - 2 * padding) / 4));
                const y = chartHeight - padding - ((p.val / maxVal) * (chartHeight - 2 * padding));
                return \`\${x},\${y}\`;
            }).join(' ');

            let circlesHtml = chartPoints.map((p, i) => {
                const x = padding + (i * ((chartWidth - 2 * padding) / 4));
                const y = chartHeight - padding - ((p.val / maxVal) * (chartHeight - 2 * padding));
                return \`<circle cx="\${x}" cy="\${y}" r="4" fill="white" stroke="#93c5fd" stroke-width="2"/>\`;
            }).join('');

            let labelsHtml = chartPoints.map((p, i) => {
                const x = padding + (i * ((chartWidth - 2 * padding) / 4));
                return \`<text x="\${x}" y="\${chartHeight - 10}" fill="#cbd5e1" font-size="10" font-weight="600" text-anchor="middle">\${p.label}</text>\`;
            }).join('');

            let gridLinesHtml = [0, 0.25, 0.5, 0.75, 1].map(ratio => {
                const y = chartHeight - padding - (ratio * (chartHeight - 2 * padding));
                const val = maxVal * ratio;
                return \`
                    <line x1="\${padding}" y1="\${y}" x2="\${chartWidth - padding}" y2="\${y}" stroke="#cbd5e1" stroke-width="0.5" stroke-dasharray="4 4" opacity="0.5"/>
                    <text x="\${padding - 10}" y="\${y + 4}" fill="#cbd5e1" font-size="9" text-anchor="end">₱ \${(val/1000).toFixed(0)}k</text>
                \`;
            }).join('');

            contentArea.innerHTML = \`
                <div style="margin-bottom: 16px;">
                    <button class="btn btn-secondary" onclick="backToForecastList()" style="padding: 6px 12px; font-size: 0.85rem;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><path d="m15 18-6-6 6-6"/></svg> Back to History</button>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                    <div style="display: flex; gap: 12px; align-items: center;">
                        <select class="form-control" style="width: auto; font-weight: 600;">
                            <option>Next 7 Days</option>
                            <option>Next 14 Days</option>
                            <option>Next 30 Days</option>
                        </select>
                        <button class="btn btn-secondary" style="color: #3b82f6; border-color: #bfdbfe; background: #eff6ff;">Export</button>
                        <button class="btn btn-secondary" style="color: #3b82f6; border-color: #bfdbfe; background: #eff6ff;">Print</button>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;">
                    <div class="card" style="display: flex; align-items: center; gap: 16px; padding: 20px;">
                        <div style="width: 48px; height: 48px; border-radius: 12px; background: #3b82f6;"></div>
                        <div>
                            <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">Starting Balance</div>
                            <div style="font-size: 1.5rem; font-weight: 800; color: var(--text-main);">\${formatCurrency(f.startingBalance)}</div>
                        </div>
                    </div>
                    <div class="card" style="display: flex; align-items: center; gap: 16px; padding: 20px;">
                        <div style="width: 48px; height: 48px; border-radius: 12px; background: #f59e0b;"></div>
                        <div>
                            <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">Total Cash Outflows</div>
                            <div style="font-size: 1.5rem; font-weight: 800; color: var(--text-main);">\${formatCurrency(totalOutflows)}</div>
                        </div>
                    </div>
                    <div class="card" style="display: flex; align-items: center; gap: 16px; padding: 20px;">
                        <div style="width: 48px; height: 48px; border-radius: 12px; background: #8b5cf6;"></div>
                        <div>
                            <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">Expected</div>
                            <div style="font-size: 1.5rem; font-weight: 800; color: var(--text-main);">\${formatCurrency(f.expectedReplenishments)}</div>
                        </div>
                    </div>
                    <div class="card" style="display: flex; align-items: center; gap: 16px; padding: 20px;">
                        <div style="width: 48px; height: 48px; border-radius: 12px; background: #ef4444;"></div>
                        <div>
                            <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">Cash Remaining</div>
                            <div style="font-size: 1.5rem; font-weight: 800; color: var(--text-main);">\${formatCurrency(cashRemaining)}</div>
                        </div>
                    </div>
                </div>

                <div class="card" style="margin-bottom: 24px; padding: 0; overflow: hidden;">
                    <div style="padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color);">
                        <h3 style="font-size: 1.1rem; font-weight: 800;">Cash Forecast This Month</h3>
                        <div style="font-size: 0.85rem; color: var(--text-muted);"><span style="font-weight: 700; color: var(--text-main);">Current Week</span> | \${f.period}</div>
                    </div>
                    <div style="background: #94a3b8; padding: 24px 0;">
                        <svg width="100%" height="\${chartHeight}" viewBox="0 0 \${chartWidth} \${chartHeight}" preserveAspectRatio="none">
                            \${gridLinesHtml}
                            <polyline points="\${polylinePoints}" fill="none" stroke="#93c5fd" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                            \${circlesHtml}
                            \${labelsHtml}
                            <text x="\${chartWidth/4}" y="\${chartHeight - padding - 10}" fill="#fca5a5" font-size="10" font-weight="700" text-anchor="middle">-\${formatCurrency(totalOutflows)}</text>
                        </svg>
                    </div>
                </div>

                <div class="card" style="margin-bottom: 24px; padding: 0; overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; text-align: left;">
                        <thead style="background: var(--bg-body);">
                            <tr>
                                <th style="padding: 16px; font-size: 0.75rem; font-weight: 800; color: var(--text-muted); width: 25%;">PARTICULARS</th>
                                <th style="padding: 16px; font-size: 0.75rem; font-weight: 800; color: var(--text-muted); width: 20%;">DETAILS</th>
                                <th style="padding: 16px; font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-align: right; width: 11%;">CURRENT WEEK</th>
                                <th style="padding: 16px; font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-align: right; width: 11%;">1ST WEEK</th>
                                <th style="padding: 16px; font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-align: right; width: 11%;">2ND WEEK</th>
                                <th style="padding: 16px; font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-align: right; width: 11%;">3RD WEEK</th>
                                <th style="padding: 16px; font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-align: right; width: 11%;">4TH WEEK</th>
                            </tr>
                        </thead>
                        <tbody>
                            \${tableHtml}
                        </tbody>
                    </table>
                </div>

                <div class="card" style="margin-bottom: 24px;">
                    <h3 style="font-size: 1.1rem; font-weight: 800; margin-bottom: 16px; text-transform: uppercase;">Summary</h3>
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;">
                        <div style="border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px;">
                            <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 4px;">Starting Balance</div>
                            <div style="font-size: 1.1rem; font-weight: 800;">\${formatCurrencyDec(f.startingBalance)}</div>
                        </div>
                        <div style="border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px;">
                            <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 4px;">Total Cash Outflows</div>
                            <div style="font-size: 1.1rem; font-weight: 800;">\${formatCurrencyDec(totalOutflows)}</div>
                        </div>
                        <div style="border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px;">
                            <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 4px;">Expected Replenishments</div>
                            <div style="font-size: 1.1rem; font-weight: 800;">\${formatCurrencyDec(f.expectedReplenishments)}</div>
                        </div>
                        <div style="border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px;">
                            <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 4px;">Cash Remaining</div>
                            <div style="font-size: 1.1rem; font-weight: 800; color: \${cashRemaining < 0 ? '#ef4444' : '#22c55e'};">\${formatCurrencyDec(cashRemaining)}</div>
                        </div>
                    </div>
                </div>
            \`;
        };

        window.openForecastModal = function() {
            forecastLineItems = [];
            const modal = document.getElementById('forecastModal');
            if (modal) {
                document.getElementById('forecastForm').reset();
                renderForecastLineItems();
                modal.classList.add('open');
            }
        };

        window.closeForecastModal = function() {
            const modal = document.getElementById('forecastModal');
            if (modal) modal.classList.remove('open');
        };

        window.addForecastLineItem = function() {
            forecastLineItems.push({
                id: Date.now(),
                category: 'Manpower Payroll & Allowances',
                description: '',
                details: '',
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

        window.updateForecastLineItem = function(id, field, value) {
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
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 12px; padding-right: 24px;">
                        <div class="form-group" style="margin: 0;">
                            <label>Category</label>
                            <select class="form-control" onchange="updateForecastLineItem(\${item.id}, 'category', this.value)">
                                <option value="Manpower Payroll & Allowances" \${item.category === 'Manpower Payroll & Allowances' ? 'selected' : ''}>Manpower Payroll & Allowances</option>
                                <option value="Procurement and Admin Expenses" \${item.category === 'Procurement and Admin Expenses' ? 'selected' : ''}>Procurement and Admin Expenses</option>
                                <option value="Unliquidated & On-Hold Expenses" \${item.category === 'Unliquidated & On-Hold Expenses' ? 'selected' : ''}>Unliquidated & On-Hold Expenses</option>
                            </select>
                        </div>
                        <div class="form-group" style="margin: 0;">
                            <label>Description (Particulars)</label>
                            <input type="text" class="form-control" value="\${item.description}" oninput="updateForecastLineItem(\${item.id}, 'description', this.value)" placeholder="e.g. FOR 11/16/25 to 11/22/25">
                        </div>
                    </div>
                    
                    <div class="form-group" style="margin-bottom: 12px;">
                        <label>Details</label>
                        <input type="text" class="form-control" value="\${item.details}" oninput="updateForecastLineItem(\${item.id}, 'details', this.value)" placeholder="e.g. Release 11/28/25">
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px;">
                        <div class="form-group" style="margin: 0;">
                            <label style="font-size: 0.75rem;">Current Week</label>
                            <input type="number" class="form-control" value="\${item.currentWeek || ''}" oninput="updateForecastLineItem(\${item.id}, 'currentWeek', this.value)" placeholder="0.00">
                        </div>
                        <div class="form-group" style="margin: 0;">
                            <label style="font-size: 0.75rem;">1st Week</label>
                            <input type="number" class="form-control" value="\${item.week1 || ''}" oninput="updateForecastLineItem(\${item.id}, 'week1', this.value)" placeholder="0.00">
                        </div>
                        <div class="form-group" style="margin: 0;">
                            <label style="font-size: 0.75rem;">2nd Week</label>
                            <input type="number" class="form-control" value="\${item.week2 || ''}" oninput="updateForecastLineItem(\${item.id}, 'week2', this.value)" placeholder="0.00">
                        </div>
                        <div class="form-group" style="margin: 0;">
                            <label style="font-size: 0.75rem;">3rd Week</label>
                            <input type="number" class="form-control" value="\${item.week3 || ''}" oninput="updateForecastLineItem(\${item.id}, 'week3', this.value)" placeholder="0.00">
                        </div>
                        <div class="form-group" style="margin: 0;">
                            <label style="font-size: 0.75rem;">4th Week</label>
                            <input type="number" class="form-control" value="\${item.week4 || ''}" oninput="updateForecastLineItem(\${item.id}, 'week4', this.value)" placeholder="0.00">
                        </div>
                    </div>
                </div>
            \`).join('');
        };

        window.saveForecast = function() {
            const period = document.getElementById('forecastPeriod').value;
            const startingBalance = parseFloat(document.getElementById('forecastStartingBalance').value) || 0;
            const expectedReplenishments = parseFloat(document.getElementById('forecastExpected').value) || 0;

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
                startingBalance: startingBalance,
                expectedReplenishments: expectedReplenishments,
                cashRemaining: startingBalance + expectedReplenishments - totalOutflows,
                items: JSON.parse(JSON.stringify(forecastLineItems))
            };

            lookAheadForecasts.push(newForecast);
            closeForecastModal();
            renderLookAheadView();
        };

        // Add the modal HTML to the body
        document.addEventListener('DOMContentLoaded', () => {
            const modalHtml = \`
                <div class="modal-overlay" id="forecastModal">
                    <div class="modal-content" style="max-width: 800px; max-height: 90vh; display: flex; flex-direction: column;">
                        <div class="modal-header" style="flex-shrink: 0;">
                            <h2>Create New Weekly Forecast</h2>
                            <button class="close-modal" onclick="closeForecastModal()">&times;</button>
                        </div>
                        <div class="modal-body" style="overflow-y: auto; flex-grow: 1;">
                            <form id="forecastForm" onsubmit="event.preventDefault(); saveForecast();">
                                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 24px;">
                                    <div class="form-group" style="margin: 0;">
                                        <label>Forecast Period</label>
                                        <input type="text" id="forecastPeriod" class="form-control" placeholder="e.g. Nov 23 - Nov 29, 2025" required>
                                    </div>
                                    <div class="form-group" style="margin: 0;">
                                        <label>Starting Balance</label>
                                        <input type="number" id="forecastStartingBalance" class="form-control" placeholder="0.00" step="0.01">
                                    </div>
                                    <div class="form-group" style="margin: 0;">
                                        <label>Expected Replenishments</label>
                                        <input type="number" id="forecastExpected" class="form-control" placeholder="0.00" step="0.01">
                                    </div>
                                </div>
                                
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                                    <h3 style="font-size: 1.1rem; font-weight: 600;">Line Items</h3>
                                    <button type="button" class="btn btn-secondary" onclick="addForecastLineItem()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> Add Line Item</button>
                                </div>
                                
                                <div id="forecastLineItemsContainer"></div>
                                
                                <div style="margin-top: 24px; display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid var(--border-color); padding-top: 16px;">
                                    <button type="button" class="btn btn-secondary" onclick="closeForecastModal()">Cancel</button>
                                    <button type="submit" class="btn btn-primary">Save Forecast</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            \`;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
        });
`;

const insertIndex = html.indexOf('window.renderExpenseOverview = function');
if (insertIndex !== -1) {
    // find the end of renderExpenseOverview
    let braces = 0;
    let endIndex = -1;
    let started = false;
    for (let i = insertIndex; i < html.length; i++) {
        if (html[i] === '{') {
            braces++;
            started = true;
        } else if (html[i] === '}') {
            braces--;
            if (started && braces === 0) {
                endIndex = i + 1;
                // skip trailing semicolon if present
                if (html[endIndex] === ';') endIndex++;
                break;
            }
        }
    }
    
    if (endIndex !== -1) {
        const newHtml = html.slice(0, endIndex) + '\n' + lookAheadCode + html.slice(endIndex);
        fs.writeFileSync('index.html', newHtml);
        console.log("Injected Look Ahead code successfully.");
    } else {
        console.log("Could not find end of renderExpenseOverview");
    }
} else {
    console.log("Could not find renderExpenseOverview");
}
