# Promotional Material Management & Synchronization System (PMMD Connect)
### Radiant Pharmaceuticals Limited | GEN-A Team (SMD & PMMD)
**Portfolio:** PPI Focus (Exium & Exium MUPS)  
**Lead Administrator:** Md. Didarul Islam, Brand Manager, Strategic Marketing Department (SMD)

---

## 🌟 Overview & Purpose
This system is an executive synchronization and promotional material management portal designed to streamline cross-departmental coordination between the **Strategic Marketing Department (SMD)** and the **Promotional Material Management Department (PMMD)**.

All promotional plans for **Exium** and **Exium MUPS**—including Brand Reminders (Special BR, Regular BR, Call Gadgets), Exclusive Pens, Regular Pens, Prescription Pads, Slip Pads, Educational Pads, and Sales Aids—are unified in a single, responsive, real-time portal.

---

## 🚀 Key Features

### 1. 🗓️ Multi-Year & Item Tracking (2027 & 2028)
- **Comprehensive Promotional Item Coverage:**
  - Brand Reminders (Special BR, Regular BR, Call Gadgets)
  - Pens (Exclusive & Regular)
  - Pads (Prescription, Slip, Educational)
  - Sales Aids & Specialized Marketing Collaterals
- **Dual Item Identifiers:** Dedicated tracking for both **SAP Code** and **Legacy Code** on every item.
- **Physical Item Specification:** Ability to customize physical item names, quantities, and unit prices.
- **Photo & Mockup Upload:** Direct image uploads for promotional items, gadgets, and packaging mockups.
- **Table & Card Views:** Switch instantly between dense analytical table view and visual card grid.

### 2. ⚡ Regular & Special Plan Support
- **Regular Plan:** Pre-configured planned promotional items.
- **Special Plan:** Dynamic item addition with approval workflows, custom quantities, and budget allocations.

### 3. 👑 Admin Approval Authority (Md. Didarul Islam, Brand Manager)
- 1-click **Approve / Revise** toggle on any item.
- Visual badges indicating approval status (Approved, Pending).
- Automatic timestamping and audit logging when items are approved.

### 4. 👥 Cross-Functional PMMD Coordination
Direct tracking and assignment for responsible leads:
1. **Md. Zahid Hasan**, Sr. Asst. Manager, PMMD
2. **Tanim Bin Mahmud**, Asst. Manager, PMMD
3. **Md Whahedur Rahman Mony**, Officer, PMMD
- **Workflow Fields:**
  - Item Selection & Specification
  - Price verification & Unit cost
  - Quantity confirmation
  - Purchase Order tracking (PO Status, PO #, PO Date)
  - Estimated Arrival / ETA & Field Delivery Date
  - Field Force Allocation status & notes

### 5. 🎨 Packaging Design Hub (Md. Subhani Sujon)
- **Md. Subhani Sujon**, Asst. Manager, PMMD
- Review packaging design status (*Drafting*, *Sample Under Review*, *Artwork Approved*).
- Upload packaging proofs, box dimensions, and UV/foil specifications.

### 6. 📦 Warehouse & Dispersion Desk (Md. Rakibuzzaman)
- **Md. Rakibuzzaman**, Sr. Asst. Manager, PMMD (Restricted Role Entry)
- Dedicated quick-entry logging for:
  - **Store Receipt:** Not Received, Partly Received (with Received Quantity input), and Fully Received.
  - **Store-In Date:** Dynamic date capture upon receipt.
  - **Field Dispersion:** Not Dispersed, Partly Dispersed (with Dispersed Quantity input), and Fully Dispersed.
  - **Dispersion Date:** Tracking field force / depot dispatch.

### 7. 💰 Financial Budget & Real-time Expense Analytics
- Dynamic budget calculation based on finalized items.
- Remaining balance calculation in real-time.
- Visual charts (Chart.js) for monthly spend curve and category breakdown.

### 8. 📊 Excel Data Export
- Comprehensive Excel spreadsheet (`.xlsx`) export with detailed sheets, styled headers, and auto-fitted columns.

---

## 🏃 Quick Start Guide

### Prerequisites
- Python 3.10+ installed
- Modern web browser (Chrome, Edge, Firefox, Safari)

### Installation & Run

1. **Clone the repository:**
   ```bash
   git clone https://github.com/didarul2911-netizen/promotional-portal.git
   cd promotional-portal
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the server:**
   ```bash
   python app.py
   ```
   *(On Windows, you can also simply double-click `start_server.bat`)*

4. **Open in browser:**
   Navigate to [http://127.0.0.1:5000](http://127.0.0.1:5000)

---

## 📂 Project Structure
```
promotional-portal/
├── app.py                  # Python Flask REST API Server
├── seed_database.py        # Database migration and seeder
├── promotional.db          # SQLite persistent database
├── requirements.txt        # Python package dependencies
├── start_server.bat        # 1-click Windows runner
├── README.md               # System documentation
└── static/
    ├── index.html          # Executive Single-Page Application (TailwindCSS, Lucide Icons)
    ├── app.js              # Reactive UI, filtering, Chart.js analytics & API sync
    └── uploads/            # Brand logos & promotional item photos
```

---

## 📞 Key Contacts & System Stakeholders

| Name | Role | Department | Email | Mobile |
| :--- | :--- | :--- | :--- | :--- |
| **Md. Didarul Islam** | Brand Manager (Admin) | SMD | `didarul.islam@radiant.com.bd` | 01521209127 |
| **Md. Zahid Hasan** | Sr. Asst. Manager | PMMD | `zahid.hasan@radiant.com.bd` | 01833183299 |
| **Tanim Bin Mahmud** | Asst. Manager | PMMD | `tanim.mahmud@radiant.com.bd` | 01975296411 |
| **Md Whahedur Rahman Mony** | Officer | PMMD | `whahedur.rahman@radiant.com.bd` | 01721340117 |
| **Md. Subhani Sujon** | Asst. Manager (Design) | PMMD | `subhani.sujon@radiant.com.bd` | 01795326161 |
| **Md. Rakibuzzaman** | Sr. Asst. Manager (Store) | PMMD | `md.rakibuzzaman@radiant.com.bd` | 01916405683 |
