// TradeFlow - Secure Document Upload Portal
// Frontend JavaScript for document management

// Document Types Configuration
const DOCUMENT_TYPES = [
    {
        id: 'commercial-invoice',
        name: 'Commercial Invoice',
        description: 'Official invoice detailing goods, quantities, and values',
        icon: '📄',
        acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
        maxSize: 10 * 1024 * 1024 // 10MB
    },
    {
        id: 'packing-list',
        name: 'Packing List',
        description: 'Detailed list of package contents with weights and dimensions',
        icon: '📦',
        acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
        maxSize: 10 * 1024 * 1024
    },
    {
        id: 'bill-of-lading',
        name: 'Bill of Lading / Air Waybill',
        description: 'Contract between shipper and carrier for goods transport',
        icon: '🚢',
        acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
        maxSize: 10 * 1024 * 1024
    },
    {
        id: 'certificate-of-origin',
        name: 'Certificate of Origin',
        description: 'Document certifying country of manufacture',
        icon: '🌍',
        acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
        maxSize: 10 * 1024 * 1024
    },
    {
        id: 'import-export-license',
        name: 'Import/Export License',
        description: 'Government authorization for international trade',
        icon: '📋',
        acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
        maxSize: 10 * 1024 * 1024
    },
    {
        id: 'customs-declaration',
        name: 'Customs Declaration',
        description: 'Official customs documentation for clearance',
        icon: '🛃',
        acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
        maxSize: 10 * 1024 * 1024
    },
    {
        id: 'insurance-certificate',
        name: 'Insurance Certificate',
        description: 'Proof of cargo insurance coverage',
        icon: '🛡️',
        acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
        maxSize: 10 * 1024 * 1024
    },
    {
        id: 'inspection-certificate',
        name: 'Inspection Certificate',
        description: 'Quality and compliance inspection report',
        icon: '✓',
        acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
        maxSize: 10 * 1024 * 1024
    },
    {
        id: 'letter-of-credit',
        name: 'Letter of Credit',
        description: 'Bank guarantee for payment settlement',
        icon: '🏦',
        acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
        maxSize: 10 * 1024 * 1024
    },
    {
        id: 'proforma-invoice',
        name: 'Proforma Invoice',
        description: 'Preliminary invoice for quotation purposes',
        icon: '📑',
        acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
        maxSize: 10 * 1024 * 1024
    }
];

// Upload State Management
const uploadState = {
    documents: {},
    companyName: '',
    userEmail: '',
    contactName: ''
};

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    initializeUploadCards();
    initializeChecklist();
    initializeMobileAccordion();
    initializeFormListeners();
    initializeScrollAnimations();
    loadSavedState();
});

// Initialize Upload Cards
function initializeUploadCards() {
    const container = document.getElementById('upload-cards');
    
    DOCUMENT_TYPES.forEach((doc, index) => {
        const card = createUploadCard(doc, index);
        container.appendChild(card);
    });
}

// Create Individual Upload Card
function createUploadCard(doc, index) {
    const card = document.createElement('div');
    card.className = 'card-3d glass-card rounded-2xl p-6 reveal-up';
    card.style.animationDelay = `${index * 100}ms`;
    card.dataset.documentId = doc.id;
    
    card.innerHTML = `
        <div class="flex items-start justify-between mb-4">
            <div class="flex items-center space-x-3">
                <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
                    ${doc.icon}
                </div>
                <div>
                    <h3 class="text-lg font-bold text-primary-black">${doc.name}</h3>
                    <p class="text-sm text-gray-500">${doc.description}</p>
                </div>
            </div>
            <div class="checkmark" id="checkmark-${doc.id}">
                <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
            </div>
        </div>
        
        <div class="upload-zone p-6 text-center" id="upload-zone-${doc.id}" data-document-id="${doc.id}">
            <input type="file" id="file-input-${doc.id}" class="hidden" accept="${doc.acceptedTypes.join(',')}">
            
            <div class="upload-content">
                <svg class="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
                <p class="text-gray-600 mb-2">Drag & drop your file here</p>
                <p class="text-sm text-gray-400 mb-4">or</p>
                <button type="button" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 browse-btn" data-document-id="${doc.id}">
                    Browse File
                </button>
                <p class="text-xs text-gray-400 mt-3">PDF, JPG, PNG up to 10MB</p>
            </div>
            
            <div class="upload-loading hidden">
                <div class="loader mx-auto mb-3"></div>
                <p class="text-gray-600">Uploading...</p>
            </div>
            
            <div class="file-preview hidden" id="preview-${doc.id}">
                <svg class="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                </svg>
                <span class="file-preview-name" id="filename-${doc.id}"></span>
                <button type="button" class="file-preview-remove" data-document-id="${doc.id}">×</button>
            </div>
        </div>
        
        <div class="status-message hidden mt-3 text-sm" id="status-${doc.id}"></div>
    `;
    
    // Add event listeners
    const uploadZone = card.querySelector(`#upload-zone-${doc.id}`);
    const fileInput = card.querySelector(`#file-input-${doc.id}`);
    const browseBtn = card.querySelector('.browse-btn');
    const removeBtn = card.querySelector('.file-preview-remove');
    
    // Drag & Drop Events
    uploadZone.addEventListener('dragover', handleDragOver);
    uploadZone.addEventListener('dragleave', handleDragLeave);
    uploadZone.addEventListener('drop', handleDrop);
    
    // Browse Button
    browseBtn.addEventListener('click', () => fileInput.click());
    
    // File Input Change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileUpload(doc.id, e.target.files[0]);
        }
    });
    
    // Remove Button
    if (removeBtn) {
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeFile(doc.id);
        });
    }
    
    return card;
}

