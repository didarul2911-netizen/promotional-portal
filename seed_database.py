import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'promotional.db')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    cursor.executescript('''
    DROP TABLE IF EXISTS promotional_items;
    DROP TABLE IF EXISTS products;
    DROP TABLE IF EXISTS team_members;
    DROP TABLE IF EXISTS budget_settings;
    DROP TABLE IF EXISTS item_comments;
    DROP TABLE IF EXISTS activity_log;

    CREATE TABLE products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        portfolio TEXT DEFAULT 'PPI',
        color TEXT DEFAULT '#2563EB',
        is_active INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE team_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        designation TEXT NOT NULL,
        department TEXT NOT NULL,
        role TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        mobile TEXT NOT NULL,
        avatar TEXT,
        is_active INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE budget_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        year INTEGER UNIQUE NOT NULL,
        total_budget REAL NOT NULL,
        br_budget REAL DEFAULT 0,
        ppm_budget REAL DEFAULT 0,
        exium_budget REAL NOT NULL,
        exium_mups_budget REAL NOT NULL,
        notes TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE promotional_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        product_name TEXT NOT NULL,
        material_type TEXT NOT NULL, -- 'BR' or 'PPM'
        category TEXT NOT NULL,      -- 'Special BR', 'Regular BR', 'Call Gadget', 'Exclusive Pen', etc.
        plan_type TEXT DEFAULT 'Regular', -- 'Regular' or 'Special'
        item_name TEXT DEFAULT '',   -- Empty by default as requested!
        item_description TEXT DEFAULT '',
        approval_note TEXT DEFAULT '',
        month TEXT NOT NULL,
        month_num INTEGER NOT NULL,
        year INTEGER DEFAULT 2028,
        sap_code TEXT DEFAULT '',
        legacy_code TEXT DEFAULT '',
        quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        total_price REAL NOT NULL,
        approval_status TEXT DEFAULT 'Pending', -- 'Pending', 'Approved', 'Rejected'
        approved_by TEXT DEFAULT '',
        approval_date TEXT DEFAULT '',
        po_status TEXT DEFAULT 'Not Initiated', -- 'Not Initiated', 'PO In Progress', 'PO Issued', 'Cancelled'
        po_number TEXT DEFAULT '',
        po_date TEXT DEFAULT '',
        expected_arrival_date TEXT DEFAULT '',
        delivery_date TEXT DEFAULT '',
        allocation_status TEXT DEFAULT 'Pending', -- 'Pending', 'Draft Prepared', 'Allocation Finalized'
        allocation_file TEXT DEFAULT '',
        allocation_notes TEXT DEFAULT '',
        packaging_status TEXT DEFAULT 'Not Applicable', -- 'Not Applicable', 'Design In Progress', 'Artwork Under Review', 'Design Approved'
        packaging_file TEXT DEFAULT '',
        packaging_designer_id INTEGER DEFAULT 5,
        store_status TEXT DEFAULT 'Not Received', -- 'Not Received', 'Partly Received', 'Fully Received'
        received_qty INTEGER DEFAULT 0,
        store_in_date TEXT DEFAULT '',
        dispersion_status TEXT DEFAULT 'Not Dispersed', -- 'Not Dispersed', 'Partly Dispersed', 'Fully Dispersed'
        dispersed_qty INTEGER DEFAULT 0,
        store_in_date TEXT DEFAULT '',
        store_disperse_date TEXT DEFAULT '',
        store_remarks TEXT DEFAULT '',
        responsible_person_id INTEGER DEFAULT NULL,
        item_image TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id),
        FOREIGN KEY (responsible_person_id) REFERENCES team_members(id)
    );

    CREATE TABLE item_comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_id INTEGER NOT NULL,
        user_name TEXT NOT NULL,
        user_role TEXT NOT NULL,
        comment TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (item_id) REFERENCES promotional_items(id)
    );

    CREATE TABLE activity_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_id INTEGER,
        action TEXT NOT NULL,
        actor_name TEXT NOT NULL,
        details TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ''')
    conn.commit()
    conn.close()

