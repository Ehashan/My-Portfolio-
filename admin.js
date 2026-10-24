/**
 * admin.js
 * Controller logic for Portfolio Admin Panel.
 */

// Available repository preset images
const PRESET_IMAGES = [
    { name: "MERN Stack", path: "images/mern.png" },
    { name: "AWS Cloud", path: "images/cloud.png" },
    { name: "Portfolio", path: "images/portfolio.png" },
    { name: "Elawalu App", path: "images/elawalu.png" },
    { name: "Diabetes ML", path: "images/diabetes.png" },
    { name: "Restaurant", path: "images/rest.png" },
    { name: "Library MS", path: "images/library_ms.png" },
    { name: "Profile My", path: "images/my.png" },
    { name: "Project V", path: "images/vvvv.png" }
];

// App State
let projects = [];
let editingProjectId = null;
let currentViewMode = 'grid'; // 'grid' | 'table'
let currentSearchQuery = '';
let currentCategoryFilter = 'all';

// DOM Elements
const authGate = document.getElementById('auth-gate');
const authPinInput = document.getElementById('auth-pin');
const btnLogin = document.getElementById('btn-login');
const btnLogout = document.getElementById('btn-logout');

const statTotal = document.getElementById('stat-total');
const statCategories = document.getElementById('stat-categories');
const statDemos = document.getElementById('stat-demos');
const statRepos = document.getElementById('stat-repos');

const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const projectsGrid = document.getElementById('projects-grid');
const projectsTableCard = document.getElementById('projects-table-card');
const projectsTableBody = document.getElementById('projects-table-body');
const viewGridBtn = document.getElementById('view-grid-btn');
const viewTableBtn = document.getElementById('view-table-btn');

// Modal Elements
const projectModal = document.getElementById('project-modal');
const modalTitle = document.getElementById('modal-title');
const projectForm = document.getElementById('project-form');
const inputTitle = document.getElementById('proj-title');
const inputCategory = document.getElementById('proj-category');
const inputDescription = document.getElementById('proj-description');
const inputImagePath = document.getElementById('proj-image-path');
const fileInput = document.getElementById('proj-file-upload');
const dropzone = document.getElementById('upload-dropzone');
const presetGrid = document.getElementById('preset-image-grid');

// Link Inputs
const linkGh1 = document.getElementById('link-gh1');
const linkGh2 = document.getElementById('link-gh2');
const linkDemo = document.getElementById('link-demo');
const linkDemoDisabled = document.getElementById('link-demo-disabled');
const linkCustomLabel = document.getElementById('link-custom-label');
const linkCustomUrl = document.getElementById('link-custom-url');

// Preview Elements
const previewBox = document.getElementById('live-preview-box');

// Export Modal
const exportModal = document.getElementById('export-modal');
const exportJsPreview = document.getElementById('export-js-preview');
const exportHtmlPreview = document.getElementById('export-html-preview');
const exportJsonPreview = document.getElementById('export-json-preview');

// Settings Modal
const settingsModal = document.getElementById('settings-modal');
const currentPinInput = document.getElementById('current-pin');
const newPinInput = document.getElementById('new-pin');
const confirmPinInput = document.getElementById('confirm-pin');

// Toast Container
const toastContainer = document.getElementById('toast-container');

/**
 * Initialize Admin App
 */
document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    populatePresetImages();
    loadProjects();
    setupEventListeners();
    setupLivePreview();
});

/**
 * Authentication Management (SHA-256 Cryptographic Hash)
 */
