// Admin credentials
const ADMIN_EMAIL = "sakshi123sinha@gmail.com";
const ADMIN_PASSWORD = "1234as";

// Data storage keys
const USERS_KEY = "lostFoundUsers";
const ITEMS_KEY = "lostFoundItems";
const ECOSWAP_KEY = "ecoswapItems";
const REMEMBERED_USER_KEY = "rememberedUser";
const CLAIM_VERIFICATIONS_KEY = "claimVerifications";

// Initialize data
let users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
let items = JSON.parse(localStorage.getItem(ITEMS_KEY)) || [];
let ecoswapItems = JSON.parse(localStorage.getItem(ECOSWAP_KEY)) || [];
let claimVerifications = JSON.parse(localStorage.getItem(CLAIM_VERIFICATIONS_KEY)) || [];
let currentUser = null;
let currentFormType = '';
let currentClaimItemId = null;

// Add admin user if not exists
if (!users.find(user => user.email === ADMIN_EMAIL)) {
    users.push({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        name: "Admin",
        isAdmin: true
    });
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Check if there's a remembered user
    const rememberedUser = localStorage.getItem(REMEMBERED_USER_KEY);
    if (rememberedUser) {
        const user = JSON.parse(rememberedUser);
        handleAuthSuccess(user);
    } else {
        startLoadingSequence();
    }
});

function startLoadingSequence() {
    const progressBar = document.getElementById('progress-bar');
    const loadingText = document.getElementById('loading-text');

    const loadingSteps = [
        { progress: 20, text: "Loading components..." },
        { progress: 40, text: "Connecting to database..." },
        { progress: 60, text: "Preparing interface..." },
        { progress: 80, text: "Finalizing setup..." },
        { progress: 100, text: "Ready!" }
    ];

    let currentStep = 0;

    function updateProgress() {
        if (currentStep < loadingSteps.length) {
            const step = loadingSteps[currentStep];
            progressBar.style.width = step.progress + '%';
            loadingText.textContent = step.text;
            currentStep++;
            setTimeout(updateProgress, 800);
        } else {
            setTimeout(() => {
                showAuthScreen();
            }, 500);
        }
    }

    updateProgress();
}

function showAuthScreen() {
    document.getElementById('loading-screen').classList.add('hidden');
    document.getElementById('auth-screen').classList.remove('hidden');
}

window.switchAuth = function(type) {
    const loginTab = document.getElementById('login-tab');
    const signupTab = document.getElementById('signup-tab');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const title = document.getElementById('auth-title');
    const subtitle = document.getElementById('auth-subtitle');

    if (type === 'login') {
        loginTab.classList.add('bg-white', 'text-gray-800', 'shadow-sm');
        loginTab.classList.remove('text-gray-600', 'hover:text-gray-800');
        signupTab.classList.remove('bg-white', 'text-gray-800', 'shadow-sm');
        signupTab.classList.add('text-gray-600', 'hover:text-gray-800');
        
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
        
        title.textContent = 'Welcome Back';
        subtitle.textContent = 'Sign in to your account';
    } else {
        signupTab.classList.add('bg-white', 'text-gray-800', 'shadow-sm');
        signupTab.classList.remove('text-gray-600', 'hover:text-gray-800');
        loginTab.classList.remove('bg-white', 'text-gray-800', 'shadow-sm');
        loginTab.classList.add('text-gray-600', 'hover:text-gray-800');
        
        signupForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
        
        title.textContent = 'Create Account';
        subtitle.textContent = 'Join our community today';
    }
};

// Login form submission
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const rememberMe = document.getElementById('remember-me').checked;
    
    handleLogin(email, password, rememberMe);
});

// Signup form submission
document.getElementById('signup-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    
    handleSignup(name, email, password, confirmPassword);
});

function handleLogin(email, password, rememberMe) {
    // Check if admin
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        const adminUser = {
            email: ADMIN_EMAIL,
            name: "Admin",
            isAdmin: true
        };
        
        if (rememberMe) {
            localStorage.setItem(REMEMBERED_USER_KEY, JSON.stringify(adminUser));
        }
        
        handleAuthSuccess(adminUser);
        return;
    }
    
    // Check regular users
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        if (rememberMe) {
            localStorage.setItem(REMEMBERED_USER_KEY, JSON.stringify(user));
        }
        
        handleAuthSuccess(user);
    } else {
        alert("Invalid email or password. Please try again.");
    }
}