def seed():
    conn = get_db()
    cursor = conn.cursor()

    # 1. Products (Focus on Exium & Exium MUPS, with option to add more)
    products = [
        ('Exium', 'PPI', '#2563EB', 1),
        ('Exium MUPS', 'PPI', '#7C3AED', 1),
        ('Lanplus', 'PPI', '#059669', 1),
        ('Prompton', 'PPI', '#D97706', 1)
    ]
    for p in products:
        cursor.execute('INSERT INTO products (name, portfolio, color, is_active) VALUES (?, ?, ?, ?)', p)

    # 2. Team Members
    members = [
        ('Md. Didarul Islam', 'Brand Manager', 'SMD', 'Admin / Brand Manager', 'didarul.islam@radiant.com.bd', '01521209127', 'DI'),
        ('Md. Zahid Hasan', 'Sr. Asst. Manager', 'PMMD', 'PMMD Procurement', 'zahid.hasan@radiant.com.bd', '01833183299', 'ZH'),
        ('Tanim Bin Mahmud', 'Asst. Manager', 'PMMD', 'PMMD Procurement', 'tanim.mahmud@radiant.com.bd', '01975296411', 'TM'),
        ('Md Whahedur Rahman Mony', 'Officer', 'PMMD', 'PMMD Procurement', 'whahedur.rahman@radiant.com.bd', '01721340117', 'WM'),
        ('Md. Subhani Sujon', 'Asst. Manager', 'PMMD', 'Packaging Design', 'subhani.sujon@radiant.com.bd', '01795326161', 'SS'),
        ('Md. Rakibuzzaman', 'Sr. Asst. Manager', 'PMMD', 'Store & Logistics', 'md.rakibuzzaman@radiant.com.bd', '01916405683', 'RZ')
    ]
    for m in members:
        cursor.execute('INSERT INTO team_members (name, designation, department, role, email, mobile, avatar) VALUES (?, ?, ?, ?, ?, ?, ?)', m)

    # 3. Budget Settings (2028 default, also add 2028 empty baseline)
    cursor.execute('''
        INSERT INTO budget_settings (year, total_budget, br_budget, ppm_budget, exium_budget, exium_mups_budget, notes)
        VALUES 
        (2028, 168000000.0, 97110000.0, 70890000.0, 110000000.0, 58000000.0, 'Annual Promotional Budget for PPI Brands (Exium & Exium MUPS) - RPL GEN-A Team 2028'),
        (2028, 180000000.0, 105000000.0, 75000000.0, 118000000.0, 62000000.0, 'Preliminary Promotional Budget for 2028')
    ''')

    month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    month_order = {m: i+1 for i, m in enumerate(month_names)}
    pmmd_ids = [2, 3, 4] # Zahid, Tanim, Mony

    items_to_insert = []

    # ==========================================
    # BR (Brand Reminder) Plan - 2028
    # ==========================================
    # Exium BR:
    for i, m in enumerate(month_names):
        # Special BR (Planned rate: 600, Qty: 1950)
        items_to_insert.append({
            'product_id': 1, 'product_name': 'Exium', 'material_type': 'BR', 'category': 'Special BR',
            'item_name': '', # BLANK AS REQUESTED! User will input
            'month': m, 'month_num': i+1, 'year': 2028,
            'quantity': 1950, 'unit_price': 600.0, 'total_price': 1950 * 600.0,
            'responsible_person_id': None
        })
        # Regular BR (Planned rate: 300, Qty: 5000 Jan-Mar, 6000 Apr-Jun, 7000 Jul-Dec)
        reg_q = 5000 if i < 3 else 6000 if i < 6 else 7000
        items_to_insert.append({
            'product_id': 1, 'product_name': 'Exium', 'material_type': 'BR', 'category': 'Regular BR',
            'item_name': '', # BLANK
            'month': m, 'month_num': i+1, 'year': 2028,
            'quantity': reg_q, 'unit_price': 300.0, 'total_price': reg_q * 300.0,
            'responsible_person_id': None
        })
        # Call Gadget (Planned rate: 150, Qty: 10000 Jan-Mar, 4000 Apr-Jun, 4500 Jul-Dec)
        gad_q = 10000 if i < 3 else 4000 if i < 6 else 4500
        items_to_insert.append({
            'product_id': 1, 'product_name': 'Exium', 'material_type': 'BR', 'category': 'Call Gadget',
            'item_name': '', # BLANK
            'month': m, 'month_num': i+1, 'year': 2028,
            'quantity': gad_q, 'unit_price': 150.0, 'total_price': gad_q * 150.0,
            'responsible_person_id': None
        })

    # Exium MUPS BR:
    for i, m in enumerate(month_names):
        # Special BR (Planned rate: 600, Qty: 3800 Jan-Mar, 1950 Apr-Dec)
        sp_q = 3800 if i < 3 else 1950
        items_to_insert.append({
            'product_id': 2, 'product_name': 'Exium MUPS', 'material_type': 'BR', 'category': 'Special BR',
            'item_name': '', # BLANK
            'month': m, 'month_num': i+1, 'year': 2028,
            'quantity': sp_q, 'unit_price': 600.0, 'total_price': sp_q * 600.0,
            'responsible_person_id': None
        })
        # Regular BR (Planned rate: 300, Qty: 5000 Jan-Mar, 6000 Apr-Jun, 7000 Jul-Dec)
        reg_q = 5000 if i < 3 else 6000 if i < 6 else 7000
        items_to_insert.append({
            'product_id': 2, 'product_name': 'Exium MUPS', 'material_type': 'BR', 'category': 'Regular BR',
            'item_name': '', # BLANK
            'month': m, 'month_num': i+1, 'year': 2028,
            'quantity': reg_q, 'unit_price': 300.0, 'total_price': reg_q * 300.0,
            'responsible_person_id': None
        })
        # Call Gadget (Planned rate: 150, Qty: 10000 Jan-Mar, 4000 Apr-Jun, 4500 Jul-Dec)
        gad_q = 10000 if i < 3 else 4000 if i < 6 else 4500
        items_to_insert.append({
            'product_id': 2, 'product_name': 'Exium MUPS', 'material_type': 'BR', 'category': 'Call Gadget',
            'item_name': '', # BLANK
            'month': m, 'month_num': i+1, 'year': 2028,
            'quantity': gad_q, 'unit_price': 150.0, 'total_price': gad_q * 150.0,
            'responsible_person_id': None
        })

    # ==========================================
    # PPM (Printed Promotion Material) Plan - 2028
    # ==========================================
    # 1. Exium Exclusive Pen (Rate: 40, Qty: 13,500 monthly)
    for i, m in enumerate(month_names):
        items_to_insert.append({
            'product_id': 1, 'product_name': 'Exium', 'material_type': 'PPM', 'category': 'Exclusive Pen',
            'item_name': '', # BLANK
            'month': m, 'month_num': i+1, 'year': 2028,
            'quantity': 13500, 'unit_price': 40.0, 'total_price': 13500 * 40.0,
            'responsible_person_id': None
        })

    # 2. Exium Regular Pen (Rate: 20, Qty: 25,000 monthly)
    for i, m in enumerate(month_names):
        items_to_insert.append({
            'product_id': 1, 'product_name': 'Exium', 'material_type': 'PPM', 'category': 'Regular Pen',
            'item_name': '', # BLANK
            'month': m, 'month_num': i+1, 'year': 2028,
            'quantity': 25000, 'unit_price': 20.0, 'total_price': 25000 * 20.0,
            'responsible_person_id': None
        })

    # 3. Exium Pad Plans:
    # PP: Jan(21k), Mar(21k), May(15k), Jul(15k), Sep(15k), Nov(15k) (Rate: 40)
    # SLP: Jan(2.1k), Mar(2.1k), May(8k), Jul(8k), Sep(8k), Nov(8k) (Rate: 12)
    ex_pad_schedule = [
        ('Jan', 21000, 2100),
        ('Mar', 21000, 2100),
        ('May', 15000, 8000),
        ('Jul', 15000, 8000),
        ('Sep', 15000, 8000),
        ('Nov', 15000, 8000)
    ]
    for m, pp_q, slp_q in ex_pad_schedule:
        mo_idx = month_order[m]
        items_to_insert.append({
            'product_id': 1, 'product_name': 'Exium', 'material_type': 'PPM', 'category': 'Prescription Pad (PP)',
            'item_name': '', # BLANK
            'month': m, 'month_num': mo_idx, 'year': 2028,
            'quantity': pp_q, 'unit_price': 40.0, 'total_price': pp_q * 40.0,
            'responsible_person_id': None
        })
        items_to_insert.append({
            'product_id': 1, 'product_name': 'Exium', 'material_type': 'PPM', 'category': 'Slip Pad (SLP)',
            'item_name': '', # BLANK
            'month': m, 'month_num': mo_idx, 'year': 2028,
            'quantity': slp_q, 'unit_price': 12.0, 'total_price': slp_q * 12.0,
            'responsible_person_id': None
        })

    # 4. Exium MUPS Pad Plans:
    # PP: Feb(21k), Apr(21k), Jun(15k), Aug(15k), Oct(15k), Nov(15k) (Rate: 40)
    # SLP: Feb(2.1k), Apr(2.1k), Jun(8k), Aug(8k), Oct(8k), Nov(8k) (Rate: 12)
    # Edu: Jan(4k), Mar(4k), Apr(8k), May(7k), Jul(7k), Sep(7k), Oct(7k), Dec(7k) (Rate: 40)
    mups_pp_slp_schedule = [
        ('Feb', 21000, 2100),
        ('Apr', 21000, 2100),
        ('Jun', 15000, 8000),
        ('Aug', 15000, 8000),
        ('Oct', 15000, 8000),
        ('Nov', 15000, 8000)
    ]
    for m, pp_q, slp_q in mups_pp_slp_schedule:
        mo_idx = month_order[m]
        items_to_insert.append({
            'product_id': 2, 'product_name': 'Exium MUPS', 'material_type': 'PPM', 'category': 'Prescription Pad (PP)',
            'item_name': '', # BLANK
            'month': m, 'month_num': mo_idx, 'year': 2028,
            'quantity': pp_q, 'unit_price': 40.0, 'total_price': pp_q * 40.0,
            'responsible_person_id': None
        })
        items_to_insert.append({
            'product_id': 2, 'product_name': 'Exium MUPS', 'material_type': 'PPM', 'category': 'Slip Pad (SLP)',
            'item_name': '', # BLANK
            'month': m, 'month_num': mo_idx, 'year': 2028,
            'quantity': slp_q, 'unit_price': 12.0, 'total_price': slp_q * 12.0,
            'responsible_person_id': None
        })

    mups_edu_schedule = [
        ('Jan', 4000),
        ('Mar', 4000),
        ('Apr', 8000),
        ('May', 7000),
        ('Jul', 7000),
        ('Sep', 7000),
        ('Oct', 7000),
        ('Dec', 7000)
    ]
    for m, edu_q in mups_edu_schedule:
        mo_idx = month_order[m]
        items_to_insert.append({
            'product_id': 2, 'product_name': 'Exium MUPS', 'material_type': 'PPM', 'category': 'Educational Pad (Edu)',
            'item_name': '', # BLANK
            'month': m, 'month_num': mo_idx, 'year': 2028,
            'quantity': edu_q, 'unit_price': 40.0, 'total_price': edu_q * 40.0,
            'responsible_person_id': None
        })

    # 5. Exium Sales Aid (SA) Plan:
    # Jan-Dec: 210,000 monthly (Apr: 200,000) (Rate: 15)
    for i, m in enumerate(month_names):
        sa_q = 200000 if m == 'Apr' else 210000
        items_to_insert.append({
            'product_id': 1, 'product_name': 'Exium', 'material_type': 'PPM', 'category': 'Sales Aid (SA)',
            'item_name': '', # BLANK
            'month': m, 'month_num': i+1, 'year': 2028,
            'quantity': sa_q, 'unit_price': 15.0, 'total_price': sa_q * 15.0,
            'responsible_person_id': None
        })

    # Insert all items into database
    for it in items_to_insert:
        cursor.execute('''
            INSERT INTO promotional_items (
                product_id, product_name, material_type, category, item_name,
                month, month_num, year, quantity, unit_price, total_price,
                responsible_person_id
            ) VALUES (
                :product_id, :product_name, :material_type, :category, :item_name,
                :month, :month_num, :year, :quantity, :unit_price, :total_price,
                :responsible_person_id
            )
        ''', it)

    # Initial activity log
    cursor.execute('''
        INSERT INTO activity_log (action, actor_name, details)
        VALUES ('System Initialized', 'Md. Didarul Islam', '2028 Promotional material slots successfully seeded from official plan. Ready for item entry.')
    ''')

    conn.commit()
    conn.close()
    print(f"Initialized database with {len(items_to_insert)} promotional plan slots (All item names blank, ready for user input).")

if __name__ == '__main__':
    init_db()
    seed()
