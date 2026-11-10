// Client-Side Mock Router for GitHub Pages & Serverless Deployments
(function () {
    const isGitHubPages = window.location.protocol === 'file:' || 
                         window.location.hostname.includes('github.io') ||
                         window.location.hostname.includes('pages.dev');

    // Only activate on GitHub Pages or file: protocol
    if (!isGitHubPages && !window.FORCE_CLIENT_MODE) {
        console.log('[Mode] Live Backend Mode Active (Flask API)');
        return;
    }

    console.log('[Mode] GitHub Pages Client Mode Active (Serverless In-Browser Database)');

    const DB_KEY = 'promotional_portal_db_v1';

    function getDB() {
        try {
            const stored = localStorage.getItem(DB_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (e) {
            console.warn('Could not read localStorage:', e);
        }

        const initial = window.INITIAL_DB_DATA || {
            products: [],
            team_members: [],
            promotional_items: [],
            activity_log: [],
            budget_settings: []
        };
        saveDB(initial);
        return initial;
    }

    function saveDB(db) {
        try {
            localStorage.setItem(DB_KEY, JSON.stringify(db));
        } catch (e) {
            console.warn('Could not write to localStorage:', e);
        }
    }

    const originalFetch = window.fetch;

    window.fetch = async function (input, init = {}) {
        let url = typeof input === 'string' ? input : (input.url || '');
        const method = (init.method || (typeof input === 'object' && input.method) || 'GET').toUpperCase();

        // If not an API request, use original fetch
        if (!url.includes('/api/')) {
            return originalFetch.apply(this, arguments);
        }

        // Parse path & query params
        const urlObj = new URL(url, window.location.origin);
        const pathname = urlObj.pathname.replace(/^\/promotional-portal/, '');
        const params = urlObj.searchParams;

        let reqBody = {};
        if (init.body) {
            try {
                if (typeof init.body === 'string') {
                    reqBody = JSON.parse(init.body);
                } else if (init.body instanceof FormData) {
                    reqBody = Object.fromEntries(init.body.entries());
                }
            } catch (e) {
                reqBody = {};
            }
        }

        const db = getDB();

        // 1. GET /api/years
        if (pathname === '/api/years' && method === 'GET') {
            const years = Array.from(new Set(db.promotional_items.map(it => it.year || 2027))).sort();
            return makeResponse(years.length ? years : [2027, 2028]);
        }

        // 2. GET /api/items
        if (pathname === '/api/items' && method === 'GET') {
            const year = parseInt(params.get('year') || '2027');
            const planType = params.get('plan_type') || 'All';
            const matType = params.get('material_type') || 'All';
            const month = params.get('month') || 'All';
            const product = params.get('product') || 'All';
            const category = params.get('category') || 'All';
            const status = params.get('status') || 'All';
            const search = (params.get('search') || '').trim().toLowerCase();

            let items = db.promotional_items.filter(it => (it.year || 2027) === year);

            if (planType && planType !== 'All') {
                items = items.filter(it => it.plan_type === planType);
            }
            if (matType && matType !== 'All') {
                items = items.filter(it => it.material_type === matType);
            }
            if (month && month !== 'All') {
                items = items.filter(it => it.month === month);
            }
            if (product && product !== 'All') {
                items = items.filter(it => it.product_name === product);
            }
            if (category && category !== 'All') {
                items = items.filter(it => it.category === category);
            }
            if (status && status !== 'All') {
                items = items.filter(it => it.approval_status === status);
            }
            if (search) {
                items = items.filter(it => 
                    (it.item_name || '').toLowerCase().includes(search) ||
                    (it.category || '').toLowerCase().includes(search) ||
                    (it.sap_code || '').toLowerCase().includes(search) ||
                    (it.legacy_code || '').toLowerCase().includes(search)
                );
            }

            // Populate responsible_name
            const teamMap = {};
            (db.team_members || []).forEach(m => { teamMap[m.id] = m; });
            const result = items.map(it => {
                const member = teamMap[it.responsible_person_id];
                return {
                    ...it,
                    responsible_name: member ? member.name : '',
                    responsible_email: member ? member.email : '',
                    responsible_mobile: member ? member.mobile : ''
                };
            });

            return makeResponse(result);
        }

        // 3. GET /api/items/<id>
        const itemMatch = pathname.match(/^\/api\/items\/(\d+)$/);
        if (itemMatch && method === 'GET') {
            const id = parseInt(itemMatch[1]);
            const item = db.promotional_items.find(it => it.id === id);
            if (!item) return makeResponse({ error: 'Item not found' }, 404);
            return makeResponse({
                ...item,
                comments: (item.comments || [])
            });
        }

        // 4. POST /api/items/<id>/store-update
        const storeMatch = pathname.match(/^\/api\/items\/(\d+)\/store-update$/);
        if (storeMatch && method === 'POST') {
            const id = parseInt(storeMatch[1]);
            const item = db.promotional_items.find(it => it.id === id);
            if (!item) return makeResponse({ error: 'Item not found' }, 404);

            const roleId = reqBody.role_id;
            if (roleId !== undefined && ![1, 6].includes(parseInt(roleId))) {
                return makeResponse({
                    success: false,
                    error: 'Permission denied. Only Md. Rakibuzzaman (Store & Logistics) can enter Store & Dispersion records.'
                }, 403);
            }

            item.store_status = reqBody.store_status || item.store_status || 'Not Received';
            item.received_qty = parseInt(reqBody.received_qty) || 0;
            item.store_in_date = reqBody.store_in_date || '';
            if (item.store_status === 'Fully Received' && !item.received_qty) {
                item.received_qty = item.quantity || 0;
            }

            item.dispersion_status = reqBody.dispersion_status || item.dispersion_status || 'Not Dispersed';
            item.dispersed_qty = parseInt(reqBody.dispersed_qty) || 0;
            item.store_disperse_date = reqBody.store_disperse_date || '';
            if (item.dispersion_status === 'Fully Dispersed' && !item.dispersed_qty) {
                item.dispersed_qty = item.received_qty > 0 ? item.received_qty : (item.quantity || 0);
            }

            db.activity_log.unshift({
                id: Date.now(),
                item_id: id,
                action: 'Store Inventory Update',
                actor_name: reqBody.actor_name || 'Md. Rakibuzzaman (Store & Logistics)',
                details: `Store: ${item.store_status} (${item.received_qty} units on ${item.store_in_date || 'N/A'}) | Dispersion: ${item.dispersion_status}`,
                created_at: new Date().toISOString()
            });

            saveDB(db);
            return makeResponse({
                success: true,
                store_status: item.store_status,
                received_qty: item.received_qty,
                store_in_date: item.store_in_date,
                dispersion_status: item.dispersion_status,
                dispersed_qty: item.dispersed_qty,
                store_disperse_date: item.store_disperse_date
            });
        }

        // 5. POST /api/items/<id>/approve
        const approveMatch = pathname.match(/^\/api\/items\/(\d+)\/approve$/);
        if (approveMatch && method === 'POST') {
            const id = parseInt(approveMatch[1]);
            const item = db.promotional_items.find(it => it.id === id);
            if (!item) return makeResponse({ error: 'Item not found' }, 404);

            const newStatus = reqBody.approval_status || (item.approval_status === 'Approved' ? 'Pending' : 'Approved');
            item.approval_status = newStatus;
            item.approved_by = newStatus === 'Approved' ? (reqBody.actor_name || 'Md. Didarul Islam') : '';
            item.approval_date = newStatus === 'Approved' ? new Date().toISOString().split('T')[0] : '';

            db.activity_log.unshift({
                id: Date.now(),
                item_id: id,
                action: 'Approval Status Change',
                actor_name: reqBody.actor_name || 'Md. Didarul Islam',
                details: `Changed approval status to: ${newStatus}`,
                created_at: new Date().toISOString()
            });

            saveDB(db);
            return makeResponse({ success: true, approval_status: newStatus });
        }

        // 6. PUT /api/items/<id> (Update item)
        if (itemMatch && method === 'PUT') {
            const id = parseInt(itemMatch[1]);
            const item = db.promotional_items.find(it => it.id === id);
            if (!item) return makeResponse({ error: 'Item not found' }, 404);

            Object.assign(item, reqBody);
            const qty = parseInt(item.quantity) || 0;
            const unitPrice = parseFloat(item.unit_price) || 0;
            item.total_price = qty * unitPrice;

            db.activity_log.unshift({
                id: Date.now(),
                item_id: id,
                action: 'Updated',
                actor_name: reqBody.actor_name || 'Md. Didarul Islam',
                details: `Updated item #${id}: ${item.item_name || item.category}`,
                created_at: new Date().toISOString()
            });

            saveDB(db);
            return makeResponse({ success: true });
        }

        // 7. POST /api/items (Add Special Item)
        if (pathname === '/api/items' && method === 'POST') {
            const newId = (db.promotional_items.reduce((max, it) => Math.max(max, it.id || 0), 0) || 0) + 1;
            const qty = parseInt(reqBody.quantity) || 0;
            const unitPrice = parseFloat(reqBody.unit_price) || 0;
            const newItem = {
                id: newId,
                product_id: reqBody.product_id || 1,
                product_name: reqBody.product_name || 'Exium',
                material_type: reqBody.material_type || 'BR',
                category: reqBody.category || 'Special BR',
                plan_type: reqBody.plan_type || 'Special',
                item_name: (reqBody.item_name || '').trim(),
                item_description: reqBody.item_description || '',
                approval_note: reqBody.approval_note || '',
                month: reqBody.month || 'Jan',
                month_num: reqBody.month_num || 1,
                year: parseInt(reqBody.year) || 2027,
                sap_code: reqBody.sap_code || '',
                legacy_code: reqBody.legacy_code || '',
                quantity: qty,
                unit_price: unitPrice,
                total_price: qty * unitPrice,
                approval_status: reqBody.approval_status || 'Approved',
                po_status: reqBody.po_status || 'Not Initiated',
                po_number: reqBody.po_number || '',
                po_date: reqBody.po_date || '',
                expected_arrival_date: reqBody.expected_arrival_date || '',
                delivery_date: reqBody.delivery_date || '',
                allocation_status: reqBody.allocation_status || 'Pending',
                allocation_notes: reqBody.allocation_notes || '',
                packaging_status: 'Not Applicable',
                store_status: reqBody.store_status || 'Not Received',
                received_qty: 0,
                store_in_date: '',
                dispersion_status: reqBody.dispersion_status || 'Not Dispersed',
                dispersed_qty: 0,
                store_disperse_date: '',
                store_remarks: '',
                responsible_person_id: reqBody.responsible_person_id || null,
                item_image: reqBody.item_image || ''
            };

            db.promotional_items.unshift(newItem);
            db.activity_log.unshift({
                id: Date.now(),
                item_id: newId,
                action: 'Created',
                actor_name: reqBody.actor_name || 'Md. Didarul Islam',
                details: `Created Special item: ${newItem.item_name || newItem.category} for ${newItem.product_name}`,
                created_at: new Date().toISOString()
            });

            saveDB(db);
            return makeResponse({ success: true, id: newId });
        }

        // 8. GET /api/dashboard
        if (pathname === '/api/dashboard' && method === 'GET') {
            const year = parseInt(params.get('year') || '2027');
            const items = db.promotional_items.filter(it => (it.year || 2027) === year);

            const totalBudget = 168000000;
            let totalExpense = 0;
            let approvedExpense = 0;
            let approvedCount = 0;
            let pendingCount = 0;
            let poIssuedCount = 0;
            let inWarehouseCount = 0;
            let dispersedCount = 0;
            let finalizedItemsCount = 0;

            const monthlyData = {};
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            months.forEach(m => { monthlyData[m] = { expense: 0, items: 0 }; });

            const categoriesData = {};

            items.forEach(it => {
                const hasName = it.item_name && it.item_name.trim() !== '';
                const price = parseFloat(it.total_price) || 0;

                if (hasName) {
                    totalExpense += price;
                    finalizedItemsCount++;
                    if (it.approval_status === 'Approved') {
                        approvedExpense += price;
                    }
                    if (monthlyData[it.month]) {
                        monthlyData[it.month].expense += price;
                        monthlyData[it.month].items++;
                    }
                    const cat = it.category || 'Other';
                    categoriesData[cat] = (categoriesData[cat] || 0) + price;
                }

                if (it.approval_status === 'Approved') approvedCount++;
                if (it.approval_status === 'Pending') pendingCount++;
                if (it.po_status === 'PO Issued') poIssuedCount++;
                if (['In Warehouse', 'Partly Received', 'Fully Received'].includes(it.store_status)) inWarehouseCount++;
                if (['Partly Dispersed', 'Fully Dispersed'].includes(it.dispersion_status) || it.store_status === 'Fully Dispersed') dispersedCount++;
            });

            const remainingBudget = totalBudget - totalExpense;

            return makeResponse({
                year: year,
                total_budget: totalBudget,
                total_expense: totalExpense,
                approved_expense: approvedExpense,
                remaining_budget: remainingBudget,
                budget_utilization_pct: totalBudget > 0 ? (totalExpense / totalBudget) * 100 : 0,
                total_items_count: items.length,
                finalized_items_count: finalizedItemsCount,
                approved_count: approvedCount,
                pending_count: pendingCount,
                po_issued_count: poIssuedCount,
                in_warehouse_count: inWarehouseCount,
                dispersed_count: dispersedCount,
                brand_breakdown: {
                    'Exium': { budget: 110000000, planned: 0, percentage: 0, items_count: 0 },
                    'Exium MUPS': { budget: 58000000, planned: 0, percentage: 0, items_count: 0 }
                },
                monthly_data: months.map(m => ({
                    month: m,
                    expense: monthlyData[m].expense,
                    items_count: monthlyData[m].items
                })),
                categories_data: Object.keys(categoriesData).map(k => ({
                    category: k,
                    total_expense: categoriesData[k]
                })),
                recent_activities: (db.activity_log || []).slice(0, 15)
            });
        }

        // 9. GET /api/team
        if (pathname === '/api/team' && method === 'GET') {
            return makeResponse(db.team_members || []);
        }

        // 10. POST /api/items/<id>/comments
        const commentMatch = pathname.match(/^\/api\/items\/(\d+)\/comments$/);
        if (commentMatch && method === 'POST') {
            const id = parseInt(commentMatch[1]);
            const item = db.promotional_items.find(it => it.id === id);
            if (!item) return makeResponse({ error: 'Item not found' }, 404);

            if (!item.comments) item.comments = [];
            item.comments.push({
                id: Date.now(),
                user_name: reqBody.user_name || 'User',
                user_role: reqBody.user_role || 'Team Member',
                comment: reqBody.comment || '',
                created_at: new Date().toISOString()
            });

            saveDB(db);
            return makeResponse({ success: true });
        }

        // 11. POST /api/upload
        if (pathname === '/api/upload' && method === 'POST') {
            return makeResponse({
                success: true,
                filename: 'exium_logo.png',
                url: 'static/uploads/exium_logo.png'
            });
        }

        // 12. GET /api/export/excel or /api/export/csv
        if (pathname.startsWith('/api/export/')) {
            const year = parseInt(params.get('year') || '2027');
            const items = db.promotional_items.filter(it => (it.year || 2027) === year);

            if (window.XLSX) {
                const sheetData = items.map((r, idx) => ({
                    "SL": idx + 1,
                    "Brand": r.product_name || '',
                    "Plan": r.plan_type || 'Regular',
                    "Material": r.material_type || '',
                    "Item Category": r.category || '',
                    "Month": `${r.month} ${r.year}`,
                    "Item Name": r.item_name || '',
                    "SAP Code": r.sap_code || '',
                    "Legacy Code": r.legacy_code || '',
                    "Quantity": r.quantity || 0,
                    "Unit Price (BDT)": r.unit_price || 0,
                    "Total Price (BDT)": r.total_price || 0,
                    "Approval Status": r.approval_status || 'Pending',
                    "Approval Ref / Purpose": r.approval_note || '',
                    "PMMD Lead": r.responsible_name || '',
                    "PO Status": r.po_status || 'Not Initiated',
                    "PO Number": r.po_number || '',
                    "PO Date": r.po_date || '',
                    "Delivery Date": r.delivery_date || '',
                    "Store Status": r.store_status || 'Not Received',
                    "Received Qty": r.received_qty || 0,
                    "Store-In Date": r.store_in_date || '',
                    "Dispersion Status": r.dispersion_status || 'Not Dispersed',
                    "Dispersed Qty": r.dispersed_qty || 0,
                    "Dispersion Date": r.store_disperse_date || ''
                }));

                const wb = XLSX.utils.book_new();
                const ws = XLSX.utils.json_to_sheet(sheetData);
                XLSX.utils.book_append_sheet(wb, ws, `Plan ${year}`);
                XLSX.writeFile(wb, `Promotional_Plan_${year}.xlsx`);
                return makeResponse({ success: true, message: 'Excel downloaded' });
            }
        }

        // Default 404 for unknown APIs
        return makeResponse({ error: 'Endpoint not supported in client mode' }, 404);
    };

    function makeResponse(data, status = 200) {
        return new Response(JSON.stringify(data), {
            status: status,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
})();
