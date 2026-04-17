const fs = require('fs');

const newCode = `
        // --- Project Schedule Logic ---
        let projectSchedules = {}; // { projectId: { 'A1': { duration: '', targetStart: '', targetEnd: '', qty: '', weight: '', status: 'Not Started', actualStart: '', actualEnd: '', actualQty: '', targetQty: '' }, ... } }
        let currentScheduleTab = 'baseline'; // baseline, actual, gantt
        let scheduleSearchQuery = '';
        let scheduleExpandedParents = {};

        window.renderProjectScheduleView = function() {
            if (!currentProjectId) return;
            currentView = 'project-schedule';
            updateSubNavVisibility();

            if (!projectSchedules[currentProjectId]) {
                projectSchedules[currentProjectId] = {};
            }
            const scheduleData = projectSchedules[currentProjectId];
            const projectBudgets = boqBudgets[currentProjectId] || {};

            // Build tree from BOQ Charging options
            const parentNames = {
                'A': 'BIDDING',
                'B': 'PRE-DEVELOPMENT WORKS & OTHER PROJECT EXPENSES',
                'C': 'PROCUREMENT',
                'D': 'CONSTRUCTION',
                'B2': 'Permitting',
                'B3': 'Feasibility Study',
                'B4': 'Water, Electrical, and Internet Connection',
                'B5': 'Special Tools, Supplies, and PPE',
                'B6': 'Administrative Expenses',
                'C1': 'Logistics',
                'C2': 'General Works',
                'C3': 'Diesel Power Plant',
                'C4': 'Substation and Transmission Line',
                'C5': 'SCADA System',
                'C6': 'Testing and Commissioning',
                'D1': 'General Works',
                'D2': 'Diesel Power Plant',
                'D3': 'Substation and Transmission Line',
                'D4': 'SCADA System',
                'D5': 'Testing and Commissioning'
            };

            const itemsByParent = {};
            let totalProjectBudget = 0;

            subtaskChargingOptions.forEach(opt => {
                const match = opt.match(/^([A-D])([0-9.]+)\\s*-\\s*(.*?)(?:\\s*\\(.*\\))?$/);
                if (match) {
                    const category = match[1];
                    const code = match[1] + match[2];
                    let name = match[3].trim();
                    name = name.replace(/\\s*\\(PROCUREMENT\\)$/i, '').replace(/\\s*\\(CONSTRUCTION\\)$/i, '');

                    const budget = projectBudgets[code] || 0;
                    totalProjectBudget += budget;

                    if (!scheduleData[code]) {
                        scheduleData[code] = {
                            duration: '', targetStart: '', targetEnd: '', qty: '', weight: '', status: 'Not Started',
                            actualStart: '', actualEnd: '', actualQty: '', targetQty: ''
                        };
                    }

                    const item = {
                        code: code,
                        name: name,
                        budget: budget,
                        data: scheduleData[code]
                    };

                    if (code.includes('.')) {
                        const parentCode = code.split('.')[0];
                        if (!itemsByParent[parentCode]) {
                            itemsByParent[parentCode] = {
                                code: parentCode,
                                name: parentNames[parentCode] || parentCode,
                                items: [],
                                expanded: scheduleExpandedParents[parentCode] !== false
                            };
                        }
                        itemsByParent[parentCode].items.push(item);
                    } else {
                        if (!itemsByParent[category]) {
                            itemsByParent[category] = {
                                code: category,
                                name: parentNames[category] || category,
                                items: [],
                                expanded: scheduleExpandedParents[category] !== false
                            };
                        }
                        itemsByParent[category].items.push(item);
                    }
                }
            });

            // Calculate parent totals
            Object.values(itemsByParent).forEach(parent => {
                parent.budget = parent.items.reduce((sum, item) => sum + item.budget, 0);
            });

            const renderStatusBadge = (status) => {
                switch(status) {
                    case 'Completed': return '<span style="background: #dcfce3; color: #16a34a; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">Completed</span>';
                    case 'Delayed': return '<span style="background: #fee2e2; color: #ef4444; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">Delayed</span>';
                    case 'In Progress': return '<span style="background: #e0f2fe; color: #0284c7; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">In Progress</span>';
                    default: return '<span style="background: #f1f5f9; color: #64748b; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">Not Started</span>';
                }
            };

            let tableHtml = '';

            if (currentScheduleTab === 'baseline') {
                tableHtml = \`
                    <table style="width: 100%; border-collapse: collapse; text-align: left;">
                        <thead style="background: #1e293b; color: white;">
                            <tr>
                                <th style="padding: 12px 16px; font-size: 0.75rem; font-weight: 600;">ITEM NO.</th>
                                <th style="padding: 12px 16px; font-size: 0.75rem; font-weight: 600;">DESCRIPTION / SCOPE OF WORK</th>
                                <th style="padding: 12px 16px; font-size: 0.75rem; font-weight: 600; text-align: right;">BUDGET (₱)</th>
                                <th style="padding: 12px 16px; font-size: 0.75rem; font-weight: 600; text-align: center;">DURATION (DAYS)</th>
                                <th style="padding: 12px 16px; font-size: 0.75rem; font-weight: 600;">TARGET START</th>
                                <th style="padding: 12px 16px; font-size: 0.75rem; font-weight: 600;">TARGET END</th>
                                <th style="padding: 12px 16px; font-size: 0.75rem; font-weight: 600; text-align: center;">TOTAL QTY</th>
                                <th style="padding: 12px 16px; font-size: 0.75rem; font-weight: 600; text-align: right;">WEIGHT (%)</th>
                                <th style="padding: 12px 16px; font-size: 0.75rem; font-weight: 600; text-align: center;">STATUS</th>
                                <th style="padding: 12px 16px; font-size: 0.75rem; font-weight: 600;">REMARKS</th>
                                <th style="padding: 12px 16px; font-size: 0.75rem; font-weight: 600; text-align: center;">ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                \`;

                Object.keys(parentNames).forEach(parentCode => {
                    const parent = itemsByParent[parentCode];
                    if (!parent || parent.items.length === 0) return;

                    let hasVisibleSub = false;
                    let subHtml = '';

                    parent.items.forEach(item => {
                        if (scheduleSearchQuery && !item.name.toLowerCase().includes(scheduleSearchQuery.toLowerCase()) && !item.code.toLowerCase().includes(scheduleSearchQuery.toLowerCase())) {
                            return;
                        }
                        hasVisibleSub = true;
                        
                        const weight = totalProjectBudget > 0 ? ((item.budget / totalProjectBudget) * 100).toFixed(2) + '%' : '—';

                        subHtml += \`
                            <tr style="border-bottom: 1px solid var(--border-color); background: #fff;">
                                <td style="padding: 12px 16px; font-size: 0.85rem; color: var(--text-muted);">\${item.code}</td>
                                <td style="padding: 12px 16px; font-size: 0.85rem; padding-left: 32px;">\${item.name}</td>
                                <td style="padding: 12px 16px; font-size: 0.85rem; text-align: right;">\${item.budget ? '₱' + item.budget.toLocaleString('en-PH', {minimumFractionDigits: 2}) : '—'}</td>
                                <td style="padding: 12px 16px; font-size: 0.85rem; text-align: center;">\${item.data.duration || '—'}</td>
                                <td style="padding: 12px 16px; font-size: 0.85rem;">\${item.data.targetStart || '—'}</td>
                                <td style="padding: 12px 16px; font-size: 0.85rem;">\${item.data.targetEnd || '—'}</td>
                                <td style="padding: 12px 16px; font-size: 0.85rem; text-align: center;">\${item.data.qty || '—'}</td>
                                <td style="padding: 12px 16px; font-size: 0.85rem; text-align: right;">\${weight}</td>
                                <td style="padding: 12px 16px; text-align: center;">\${renderStatusBadge(item.data.status)}</td>
                                <td style="padding: 12px 16px; font-size: 0.85rem;">\${item.data.remarks || ''}</td>
                                <td style="padding: 12px 16px; text-align: center;">
                                    <button onclick="editScheduleItem('\${item.code}')" style="background: none; border: none; cursor: pointer; color: var(--text-muted);"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg></button>
                                </td>
                            </tr>
                        \`;
                    });

                    if (!hasVisibleSub && !scheduleSearchQuery) {
                        hasVisibleSub = true;
                    }

                    if (hasVisibleSub) {
                        const parentWeight = totalProjectBudget > 0 ? ((parent.budget / totalProjectBudget) * 100).toFixed(2) + '%' : '—';
                        tableHtml += \`
                            <tr style="background: #f8fafc; border-bottom: 1px solid var(--border-color); cursor: pointer;" onclick="toggleScheduleParent('\${parent.code}')">
                                <td style="padding: 12px 16px; font-size: 0.85rem; font-weight: 600;">\${parent.code}</td>
                                <td style="padding: 12px 16px; font-size: 0.85rem; font-weight: 600;">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; transform: \${parent.expanded ? 'rotate(90deg)' : 'rotate(0deg)'}; transition: transform 0.2s;"><polyline points="9 18 15 12 9 6"/></svg>
                                    \${parent.name}
                                </td>
                                <td style="padding: 12px 16px; font-size: 0.85rem; font-weight: 600; text-align: right;">\${parent.budget ? '₱' + parent.budget.toLocaleString('en-PH', {minimumFractionDigits: 2}) : '—'}</td>
                                <td style="padding: 12px 16px; text-align: center;">—</td>
                                <td style="padding: 12px 16px;">—</td>
                                <td style="padding: 12px 16px;">—</td>
                                <td style="padding: 12px 16px; text-align: center;">—</td>
                                <td style="padding: 12px 16px; font-size: 0.85rem; font-weight: 600; text-align: right;">\${parentWeight}</td>
                                <td style="padding: 12px 16px; text-align: center;">—</td>
                                <td style="padding: 12px 16px;"></td>
                                <td style="padding: 12px 16px;"></td>
                            </tr>
                        \`;
                        if (parent.expanded) {
                            tableHtml += subHtml;
                        }
                    }
                });

                tableHtml += \`</tbody></table>\`;
            } else if (currentScheduleTab === 'actual') {
                tableHtml = \`
                    <table style="width: 100%; border-collapse: collapse; text-align: left;">
                        <thead style="background: #1e293b; color: white;">
                            <tr>
                                <th style="padding: 12px 16px; font-size: 0.75rem; font-weight: 600;">ITEM NO.</th>
                                <th style="padding: 12px 16px; font-size: 0.75rem; font-weight: 600;">DESCRIPTION</th>
                                <th style="padding: 12px 16px; font-size: 0.75rem; font-weight: 600;">ACTUAL START</th>
                                <th style="padding: 12px 16px; font-size: 0.75rem; font-weight: 600;">ACTUAL END</th>
                                <th style="padding: 12px 16px; font-size: 0.75rem; font-weight: 600; text-align: center;">ACTUAL QTY</th>
                                <th style="padding: 12px 16px; font-size: 0.75rem; font-weight: 600; text-align: center;">TARGET QTY</th>
                                <th style="padding: 12px 16px; font-size: 0.75rem; font-weight: 600; text-align: right;">ACTUAL %</th>
                                <th style="padding: 12px 16px; font-size: 0.75rem; font-weight: 600; text-align: right;">TARGET %</th>
                                <th style="padding: 12px 16px; font-size: 0.75rem; font-weight: 600; text-align: right;">VARIANCE</th>
                                <th style="padding: 12px 16px; font-size: 0.75rem; font-weight: 600; text-align: center;">STATUS</th>
                                <th style="padding: 12px 16px; font-size: 0.75rem; font-weight: 600; text-align: center;">ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                \`;

                Object.keys(parentNames).forEach(parentCode => {
                    const parent = itemsByParent[parentCode];
                    if (!parent || parent.items.length === 0) return;

                    let hasVisibleSub = false;
                    let subHtml = '';

                    parent.items.forEach(item => {
                        if (scheduleSearchQuery && !item.name.toLowerCase().includes(scheduleSearchQuery.toLowerCase()) && !item.code.toLowerCase().includes(scheduleSearchQuery.toLowerCase())) {
                            return;
                        }
                        hasVisibleSub = true;
                        
                        const targetPct = item.data.targetQty ? '100.0%' : '0.0%';
                        const actualPct = item.data.actualQty && item.data.targetQty ? ((item.data.actualQty / item.data.targetQty) * 100).toFixed(1) + '%' : '0.0%';
                        const variance = (parseFloat(actualPct) - parseFloat(targetPct)).toFixed(1) + '%';
                        const varianceColor = parseFloat(variance) < 0 ? '#ef4444' : (parseFloat(variance) > 0 ? '#16a34a' : 'var(--text-muted)');

                        subHtml += \`
                            <tr style="border-bottom: 1px solid var(--border-color); background: #fff;">
                                <td style="padding: 12px 16px; font-size: 0.85rem; color: var(--text-muted);">\${item.code}</td>
                                <td style="padding: 12px 16px; font-size: 0.85rem; padding-left: 32px;">\${item.name}</td>
                                <td style="padding: 12px 16px; font-size: 0.85rem;">\${item.data.actualStart || '—'}</td>
                                <td style="padding: 12px 16px; font-size: 0.85rem;">\${item.data.actualEnd || '—'}</td>
                                <td style="padding: 12px 16px; font-size: 0.85rem; text-align: center;">\${item.data.actualQty || '—'}</td>
                                <td style="padding: 12px 16px; font-size: 0.85rem; text-align: center;">\${item.data.targetQty || '—'}</td>
                                <td style="padding: 12px 16px; font-size: 0.85rem; text-align: right;">\${actualPct}</td>
                                <td style="padding: 12px 16px; font-size: 0.85rem; text-align: right;">\${targetPct}</td>
                                <td style="padding: 12px 16px; font-size: 0.85rem; text-align: right; color: \${varianceColor};">\${variance}</td>
                                <td style="padding: 12px 16px; text-align: center;">\${renderStatusBadge(item.data.status)}</td>
                                <td style="padding: 12px 16px; text-align: center;">
                                    <button onclick="editScheduleItem('\${item.code}')" style="background: none; border: none; cursor: pointer; color: var(--text-muted);"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg></button>
                                </td>
                            </tr>
                        \`;
                    });

                    if (!hasVisibleSub && !scheduleSearchQuery) {
                        hasVisibleSub = true;
                    }

                    if (hasVisibleSub) {
                        tableHtml += \`
                            <tr style="background: #f8fafc; border-bottom: 1px solid var(--border-color); cursor: pointer;" onclick="toggleScheduleParent('\${parent.code}')">
                                <td style="padding: 12px 16px; font-size: 0.85rem; font-weight: 600;">\${parent.code}</td>
                                <td style="padding: 12px 16px; font-size: 0.85rem; font-weight: 600;">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; transform: \${parent.expanded ? 'rotate(90deg)' : 'rotate(0deg)'}; transition: transform 0.2s;"><polyline points="9 18 15 12 9 6"/></svg>
                                    \${parent.name}
                                </td>
                                <td style="padding: 12px 16px;">—</td>
                                <td style="padding: 12px 16px;">—</td>
                                <td style="padding: 12px 16px; text-align: center;">—</td>
                                <td style="padding: 12px 16px; text-align: center;">—</td>
                                <td style="padding: 12px 16px; text-align: right;">0.0%</td>
                                <td style="padding: 12px 16px; text-align: right;">0.0%</td>
                                <td style="padding: 12px 16px; text-align: right;">0.0%</td>
                                <td style="padding: 12px 16px; text-align: center;">—</td>
                                <td style="padding: 12px 16px;"></td>
                            </tr>
                        \`;
                        if (parent.expanded) {
                            tableHtml += subHtml;
                        }
                    }
                });

                tableHtml += \`</tbody></table>\`;
            } else if (currentScheduleTab === 'gantt') {
                tableHtml = \`
                    <div style="padding: 24px; text-align: center; color: var(--text-muted); border: 1px dashed var(--border-color); border-radius: var(--radius-md); background: #f8fafc;">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 16px; color: #94a3b8;"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
                        <h3 style="font-size: 1.1rem; font-weight: 600; color: var(--text-main); margin-bottom: 8px;">Gantt Chart View</h3>
                        <p style="font-size: 0.9rem;">The interactive Gantt chart will be rendered here based on the target and actual dates.</p>
                    </div>
                \`;
            }

            contentArea.innerHTML = \`
                <div class="view-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
                    <div>
                        <h1 style="font-size: 1.5rem; font-weight: 700; color: var(--text-main); margin-bottom: 4px;">Project Schedule</h1>
                        <div style="color: var(--text-muted); font-size: 0.9rem;">Track baseline schedule, actual accomplishments, and Gantt chart</div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px;">
                    <div class="card" style="display: flex; justify-content: space-between; align-items: center; border-left: 4px solid #3b82f6;">
                        <div>
                            <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; margin-bottom: 4px;">TOTAL BUDGET</div>
                            <div style="font-size: 1.25rem; font-weight: 800; color: var(--text-main);">₱\${totalProjectBudget.toLocaleString('en-PH', {minimumFractionDigits: 2})}</div>
                        </div>
                        <div style="width: 32px; height: 32px; background: #eff6ff; color: #3b82f6; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                        </div>
                    </div>
                    <div class="card" style="display: flex; justify-content: space-between; align-items: center; border-left: 4px solid #10b981;">
                        <div>
                            <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; margin-bottom: 4px;">ACTUAL EXPENSE</div>
                            <div style="font-size: 1.25rem; font-weight: 800; color: var(--text-main);">₱0.00</div>
                        </div>
                        <div style="width: 32px; height: 32px; background: #ecfdf5; color: #10b981; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
                        </div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px;">
                    <div class="card">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-muted);">Overall Progress</span>
                            <span style="font-size: 1.1rem; font-weight: 800; color: var(--text-main);">0.0%</span>
                        </div>
                        <div style="height: 8px; background: var(--bg-surface); border-radius: 4px; overflow: hidden;">
                            <div style="height: 100%; width: 0%; background: #3b82f6; border-radius: 4px;"></div>
                        </div>
                    </div>
                    <div class="card">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-muted);">Budget Utilization</span>
                            <span style="font-size: 1.1rem; font-weight: 800; color: var(--text-main);">0.0%</span>
                        </div>
                        <div style="height: 8px; background: var(--bg-surface); border-radius: 4px; overflow: hidden;">
                            <div style="height: 100%; width: 0%; background: #10b981; border-radius: 4px;"></div>
                        </div>
                    </div>
                </div>

                <div class="card" style="margin-bottom: 24px; padding: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="display: flex; gap: 12px; flex-grow: 1; max-width: 600px;">
                            <div style="position: relative; flex-grow: 1;">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted);"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>
                                <input type="text" class="form-control" placeholder="Search tasks..." value="\${scheduleSearchQuery}" onkeyup="scheduleSearchQuery = this.value; renderProjectScheduleView()" style="padding-left: 36px; width: 100%;">
                            </div>
                            <select class="form-control" style="width: 200px;">
                                <option>All Categories</option>
                            </select>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button class="btn btn-secondary" onclick="expandAllSchedule()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><polyline points="6 9 12 15 18 9"/></svg> Expand All</button>
                            <button class="btn btn-secondary" onclick="collapseAllSchedule()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><polyline points="18 15 12 9 6 15"/></svg> Collapse All</button>
                        </div>
                    </div>
                </div>

                <div style="display: flex; gap: 8px; margin-bottom: 16px; border-bottom: 1px solid var(--border-color); padding-bottom: 16px;">
                    <button class="btn \${currentScheduleTab === 'baseline' ? 'btn-primary' : 'btn-secondary'}" onclick="currentScheduleTab = 'baseline'; renderProjectScheduleView()" style="\${currentScheduleTab === 'baseline' ? 'background: #1e293b; color: white; border-color: #1e293b;' : ''}">Schedule (Baseline)</button>
                    <button class="btn \${currentScheduleTab === 'actual' ? 'btn-primary' : 'btn-secondary'}" onclick="currentScheduleTab = 'actual'; renderProjectScheduleView()" style="\${currentScheduleTab === 'actual' ? 'background: #1e293b; color: white; border-color: #1e293b;' : ''}">Accomplishment (Actual)</button>
                    <button class="btn \${currentScheduleTab === 'gantt' ? 'btn-primary' : 'btn-secondary'}" onclick="currentScheduleTab = 'gantt'; renderProjectScheduleView()" style="\${currentScheduleTab === 'gantt' ? 'background: #1e293b; color: white; border-color: #1e293b;' : ''}">Gantt Chart</button>
                </div>

                <div class="card" style="padding: 0; overflow-x: auto;">
                    \${tableHtml}
                </div>
            \`;
        };

        window.toggleScheduleParent = function(code) {
            scheduleExpandedParents[code] = scheduleExpandedParents[code] === false ? true : false;
            renderProjectScheduleView();
        };

        window.expandAllSchedule = function() {
            Object.keys(scheduleExpandedParents).forEach(k => scheduleExpandedParents[k] = true);
            // Also set true for those not in the object yet
            subtaskChargingOptions.forEach(opt => {
                const match = opt.match(/^([A-D])([0-9.]+)/);
                if (match) {
                    const parentCode = match[1] + match[2].split('.')[0];
                    scheduleExpandedParents[parentCode] = true;
                    scheduleExpandedParents[match[1]] = true;
                }
            });
            renderProjectScheduleView();
        };

        window.collapseAllSchedule = function() {
            Object.keys(scheduleExpandedParents).forEach(k => scheduleExpandedParents[k] = false);
            subtaskChargingOptions.forEach(opt => {
                const match = opt.match(/^([A-D])([0-9.]+)/);
                if (match) {
                    const parentCode = match[1] + match[2].split('.')[0];
                    scheduleExpandedParents[parentCode] = false;
                    scheduleExpandedParents[match[1]] = false;
                }
            });
            renderProjectScheduleView();
        };

        window.editScheduleItem = function(code) {
            const data = projectSchedules[currentProjectId][code];
            if (!data) return;

            const modalHtml = \`
                <div class="modal-overlay active" id="editScheduleModal">
                    <div class="modal" style="max-width: 600px;">
                        <div class="modal-header">
                            <h2>Edit Schedule: \${code}</h2>
                            <button class="close-modal" onclick="document.getElementById('editScheduleModal').remove()">&times;</button>
                        </div>
                        <div class="modal-body">
                            <form onsubmit="event.preventDefault(); saveScheduleItem('\${code}')">
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                                    <div class="form-group">
                                        <label>Duration (Days)</label>
                                        <input type="number" id="schedDuration" class="form-control" value="\${data.duration || ''}">
                                    </div>
                                    <div class="form-group">
                                        <label>Status</label>
                                        <select id="schedStatus" class="form-control">
                                            <option value="Not Started" \${data.status === 'Not Started' ? 'selected' : ''}>Not Started</option>
                                            <option value="In Progress" \${data.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                                            <option value="Delayed" \${data.status === 'Delayed' ? 'selected' : ''}>Delayed</option>
                                            <option value="Completed" \${data.status === 'Completed' ? 'selected' : ''}>Completed</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label>Target Start</label>
                                        <input type="date" id="schedTargetStart" class="form-control" value="\${data.targetStart || ''}">
                                    </div>
                                    <div class="form-group">
                                        <label>Target End</label>
                                        <input type="date" id="schedTargetEnd" class="form-control" value="\${data.targetEnd || ''}">
                                    </div>
                                    <div class="form-group">
                                        <label>Actual Start</label>
                                        <input type="date" id="schedActualStart" class="form-control" value="\${data.actualStart || ''}">
                                    </div>
                                    <div class="form-group">
                                        <label>Actual End</label>
                                        <input type="date" id="schedActualEnd" class="form-control" value="\${data.actualEnd || ''}">
                                    </div>
                                    <div class="form-group">
                                        <label>Target Qty</label>
                                        <input type="number" id="schedTargetQty" class="form-control" value="\${data.targetQty || ''}">
                                    </div>
                                    <div class="form-group">
                                        <label>Actual Qty</label>
                                        <input type="number" id="schedActualQty" class="form-control" value="\${data.actualQty || ''}">
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label>Remarks</label>
                                    <input type="text" id="schedRemarks" class="form-control" value="\${data.remarks || ''}">
                                </div>
                                <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px;">
                                    <button type="button" class="btn btn-secondary" onclick="document.getElementById('editScheduleModal').remove()">Cancel</button>
                                    <button type="submit" class="btn btn-primary">Save Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            \`;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
        };

        window.saveScheduleItem = function(code) {
            const data = projectSchedules[currentProjectId][code];
            if (data) {
                data.duration = document.getElementById('schedDuration').value;
                data.status = document.getElementById('schedStatus').value;
                data.targetStart = document.getElementById('schedTargetStart').value;
                data.targetEnd = document.getElementById('schedTargetEnd').value;
                data.actualStart = document.getElementById('schedActualStart').value;
                data.actualEnd = document.getElementById('schedActualEnd').value;
                data.targetQty = document.getElementById('schedTargetQty').value;
                data.actualQty = document.getElementById('schedActualQty').value;
                data.remarks = document.getElementById('schedRemarks').value;
                
                document.getElementById('editScheduleModal').remove();
                renderProjectScheduleView();
            }
        };
`;

let htmlContent = fs.readFileSync('index.html', 'utf8');

// Replace the links
htmlContent = htmlContent.replace(/<a href="#">Project Schedule<\/a>/g, '<a href="#" class="nested-link" data-view="project-schedule" onclick="renderProjectScheduleView(); return false;">Project Schedule</a>');
htmlContent = htmlContent.replace(/<a href="#" class="mobile-sub-item">Project Schedule<\/a>/g, '<a href="#" class="mobile-sub-item nested" data-view="project-schedule" onclick="renderProjectScheduleView(); return false;">Project Schedule</a>');

// Insert the new code before window.renderBoqChargingView
const insertIndex = htmlContent.indexOf('window.renderBoqChargingView = function() {');
if (insertIndex !== -1) {
    htmlContent = htmlContent.slice(0, insertIndex) + newCode + '\\n\\n        ' + htmlContent.slice(insertIndex);
    fs.writeFileSync('index.html', htmlContent);
    console.log("Successfully injected Project Schedule logic.");
} else {
    console.log("Could not find insertion point.");
}