async function hashPasscode(passcode) {
    const encoder = new TextEncoder();
    const data = encoder.encode(passcode);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// SHA-256 cryptographic hash of the default passcode (Plaintext is NEVER stored in repository)
const DEFAULT_PASSCODE_HASH = '1ba79408cd508c6ac1c61fa25f32ec27a240a863be32116f701348e369f368fa';

function getStoredPasscodeHash() {
    // Clean up any deprecated plaintext key
    if (localStorage.getItem('admin_panel_pin')) {
        localStorage.removeItem('admin_panel_pin');
    }
    return localStorage.getItem('admin_passcode_hash') || DEFAULT_PASSCODE_HASH;
}

function initAuth() {
    const isAuth = sessionStorage.getItem('admin_authenticated') === 'true';
    if (isAuth) {
        authGate.style.display = 'none';
    } else {
        authGate.style.display = 'flex';
        authPinInput.focus();
    }
}

async function handleLogin() {
    const enteredPasscode = authPinInput.value.trim();
    if (!enteredPasscode) return;

    const enteredHash = await hashPasscode(enteredPasscode);
    const targetHash = getStoredPasscodeHash();

    if (enteredHash === targetHash) {
        sessionStorage.setItem('admin_authenticated', 'true');
        authGate.style.display = 'none';
        showToast('Welcome to Portfolio Admin Panel!', 'success');
    } else {
        showToast('Incorrect passcode. Please try again.', 'error');
        authPinInput.value = '';
        authPinInput.focus();
    }
}

function handleLogout() {
    sessionStorage.removeItem('admin_authenticated');
    authGate.style.display = 'flex';
    authPinInput.value = '';
    authPinInput.focus();
    showToast('Logged out successfully.', 'info');
}

/**
 * Load Projects from PortfolioManager
 */
function loadProjects() {
    projects = window.PortfolioManager ? window.PortfolioManager.getProjects() : [];
    updateCategoryFilterDropdown();
    updateStats();
    renderProjectList();
}

/**
 * Update Stats Counters
 */
function updateStats() {
    statTotal.textContent = projects.length;

    const categories = new Set(projects.map(p => p.category).filter(Boolean));
    statCategories.textContent = categories.size;

    let demoCount = 0;
    let repoCount = 0;

    projects.forEach(p => {
        (p.links || []).forEach(l => {
            if (l.label.toLowerCase().includes('demo') && l.url && l.url !== '#' && !l.disabled) {
                demoCount++;
            }
            if (l.label.toLowerCase().includes('github') && l.url && l.url !== '#') {
                repoCount++;
            }
        });
    });

    statDemos.textContent = demoCount;
    statRepos.textContent = repoCount;
}

/**
 * Update Category Filter Dropdown Options
 */
function updateCategoryFilterDropdown() {
    const categories = Array.from(new Set(projects.map(p => p.category).filter(Boolean)));
    const selectedVal = categoryFilter.value || 'all';

    categoryFilter.replaceChildren();
    const defaultOpt = document.createElement('option');
    defaultOpt.value = 'all';
    defaultOpt.textContent = 'All Categories';
    categoryFilter.appendChild(defaultOpt);

    categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        categoryFilter.appendChild(opt);
    });

    categoryFilter.value = categories.includes(selectedVal) ? selectedVal : 'all';
}

/**
 * Render Projects into Grid or Table
 */
function renderProjectList() {
    const query = currentSearchQuery.toLowerCase();
    const filtered = projects.filter(p => {
        const matchesCategory = currentCategoryFilter === 'all' || p.category === currentCategoryFilter;
        const matchesQuery = !query || 
            (p.title && p.title.toLowerCase().includes(query)) ||
            (p.description && p.description.toLowerCase().includes(query)) ||
            (p.category && p.category.toLowerCase().includes(query));
        return matchesCategory && matchesQuery;
    });

    if (filtered.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        
        const emptyIcon = document.createElement('i');
        emptyIcon.className = 'bx bx-folder-open';
        const emptyH3 = document.createElement('h3');
        emptyH3.textContent = 'No Projects Found';
        const emptyP = document.createElement('p');
        emptyP.textContent = 'No projects match your current search or category filter.';
        const addBtn = document.createElement('button');
        addBtn.className = 'btn-primary';
        addBtn.onclick = () => openAddModal();
        const plusIcon = document.createElement('i');
        plusIcon.className = 'bx bx-plus';
        addBtn.append(plusIcon, document.createTextNode(' Add New Project'));

        emptyState.append(emptyIcon, emptyH3, emptyP, addBtn);
        projectsGrid.replaceChildren(emptyState);

        const emptyTr = document.createElement('tr');
        const emptyTd = document.createElement('td');
        emptyTd.colSpan = 6;
        emptyTd.style.textAlign = 'center';
        emptyTd.style.padding = '40px';
        emptyTd.style.color = 'var(--text-muted)';
        emptyTd.textContent = 'No matching projects found';
        emptyTr.appendChild(emptyTd);
        projectsTableBody.replaceChildren(emptyTr);
        return;
    }

    // Grid View Render using Safe DOM Nodes
    const gridCards = filtered.map(p => {
        const fullIndex = projects.findIndex(item => item.id === p.id);
        const isFirst = fullIndex === 0;
        const isLast = fullIndex === projects.length - 1;
        return createAdminProjectCardElement(p, fullIndex, isFirst, isLast);
    });
    projectsGrid.replaceChildren(...gridCards);

    // Table View Render using Safe DOM Nodes
    const tableRows = filtered.map(p => {
        const fullIndex = projects.findIndex(item => item.id === p.id);
        const isFirst = fullIndex === 0;
        const isLast = fullIndex === projects.length - 1;
        return createAdminTableRowElement(p, fullIndex, isFirst, isLast);
    });
    projectsTableBody.replaceChildren(...tableRows);
}

