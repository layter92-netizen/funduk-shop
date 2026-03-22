import { auth, db } from './firebase-config.js';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// DOM Elements
const authSection = document.getElementById("auth-section");
const dashboardSection = document.getElementById("dashboard-section");
const loginForm = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginError = document.getElementById("login-error");
const logoutBtn = document.getElementById("logout-btn");

const productForm = document.getElementById("product-form");
const productListEl = document.getElementById("product-list");
const toastEl = document.getElementById("toast");

// Form inputs
const titleInput = document.getElementById("p-title");
const descInput = document.getElementById("p-desc");
const priceInput = document.getElementById("p-price");
const imageInput = document.getElementById("p-image-url");
const imagePreview = document.getElementById("image-preview");
const categoryInputs = document.querySelectorAll('input[name="category"]');
const statusInput = document.getElementById("p-status");
const docIdInput = document.getElementById("doc-id");
const saveBtn = document.getElementById("save-btn");
const cancelEditBtn = document.getElementById("cancel-edit-btn");
const formTitle = document.getElementById("form-title");

let currentProducts = [];

// Toast notification function
function showToast(message, type = "success") {
    toastEl.textContent = message;
    toastEl.className = "toast show " + type;
    setTimeout(() => { toastEl.className = "toast"; }, 3000);
}

// ─── AUTHENTICATION ──────────────────────────────────────────

onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        authSection.classList.add("hidden");
        dashboardSection.classList.remove("hidden");
        logoutBtn.classList.remove("hidden");
        loadProducts();
    } else {
        // User is signed out
        authSection.classList.remove("hidden");
        dashboardSection.classList.add("hidden");
        logoutBtn.classList.add("hidden");
    }
});

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginError.textContent = "";
    
    try {
        await signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
        emailInput.value = "";
        passwordInput.value = "";
    } catch (error) {
        console.error(error);
        loginError.textContent = "Помилка входу: " + error.message;
    }
});

logoutBtn.addEventListener("click", () => signOut(auth));


// ─── PRODUCTS CRUD ──────────────────────────────────────────

async function loadProducts() {
    productListEl.innerHTML = '<div style="text-align:center; padding:20px;">Завантаження...</div>';
    try {
        const querySnapshot = await getDocs(collection(db, "seedlings"));
        currentProducts = [];
        querySnapshot.forEach((doc) => {
            currentProducts.push({ id: doc.id, ...doc.data() });
        });
        
        // Sort alphabetically
        currentProducts.sort((a, b) => a.title.localeCompare(b.title));
        renderProductList();
    } catch (error) {
        console.error("Error loadProducts:", error);
        productListEl.innerHTML = '<div style="color:red; padding:20px;">Помилка завантаження бази даних. Перевірте правила безпеки Firestore.</div>';
    }
}

function renderProductList() {
    productListEl.innerHTML = "";
    if (currentProducts.length === 0) {
        productListEl.innerHTML = "<div>Товарів ще немає.</div>";
        return;
    }

    currentProducts.forEach(product => {
        const status = product.stockStatus || (product.available !== false ? 'available' : 'out_of_stock');
        const isAvailable = status === 'available';
        
        let statusLabel = '';
        if (status === 'out_of_stock') statusLabel = '(Закінчилися)';
        if (status === 'temporarily_unavailable') statusLabel = '(Тимчасово немає)';
        const categories = product.categories || [];
        
        const card = document.createElement("div");
        card.className = "admin-product-card" + (isAvailable ? "" : " unavailable");
        
        card.innerHTML = `
            <img src="${product.image}" class="admin-img-preview" alt="фото" onerror="this.src='logo.png'">
            <div class="admin-product-info">
                <div style="font-weight: bold; font-size: 1.1em; color: white;">${product.title} <span style="color: #ff4d4d; font-size: 0.8em;">${statusLabel}</span></div>
                <div style="color: var(--accent-gold);">${product.price} грн / шт</div>
                <div style="font-size: 0.8em; color: #999; margin-top: 4px;">Категорії: ${categories.join(', ')}</div>
            </div>
            <div class="admin-product-actions">
                <button class="btn-edit" data-id="${product.id}">Редагувати</button>
                <button class="btn-delete" data-id="${product.id}">Видалити</button>
            </div>
        `;
        productListEl.appendChild(card);
    });

    // Attach event listeners for edit and delete buttons
    document.querySelectorAll(".btn-edit").forEach(btn => {
        btn.addEventListener("click", (e) => editProduct(e.target.dataset.id));
    });
    
    document.querySelectorAll(".btn-delete").forEach(btn => {
        btn.addEventListener("click", (e) => deleteProductConf(e.target.dataset.id));
    });
}