// Initialize Checklist
function initializeChecklist() {
    const desktopList = document.getElementById('document-checklist');
    const mobileList = document.getElementById('mobile-document-checklist');
    
    DOCUMENT_TYPES.forEach(doc => {
        const item = createChecklistItem(doc);
        desktopList.appendChild(item.cloneNode(true));
        mobileList.appendChild(item);
    });
}

// Create Checklist Item
function createChecklistItem(doc) {
    const item = document.createElement('div');
    item.className = 'doc-item';
    item.id = `checklist-item-${doc.id}`;
    item.dataset.documentId = doc.id;
    
    item.innerHTML = `
        <div class="doc-status pending" id="status-icon-${doc.id}">
            <svg class="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
            </svg>
        </div>
        <span class="text-sm text-gray-700 flex-1">${doc.name}</span>
    `;
    
    return item;
}

// Drag & Drop Handlers
function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    const uploadZone = e.currentTarget;
    uploadZone.classList.remove('drag-over');
    
    const documentId = uploadZone.dataset.documentId;
    const files = e.dataTransfer.files;
    
    if (files.length > 0) {
        handleFileUpload(documentId, files[0]);
    }
}

// File Upload Handler
async function handleFileUpload(documentId, file) {
    const docType = DOCUMENT_TYPES.find(d => d.id === documentId);
    
    // Validate file type
    if (!docType.acceptedTypes.includes(file.type)) {
        showToast('Invalid file type. Please upload PDF, JPG, or PNG.', 'error');
        return;
    }
    
    // Validate file size
    if (file.size > docType.maxSize) {
        showToast('File too large. Maximum size is 10MB.', 'error');
        return;
    }
    
    // Get user info
    const companyName = document.getElementById('company-name').value.trim();
    const userEmail = document.getElementById('user-email').value.trim();
    
    if (!companyName || !userEmail) {
        showToast('Please enter your company name and email first.', 'error');
        document.getElementById('company-name').focus();
        return;
    }
    
    // Show loading state
    showUploadLoading(documentId, true);
    
    // Prepare form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentId);
    formData.append('document_name', docType.name);
    formData.append('company_name', companyName);
    formData.append('user_email', userEmail);
    formData.append('contact_name', document.getElementById('contact-name').value.trim());
    
    try {
        // Upload to server
        const response = await fetch('http://localhost:5000/upload-document', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            // Update UI
            uploadState.documents[documentId] = {
                filename: result.filename,
                uploadedAt: new Date().toISOString(),
                fileId: result.file_id
            };
            
            showUploadSuccess(documentId, file.name);
            updateProgress();
            saveState();
            showToast(`${docType.name} uploaded successfully!`, 'success');
        } else {
            throw new Error(result.message || 'Upload failed');
        }
    } catch (error) {
        console.error('Upload error:', error);
        showUploadLoading(documentId, false);
        showToast(`Upload failed: ${error.message}`, 'error');
    }
}

// Show Upload Loading State
function showUploadLoading(documentId, show) {
    const uploadZone = document.getElementById(`upload-zone-${documentId}`);
    const uploadContent = uploadZone.querySelector('.upload-content');
    const uploadLoading = uploadZone.querySelector('.upload-loading');
    
    if (show) {
        uploadContent.classList.add('hidden');
        uploadLoading.classList.remove('hidden');
    } else {
        uploadContent.classList.remove('hidden');
        uploadLoading.classList.add('hidden');
    }
}

// Show Upload Success State
function showUploadSuccess(documentId, filename) {
    const uploadZone = document.getElementById(`upload-zone-${documentId}`);
    const uploadLoading = uploadZone.querySelector('.upload-loading');
    const filePreview = uploadZone.querySelector('.file-preview');
    const filenameDisplay = document.getElementById(`filename-${documentId}`);
    const checkmark = document.getElementById(`checkmark-${documentId}`);
    
    // Hide loading
    uploadLoading.classList.add('hidden');
    
    // Show file preview
    filenameDisplay.textContent = filename;
    filePreview.classList.remove('hidden');
    
    // Add uploaded class to zone
    uploadZone.classList.add('uploaded');
    
    // Animate checkmark
    setTimeout(() => {
        checkmark.classList.add('show');
        anime({
            targets: checkmark,
            scale: [0, 1.2, 1],
            opacity: [0, 1],
            duration: 500,
            easing: 'easeOutElastic(1, .5)'
        });
    }, 200);
    
    // Update checklist
    updateChecklistItem(documentId, true);
}

