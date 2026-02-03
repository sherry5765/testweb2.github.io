// E-Commerce Website JavaScript
// Professional implementation with localStorage persistence

// DOM Elements
const pages = document.querySelectorAll('.page');
const cartCountElement = document.getElementById('cart-count');
const productsContainer = document.getElementById('products-container');
const featuredProductsContainer = document.getElementById('featured-products');
const productDetailContainer = document.getElementById('product-detail');
const cartItemsContainer = document.getElementById('cart-items');
const cartSubtotalElement = document.getElementById('cart-subtotal');
const cartShippingElement = document.getElementById('cart-shipping');
const cartTotalElement = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const checkoutForm = document.getElementById('checkout-form');
const adminLoginForm = document.getElementById('admin-login-form');
const addProductForm = document.getElementById('add-product-form');
const adminProductsList = document.getElementById('admin-products-list');
const editProductModal = document.getElementById('edit-product-modal');
const editProductForm = document.getElementById('edit-product-form');
const closeModal = document.querySelector('.close-modal');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const messageContainer = document.getElementById('message-container');
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const sortFilter = document.getElementById('sort-filter');

// Data Storage Keys
const PRODUCTS_KEY = 'proshop_products';
const CART_KEY = 'proshop_cart';
const ADMIN_KEY = 'proshop_admin_logged_in';

// Initialize Data
let products = JSON.parse(localStorage.getItem(PRODUCTS_KEY)) || [];
let cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
let currentProductId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
let currentCartId = cart.length > 0 ? Math.max(...cart.map(item => item.cartId)) + 1 : 1;

// Initialize the application
function init() {
    // Initialize sample products if none exist
    if (products.length === 0) {
        initializeSampleProducts();
    }
    
    // Set up event listeners
    setupEventListeners();
    
    // Render initial state
    renderFeaturedProducts();
    renderProducts();
    renderCart();
    updateCartCount();
    populateCategoryFilter();
    
    // Check if admin is logged in
    checkAdminLogin();
    
    // Show home page by default
    showPage('home');
}

// Initialize sample products
function initializeSampleProducts() {
    const sampleProducts = [
        {
            id: 1,
            name: "Wireless Bluetooth Headphones",
            category: "Electronics",
            price: 59.99,
            stock: 15,
            description: "High-quality wireless headphones with noise cancellation and 30-hour battery life.",
            image: "https://via.placeholder.com/300x300?text=Headphones",
            listed: true
        },
        {
            id: 2,
            name: "Smart Watch",
            category: "Wearables",
            price: 199.99,
            stock: 8,
            description: "Track your fitness, receive notifications, and stay connected with this advanced smartwatch.",
            image: "https://via.placeholder.com/300x300?text=Smart+Watch",
            listed: true
        },
        {
            id: 3,
            name: "Leather Wallet",
            category: "Accessories",
            price: 39.99,
            stock: 20,
            description: "Handcrafted genuine leather wallet with multiple card slots and RFID protection.",
            image: "https://via.placeholder.com/300x300?text=Wallet",
            listed: true
        },
        {
            id: 4,
            name: "Yoga Mat",
            category: "Fitness",
            price: 29.99,
            stock: 25,
            description: "Non-slip, eco-friendly yoga mat perfect for all types of yoga and exercise.",
            image: "https://via.placeholder.com/300x300?text=Yoga+Mat",
            listed: true
        },
        {
            id: 5,
            name: "Coffee Maker",
            category: "Home",
            price: 89.99,
            stock: 12,
            description: "Programmable coffee maker with thermal carafe and auto-brew feature.",
            image: "https://via.placeholder.com/300x300?text=Coffee+Maker",
            listed: true
        },
        {
            id: 6,
            name: "Desk Lamp",
            category: "Home",
            price: 34.99,
            stock: 18,
            description: "Adjustable LED desk lamp with touch control and multiple brightness levels.",
            image: "https://via.placeholder.com/300x300?text=Desk+Lamp",
            listed: true
        }
    ];
    
    products = sampleProducts;
    currentProductId = sampleProducts.length + 1;
    saveProducts();
}

