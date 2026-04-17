const fs = require('fs');

const htmlContent = fs.readFileSync('index.html', 'utf8');

const newCode = `
            // Calculate totals from Manila and Local records
            const mnlRecords = manilaRecords.filter(r => r.projectId === currentProjectId);
            const lclRecords = localRecords.filter(r => r.projectId === currentProjectId);
            const allRecords = [...mnlRecords, ...lclRecords];

            let totalActualExpense = 0;
            
            allRecords.forEach(record => {
                if (!record.subtaskCharging) return;
                const match = record.subtaskCharging.match(/^([A-D][0-9.]+)/);
                if (match) {
                    const amount = parseFloat(record.actualAmount) || parseFloat(record.totalCost) || 0;
                    totalActualExpense += amount;
                }
            });

            let minTargetStart = null;
            let maxTargetEnd = null;
            let totalWeightedProgress = 0;
            let totalBudgetForProgress = 0;

            subtaskChargingOptions.forEach(opt => {
                const match = opt.match(/^([A-D])([0-9.]+)\\s*-\\s*(.*?)(?:\\s*\\(.*\\))?$/);
                if (match) {
                    const code = match[1] + match[2];
                    const budget = projectBudgets[code] || 0;
                    const data = scheduleData[code] || {};
                    
                    if (data.targetStart) {
                        const d = new Date(data.targetStart);
                        if (!isNaN(d.getTime())) {
                            if (!minTargetStart || d < minTargetStart) minTargetStart = d;
                        }
                    }
                    if (data.targetEnd) {
                        const d = new Date(data.targetEnd);
                        if (!isNaN(d.getTime())) {
                            if (!maxTargetEnd || d > maxTargetEnd) maxTargetEnd = d;
                        }
                    }

                    if (budget > 0) {
                        totalBudgetForProgress += budget;
                        let pct = 0;
                        if (data.status === 'Completed') {
                            pct = 1;
                        } else if (data.targetQty && data.actualQty) {
                            pct = Math.min(1, parseFloat(data.actualQty) / parseFloat(data.targetQty));
                        }
                        totalWeightedProgress += pct * budget;
                    }
                }
            });

            const formatDate = (date) => {
                if (!date) return '—';
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            };

            const overallProgressPct = totalBudgetForProgress > 0 ? (totalWeightedProgress / totalBudgetForProgress) * 100 : 0;
            const budgetUtilizationPct = totalProjectBudget > 0 ? (totalActualExpense / totalProjectBudget) * 100 : 0;
`;

// Find where to insert this code. Before `const renderStatusBadge`
const insertIndex = htmlContent.indexOf('const renderStatusBadge = (status) => {');

if (insertIndex !== -1) {
    let modifiedHtml = htmlContent.slice(0, insertIndex) + newCode + '\\n            ' + htmlContent.slice(insertIndex);
    
    // Now replace the hardcoded values in the template
    modifiedHtml = modifiedHtml.replace(
        '<div style="font-size: 1.25rem; font-weight: 800; color: var(--text-main);">₱0.00</div>',
        '<div style="font-size: 1.25rem; font-weight: 800; color: var(--text-main);">₱${totalActualExpense.toLocaleString(\'en-PH\', {minimumFractionDigits: 2})}</div>'
    );
    
    modifiedHtml = modifiedHtml.replace(
        '<div style="font-size: 1.25rem; font-weight: 800; color: var(--text-main);">Feb 2, 2026</div>',
        '<div style="font-size: 1.25rem; font-weight: 800; color: var(--text-main);">${formatDate(minTargetStart)}</div>'
    );
    
    modifiedHtml = modifiedHtml.replace(
        '<div style="font-size: 1.25rem; font-weight: 800; color: var(--text-main);">May 30, 2026</div>',
        '<div style="font-size: 1.25rem; font-weight: 800; color: var(--text-main);">${formatDate(maxTargetEnd)}</div>'
    );
    
    modifiedHtml = modifiedHtml.replace(
        '<span style="font-size: 1.1rem; font-weight: 800; color: var(--text-main);">5.1%</span>',
        '<span style="font-size: 1.1rem; font-weight: 800; color: var(--text-main);">${overallProgressPct.toFixed(1)}%</span>'
    );
    
    modifiedHtml = modifiedHtml.replace(
        '<div style="height: 100%; width: 5.1%; background: #3b82f6; border-radius: 4px;"></div>',
        '<div style="height: 100%; width: ${overallProgressPct}%; background: #3b82f6; border-radius: 4px;"></div>'
    );
    
    modifiedHtml = modifiedHtml.replace(
        '<span style="font-size: 1.1rem; font-weight: 800; color: var(--text-main);">0.0%</span>',
        '<span style="font-size: 1.1rem; font-weight: 800; color: var(--text-main);">${budgetUtilizationPct.toFixed(1)}%</span>'
    );
    
    modifiedHtml = modifiedHtml.replace(
        '<div style="height: 100%; width: 0%; background: #10b981; border-radius: 4px;"></div>',
        '<div style="height: 100%; width: ${budgetUtilizationPct}%; background: #10b981; border-radius: 4px;"></div>'
    );

    fs.writeFileSync('index.html', modifiedHtml);
    console.log("Successfully updated dynamic values.");
} else {
    console.log("Could not find insertion point.");
}