function createAdminProjectCardElement(p, fullIndex, isFirst, isLast) {
    const card = document.createElement('div');
    card.className = 'admin-project-card';
    card.dataset.id = p.id;

    // Header bar
    const header = document.createElement('div');
    header.className = 'card-header-bar';

    const catTag = document.createElement('span');
    catTag.className = 'card-category-tag';
    const tagIcon = document.createElement('i');
    tagIcon.className = 'bx bx-tag-alt';
    catTag.append(tagIcon, document.createTextNode(' ' + (p.category || 'General')));

    const orderBadge = document.createElement('span');
    orderBadge.className = 'card-order-badge';
    orderBadge.textContent = `#${fullIndex + 1}`;

    header.append(catTag, orderBadge);
    card.appendChild(header);

    // Thumbnail wrapper
    const thumbWrap = document.createElement('div');
    thumbWrap.className = 'card-thumb-wrapper';
    const img = document.createElement('img');
    const rawImage = p.image || 'images/portfolio.png';
    const safeImage = window.PortfolioManager ? window.PortfolioManager.sanitizeUrl(rawImage) : rawImage;
    img.src = encodeURI(safeImage);
    img.alt = p.title || '';
    img.onerror = () => { img.src = 'images/portfolio.png'; };
    thumbWrap.appendChild(img);
    card.appendChild(thumbWrap);

    // Card Body
    const body = document.createElement('div');
    body.className = 'card-body';

    const title = document.createElement('h3');
    title.className = 'card-title';
    title.textContent = p.title || '';
    body.appendChild(title);

    const desc = document.createElement('p');
    desc.className = 'card-description';
    desc.textContent = p.description || '';
    body.appendChild(desc);

    // Links preview
    const linksPreview = document.createElement('div');
    linksPreview.className = 'card-links-preview';
    (p.links || []).forEach(link => {
        const pill = document.createElement('span');
        const safeUrl = window.PortfolioManager ? window.PortfolioManager.sanitizeUrl(link.url) : link.url;
        const isDisabled = link.disabled || safeUrl === '#';
        pill.className = 'link-pill' + (isDisabled ? ' disabled' : '');
        const icon = document.createElement('i');
        icon.className = link.icon || 'bx bx-link';
        pill.append(icon, document.createTextNode(' ' + (link.label || '')));
        linksPreview.appendChild(pill);
    });
    body.appendChild(linksPreview);

    // Actions bar
    const actionsBar = document.createElement('div');
    actionsBar.className = 'card-actions-bar';

    const reorderBtns = document.createElement('div');
    reorderBtns.className = 'reorder-btns';

    const btnUp = document.createElement('button');
    btnUp.className = 'btn-move';
    btnUp.title = 'Move Up';
    btnUp.disabled = isFirst;
    btnUp.onclick = () => moveProject(p.id, -1);
    const iconUp = document.createElement('i');
    iconUp.className = 'bx bx-up-arrow-alt';
    btnUp.appendChild(iconUp);

    const btnDown = document.createElement('button');
    btnDown.className = 'btn-move';
    btnDown.title = 'Move Down';
    btnDown.disabled = isLast;
    btnDown.onclick = () => moveProject(p.id, 1);
    const iconDown = document.createElement('i');
    iconDown.className = 'bx bx-down-arrow-alt';
    btnDown.appendChild(iconDown);

    reorderBtns.append(btnUp, btnDown);
    actionsBar.appendChild(reorderBtns);

    const editDelBtns = document.createElement('div');
    editDelBtns.className = 'edit-delete-btns';

    const btnDup = document.createElement('button');
    btnDup.className = 'btn-dup';
    btnDup.title = 'Duplicate';
    btnDup.onclick = () => duplicateProject(p.id);
    const iconDup = document.createElement('i');
    iconDup.className = 'bx bx-copy';
    btnDup.appendChild(iconDup);

    const btnEdit = document.createElement('button');
    btnEdit.className = 'btn-edit';
    btnEdit.title = 'Edit';
    btnEdit.onclick = () => openEditModal(p.id);
    const iconEdit = document.createElement('i');
    iconEdit.className = 'bx bx-edit-alt';
    btnEdit.append(iconEdit, document.createTextNode(' Edit'));

    const btnDel = document.createElement('button');
    btnDel.className = 'btn-del';
    btnDel.title = 'Delete';
    btnDel.onclick = () => deleteProject(p.id);
    const iconDel = document.createElement('i');
    iconDel.className = 'bx bx-trash';
    btnDel.appendChild(iconDel);

    editDelBtns.append(btnDup, btnEdit, btnDel);
    actionsBar.appendChild(editDelBtns);

    body.appendChild(actionsBar);
    card.appendChild(body);
    return card;
}