// Set up event listeners
function setupEventListeners() {
    // Navigation hamburger
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
    
    // Search and filter
    searchInput.addEventListener('input', renderProducts);
    categoryFilter.addEventListener('change', renderProducts);
    sortFilter.addEventListener('change', renderProducts);
    
    // Cart and checkout
    checkoutBtn.addEventListener('click', () => {
        if (cart.length > 0) {
            showPage('checkout');
        }
    });
    
    checkoutForm.addEventListener('submit', handleCheckout);
    
    // Admin authentication
    adminLoginForm.addEventListener('submit', handleAdminLogin);
    document.getElementById('logout-btn').addEventListener('click', handleAdminLogout);
    
    // Product management
    addProductForm.addEventListener('submit', handleAddProduct);
    editProductForm.addEventListener('submit', handleEditProduct);
    closeModal.addEventListener('click', closeEditModal);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === editProductModal) {
            closeEditModal();
        }
    });
    
    // Navigation menu active state on mobile
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                navMenu.classList.remove('active');
            }
        });
    });
}

// Page navigation
function showPage(pageName) {
    // Hide all pages
    pages.forEach(page => page.classList.remove('active'));
    
    // Show the requested page
    const page = document.getElementById(`${pageName}-page`);
    if (page) {
        page.classList.add('active');
        
        // Special handling for certain pages
        if (pageName === 'shop') {
            renderProducts();
        } else if (pageName === 'cart') {
            renderCart();
        } else if (pageName === 'admin') {
            if (localStorage.getItem(ADMIN_KEY) === 'true') {
                renderAdminProducts();
            }
        }
    }
}

// Product management
function renderProducts() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;
    const sortOption = sortFilter.value;
    
    // Filter products
    let filteredProducts = products.filter(product => 
        product.listed && 
        product.name.toLowerCase().includes(searchTerm) &&
        (selectedCategory === '' || product.category === selectedCategory)
    );
    
    // Sort products
    switch (sortOption) {
        case 'price-low':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'name':
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        default: // featured
            filteredProducts = filteredProducts; // No sorting
    }
    
    // Render products
    productsContainer.innerHTML = '';
    
    if (filteredProducts.length === 0) {
        productsContainer.innerHTML = '<p class="no-products">No products found. Try adjusting your search or filters.</p>';
        return;
    }
    
    filteredProducts.forEach(product => {
        const productCard = createProductCard(product);
        productsContainer.appendChild(productCard);
    });
}

function createProductCard(product) {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    
    productCard.innerHTML = `
        <div class="product-image">
            <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="product-info">
            <h3 class="product-title">${product.name}</h3>
            <p class="product-category">${product.category}</p>
            <p class="product-description">${truncateText(product.description, 100)}</p>
            <div class="product-footer">
                <span class="product-price">$${product.price.toFixed(2)}</span>
                <span class="product-stock ${getStockClass(product.stock)}">
                    ${getStockStatus(product.stock)}
                </span>
            </div>
            <button class="btn-primary add-to-cart-btn" data-id="${product.id}" ${product.stock === 0 ? 'disabled' : ''}>
                ${product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
        </div>
    `;
    
    // Add event listener for product detail view
    productCard.querySelector('.product-title').addEventListener('click', () => {
        showProductDetail(product.id);
    });
    
    productCard.querySelector('.product-image').addEventListener('click', () => {
        showProductDetail(product.id);
    });
    
    // Add event listener for add to cart
    const addToCartBtn = productCard.querySelector('.add-to-cart-btn');
    addToCartBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        addToCart(product.id);
    });
    
    return productCard;
}

function getStockClass(stock) {
    if (stock === 0) return 'out-of-stock';
    if (stock < 5) return 'low-stock';
    return '';
}

function getStockStatus(stock) {
    if (stock === 0) return 'Out of Stock';
    if (stock < 5) return `Only ${stock} left!`;
    return `In Stock (${stock})`;
}

