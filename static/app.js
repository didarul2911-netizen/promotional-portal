
// ==================== AUTHENTICATION & LOGIN MANAGEMENT ====================
const LOGIN_PROFILES = [
    { id: 1, name: 'Md. Didarul Islam', role: 'Brand Manager (Admin)', dept: 'SMD', email: 'didarul.islam@radiant.com.bd', badge: 'Admin & Brand Lead', icon: 'crown', color: 'blue', border: 'border-blue-500/50 hover:border-blue-400', badgeClass: 'bg-blue-950 text-blue-300 border-blue-700/60' },
    { id: 6, name: 'Md. Rakibuzzaman', role: 'Sr. Asst. Manager', dept: 'PMMD', email: 'md.rakibuzzaman@radiant.com.bd', badge: 'Store & Dispersion Lead', icon: 'package-check', color: 'amber', border: 'border-amber-500/50 hover:border-amber-400', badgeClass: 'bg-amber-950 text-amber-300 border-amber-700/60' },
    { id: 2, name: 'Md. Zahid Hasan', role: 'Sr. Asst. Manager', dept: 'PMMD', email: 'zahid.hasan@radiant.com.bd', badge: 'Procurement & Sourcing', icon: 'clipboard-list', color: 'emerald', border: 'border-emerald-500/50 hover:border-emerald-400', badgeClass: 'bg-emerald-950 text-emerald-300 border-emerald-700/60' },
    { id: 3, name: 'Tanim Bin Mahmud', role: 'Asst. Manager', dept: 'PMMD', email: 'tanim.mahmud@radiant.com.bd', badge: 'Procurement Specialist', icon: 'clock', color: 'indigo', border: 'border-indigo-500/50 hover:border-indigo-400', badgeClass: 'bg-indigo-950 text-indigo-300 border-indigo-700/60' },
    { id: 4, name: 'Md Whahedur Rahman Mony', role: 'Officer', dept: 'PMMD', email: 'whahedur.rahman@radiant.com.bd', badge: 'Procurement Officer', icon: 'file-text', color: 'teal', border: 'border-teal-500/50 hover:border-teal-400', badgeClass: 'bg-teal-950 text-teal-300 border-teal-700/60' },
    { id: 5, name: 'Md. Subhani Sujon', role: 'Asst. Manager (Design)', dept: 'PMMD', email: 'subhani.sujon@radiant.com.bd', badge: 'Packaging Design Lead', icon: 'pen-tool', color: 'purple', border: 'border-purple-500/50 hover:border-purple-400', badgeClass: 'bg-purple-950 text-purple-300 border-purple-700/60' }
];

function checkAuth() {
    const savedUserId = localStorage.getItem('radiant_portal_user_id');
    const loginScreen = document.getElementById('login-screen');
    const appContainer = document.getElementById('app-container');

    if (savedUserId && USERS[savedUserId]) {
        currentRole = parseInt(savedUserId);
        if (loginScreen) loginScreen.classList.add('hidden');
        if (appContainer) appContainer.classList.remove('hidden');

        initRoleSwitcher();
        loadYears();
        loadDashboard();
        loadItems();
        loadTeam();
        lucide.createIcons();
    } else {
        if (appContainer) appContainer.classList.add('hidden');
        if (loginScreen) loginScreen.classList.remove('hidden');
        renderLoginProfiles();
        lucide.createIcons();
    }
}