function createAdminTableRowElement(p, fullIndex, isFirst, isLast) {
    const tr = document.createElement('tr');

    const tdIndex = document.createElement('td');
    tdIndex.style.fontWeight = '600';
    tdIndex.style.color = 'var(--main-color)';
    tdIndex.textContent = `#${fullIndex + 1}`;
    tr.appendChild(tdIndex);

    const tdThumb = document.createElement('td');
    const thumbImg = document.createElement('img');
    thumbImg.className = 'table-thumb';
    const rawImage = p.image || 'images/portfolio.png';
    const safeImage = window.PortfolioManager ? window.PortfolioManager.sanitizeUrl(rawImage) : rawImage;
    thumbImg.src = encodeURI(safeImage);
    thumbImg.alt = p.title || '';
    thumbImg.onerror = () => { thumbImg.src = 'images/portfolio.png'; };
    tdThumb.appendChild(thumbImg);
    tr.appendChild(tdThumb);

    const tdInfo = document.createElement('td');
    const divTitle = document.createElement('div');
    divTitle.style.fontWeight = '600';
    divTitle.style.color = '#fff';
    divTitle.textContent = p.title || '';
    const divDesc = document.createElement('div');
    divDesc.style.fontSize = '12px';
    divDesc.style.color = 'var(--text-muted)';
    divDesc.style.maxWidth = '320px';
    divDesc.style.whiteSpace = 'nowrap';
    divDesc.style.overflow = 'hidden';
    divDesc.style.textOverflow = 'ellipsis';
    divDesc.textContent = p.description || '';
    tdInfo.append(divTitle, divDesc);
    tr.appendChild(tdInfo);

    const tdCat = document.createElement('td');
    const catBadge = document.createElement('span');
    catBadge.className = 'badge-dev';
    catBadge.style.fontSize = '11px';
    catBadge.textContent = p.category || 'General';
    tdCat.appendChild(catBadge);
    tr.appendChild(tdCat);

    const tdLinks = document.createElement('td');
    const activeLinksCount = (p.links || []).filter(l => l.url && l.url !== '#').length;
    const spanLinks = document.createElement('span');
    spanLinks.style.fontSize = '13px';
    spanLinks.style.color = 'var(--text-muted)';
    spanLinks.textContent = `${activeLinksCount} active link(s)`;
    tdLinks.appendChild(spanLinks);
    tr.appendChild(tdLinks);

    const tdActions = document.createElement('td');
    const divActions = document.createElement('div');
    divActions.style.display = 'flex';
    divActions.style.gap = '6px';
    divActions.style.alignItems = 'center';

    const btnUp = document.createElement('button');
    btnUp.className = 'btn-move';
    btnUp.disabled = isFirst;
    btnUp.onclick = () => moveProject(p.id, -1);
    const iconUp = document.createElement('i');
    iconUp.className = 'bx bx-up-arrow-alt';
    btnUp.appendChild(iconUp);

    const btnDown = document.createElement('button');
    btnDown.className = 'btn-move';
    btnDown.disabled = isLast;
    btnDown.onclick = () => moveProject(p.id, 1);
    const iconDown = document.createElement('i');
    iconDown.className = 'bx bx-down-arrow-alt';
    btnDown.appendChild(iconDown);

    const btnEdit = document.createElement('button');
    btnEdit.className = 'btn-edit';
    btnEdit.onclick = () => openEditModal(p.id);
    const iconEdit = document.createElement('i');
    iconEdit.className = 'bx bx-edit-alt';
    btnEdit.appendChild(iconEdit);

    const btnDel = document.createElement('button');
    btnDel.className = 'btn-del';
    btnDel.onclick = () => deleteProject(p.id);
    const iconDel = document.createElement('i');
    iconDel.className = 'bx bx-trash';
    btnDel.appendChild(iconDel);

    divActions.append(btnUp, btnDown, btnEdit, btnDel);
    tdActions.appendChild(divActions);
    tr.appendChild(tdActions);

    return tr;
}

/**
 * Preset Images Grid
 */
function populatePresetImages() {
    const thumbs = PRESET_IMAGES.map(img => {
        const div = document.createElement('div');
        div.className = 'preset-thumb';
        div.dataset.path = img.path;
        div.title = img.name;
        div.onclick = () => selectPresetImage(img.path);

        const imgEl = document.createElement('img');
        imgEl.src = img.path;
        imgEl.alt = img.name;
        imgEl.onerror = () => { imgEl.src = 'images/portfolio.png'; };
        div.appendChild(imgEl);
        return div;
    });
    presetGrid.replaceChildren(...thumbs);
}

function selectPresetImage(path) {
    inputImagePath.value = path;
    document.querySelectorAll('.preset-thumb').forEach(el => {
        el.classList.toggle('selected', el.getAttribute('data-path') === path);
    });
    updateLivePreview();
}

/**
 * Live Preview Synchronization
 */
function setupLivePreview() {
    const inputs = [
        inputTitle, inputCategory, inputDescription, inputImagePath,
        linkGh1, linkGh2, linkDemo, linkDemoDisabled, linkCustomLabel, linkCustomUrl
    ];

    inputs.forEach(input => {
        if (!input) return;
        input.addEventListener('input', updateLivePreview);
        input.addEventListener('change', updateLivePreview);
    });
}