function truncateText(text, maxLength) {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

// Featured products (home page)
function renderFeaturedProducts() {
    const featuredProducts = products
        .filter(product => product.listed)
        .slice(0, 4); // Show first 4 products as featured
    
    featuredProductsContainer.innerHTML = '';
    
    featuredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-category">${product.category}</p>
                <p class="product-description">${truncateText(product.description, 80)}</p>
                <div class="product-footer">
                    <span class="product-price">$${product.price.toFixed(2)}</span>
                    <span class="product-stock">Featured</span>
                </div>
                <button class="btn-primary add-to-cart-btn" data-id="${product.id}" ${product.stock === 0 ? 'disabled' : ''}>
                    ${product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
            </div>
        `;
        
        // Add event listeners
        productCard.querySelector('.product-title').addEventListener('click', () => {
            showProductDetail(product.id);
        });
        
        productCard.querySelector('.product-image').addEventListener('click', () => {
            showProductDetail(product.id);
        });
        
        productCard.querySelector('.add-to-cart-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            addToCart(product.id);
        });
        
        featuredProductsContainer.appendChild(productCard);
    });
}

// Product detail page
function showProductDetail(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    productDetailContainer.innerHTML = `
        <div class="product-detail-content">
            <div class="product-detail-image">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-detail-info">
                <h2 class="product-detail-title">${product.name}</h2>
                <p class="product-detail-category">${product.category}</p>
                <div class="product-detail-price">$${product.price.toFixed(2)}</div>
                <div class="product-detail-stock ${getStockClass(product.stock)}">
                    ${getStockStatus(product.stock)}
                </div>
                <p class="product-detail-description">${product.description}</p>
                <div class="product-detail-actions">
                    <div class="quantity-selector">
                        <button class="quantity-btn" id="decrease-qty">-</button>
                        <input type="number" class="quantity-input" id="quantity-input" value="1" min="1" max="${product.stock}" ${product.stock === 0 ? 'disabled' : ''}>
                        <button class="quantity-btn" id="increase-qty">+</button>
                    </div>
                    <button id="add-to-cart-detail" class="btn-primary" ${product.stock === 0 ? 'disabled' : ''}>
                        ${product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                    <button id="back-to-shop" class="btn-secondary">Back to Shop</button>
                </div>
            </div>
        </div>
    `;
    
    // Set up quantity selector
    const quantityInput = document.getElementById('quantity-input');
    const decreaseBtn = document.getElementById('decrease-qty');
    const increaseBtn = document.getElementById('increase-qty');
    const addToCartBtn = document.getElementById('add-to-cart-detail');
    const backBtn = document.getElementById('back-to-shop');
    
    decreaseBtn.addEventListener('click', () => {
        let value = parseInt(quantityInput.value);
        if (value > 1) {
            quantityInput.value = value - 1;
        }
    });
    
    increaseBtn.addEventListener('click', () => {
        let value = parseInt(quantityInput.value);
        if (value < product.stock) {
            quantityInput.value = value + 1;
        }
    });
    
    quantityInput.addEventListener('change', () => {
        let value = parseInt(quantityInput.value);
        if (value < 1) quantityInput.value = 1;
        if (value > product.stock) quantityInput.value = product.stock;
    });
    
    // Add to cart from detail page
    addToCartBtn.addEventListener('click', () => {
        const quantity = parseInt(quantityInput.value);
        addToCart(product.id, quantity);
        showMessage('Product added to cart!', 'success');
    });
    
    // Back to shop
    backBtn.addEventListener('click', () => {
        showPage('shop');
    });
    
    showPage('product-detail');
}

// Cart management
function addToCart(productId, quantity = 1) {
    const product = products.find(p => p.id === productId);
    if (!product || product.stock === 0) return;
    
    // Check if product already in cart
    const existingCartItem = cart.find(item => item.productId === productId);
    
    if (existingCartItem) {
        // Update quantity if possible
        if (existingCartItem.quantity + quantity <= product.stock) {
            existingCartItem.quantity += quantity;
            showMessage(`Cart updated!`, 'success');
        } else {
            showMessage(`Cannot add more than ${product.stock} items to cart.`, 'error');
            return;
        }
    } else {
        // Add new item to cart
        cart.push({
            cartId: currentCartId++,
            productId: productId,
            quantity: quantity
        });
        showMessage('Product added to cart!', 'success');
    }
    
    saveCart();
    renderCart();
    updateCartCount();
}

function removeFromCart(cartItemId) {
    cart = cart.filter(item => item.cartId !== cartItemId);
    saveCart();
    renderCart();
    updateCartCount();
    showMessage('Item removed from cart.', 'info');
}

function updateCartItemQuantity(cartItemId, newQuantity) {
    const cartItem = cart.find(item => item.cartId === cartItemId);
    if (!cartItem) return;
    
    const product = products.find(p => p.id === cartItem.productId);
    if (!product) return;
    
    if (newQuantity <= 0) {
        removeFromCart(cartItemId);
        return;
    }
    
    if (newQuantity > product.stock) {
        showMessage(`Cannot add more than ${product.stock} items to cart.`, 'error');
        return;
    }
    
    cartItem.quantity = newQuantity;
    saveCart();
    renderCart();
    updateCartCount();
}

function renderCart() {
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty. <a href="#" onclick="showPage(\'shop\')">Continue Shopping</a></p>';
        document.getElementById('cart-summary').classList.add('hidden');
        return;
    }
    
    cartItemsContainer.innerHTML = '';
    
    // Calculate totals
    let subtotal = 0;
    
    cart.forEach(cartItem => {
        const product = products.find(p => p.id === cartItem.productId);
        if (!product) return;
        
        const itemTotal = product.price * cartItem.quantity;
        subtotal += itemTotal;
        
        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item';
        
        cartItemElement.innerHTML = `
            <div class="cart-item-image">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="cart-item-details">
                <h3 class="cart-item-title">${product.name}</h3>
                <p class="cart-item-category">${product.category}</p>
                <p class="cart-item-price">$${product.price.toFixed(2)}</p>
                <div class="cart-item-quantity">
                    <button class="btn-secondary" data-action="decrease" data-id="${cartItem.cartId}">-</button>
                    <span>${cartItem.quantity}</span>
                    <button class="btn-secondary" data-action="increase" data-id="${cartItem.cartId}">+</button>
                </div>
            </div>
            <div class="cart-item-actions">
                <span class="cart-item-total">$${itemTotal.toFixed(2)}</span>
                <button class="btn-danger" data-action="remove" data-id="${cartItem.cartId}">Remove</button>
            </div>
        `;
        
        cartItemsContainer.appendChild(cartItemElement);
    });
    
    // Set up event listeners for cart actions
    document.querySelectorAll('.cart-item-quantity button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const action = e.currentTarget.dataset.action;
            const cartItemId = parseInt(e.currentTarget.dataset.id);
            const cartItem = cart.find(item => item.cartId === cartItemId);
            
            if (!cartItem) return;
            
            if (action === 'decrease') {
                updateCartItemQuantity(cartItemId, cartItem.quantity - 1);
            } else if (action === 'increase') {
                updateCartItemQuantity(cartItemId, cartItem.quantity + 1);
            }
        });
    });
    
    document.querySelectorAll('[data-action="remove"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const cartItemId = parseInt(e.currentTarget.dataset.id);
            removeFromCart(cartItemId);
        });
    });
    
    // Calculate shipping and total
    const shipping = subtotal > 100 ? 0 : 9.99;
    const total = subtotal + shipping;
    
    // Update summary
    cartSubtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    cartShippingElement.textContent = shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`;
    cartTotalElement.textContent = `$${total.toFixed(2)}`;
    
    document.getElementById('cart-summary').classList.remove('hidden');
    
    // Disable checkout if cart is empty
    checkoutBtn.disabled = cart.length === 0;
}

function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountElement.textContent = totalItems;
}

// Checkout process
function handleCheckout(e) {
    e.preventDefault();
    
    // Validate form
    const formData = new FormData(checkoutForm);
    const formValues = Object.fromEntries(formData.entries());
    
    // Simple validation
    if (!formValues.fullname || !formValues.email || !formValues.address || 
        !formValues.city || !formValues.zip || !formValues['card-name'] || 
        !formValues['card-number'] || !formValues.expiry || !formValues.cvv) {
        showMessage('Please fill in all required fields.', 'error');
        return;
    }
    
    // In a real application, you would process payment here
    // For this demo, we'll just simulate a successful payment
    
    // Update product stock
    cart.forEach(cartItem => {
        const product = products.find(p => p.id === cartItem.productId);
        if (product) {
            product.stock -= cartItem.quantity;
            if (product.stock < 0) product.stock = 0;
        }
    });
    
    // Clear cart
    cart = [];
    saveCart();
    saveProducts();
    
    // Show success message
    showMessage('Order placed successfully! Thank you for your purchase.', 'success');
    
    // Reset form
    checkoutForm.reset();
    
    // Go back to home page
    setTimeout(() => {
        showPage('home');
        renderProducts();
        renderFeaturedProducts();
        updateCartCount();
    }, 2000);
}

// Admin authentication
function handleAdminLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;
    
    // Simple hardcoded credentials (in production, use proper authentication)
    if (username === 'admin' && password === 'proshop123') {
        localStorage.setItem(ADMIN_KEY, 'true');
        checkAdminLogin();
        showPage('admin');
        showMessage('Logged in successfully!', 'success');
    } else {
        showMessage('Invalid username or password.', 'error');
    }
    
    adminLoginForm.reset();
}

function handleAdminLogout() {
    localStorage.removeItem(ADMIN_KEY);
    checkAdminLogin();
    showPage('home');
    showMessage('Logged out successfully.', 'info');
}

function checkAdminLogin() {
    const isLoggedIn = localStorage.getItem(ADMIN_KEY) === 'true';
    document.getElementById('admin-login-page').classList.toggle('hidden', isLoggedIn);
    document.getElementById('admin-page').classList.toggle('hidden', !isLoggedIn);
}

// Product management (Admin)
function handleAddProduct(e) {
    e.preventDefault();
    
    const name = document.getElementById('product-name').value;
    const price = parseFloat(document.getElementById('product-price').value);
    const category = document.getElementById('product-category').value;
    const stock = parseInt(document.getElementById('product-stock').value);
    const description = document.getElementById('product-description').value;
    const imageInput = document.getElementById('product-image');
    
    // Validate inputs
    if (!name || !price || !category || !stock || !description || !imageInput.files[0]) {
        showMessage('Please fill in all fields.', 'error');
        return;
    }
    
    // Create image URL (in real app, you'd upload to a server)
    const imageFile = imageInput.files[0];
    const imageUrl = URL.createObjectURL(imageFile);
    
    // Create new product
    const newProduct = {
        id: currentProductId++,
        name,
        category,
        price,
        stock,
        description,
        image: imageUrl,
        listed: true
    };
    
    products.push(newProduct);
    saveProducts();
    
    // Reset form
    addProductForm.reset();
    
    // Update UI
    renderProducts();
    renderFeaturedProducts();
    renderAdminProducts();
    populateCategoryFilter();
    
    showMessage('Product added successfully!', 'success');
}

function renderAdminProducts() {
    if (!localStorage.getItem(ADMIN_KEY)) return;
    
    adminProductsList.innerHTML = '';
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'admin-product-card';
        
        productCard.innerHTML = `
            <div class="admin-product-image">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="admin-product-info">
                <h4 class="admin-product-title">${product.name}</h4>
                <p class="admin-product-price">$${product.price.toFixed(2)}</p>
                <p class="admin-product-category">${product.category}</p>
                <p class="admin-product-stock">Stock: ${product.stock}</p>
                <p class="admin-product-status">Status: ${product.listed ? 'Listed' : 'Unlisted'}</p>
            </div>
            <div class="admin-product-actions">
                <button class="btn-secondary" data-action="edit" data-id="${product.id}">Edit</button>
                <button class="btn-success" data-action="toggle" data-id="${product.id}">
                    ${product.listed ? 'Unlist' : 'List'}
                </button>
                <button class="btn-danger" data-action="delete" data-id="${product.id}">Delete</button>
            </div>
        `;
        
        adminProductsList.appendChild(productCard);
    });
    
    // Set up event listeners
    document.querySelectorAll('[data-action="edit"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = parseInt(e.currentTarget.dataset.id);
            openEditModal(productId);
        });
    });
    
    document.querySelectorAll('[data-action="toggle"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = parseInt(e.currentTarget.dataset.id);
            toggleProductListing(productId);
        });
    });
    
    document.querySelectorAll('[data-action="delete"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = parseInt(e.currentTarget.dataset.id);
            deleteProduct(productId);
        });
    });
}

function openEditModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    document.getElementById('edit-product-id').value = product.id;
    document.getElementById('edit-product-name').value = product.name;
    document.getElementById('edit-product-price').value = product.price;
    document.getElementById('edit-product-category').value = product.category;
    document.getElementById('edit-product-stock').value = product.stock;
    document.getElementById('edit-product-description').value = product.description;
    document.getElementById('edit-product-current-image').src = product.image;
    
    editProductModal.style.display = 'block';
}

function closeEditModal() {
    editProductModal.style.display = 'none';
}

function handleEditProduct(e) {
    e.preventDefault();
    
    const productId = parseInt(document.getElementById('edit-product-id').value);
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        showMessage('Product not found.', 'error');
        return;
    }
    
    // Update product
    product.name = document.getElementById('edit-product-name').value;
    product.price = parseFloat(document.getElementById('edit-product-price').value);
    product.category = document.getElementById('edit-product-category').value;
    product.stock = parseInt(document.getElementById('edit-product-stock').value);
    product.description = document.getElementById('edit-product-description').value;
    
    // Note: In a real app, you'd handle image updates properly
    // For this demo, we're not updating the image
    
    saveProducts();
    
    // Update UI
    renderProducts();
    renderFeaturedProducts();
    renderAdminProducts();
    populateCategoryFilter();
    
    // Close modal
    closeEditModal();
    
    showMessage('Product updated successfully!', 'success');
}