// Remove File
function removeFile(documentId) {
    delete uploadState.documents[documentId];
    
    const uploadZone = document.getElementById(`upload-zone-${documentId}`);
    const uploadContent = uploadZone.querySelector('.upload-content');
    const filePreview = uploadZone.querySelector('.file-preview');
    const checkmark = document.getElementById(`checkmark-${documentId}`);
    const fileInput = document.getElementById(`file-input-${documentId}`);
    
    // Reset UI
    uploadContent.classList.remove('hidden');
    filePreview.classList.add('hidden');
    uploadZone.classList.remove('uploaded');
    checkmark.classList.remove('show');
    fileInput.value = '';
    
    // Update checklist
    updateChecklistItem(documentId, false);
    updateProgress();
    saveState();
    
    showToast('File removed', 'success');
}

// Update Checklist Item
function updateChecklistItem(documentId, uploaded) {
    const item = document.getElementById(`checklist-item-${documentId}`);
    const statusIcon = document.getElementById(`status-icon-${documentId}`);
    
    if (uploaded) {
        item.classList.add('uploaded');
        statusIcon.classList.remove('pending');
        statusIcon.classList.add('uploaded');
        statusIcon.innerHTML = `
            <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
        `;
    } else {
        item.classList.remove('uploaded');
        statusIcon.classList.remove('uploaded');
        statusIcon.classList.add('pending');
        statusIcon.innerHTML = `
            <svg class="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
            </svg>
        `;
    }
}

// Update Progress
function updateProgress() {
    const uploadedCount = Object.keys(uploadState.documents).length;
    const totalCount = DOCUMENT_TYPES.length;
    const percentage = Math.round((uploadedCount / totalCount) * 100);
    
    // Update counters
    document.getElementById('uploaded-count').textContent = uploadedCount;
    document.getElementById('completion-percentage').textContent = `${percentage}%`;
    document.getElementById('progress-text').textContent = `${uploadedCount} of ${totalCount}`;
    document.getElementById('mobile-progress-text').textContent = `${uploadedCount} of ${totalCount} documents`;
    
    // Update progress bars
    const mainProgress = document.getElementById('main-progress');
    const mobileProgress = document.getElementById('mobile-main-progress');
    
    mainProgress.style.width = `${percentage}%`;
    mobileProgress.style.width = `${percentage}%`;
    
    // Add completion class when done
    if (percentage === 100) {
        mainProgress.classList.add('complete');
        mobileProgress.classList.add('complete');
        
        // Show completion message
        if (uploadedCount === totalCount) {
            showToast('All documents uploaded successfully!', 'success');
        }
    } else {
        mainProgress.classList.remove('complete');
        mobileProgress.classList.remove('complete');
    }
}

// Initialize Mobile Accordion
function initializeMobileAccordion() {
    const toggle = document.getElementById('mobile-status-toggle');
    const content = document.getElementById('mobile-accordion-content');
    const icon = document.getElementById('mobile-toggle-icon');
    
    if (toggle && content) {
        toggle.addEventListener('click', () => {
            content.classList.toggle('open');
            icon.style.transform = content.classList.contains('open') ? 'rotate(180deg)' : 'rotate(0deg)';
        });
    }
}

// Initialize Form Listeners
function initializeFormListeners() {
    const companyInput = document.getElementById('company-name');
    const emailInput = document.getElementById('user-email');
    const contactInput = document.getElementById('contact-name');
    
    [companyInput, emailInput, contactInput].forEach(input => {
        input.addEventListener('input', () => {
            uploadState.companyName = companyInput.value;
            uploadState.userEmail = emailInput.value;
            uploadState.contactName = contactInput.value;
            saveState();
        });
    });
}

// Initialize Scroll Animations
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                anime({
                    targets: entry.target,
                    opacity: [0, 1],
                    translateY: [30, 0],
                    duration: 600,
                    easing: 'cubicBezier(0.4, 0, 0.2, 1)'
                });
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal-up').forEach(el => {
        observer.observe(el);
    });
}

// Toast Notification
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    // Animate in
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Auto remove
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Save State to LocalStorage
function saveState() {
    localStorage.setItem('tradeflow_documents', JSON.stringify(uploadState));
}

// Load Saved State
function loadSavedState() {
    const saved = localStorage.getItem('tradeflow_documents');
    if (saved) {
        const state = JSON.parse(saved);
        
        // Restore form values
        if (state.companyName) {
            document.getElementById('company-name').value = state.companyName;
        }
        if (state.userEmail) {
            document.getElementById('user-email').value = state.userEmail;
        }
        if (state.contactName) {
            document.getElementById('contact-name').value = state.contactName;
        }
        
        // Restore document state (note: files can't be restored, just metadata)
        if (state.documents) {
            uploadState.documents = state.documents;
            
            // Update UI for uploaded documents
            Object.keys(state.documents).forEach(docId => {
                updateChecklistItem(docId, true);
            });
            
            updateProgress();
        }
    }
}

// Mobile Menu Toggle
document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('hidden');
});

console.log('TradeFlow Document Portal initialized');