function getFormProjectData() {
    const links = [];

    // GitHub 1
    const gh1Val = linkGh1.value.trim();
    if (gh1Val) {
        const isFrontend = linkGh2.value.trim().length > 0;
        links.push({
            label: isFrontend ? "GitHub-Frontend" : "GitHub",
            url: encodeURI(gh1Val),
            icon: "bx bxl-github"
        });
    }

    // GitHub 2 (Backend)
    const gh2Val = linkGh2.value.trim();
    if (gh2Val) {
        links.push({
            label: "GitHub-Backend",
            url: encodeURI(gh2Val),
            icon: "bx bxl-github"
        });
    }

    // Live Demo
    const demoVal = linkDemo.value.trim();
    const isDisabled = linkDemoDisabled.checked;
    if (demoVal || isDisabled) {
        links.push({
            label: "Live Demo",
            url: isDisabled ? "#" : encodeURI(demoVal),
            icon: "bx bx-globe",
            disabled: isDisabled
        });
    }

    // Custom Link
    const customLabel = linkCustomLabel.value.trim();
    const customUrl = linkCustomUrl.value.trim();
    if (customLabel && customUrl) {
        const isYoutube = customUrl.includes('youtube') || customUrl.includes('youtu.be');
        links.push({
            label: customLabel,
            url: encodeURI(customUrl),
            icon: isYoutube ? 'bx bxl-youtube' : 'bx bx-link'
        });
    }

    const rawImg = inputImagePath.value.trim() || 'images/portfolio.png';
    return {
        id: editingProjectId || `proj-${Date.now()}`,
        title: inputTitle.value.trim() || 'New Portfolio Project',
        category: inputCategory.value.trim() || 'Web Dev',
        image: encodeURI(rawImg),
        description: inputDescription.value.trim() || 'Add a compelling description of what technologies you used, the core architecture, and key features of this project.',
        links: links.length > 0 ? links : [
            { label: "GitHub", url: "#", icon: "bx bxl-github" },
            { label: "Live Demo", url: "#", icon: "bx bx-globe" }
        ]
    };
}

function updateLivePreview() {
    const tempProj = getFormProjectData();
    previewBox.replaceChildren();
    if (window.PortfolioManager && window.PortfolioManager.createProjectCardElement) {
        previewBox.appendChild(window.PortfolioManager.createProjectCardElement(tempProj));
    }
}

function setModalTitle(iconClass, titleText) {
    modalTitle.replaceChildren();
    const icon = document.createElement('i');
    icon.className = iconClass;
    modalTitle.append(icon, document.createTextNode(' ' + titleText));
}

/**
 * Modal Handling (Add / Edit)
 */
function openAddModal() {
    editingProjectId = null;
    setModalTitle('bx bx-plus-circle', 'Add New Project');
    projectForm.reset();
    inputImagePath.value = 'images/portfolio.png';
    linkDemoDisabled.checked = false;

    // Reset preset image highlights
    document.querySelectorAll('.preset-thumb').forEach(el => el.classList.remove('selected'));

    updateLivePreview();
    projectModal.classList.add('active');
    inputTitle.focus();
}

function openEditModal(projectId) {
    const proj = projects.find(p => p.id === projectId);
    if (!proj) return;

    editingProjectId = projectId;
    setModalTitle('bx bx-edit-alt', 'Edit Project');

    inputTitle.value = proj.title || '';
    inputCategory.value = proj.category || 'Web Dev';
    inputDescription.value = proj.description || '';
    inputImagePath.value = proj.image || 'images/portfolio.png';

    // Highlight preset image if matched
    document.querySelectorAll('.preset-thumb').forEach(el => {
        el.classList.toggle('selected', el.getAttribute('data-path') === proj.image);
    });

    // Populate links
    linkGh1.value = '';
    linkGh2.value = '';
    linkDemo.value = '';
    linkDemoDisabled.checked = false;
    linkCustomLabel.value = '';
    linkCustomUrl.value = '';

    (proj.links || []).forEach(l => {
        const labelLower = (l.label || '').toLowerCase();
        if (labelLower.includes('frontend')) {
            linkGh1.value = l.url || '';
        } else if (labelLower.includes('backend')) {
            linkGh2.value = l.url || '';
        } else if (labelLower.includes('github') && !linkGh1.value) {
            linkGh1.value = l.url || '';
        } else if (labelLower.includes('demo')) {
            linkDemo.value = l.url === '#' ? '' : (l.url || '');
            linkDemoDisabled.checked = !!l.disabled || l.url === '#';
        } else {
            linkCustomLabel.value = l.label || '';
            linkCustomUrl.value = l.url || '';
        }
    });

    updateLivePreview();
    projectModal.classList.add('active');
    inputTitle.focus();
}

function closeModal() {
    projectModal.classList.remove('active');
    editingProjectId = null;
}

/**
 * Save Project (Add or Update)
 */
function handleSaveProject(e) {
    e.preventDefault();

    const title = inputTitle.value.trim();
    const description = inputDescription.value.trim();

    if (!title) {
        showToast('Please enter a project title', 'error');
        inputTitle.focus();
        return;
    }

    if (!description) {
        showToast('Please enter a project description', 'error');
        inputDescription.focus();
        return;
    }

    const projectData = getFormProjectData();

    if (editingProjectId) {
        const index = projects.findIndex(p => p.id === editingProjectId);
        if (index !== -1) {
            projects[index] = projectData;
            showToast(`Updated "${projectData.title}"`, 'success');
        }
    } else {
        projects.unshift(projectData);
        showToast(`Added new project "${projectData.title}"!`, 'success');
    }

    // Persist
    window.PortfolioManager.saveProjects(projects);
    loadProjects();
    closeModal();
}

