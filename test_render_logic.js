
    let currentBoqTab = 'Paid';
    let boqSearchQuery = '';
    const formatCurrency = (val) => val;
    let boqExpandedParents = {};
    
    const tree = {
        'A': { title: 'BIDDING', color: '#3b82f6', items: [], budget: 0, paid: 0, unpaid: 0, total: 0, remaining: 0 },
        'B': { title: 'PRE-DEV', color: '#a855f7', items: [], budget: 0, paid: 0, unpaid: 0, total: 0, remaining: 0 }
    };
    
    // Add an item to A with paid = 0
    tree['A'].items.push({
        code: 'A1', name: 'Test A1', budget: 100, paid: 0, unpaid: 0, total: 0, remaining: 100, isParent: false
    });
    
    // Add an item to B with paid = 50
    tree['B'].items.push({
        code: 'B1', name: 'Test B1', budget: 100, paid: 50, unpaid: 0, total: 50, remaining: 50, isParent: false
    });

    const renderRow = (item, isSub = false) => {
        if (currentBoqTab === 'Paid' && item.paid === 0) return '';
        if (currentBoqTab === 'Unpaid' && item.unpaid === 0) return '';
        if (boqSearchQuery) {
            const q = boqSearchQuery.toLowerCase();
            if (!item.code.toLowerCase().includes(q) && !item.name.toLowerCase().includes(q)) {
                if (item.isParent) {
                    const hasMatch = item.subItems.some(sub => sub.code.toLowerCase().includes(q) || sub.name.toLowerCase().includes(q));
                    if (!hasMatch) return '';
                    item.expanded = true;
                } else {
                    return '';
                }
            }
        }

        if (item.isParent) {
            let subHtml = '';
            if (item.expanded) {
                subHtml = item.subItems.map(sub => renderRow(sub, true)).join('');
            } else {
                const hasVisibleSub = item.subItems.some(sub => {
                    if (currentBoqTab === 'Paid' && sub.paid === 0) return false;
                    if (currentBoqTab === 'Unpaid' && sub.unpaid === 0) return false;
                    return true;
                });
            }
            
            if (!subHtml && boqSearchQuery && !item.expanded) {
            } else if (!subHtml && boqSearchQuery) {
                return '';
            }
            
            return '<tr class="parent">...</tr>' + subHtml;
        }

        return '<tr class="child">...</tr>';
    };

    let html = '';
    Object.values(tree).forEach(cat => {
        let catHtml = cat.items.map(item => renderRow(item)).join('');
        if (!catHtml) return; // Skip empty categories

        html += '<div class="category">' + cat.title + catHtml + '</div>';
    });
    
    console.log("HTML Output:", html);