function renderLoginProfiles() {
    const container = document.getElementById('login-profile-cards');
    if (!container) return;

    container.innerHTML = LOGIN_PROFILES.map(user => {
        const u = USERS[user.id] || user;
        const photoEl = u.profile_image 
            ? `<img src="static/uploads/${escapeHtml(u.profile_image)}" alt="${escapeHtml(user.name)}" class="w-12 h-12 rounded-2xl object-cover border-2 border-slate-700 shadow-md">`
            : `<div class="w-12 h-12 rounded-2xl bg-slate-800 text-white font-black text-sm flex items-center justify-center border-2 border-slate-700 shadow-inner">${escapeHtml(user.name.split(' ').map(n=>n[0]).slice(0,2).join(''))}</div>`;

        return `
            <div onclick="loginAs(${user.id})" class="bg-slate-950/70 border-2 ${user.border} rounded-2xl p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between group shadow-lg hover:scale-[1.02] hover:bg-slate-900/90 hover:shadow-2xl">
                <div class="space-y-3">
                    <div class="flex items-start justify-between gap-2">
                        <div class="flex items-center space-x-3">
                            ${photoEl}
                            <div>
                                <h4 class="font-black text-white text-sm group-hover:text-blue-300 transition-colors">${escapeHtml(user.name)}</h4>
                                <p class="text-[11px] text-slate-400 font-bold">${escapeHtml(user.role)}, ${escapeHtml(user.dept)}</p>
                            </div>
                        </div>
                    </div>
                    <div class="text-[11px] font-mono text-slate-400 truncate flex items-center space-x-1.5">
                        <i data-lucide="mail" class="w-3.5 h-3.5 text-slate-500 shrink-0"></i>
                        <span class="truncate">${escapeHtml(user.email)}</span>
                    </div>
                    <div class="flex items-center justify-between pt-2 border-t border-slate-800/80">
                        <span class="text-[10px] font-black px-2 py-0.5 rounded-lg border ${user.badgeClass} font-mono">
                            ${escapeHtml(user.badge)}
                        </span>
                        <span class="text-xs text-blue-400 font-black flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                            <span>লগইন করুন</span>
                            <i data-lucide="arrow-right" class="w-3.5 h-3.5 stroke-[3]"></i>
                        </span>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    lucide.createIcons();
}

function switchLoginView(mode) {
    const profView = document.getElementById('login-view-profiles');
    const credView = document.getElementById('login-view-credentials');
    const profTab = document.getElementById('login-tab-profiles');
    const credTab = document.getElementById('login-tab-credentials');

    if (mode === 'profiles') {
        if (profView) profView.classList.remove('hidden');
        if (credView) credView.classList.add('hidden');
        if (profTab) {
            profTab.className = 'flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 bg-blue-600 text-white shadow-sm cursor-pointer';
        }
        if (credTab) {
            credTab.className = 'flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer';
        }
    } else {
        if (profView) profView.classList.add('hidden');
        if (credView) credView.classList.remove('hidden');
        if (credTab) {
            credTab.className = 'flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 bg-blue-600 text-white shadow-sm cursor-pointer';
        }
        if (profTab) {
            profTab.className = 'flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer';
        }
    }
    lucide.createIcons();
}

function loginAs(userId) {
    const user = USERS[userId];
    if (!user) return;

    showLoginFeedback(`স্বাগতম, ${user.name}! সিস্টেমে প্রবেশ করা হচ্ছে...`, 'success');

    setTimeout(() => {
        localStorage.setItem('radiant_portal_user_id', userId);
        currentRole = parseInt(userId);

        const loginScreen = document.getElementById('login-screen');
        const appContainer = document.getElementById('app-container');
        if (loginScreen) loginScreen.classList.add('hidden');
        if (appContainer) appContainer.classList.remove('hidden');

        const switcher = document.getElementById('role-switcher');
        if (switcher) switcher.value = userId;

        initRoleSwitcher();
        updateHeaderProfileUI();
        renderPlanView();
        if (currentTab === 'store') renderStoreTab();
        if (currentTab === 'design') renderDesignTab();
        loadDashboard();
        lucide.createIcons();
    }, 350);
}

function handleCredentialLogin(e) {
    if (e) e.preventDefault();
    const select = document.getElementById('login-email-select');
    const pwdInput = document.getElementById('login-password-input');
    const userId = select ? select.value : 1;
    const pwd = pwdInput ? pwdInput.value.trim() : '';

    if (!pwd) {
        showLoginFeedback('অনুগ্রহ করে পাসওয়ার্ড বা পিন দিন (Default: 1234)', 'error');
        return;
    }

    loginAs(parseInt(userId));
}

function showLoginFeedback(msg, type = 'info') {
    const fb = document.getElementById('login-feedback');
    if (!fb) return;
    fb.classList.remove('hidden');
    if (type === 'error') {
        fb.className = 'p-3 rounded-xl text-xs font-bold text-center bg-rose-950/80 border border-rose-500 text-rose-200';
    } else {
        fb.className = 'p-3 rounded-xl text-xs font-bold text-center bg-emerald-950/80 border border-emerald-500 text-emerald-200';
    }
    fb.innerText = msg;
}

function handleLogout() {
    localStorage.removeItem('radiant_portal_user_id');
    const loginScreen = document.getElementById('login-screen');
    const appContainer = document.getElementById('app-container');
    if (appContainer) appContainer.classList.add('hidden');
    if (loginScreen) loginScreen.classList.remove('hidden');
    renderLoginProfiles();
    lucide.createIcons();
}

// StepHub Inspired Promotional Material Management System (PMMD Connect)

let currentTab = 'plan';

let currentRole = 1; // 1: Didarul Islam (Admin), 2: Zahid, 3: Tanim, 4: Mony, 5: Subhani, 6: Rakibuzzaman

let currentYear = 2027;

let currentPlanType = 'Regular'; // 'Regular', 'Special', 'All'

let currentMaterialType = 'BR'; // 'BR', 'PPM', 'All'

let currentFilterMonth = 'All';

let currentViewMode = 'cards'; // Default to Cards view



let allItems = [];

let filteredItems = [];

let currentEditingItem = null;

let monthlyChart = null;

let categoryChart = null;



const USERS = {

    1: { name: 'Md. Didarul Islam', role: 'Brand Manager (Admin)', dept: 'SMD', email: 'didarul.islam@radiant.com.bd', mobile: '01521209127', avatar: 'DI', banner: 'Active Profile: 👑 Md. Didarul Islam (Brand Manager, SMD). You can name items, verify budgets, and grant approval.' },

    2: { name: 'Md. Zahid Hasan', role: 'Sr. Asst. Manager', dept: 'PMMD', email: 'zahid.hasan@radiant.com.bd', mobile: '01833183299', avatar: 'ZH', banner: 'Active Profile: 📋 Md. Zahid Hasan (Sr. Asst. Manager, PMMD). You manage vendor sourcing, PO issuance, and supply schedules.' },

    3: { name: 'Tanim Bin Mahmud', role: 'Asst. Manager', dept: 'PMMD', email: 'tanim.mahmud@radiant.com.bd', mobile: '01975296411', avatar: 'TM', banner: 'Active Profile: 📋 Tanim Bin Mahmud (Asst. Manager, PMMD). You manage vendor orders, sample checks, and item supply timelines.' },

    4: { name: 'Md Whahedur Rahman Mony', role: 'Officer', dept: 'PMMD', email: 'whahedur.rahman@radiant.com.bd', mobile: '01721340117', avatar: 'WM', banner: 'Active Profile: 📋 Md Whahedur Rahman Mony (Officer, PMMD). You track PO issues, production status, and logistics follow-ups.' },

    5: { name: 'Md. Subhani Sujon', role: 'Asst. Manager (Design)', dept: 'PMMD', email: 'subhani.sujon@radiant.com.bd', mobile: '01795326161', avatar: 'SS', banner: 'Active Profile: 🎨 Md. Subhani Sujon (Packaging Design, PMMD). You oversee artwork design, box packaging proofs, and brand guideline visual approvals.' },

    6: { name: 'Md. Rakibuzzaman', role: 'Sr. Asst. Manager (Store)', dept: 'PMMD', email: 'md.rakibuzzaman@radiant.com.bd', mobile: '01916405683', avatar: 'RZ', banner: 'Active Profile: 📦 Md. Rakibuzzaman (Store & Logistics, PMMD). You log warehouse Store-in Dates, Dispersion Dates, and track physical field force allocations.' }

};



function formatBDT(amount) {

    if (!amount && amount !== 0) return '0';

    return '' + Number(amount).toLocaleString('en-US', { maximumFractionDigits: 0 });

}



function formatNum(num) {

    if (!num && num !== 0) return '0';

    return Number(num).toLocaleString('en-US');

}



function debounce(func, wait) {

    let timeout;

    return function (...args) {

        clearTimeout(timeout);

        timeout = setTimeout(() => func.apply(this, args), wait);

    };

}



// Brand Logo Component Generator (Larger, High Contrast, Distinct Borders)

function getBrandLogoBadge(productName, extraClass = '', size = 'md') {

    if (productName === 'Exium') {

        const heightClass = size === 'lg' ? 'h-11 px-4 py-1' : (size === 'sm' ? 'h-7 px-2 py-0.5' : 'h-8 px-2.5 py-0.5');

        const imgHeight = size === 'lg' ? 'h-8' : (size === 'sm' ? 'h-4.5' : 'h-5');

        const maxW = size === 'lg' ? 'max-w-[130px]' : (size === 'sm' ? 'max-w-[85px]' : 'max-w-[105px]');

        return `

            <div class="${heightClass} rounded-xl bg-white border-2 border-slate-300 shadow-2xs flex items-center justify-center transition-all shrink-0 ${extraClass}" title="Exium">

                <img src="static/uploads/exium_logo.png" alt="Exium" class="${imgHeight} w-auto ${maxW} object-contain">

            </div>

        `;

    } else if (productName === 'Exium MUPS') {

        const heightClass = size === 'lg' ? 'h-11 px-4 py-1' : (size === 'sm' ? 'h-7 px-2 py-0.5' : 'h-8 px-2.5 py-0.5');

        const imgHeight = size === 'lg' ? 'h-7' : (size === 'sm' ? 'h-4' : 'h-5');

        const maxW = size === 'lg' ? 'max-w-[145px]' : (size === 'sm' ? 'max-w-[95px]' : 'max-w-[115px]');

        return `

            <div class="${heightClass} rounded-xl bg-white border-2 border-slate-300 shadow-2xs flex items-center justify-center transition-all shrink-0 ${extraClass}" title="Exium MUPS">

                <img src="static/uploads/exium_mups_logo.png" alt="Exium MUPS" class="${imgHeight} w-auto ${maxW} object-contain">

            </div>

        `;

    } else {

        return `<span class="badge bg-slate-200 text-slate-900 border-2 border-slate-300 font-black text-xs shrink-0 ${extraClass}">${escapeHtml(productName)}</span>`;

    }

}



document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});



// Role Switcher Setup & Header Profile UI

function switchRoleTo(roleId) {

    const switcher = document.getElementById('role-switcher');

    if (switcher) {

        switcher.value = roleId;

        currentRole = parseInt(roleId);

        updateHeaderProfileUI();

        renderPlanView();

        if (currentTab === 'store') renderStoreTab();

        if (currentTab === 'design') renderDesignTab();

    }

}



function initRoleSwitcher() {

    const switcher = document.getElementById('role-switcher');

    switcher.addEventListener('change', (e) => {

        currentRole = parseInt(e.target.value);

        updateHeaderProfileUI();

        

        renderPlanView();

        if (currentTab === 'store') renderStoreTab();

        if (currentTab === 'design') renderDesignTab();

    });

    updateHeaderProfileUI();

}



function updateHeaderProfileUI() {

    const user = USERS[currentRole];

    if (!user) return;

    

    const nameEl = document.getElementById('user-name-display');

    const roleEl = document.getElementById('user-role-display');

    const bannerEl = document.getElementById('role-banner');

    const avatarContainer = document.getElementById('user-avatar-container');



    if (nameEl) nameEl.innerText = user.name;

    if (roleEl) roleEl.innerText = user.role;

    if (bannerEl) {

        bannerEl.classList.add('hidden');

    }



    if (avatarContainer) {

        if (user.profile_image && user.profile_image.trim() !== '') {

            avatarContainer.innerHTML = `<img src="/uploads/${escapeHtml(user.profile_image)}" alt="${escapeHtml(user.name)}" class="w-full h-full object-cover">`;

        } else {

            avatarContainer.innerHTML = `<span id="user-avatar" class="font-black text-xs">${escapeHtml(user.avatar || 'DI')}</span>`;

        }

    }

}



// 1-Click Profile Photo Upload from Header Avatar

function triggerProfilePhotoUpload() {

    const input = document.getElementById('user-profile-file-input');

    if (input) input.click();

}



async function handleProfilePhotoSelected(input) {

    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    const formData = new FormData();

    formData.append('file', file);



    try {

        const res = await fetch(`/api/team/${currentRole}/photo`, {

            method: 'POST',

            body: formData

        });

        const data = await res.json();

        if (data.success) {

            if (USERS[currentRole]) {

                USERS[currentRole].profile_image = data.profile_image;

            }

            updateHeaderProfileUI();

            await loadTeam();

        } else {

            alert('Upload failed: ' + (data.error || 'Failed to upload photo'));

        }

    } catch (err) {

        console.error('Error uploading profile photo:', err);

    }

    input.value = '';

}



// Member Photo Upload in Team Directory

let targetUploadMemberId = null;



function triggerMemberPhotoUpload(memberId) {

    targetUploadMemberId = memberId;

    const input = document.getElementById('team-member-file-input');

    if (input) input.click();

}



async function handleMemberPhotoSelected(input) {

    if (!input.files || input.files.length === 0 || !targetUploadMemberId) return;

    const file = input.files[0];

    const formData = new FormData();

    formData.append('file', file);



    try {

        const res = await fetch(`/api/team/${targetUploadMemberId}/photo`, {

            method: 'POST',

            body: formData

        });

        const data = await res.json();

        if (data.success) {

            if (USERS[targetUploadMemberId]) {

                USERS[targetUploadMemberId].profile_image = data.profile_image;

            }

            if (currentRole === targetUploadMemberId) {

                updateHeaderProfileUI();

            }

            await loadTeam();

        } else {

            alert('Upload failed: ' + (data.error || 'Failed to upload photo'));

        }

    } catch (err) {

        console.error('Error uploading member photo:', err);

    }

    input.value = '';

    targetUploadMemberId = null;

}



// Year Management

async function loadYears() {

    try {

        const res = await fetch('/api/years');

        const years = await res.json();

        const select = document.getElementById('global-year-select');

        select.innerHTML = years.map(y => `

            <option value="${y}" ${y === currentYear ? 'selected' : ''}>${y}</option>

        `).join('');

    } catch (err) {

        console.error('Error loading years:', err);

    }

}



function changeYear(year) {

    currentYear = parseInt(year);

    document.getElementById('dash-year-lbl').innerText = currentYear;

    loadDashboard();

    loadItems();

}



function openCloneYearModal() {

    openModal('clone-year-modal');

}



async function handleCloneYear(e) {

    e.preventDefault();

    const targetYear = parseInt(document.getElementById('clone-target-year').value);

    try {

        const res = await fetch('/api/years/initialize', {

            method: 'POST',

            headers: { 'Content-Type': 'application/json' },

            body: JSON.stringify({

                year: targetYear,

                source_year: currentYear,

                actor_name: USERS[currentRole].name

            })

        });

        const data = await res.json();

        if (res.ok) {

            closeModal('clone-year-modal');

            await loadYears();

            changeYear(targetYear);

            alert(`Initialized ${data.count} promotional items for year ${targetYear}!`);

        } else {

            alert('Error: ' + data.error);

        }

    } catch (err) {

        console.error('Error cloning year:', err);

    }

}



// Plan Scope Segment (Regular Plan vs Special Plan)

function setPlanType(type) {

    currentPlanType = type;



    const btnReg = document.getElementById('plan-btn-regular');

    const btnSpec = document.getElementById('plan-btn-special');

    const btnAll = document.getElementById('plan-btn-all');



    if (btnReg && btnSpec && btnAll) {

        if (type === 'Regular') {

            btnReg.className = 'px-5 py-2.5 rounded-xl text-xs font-black bg-slate-900 text-white border-2 border-slate-900 shadow-sm flex items-center space-x-2 transition-all';

            btnSpec.className = 'px-5 py-2.5 rounded-xl text-xs font-black bg-white text-slate-900 border-2 border-slate-300 hover:border-amber-500 hover:bg-amber-50 flex items-center space-x-2 transition-all';

            btnAll.className = 'px-4 py-2.5 rounded-xl text-xs font-black bg-white text-slate-900 border-2 border-slate-300 hover:border-slate-900 flex items-center space-x-1.5 transition-all';

        } else if (type === 'Special') {

            btnReg.className = 'px-5 py-2.5 rounded-xl text-xs font-black bg-white text-slate-900 border-2 border-slate-300 hover:border-slate-900 flex items-center space-x-2 transition-all';

            btnSpec.className = 'px-5 py-2.5 rounded-xl text-xs font-black bg-amber-500 text-slate-950 border-2 border-amber-600 shadow-sm flex items-center space-x-2 transition-all';

            btnAll.className = 'px-4 py-2.5 rounded-xl text-xs font-black bg-white text-slate-900 border-2 border-slate-300 hover:border-slate-900 flex items-center space-x-1.5 transition-all';

        } else {

            btnReg.className = 'px-5 py-2.5 rounded-xl text-xs font-black bg-white text-slate-900 border-2 border-slate-300 hover:border-slate-900 flex items-center space-x-2 transition-all';

            btnSpec.className = 'px-5 py-2.5 rounded-xl text-xs font-black bg-white text-slate-900 border-2 border-slate-300 hover:border-amber-500 hover:bg-amber-50 flex items-center space-x-2 transition-all';

            btnAll.className = 'px-4 py-2.5 rounded-xl text-xs font-black bg-slate-900 text-white border-2 border-slate-900 shadow-sm flex items-center space-x-1.5 transition-all';

        }

    }



    applyFilters();

}



// Material Type Segment (Distinct Buttons with Borders)

function setMaterialType(type) {

    currentMaterialType = type;



    const btnBr = document.getElementById('mat-btn-br');

    const btnPpm = document.getElementById('mat-btn-ppm');

    const btnAll = document.getElementById('mat-btn-all');



    if (type === 'BR') {

        btnBr.className = 'stephub-pill px-5 py-2.5 rounded-xl text-xs font-black bg-slate-900 text-white border-2 border-slate-900 shadow-sm flex items-center space-x-2';

        btnPpm.className = 'stephub-pill px-5 py-2.5 rounded-xl text-xs font-black bg-white text-slate-900 border-2 border-slate-300 hover:border-emerald-700 flex items-center space-x-2';

        btnAll.className = 'stephub-pill px-4 py-2.5 rounded-xl text-xs font-black bg-white text-slate-900 border-2 border-slate-300 hover:border-slate-900 flex items-center space-x-1.5';

    } else if (type === 'PPM') {

        btnBr.className = 'stephub-pill px-5 py-2.5 rounded-xl text-xs font-black bg-white text-slate-900 border-2 border-slate-300 hover:border-slate-900 flex items-center space-x-2';

        btnPpm.className = 'stephub-pill px-5 py-2.5 rounded-xl text-xs font-black bg-emerald-700 text-white border-2 border-emerald-700 shadow-sm flex items-center space-x-2';

        btnAll.className = 'stephub-pill px-4 py-2.5 rounded-xl text-xs font-black bg-white text-slate-900 border-2 border-slate-300 hover:border-slate-900 flex items-center space-x-1.5';

    } else {

        btnBr.className = 'stephub-pill px-5 py-2.5 rounded-xl text-xs font-black bg-white text-slate-900 border-2 border-slate-300 hover:border-slate-900 flex items-center space-x-2';

        btnPpm.className = 'stephub-pill px-5 py-2.5 rounded-xl text-xs font-black bg-white text-slate-900 border-2 border-slate-300 hover:border-emerald-700 flex items-center space-x-2';

        btnAll.className = 'stephub-pill px-4 py-2.5 rounded-xl text-xs font-black bg-slate-900 text-white border-2 border-slate-900 shadow-sm flex items-center space-x-1.5';

    }



    updateCategoryDropdown();

    applyFilters();

}



function updateCategoryDropdown() {

    const select = document.getElementById('filter-category');

    const label = document.getElementById('filter-category-label');

    if (currentMaterialType === 'BR') {

        if (label) label.innerText = 'BR Category';

        select.innerHTML = `

            <option value="All">All BR Categories</option>

            <option value="Special BR">Special BR (Rate: 600)</option>

            <option value="Regular BR">Regular BR (Rate: 300)</option>

            <option value="Call Gadget">Call Gadget (Rate: 150)</option>

            <option value="Special Item">Special Item</option>

        `;

    } else if (currentMaterialType === 'PPM') {

        if (label) label.innerText = 'PPM Category';

        select.innerHTML = `

            <option value="All">All PPM Categories</option>

            <option value="Exclusive Pen">Exclusive Pen (Rate: 40)</option>

            <option value="Regular Pen">Regular Pen (Rate: 20)</option>

            <option value="Prescription Pad (PP)">Prescription Pad (PP - 40)</option>

            <option value="Slip Pad (SLP)">Slip Pad (SLP - 12)</option>

            <option value="Educational Pad (Edu)">Educational Pad (Edu - 40)</option>

            <option value="Sales Aid (SA)">Sales Aid (SA - 15)</option>

            <option value="Special Item">Special Item</option>

        `;

    } else {

        if (label) label.innerText = 'Category';

        select.innerHTML = `

            <option value="All">All Categories (BR & PPM)</option>

            <option value="Special BR">Special BR</option>

            <option value="Regular BR">Regular BR</option>

            <option value="Call Gadget">Call Gadget</option>

            <option value="Exclusive Pen">Exclusive Pen</option>

            <option value="Regular Pen">Regular Pen</option>

            <option value="Prescription Pad (PP)">Prescription Pad (PP)</option>

            <option value="Slip Pad (SLP)">Slip Pad (SLP)</option>

            <option value="Educational Pad (Edu)">Educational Pad (Edu)</option>

            <option value="Sales Aid (SA)">Sales Aid (SA)</option>

            <option value="Special Item">Special Item</option>

        `;

    }

}



// View Mode Switcher

function setViewMode(mode) {

    currentViewMode = mode;

    const btnCards = document.getElementById('view-mode-cards');

    const btnTable = document.getElementById('view-mode-table');

    if (mode === 'cards') {

        document.getElementById('items-cards-view').classList.remove('hidden');

        document.getElementById('items-table-view').classList.add('hidden');

        btnCards.className = 'px-4 py-2 rounded-xl text-xs font-black bg-slate-900 text-white border-2 border-slate-900 shadow-sm flex items-center space-x-1.5 transition-all';

        btnTable.className = 'px-4 py-2 rounded-xl text-xs font-black bg-white text-slate-900 border-2 border-slate-300 hover:border-slate-900 flex items-center space-x-1.5 transition-all';

    } else {

        document.getElementById('items-cards-view').classList.add('hidden');

        document.getElementById('items-table-view').classList.remove('hidden');

        btnTable.className = 'px-4 py-2 rounded-xl text-xs font-black bg-slate-900 text-white border-2 border-slate-900 shadow-sm flex items-center space-x-1.5 transition-all';

        btnCards.className = 'px-4 py-2 rounded-xl text-xs font-black bg-white text-slate-900 border-2 border-slate-300 hover:border-slate-900 flex items-center space-x-1.5 transition-all';

    }

    renderPlanView();

}



// Tab Switching

function switchTab(tabId) {

    currentTab = tabId;

    document.querySelectorAll('main > section').forEach(sec => sec.classList.add('hidden'));

    document.getElementById(`tab-${tabId}`).classList.remove('hidden');



    document.querySelectorAll('.tab-btn').forEach(btn => {

        btn.className = 'tab-btn px-4 py-2 rounded-xl flex items-center space-x-2 bg-white text-slate-900 border-2 border-slate-200 hover:border-slate-800 hover:bg-slate-50 font-black transition-all';

    });

    const activeBtn = document.getElementById(`tab-btn-${tabId}`);

    if (activeBtn) {

        activeBtn.className = 'tab-btn px-4 py-2 rounded-xl flex items-center space-x-2 text-white bg-slate-900 border-2 border-slate-900 shadow-sm font-black transition-all';

    }



    if (tabId === 'plan') applyFilters();

    if (tabId === 'dashboard') loadDashboard();

    if (tabId === 'store') renderStoreTab();

    if (tabId === 'design') renderDesignTab();

    if (tabId === 'team') loadTeam();



    lucide.createIcons();

}



// ----------------- LOAD & FILTER ITEMS -----------------

async function loadItems() {

    try {

        const res = await fetch(`/api/items?year=${currentYear}`);

        allItems = await res.json();

        document.getElementById('nav-item-count').innerText = allItems.length;



        const regCnt = allItems.filter(i => (i.plan_type || 'Regular') === 'Regular').length;

        const specCnt = allItems.filter(i => i.plan_type === 'Special').length;

        const regBadge = document.getElementById('regular-count-badge');

        const specBadge = document.getElementById('special-count-badge');

        if (regBadge) regBadge.innerText = regCnt;

        if (specBadge) specBadge.innerText = specCnt;



        updateCategoryDropdown();

        applyFilters();

    } catch (err) {

        console.error('Error loading items:', err);

    }

}



function setFilterMonth(month) {

    currentFilterMonth = month;

    document.querySelectorAll('.month-pill').forEach(btn => {

        const m = btn.dataset.month;

        const isActive = (m === month);



        if (m === 'All') {

            btn.className = isActive 

                ? 'month-pill active px-4 py-2 rounded-xl bg-slate-900 text-white border-2 border-slate-900 shadow-md font-black whitespace-nowrap transition-all'

                : 'month-pill px-4 py-2 rounded-xl bg-slate-100 text-slate-950 border-2 border-slate-300 hover:border-slate-800 font-black whitespace-nowrap transition-all';

        } else if (['Jan', 'Feb', 'Mar'].includes(m)) {

            // Q1: Sky Pastel

            btn.className = isActive

                ? 'month-pill active px-4 py-2 rounded-xl bg-sky-600 text-white border-2 border-sky-700 shadow-md font-black whitespace-nowrap transition-all'

                : 'month-pill px-4 py-2 rounded-xl bg-sky-50/80 text-sky-950 border-2 border-sky-300 hover:border-sky-600 hover:bg-sky-100 font-black whitespace-nowrap transition-all';

        } else if (['Apr', 'May', 'Jun'].includes(m)) {

            // Q2: Emerald/Mint Pastel

            btn.className = isActive

                ? 'month-pill active px-4 py-2 rounded-xl bg-emerald-700 text-white border-2 border-emerald-800 shadow-md font-black whitespace-nowrap transition-all'

                : 'month-pill px-4 py-2 rounded-xl bg-emerald-50/80 text-emerald-950 border-2 border-emerald-300 hover:border-emerald-600 hover:bg-emerald-100 font-black whitespace-nowrap transition-all';

        } else if (['Jul', 'Aug', 'Sep'].includes(m)) {

            // Q3: Warm Amber Pastel

            btn.className = isActive

                ? 'month-pill active px-4 py-2 rounded-xl bg-amber-600 text-white border-2 border-amber-700 shadow-md font-black whitespace-nowrap transition-all'

                : 'month-pill px-4 py-2 rounded-xl bg-amber-50/80 text-amber-950 border-2 border-amber-300 hover:border-amber-600 hover:bg-amber-100 font-black whitespace-nowrap transition-all';

        } else {

            // Q4: Violet/Purple Pastel

            btn.className = isActive

                ? 'month-pill active px-4 py-2 rounded-xl bg-purple-700 text-white border-2 border-purple-800 shadow-md font-black whitespace-nowrap transition-all'

                : 'month-pill px-4 py-2 rounded-xl bg-purple-50/80 text-purple-950 border-2 border-purple-300 hover:border-purple-600 hover:bg-purple-100 font-black whitespace-nowrap transition-all';

        }

    });

    applyFilters();

}



function applyFilters() {

    const brand = document.getElementById('filter-brand').value;

    const cat = document.getElementById('filter-category').value;

    const status = document.getElementById('filter-status').value;

    const search = document.getElementById('filter-search').value.toLowerCase().trim();



    // Dynamically update BR and PPM counts based on current plan scope

    const scopeItems = currentPlanType === 'All'

        ? allItems

        : allItems.filter(i => (i.plan_type || 'Regular') === currentPlanType);

    const brCnt = scopeItems.filter(i => i.material_type === 'BR').length;

    const ppmCnt = scopeItems.filter(i => i.material_type === 'PPM').length;

    const brBadge = document.getElementById('br-count-badge');

    const ppmBadge = document.getElementById('ppm-count-badge');

    if (brBadge) brBadge.innerText = brCnt;

    if (ppmBadge) ppmBadge.innerText = ppmCnt;



    filteredItems = allItems.filter(item => {

        if (currentPlanType !== 'All' && (item.plan_type || 'Regular') !== currentPlanType) return false;

        if (currentMaterialType !== 'All' && item.material_type !== currentMaterialType) return false;

        if (currentFilterMonth !== 'All' && item.month !== currentFilterMonth) return false;

        if (brand !== 'All' && item.product_name !== brand) return false;

        if (cat !== 'All') {

            if (cat === 'Special Item') {

                if (item.category !== 'Special Item' && item.plan_type !== 'Special') return false;

            } else if (item.category !== cat) {

                return false;

            }

        }

        if (status !== 'All' && item.approval_status !== status) return false;

        if (search) {

            const matchName = item.item_name && item.item_name.toLowerCase().includes(search);

            const matchSap = item.sap_code && item.sap_code.toLowerCase().includes(search);

            const matchLeg = item.legacy_code && item.legacy_code.toLowerCase().includes(search);

            const matchPo = item.po_number && item.po_number.toLowerCase().includes(search);

            const matchCat = item.category && item.category.toLowerCase().includes(search);

            const matchNote = item.approval_note && item.approval_note.toLowerCase().includes(search);

            if (!matchName && !matchSap && !matchLeg && !matchPo && !matchCat && !matchNote) return false;

        }

        return true;

    });



    const totalVal = filteredItems.filter(i => i.item_name && i.item_name.trim() !== '').reduce((acc, curr) => acc + (curr.total_price || 0), 0);

    const finalizedCount = filteredItems.filter(i => i.item_name && i.item_name.trim() !== '').length;



    document.getElementById('filtered-items-count').innerText = filteredItems.length;

    document.getElementById('filtered-items-value').innerText = formatBDT(totalVal);

    document.getElementById('section-finalized-count').innerText = `${finalizedCount} / ${filteredItems.length}`;



    renderPlanView();

}



function renderPlanView() {

    if (currentViewMode === 'cards') {

        renderCardsGrid();

    } else {

        renderItemsTable();

    }

    lucide.createIcons();

}



// Direct 1-Click Card Image Upload

function triggerCardImageUpload(itemId) {

    const fileInput = document.createElement('input');

    fileInput.type = 'file';

    fileInput.accept = 'image/*';

    fileInput.onchange = async () => {

        if (!fileInput.files || fileInput.files.length === 0) return;

        const file = fileInput.files[0];

        const formData = new FormData();

        formData.append('file', file);

        try {

            const res = await fetch('/api/upload', { method: 'POST', body: formData });

            const data = await res.json();

            if (data.success) {

                await fetch(`/api/items/${itemId}`, {

                    method: 'PUT',

                    headers: { 'Content-Type': 'application/json' },

                    body: JSON.stringify({ item_image: data.filename, actor_name: USERS[currentRole].name })

                });

                await loadItems();

            } else {

                alert('Upload failed: ' + data.error);

            }

        } catch (err) {

            console.error('Error uploading card image:', err);

        }

    };

    fileInput.click();

}



// Distinct Light Pastel Category Badges

function getCategoryBadge(category) {

    const cat = category || '';

    if (cat.includes('Special BR')) {

        return `<span class="px-2 py-0.5 rounded-lg bg-purple-100 text-purple-950 border-2 border-purple-300 text-xs font-black shadow-2xs whitespace-nowrap shrink-0">${escapeHtml(cat)}</span>`;

    } else if (cat.includes('Regular BR')) {

        return `<span class="px-2 py-0.5 rounded-lg bg-blue-100 text-blue-950 border-2 border-blue-300 text-xs font-black shadow-2xs whitespace-nowrap shrink-0">${escapeHtml(cat)}</span>`;

    } else if (cat.includes('Call Gadget')) {

        return `<span class="px-2 py-0.5 rounded-lg bg-sky-100 text-sky-950 border-2 border-sky-300 text-xs font-black shadow-2xs whitespace-nowrap shrink-0">${escapeHtml(cat)}</span>`;

    } else if (cat.includes('Exclusive Pen')) {

        return `<span class="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-950 border-2 border-amber-300 text-xs font-black shadow-2xs whitespace-nowrap shrink-0">${escapeHtml(cat)}</span>`;

    } else if (cat.includes('Regular Pen')) {

        return `<span class="px-2 py-0.5 rounded-lg bg-orange-100 text-orange-950 border-2 border-orange-300 text-xs font-black shadow-2xs whitespace-nowrap shrink-0">${escapeHtml(cat)}</span>`;

    } else if (cat.includes('Prescription Pad')) {

        return `<span class="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-950 border-2 border-emerald-300 text-xs font-black shadow-2xs whitespace-nowrap shrink-0">${escapeHtml(cat)}</span>`;

    } else if (cat.includes('Slip Pad')) {

        return `<span class="px-2 py-0.5 rounded-lg bg-teal-100 text-teal-950 border-2 border-teal-300 text-xs font-black shadow-2xs whitespace-nowrap shrink-0">${escapeHtml(cat)}</span>`;

    } else if (cat.includes('Educational Pad')) {

        return `<span class="px-2 py-0.5 rounded-lg bg-indigo-100 text-indigo-950 border-2 border-indigo-300 text-xs font-black shadow-2xs whitespace-nowrap shrink-0">${escapeHtml(cat)}</span>`;

    } else if (cat.includes('Sales Aid')) {

        return `<span class="px-2 py-0.5 rounded-lg bg-rose-100 text-rose-950 border-2 border-rose-300 text-xs font-black shadow-2xs whitespace-nowrap shrink-0">${escapeHtml(cat)}</span>`;

    } else {

        return `<span class="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-900 border-2 border-slate-300 text-xs font-black shadow-2xs whitespace-nowrap shrink-0">${escapeHtml(cat)}</span>`;

    }

}



function getMonthQuarterBadge(month, year) {

    const m = month || '';

    let badgeClass = 'bg-sky-900 text-white border-sky-700';

    if (['Jan', 'Feb', 'Mar'].includes(m)) {

        badgeClass = 'bg-sky-900 text-white border-sky-700';

    } else if (['Apr', 'May', 'Jun'].includes(m)) {

        badgeClass = 'bg-emerald-800 text-white border-emerald-600';

    } else if (['Jul', 'Aug', 'Sep'].includes(m)) {

        badgeClass = 'bg-amber-900 text-white border-amber-700';

    } else if (['Oct', 'Nov', 'Dec'].includes(m)) {

        badgeClass = 'bg-purple-900 text-white border-purple-700';

    }

    return `<span class="absolute top-2.5 left-2.5 ${badgeClass} text-xs font-black px-2.5 py-1 rounded-lg shadow-sm border">${m} ${year}</span>`;

}



function getTableMonthBadge(month, year) {

    const m = month || '';

    if (['Jan', 'Feb', 'Mar'].includes(m)) {

        return `<span class="px-2.5 py-1 rounded-lg bg-sky-100 text-sky-950 border-2 border-sky-300 font-black text-xs whitespace-nowrap shadow-2xs">${m} ${year}</span>`;

    } else if (['Apr', 'May', 'Jun'].includes(m)) {

        return `<span class="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-950 border-2 border-emerald-300 font-black text-xs whitespace-nowrap shadow-2xs">${m} ${year}</span>`;

    } else if (['Jul', 'Aug', 'Sep'].includes(m)) {

        return `<span class="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-950 border-2 border-amber-300 font-black text-xs whitespace-nowrap shadow-2xs">${m} ${year}</span>`;

    } else {

        return `<span class="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-950 border-2 border-purple-300 font-black text-xs whitespace-nowrap shadow-2xs">${m} ${year}</span>`;

    }

}



// ----------------- DISTINCT & COLORFUL LIGHT PASTEL CARDS CATALOG -----------------

function renderCardsGrid() {

    const grid = document.getElementById('items-cards-view');

    if (filteredItems.length === 0) {

        if (currentPlanType === 'Special') {

            grid.innerHTML = `

                <div class="col-span-full py-16 text-center bg-amber-50/70 border-2 border-dashed border-amber-300 rounded-3xl p-8 space-y-3">

                    <div class="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto border-2 border-amber-300 shadow-xs">

                        <i data-lucide="sparkles" class="w-7 h-7 stroke-[2.5]"></i>

                    </div>

                    <h3 class="font-black text-slate-950 text-base">No Special Plan Items in ${currentYear}</h3>

                    <p class="text-xs text-slate-700 font-bold max-w-md mx-auto">

                        Special Plan items are ad-hoc promotional materials added on demand with prior approval. Item names, quantities, and prices are flexible.

                    </p>

                    <button onclick="openAddSpecialItemModal()" class="mt-2 inline-flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-5 py-2.5 rounded-2xl border-2 border-amber-600 shadow-sm transition-all">

                        <i data-lucide="plus-circle" class="w-4 h-4 stroke-[3]"></i>

                        <span>+ Add Special Plan Item</span>

                    </button>

                </div>

            `;

        } else {

            grid.innerHTML = `<div class="col-span-full py-16 text-center text-slate-800 font-black text-sm">No promotional items found matching the criteria.</div>`;

        }

        lucide.createIcons();

        return;

    }



    grid.innerHTML = filteredItems.map(item => {

        const isApproved = item.approval_status === 'Approved';

        const isBR = item.material_type === 'BR';

        

        // Brand Logo Badge (Larger, distinct border, crisp)

        const brandLogoBadge = getBrandLogoBadge(item.product_name, '', 'md');



        const matBadge = isBR

            ? '<span class="px-2 py-0.5 rounded-lg bg-indigo-900 text-white font-mono font-black text-[11px] tracking-wide shadow-2xs shrink-0">BR</span>'

            : '<span class="px-2 py-0.5 rounded-lg bg-emerald-800 text-white font-mono font-black text-[11px] tracking-wide shadow-2xs shrink-0">PPM</span>';



        const categoryBadge = getCategoryBadge(item.category);

        const isSpecial = item.plan_type === 'Special';

        const planBadge = isSpecial

            ? '<span class="px-2 py-0.5 rounded-lg bg-amber-200 text-amber-950 border border-amber-400 font-black text-[10px] tracking-wide shadow-2xs shrink-0 flex items-center space-x-1"><i data-lucide="sparkles" class="w-3 h-3 text-amber-700 stroke-[3]"></i><span>Special</span></span>'

            : '';



        const approvalBadge = isApproved

            ? `<span class="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-100 border-2 border-emerald-400 text-emerald-950 font-black text-xs shadow-2xs whitespace-nowrap shrink-0"><i data-lucide="check" class="w-3.5 h-3.5 mr-1 inline stroke-[3]"></i>Approved</span>`

            : `<span class="inline-flex items-center px-2.5 py-1 rounded-lg bg-amber-100 border-2 border-amber-400 text-amber-950 font-black text-xs shadow-2xs whitespace-nowrap shrink-0"><i data-lucide="clock" class="w-3.5 h-3.5 mr-1 inline stroke-[2.5]"></i>Pending</span>`;



        const hasName = item.item_name && item.item_name.trim() !== '';



        const nameDisplay = hasName 

            ? `

                <div class="mt-1">

                    <h4 class="font-black text-slate-950 text-sm hover:text-blue-700 transition-colors line-clamp-1">${escapeHtml(item.item_name)}</h4>

                </div>

              `

            : `

                <div class="mt-1">

                    <input type="text" placeholder="+ Enter Item Name" 

                           value="${escapeHtml(item.item_name || '')}"

                           onchange="quickSaveItemName(${item.id}, this.value)"

                           onclick="event.stopPropagation()"

                           class="w-full bg-white hover:bg-amber-50/50 focus:bg-white border-2 border-dashed border-amber-400 hover:border-amber-600 focus:border-amber-600 rounded-xl px-3 py-2 text-xs font-black text-slate-950 placeholder-amber-700/60 transition-all focus:outline-none shadow-2xs">

                </div>

              `;



        // Item Visual Container

        const hasItemImage = item.item_image && item.item_image.trim() !== '';

        const monthBadge = getMonthQuarterBadge(item.month, item.year);



        const imageFrame = hasItemImage

            ? `

                <div class="h-40 rounded-xl bg-white flex items-center justify-center p-2 relative overflow-hidden group/img transition-all">

                    <img src="/uploads/${escapeHtml(item.item_image)}" alt="${escapeHtml(item.item_name || 'Item Picture')}" class="max-h-full max-w-full object-contain filter drop-shadow-sm transition-transform duration-300 group-hover/img:scale-105">

                    ${monthBadge}

                    <button onclick="event.stopPropagation(); triggerCardImageUpload(${item.id})" title="Change item picture" class="absolute bottom-2.5 right-2.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white font-black text-xs shadow-md border border-slate-800 opacity-90 hover:opacity-100 transition-all flex items-center space-x-1.5">

                        <i data-lucide="camera" class="w-3.5 h-3.5 stroke-[2.5]"></i>

                        <span>Change</span>

                    </button>

                </div>

              `

            : `

                <div onclick="event.stopPropagation(); triggerCardImageUpload(${item.id})" 

                     title="Click to upload item / gadget photo" 

                     class="h-40 rounded-xl bg-slate-50/80 border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 flex flex-col items-center justify-center p-3 relative cursor-pointer transition-all group/box">

                    ${monthBadge}

                    <div class="w-12 h-12 rounded-2xl bg-white border-2 border-slate-300 shadow-xs flex items-center justify-center text-slate-700 group-hover/box:text-blue-600 group-hover/box:border-blue-400 transition-colors mb-2">

                        <i data-lucide="image-plus" class="w-6 h-6 stroke-[2.2]"></i>

                    </div>

                    <span class="text-xs font-black text-slate-900 group-hover/box:text-blue-700 transition-colors">

                        + Upload Item Photo

                    </span>

                    <span class="text-[11px] text-slate-600 font-bold mt-0.5">Click to choose image file</span>

                </div>

              `;



        const poPill = item.po_status === 'PO Issued'

            ? `<span class="px-2.5 py-0.5 rounded-md bg-blue-100 border border-blue-300 text-blue-950 font-mono font-black text-xs shadow-2xs">${escapeHtml(item.po_number || 'PO Issued')}</span>`

            : `<span class="px-2.5 py-0.5 rounded-md bg-white border-2 border-violet-200 text-violet-950 font-black text-xs shadow-2xs">${item.po_status}</span>`;



        // Color theme per segment

        const cardBorder = isBR

            ? 'border-2 border-blue-200 hover:border-blue-400 shadow-xs hover:shadow-md'

            : 'border-2 border-emerald-200 hover:border-emerald-400 shadow-xs hover:shadow-md';



        const headerBg = isBR

            ? 'bg-gradient-to-r from-blue-50 via-indigo-50/70 to-blue-50 border-2 border-blue-200/90'

            : 'bg-gradient-to-r from-emerald-50 via-teal-50/70 to-emerald-50 border-2 border-emerald-200/90';



        return `

            <div class="stephub-card p-4 flex flex-col justify-between group cursor-pointer ${cardBorder} transition-all bg-white" onclick="openItemModal(${item.id})">

                <div class="space-y-3.5">

                    

                    <!-- SEGMENT 1: CLASSIFICATION & BRAND HEADER (Light Blue / Light Mint) -->

                    <div class="${headerBg} rounded-xl p-2 flex items-center justify-between gap-1.5 shadow-2xs">

                        <div class="flex items-center space-x-1.5 min-w-0 flex-wrap">

                            ${brandLogoBadge}

                            ${matBadge}

                            ${categoryBadge}

                            ${planBadge}

                        </div>

                        <div class="shrink-0 ml-auto">${approvalBadge}</div>

                    </div>



                    <!-- SEGMENT 2: ITEM VISUAL PREVIEW (Soft Slate Frame) -->

                    <div class="rounded-xl border-2 border-slate-200 bg-slate-50/60 p-2 relative overflow-hidden shadow-2xs">

                        ${imageFrame}

                    </div>



                    <!-- SEGMENT 3: ITEM IDENTITY & DUAL CODES (Light Warm Amber Tone) -->

                    <div class="bg-amber-50/70 border-2 border-amber-200/90 rounded-xl p-3 space-y-2 shadow-2xs">

                        <div class="flex items-center justify-between">

                            <span class="text-[11px] font-black text-amber-950 uppercase tracking-wider flex items-center space-x-1">

                                <span class="w-2 h-2 rounded-full bg-amber-500"></span>

                                <span>Item</span>

                            </span>

                            ${hasName 

                                ? `<span class="text-[11px] font-black text-emerald-950 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md">Named</span>` 

                                : `<span class="text-[11px] font-black text-amber-950 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md">Item Pending</span>`}

                        </div>

                        ${nameDisplay}

                        <div class="grid grid-cols-2 gap-2 pt-1 border-t border-amber-200/80">

                            <div class="bg-white border-2 border-blue-200 rounded-lg px-2.5 py-1.5 flex items-center justify-between text-xs shadow-2xs">

                                <span class="text-[11px] font-black text-blue-950">SAP:</span>

                                <span class="font-mono font-black text-blue-900 text-xs">${item.sap_code || '---'}</span>

                            </div>

                            <div class="bg-white border-2 border-purple-200 rounded-lg px-2.5 py-1.5 flex items-center justify-between text-xs shadow-2xs">

                                <span class="text-[11px] font-black text-purple-950">LEG:</span>

                                <span class="font-mono font-black text-purple-900 text-xs">${item.legacy_code || '---'}</span>

                            </div>

                        </div>

                        ${item.approval_note ? `

                            <div class="mt-1 px-2.5 py-1 rounded-lg bg-amber-100/90 border border-amber-300 text-amber-950 text-[11px] font-bold flex items-center space-x-1" title="${escapeHtml(item.approval_note)}">

                                <i data-lucide="info" class="w-3.5 h-3.5 text-amber-800 shrink-0 stroke-[2.5]"></i>

                                <span class="truncate">Ref: ${escapeHtml(item.approval_note)}</span>

                            </div>

                        ` : ''}

                    </div>



                    <!-- SEGMENT 4: FINANCIAL SPECS (Light Sky & Light Rose Tiles) -->

                    <div class="grid grid-cols-2 gap-2">

                        <div class="bg-cyan-50/90 border-2 border-cyan-200/90 rounded-xl p-2.5 shadow-2xs">

                            <span class="text-[11px] font-black text-cyan-950 uppercase tracking-wider block">Planned Qty</span>

                            <span class="text-sm font-black text-cyan-900 mt-0.5 block">${formatNum(item.quantity)} <span class="text-xs font-bold text-cyan-800">units</span></span>

                        </div>

                        <div class="bg-rose-50/90 border-2 border-rose-200/90 rounded-xl p-2.5 shadow-2xs">

                            <span class="text-[11px] font-black text-rose-950 uppercase tracking-wider block">Unit Price</span>

                            <span class="text-sm font-black text-rose-900 mt-0.5 block">${formatNum(item.unit_price)}</span>

                        </div>

                    </div>



                    <!-- SEGMENT 5: OPERATIONS & PMMD PIPELINE (Light Lavender Tone) -->

                    <div class="bg-violet-50/80 border-2 border-violet-200/90 rounded-xl p-2.5 flex items-center justify-between text-xs shadow-2xs">

                        <div class="flex items-center space-x-1.5">

                            <span class="text-[11px] font-black text-violet-950 uppercase">Lead:</span>

                            <span class="font-black text-violet-950">${item.responsible_name ? escapeHtml(item.responsible_name.split(' ')[1] || item.responsible_name) : '---'}</span>

                        </div>

                        <div class="flex items-center space-x-1">

                            ${poPill}

                        </div>

                    </div>



                </div>



                <!-- SEGMENT 6: FOOTER (Light Mint Banner with Total BDT & Actions) -->

                <div class="mt-4 p-3 bg-gradient-to-r from-emerald-50/90 via-teal-50/70 to-emerald-50/90 border-2 border-emerald-200/90 rounded-xl flex justify-between items-center shadow-2xs">

                    <div>

                        <span class="text-[10px] font-black text-emerald-950 uppercase tracking-wider block">Total BDT</span>

                        <span class="text-base font-black text-emerald-950 tracking-tight">${formatBDT(item.total_price)}</span>

                    </div>



                    <div class="flex items-center space-x-2" onclick="event.stopPropagation()">

                        <button onclick="toggleQuickApprove(${item.id}, '${isApproved ? 'Pending' : 'Approved'}')" 

                                title="${isApproved ? 'Unapprove' : 'Approve Item'}" 

                                class="px-3 py-1.5 rounded-xl border-2 font-black text-xs flex items-center space-x-1.5 transition-all ${isApproved ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs' : 'border-emerald-400 bg-white text-emerald-950 hover:bg-emerald-100 shadow-2xs'}">

                            <i data-lucide="${isApproved ? 'check-check' : 'check'}" class="w-4 h-4 stroke-[2.5]"></i>

                            <span>${isApproved ? 'Approved' : 'Approve'}</span>

                        </button>

                        <button onclick="openItemModal(${item.id})" title="Full Specification & Edit" class="p-2 rounded-xl border-2 border-slate-300 bg-white text-slate-900 hover:bg-slate-900 hover:text-white transition-all shadow-2xs">

                            <i data-lucide="sliders-horizontal" class="w-4 h-4 stroke-[2.5]"></i>

                        </button>

                    </div>

                </div>



            </div>

        `;

    }).join('');

}



// ----------------- STEPHUB ADMIN TABLE -----------------

function renderItemsTable() {

    const tbody = document.getElementById('items-table-body');

    if (filteredItems.length === 0) {

        if (currentPlanType === 'Special') {

            tbody.innerHTML = `<tr><td colspan="9" class="py-16 text-center bg-amber-50/50">

                <div class="space-y-2">

                    <p class="text-slate-950 font-black text-sm">No Special Plan Items Found in ${currentYear}</p>

                    <p class="text-xs text-slate-700 font-bold">Special Plan items are ad-hoc items added one-by-one with prior approval.</p>

                    <button onclick="openAddSpecialItemModal()" class="inline-flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-4 py-2 rounded-xl border-2 border-amber-600 shadow-sm mt-1">

                        <i data-lucide="plus-circle" class="w-3.5 h-3.5 stroke-[3]"></i>

                        <span>Add Special Plan Item</span>

                    </button>

                </div>

            </td></tr>`;

        } else {

            tbody.innerHTML = `<tr><td colspan="9" class="py-16 text-center text-slate-800 font-black text-sm">No planned items found for the selected filter criteria.</td></tr>`;

        }

        lucide.createIcons();

        return;

    }



    tbody.innerHTML = filteredItems.map(item => {

        const isApproved = item.approval_status === 'Approved';

        const isBR = item.material_type === 'BR';

        

        // Brand Logo Badge in table (clean, distinct)

        const brandLogoBadge = getBrandLogoBadge(item.product_name, '', 'sm');



        const matBadge = isBR

            ? '<span class="px-2 py-0.5 rounded bg-indigo-900 text-white font-mono font-black text-[11px] mr-1 shadow-2xs">BR</span>'

            : '<span class="px-2 py-0.5 rounded bg-emerald-800 text-white font-mono font-black text-[11px] mr-1 shadow-2xs">PPM</span>';



        const isSpecial = item.plan_type === 'Special';

        const planTableBadge = isSpecial

            ? '<span class="px-2 py-0.5 rounded bg-amber-200 text-amber-950 border border-amber-400 font-black text-[10px] mr-1 shadow-2xs inline-flex items-center space-x-0.5"><i data-lucide="sparkles" class="w-3 h-3 text-amber-700 stroke-[3]"></i><span>Special</span></span>'

            : '';

        const categoryBadge = getCategoryBadge(item.category);

        const monthBadge = getTableMonthBadge(item.month, item.year);



        const hasName = item.item_name && item.item_name.trim() !== '';



        const nameDisplay = hasName 

            ? `

                <div class="space-y-1">

                    <div class="font-black text-slate-950 text-sm group-hover:text-blue-700 flex items-center space-x-1">

                        <span>${escapeHtml(item.item_name)}</span>

                        <button onclick="event.stopPropagation(); openItemModal(${item.id})" class="text-slate-600 hover:text-blue-700 ml-1">

                            <i data-lucide="edit-2" class="w-3.5 h-3.5 stroke-[2.5]"></i>

                        </button>

                    </div>

                    <div class="text-xs font-mono font-bold flex items-center space-x-2">

                        <span class="bg-blue-50 border border-blue-200 text-blue-950 px-2 py-0.5 rounded">SAP: <b class="text-blue-900 font-black">${item.sap_code || '---'}</b></span>

                        <span class="bg-purple-50 border border-purple-200 text-purple-950 px-2 py-0.5 rounded">LEG: <b class="text-purple-900 font-black">${item.legacy_code || '---'}</b></span>

                    </div>

                    ${item.approval_note ? `

                        <div class="text-[11px] text-amber-900 font-bold mt-1 truncate max-w-xs flex items-center space-x-1" title="${escapeHtml(item.approval_note)}">

                            <i data-lucide="info" class="w-3 h-3 text-amber-700 shrink-0 stroke-[2.5]"></i>

                            <span class="truncate">Ref: ${escapeHtml(item.approval_note)}</span>

                        </div>

                    ` : ''}

                </div>

              `

            : `

                <input type="text" placeholder="+ Enter Item Name" 

                       value="${escapeHtml(item.item_name || '')}"

                       onchange="quickSaveItemName(${item.id}, this.value)"

                       onclick="event.stopPropagation()"

                       class="w-full bg-white hover:bg-amber-50/50 focus:bg-white border-2 border-dashed border-amber-400 hover:border-amber-600 focus:border-amber-600 rounded-xl px-3 py-1.5 text-xs font-black text-slate-950 placeholder-amber-700/60 transition-all focus:outline-none shadow-2xs">

              `;



        const approvalBadge = isApproved

            ? '<span class="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-950 border-2 border-emerald-400 font-black text-xs shadow-2xs whitespace-nowrap shrink-0"><i data-lucide="check" class="w-3.5 h-3.5 mr-0.5 inline stroke-[3]"></i>Approved</span>'

            : '<span class="inline-flex items-center px-2.5 py-1 rounded-lg bg-amber-100 text-amber-950 border-2 border-amber-400 font-black text-xs shadow-2xs whitespace-nowrap shrink-0">Pending</span>';



        const poBadge = item.po_status === 'PO Issued'

            ? `<span class="px-2 py-0.5 rounded bg-blue-100 border border-blue-300 text-blue-950 font-mono font-black text-xs shadow-2xs">${escapeHtml(item.po_number || 'PO Issued')}</span>`

            : `<span class="text-xs font-black text-slate-800 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded">${item.po_status}</span>`;



        const rowHoverBg = isBR 

            ? 'hover:bg-blue-50/60 border-b border-blue-100/70' 

            : 'hover:bg-emerald-50/60 border-b border-emerald-100/70';



        return `

            <tr class="${rowHoverBg} transition-colors cursor-pointer group" onclick="openItemModal(${item.id})">

                <td class="py-4 px-4 whitespace-nowrap">

                    <div class="flex items-center space-x-2 mb-1.5 flex-wrap">

                        ${brandLogoBadge}

                        ${matBadge}

                        ${planTableBadge}

                    </div>

                    <div class="mt-1">${categoryBadge}</div>

                </td>



                <td class="py-4 px-4">

                    ${nameDisplay}

                </td>



                <td class="py-4 px-3 whitespace-nowrap">

                    ${monthBadge}

                </td>



                <td class="py-4 px-3 text-right whitespace-nowrap">

                    <span class="px-2.5 py-1 rounded-lg bg-cyan-50 border-2 border-cyan-200 text-cyan-950 font-black text-xs inline-block shadow-2xs">${formatNum(item.quantity)}</span>

                </td>



                <td class="py-4 px-3 text-right whitespace-nowrap">

                    <span class="px-2.5 py-1 rounded-lg bg-rose-50 border-2 border-rose-200 text-rose-950 font-black text-xs inline-block shadow-2xs">${formatNum(item.unit_price)}</span>

                </td>



                <td class="py-4 px-3 text-right whitespace-nowrap">

                    <span class="px-2.5 py-1 rounded-lg bg-emerald-50 border-2 border-emerald-300 text-emerald-950 font-black text-xs inline-block shadow-2xs">${formatBDT(item.total_price)}</span>

                </td>



                <td class="py-4 px-3 text-center whitespace-nowrap">

                    ${approvalBadge}

                </td>



                <td class="py-4 px-4 whitespace-nowrap">

                    <div class="text-xs font-black text-slate-950 mb-1">${item.responsible_name ? escapeHtml(item.responsible_name) : '<span class="text-slate-400 font-bold">---</span>'}</div>

                    ${poBadge}

                </td>



                <td class="py-4 px-3 text-center whitespace-nowrap" onclick="event.stopPropagation()">

                    <div class="flex items-center justify-center space-x-2">

                        <button onclick="toggleQuickApprove(${item.id}, '${isApproved ? 'Pending' : 'Approved'}')" 

                                title="${isApproved ? 'Unapprove' : 'Approve Item'}" 

                                class="p-2 rounded-xl border-2 font-black transition-all ${isApproved ? 'text-emerald-950 bg-emerald-100 hover:bg-emerald-200 border-emerald-400 shadow-2xs' : 'text-slate-800 hover:text-emerald-950 hover:bg-emerald-50 border-slate-300'}">

                            <i data-lucide="${isApproved ? 'check-check' : 'check'}" class="w-4 h-4 stroke-[2.5]"></i>

                        </button>

                        <button onclick="openItemModal(${item.id})" class="p-2 text-slate-800 hover:text-slate-950 hover:bg-slate-100 rounded-xl border-2 border-slate-300 shadow-2xs" title="Full Specification">

                            <i data-lucide="sliders-horizontal" class="w-4 h-4 stroke-[2.5]"></i>

                        </button>

                    </div>

                </td>

            </tr>

        `;

    }).join('');

}



async function quickSaveItemName(itemId, newName) {

    if (!newName || newName.trim() === '') return;

    try {

        const res = await fetch(`/api/items/${itemId}/quick-update`, {

            method: 'PATCH',

            headers: { 'Content-Type': 'application/json' },

            body: JSON.stringify({

                item_name: newName.trim(),

                actor_name: USERS[currentRole].name

            })

        });

        if (res.ok) {

            await loadItems();

            await loadDashboard();

        }

    } catch (err) {

        console.error('Error saving item name:', err);

    }

}



// ----------------- ITEM DETAIL & SPECIFICATION MODAL -----------------

async function openItemModal(itemId) {

    try {

        const res = await fetch(`/api/items/${itemId}`);

        const item = await res.json();

        currentEditingItem = item;



        const planBadge = document.getElementById('modal-badge-plan');

        if (planBadge) {

            if (item.plan_type === 'Special') {

                planBadge.className = 'badge bg-amber-200 border-2 border-amber-400 text-amber-950 font-black text-xs flex items-center space-x-1 shadow-2xs';

                planBadge.innerHTML = `<i data-lucide="sparkles" class="w-3.5 h-3.5 text-amber-700 stroke-[3]"></i><span>Special Plan</span>`;

            } else {

                planBadge.className = 'badge bg-blue-100 border-2 border-blue-300 text-blue-950 font-black text-xs flex items-center space-x-1 shadow-2xs';

                planBadge.innerHTML = `<i data-lucide="clipboard-check" class="w-3.5 h-3.5 text-blue-700 stroke-[3]"></i><span>Regular Plan</span>`;

            }

        }



        const delBtn = document.getElementById('modal-delete-btn');

        if (delBtn) {

            if (item.plan_type === 'Special') {

                delBtn.classList.remove('hidden');

            } else {

                delBtn.classList.add('hidden');

            }

        }



        document.getElementById('modal-badge-mat').innerText = item.material_type;

        document.getElementById('modal-badge-brand').innerHTML = getBrandLogoBadge(item.product_name, '', 'lg');

        document.getElementById('modal-badge-category').innerText = item.category;

        document.getElementById('modal-badge-month').innerText = `${item.month} ${item.year}`;

        document.getElementById('modal-title').innerText = item.item_name || `Specify ${item.category} (${item.month} ${item.year})`;



        document.getElementById('edit-item-id').value = item.id;

        document.getElementById('edit-item-name').value = item.item_name || '';

        document.getElementById('edit-sap-code').value = item.sap_code || '';

        document.getElementById('edit-legacy-code').value = item.legacy_code || '';

        const appNoteInput = document.getElementById('edit-approval-note');

        if (appNoteInput) appNoteInput.value = item.approval_note || '';

        document.getElementById('edit-quantity').value = item.quantity || 0;

        document.getElementById('edit-unit-price').value = item.unit_price || 0;

        document.getElementById('edit-total-price').value = formatBDT(item.total_price);



        document.getElementById('edit-responsible-id').value = item.responsible_person_id ? item.responsible_person_id : '';

        document.getElementById('edit-po-status').value = item.po_status || 'Not Initiated';

        document.getElementById('edit-po-number').value = item.po_number || '';

        document.getElementById('edit-po-date').value = item.po_date || '';

        document.getElementById('edit-expected-arrival').value = item.expected_arrival_date || '';

        document.getElementById('edit-delivery-date').value = item.delivery_date || '';



        document.getElementById('edit-allocation-status').value = item.allocation_status || 'Pending';

        document.getElementById('edit-allocation-notes').value = item.allocation_notes || '';



        const canEditStore = (currentRole === 6 || currentRole === 1);

        const modalStoreWarning = document.getElementById('modal-store-role-warning');

        if (modalStoreWarning) {

            if (!canEditStore) {

                modalStoreWarning.classList.remove('hidden');

            } else {

                modalStoreWarning.classList.add('hidden');

            }

        }



        const editStoreStatus = document.getElementById('edit-store-status');

        const editReceivedQty = document.getElementById('edit-received-qty');

        const editStoreInDate = document.getElementById('edit-store-in-date');

        const editDispersionStatus = document.getElementById('edit-dispersion-status');

        const editDispersedQty = document.getElementById('edit-dispersed-qty');

        const editStoreDisperseDate = document.getElementById('edit-store-disperse-date');



        if (editStoreStatus) {

            editStoreStatus.value = item.store_status || 'Not Received';

            editStoreStatus.disabled = !canEditStore;

        }

        if (editReceivedQty) {

            editReceivedQty.value = item.received_qty || '';

            editReceivedQty.disabled = !canEditStore;

        }

        if (editStoreInDate) {

            editStoreInDate.value = item.store_in_date || '';

            editStoreInDate.disabled = !canEditStore;

        }

        if (editDispersionStatus) {

            editDispersionStatus.value = item.dispersion_status || 'Not Dispersed';

            editDispersionStatus.disabled = !canEditStore;

        }

        if (editDispersedQty) {

            editDispersedQty.value = item.dispersed_qty || '';

            editDispersedQty.disabled = !canEditStore;

        }

        if (editStoreDisperseDate) {

            editStoreDisperseDate.value = item.store_disperse_date || '';

            editStoreDisperseDate.disabled = !canEditStore;

        }



        onModalStoreStatusChange(item.store_status || 'Not Received');

        onModalDispersionStatusChange(item.dispersion_status || 'Not Dispersed');



        document.getElementById('edit-item-image').value = item.item_image || '';

        

        // Modal Preview container (strictly for item photo, no brand logo fallback)

        const previewContainer = document.getElementById('edit-image-preview-container');

        if (item.item_image && item.item_image.trim() !== '') {

            previewContainer.innerHTML = `<img id="edit-image-preview" src="/uploads/${escapeHtml(item.item_image)}" class="max-w-full max-h-full object-contain">`;

        } else {

            previewContainer.innerHTML = `<div id="edit-image-preview" class="w-full h-full flex flex-col items-center justify-center text-slate-400 font-bold"><i data-lucide="image" class="w-6 h-6 stroke-[2]"></i><span class="text-[10px] text-slate-700 mt-0.5 font-black">No Photo</span></div>`;

        }



        renderModalComments(item.comments);

        openModal('item-modal');

        lucide.createIcons();

    } catch (err) {

        console.error('Error opening item modal:', err);

    }

}



function calculateEditTotal() {

    const qty = parseFloat(document.getElementById('edit-quantity').value) || 0;

    const unitPrice = parseFloat(document.getElementById('edit-unit-price').value) || 0;

    document.getElementById('edit-total-price').value = formatBDT(qty * unitPrice);

}



async function uploadItemImage(input) {

    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    const formData = new FormData();

    formData.append('file', file);



    try {

        const res = await fetch('/api/upload', {

            method: 'POST',

            body: formData

        });

        const data = await res.json();

        if (data.success) {

            document.getElementById('edit-item-image').value = data.filename;

            const previewContainer = document.getElementById('edit-image-preview-container');

            previewContainer.innerHTML = `<img id="edit-image-preview" src="${data.url}" class="max-w-full max-h-full object-contain">`;

        }

    } catch (err) {

        console.error('Error uploading file:', err);

    }

}



async function saveItemEdit(e) {

    e.preventDefault();

    const itemId = document.getElementById('edit-item-id').value;

    const payload = {

        item_name: document.getElementById('edit-item-name').value.trim(),

        sap_code: document.getElementById('edit-sap-code').value.trim(),

        legacy_code: document.getElementById('edit-legacy-code').value.trim(),

        quantity: parseInt(document.getElementById('edit-quantity').value) || 0,

        unit_price: parseFloat(document.getElementById('edit-unit-price').value) || 0,

        responsible_person_id: document.getElementById('edit-responsible-id').value ? parseInt(document.getElementById('edit-responsible-id').value) : null,

        po_status: document.getElementById('edit-po-status').value,

        po_number: document.getElementById('edit-po-number').value.trim(),

        po_date: document.getElementById('edit-po-date').value,

        expected_arrival_date: document.getElementById('edit-expected-arrival').value,

        delivery_date: document.getElementById('edit-delivery-date').value,

        allocation_status: document.getElementById('edit-allocation-status').value,

        allocation_notes: document.getElementById('edit-allocation-notes').value,

        role_id: currentRole,

        store_status: document.getElementById('edit-store-status') ? document.getElementById('edit-store-status').value : 'Not Received',

        received_qty: document.getElementById('edit-received-qty') ? (parseInt(document.getElementById('edit-received-qty').value) || 0) : 0,

        store_in_date: document.getElementById('edit-store-in-date') ? document.getElementById('edit-store-in-date').value : '',

        dispersion_status: document.getElementById('edit-dispersion-status') ? document.getElementById('edit-dispersion-status').value : 'Not Dispersed',

        dispersed_qty: document.getElementById('edit-dispersed-qty') ? (parseInt(document.getElementById('edit-dispersed-qty').value) || 0) : 0,

        store_disperse_date: document.getElementById('edit-store-disperse-date') ? document.getElementById('edit-store-disperse-date').value : '',

        item_image: document.getElementById('edit-item-image').value,

        approval_note: document.getElementById('edit-approval-note') ? document.getElementById('edit-approval-note').value.trim() : '',

        actor_name: USERS[currentRole].name

    };



    try {

        const res = await fetch(`/api/items/${itemId}`, {

            method: 'PUT',

            headers: { 'Content-Type': 'application/json' },

            body: JSON.stringify(payload)

        });

        if (res.ok) {

            closeModal('item-modal');

            await loadItems();

            await loadDashboard();

        }

    } catch (err) {

        console.error('Error saving item edit:', err);

    }

}





// Delete Ad-hoc Special Plan Item

async function deleteCurrentItem() {

    if (!currentEditingItem) return;

    if (currentEditingItem.plan_type !== 'Special') {

        alert('Only ad-hoc Special Plan items can be deleted. Regular plan items are fixed annual structures.');

        return;

    }

    const confirmDel = confirm(`Are you sure you want to delete "${currentEditingItem.item_name || 'this Special Plan item'}"?`);

    if (!confirmDel) return;



    try {

        const res = await fetch(`/api/items/${currentEditingItem.id}`, {

            method: 'DELETE',

            headers: { 'Content-Type': 'application/json' },

            body: JSON.stringify({ actor_name: USERS[currentRole].name })

        });

        const data = await res.json();

        if (res.ok) {

            closeModal('item-modal');

            await loadItems();

            await loadDashboard();

        } else {

            alert('Error deleting item: ' + (data.error || 'Failed to delete'));

        }

    } catch (err) {

        console.error('Error deleting item:', err);

    }

}



// ----------------- SPECIAL PLAN ITEM MODAL -----------------

function openAddSpecialItemModal() {

    const yearBadge = document.getElementById('special-modal-year-badge');

    if (yearBadge) yearBadge.innerText = `Year ${currentYear}`;



    document.getElementById('special-item-brand').value = 'Exium';

    document.getElementById('special-item-mat').value = 'BR';

    document.getElementById('special-item-month').value = (currentFilterMonth === 'All') ? 'Jan' : currentFilterMonth;

    document.getElementById('special-item-category').value = 'Special BR';

    document.getElementById('special-item-name').value = '';

    document.getElementById('special-item-sap').value = '';

    document.getElementById('special-item-legacy').value = '';

    document.getElementById('special-item-qty').value = 100;

    document.getElementById('special-item-price').value = 500;

    calculateSpecialTotal();

    document.getElementById('special-item-approval').value = 'Approved';

    document.getElementById('special-item-note').value = '';

    document.getElementById('special-item-responsible').value = '';

    document.getElementById('special-item-po-status').value = 'Not Initiated';

    

    const fileInput = document.getElementById('special-item-image-file');

    if (fileInput) fileInput.value = '';



    updateSpecialCategoryOptions();

    openModal('special-item-modal');

    lucide.createIcons();

}



function calculateSpecialTotal() {

    const qty = parseFloat(document.getElementById('special-item-qty').value) || 0;

    const price = parseFloat(document.getElementById('special-item-price').value) || 0;

    const totalEl = document.getElementById('special-item-total');

    if (totalEl) totalEl.value = formatBDT(qty * price);

}



function updateSpecialCategoryOptions() {

    const mat = document.getElementById('special-item-mat').value;

    const datalist = document.getElementById('special-category-list');

    if (!datalist) return;

    if (mat === 'BR') {

        datalist.innerHTML = `

            <option value="Special Item"></option>

            <option value="Special BR"></option>

            <option value="Regular BR"></option>

            <option value="Call Gadget"></option>

            <option value="Conference / Symposium Gift"></option>

            <option value="Doctor Camp Material"></option>

            <option value="Scientific Seminar Souvenir"></option>

            <option value="Executive Doctor Gift"></option>

        `;

    } else {

        datalist.innerHTML = `

            <option value="Exclusive Pen"></option>

            <option value="Regular Pen"></option>

            <option value="Prescription Pad (PP)"></option>

            <option value="Slip Pad (SLP)"></option>

            <option value="Educational Pad (Edu)"></option>

            <option value="Sales Aid (SA)"></option>

            <option value="Special Scientific Brochure"></option>

            <option value="Product Monograph Book"></option>

        `;

    }

}



async function handleCreateSpecialItem(e) {

    e.preventDefault();

    const brand = document.getElementById('special-item-brand').value;

    const mat = document.getElementById('special-item-mat').value;

    const month = document.getElementById('special-item-month').value;

    const category = document.getElementById('special-item-category').value.trim();

    const itemName = document.getElementById('special-item-name').value.trim();

    const sap = document.getElementById('special-item-sap').value.trim();

    const legacy = document.getElementById('special-item-legacy').value.trim();

    const qty = parseInt(document.getElementById('special-item-qty').value) || 0;

    const price = parseFloat(document.getElementById('special-item-price').value) || 0;

    const approvalStatus = document.getElementById('special-item-approval').value;

    const approvalNote = document.getElementById('special-item-note').value.trim();

    const respVal = document.getElementById('special-item-responsible').value;

    const responsibleId = respVal ? parseInt(respVal) : null;

    const poStatus = document.getElementById('special-item-po-status').value;



    let uploadedImage = '';

    const fileInput = document.getElementById('special-item-image-file');

    if (fileInput && fileInput.files && fileInput.files.length > 0) {

        const formData = new FormData();

        formData.append('file', fileInput.files[0]);

        try {

            const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });

            const uploadData = await uploadRes.json();

            if (uploadData.success) {

                uploadedImage = uploadData.filename;

            }

        } catch (uErr) {

            console.error('Image upload failed during special item creation:', uErr);

        }

    }



    const payload = {

        year: currentYear,

        product_name: brand,

        month: month,

        category: category,

        material_type: mat,

        plan_type: 'Special',

        item_name: itemName,

        sap_code: sap,

        legacy_code: legacy,

        quantity: qty,

        unit_price: price,

        approval_status: approvalStatus,

        approval_note: approvalNote,

        responsible_person_id: responsibleId,

        po_status: poStatus,

        item_image: uploadedImage,

        actor_name: USERS[currentRole].name

    };



    try {

        const res = await fetch('/api/items', {

            method: 'POST',

            headers: { 'Content-Type': 'application/json' },

            body: JSON.stringify(payload)

        });

        const data = await res.json();

        if (res.ok) {

            closeModal('special-item-modal');

            setPlanType('Special');

            await loadItems();

            await loadDashboard();

        } else {

            alert('Error creating Special Plan item: ' + (data.error || 'Unknown error'));

        }

    } catch (err) {

        console.error('Error creating Special Plan item:', err);

    }

}



async function quickApproveFromModal(status) {

    if (!currentEditingItem) return;

    await toggleQuickApprove(currentEditingItem.id, status);

    closeModal('item-modal');

}



async function toggleQuickApprove(itemId, status) {

    try {

        const res = await fetch(`/api/items/${itemId}/approve`, {

            method: 'POST',

            headers: { 'Content-Type': 'application/json' },

            body: JSON.stringify({

                status: status,

                actor_name: USERS[currentRole].name

            })

        });

        if (res.ok) {

            await loadItems();

            await loadDashboard();

        }

    } catch (err) {

        console.error('Error toggling approval:', err);

    }

}



function renderModalComments(comments) {

    const list = document.getElementById('modal-comments-list');

    if (!comments || comments.length === 0) {

        list.innerHTML = `<p class="text-slate-700 font-bold text-xs py-2">No comments or instructions posted yet.</p>`;

        return;

    }

    list.innerHTML = comments.map(c => `

        <div class="bg-slate-50 p-3 rounded-2xl border-2 border-slate-200 text-xs space-y-1">

            <div class="flex justify-between items-center text-[11px]">

                <span class="font-black text-slate-900">${escapeHtml(c.user_name)} <span class="text-blue-700 font-bold">(${escapeHtml(c.user_role)})</span></span>

                <span class="text-slate-600 font-mono font-bold">${c.created_at || 'Recently'}</span>

            </div>

            <p class="text-slate-900 font-semibold">${escapeHtml(c.comment)}</p>

        </div>

    `).join('');

}



async function postComment() {

    if (!currentEditingItem) return;

    const input = document.getElementById('new-comment-input');

    const commentText = input.value.trim();

    if (!commentText) return;



    try {

        const res = await fetch(`/api/items/${currentEditingItem.id}/comments`, {

            method: 'POST',

            headers: { 'Content-Type': 'application/json' },

            body: JSON.stringify({

                user_name: USERS[currentRole].name,

                user_role: USERS[currentRole].role,

                comment: commentText

            })

        });

        if (res.ok) {

            input.value = '';

            const itemRes = await fetch(`/api/items/${currentEditingItem.id}`);

            const updatedItem = await itemRes.json();

            renderModalComments(updatedItem.comments);

        }

    } catch (err) {

        console.error('Error posting comment:', err);

    }

}



// ----------------- FINANCIAL ANALYTICS & DASHBOARD -----------------

async function loadDashboard() {

    try {

        const res = await fetch(`/api/dashboard?year=${currentYear}`);

        const data = await res.json();



        document.getElementById('stat-total-budget').innerText = formatBDT(data.overall_annual_budget);

        document.getElementById('stat-br-expense').innerText = formatBDT(data.br_expense);

        document.getElementById('stat-br-limit').innerText = formatBDT(data.br_budget);

        document.getElementById('stat-ppm-expense').innerText = formatBDT(data.ppm_expense);

        document.getElementById('stat-ppm-limit').innerText = formatBDT(data.ppm_budget);

        document.getElementById('stat-remaining-budget').innerText = formatBDT(data.remaining_budget);



        renderMonthlyChart(data.monthly_data);

        renderCategoryChart(data.categories_data);

        renderActivities(data.recent_activities);

    } catch (err) {

        console.error('Error loading dashboard:', err);

    }

}



function renderMonthlyChart(monthlyData) {

    const ctx = document.getElementById('monthlyChart').getContext('2d');

    const labels = monthlyData.map(d => d.month);

    const exiumData = monthlyData.map(d => d.exium_expense);

    const mupsData = monthlyData.map(d => d.mups_expense);



    if (monthlyChart) monthlyChart.destroy();



    monthlyChart = new Chart(ctx, {

        type: 'bar',

        data: {

            labels: labels,

            datasets: [

                { label: 'Exium (BDT)', data: exiumData, backgroundColor: '#0F172A', borderRadius: 6 },

                { label: 'Exium MUPS (BDT)', data: mupsData, backgroundColor: '#6D28D9', borderRadius: 6 }

            ]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            scales: {

                x: { 

                    stacked: true, 

                    grid: { display: false },

                    ticks: { color: '#0F172A', font: { weight: 'bold', size: 11 } }

                },

                y: {

                    stacked: true,

                    ticks: { 

                        color: '#0F172A',

                        font: { weight: 'bold', size: 11 },

                        callback: val => (val / 1000000).toFixed(1) + 'M' 

                    }

                }

            },

            plugins: {

                legend: {

                    labels: { color: '#0F172A', font: { weight: 'bold', size: 12 } }

                }

            }

        }

    });

}



function renderCategoryChart(categoriesData) {

    const ctx = document.getElementById('categoryChart').getContext('2d');

    const labels = categoriesData.map(c => c.category);

    const dataVals = categoriesData.map(c => c.expense);



    if (categoryChart) categoryChart.destroy();



    categoryChart = new Chart(ctx, {

        type: 'doughnut',

        data: {

            labels: labels,

            datasets: [{

                data: dataVals,

                backgroundColor: [

                    '#0F172A', '#1D4ED8', '#0284C7', '#6D28D9', '#9333EA', '#C026D3', '#047857', '#059669', '#D97706'

                ]

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: { 

                    position: 'bottom', 

                    labels: { color: '#0F172A', boxWidth: 12, font: { weight: 'bold', size: 11 } } 

                }

            }

        }

    });

}



function renderActivities(activities) {

    const container = document.getElementById('recent-activities-list');

    if (!activities || activities.length === 0) {

        container.innerHTML = '<p class="text-slate-800 font-bold py-4 text-center">No recent activity logs.</p>';

        return;

    }

    container.innerHTML = activities.map(act => `

        <div class="py-3 flex items-center justify-between text-xs">

            <div class="flex items-center space-x-3">

                <span class="w-2.5 h-2.5 rounded-full bg-slate-900"></span>

                <div>

                    <span class="font-black text-slate-950">${escapeHtml(act.actor_name)}:</span>

                    <span class="text-slate-800 ml-1 font-bold">${escapeHtml(act.details)}</span>

                </div>

            </div>

            <span class="text-xs text-slate-700 font-mono font-bold whitespace-nowrap ml-2">${act.created_at || ''}</span>

        </div>

    `).join('');

}



// ----------------- STORE TAB (RAKIBUZZAMAN) -----------------

const STORE_ITEM_PALETTES = [

    { text: 'text-blue-900', bg: 'bg-blue-50/90', border: 'border-blue-300', tag: 'bg-blue-200/80 text-blue-950 border-blue-400', label: 'text-blue-800' },

    { text: 'text-emerald-950', bg: 'bg-emerald-50/90', border: 'border-emerald-300', tag: 'bg-emerald-200/80 text-emerald-950 border-emerald-400', label: 'text-emerald-800' },

    { text: 'text-purple-950', bg: 'bg-purple-50/90', border: 'border-purple-300', tag: 'bg-purple-200/80 text-purple-950 border-purple-400', label: 'text-purple-800' },

    { text: 'text-amber-950', bg: 'bg-amber-50/90', border: 'border-amber-300', tag: 'bg-amber-200/80 text-amber-950 border-amber-400', label: 'text-amber-800' },

    { text: 'text-rose-950', bg: 'bg-rose-50/90', border: 'border-rose-300', tag: 'bg-rose-200/80 text-rose-950 border-rose-400', label: 'text-rose-800' },

    { text: 'text-indigo-950', bg: 'bg-indigo-50/90', border: 'border-indigo-300', tag: 'bg-indigo-200/80 text-indigo-950 border-indigo-400', label: 'text-indigo-800' },

    { text: 'text-teal-950', bg: 'bg-teal-50/90', border: 'border-teal-300', tag: 'bg-teal-200/80 text-teal-950 border-teal-400', label: 'text-teal-800' },

    { text: 'text-cyan-950', bg: 'bg-cyan-50/90', border: 'border-cyan-300', tag: 'bg-cyan-200/80 text-cyan-950 border-cyan-400', label: 'text-cyan-800' },

    { text: 'text-fuchsia-950', bg: 'bg-fuchsia-50/90', border: 'border-fuchsia-300', tag: 'bg-fuchsia-200/80 text-fuchsia-950 border-fuchsia-400', label: 'text-fuchsia-800' },

    { text: 'text-orange-950', bg: 'bg-orange-50/90', border: 'border-orange-300', tag: 'bg-orange-200/80 text-orange-950 border-orange-400', label: 'text-orange-800' }

];



function renderStoreTab() {

    const grid = document.getElementById('store-items-grid');

    const bannerEl = document.getElementById('store-access-banner');

    if (!grid) return;



    const canEdit = (currentRole === 6 || currentRole === 1);



    // Update Access Permission Banner

    if (bannerEl) {

        if (canEdit) {

            bannerEl.className = 'p-4 rounded-2xl border-2 border-emerald-300 bg-emerald-50/90 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs';

            bannerEl.innerHTML = `

                <div class="flex items-center space-x-3">

                    <div class="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">

                        <i data-lucide="check-circle" class="w-5 h-5 stroke-[2.5]"></i>

                    </div>

                    <div>

                        <div class="flex items-center space-x-2">

                            <span class="text-xs font-black uppercase tracking-wider text-emerald-900 bg-emerald-200/80 px-2 py-0.5 rounded border border-emerald-400">Entry Authority Enabled</span>

                            <span class="text-xs font-bold text-emerald-800">Active Profile: <b>${USERS[currentRole].name}</b></span>

                        </div>

                        <p class="text-xs text-emerald-950 font-bold mt-0.5">You can record warehouse intake, partly / fully received quantities, and field dispersion entries.</p>

                    </div>

                </div>

                <div class="text-[11px] font-black text-emerald-950 bg-white border border-emerald-300 px-3 py-1.5 rounded-xl whitespace-nowrap shadow-2xs">

                    Store & Logistics Officer

                </div>

            `;

        } else {

            bannerEl.className = 'p-4 rounded-2xl border-2 border-amber-300 bg-amber-50/90 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs';

            bannerEl.innerHTML = `

                <div class="flex items-center space-x-3">

                    <div class="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">

                        <i data-lucide="lock" class="w-5 h-5 stroke-[2.5]"></i>

                    </div>

                    <div>

                        <div class="flex items-center space-x-2">

                            <span class="text-xs font-black uppercase tracking-wider text-amber-900 bg-amber-200 px-2 py-0.5 rounded border border-amber-400">Read-Only Mode</span>

                            <span class="text-xs font-bold text-amber-800">Current Profile: <b>${USERS[currentRole].name}</b></span>

                        </div>

                        <p class="text-xs text-amber-950 font-bold mt-0.5">Store & Dispersion entries can only be submitted by <b>Md. Rakibuzzaman (Store & Logistics)</b>.</p>

                    </div>

                </div>

                <button onclick="switchRoleTo(6)" class="text-xs font-black text-amber-950 bg-amber-300 hover:bg-amber-400 border-2 border-amber-500 px-3 py-1.5 rounded-xl transition-all shadow-2xs flex items-center space-x-1.5 cursor-pointer">

                    <span>Switch to Md. Rakibuzzaman</span>

                    <i data-lucide="arrow-right" class="w-3.5 h-3.5 stroke-[3]"></i>

                </button>

            `;

        }

    }



    // Filters

    const searchVal = (document.getElementById('store-search-input')?.value || '').trim().toLowerCase();

    const filterBrand = document.getElementById('store-filter-brand')?.value || 'All';

    const filterStatus = document.getElementById('store-filter-status')?.value || 'All';

    const filterDispersion = document.getElementById('store-filter-dispersion')?.value || 'All';



    let items = allItems.filter(item => {

        if (filterBrand !== 'All' && item.product_name !== filterBrand) return false;

        if (filterStatus !== 'All' && (item.store_status || 'Not Received') !== filterStatus) return false;

        if (filterDispersion !== 'All' && (item.dispersion_status || 'Not Dispersed') !== filterDispersion) return false;

        if (searchVal) {

            const name = (item.item_name || '').toLowerCase();

            const cat = (item.category || '').toLowerCase();

            const brand = (item.product_name || '').toLowerCase();

            const sap = (item.sap_code || '').toLowerCase();

            if (!name.includes(searchVal) && !cat.includes(searchVal) && !brand.includes(searchVal) && !sap.includes(searchVal)) {

                return false;

            }

        }

        return true;

    });



    if (items.length === 0) {

        grid.innerHTML = `

            <div class="col-span-full bg-white p-12 rounded-3xl border-2 border-dashed border-slate-300 text-center space-y-3">

                <i data-lucide="inbox" class="w-12 h-12 text-slate-300 mx-auto"></i>

                <h4 class="font-black text-slate-900 text-lg">No Store Items Found</h4>

                <p class="text-xs text-slate-500 font-bold">Try adjusting your search query or status filter.</p>

            </div>

        `;

        lucide.createIcons();

        return;

    }



    grid.innerHTML = items.map((item, idx) => {

        const brandLogo = getBrandLogoBadge(item.product_name, '', 'md');

        const isSpecial = item.plan_type === 'Special';

        const planBadge = isSpecial

            ? '<span class="px-2 py-0.5 rounded bg-amber-200 text-amber-950 border border-amber-400 font-black text-[10px] shadow-2xs inline-flex items-center space-x-0.5"><i data-lucide="sparkles" class="w-3 h-3 text-amber-700 stroke-[3]"></i><span>Special</span></span>'

            : '';

        const categoryBadge = getCategoryBadge(item.category);

        const monthBadge = getTableMonthBadge(item.month, item.year);



        // Deterministic vibrant color palette for item name

        const palette = STORE_ITEM_PALETTES[item.id % STORE_ITEM_PALETTES.length];



        const storeStatus = item.store_status || 'Not Received';

        const isStoreReceived = (storeStatus === 'Partly Received' || storeStatus === 'Fully Received' || storeStatus === 'In Warehouse');

        const isPartlyReceived = (storeStatus === 'Partly Received');



        const dispersionStatus = item.dispersion_status || 'Not Dispersed';

        const isDispersed = (dispersionStatus === 'Partly Dispersed' || dispersionStatus === 'Fully Dispersed');

        const isPartlyDispersed = (dispersionStatus === 'Partly Dispersed');



        // Status badges for top right

        const storeBadgeClass = storeStatus === 'Fully Received' || storeStatus === 'In Warehouse'

            ? 'bg-emerald-100 text-emerald-950 border-emerald-400'

            : (storeStatus === 'Partly Received' ? 'bg-amber-100 text-amber-950 border-amber-400' : 'bg-slate-100 text-slate-800 border-slate-300');



        const dispersionBadgeClass = dispersionStatus === 'Fully Dispersed'

            ? 'bg-emerald-100 text-emerald-950 border-emerald-400'

            : (dispersionStatus === 'Partly Dispersed' ? 'bg-amber-100 text-amber-950 border-amber-400' : 'bg-slate-100 text-slate-800 border-slate-300');



        return `

            <div class="stephub-card p-5 space-y-4 border-2 border-slate-200/90 bg-white shadow-xs hover:border-slate-400 transition-all flex flex-col justify-between">

                <div class="space-y-3.5">

                    <!-- Top Bar: Brand, Category, Status Badges -->

                    <div class="flex justify-between items-start gap-2">

                        <div class="flex items-center space-x-2 flex-wrap gap-y-1">

                            ${brandLogo}

                            ${categoryBadge}

                            ${planBadge}

                        </div>

                        <div class="flex flex-col items-end space-y-1 shrink-0">

                            <span class="badge border text-[10px] font-black ${storeBadgeClass} shadow-2xs">

                                Store: ${storeStatus}

                            </span>

                            <span class="badge border text-[10px] font-black ${dispersionBadgeClass} shadow-2xs">

                                Disp: ${dispersionStatus}

                            </span>

                        </div>

                    </div>



                    <!-- Item Name: Large font, bold, clearly visible, vibrant distinct color -->

                    <div class="p-3.5 rounded-2xl ${palette.bg} border-2 ${palette.border} space-y-1.5 shadow-2xs">

                        <div class="flex items-center justify-between text-[11px] font-black uppercase tracking-wider ${palette.label}">

                            <span class="flex items-center space-x-1">

                                <span class="w-2 h-2 rounded-full bg-current"></span>

                                <span>Item</span>

                            </span>

                            <span class="px-2 py-0.5 rounded ${palette.tag} border text-[10px] font-mono font-black">${item.material_type} &bull; ${item.category}</span>

                        </div>

                        <h3 class="font-black ${palette.text} text-xl md:text-2xl tracking-tight leading-tight">

                            ${escapeHtml(item.item_name || 'Pending Item Specification')}

                        </h3>

                        ${item.sap_code || item.legacy_code ? `

                            <div class="flex items-center space-x-2 pt-1 text-xs font-mono font-bold">

                                ${item.sap_code ? `<span class="bg-white border border-slate-300 px-2 py-0.5 rounded text-slate-900 shadow-2xs">SAP: <b class="text-slate-950">${escapeHtml(item.sap_code)}</b></span>` : ''}

                                ${item.legacy_code ? `<span class="bg-white border border-slate-300 px-2 py-0.5 rounded text-slate-900 shadow-2xs">LEG: <b class="text-slate-950">${escapeHtml(item.legacy_code)}</b></span>` : ''}

                            </div>

                        ` : ''}

                    </div>



                    <!-- Month and Planned Qty Bar -->

                    <div class="flex items-center justify-between bg-slate-50 border-2 border-slate-200 px-3.5 py-2 rounded-xl text-xs shadow-2xs">

                        <div class="flex items-center space-x-2">

                            ${monthBadge}

                        </div>

                        <div class="text-xs font-mono font-bold text-slate-800">

                            Planned: <b class="text-slate-950 font-black text-sm">${formatNum(item.quantity)}</b> units

                        </div>

                    </div>



                    <!-- 1. STORE RECEIPT SECTION (Intake) -->

                    <div class="bg-blue-50/70 p-3.5 rounded-2xl border-2 border-blue-200 space-y-2.5 shadow-2xs">

                        <div class="flex items-center justify-between">

                            <label class="text-xs font-black text-blue-950 uppercase tracking-wider flex items-center space-x-1.5">

                                <span class="w-2 h-2 rounded-full bg-blue-600"></span>

                                <span>1. Store Receipt</span>

                            </label>

                            <span class="text-[10px] font-mono font-black text-blue-800">

                                ${item.received_qty > 0 ? `${formatNum(item.received_qty)} units` : (storeStatus === 'Fully Received' ? 'Full' : 'None')}

                            </span>

                        </div>



                        <div>

                            <select id="store-status-${item.id}" 

                                    onchange="onStoreStatusChange(${item.id}, this.value)" 

                                    ${!canEdit ? 'disabled' : ''} 

                                    class="w-full bg-white border-2 border-blue-300 focus:border-blue-700 rounded-xl px-3 py-2 text-xs font-black text-slate-950 shadow-2xs">

                                <option value="Not Received" ${storeStatus === 'Not Received' ? 'selected' : ''}>Not Received</option>

                                <option value="Partly Received" ${storeStatus === 'Partly Received' ? 'selected' : ''}>Partly Received</option>

                                <option value="Fully Received" ${storeStatus === 'Fully Received' || storeStatus === 'In Warehouse' ? 'selected' : ''}>Fully Received</option>

                            </select>

                        </div>



                        <!-- Conditional Date and Quantity inputs (revealed only after Partly or Fully is selected) -->

                        <div id="store-in-fields-${item.id}" class="${isStoreReceived ? '' : 'hidden'} space-y-2 pt-2 border-t border-blue-200">

                            <div id="store-received-qty-container-${item.id}" class="${isPartlyReceived ? '' : 'hidden'}">

                                <label class="block text-[11px] font-black text-blue-950 mb-1">

                                    Received Quantity <span class="text-red-500">*</span>

                                </label>

                                <input type="number" id="store-received-qty-${item.id}" 

                                       value="${item.received_qty || ''}" 

                                       placeholder="Enter Received Qty (max ${item.quantity})" 

                                       min="1" max="${item.quantity}"

                                       ${!canEdit ? 'disabled' : ''} 

                                       class="w-full bg-white border-2 border-blue-300 focus:border-blue-700 rounded-xl px-3 py-1.5 text-xs font-black text-slate-950 shadow-2xs">

                                <span class="text-[10px] text-blue-800 font-bold block mt-0.5">Planned: ${formatNum(item.quantity)} units</span>

                            </div>



                            <div id="store-in-date-container-${item.id}">

                                <label class="block text-[11px] font-black text-blue-950 mb-1">

                                    Store-In Date <span class="text-red-500">*</span>

                                </label>

                                <input type="date" id="store-in-${item.id}" 

                                       value="${item.store_in_date || ''}" 

                                       ${!canEdit ? 'disabled' : ''} 

                                       class="w-full bg-white border-2 border-blue-300 focus:border-blue-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-950 shadow-2xs">

                            </div>



                            <div id="store-fully-received-note-${item.id}" class="${storeStatus === 'Fully Received' || storeStatus === 'In Warehouse' ? '' : 'hidden'} text-[11px] font-black text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-1 rounded-lg">

                                &check; Full planned quantity (${formatNum(item.quantity)} units) received.

                            </div>

                        </div>

                    </div>



                    <!-- 2. FIELD DISPERSION SECTION (Dispatch) -->

                    <div class="bg-emerald-50/70 p-3.5 rounded-2xl border-2 border-emerald-200 space-y-2.5 shadow-2xs">

                        <div class="flex items-center justify-between">

                            <label class="text-xs font-black text-emerald-950 uppercase tracking-wider flex items-center space-x-1.5">

                                <span class="w-2 h-2 rounded-full bg-emerald-600"></span>

                                <span>2. Field Dispersion</span>

                            </label>

                            <span class="text-[10px] font-mono font-black text-emerald-800">

                                ${item.dispersed_qty > 0 ? `${formatNum(item.dispersed_qty)} units` : (dispersionStatus === 'Fully Dispersed' ? 'Full' : 'None')}

                            </span>

                        </div>



                        <div>

                            <select id="dispersion-status-${item.id}" 

                                    onchange="onDispersionStatusChange(${item.id}, this.value)" 

                                    ${!canEdit ? 'disabled' : ''} 

                                    class="w-full bg-white border-2 border-emerald-300 focus:border-emerald-700 rounded-xl px-3 py-2 text-xs font-black text-slate-950 shadow-2xs">

                                <option value="Not Dispersed" ${dispersionStatus === 'Not Dispersed' ? 'selected' : ''}>Not Dispersed</option>

                                <option value="Partly Dispersed" ${dispersionStatus === 'Partly Dispersed' ? 'selected' : ''}>Partly Dispersed</option>

                                <option value="Fully Dispersed" ${dispersionStatus === 'Fully Dispersed' ? 'selected' : ''}>Fully Dispersed</option>

                            </select>

                        </div>



                        <!-- Conditional Date and Quantity inputs (revealed only after Partly or Fully is selected) -->

                        <div id="dispersion-fields-${item.id}" class="${isDispersed ? '' : 'hidden'} space-y-2 pt-2 border-t border-emerald-200">

                            <div id="dispersed-qty-container-${item.id}" class="${isPartlyDispersed ? '' : 'hidden'}">

                                <label class="block text-[11px] font-black text-emerald-950 mb-1">

                                    Dispersed Quantity <span class="text-red-500">*</span>

                                </label>

                                <input type="number" id="dispersed-qty-${item.id}" 

                                       value="${item.dispersed_qty || ''}" 

                                       placeholder="Enter Dispersed Qty" 

                                       min="1" max="${item.quantity}"

                                       ${!canEdit ? 'disabled' : ''} 

                                       class="w-full bg-white border-2 border-emerald-300 focus:border-emerald-700 rounded-xl px-3 py-1.5 text-xs font-black text-slate-950 shadow-2xs">

                                <span class="text-[10px] text-emerald-800 font-bold block mt-0.5">Planned: ${formatNum(item.quantity)} units</span>

                            </div>



                            <div id="dispersion-date-container-${item.id}">

                                <label class="block text-[11px] font-black text-emerald-950 mb-1">

                                    Dispersion Date <span class="text-red-500">*</span>

                                </label>

                                <input type="date" id="store-disperse-${item.id}" 

                                       value="${item.store_disperse_date || ''}" 

                                       ${!canEdit ? 'disabled' : ''} 

                                       class="w-full bg-white border-2 border-emerald-300 focus:border-emerald-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-950 shadow-2xs">

                            </div>



                            <div id="dispersion-fully-note-${item.id}" class="${dispersionStatus === 'Fully Dispersed' ? '' : 'hidden'} text-[11px] font-black text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-1 rounded-lg">

                                &check; Full batch dispersed to field force.

                            </div>

                        </div>

                    </div>

                </div>



                <!-- Card Bottom: Save Button or Locked Notice -->

                <div class="pt-2">

                    ${canEdit ? `

                        <button onclick="saveStoreEntry(${item.id})" class="w-full bg-slate-900 hover:bg-black text-white font-black rounded-xl py-2.5 px-4 text-xs flex items-center justify-center space-x-2 border-2 border-slate-900 shadow-sm transition-all cursor-pointer">

                            <i data-lucide="check" class="w-4 h-4 stroke-[3]"></i>

                            <span>Save Store & Dispersion</span>

                        </button>

                    ` : `

                        <div class="bg-amber-100/90 border-2 border-amber-300 text-amber-950 px-3 py-2 rounded-xl text-xs font-black flex items-center justify-center space-x-1.5 shadow-2xs">

                            <i data-lucide="lock" class="w-4 h-4 text-amber-800 stroke-[2.5]"></i>

                            <span>Entry restricted to Md. Rakibuzzaman</span>

                        </div>

                    `}

                </div>

            </div>

        `;

    }).join('');



    lucide.createIcons();

}



function onStoreStatusChange(itemId, status) {

    const fieldsCont = document.getElementById(`store-in-fields-${itemId}`);

    const qtyCont = document.getElementById(`store-received-qty-container-${itemId}`);

    const noteCont = document.getElementById(`store-fully-received-note-${itemId}`);

    const dateInput = document.getElementById(`store-in-${itemId}`);



    if (status === 'Not Received') {

        if (fieldsCont) fieldsCont.classList.add('hidden');

    } else if (status === 'Partly Received') {

        if (fieldsCont) fieldsCont.classList.remove('hidden');

        if (qtyCont) qtyCont.classList.remove('hidden');

        if (noteCont) noteCont.classList.add('hidden');

        if (dateInput && !dateInput.value) {

            dateInput.value = new Date().toISOString().split('T')[0];

        }

    } else if (status === 'Fully Received') {

        if (fieldsCont) fieldsCont.classList.remove('hidden');

        if (qtyCont) qtyCont.classList.add('hidden');

        if (noteCont) noteCont.classList.remove('hidden');

        if (dateInput && !dateInput.value) {

            dateInput.value = new Date().toISOString().split('T')[0];

        }

    }

}



function onDispersionStatusChange(itemId, status) {

    const fieldsCont = document.getElementById(`dispersion-fields-${itemId}`);

    const qtyCont = document.getElementById(`dispersed-qty-container-${itemId}`);

    const noteCont = document.getElementById(`dispersion-fully-note-${itemId}`);

    const dateInput = document.getElementById(`store-disperse-${itemId}`);



    if (status === 'Not Dispersed') {

        if (fieldsCont) fieldsCont.classList.add('hidden');

    } else if (status === 'Partly Dispersed') {

        if (fieldsCont) fieldsCont.classList.remove('hidden');

        if (qtyCont) qtyCont.classList.remove('hidden');

        if (noteCont) noteCont.classList.add('hidden');

        if (dateInput && !dateInput.value) {

            dateInput.value = new Date().toISOString().split('T')[0];

        }

    } else if (status === 'Fully Dispersed') {

        if (fieldsCont) fieldsCont.classList.remove('hidden');

        if (qtyCont) qtyCont.classList.add('hidden');

        if (noteCont) noteCont.classList.remove('hidden');

        if (dateInput && !dateInput.value) {

            dateInput.value = new Date().toISOString().split('T')[0];

        }

    }

}



async function saveStoreEntry(itemId) {

    if (currentRole !== 6 && currentRole !== 1) {

        alert("Permission denied. Only Md. Rakibuzzaman (Store & Logistics) can enter Store & Dispersion records.");

        return;

    }



    const storeStatus = document.getElementById(`store-status-${itemId}`)?.value || 'Not Received';

    const receivedQtyInput = document.getElementById(`store-received-qty-${itemId}`);

    const receivedQty = receivedQtyInput ? (parseInt(receivedQtyInput.value) || 0) : 0;

    const storeInDate = document.getElementById(`store-in-${itemId}`)?.value || '';



    const dispersionStatus = document.getElementById(`dispersion-status-${itemId}`)?.value || 'Not Dispersed';

    const dispersedQtyInput = document.getElementById(`dispersed-qty-${itemId}`);

    const dispersedQty = dispersedQtyInput ? (parseInt(dispersedQtyInput.value) || 0) : 0;

    const disperseDate = document.getElementById(`store-disperse-${itemId}`)?.value || '';



    // Validation

    if (storeStatus === 'Partly Received' && (!receivedQty || receivedQty <= 0)) {

        alert("Please enter Received Quantity for Partly Received status.");

        if (receivedQtyInput) receivedQtyInput.focus();

        return;

    }

    if (storeStatus !== 'Not Received' && !storeInDate) {

        alert("Please select Store-In Date.");

        return;

    }



    if (dispersionStatus === 'Partly Dispersed' && (!dispersedQty || dispersedQty <= 0)) {

        alert("Please enter Dispersed Quantity for Partly Dispersed status.");

        if (dispersedQtyInput) dispersedQtyInput.focus();

        return;

    }

    if (dispersionStatus !== 'Not Dispersed' && !disperseDate) {

        alert("Please select Dispersion Date.");

        return;

    }



    try {

        const res = await fetch(`/api/items/${itemId}/store-update`, {

            method: 'POST',

            headers: { 'Content-Type': 'application/json' },

            body: JSON.stringify({

                role_id: currentRole,

                actor_name: USERS[currentRole].name,

                store_status: storeStatus,

                received_qty: receivedQty,

                store_in_date: storeInDate,

                dispersion_status: dispersionStatus,

                dispersed_qty: dispersedQty,

                store_disperse_date: disperseDate

            })

        });



        const data = await res.json();

        if (res.ok && data.success) {

            await loadItems();

            renderStoreTab();

            await loadDashboard();

        } else {

            alert(data.error || 'Failed to update store entry.');

        }

    } catch (err) {

        console.error('Error saving store entry:', err);

        alert('Network error while saving store entry.');

    }

}



// Backwards compatibility alias

const saveQuickStoreUpdate = saveStoreEntry;





// ----------------- DESIGN TAB (SUBHANI SUJON) -----------------

function renderDesignTab() {

    const grid = document.getElementById('design-items-grid');

    const designItems = allItems.filter(item => item.material_type === 'BR' || item.category.includes('Pen'));



    grid.innerHTML = designItems.map(item => {

        const brandLogo = getBrandLogoBadge(item.product_name, '', 'md');

        const isSpecial = item.plan_type === 'Special';

        const planTableBadge = isSpecial

            ? '<span class="px-2 py-0.5 rounded bg-amber-200 text-amber-950 border border-amber-400 font-black text-[10px] mr-1 shadow-2xs inline-flex items-center space-x-0.5"><i data-lucide="sparkles" class="w-3 h-3 text-amber-700 stroke-[3]"></i><span>Special</span></span>'

            : '';

        const categoryBadge = getCategoryBadge(item.category);

        const monthBadge = getTableMonthBadge(item.month, item.year);

        const hasItemImage = item.item_image && item.item_image.trim() !== '';



        const previewContent = hasItemImage

            ? `<img src="/uploads/${escapeHtml(item.item_image)}" class="h-20 object-contain mb-1.5 filter drop-shadow-sm">`

            : `<div class="w-12 h-12 rounded-2xl bg-white border-2 border-purple-200 flex items-center justify-center text-purple-400 mb-1.5 shadow-2xs"><i data-lucide="image" class="w-6 h-6 stroke-[2]"></i></div><span class="text-xs text-purple-950 font-black">No Mockup</span>`;



        return `

            <div class="stephub-card p-5 space-y-3.5 border-2 border-purple-200/90 bg-gradient-to-b from-purple-50/40 via-white to-white shadow-xs">

                <div class="flex justify-between items-start gap-2">

                    <div class="flex items-center space-x-2">

                        ${brandLogo}

                        ${categoryBadge}

                    </div>

                    <span class="badge bg-purple-100 text-purple-950 border-2 border-purple-300 font-black text-xs shadow-2xs">${item.packaging_status}</span>

                </div>



                <div>

                    <h4 class="font-black text-slate-950 text-sm line-clamp-1">${escapeHtml(item.item_name || item.category)}</h4>

                    <div class="flex items-center space-x-2 mt-1.5">

                        ${monthBadge}

                        <span class="text-xs font-mono font-bold text-slate-800">Qty: <b class="text-slate-950 font-black">${formatNum(item.quantity)}</b> units</span>

                    </div>

                </div>



                <div class="h-32 rounded-2xl bg-purple-50/70 border-2 border-purple-200 flex flex-col items-center justify-center p-3 text-center text-xs shadow-2xs">

                    ${previewContent}

                    <span class="text-xs font-black text-purple-950 mt-1">${item.packaging_file || 'Packaging Box Spec'}</span>

                </div>



                <div class="flex justify-between items-center text-xs pt-2 border-t-2 border-purple-100">

                    <button onclick="openItemModal(${item.id})" class="text-purple-900 hover:text-purple-950 font-black flex items-center space-x-1">

                        <i data-lucide="edit-3" class="w-4 h-4 stroke-[2.5]"></i>

                        <span>Manage Artwork</span>

                    </button>

                    <span class="text-xs text-purple-900 font-extrabold">Md. Subhani Sujon</span>

                </div>

            </div>

        `;

    }).join('');



    lucide.createIcons();

}



// ----------------- TEAM CONTACTS -----------------

async function loadTeam() {

    try {

        const res = await fetch('/api/team');

        const team = await res.json();

        

        // Sync into USERS dictionary

        team.forEach(m => {

            if (USERS[m.id]) {

                USERS[m.id].name = m.name;

                USERS[m.id].role = m.role;

                USERS[m.id].dept = m.department;

                USERS[m.id].email = m.email;

                USERS[m.id].mobile = m.mobile;

                USERS[m.id].avatar = m.avatar;

                USERS[m.id].profile_image = m.profile_image;

            } else {

                USERS[m.id] = {

                    name: m.name,

                    role: m.role,

                    dept: m.department,

                    email: m.email,

                    mobile: m.mobile,

                    avatar: m.avatar,

                    profile_image: m.profile_image,

                    banner: `Active Profile: ${m.name} (${m.role}, ${m.department})`

                };

            }

        });



        updateHeaderProfileUI();



        const grid = document.getElementById('team-cards-grid');

        grid.innerHTML = team.map(m => {

            const hasPhoto = m.profile_image && m.profile_image.trim() !== '';

            const photoEl = hasPhoto

                ? `<img src="/uploads/${escapeHtml(m.profile_image)}" alt="${escapeHtml(m.name)}" class="w-14 h-14 rounded-2xl object-cover border-2 border-slate-300 shadow-sm">`

                : `<div class="w-14 h-14 rounded-2xl bg-slate-900 text-white font-black text-base flex items-center justify-center shadow-md border-2 border-slate-300">${escapeHtml(m.avatar || 'M')}</div>`;



            // Distinct light pastel theme per role / domain

            let cardTheme = {

                cardBg: 'bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/40',

                border: 'border-2 border-indigo-200/90',

                badge: 'bg-indigo-100 text-indigo-950 border border-indigo-300',

                contactBg: 'bg-indigo-50/60 border-2 border-indigo-200/80',

                roleColor: 'text-indigo-900'

            };



            if (m.department === 'SMD') {

                // Admin (Md. Didarul Islam)

                cardTheme = {

                    cardBg: 'bg-gradient-to-br from-sky-50/80 via-white to-blue-50/50',

                    border: 'border-2 border-sky-300',

                    badge: 'bg-sky-100 text-sky-950 border border-sky-300',

                    contactBg: 'bg-sky-50/70 border-2 border-sky-200',

                    roleColor: 'text-sky-900'

                };

            } else if (m.role.includes('Design')) {

                // Packaging Design (Md. Subhani Sujon)

                cardTheme = {

                    cardBg: 'bg-gradient-to-br from-purple-50/80 via-white to-violet-50/40',

                    border: 'border-2 border-purple-300',

                    badge: 'bg-purple-100 text-purple-950 border border-purple-300',

                    contactBg: 'bg-purple-50/70 border-2 border-purple-200',

                    roleColor: 'text-purple-900'

                };

            } else if (m.role.includes('Store') || m.role.includes('Logistics')) {

                // Store & Logistics (Md. Rakibuzzaman)

                cardTheme = {

                    cardBg: 'bg-gradient-to-br from-amber-50/80 via-white to-yellow-50/40',

                    border: 'border-2 border-amber-300',

                    badge: 'bg-amber-100 text-amber-950 border border-amber-300',

                    contactBg: 'bg-amber-50/70 border-2 border-amber-200',

                    roleColor: 'text-amber-900'

                };

            }



            return `

                <div class="stephub-card p-5 space-y-4 ${cardTheme.border} ${cardTheme.cardBg} shadow-xs">

                    <div class="flex items-center justify-between">

                        <div class="flex items-center space-x-3.5">

                            ${photoEl}

                            <div>

                                <h4 class="font-black text-slate-950 text-base leading-snug">${escapeHtml(m.name)}</h4>

                                <p class="text-xs ${cardTheme.roleColor} font-black">${escapeHtml(m.designation)}, ${escapeHtml(m.department)}</p>

                            </div>

                        </div>

                        <button onclick="triggerMemberPhotoUpload(${m.id})" title="${hasPhoto ? 'Change photo' : 'Upload photo'}" class="p-2 rounded-xl border-2 border-slate-300 hover:border-slate-900 hover:bg-white text-slate-800 transition-all flex items-center space-x-1 shadow-2xs" title="Upload Photo">

                            <i data-lucide="camera" class="w-4 h-4 stroke-[2.5]"></i>

                        </button>

                    </div>



                    <div class="${cardTheme.contactBg} p-3.5 rounded-2xl text-xs space-y-2 font-bold shadow-2xs">

                        <div class="flex items-center space-x-2 text-slate-800">

                            <i data-lucide="mail" class="w-4 h-4 text-slate-700 stroke-[2.5]"></i>

                            <a href="mailto:${m.email}" class="hover:underline font-mono text-xs text-slate-900 font-bold">${escapeHtml(m.email)}</a>

                        </div>

                        <div class="flex items-center space-x-2 text-slate-800">

                            <i data-lucide="phone" class="w-4 h-4 text-slate-700 stroke-[2.5]"></i>

                            <a href="tel:${m.mobile}" class="hover:underline font-mono font-black text-xs text-slate-950">${escapeHtml(m.mobile)}</a>

                        </div>

                    </div>



                    <div class="flex justify-between items-center text-xs pt-2 border-t-2 border-slate-200/80">

                        <span class="badge ${cardTheme.badge} font-black">${escapeHtml(m.role)}</span>

                        <span class="font-black text-slate-950">${m.assigned_items_count || 0} Items Assigned</span>

                    </div>

                </div>

            `;

        }).join('');



        lucide.createIcons();

    } catch (err) {

        console.error('Error loading team:', err);

    }

}



// ----------------- MODAL HELPERS -----------------

function openModal(modalId) {

    document.getElementById(modalId).classList.remove('hidden');

}



function closeModal(modalId) {

    document.getElementById(modalId).classList.add('hidden');

}



function openAddTeamMemberModal() {

    openModal('team-modal');

}



async function saveNewTeamMember(e) {

    e.preventDefault();

    const payload = {

        name: document.getElementById('add-member-name').value,

        designation: document.getElementById('add-member-desig').value,

        department: document.getElementById('add-member-dept').value,

        role: document.getElementById('add-member-role').value,

        email: document.getElementById('add-member-email').value,

        mobile: document.getElementById('add-member-mobile').value

    };



    try {

        const res = await fetch('/api/team', {

            method: 'POST',

            headers: { 'Content-Type': 'application/json' },

            body: JSON.stringify(payload)

        });

        if (res.ok) {

            closeModal('team-modal');

            await loadTeam();

            alert('Team member added successfully!');

        }

    } catch (err) {

        console.error('Error saving team member:', err);

    }

}



function openBudgetModal() {

    fetch(`/api/dashboard?year=${currentYear}`)

        .then(res => res.json())

        .then(data => {

            document.getElementById('setting-total-budget').value = data.overall_annual_budget;

            document.getElementById('setting-br-budget').value = data.br_budget;

            document.getElementById('setting-ppm-budget').value = data.ppm_budget;

            document.getElementById('setting-exium-budget').value = data.exium_budget;

            document.getElementById('setting-mups-budget').value = data.mups_budget;

            openModal('budget-modal');

        });

}



async function saveBudgetSettings(e) {

    e.preventDefault();

    const payload = {

        year: currentYear,

        total_budget: parseFloat(document.getElementById('setting-total-budget').value),

        br_budget: parseFloat(document.getElementById('setting-br-budget').value),

        ppm_budget: parseFloat(document.getElementById('setting-ppm-budget').value),

        exium_budget: parseFloat(document.getElementById('setting-exium-budget').value),

        mups_budget: parseFloat(document.getElementById('setting-mups-budget').value)

    };



    try {

        const res = await fetch('/api/budget', {

            method: 'PUT',

            headers: { 'Content-Type': 'application/json' },

            body: JSON.stringify(payload)

        });

        if (res.ok) {

            closeModal('budget-modal');

            await loadDashboard();

            alert('Budget configuration updated!');

        }

    } catch (err) {

        console.error('Error saving budget:', err);

    }

}



function exportToExcel() {

    window.location.href = `/api/export/excel?year=${currentYear}`;

}



function exportToCSV() {

    exportToExcel();

}



function escapeHtml(text) {

    if (!text) return '';

    return text.toString()

        .replace(/&/g, '&amp;')

        .replace(/</g, '&lt;')

        .replace(/>/g, '&gt;')

        .replace(/"/g, '&quot;')

        .replace(/'/g, '&#039;');

}





function onModalStoreStatusChange(status) {

    const fieldsCont = document.getElementById('modal-store-fields');

    const qtyCont = document.getElementById('modal-received-qty-container');

    const dateInput = document.getElementById('edit-store-in-date');

    if (!fieldsCont) return;



    if (status === 'Not Received' || !status) {

        fieldsCont.classList.add('hidden');

    } else if (status === 'Partly Received') {

        fieldsCont.classList.remove('hidden');

        if (qtyCont) qtyCont.classList.remove('hidden');

        if (dateInput && !dateInput.value) {

            dateInput.value = new Date().toISOString().split('T')[0];

        }

    } else if (status === 'Fully Received') {

        fieldsCont.classList.remove('hidden');

        if (qtyCont) qtyCont.classList.add('hidden');

        if (dateInput && !dateInput.value) {

            dateInput.value = new Date().toISOString().split('T')[0];

        }

    }

}



function onModalDispersionStatusChange(status) {

    const fieldsCont = document.getElementById('modal-dispersion-fields');

    const qtyCont = document.getElementById('modal-dispersed-qty-container');

    const dateInput = document.getElementById('edit-store-disperse-date');

    if (!fieldsCont) return;



    if (status === 'Not Dispersed' || !status) {

        fieldsCont.classList.add('hidden');

    } else if (status === 'Partly Dispersed') {

        fieldsCont.classList.remove('hidden');

        if (qtyCont) qtyCont.classList.remove('hidden');

        if (dateInput && !dateInput.value) {

            dateInput.value = new Date().toISOString().split('T')[0];

        }

    } else if (status === 'Fully Dispersed') {

        fieldsCont.classList.remove('hidden');

        if (qtyCont) qtyCont.classList.add('hidden');

        if (dateInput && !dateInput.value) {

            dateInput.value = new Date().toISOString().split('T')[0];

        }

    }

}