function toggleProductListing(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    product.listed = !product.listed;
    saveProducts();
    
    renderProducts();
    renderFeaturedProducts();
    renderAdminProducts();
    
    const action = product.listed ? 'listed' : 'unlisted';
    showMessage(`Product ${action} successfully.`, 'info');
}

function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    products = products.filter(p => p.id !== productId);
    
    // Remove from cart if present
    cart = cart.filter(item => item.productId !== productId);
    saveCart();
    
    saveProducts();
    
    renderProducts();
    renderFeaturedProducts();
    renderAdminProducts();
    renderCart();
    updateCartCount();
    populateCategoryFilter();
    
    showMessage('Product deleted successfully.', 'info');
}

// Utility functions
function populateCategoryFilter() {
    const categories = [...new Set(products.map(p => p.category))];
    categoryFilter.innerHTML = '<option value="">All Categories</option>';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

function showMessage(message, type) {
    const messageEl = document.createElement('div');
    messageEl.className = `message ${type}`;
    messageEl.textContent = message;
    
    messageContainer.appendChild(messageEl);
    
    // Remove message after 5 seconds
    setTimeout(() => {
        messageEl.remove();
    }, 5000);
}

// Data persistence
function saveProducts() {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}
// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
// Enhanced Admin Panel Functions
// These additions improve the existing admin functionality

/**
 * Enhanced product validation for better error handling
 * @param {Object} product - Product data to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function validateProduct(product) {
    if (!product.name || product.name.trim().length === 0) {
        showMessage('Product name is required.', 'error');
        return false;
    }
    
    if (!product.price || product.price <= 0) {
        showMessage('Price must be greater than 0.', 'error');
        return false;
    }
    
    if (!product.category || product.category.trim().length === 0) {
        showMessage('Category is required.', 'error');
        return false;
    }
    
    if (product.stock === undefined || product.stock < 0) {
        showMessage('Stock cannot be negative.', 'error');
        return false;
    }
    
    if (!product.description || product.description.trim().length === 0) {
        showMessage('Description is required.', 'error');
        return false;
    }
    
    return true;
}

/**
 * Handle image upload for products - enhanced version
 * @param {File} imageFile - The image file to process
 * @returns {Promise<string>} - Promise that resolves to image URL
 */
function handleImageUpload(imageFile) {
    return new Promise((resolve, reject) => {
        if (!imageFile) {
            reject('No image file provided');
            return;
        }
        
        // Validate file type
        if (!imageFile.type.match('image.*')) {
            reject('Please select a valid image file');
            return;
        }
        
        // Validate file size (max 5MB)
        if (imageFile.size > 5 * 1024 * 1024) {
            reject('Image size must be less than 5MB');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => reject('Failed to process image');
        reader.readAsDataURL(imageFile);
    });
}

/**
 * Enhanced add product handler with better validation and image handling
 */
function enhancedHandleAddProduct(e) {
    e.preventDefault();
    
    // Get form elements
    const name = document.getElementById('product-name').value.trim();
    const price = parseFloat(document.getElementById('product-price').value);
    const category = document.getElementById('product-category').value.trim();
    const stock = parseInt(document.getElementById('product-stock').value);
    const description = document.getElementById('product-description').value.trim();
    const imageInput = document.getElementById('product-image');
    
    // Validate required fields
    if (!name || !price || !category || !stock || !description) {
        showMessage('Please fill in all required fields.', 'error');
        return;
    }
    
    // Create product object
    const newProduct = {
        id: currentProductId++,
        name,
        category,
        price,
        stock,
        description,
        listed: true,
        createdAt: new Date().toISOString()
    };
    
    // Validate product data
    if (!validateProduct(newProduct)) {
        return;
    }
    
    // Handle image upload
    if (imageInput.files[0]) {
        handleImageUpload(imageInput.files[0])
            .then(imageUrl => {
                newProduct.image = imageUrl;
                addProductToStore(newProduct);
            })
            .catch(error => {
                showMessage(error, 'error');
            });
    } else {
        // Use a placeholder image if none provided
        newProduct.image = `https://via.placeholder.com/300x300?text=${encodeURIComponent(name)}`;
        addProductToStore(newProduct);
    }
}

/**
 * Add validated product to store and update UI
 * @param {Object} product - Validated product to add
 */
function addProductToStore(product) {
    products.push(product);
    saveProducts();
    
    // Reset form
    addProductForm.reset();
    
    // Update all UI components
    renderProducts();
    renderFeaturedProducts();
    renderAdminProducts();
    populateCategoryFilter();
    
    showMessage('Product added successfully!', 'success');
}

/**
 * Enhanced edit product handler with image update capability
 */
function enhancedHandleEditProduct(e) {
    e.preventDefault();
    
    const productId = parseInt(document.getElementById('edit-product-id').value);
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        showMessage('Product not found.', 'error');
        return;
    }
    
    // Get updated values
    const updatedProduct = {
        id: product.id,
        name: document.getElementById('edit-product-name').value.trim(),
        price: parseFloat(document.getElementById('edit-product-price').value),
        category: document.getElementById('edit-product-category').value.trim(),
        stock: parseInt(document.getElementById('edit-product-stock').value),
        description: document.getElementById('edit-product-description').value.trim(),
        image: product.image, // Keep existing image by default
        listed: product.listed,
        createdAt: product.createdAt,
        updatedAt: new Date().toISOString()
    };
    
    // Validate updated product
    if (!validateProduct(updatedProduct)) {
        return;
    }
    
    // Update product in array
    const productIndex = products.findIndex(p => p.id === productId);
    if (productIndex !== -1) {
        products[productIndex] = updatedProduct;
        saveProducts();
        
        // Update UI
        renderProducts();
        renderFeaturedProducts();
        renderAdminProducts();
        populateCategoryFilter();
        
        // Close modal
        closeEditModal();
        
        showMessage('Product updated successfully!', 'success');
    } else {
        showMessage('Failed to update product.', 'error');
    }
}

/**
 * Enhanced product deletion with cart cleanup
 * @param {number} productId - ID of product to delete
 */
function enhancedDeleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
        return;
    }
    
    // Remove product from products array
    products = products.filter(p => p.id !== productId);
    
    // Remove from cart if present
    cart = cart.filter(item => item.productId !== productId);
    saveCart();
    
    saveProducts();
    
    // Update all UI components
    renderProducts();
    renderFeaturedProducts();
    renderAdminProducts();
    renderCart();
    updateCartCount();
    populateCategoryFilter();
    
    showMessage('Product deleted successfully.', 'info');
}