/**
 * Reorder Projects (Move Up/Down)
 */
function moveProject(projectId, delta) {
    const index = projects.findIndex(p => p.id === projectId);
    if (index === -1) return;

    const newIndex = index + delta;
    if (newIndex < 0 || newIndex >= projects.length) return;

    const temp = projects[index];
    projects[index] = projects[newIndex];
    projects[newIndex] = temp;

    window.PortfolioManager.saveProjects(projects);
    renderProjectList();
    showToast('Project order updated', 'info');
}

/**
 * Duplicate Project
 */
function duplicateProject(projectId) {
    const proj = projects.find(p => p.id === projectId);
    if (!proj) return;

    const clone = JSON.parse(JSON.stringify(proj));
    clone.id = `proj-${Date.now()}`;
    clone.title = `${clone.title} (Copy)`;

    const index = projects.findIndex(p => p.id === projectId);
    projects.splice(index + 1, 0, clone);

    window.PortfolioManager.saveProjects(projects);
    loadProjects();
    showToast(`Duplicated project`, 'success');
}

/**
 * Delete Project
 */
function deleteProject(projectId) {
    const proj = projects.find(p => p.id === projectId);
    if (!proj) return;

    if (confirm(`Are you sure you want to delete "${proj.title}"?`)) {
        projects = projects.filter(p => p.id !== projectId);
        window.PortfolioManager.saveProjects(projects);
        loadProjects();
        showToast('Project deleted', 'info');
    }
}

/**
 * Reset to Defaults
 */
function handleResetDefaults() {
    if (confirm('Are you sure you want to restore the default projects? Any unsaved custom additions in localStorage will be reset.')) {
        projects = window.PortfolioManager.resetToDefaults();
        loadProjects();
        showToast('Reset to original projects!', 'success');
    }
}

/**
 * File Upload Handling (Drag & Drop or File Input)
 */
function handleFileUpload(file) {
    if (!file || !file.type.startsWith('image/')) {
        showToast('Please select a valid image file (PNG, JPG, WebP)', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        inputImagePath.value = e.target.result;
        document.querySelectorAll('.preset-thumb').forEach(el => el.classList.remove('selected'));
        updateLivePreview();
        showToast(`Image loaded: ${file.name}`, 'success');
    };
    reader.readAsDataURL(file);
}

/**
 * Switch Image Tabs
 */
function switchImageTab(tabName) {
    document.querySelectorAll('.img-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
    });

    document.getElementById('tab-upload').style.display = tabName === 'upload' ? 'block' : 'none';
    document.getElementById('tab-presets').style.display = tabName === 'presets' ? 'block' : 'none';
    document.getElementById('tab-url').style.display = tabName === 'url' ? 'block' : 'none';
}

/**
 * Switch View Mode (Grid vs Table)
 */
function setViewMode(mode) {
    currentViewMode = mode;
    viewGridBtn.classList.toggle('active', mode === 'grid');
    viewTableBtn.classList.toggle('active', mode === 'table');

    if (mode === 'grid') {
        projectsGrid.style.display = 'grid';
        projectsTableCard.style.display = 'none';
    } else {
        projectsGrid.style.display = 'none';
        projectsTableCard.style.display = 'block';
    }
    renderProjectList();
}

/**
 * Export & Sync Hub
 */
function openExportModal() {
    generateExportCode();
    switchExportTab('js');
    exportModal.classList.add('active');
}

function closeExportModal() {
    exportModal.classList.remove('active');
}

