import os
import sqlite3
import datetime
from flask import Flask, request, jsonify, send_from_directory, send_file
import io
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from werkzeug.utils import secure_filename

app = Flask(__name__, static_folder='static')
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'promotional.db')
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'static', 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,PATCH,DELETE,OPTIONS')
    return response

@app.route('/')
def index():
    if os.path.exists('index.html'):
        return send_file('index.html')
    return send_from_directory('static', 'index.html')

@app.route('/uploads/<path:filename>')
@app.route('/static/uploads/<path:filename>')
def serve_upload(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# ----------------- YEARS API -----------------
@app.route('/api/years', methods=['GET'])
def get_years():
    conn = get_db()
    c = conn.cursor()
    years = c.execute('SELECT DISTINCT year FROM promotional_items ORDER BY year ASC').fetchall()
    year_list = [y['year'] for y in years]
    if not year_list:
        year_list = [2027, 2028]
    conn.close()
    return jsonify(year_list)

@app.route('/api/years/initialize', methods=['POST'])
def initialize_year():
    data = request.json or {}
    target_year = int(data.get('year', 2028))
    source_year = int(data.get('source_year', 2027))

    conn = get_db()
    c = conn.cursor()

    existing = c.execute('SELECT COUNT(*) FROM promotional_items WHERE year = ?', (target_year,)).fetchone()[0]
    if existing > 0:
        conn.close()
        return jsonify({'error': f'Year {target_year} already has promotional items.'}), 400

    # Clone category slots from source year with blank item names (Regular plan structure)
    slots = c.execute('''
        SELECT product_id, product_name, material_type, category, month, month_num,
               quantity, unit_price, total_price, responsible_person_id
        FROM promotional_items
        WHERE year = ? AND (plan_type = 'Regular' OR plan_type IS NULL)
    ''', (source_year,)).fetchall()

    for s in slots:
        c.execute('''
            INSERT INTO promotional_items (
                product_id, product_name, material_type, category, plan_type, item_name,
                month, month_num, year, quantity, unit_price, total_price,
                responsible_person_id
            ) VALUES (?, ?, ?, ?, 'Regular', '', ?, ?, ?, ?, ?, ?, ?)
        ''', (
            s['product_id'], s['product_name'], s['material_type'], s['category'],
            s['month'], s['month_num'], target_year, s['quantity'], s['unit_price'], s['total_price'],
            None
        ))

    # Add default budget for target year
    c.execute('''
        INSERT OR IGNORE INTO budget_settings (year, total_budget, br_budget, ppm_budget, exium_budget, exium_mups_budget, notes)
        VALUES (?, 175000000.0, 102000000.0, 73000000.0, 115000000.0, 60000000.0, ?)
    ''', (target_year, f'Promotional Budget for {target_year}'))

    c.execute('''
        INSERT INTO activity_log (action, actor_name, details)
        VALUES ('Year Initialized', ?, ?)
    ''', (data.get('actor_name', 'Md. Didarul Islam'), f"Initialized {len(slots)} promotional items for year {target_year}."))

    conn.commit()
    conn.close()
    return jsonify({'success': True, 'count': len(slots)})

# ----------------- DASHBOARD API -----------------
@app.route('/api/dashboard', methods=['GET'])
def get_dashboard():
    year = int(request.args.get('year', 2027))
    material_type = request.args.get('material_type', 'All') # 'All', 'BR', 'PPM'

    conn = get_db()
    c = conn.cursor()

    budget_row = c.execute('SELECT * FROM budget_settings WHERE year = ?', (year,)).fetchone()
    if not budget_row:
        total_budget = 168000000.0
        br_budget = 97110000.0
        ppm_budget = 70890000.0
        exium_budget = 110000000.0
        exium_mups_budget = 58000000.0
    else:
        total_budget = float(budget_row['total_budget'] or 168000000.0)
        br_budget = float(budget_row['br_budget'] or 97110000.0)
        ppm_budget = float(budget_row['ppm_budget'] or 70890000.0)
        exium_budget = float(budget_row['exium_budget'] or 110000000.0)
        exium_mups_budget = float(budget_row['exium_mups_budget'] or 58000000.0)

    # Effective budget based on material_type filter
    effective_budget = total_budget
    if material_type == 'BR':
        effective_budget = br_budget if br_budget > 0 else 97110000.0
    elif material_type == 'PPM':
        effective_budget = ppm_budget if ppm_budget > 0 else 70890000.0

    mat_filter = ""
    params = [year]
    if material_type in ['BR', 'PPM']:
        mat_filter = " AND material_type = ?"
        params.append(material_type)

    totals = c.execute(f'''
        SELECT 
            COUNT(*) as total_items,
            SUM(CASE WHEN item_name IS NOT NULL AND TRIM(item_name) != '' THEN total_price ELSE 0 END) as total_expense,
            SUM(CASE WHEN (item_name IS NOT NULL AND TRIM(item_name) != '') AND approval_status = 'Approved' THEN total_price ELSE 0 END) as approved_expense,
            SUM(CASE WHEN approval_status = 'Approved' THEN 1 ELSE 0 END) as approved_count,
            SUM(CASE WHEN approval_status = 'Pending' THEN 1 ELSE 0 END) as pending_count,
            SUM(CASE WHEN po_status = 'PO Issued' THEN 1 ELSE 0 END) as po_issued_count,
            SUM(CASE WHEN store_status IN ('In Warehouse', 'Partly Received', 'Fully Received') THEN 1 ELSE 0 END) as in_warehouse_count,
            SUM(CASE WHEN dispersion_status IN ('Partly Dispersed', 'Fully Dispersed') OR store_status = 'Fully Dispersed' THEN 1 ELSE 0 END) as dispersed_count,
            SUM(CASE WHEN item_name IS NOT NULL AND TRIM(item_name) != '' THEN 1 ELSE 0 END) as finalized_items_count
        FROM promotional_items
        WHERE year = ? {mat_filter}
    ''', params).fetchone()

    total_expense = float(totals['total_expense'] or 0)
    approved_expense = float(totals['approved_expense'] or 0)
    remaining_budget = effective_budget - total_expense

    # Regular vs Special Plan totals
    plan_totals = c.execute('''
        SELECT 
            SUM(CASE WHEN plan_type = 'Special' AND item_name IS NOT NULL AND TRIM(item_name) != '' THEN total_price ELSE 0 END) as special_exp,
            SUM(CASE WHEN (plan_type = 'Regular' OR plan_type IS NULL) AND item_name IS NOT NULL AND TRIM(item_name) != '' THEN total_price ELSE 0 END) as regular_exp,
            SUM(CASE WHEN plan_type = 'Special' THEN 1 ELSE 0 END) as special_cnt,
            SUM(CASE WHEN plan_type = 'Regular' OR plan_type IS NULL THEN 1 ELSE 0 END) as regular_cnt,
            SUM(CASE WHEN plan_type = 'Special' AND approval_status = 'Approved' AND item_name IS NOT NULL AND TRIM(item_name) != '' THEN total_price ELSE 0 END) as special_approved_exp
        FROM promotional_items
        WHERE year = ?
    ''', (year,)).fetchone()

    # Split between BR & PPM - Expenses calculated only for items with names selected
    br_totals = c.execute('''
        SELECT SUM(CASE WHEN item_name IS NOT NULL AND TRIM(item_name) != '' THEN total_price ELSE 0 END) as exp, COUNT(*) as cnt 
        FROM promotional_items WHERE year = ? AND material_type = "BR"
    ''', (year,)).fetchone()
    ppm_totals = c.execute('''
        SELECT SUM(CASE WHEN item_name IS NOT NULL AND TRIM(item_name) != '' THEN total_price ELSE 0 END) as exp, COUNT(*) as cnt 
        FROM promotional_items WHERE year = ? AND material_type = "PPM"
    ''', (year,)).fetchone()

    # Product breakdown
    prod_expenses = c.execute(f'''
        SELECT product_name, 
               SUM(CASE WHEN item_name IS NOT NULL AND TRIM(item_name) != '' THEN total_price ELSE 0 END) as expense, 
               COUNT(*) as items_count,
               SUM(CASE WHEN (item_name IS NOT NULL AND TRIM(item_name) != '') AND approval_status = 'Approved' THEN total_price ELSE 0 END) as approved_expense
        FROM promotional_items
        WHERE year = ? {mat_filter}
        GROUP BY product_name
    ''', params).fetchall()

    brand_breakdown = []
    for pe in prod_expenses:
        p_name = pe['product_name']
        b_target = exium_budget if p_name == 'Exium' else (exium_mups_budget if p_name == 'Exium MUPS' else 0)
        exp = float(pe['expense'] or 0)
        brand_breakdown.append({
            'brand': p_name,
            'budget': b_target,
            'expense': exp,
            'approved_expense': float(pe['approved_expense'] or 0),
            'remaining': b_target - exp,
            'items_count': pe['items_count']
        })

    # Month-wise breakdown (Jan to Dec)
    months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    monthly_data = []
    for i, m in enumerate(months):
        m_params = [year, m]
        m_mat_filter = ""
        if material_type in ['BR', 'PPM']:
            m_mat_filter = " AND material_type = ?"
            m_params.append(material_type)

        m_rows = c.execute(f'''
            SELECT 
                SUM(CASE WHEN product_name = 'Exium' AND item_name IS NOT NULL AND TRIM(item_name) != '' THEN total_price ELSE 0 END) as exium_exp,
                SUM(CASE WHEN product_name = 'Exium MUPS' AND item_name IS NOT NULL AND TRIM(item_name) != '' THEN total_price ELSE 0 END) as mups_exp,
                SUM(CASE WHEN item_name IS NOT NULL AND TRIM(item_name) != '' THEN total_price ELSE 0 END) as total_exp,
                SUM(CASE WHEN approval_status = 'Approved' AND item_name IS NOT NULL AND TRIM(item_name) != '' THEN total_price ELSE 0 END) as approved_exp,
                COUNT(*) as count
            FROM promotional_items
            WHERE year = ? AND month = ? {m_mat_filter}
        ''', m_params).fetchone()

        monthly_data.append({
            'month': m,
            'month_num': i+1,
            'exium_expense': float(m_rows['exium_exp'] or 0),
            'mups_expense': float(m_rows['mups_exp'] or 0),
            'total_expense': float(m_rows['total_exp'] or 0),
            'approved_expense': float(m_rows['approved_exp'] or 0),
            'items_count': m_rows['count'] or 0
        })

    # Category breakdown
    cat_expenses = c.execute(f'''
        SELECT category, material_type, 
               SUM(CASE WHEN item_name IS NOT NULL AND TRIM(item_name) != '' THEN total_price ELSE 0 END) as expense, 
               SUM(CASE WHEN item_name IS NOT NULL AND TRIM(item_name) != '' THEN quantity ELSE 0 END) as total_qty, 
               COUNT(*) as count
        FROM promotional_items
        WHERE year = ? {mat_filter}
        GROUP BY category
        ORDER BY expense DESC
    ''', params).fetchall()

    recent_activities = c.execute('SELECT * FROM activity_log ORDER BY id DESC LIMIT 8').fetchall()
    conn.close()

    return jsonify({
        'year': year,
        'material_type': material_type,
        'total_budget': effective_budget,
        'overall_annual_budget': total_budget,
        'br_budget': br_budget,
        'ppm_budget': ppm_budget,
        'br_expense': float(br_totals['exp'] or 0),
        'ppm_expense': float(ppm_totals['exp'] or 0),
        'br_count': br_totals['cnt'] or 0,
        'ppm_count': ppm_totals['cnt'] or 0,
        'total_expense': total_expense,
        'approved_expense': approved_expense,
        'remaining_budget': remaining_budget,
        'regular_expense': float(plan_totals['regular_exp'] or 0),
        'special_expense': float(plan_totals['special_exp'] or 0),
        'regular_count': plan_totals['regular_cnt'] or 0,
        'special_count': plan_totals['special_cnt'] or 0,
        'special_approved_expense': float(plan_totals['special_approved_exp'] or 0),
        'plan_totals': {
            'regular_expense': float(plan_totals['regular_exp'] or 0),
            'special_expense': float(plan_totals['special_exp'] or 0),
            'regular_count': plan_totals['regular_cnt'] or 0,
            'special_count': plan_totals['special_cnt'] or 0,
            'special_approved_expense': float(plan_totals['special_approved_exp'] or 0)
        },
        'budget_utilization_pct': round((total_expense / effective_budget) * 100, 1) if effective_budget else 0,
        'total_items_count': totals['total_items'] or 0,
        'finalized_items_count': totals['finalized_items_count'] or 0,
        'approved_count': totals['approved_count'] or 0,
        'pending_count': totals['pending_count'] or 0,
        'po_issued_count': totals['po_issued_count'] or 0,
        'in_warehouse_count': totals['in_warehouse_count'] or 0,
        'dispersed_count': totals['dispersed_count'] or 0,
        'brand_breakdown': brand_breakdown,
        'monthly_data': monthly_data,
        'categories_data': [dict(row) for row in cat_expenses],
        'recent_activities': [dict(r) for r in recent_activities]
    })

# ----------------- ITEMS API -----------------
@app.route('/api/items', methods=['GET'])
def list_items():
    year = int(request.args.get('year', 2027))
    plan_type = request.args.get('plan_type', 'All') # 'All', 'Regular', 'Special'
    material_type = request.args.get('material_type', 'All') # 'All', 'BR', 'PPM'
    month = request.args.get('month', 'All')
    product = request.args.get('product', 'All')
    category = request.args.get('category', 'All')
    status = request.args.get('status', 'All')
    responsible_id = request.args.get('responsible_id', 'All')
    search = request.args.get('search', '').strip()

    conn = get_db()
    c = conn.cursor()

    query = '''
        SELECT p.*, 
               m.name as responsible_name, m.email as responsible_email, m.mobile as responsible_mobile,
               d.name as designer_name
        FROM promotional_items p
        LEFT JOIN team_members m ON p.responsible_person_id = m.id
        LEFT JOIN team_members d ON p.packaging_designer_id = d.id
        WHERE p.year = ?
    '''
    params = [year]

    if plan_type in ['Regular', 'Special']:
        query += ' AND (p.plan_type = ?)'
        params.append(plan_type)
    if material_type in ['BR', 'PPM']:
        query += ' AND p.material_type = ?'
        params.append(material_type)
    if month and month != 'All':
        query += ' AND p.month = ?'
        params.append(month)
    if product and product != 'All':
        query += ' AND p.product_name = ?'
        params.append(product)
    if category and category != 'All':
        query += ' AND p.category = ?'
        params.append(category)
    if status and status != 'All':
        query += ' AND p.approval_status = ?'
        params.append(status)
    if responsible_id and responsible_id != 'All':
        query += ' AND p.responsible_person_id = ?'
        params.append(int(responsible_id))
    if search:
        query += ''' AND (
            p.item_name LIKE ? OR 
            p.sap_code LIKE ? OR 
            p.legacy_code LIKE ? OR 
            p.po_number LIKE ? OR
            p.category LIKE ?
        )'''
        term = f'%{search}%'
        params.extend([term, term, term, term, term])

    query += ' ORDER BY p.month_num ASC, p.material_type ASC, p.product_name ASC, p.id ASC'
    rows = c.execute(query, params).fetchall()
    conn.close()

    return jsonify([dict(r) for r in rows])

@app.route('/api/items/<int:item_id>', methods=['GET'])
def get_item(item_id):
    conn = get_db()
    c = conn.cursor()
    row = c.execute('''
        SELECT p.*, 
               m.name as responsible_name, m.email as responsible_email, m.mobile as responsible_mobile,
               d.name as designer_name
        FROM promotional_items p
        LEFT JOIN team_members m ON p.responsible_person_id = m.id
        LEFT JOIN team_members d ON p.packaging_designer_id = d.id
        WHERE p.id = ?
    ''', (item_id,)).fetchone()

    if not row:
        conn.close()
        return jsonify({'error': 'Item not found'}), 404

    comments = c.execute('SELECT * FROM item_comments WHERE item_id = ? ORDER BY id ASC', (item_id,)).fetchall()
    activities = c.execute('SELECT * FROM activity_log WHERE item_id = ? ORDER BY id DESC', (item_id,)).fetchall()
    conn.close()

    item_dict = dict(row)
    item_dict['comments'] = [dict(cm) for cm in comments]
    item_dict['activities'] = [dict(act) for act in activities]
    return jsonify(item_dict)

@app.route('/api/items', methods=['POST'])
def create_item():
    data = request.json or {}
    conn = get_db()
    c = conn.cursor()

    qty = int(data.get('quantity', 0))
    unit_p = float(data.get('unit_price', 0))
    total_p = qty * unit_p

    month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    m_name = data.get('month', 'Jan')
    m_num = month_names.index(m_name) + 1 if m_name in month_names else 1
    plan_type = data.get('plan_type', 'Regular')
    approval_status = data.get('approval_status', 'Pending')

    raw_resp_id = data.get('responsible_person_id')
    responsible_person_id = None
    if raw_resp_id not in ['', None, 0, '0', 'null']:
        try:
            responsible_person_id = int(raw_resp_id)
        except (ValueError, TypeError):
            responsible_person_id = None

    c.execute('''
        INSERT INTO promotional_items (
            product_id, product_name, material_type, category, plan_type, item_name, item_description,
            month, month_num, year, sap_code, legacy_code,
            quantity, unit_price, total_price,
            approval_status, approval_note, po_status, po_number, po_date,
            expected_arrival_date, delivery_date,
            allocation_status, allocation_notes,
            packaging_status, packaging_designer_id,
            store_status, received_qty, store_in_date, dispersion_status, dispersed_qty, store_disperse_date, store_remarks,
            responsible_person_id, item_image
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        data.get('product_id', 1), data.get('product_name', 'Exium'),
        data.get('material_type', 'BR'), data.get('category', 'Special BR'),
        plan_type,
        data.get('item_name', '').strip(), data.get('item_description', ''),
        m_name, m_num, data.get('year', 2027),
        data.get('sap_code', ''), data.get('legacy_code', ''),
        qty, unit_p, total_p,
        approval_status, data.get('approval_note', ''),
        data.get('po_status', 'Not Initiated'), data.get('po_number', ''), data.get('po_date', ''),
        data.get('expected_arrival_date', ''), data.get('delivery_date', ''),
        data.get('allocation_status', 'Pending'), data.get('allocation_notes', ''),
        data.get('packaging_status', 'Not Applicable'), data.get('packaging_designer_id', 5),
        data.get('store_status', 'Not Received'), int(data.get('received_qty', 0) or 0), data.get('store_in_date', ''),
        data.get('dispersion_status', 'Not Dispersed'), int(data.get('dispersed_qty', 0) or 0), data.get('store_disperse_date', ''), data.get('store_remarks', ''),
        responsible_person_id, data.get('item_image', '')
    ))

    new_id = c.lastrowid
    actor = data.get('actor_name', 'Md. Didarul Islam')
    c.execute('INSERT INTO activity_log (item_id, action, actor_name, details) VALUES (?, "Created", ?, ?)',
              (new_id, actor, f"Created {plan_type} item: {data.get('item_name') or data.get('category')} for {data.get('product_name')} ({total_p:,.0f})"))

    conn.commit()
    conn.close()
    return jsonify({'success': True, 'id': new_id})

@app.route('/api/items/<int:item_id>', methods=['PUT'])
def update_item(item_id):
    data = request.json or {}
    conn = get_db()
    c = conn.cursor()

    current = c.execute('SELECT * FROM promotional_items WHERE id = ?', (item_id,)).fetchone()
    if not current:
        conn.close()
        return jsonify({'error': 'Item not found'}), 404

    qty = int(data.get('quantity', current['quantity']))
    unit_p = float(data.get('unit_price', current['unit_price']))
    total_p = qty * unit_p

    month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    m_name = data.get('month', current['month'])
    m_num = month_names.index(m_name) + 1 if m_name in month_names else current['month_num']

    now_str = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    if 'responsible_person_id' in data:
        raw_resp_id = data.get('responsible_person_id')
        if raw_resp_id in ['', None, 0, '0', 'null']:
            responsible_person_id = None
        else:
            try:
                responsible_person_id = int(raw_resp_id)
            except (ValueError, TypeError):
                responsible_person_id = None
    else:
        responsible_person_id = current['responsible_person_id']

    role_id = data.get('role_id')
    can_edit_store = (int(role_id) in [1, 6]) if role_id is not None else True

    if can_edit_store:
        st_status = data.get('store_status', current['store_status'] or 'Not Received')
        rec_qty = int(data.get('received_qty', current['received_qty'] or 0) or 0)
        st_in_date = data.get('store_in_date', current['store_in_date'] or '')
        if st_status == 'Fully Received' and rec_qty == 0:
            rec_qty = qty
        elif st_status == 'Not Received':
            st_in_date = ''
            rec_qty = 0

        disp_status = data.get('dispersion_status', current['dispersion_status'] or 'Not Dispersed')
        disp_qty = int(data.get('dispersed_qty', current['dispersed_qty'] or 0) or 0)
        disp_date = data.get('store_disperse_date', current['store_disperse_date'] or '')
        if disp_status == 'Fully Dispersed' and disp_qty == 0:
            disp_qty = rec_qty if rec_qty > 0 else qty
        elif disp_status == 'Not Dispersed':
            disp_date = ''
            disp_qty = 0

        st_remarks = data.get('store_remarks', current['store_remarks'] or '')
    else:
        st_status = current['store_status'] or 'Not Received'
        rec_qty = current['received_qty'] or 0
        st_in_date = current['store_in_date'] or ''
        disp_status = current['dispersion_status'] or 'Not Dispersed'
        disp_qty = current['dispersed_qty'] or 0
        disp_date = current['store_disperse_date'] or ''
        st_remarks = current['store_remarks'] or ''

    c.execute('''
        UPDATE promotional_items SET
            product_name = ?,
            material_type = ?,
            category = ?,
            plan_type = ?,
            item_name = ?,
            item_description = ?,
            approval_note = ?,
            month = ?,
            month_num = ?,
            sap_code = ?,
            legacy_code = ?,
            quantity = ?,
            unit_price = ?,
            total_price = ?,
            approval_status = ?,
            approved_by = ?,
            approval_date = ?,
            po_status = ?,
            po_number = ?,
            po_date = ?,
            expected_arrival_date = ?,
            delivery_date = ?,
            allocation_status = ?,
            allocation_file = ?,
            allocation_notes = ?,
            packaging_status = ?,
            packaging_file = ?,
            packaging_designer_id = ?,
            store_status = ?,
            received_qty = ?,
            store_in_date = ?,
            dispersion_status = ?,
            dispersed_qty = ?,
            store_disperse_date = ?,
            store_remarks = ?,
            responsible_person_id = ?,
            item_image = ?,
            updated_at = ?
        WHERE id = ?
    ''', (
        data.get('product_name', current['product_name']),
        data.get('material_type', current['material_type']),
        data.get('category', current['category']),
        data.get('plan_type', current['plan_type'] or 'Regular'),
        data.get('item_name', current['item_name']),
        data.get('item_description', current['item_description']),
        data.get('approval_note', current['approval_note'] or ''),
        m_name, m_num,
        data.get('sap_code', current['sap_code']),
        data.get('legacy_code', current['legacy_code']),
        qty, unit_p, total_p,
        data.get('approval_status', current['approval_status']),
        data.get('approved_by', current['approved_by']),
        data.get('approval_date', current['approval_date']),
        data.get('po_status', current['po_status']),
        data.get('po_number', current['po_number']),
        data.get('po_date', current['po_date']),
        data.get('expected_arrival_date', current['expected_arrival_date']),
        data.get('delivery_date', current['delivery_date']),
        data.get('allocation_status', current['allocation_status']),
        data.get('allocation_file', current['allocation_file']),
        data.get('allocation_notes', current['allocation_notes']),
        data.get('packaging_status', current['packaging_status']),
        data.get('packaging_file', current['packaging_file']),
        data.get('packaging_designer_id', current['packaging_designer_id']),
        st_status,
        rec_qty,
        st_in_date,
        disp_status,
        disp_qty,
        disp_date,
        st_remarks,
        responsible_person_id,
        data.get('item_image', current['item_image']),
        now_str,
        item_id
    ))

    actor = data.get('actor_name', 'System')
    c.execute('INSERT INTO activity_log (item_id, action, actor_name, details) VALUES (?, "Updated", ?, ?)',
              (item_id, actor, f"Updated item #{item_id}: {data.get('item_name', current['item_name']) or current['category']}"))

    conn.commit()
    conn.close()
    return jsonify({'success': True})

@app.route('/api/items/<int:item_id>', methods=['DELETE'])
def delete_item(item_id):
    conn = get_db()
    c = conn.cursor()
    item = c.execute('SELECT * FROM promotional_items WHERE id = ?', (item_id,)).fetchone()
    if not item:
        conn.close()
        return jsonify({'error': 'Item not found'}), 404

    actor = request.args.get('actor_name') or (request.json and request.json.get('actor_name')) or 'Md. Didarul Islam'
    c.execute('DELETE FROM item_comments WHERE item_id = ?', (item_id,))
    c.execute('DELETE FROM promotional_items WHERE id = ?', (item_id,))
    c.execute('INSERT INTO activity_log (item_id, action, actor_name, details) VALUES (?, "Deleted", ?, ?)',
              (item_id, actor, f"Deleted {item['plan_type']} item #{item_id}: {item['item_name'] or item['category']} ({item['product_name']})"))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

@app.route('/api/items/<int:item_id>/quick-update', methods=['PATCH'])
def quick_update_item(item_id):
    data = request.json or {}
    conn = get_db()
    c = conn.cursor()

    current = c.execute('SELECT * FROM promotional_items WHERE id = ?', (item_id,)).fetchone()
    if not current:
        conn.close()
        return jsonify({'error': 'Item not found'}), 404

    item_name = data.get('item_name', current['item_name'])
    qty = int(data.get('quantity', current['quantity']))
    unit_p = float(data.get('unit_price', current['unit_price']))
    total_p = qty * unit_p
    sap_code = data.get('sap_code', current['sap_code'])
    legacy_code = data.get('legacy_code', current['legacy_code'])

    c.execute('''
        UPDATE promotional_items
        SET item_name = ?, quantity = ?, unit_price = ?, total_price = ?,
            sap_code = ?, legacy_code = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    ''', (item_name, qty, unit_p, total_p, sap_code, legacy_code, item_id))

    actor = data.get('actor_name', 'Md. Didarul Islam')
    c.execute('INSERT INTO activity_log (item_id, action, actor_name, details) VALUES (?, "Quick Update", ?, ?)',
              (item_id, actor, f"Assigned item name '{item_name}' (Qty: {qty:,}, Price: {unit_p:,.2f})"))

    conn.commit()
    conn.close()
    return jsonify({'success': True, 'total_price': total_p})

@app.route('/api/items/<int:item_id>/approve', methods=['POST'])
def approve_item(item_id):
    data = request.json or {}
    new_status = data.get('status', 'Approved')
    actor = data.get('actor_name', 'Md. Didarul Islam (Brand Manager)')
    today = datetime.date.today().isoformat()

    conn = get_db()
    c = conn.cursor()
    c.execute('''
        UPDATE promotional_items
        SET approval_status = ?,
            approved_by = ?,
            approval_date = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    ''', (new_status, actor if new_status == 'Approved' else '', today if new_status == 'Approved' else '', item_id))

    c.execute('INSERT INTO activity_log (item_id, action, actor_name, details) VALUES (?, "Approval Status Change", ?, ?)',
              (item_id, actor, f"Changed approval status to: {new_status}"))

    conn.commit()
    conn.close()
    return jsonify({'success': True, 'approval_status': new_status})

@app.route('/api/items/<int:item_id>/store-update', methods=['POST'])
def update_store(item_id):
    data = request.json or {}
    role_id = data.get('role_id')
    actor = data.get('actor_name', 'Md. Rakibuzzaman (Store & Logistics)')

    # Permission check: Only Md. Rakibuzzaman (role 6) or Admin (role 1)
    if role_id is not None and int(role_id) not in [1, 6]:
        return jsonify({
            'success': False, 
            'error': 'Permission denied. Only Md. Rakibuzzaman (Store & Logistics) can enter Store & Dispersion records.'
        }), 403

    conn = get_db()
    c = conn.cursor()
    item = c.execute('SELECT * FROM promotional_items WHERE id = ?', (item_id,)).fetchone()
    if not item:
        conn.close()
        return jsonify({'error': 'Item not found'}), 404

    store_status = data.get('store_status', item['store_status'] or 'Not Received')
    store_in_date = data.get('store_in_date', '')
    received_qty = int(data.get('received_qty', 0) or 0)
    
    # Auto-adjust if Fully Received
    if store_status == 'Fully Received':
        if received_qty == 0:
            received_qty = item['quantity'] or 0
    elif store_status == 'Not Received':
        store_in_date = ''
        received_qty = 0

    dispersion_status = data.get('dispersion_status', item['dispersion_status'] or 'Not Dispersed')
    store_disperse_date = data.get('store_disperse_date', '')
    dispersed_qty = int(data.get('dispersed_qty', 0) or 0)
    
    # Auto-adjust if Fully Dispersed
    if dispersion_status == 'Fully Dispersed':
        if dispersed_qty == 0:
            dispersed_qty = received_qty if received_qty > 0 else (item['quantity'] or 0)
    elif dispersion_status == 'Not Dispersed':
        store_disperse_date = ''
        dispersed_qty = 0

    store_remarks = data.get('store_remarks', item['store_remarks'] or '')

    c.execute('''
        UPDATE promotional_items
        SET store_status = ?,
            received_qty = ?,
            store_in_date = ?,
            dispersion_status = ?,
            dispersed_qty = ?,
            store_disperse_date = ?,
            store_remarks = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    ''', (store_status, received_qty, store_in_date, dispersion_status, dispersed_qty, store_disperse_date, store_remarks, item_id))

    details = f"Store: {store_status}"
    if store_status in ['Partly Received', 'Fully Received']:
        details += f" ({received_qty} units on {store_in_date or 'N/A'})"
    details += f" | Dispersion: {dispersion_status}"
    if dispersion_status in ['Partly Dispersed', 'Fully Dispersed']:
        details += f" ({dispersed_qty} units on {store_disperse_date or 'N/A'})"

    c.execute('INSERT INTO activity_log (item_id, action, actor_name, details) VALUES (?, "Store Inventory Update", ?, ?)',
              (item_id, actor, details))

    conn.commit()
    conn.close()
    return jsonify({
        'success': True,
        'store_status': store_status,
        'received_qty': received_qty,
        'store_in_date': store_in_date,
        'dispersion_status': dispersion_status,
        'dispersed_qty': dispersed_qty,
        'store_disperse_date': store_disperse_date
    })

@app.route('/api/items/<int:item_id>/comments', methods=['POST'])
def add_comment(item_id):
    data = request.json or {}
    user_name = data.get('user_name', 'User')
    user_role = data.get('user_role', 'Team Member')
    comment = data.get('comment', '').strip()

    if not comment:
        return jsonify({'error': 'Comment cannot be empty'}), 400

    conn = get_db()
    c = conn.cursor()
    c.execute('INSERT INTO item_comments (item_id, user_name, user_role, comment) VALUES (?, ?, ?, ?)',
              (item_id, user_name, user_role, comment))

    c.execute('INSERT INTO activity_log (item_id, action, actor_name, details) VALUES (?, "Comment", ?, ?)',
              (item_id, user_name, f"Commented on item #{item_id}: {comment[:60]}..."))

    conn.commit()
    conn.close()
    return jsonify({'success': True})

# ----------------- TEAM MEMBERS API -----------------
@app.route('/api/team', methods=['GET'])
def get_team():
    conn = get_db()
    c = conn.cursor()
    rows = c.execute('''
        SELECT m.*, COUNT(p.id) as assigned_items_count
        FROM team_members m
        LEFT JOIN promotional_items p ON m.id = p.responsible_person_id
        WHERE m.is_active = 1
        GROUP BY m.id
        ORDER BY m.id ASC
    ''').fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route('/api/team', methods=['POST'])
def add_team_member():
    data = request.json or {}
    name = data.get('name')
    email = data.get('email')
    mobile = data.get('mobile')
    designation = data.get('designation', 'Executive')
    department = data.get('department', 'PMMD')
    role = data.get('role', 'PMMD Procurement')

    if not name or not email or not mobile:
        return jsonify({'error': 'Name, email, and mobile are required'}), 400

    parts = name.strip().split()
    avatar = (parts[0][0] + (parts[-1][0] if len(parts) > 1 else '')).upper()

    conn = get_db()
    c = conn.cursor()
    try:
        c.execute('''
            INSERT INTO team_members (name, designation, department, role, email, mobile, avatar, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, 1)
        ''', (name, designation, department, role, email, mobile, avatar))
        new_id = c.lastrowid
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({'error': 'A team member with this email already exists'}), 400

    conn.close()
    return jsonify({'success': True, 'id': new_id})

@app.route('/api/team/<int:member_id>/photo', methods=['POST'])
def update_team_member_photo(member_id):
    filename = None
    if 'file' in request.files:
        file = request.files['file']
        if file and file.filename and allowed_file(file.filename):
            orig_name = secure_filename(file.filename)
            ext = orig_name.rsplit('.', 1)[1].lower() if '.' in orig_name else 'jpg'
            filename = f"profile_{member_id}_{int(datetime.now().timestamp())}.{ext}"
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
    elif request.json and 'profile_image' in request.json:
        filename = request.json['profile_image']

    if not filename:
        return jsonify({'error': 'No image file uploaded'}), 400

    conn = get_db()
    c = conn.cursor()
    c.execute('UPDATE team_members SET profile_image = ? WHERE id = ?', (filename, member_id))
    c.execute('INSERT INTO activity_log (action, actor_name, details) VALUES (?, ?, ?)',
              ('Profile Photo', 'Admin', f"Updated profile photo for team member #{member_id}"))
    conn.commit()
    conn.close()

    return jsonify({'success': True, 'profile_image': filename, 'url': f'/uploads/{filename}'})

# ----------------- PRODUCTS API -----------------
@app.route('/api/products', methods=['GET'])
def get_products():
    conn = get_db()
    c = conn.cursor()
    rows = c.execute('''
        SELECT pr.*, COUNT(p.id) as items_count, COALESCE(SUM(p.total_price), 0) as total_expense
        FROM products pr
        LEFT JOIN promotional_items p ON pr.name = p.product_name
        WHERE pr.is_active = 1
        GROUP BY pr.id
        ORDER BY pr.id ASC
    ''').fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route('/api/products', methods=['POST'])
def add_product():
    data = request.json or {}
    name = data.get('name', '').strip()
    portfolio = data.get('portfolio', 'PPI').strip()
    color = data.get('color', '#0284C7')

    if not name:
        return jsonify({'error': 'Product name is required'}), 400

    conn = get_db()
    c = conn.cursor()
    try:
        c.execute('INSERT INTO products (name, portfolio, color, is_active) VALUES (?, ?, ?, 1)', (name, portfolio, color))
        new_id = c.lastrowid
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({'error': 'Product already exists'}), 400

    conn.close()
    return jsonify({'success': True, 'id': new_id})

# ----------------- BUDGET API -----------------
@app.route('/api/budget', methods=['GET'])
def get_budget():
    year = int(request.args.get('year', 2027))
    conn = get_db()
    c = conn.cursor()
    row = c.execute('SELECT * FROM budget_settings WHERE year = ?', (year,)).fetchone()
    conn.close()
    return jsonify(dict(row) if row else {})

@app.route('/api/budget', methods=['PUT'])
def update_budget():
    data = request.json or {}
    year = int(data.get('year', 2027))
    total_b = float(data.get('total_budget', 168000000))
    br_b = float(data.get('br_budget', 97110000))
    ppm_b = float(data.get('ppm_budget', 70890000))
    exium_b = float(data.get('exium_budget', 110000000))
    mups_b = float(data.get('exium_mups_budget', 58000000))
    notes = data.get('notes', '')

    conn = get_db()
    c = conn.cursor()
    c.execute('''
        INSERT OR REPLACE INTO budget_settings (id, year, total_budget, br_budget, ppm_budget, exium_budget, exium_mups_budget, notes, updated_at)
        VALUES (
            (SELECT id FROM budget_settings WHERE year = ?),
            ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP
        )
    ''', (year, year, total_b, br_b, ppm_b, exium_b, mups_b, notes))

    c.execute('INSERT INTO activity_log (action, actor_name, details) VALUES ("Budget Updated", ?, ?)',
              (data.get('actor_name', 'Md. Didarul Islam'), f"Updated {year} budget: Total {total_b:,.0f} (BR: {br_b:,.0f}, PPM: {ppm_b:,.0f})"))

    conn.commit()
    conn.close()
    return jsonify({'success': True})

# ----------------- FILE UPLOAD API -----------------
@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in request'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = secure_filename(file.filename)
    unique_filename = f"{timestamp}_{filename}"
    save_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
    file.save(save_path)

    return jsonify({
        'success': True,
        'filename': unique_filename,
        'url': f"/uploads/{unique_filename}"
    })


# ----------------- EXCEL EXPORT API -----------------
@app.route('/api/export/excel', methods=['GET'])
@app.route('/api/export/csv', methods=['GET'])
def export_excel():
    year = int(request.args.get('year', 2027))
    conn = get_db()
    c = conn.cursor()

    query = '''
        SELECT p.*, 
               m.name as responsible_name, m.email as responsible_email, m.mobile as responsible_mobile
        FROM promotional_items p
        LEFT JOIN team_members m ON p.responsible_person_id = m.id
        WHERE p.year = ?
        ORDER BY p.month_num ASC, p.material_type ASC, p.product_name ASC, p.id ASC
    '''
    rows = c.execute(query, (year,)).fetchall()

    wb = openpyxl.Workbook()
    
    # ---------------- SHEET 1: Promotional Items Plan ----------------
    ws1 = wb.active
    ws1.title = f"Plan {year}"

    header_fill = PatternFill(start_color="0F172A", end_color="0F172A", fill_type="solid")
    header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
    thin_border = Border(
        left=Side(style='thin', color='CBD5E1'),
        right=Side(style='thin', color='CBD5E1'),
        top=Side(style='thin', color='CBD5E1'),
        bottom=Side(style='thin', color='CBD5E1')
    )
    center_align = Alignment(horizontal="center", vertical="center")
    left_align = Alignment(horizontal="left", vertical="center")
    right_align = Alignment(horizontal="right", vertical="center")

    headers = [
        "SL", "Brand", "Plan", "Material", "Item Category", "Month", 
        "Item Name", "SAP Code", "Legacy Code", "Quantity", "Unit Price (BDT)", 
        "Total Price (BDT)", "Approval Status", "Approval Ref / Purpose", 
        "PMMD Lead", "PO Status", "PO Number", "PO Date", 
        "Delivery Date", "Store Status", "Received Qty", "Store-In Date", 
        "Dispersion Status", "Dispersed Qty", "Dispersion Date"
    ]

    ws1.append(headers)
    for col_num in range(1, len(headers) + 1):
        cell = ws1.cell(row=1, column=col_num)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = center_align
        cell.border = thin_border

    alt_fill = PatternFill(start_color="F8FAFC", end_color="F8FAFC", fill_type="solid")
    special_fill = PatternFill(start_color="FEF3C7", end_color="FEF3C7", fill_type="solid")

    for idx, r in enumerate(rows, 1):
        row_data = [
            idx,
            r['product_name'] or '',
            r['plan_type'] or 'Regular',
            r['material_type'] or '',
            r['category'] or '',
            f"{r['month']} {r['year']}",
            r['item_name'] or '',
            r['sap_code'] or '',
            r['legacy_code'] or '',
            r['quantity'] or 0,
            r['unit_price'] or 0.0,
            r['total_price'] or 0.0,
            r['approval_status'] or 'Pending',
            r['approval_note'] or '',
            r['responsible_name'] or '',
            r['po_status'] or 'Not Initiated',
            r['po_number'] or '',
            r['po_date'] or '',
            r['delivery_date'] or '',
            r['store_status'] or 'Not Received',
            r['received_qty'] or 0,
            r['store_in_date'] or '',
            r['dispersion_status'] or 'Not Dispersed',
            r['dispersed_qty'] or 0,
            r['store_disperse_date'] or ''
        ]
        ws1.append(row_data)
        current_row = idx + 1
        is_special = (r['plan_type'] == 'Special')

        for col_num in range(1, len(row_data) + 1):
            cell = ws1.cell(row=current_row, column=col_num)
            cell.font = Font(name="Calibri", size=10, bold=(col_num in [2, 7, 12]))
            cell.border = thin_border
            if is_special:
                cell.fill = special_fill
            elif idx % 2 == 0:
                cell.fill = alt_fill

            if col_num in [1, 10]:
                cell.alignment = center_align
                if col_num == 10:
                    cell.number_format = '#,##0'
            elif col_num in [11, 12]:
                cell.alignment = right_align
                cell.number_format = '#,##0'
            elif col_num in [3, 4, 6, 8, 9, 13, 16, 18, 19, 21]:
                cell.alignment = center_align
            else:
                cell.alignment = left_align

    for col in ws1.columns:
        max_len = max(len(str(cell.value or '')) for cell in col)
        col_letter = get_column_letter(col[0].column)
        ws1.column_dimensions[col_letter].width = max(max_len + 3, 12)

    ws1.freeze_panes = 'A2'

    # ---------------- SHEET 2: Summary ----------------
    ws2 = wb.create_sheet(title="Summary")
    ws2.append(["Radiant Promotional Budget & Plan Summary", f"Year {year}"])
    ws2.append([])
    ws2.append(["Brand", "Material Type", "Items Count", "Total Expense (BDT)"])
    
    for c_idx in range(1, 5):
        ws2.cell(row=3, column=c_idx).fill = header_fill
        ws2.cell(row=3, column=c_idx).font = header_font
        ws2.cell(row=3, column=c_idx).alignment = center_align

    summary_rows = c.execute('''
        SELECT product_name, material_type, COUNT(*) as cnt, SUM(total_price) as total_exp
        FROM promotional_items
        WHERE year = ?
        GROUP BY product_name, material_type
        ORDER BY product_name, material_type
    ''', (year,)).fetchall()

    for s_idx, sr in enumerate(summary_rows, 4):
        ws2.append([sr['product_name'], sr['material_type'], sr['cnt'], sr['total_exp'] or 0.0])
        ws2.cell(row=s_idx, column=1).alignment = left_align
        ws2.cell(row=s_idx, column=2).alignment = center_align
        ws2.cell(row=s_idx, column=3).alignment = center_align
        ws2.cell(row=s_idx, column=4).alignment = right_align
        ws2.cell(row=s_idx, column=4).number_format = '#,##0'

    for col in ws2.columns:
        max_len = max(len(str(cell.value or '')) for cell in col)
        col_letter = get_column_letter(col[0].column)
        ws2.column_dimensions[col_letter].width = max(max_len + 3, 15)

    conn.close()

    output = io.BytesIO()
    wb.save(output)
    output.seek(0)

    filename = f"Radiant_Promotional_Plan_{year}.xlsx"
    return send_file(
        output,
        download_name=filename,
        as_attachment=True,
        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"============================================================")
    print(f"Radiant Promotional Material Management System (PMMD Connect)")
    print(f"Local Access:    http://127.0.0.1:{port}")
    print(f"Network Access:  http://0.0.0.0:{port}")
    print(f"============================================================")
    app.run(host='0.0.0.0', port=port, debug=True)