/**
 * Enhanced product listing toggle with stock check
 * @param {number} productId - ID of product to toggle
 */
function enhancedToggleProductListing(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    product.listed = !product.listed;
    
    // If unlisting and product is in cart, remove it
    if (!product.listed) {
        cart = cart.filter(item => item.productId !== productId);
        saveCart();
        renderCart();
        updateCartCount();
    }
    
    saveProducts();
    
    // Update UI
    renderProducts();
    renderFeaturedProducts();
    renderAdminProducts();
    
    const action = product.listed ? 'listed' : 'unlisted';
    showMessage(`Product ${action} successfully.`, 'info');
}

/**
 * Initialize admin products list with event delegation for better performance
 */
function initAdminProductsList() {
    if (!localStorage.getItem(ADMIN_KEY)) return;
    
    // Clear existing event listeners and recreate
    const adminProductsList = document.getElementById('admin-products-list');
    if (!adminProductsList) return;
    
    // Use event delegation for better performance
    adminProductsList.innerHTML = '';
    
    products.forEach(product => {
        const productCard = createAdminProductCard(product);
        adminProductsList.appendChild(productCard);
    });
}

/**
 * Create admin product card with enhanced functionality
 * @param {Object} product - Product data
 * @returns {HTMLElement} - Product card element
 */