function generateExportCode() {
    // 1. projects.js complete code
    const projectsJsonStr = JSON.stringify(projects, null, 4);
    const jsCode = `/**
 * projects.js
 * Centralized data store and management for Portfolio Projects.
 * Synchronizes with localStorage and provides exportable data for static deployment.
 */

const DEFAULT_PROJECTS = ${projectsJsonStr};

const STORAGE_KEY = "my_portfolio_projects_data";

const PortfolioManager = {
    getProjects() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch (e) {
            console.error("Error reading projects:", e);
        }
        return [...DEFAULT_PROJECTS];
    },
    saveProjects(projects) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
            return true;
        } catch (e) {
            console.error("Error saving projects:", e);
            return false;
        }
    },
    resetToDefaults() {
        localStorage.removeItem(STORAGE_KEY);
        return [...DEFAULT_PROJECTS];
    },
    sanitizeUrl(url) {
        if (!url) return '#';
        const trimmed = String(url).trim();
        if (
            trimmed.startsWith('images/') ||
            trimmed.startsWith('./') ||
            trimmed.startsWith('/') ||
            trimmed.startsWith('data:image/') ||
            trimmed.startsWith('http://') ||
            trimmed.startsWith('https://') ||
            trimmed.startsWith('mailto:') ||
            trimmed === '#'
        ) {
            return trimmed;
        }
        return '#';
    },
    createProjectCardElement(project) {
        const box = document.createElement('div');
        box.className = 'portfolio-box';
        if (project.id) box.dataset.id = project.id;

        const title = document.createElement('h4');
        title.className = 'project-name';
        title.textContent = project.title || 'Portfolio Project';
        box.appendChild(title);

        const imgWrapper = document.createElement('div');
        imgWrapper.className = 'project-image-wrapper';

        const img = document.createElement('img');
        img.src = this.sanitizeUrl(project.image || 'images/portfolio.png');
        img.alt = project.title || 'Project Preview';
        img.onerror = () => { img.src = 'images/portfolio.png'; };
        imgWrapper.appendChild(img);

        const layer = document.createElement('div');
        layer.className = 'portfolio-layer';
        const desc = document.createElement('p');
        desc.textContent = project.description || '';
        layer.appendChild(desc);
        imgWrapper.appendChild(layer);
        box.appendChild(imgWrapper);

        const btnContainer = document.createElement('div');
        btnContainer.className = 'project-buttons';

        (project.links || []).forEach(link => {
            const a = document.createElement('a');
            const safeUrl = this.sanitizeUrl(link.url);
            const isDisabled = link.disabled || safeUrl === '#';

            a.href = safeUrl;
            a.className = 'project-btn' + (isDisabled ? ' disabled' : '');
            if (!isDisabled) {
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
            }
            a.setAttribute('aria-label', link.label || 'Project Link');

            const icon = document.createElement('i');
            icon.className = link.icon || 'bx bx-link';
            a.appendChild(icon);
            a.appendChild(document.createTextNode(' ' + (link.label || 'Link')));
            btnContainer.appendChild(a);
        });

        box.appendChild(btnContainer);
        return box;
    },
    renderProjectCardHTML(project) {
        const safeImage = this.sanitizeUrl(project.image || 'images/portfolio.png');
        const linksHTML = (project.links || []).map(link => {
            const safeUrl = this.sanitizeUrl(link.url);
            const isDisabled = link.disabled || safeUrl === '#';
            const disabledClass = isDisabled ? ' disabled' : '';
            const targetAttr = isDisabled ? '' : ' target="_blank" rel="noopener noreferrer"';
            const iconClass = this.escapeHTML(link.icon || 'bx bx-link');
            const labelText = this.escapeHTML(link.label || 'Link');
            return \`
                <a href="\${safeUrl}"\${targetAttr} class="project-btn\${disabledClass}" aria-label="\${labelText}">
                    <i class='\${iconClass}'></i> \${labelText}
                </a>
            \`;
        }).join('');

        return \`
            <div class="portfolio-box" data-id="\${this.escapeHTML(project.id || '')}">
                <h4 class="project-name">\${this.escapeHTML(project.title || '')}</h4>
                <div class="project-image-wrapper">
                    <img src="\${safeImage}" alt="\${this.escapeHTML(project.title || '')}" onerror="this.src='images/portfolio.png'">
                    <div class="portfolio-layer">
                        <p>\${this.escapeHTML(project.description || '')}</p>
                    </div>
                </div>
                <div class="project-buttons">
                    \${linksHTML}
                </div>
            </div>
        \`.trim();
    },
    escapeHTML(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    },
    renderToContainer(containerElement) {
        if (!containerElement) return;
        const projects = this.getProjects();
        containerElement.replaceChildren(...projects.map(p => this.createProjectCardElement(p)));
    }
};

if (typeof window !== 'undefined') {
    window.DEFAULT_PROJECTS = DEFAULT_PROJECTS;
    window.PortfolioManager = PortfolioManager;
}
`;
    exportJsPreview.textContent = jsCode;

    // 2. Pure HTML Snippet for index.html
    const htmlSnippet = projects.map(p => window.PortfolioManager.renderProjectCardHTML(p)).join('\n\n');
    exportHtmlPreview.textContent = htmlSnippet;

    // 3. Raw JSON
    exportJsonPreview.textContent = projectsJsonStr;
}

function switchExportTab(tab) {
    document.querySelectorAll('.export-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-tab') === tab);
    });

    document.getElementById('export-tab-js').style.display = tab === 'js' ? 'block' : 'none';
    document.getElementById('export-tab-html').style.display = tab === 'html' ? 'block' : 'none';
    document.getElementById('export-tab-github').style.display = tab === 'github' ? 'block' : 'none';
    document.getElementById('export-tab-json').style.display = tab === 'json' ? 'block' : 'none';
}

function downloadProjectsJsFile() {
    generateExportCode();
    const content = exportJsPreview.textContent;
    const blob = new Blob([content], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'projects.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Downloaded updated projects.js file!', 'success');
}