// Helper function to convert Google Drive view links to direct image links
function processImageUrl(url) {
    url = url.trim();
    if (!url) return '';
    
    // Check if it's a Google Drive share link 
    const gDriveMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (gDriveMatch && gDriveMatch[1]) {
        // Use Google's thumbnail API which allows embedding
        return `https://drive.google.com/thumbnail?id=${gDriveMatch[1]}&sz=w800`;
    }
    
    // Check if it's an id-based link
    const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (url.includes('drive.google.com') && idMatch && idMatch[1]) {
        return `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=w800`;
    }
    
    return url;
}

// Preview image when URL is entered
imageInput.addEventListener("input", function() {
    const rawUrl = this.value;
    const processedUrl = processImageUrl(rawUrl);
    
    if (processedUrl) {
        imagePreview.src = processedUrl;
        imagePreview.style.display = "block";
    } else {
        imagePreview.style.display = "none";
    }
});

productForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    saveBtn.disabled = true;
    saveBtn.textContent = "Збереження...";
    
    try {
        let imageUrl = processImageUrl(imageInput.value);
        
        if (!imageUrl) {
            // Default image if empty
            imageUrl = "logo.png";
        }
        
        // Gather selected categories
        const selectedCategories = ['all']; // Ensure 'all' is always there
        categoryInputs.forEach(cb => {
            if (cb.checked) selectedCategories.push(cb.value);
        });

        const productData = {
            title: titleInput.value.trim(),
            description: descInput.value.trim(),
            price: Number(priceInput.value),
            unit: 'pcs',
            image: imageUrl,
            categories: selectedCategories,
            stockStatus: statusInput.value,
            available: statusInput.value === 'available'
        };
        
        const editingId = docIdInput.value;
        
        if (editingId) {
            // Update existing
            await updateDoc(doc(db, "seedlings", editingId), productData);
            showToast("Товар успішно оновлено!");
        } else {
            // Add new
            await addDoc(collection(db, "seedlings"), productData);
            showToast("Новий товар успішно додано!");
        }
        
        resetForm();
        loadProducts();
    } catch (error) {
        console.error("Save error:", error);
        showToast("Помилка збереження: " + error.message, "error");
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = "Зберегти товар";
    }
});

function editProduct(id) {
    const product = currentProducts.find(p => p.id === id);
    if (!product) return;
    
    formTitle.textContent = "Редагування товару";
    docIdInput.value = product.id;
    titleInput.value = product.title;
    descInput.value = product.description || '';
    priceInput.value = product.price;
    imageInput.value = product.image || '';
    statusInput.value = product.stockStatus || (product.available !== false ? 'available' : 'out_of_stock');
    
    // Categories
    const cats = product.categories || [];
    categoryInputs.forEach(cb => cb.checked = cats.includes(cb.value));
    
    // Image preview
    if (product.image) {
        imagePreview.src = product.image;
        imagePreview.style.display = "block";
    } else {
        imagePreview.style.display = "none";
    }
    
    saveBtn.textContent = "Оновити товар";
    cancelEditBtn.classList.remove("hidden");
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" });
}

cancelEditBtn.addEventListener("click", resetForm);

function resetForm() {
    productForm.reset();
    docIdInput.value = "";
    descInput.value = "";
    imageInput.value = "";
    imagePreview.style.display = "none";
    statusInput.value = "available";
    formTitle.textContent = "Додати новий товар";
    saveBtn.textContent = "Зберегти товар";
    cancelEditBtn.classList.add("hidden");
    // Default categories unchecked except 'all' which is hardcoded in the push logic
}

async function deleteProductConf(id) {
    if (confirm("Ви впевнені, що хочете видалити цей товар? Цю дію не можна скасувати.")) {
        try {
            await deleteDoc(doc(db, "seedlings", id));
            showToast("Товар видалено");
            loadProducts();
        } catch (error) {
            console.error("Delete error:", error);
            showToast("Помилка видалення", "error");
        }
    }
}