function createAdminProductCard(product) {
    const productCard = document.createElement('div');
    productCard.className = 'admin-product-card';
    productCard.dataset.productId = product.id;
    
    productCard.innerHTML = `
        <div class="admin-product-image">
            <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="admin-product-info">
            <h4 class="admin-product-title">${escapeHtml(product.name)}</h4>
            <p class="admin-product-price">$${product.price.toFixed(2)}</p>
            <p class="admin-product-category">${escapeHtml(product.category)}</p>
            <p class="admin-product-stock">Stock: ${product.stock}</p>
            <p class="admin-product-status">Status: 
                <span class="${product.listed ? 'status-listed' : 'status-unlisted'}">
                    ${product.listed ? 'Listed' : 'Unlisted'}
                </span>
            </p>
            <p class="admin-product-date">
                Created: ${formatDate(product.createdAt)}
                ${product.updatedAt ? `<br>Updated: ${formatDate(product.updatedAt)}` : ''}
            </p>
        </div>
        <div class="admin-product-actions">
            <button class="btn-secondary action-edit" data-action="edit">
                <i class="icon-edit"></i> Edit
            </button>
            <button class="btn-success action-toggle" data-action="toggle">
                <i class="icon-${product.listed ? 'unlist' : 'list'}"></i> ${product.listed ? 'Unlist' : 'List'}
            </button>
            <button class="btn-danger action-delete" data-action="delete">
                <i class="icon-delete"></i> Delete
            </button>
        </div>
    `;
    
    return productCard;
}