function copyToClipboard(elementId, successMessage) {
    const el = document.getElementById(elementId);
    if (!el) return;

    navigator.clipboard.writeText(el.textContent).then(() => {
        showToast(successMessage || 'Copied to clipboard!', 'success');
    }).catch(err => {
        showToast('Failed to copy. Please select and copy manually.', 'error');
    });
}

/**
 * Direct GitHub API Sync (Optional feature for one-click static deployment)
 */
async function syncToGitHub() {
    const token = document.getElementById('gh-token').value.trim();
    const repo = document.getElementById('gh-repo').value.trim() || 'Ehashan/My-Portfolio-';
    const branch = document.getElementById('gh-branch').value.trim() || 'dev';
    const filePath = 'projects.js';

    if (!token) {
        showToast('Please enter your GitHub Personal Access Token', 'error');
        document.getElementById('gh-token').focus();
        return;
    }

    showToast('Connecting to GitHub API...', 'info');

    try {
        generateExportCode();
        const content = exportJsPreview.textContent;
        const base64Content = btoa(unescape(encodeURIComponent(content)));

        // 1. Get current file SHA if exists
        const getFileUrl = `https://api.github.com/repos/${repo}/contents/${filePath}?ref=${branch}`;
        const getRes = await fetch(getFileUrl, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        let sha = null;
        if (getRes.ok) {
            const fileData = await getRes.json();
            sha = fileData.sha;
        }

        // 2. Put file to branch
        const putUrl = `https://api.github.com/repos/${repo}/contents/${filePath}`;
        const bodyPayload = {
            message: `Update projects via Portfolio Admin Panel [${new Date().toLocaleDateString()}]`,
            content: base64Content,
            branch: branch
        };
        if (sha) bodyPayload.sha = sha;

        const putRes = await fetch(putUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify(bodyPayload)
        });

        if (putRes.ok) {
            showToast(`Successfully committed projects.js to ${branch} branch!`, 'success');
        } else {
            const err = await putRes.json();
            showToast(`GitHub Error: ${err.message}`, 'error');
        }
    } catch (err) {
        console.error(err);
        showToast(`Sync failed: ${err.message}`, 'error');
    }
}

/**
 * Settings Modal (Change PIN)
 */
function openSettingsModal() {
    currentPinInput.value = '';
    newPinInput.value = '';
    confirmPinInput.value = '';
    settingsModal.classList.add('active');
}

function closeSettingsModal() {
    settingsModal.classList.remove('active');
}

async function handleUpdatePin(e) {
    e.preventDefault();
    const curr = currentPinInput.value.trim();
    const next = newPinInput.value.trim();
    const conf = confirmPinInput.value.trim();

    const currHash = await hashPasscode(curr);
    const targetHash = getStoredPasscodeHash();

    if (currHash !== targetHash) {
        showToast('Current passcode is incorrect', 'error');
        currentPinInput.focus();
        return;
    }

    if (next.length < 6) {
        showToast('New passcode must be at least 6 characters', 'error');
        newPinInput.focus();
        return;
    }

    if (next !== conf) {
        showToast('New passcode and confirmation do not match', 'error');
        confirmPinInput.focus();
        return;
    }

    const nextHash = await hashPasscode(next);
    localStorage.setItem('admin_passcode_hash', nextHash);
    closeSettingsModal();
    showToast('Admin passcode updated securely!', 'success');
}

/**
 * Toast Notification System
 */
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'toast-error' : ''}`;

    let icon = 'bx bx-info-circle';
    if (type === 'success') icon = 'bx bx-check-circle';
    if (type === 'error') icon = 'bx bx-error-circle';

    toast.replaceChildren();
    const iconEl = document.createElement('i');
    iconEl.className = icon;
    const spanEl = document.createElement('span');
    spanEl.textContent = message;
    toast.append(iconEl, spanEl);
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Setup All Event Listeners
 */
function setupEventListeners() {
    // Auth
    btnLogin.addEventListener('click', handleLogin);
    authPinInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });
    btnLogout.addEventListener('click', handleLogout);

    // Search and filter
    searchInput.addEventListener('input', (e) => {
        currentSearchQuery = e.target.value.trim();
        renderProjectList();
    });

    categoryFilter.addEventListener('change', (e) => {
        currentCategoryFilter = e.target.value;
        renderProjectList();
    });

    // View mode
    viewGridBtn.addEventListener('click', () => setViewMode('grid'));
    viewTableBtn.addEventListener('click', () => setViewMode('table'));

    // Project Form
    projectForm.addEventListener('submit', handleSaveProject);

    // File Upload
    dropzone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
        }
    });

    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = 'var(--main-color)';
    });
    dropzone.addEventListener('dragleave', () => {
        dropzone.style.borderColor = 'var(--border-color)';
    });
    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = 'var(--border-color)';
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    });

    // Close modals on backdrop click or ESC
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
            closeExportModal();
            closeSettingsModal();
        }
    });
}