function handleSignup(name, email, password, confirmPassword) {
    // Check if user already exists
    if (users.find(u => u.email === email)) {
        alert("An account with this email already exists. Please log in instead.");
        return;
    }
    
    // Check if passwords match
    if (password !== confirmPassword) {
        alert("Passwords do not match. Please try again.");
        return;
    }
    
    // Create new user
    const newUser = {
        email: email,
        password: password,
        name: name,
        isAdmin: false
    };
    
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    handleAuthSuccess(newUser);
}

function handleAuthSuccess(user) {
    currentUser = user;
    
    document.getElementById('user-name').textContent = `Welcome, ${user.name}!`;
    
    if (user.isAdmin) {
        document.getElementById('user-name').innerHTML += ' <span class="admin-badge">Admin</span>';
    }

    setTimeout(() => {
        document.getElementById('auth-screen').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
        initializeMainApp();
    }, 500);
}

function initializeMainApp() {
    document.getElementById('item-date').value = new Date().toISOString().split('T')[0];

    // Add image preview functionality
    const imageInput = document.getElementById('item-image');
    const imagePreview = document.getElementById('image-preview');
    const previewImg = document.getElementById('preview-img');
    
    imageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImg.src = e.target.result;
                imagePreview.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        } else {
            imagePreview.classList.add('hidden');
        }
    });

    renderItems();
    renderEcoswapItems();

    document.getElementById('search-input').addEventListener('input', filterItems);
    document.getElementById('category-filter').addEventListener('change', filterItems);
    document.getElementById('status-filter').addEventListener('change', filterItems);

    document.getElementById('item-form').addEventListener('submit', handleFormSubmit);

    setInterval(checkExpiredItems, 5000);
}

window.logout = function() {
    currentUser = null;
    localStorage.removeItem(REMEMBERED_USER_KEY);
    document.getElementById('main-app').classList.add('hidden');
    document.getElementById('auth-screen').classList.remove('hidden');
    switchAuth('login');
};

window.showSection = function(section) {
    const lostFoundSection = document.getElementById('lost-found-section');
    const ecoswapSection = document.getElementById('ecoswap-section');
    const navLost = document.getElementById('nav-lost');
    const navEco = document.getElementById('nav-eco');

    if (section === 'lost-found') {
        lostFoundSection.classList.remove('hidden');
        ecoswapSection.classList.add('hidden');
        navLost.classList.add('btn-gradient', 'text-white');
        navLost.classList.remove('text-gray-600', 'hover:text-purple-600');
        navEco.classList.remove('btn-gradient', 'text-white');
        navEco.classList.add('text-gray-600', 'hover:text-purple-600');
    } else {
        lostFoundSection.classList.add('hidden');
        ecoswapSection.classList.remove('hidden');
        navEco.classList.add('btn-gradient', 'text-white');
        navEco.classList.remove('text-gray-600', 'hover:text-purple-600');
        navLost.classList.remove('btn-gradient', 'text-white');
        navLost.classList.add('text-gray-600', 'hover:text-purple-600');
    }
};

window.showForm = function(type) {
    currentFormType = type;
    const modal = document.getElementById('item-modal');
    const title = document.getElementById('modal-title');

    title.textContent = type === 'lost' ? 'Report Lost Item' : 'Report Found Item';
    modal.classList.remove('hidden');

    document.getElementById('item-form').reset();
    document.getElementById('item-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('image-preview').classList.add('hidden');
};

window.closeModal = function() {
    document.getElementById('item-modal').classList.add('hidden');
};

window.closeContactModal = function() {
    document.getElementById('contact-modal').classList.add('hidden');
};

window.closeClaimVerificationModal = function() {
    document.getElementById('claim-verification-modal').classList.add('hidden');
    currentClaimItemId = null;
};

window.handleFormSubmit = function(e) {
    e.preventDefault();

    const imageInput = document.getElementById('item-image');
    let imageData = null;

    if (imageInput.files && imageInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imageData = e.target.result;
            saveItem(imageData);
        };
        reader.readAsDataURL(imageInput.files[0]);
    } else {
        saveItem(null);
    }
};