/**
 * Escape HTML to prevent XSS attacks
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Format date for display
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date
 */
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

/**
 * Enhanced render admin products with better error handling
 */
function enhancedRenderAdminProducts() {
    if (!localStorage.getItem(ADMIN_KEY)) return;
    
    const adminProductsList = document.getElementById('admin-products-list');
    if (!adminProductsList) return;
    
    adminProductsList.innerHTML = '';
    
    if (products.length === 0) {
        adminProductsList.innerHTML = '<p class="no-products">No products found. Add your first product!</p>';
        return;
    }
    
    try {
        products.forEach(product => {
            const productCard = createAdminProductCard(product);
            adminProductsList.appendChild(productCard);
        });
        
        // Set up event delegation for better performance
        setupAdminProductEventListeners();
    } catch (error) {
        console.error('Error rendering admin products:', error);
        showMessage('Error loading products. Please refresh the page.', 'error');
    }
}

/**
 * Set up event delegation for admin product actions
 */
function setupAdminProductEventListeners() {
    const adminProductsList = document.getElementById('admin-products-list');
    if (!adminProductsList) return;
    
    adminProductsList.addEventListener('click', (e) => {
        const button = e.target.closest('button[data-action]');
        if (!button) return;
        
        const action = button.dataset.action;
        const productCard = button.closest('.admin-product-card');
        const productId = parseInt(productCard.dataset.productId);
        
        switch (action) {
            case 'edit':
                openEditModal(productId);
                break;
            case 'toggle':
                enhancedToggleProductListing(productId);
                break;
            case 'delete':
                enhancedDeleteProduct(productId);
                break;
        }
    });
}

/**
 * Enhanced open edit modal with better form population
 * @param {number} productId - Product ID to edit
 */
function enhancedOpenEditModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) {
        showMessage('Product not found.', 'error');
        return;
    }
    
    // Populate form fields
    document.getElementById('edit-product-id').value = product.id;
    document.getElementById('edit-product-name').value = product.name;
    document.getElementById('edit-product-price').value = product.price;
    document.getElementById('edit-product-category').value = product.category;
    document.getElementById('edit-product-stock').value = product.stock;
    document.getElementById('edit-product-description').value = product.description;
    document.getElementById('edit-product-current-image').src = product.image;
    
    // Show modal
    editProductModal.style.display = 'block';
}

/**
 * Enhanced close modal with cleanup
 */
function enhancedCloseEditModal() {
    editProductModal.style.display = 'none';
    
    // Reset form to prevent stale data
    editProductForm.reset();
}

/**
 * Initialize enhanced admin functionality
 */
function initEnhancedAdminFeatures() {
    // Replace existing event listeners with enhanced versions
    if (addProductForm) {
        addProductForm.removeEventListener('submit', handleAddProduct);
        addProductForm.addEventListener('submit', enhancedHandleAddProduct);
    }
    
    if (editProductForm) {
        editProductForm.removeEventListener('submit', handleEditProduct);
        editProductForm.addEventListener('submit', enhancedHandleEditProduct);
    }
    
    // Add close modal event
    if (closeModal) {
        closeModal.removeEventListener('click', closeEditModal);
        closeModal.addEventListener('click', enhancedCloseEditModal);
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === editProductModal) {
            enhancedCloseEditModal();
        }
    });
    
    // Initialize enhanced admin products rendering
    const originalRenderAdminProducts = window.renderAdminProducts;
    window.renderAdminProducts = function() {
        enhancedRenderAdminProducts();
    };
}

// Initialize enhanced features when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for main init to complete
    setTimeout(initEnhancedAdminFeatures, 100);
});