function saveItem(imageData) {
    const newItem = {
        id: Date.now(),
        name: document.getElementById('item-name').value,
        category: document.getElementById('item-category').value,
        location: document.getElementById('item-location').value,
        date: document.getElementById('item-date').value,
        status: currentFormType,
        contact: {
            name: document.getElementById('contact-name').value,
            email: document.getElementById('contact-email').value,
            phone: document.getElementById('contact-phone').value
        },
        details: document.getElementById('item-details').value,
        daysLeft: 30,
        datePosted: new Date().toISOString().split('T')[0],
        reportedBy: currentUser.email,
        image: imageData
    };

    items.unshift(newItem);
    localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
    renderItems();
    closeModal();

    alert(`${currentFormType === 'lost' ? 'Lost' : 'Found'} item reported successfully! It will be visible for 30 days.`);
}

window.renderItems = function() {
    const grid = document.getElementById('items-grid');
    const filteredItems = getFilteredItems();

    if (filteredItems.length === 0) {
        grid.innerHTML = '<div class="col-span-full text-center py-12 text-gray-500">No items found matching your criteria.</div>';
        return;
    }

    grid.innerHTML = filteredItems.map(item => `
        <div class="glass-card hover-lift rounded-xl shadow-lg overflow-hidden">
            <div class="p-6">
                ${item.image ? `
                    <div class="mb-4">
                        <img src="${item.image}" alt="${item.name}" class="item-image w-full h-48 object-cover rounded-lg" />
                    </div>
                ` : ''}
                
                <div class="flex justify-between items-start mb-3">
                    <h3 class="font-semibold text-lg text-gray-800">${item.name}</h3>
                    <span class="px-3 py-1 rounded-full text-xs font-medium ${
                        item.status === 'lost' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }">
                        ${item.status.toUpperCase()}
                    </span>
                </div>
                
                <div class="space-y-2 text-sm text-gray-600 mb-4">
                    <div class="flex items-center space-x-2">
                        <span>📍</span>
                        <span>${item.location}</span>
                    </div>
                    <div class="flex items-center space-x-2">
                        <span>📅</span>
                        <span>${new Date(item.date).toLocaleDateString()}</span>
                    </div>
                    <div class="flex items-center space-x-2">
                        <span>🏷️</span>
                        <span class="capitalize">${item.category}</span>
                    </div>
                </div>
                
                <p class="text-gray-700 text-sm mb-4">${item.details}</p>
                
                <div class="flex justify-between items-center">
                    <span class="text-xs text-gray-500 flex items-center space-x-1">
                        <span>⏰</span>
                        <span>${item.daysLeft} days left</span>
                    </span>
                    <button onclick="showContact(${item.id})" class="btn-gradient text-white px-4 py-2 rounded-lg text-sm font-medium transition-all hover-lift">
                        Contact ${item.status === 'lost' ? 'Owner' : 'Finder'}
                    </button>
                </div>
                
                ${currentUser && currentUser.isAdmin ? `
                    <div class="mt-4 pt-4 border-t border-gray-200">
                        <button onclick="deleteItem(${item.id})" class="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all">
                            Delete Item
                        </button>
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
};

window.renderEcoswapItems = function() {
    const grid = document.getElementById('ecoswap-grid');
    const availableItems = ecoswapItems.filter(item => item.available);

    if (availableItems.length === 0) {
        grid.innerHTML = '<div class="col-span-full text-center py-12 text-gray-500">No items available for donation yet.</div>';
        return;
    }

    grid.innerHTML = availableItems.map(item => {
        const existingVerification = claimVerifications.find(v => v.itemId === item.id && v.claimerEmail === currentUser.email);
        
        return `
        <div class="glass-card hover-lift rounded-xl shadow-lg overflow-hidden">
            <div class="p-6">
                ${item.image ? `
                    <div class="mb-4">
                        <img src="${item.image}" alt="${item.name}" class="item-image w-full h-48 object-cover rounded-lg" />
                    </div>
                ` : ''}
                
                <div class="flex justify-between items-start mb-3">
                    <h3 class="font-semibold text-lg text-gray-800">${item.name}</h3>
                    <span class="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        AVAILABLE
                    </span>
                </div>
                
                <div class="space-y-2 text-sm text-gray-600 mb-4">
                    <div class="flex items-center space-x-2">
                        <span>📍</span>
                        <span>Originally found at: ${item.originalLocation}</span>
                    </div>
                    <div class="flex items-center space-x-2">
                        <span>🏷️</span>
                        <span class="capitalize">${item.category}</span>
                    </div>
                    <div class="flex items-center space-x-2">
                        <span>♻️</span>
                        <span>Moved to Ecoswap: ${new Date(item.dateMovedToEcoswap).toLocaleDateString()}</span>
                    </div>
                </div>
                
                <p class="text-gray-700 text-sm mb-4">${item.details}</p>
                
                ${existingVerification ? `
                    <div class="mb-4">
                        <div class="text-center">
                            <span class="${getVerificationStatusClass(existingVerification.status)}">
                                ${existingVerification.status.toUpperCase()}
                            </span>
                            <p class="text-sm text-gray-600 mt-2">
                                ${existingVerification.status === 'pending' ? 
                                    'Your claim is under review by admin' : 
                                    existingVerification.status === 'approved' ?
                                    'Your claim has been approved!' :
                                    'Your claim was rejected. Please provide better proof.'}
                            </p>
                            ${existingVerification.adminNote ? `
                                <p class="text-sm text-gray-600 mt-1"><strong>Admin Note:</strong> ${existingVerification.adminNote}</p>
                            ` : ''}
                        </div>
                    </div>
                ` : ''}
                
                <button onclick="showClaimVerification(${item.id})" class="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-3 rounded-lg font-medium transition-all hover-lift">
                    ${existingVerification ? 'Update Claim' : '🤝 Claim This Item'}
                </button>
                
                ${currentUser && currentUser.isAdmin ? `
                    <div class="mt-4 pt-4 border-t border-gray-200">
                        <div class="space-y-2">
                            <button onclick="deleteEcoswapItem(${item.id})" class="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all">
                                Delete Item
                            </button>
                            <button onclick="showPendingClaims(${item.id})" class="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all">
                                View Claims (${getPendingClaimsCount(item.id)})
                            </button>
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
    `}).join('');
};

function getVerificationStatusClass(status) {
    switch(status) {
        case 'pending': return 'verification-pending';
        case 'approved': return 'verification-approved';
        case 'rejected': return 'verification-rejected';
        default: return 'verification-pending';
    }
}

function getPendingClaimsCount(itemId) {
    return claimVerifications.filter(v => v.itemId === itemId && v.status === 'pending').length;
}

window.showClaimVerification = function(itemId) {
    currentClaimItemId = itemId;
    const modal = document.getElementById('claim-verification-modal');
    const content = document.getElementById('claim-verification-content');
    
    const existingVerification = claimVerifications.find(v => v.itemId === itemId && v.claimerEmail === currentUser.email);
    
    content.innerHTML = `
        <div class="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
            <h4 class="font-medium text-gray-800 mb-2">Claim Verification Required</h4>
            <p class="text-sm text-gray-600 mb-4">
                To claim this item, please provide proof that you've checked the Lost & Found section 
                and confirmed this item hasn't been claimed by its original owner.
            </p>
        </div>
        
        <form id="claim-verification-form">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                <input type="text" id="claimer-name" value="${currentUser.name}" required class="form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
            </div>
            
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Your Email</label>
                <input type="email" id="claimer-email" value="${currentUser.email}" required class="form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
            </div>
            
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Proof of Verification</label>
                <p class="text-sm text-gray-600 mb-2">Upload a screenshot or photo showing:</p>
                <ul class="text-sm text-gray-600 list-disc list-inside mb-4">
                    <li>The item in Lost & Found section</li>
                    <li>Proof that no one has claimed it</li>
                    <li>Any communication with the item reporter</li>
                </ul>
                <input type="file" id="verification-proof" accept="image/*" class="form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
                <div id="proof-preview" class="mt-2 ${existingVerification && existingVerification.proofImage ? '' : 'hidden'}">
                    <img src="${existingVerification ? existingVerification.proofImage : ''}" alt="Proof" class="proof-image max-w-full h-32 object-cover rounded-lg border" />
                </div>
            </div>
            
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                <textarea id="verification-notes" rows="3" class="form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">${existingVerification ? existingVerification.notes : ''}</textarea>
            </div>
            
            <div class="flex gap-3 pt-4">
                <button type="button" onclick="closeClaimVerificationModal()" class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    Cancel
                </button>
                <button type="submit" class="flex-1 px-4 py-2 btn-gradient text-white rounded-lg">
                    ${existingVerification ? 'Update Claim' : 'Submit for Verification'}
                </button>
            </div>
        </form>
    `;

    // Add proof image preview
    const proofInput = document.getElementById('verification-proof');
    const proofPreview = document.getElementById('proof-preview');
    const proofImg = proofPreview.querySelector('img');
    
    proofInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                proofImg.src = e.target.result;
                proofPreview.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }
    });

    // Handle form submission
    document.getElementById('claim-verification-form').addEventListener('submit', function(e) {
        e.preventDefault();
        submitClaimVerification();
    });

    modal.classList.remove('hidden');
};

function submitClaimVerification() {
    const proofInput = document.getElementById('verification-proof');
    let proofImage = null;

    if (proofInput.files && proofInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            proofImage = e.target.result;
            saveClaimVerification(proofImage);
        };
        reader.readAsDataURL(proofInput.files[0]);
    } else {
        const existingVerification = claimVerifications.find(v => v.itemId === currentClaimItemId && v.claimerEmail === currentUser.email);
        proofImage = existingVerification ? existingVerification.proofImage : null;
        saveClaimVerification(proofImage);
    }
}

function saveClaimVerification(proofImage) {
    const claimerName = document.getElementById('claimer-name').value;
    const claimerEmail = document.getElementById('claimer-email').value;
    const notes = document.getElementById('verification-notes').value;

    const existingIndex = claimVerifications.findIndex(v => v.itemId === currentClaimItemId && v.claimerEmail === currentUser.email);

    const verificationData = {
        id: existingIndex !== -1 ? claimVerifications[existingIndex].id : Date.now(),
        itemId: currentClaimItemId,
        claimerName: claimerName,
        claimerEmail: claimerEmail,
        proofImage: proofImage,
        notes: notes,
        status: 'pending',
        submittedAt: new Date().toISOString(),
        adminNote: ''
    };

    if (existingIndex !== -1) {
        claimVerifications[existingIndex] = verificationData;
    } else {
        claimVerifications.push(verificationData);
    }

    localStorage.setItem(CLAIM_VERIFICATIONS_KEY, JSON.stringify(claimVerifications));
    closeClaimVerificationModal();
    renderEcoswapItems();
    
    alert('Claim verification submitted successfully! An admin will review your request.');
}

window.showPendingClaims = function(itemId) {
    const modal = document.getElementById('claim-verification-modal');
    const content = document.getElementById('claim-verification-content');
    
    const pendingClaims = claimVerifications.filter(v => v.itemId === itemId);
    
    content.innerHTML = `
        <div class="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
            <h4 class="font-medium text-gray-800 mb-2">Pending Claims for Item</h4>
            <p class="text-sm text-gray-600">Review and approve/reject claim requests.</p>
        </div>
        
        ${pendingClaims.length === 0 ? `
            <div class="text-center py-8 text-gray-500">
                No pending claims for this item.
            </div>
        ` : `
            <div class="space-y-4 max-h-96 overflow-y-auto">
                ${pendingClaims.map(claim => `
                    <div class="border border-gray-200 rounded-lg p-4">
                        <div class="flex justify-between items-start mb-3">
                            <div>
                                <h5 class="font-medium text-gray-800">${claim.claimerName}</h5>
                                <p class="text-sm text-gray-600">${claim.claimerEmail}</p>
                            </div>
                            <span class="${getVerificationStatusClass(claim.status)}">
                                ${claim.status.toUpperCase()}
                            </span>
                        </div>
                        
                        ${claim.proofImage ? `
                            <div class="mb-3">
                                <p class="text-sm font-medium text-gray-700 mb-2">Proof Provided:</p>
                                <img src="${claim.proofImage}" alt="Proof" class="proof-image max-w-full h-32 object-cover rounded-lg border" />
                            </div>
                        ` : ''}
                        
                        ${claim.notes ? `
                            <div class="mb-3">
                                <p class="text-sm font-medium text-gray-700 mb-1">Claimer Notes:</p>
                                <p class="text-sm text-gray-600">${claim.notes}</p>
                            </div>
                        ` : ''}
                        
                        ${claim.status === 'pending' ? `
                            <div class="flex gap-2 mt-4">
                                <button onclick="approveClaim(${claim.id})" class="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all">
                                    Approve
                                </button>
                                <button onclick="rejectClaim(${claim.id})" class="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all">
                                    Reject
                                </button>
                            </div>
                        ` : ''}
                        
                        ${claim.adminNote ? `
                            <div class="mt-3 p-2 bg-gray-100 rounded">
                                <p class="text-sm font-medium text-gray-700">Admin Note:</p>
                                <p class="text-sm text-gray-600">${claim.adminNote}</p>
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        `}
        
        <div class="flex gap-3 pt-4">
            <button onclick="closeClaimVerificationModal()" class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Close
            </button>
        </div>
    `;

    modal.classList.remove('hidden');
};

window.approveClaim = function(claimId) {
    const claim = claimVerifications.find(v => v.id === claimId);
    if (!claim) return;
    
    const adminNote = prompt("Enter approval note (optional):");
    
    claim.status = 'approved';
    claim.adminNote = adminNote || '';
    claim.processedAt = new Date().toISOString();
    
    // Mark the item as claimed
    const item = ecoswapItems.find(i => i.id === claim.itemId);
    if (item) {
        item.available = false;
        item.claimedBy = claim.claimerName;
        item.claimedDate = new Date().toISOString().split('T')[0];
    }
    
    localStorage.setItem(CLAIM_VERIFICATIONS_KEY, JSON.stringify(claimVerifications));
    localStorage.setItem(ECOSWAP_KEY, JSON.stringify(ecoswapItems));
    
    renderEcoswapItems();
    closeClaimVerificationModal();
    
    alert('Claim approved successfully!');
};

window.rejectClaim = function(claimId) {
    const claim = claimVerifications.find(v => v.id === claimId);
    if (!claim) return;
    
    const adminNote = prompt("Enter rejection reason (required):");
    if (!adminNote) {
        alert('Please provide a rejection reason.');
        return;
    }
    
    claim.status = 'rejected';
    claim.adminNote = adminNote;
    claim.processedAt = new Date().toISOString();
    
    localStorage.setItem(CLAIM_VERIFICATIONS_KEY, JSON.stringify(claimVerifications));
    
    renderEcoswapItems();
    closeClaimVerificationModal();
    
    alert('Claim rejected successfully!');
};

window.getFilteredItems = function() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const categoryFilter = document.getElementById('category-filter').value;
    const statusFilter = document.getElementById('status-filter').value;

    return items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm) || 
                            item.details.toLowerCase().includes(searchTerm) ||
                            item.location.toLowerCase().includes(searchTerm);
        const matchesCategory = !categoryFilter || item.category === categoryFilter;
        const matchesStatus = !statusFilter || item.status === statusFilter;
        
        return matchesSearch && matchesCategory && matchesStatus;
    });
};

window.filterItems = function() {
    renderItems();
};

window.showContact = function(itemId) {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const modal = document.getElementById('contact-modal');
    const contactInfo = document.getElementById('contact-info');

    contactInfo.innerHTML = `
        ${item.image ? `
            <div class="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                <h4 class="font-medium text-gray-800 mb-2">Item Image:</h4>
                <img src="${item.image}" alt="${item.name}" class="w-full h-48 object-cover rounded-lg border" />
            </div>
        ` : ''}
        
        <div class="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
            <h4 class="font-medium text-gray-800 mb-2">Contact Details:</h4>
            <div class="space-y-2 text-sm">
                <div><strong>Name:</strong> ${item.contact.name}</div>
                <div><strong>Email:</strong> <a href="mailto:${item.contact.email}" class="text-blue-500 hover:underline">${item.contact.email}</a></div>
                ${item.contact.phone ? `<div><strong>Phone:</strong> <a href="tel:${item.contact.phone}" class="text-blue-500 hover:underline">${item.contact.phone}</a></div>` : ''}
            </div>
        </div>
        <div class="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
            <h4 class="font-medium text-gray-800 mb-2">Item Details:</h4>
            <div class="text-sm text-gray-700">
                <div><strong>Item:</strong> ${item.name}</div>
                <div><strong>Location:</strong> ${item.location}</div>
                <div><strong>Date:</strong> ${new Date(item.date).toLocaleDateString()}</div>
                ${item.details ? `<div><strong>Details:</strong> ${item.details}</div>` : ''}
            </div>
        </div>
    `;

    modal.classList.remove('hidden');
};

window.checkExpiredItems = function() {
    const today = new Date();
    const expiredItems = [];

    items.forEach(item => {
        const postedDate = new Date(item.datePosted);
        const daysDiff = Math.floor((today - postedDate) / (1000 * 60 * 60 * 24));
        item.daysLeft = Math.max(0, 30 - daysDiff);
        
        if (item.daysLeft === 0) {
            expiredItems.push(item);
        }
    });

    expiredItems.forEach(item => {
        const ecoswapItem = {
            id: Date.now() + Math.random(),
            name: item.name,
            category: item.category,
            originalLocation: item.location,
            dateMovedToEcoswap: new Date().toISOString().split('T')[0],
            details: item.details,
            available: true,
            image: item.image
        };
        
        ecoswapItems.push(ecoswapItem);
        items = items.filter(i => i.id !== item.id);
    });

    if (expiredItems.length > 0) {
        localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
        localStorage.setItem(ECOSWAP_KEY, JSON.stringify(ecoswapItems));
        renderItems();
        renderEcoswapItems();
    }
};

// Admin functions
window.deleteItem = function(itemId) {
    if (!currentUser || !currentUser.isAdmin) {
        alert("You don't have permission to delete items.");
        return;
    }
    
    if (confirm("Are you sure you want to delete this item?")) {
        items = items.filter(item => item.id !== itemId);
        localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
        renderItems();
    }
};

window.deleteEcoswapItem = function(itemId) {
    if (!currentUser || !currentUser.isAdmin) {
        alert("You don't have permission to delete items.");
        return;
    }
    
    if (confirm("Are you sure you want to delete this ecoswap item?")) {
        ecoswapItems = ecoswapItems.filter(item => item.id !== itemId);
        localStorage.setItem(ECOSWAP_KEY, JSON.stringify(ecoswapItems));
        renderEcoswapItems();
    }
};

// Initialize with sample data if empty
if (items.length === 0) {
    items = [
        {
            id: 1,
            name: "iPhone 13 Pro",
            category: "electronics",
            location: "Central Park",
            date: "2024-01-15",
            status: "lost",
            contact: { name: "Sarah Johnson", email: "sarah@email.com", phone: "+1-555-0123" },
            details: "Black iPhone 13 Pro with cracked screen protector",
            daysLeft: 25,
            datePosted: "2024-01-15",
            reportedBy: "sarah@email.com",
            image: null
        },
        {
            id: 2,
            name: "Blue Backpack",
            category: "accessories",
            location: "University Library",
            date: "2024-01-18",
            status: "found",
            contact: { name: "Mike Chen", email: "mike@email.com", phone: "+1-555-0456" },
            details: "Blue Jansport backpack with laptop inside",
            daysLeft: 22,
            datePosted: "2024-01-18",
            reportedBy: "mike@email.com",
            image: null
        },
        {
            id: 3,
            name: "Gold Wedding Ring",
            category: "accessories",
            location: "Downtown Gym",
            date: "2024-01-10",
            status: "lost",
            contact: { name: "Emma Davis", email: "emma@email.com", phone: "+1-555-0789" },
            details: "Gold wedding band with engraving 'Forever & Always'",
            daysLeft: 30,
            datePosted: "2024-01-10",
            reportedBy: "emma@email.com",
            image: null
        }
    ];
    localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
}

if (ecoswapItems.length === 0) {
    ecoswapItems = [
        {
            id: 101,
            name: "Vintage Leather Jacket",
            category: "clothing",
            originalLocation: "Coffee Shop",
            dateMovedToEcoswap: "2023-12-15",
            details: "Brown leather jacket, size M, good condition",
            available: true,
            image: null
        },
        {
            id: 102,
            name: "Wireless Headphones",
            category: "electronics",
            originalLocation: "Bus Station",
            dateMovedToEcoswap: "2023-12-20",
            details: "Sony wireless headphones, working condition",
            available: true,
            image: null
        }
    ];
    localStorage.setItem(ECOSWAP_KEY, JSON.stringify(ecoswapItems));
}