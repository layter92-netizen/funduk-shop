import { db } from './firebase-config.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async () => {
    // DOM Elements
    const VARIETY_DESCRIPTIONS = {
        "Королівський": `Фундук «Королівський» (Royal) — популярний високоврожайний сорт, поширений у Європі та Україні.<br><br>
<b>Кущ</b>: середньорослий (3–4,5 м), крона компактна.<br>
<b>Дозрівання</b>: початок – перша половина вересня.<br>
<b>Горіхи</b>: дуже великі (3,5–4,5 г), округлі. Збираються по 3–5 шт. Ядро солодке, щільне (вихід 38–40%).<br>
<b>Урожайність</b>: 6–8 кг з куща.<br>
<b>Морозостійкість</b>: висока (до -30 °C).<br>
<b>Особливості</b>: частково самоплідний, висока стійкість до хвороб, універсального призначення.`,
        "Каталонський": `Фундук «Каталонський» — один із найстаріших та найпопулярніших європейських сортів (іспанського походження), який відмінно зарекомендував себе в Україні.<br><br>
<b>Кущ</b>: сильнорослий (4–6 м), крона густа, добре облистнена.<br>
<b>Дозрівання</b>: початок – перша декада вересня.<br>
<b>Горіхи</b>: великі (3,5–4 г), округлі. Збираються по 3–5 шт. Ядро дуже смачне, солодке, з мигдальним присмаком (вихід 38–43%, жирність до 70%).<br>
<b>Урожайність</b>: стабільно хороша, один із найнадійніших сортів.<br>
<b>Морозостійкість</b>: добра (до -25…-28 °C).<br>
<b>Особливості</b>: раннє вступання в плодоношення (на 3-4 рік), частково самоплідний (запилювачі: Барселонський, Косфорд, Галле). Універсальний сорт для свіжого споживання та кондитерки.`,
        "Тонда Ді Джифонні": `Фундук «Тонда ді Джіффоні» (Tonda di Giffoni) — один із найпопулярніших італійських сортів (походить з регіону Кампанія), має статус IGP завдяки високій якості. Вважається одним із найкращих для промислової переробки.<br><br>
<b>Кущ</b>: середньорослий (3,5–4,5 м), крона широка.<br>
<b>Дозрівання</b>: раннє (початок – перша декада вересня).<br>
<b>Горіхи</b>: середні (2,5–3,2 г), ідеально округлі. Збираються по 3–5 шт. Тонка шкаралупа, легко розколюється. Ядро дуже смачне та ароматне, кремового кольору (дуже високий вихід ядра 45–47%).<br>
<b>Урожайність</b>: дуже висока та стабільна (6–10+ кг з куща).<br>
<b>Морозостійкість</b>: добра (потребує уваги до весняних заморозків через раннє пробудження).<br>
<b>Особливості</b>: ідеально бланшується (>85%). Чудовий універсальний запилювач. Висока стійкість до хвороб.<br>
<b>Призначення</b>: преміум клас для кондитерки (шоколад, пасти) та якісний in-shell ринок.`,
        "Косфорд": `Фундук «Косфорд» (Cosford) — класичний англійський сорт, один із найвідоміших і найнадійніших запилювачів для більшості сортів фундука.<br><br>
<b>Кущ</b>: сильнорослий (4–6 м), крона густа та широка.<br>
<b>Дозрівання</b>: середнє (кінець серпня – початок вересня).<br>
<b>Горіхи</b>: середні (2,5–3,5 г), округло-овальні. Збираються по 2–5 шт. Тонка шкаралупа, яка дуже легко розколюється. Ядро солодке, щільне (вихід ядра 40–45%).<br>
<b>Урожайність</b>: висока та стабільна (6–10 кг з дорослого куща).<br>
<b>Морозостійкість</b>: дуже висока (витримує -28…-32 °C і більше).<br>
<b>Особливості</b>: раннє вступання в плодоношення (на 3-4 рік). Відмінний універсальний запилювач (для сортів Каталонський, Барселонський, Галле та ін.). Сорт універсального призначення.`,
        "Тонда Джантіле": `Фундук «Тонда Джантіле» (Tonda Gentile delle Langhe / Trilobata) — видатний італійський сорт родом з регіону П'ємонт. Вважається одним з найкращих сортів у світі за своїми смаковими властивостями.<br><br>
<b>Характеристики плоду</b>: горіхи кулястої форми з середнім виходом світлого ядра. Чудово очищується від плівки під час тостування (обсмажування), має високу поживну цінність. Смак та аромат оцінюються як відмінні, довго зберігаються.<br>
<b>Агрономіка</b>: ранній термін дозрівання та середня продуктивність. Вимогливий до умов вирощування (краще адаптований до рідних умов П'ємонту).<br>
<b>Особливості</b>: чутливий до пошкодження бруньковим кліщем та пізніми весняними заморозками. Для успішного зав'язування потребує запилювачів із середньо-пізнім чоловічим цвітінням.<br>
<b>Використання</b>: надзвичайно затребуваний світовими кондитерами для виробництва високоякісних солодощів та паст.`,
        "Нокйоне": `Фундук «Ноккьоне» (Nocchione) — класичний італійський сорт, один із основних у південній та центральній Італії.<br><br>
<b>Кущ</b>: середньо- або сильнорослий (3,5–5 м), з хорошою силою росту.<br>
<b>Дозрівання</b>: середнє (кінець серпня – початок вересня).<br>
<b>Горіхи</b>: середні (2,8–3,3 г), округлі. Збираються по 3–5 шт. Товста та тверда шкаралупа. Ядро щільне, смачне, добре заповнює шкаралупу (вихід ядра 36–42%).<br>
<b>Урожайність</b>: висока та стабільна (один із найнадійніших сортів в Італії).<br>
<b>Морозостійкість</b>: середня до хорошої (в північних регіонах України бажано садити у захищених від протягу місцях).<br>
<b>Особливості</b>: відмінний універсальний запилювач (для сортів Tonda Gentile Romana, Tonda di Giffoni та ін.). Ядро ідеально бланшується (шкірка легко відокремлюється під час обсмажування), має приємний смак і довгий термін зберігання.`,
        "Мортарелла": `Фундук «Мортарелла» (Mortarella) — класичний італійський сорт з регіону Кампанія, який високо цінується за надзвичайно високу врожайність та стабільність.<br><br>
<b>Кущ</b>: сильнорослий (3,5–4,5 м), крона густа та розлога, активне утворення порослі.<br>
<b>Дозрівання</b>: раннє або середнє (кінець серпня – початок вересня).<br>
<b>Горіхи</b>: середні (2,5–3,2 г), злегка видовжені. Збираються по 3–5 шт. Шкаралупа тонка. Ядро кремово-біле, хрустке та дуже смачне (хороший вихід ядра 40–45%).<br>
<b>Урожайність</b>: дуже висока та стабільна (один із найпродуктивніших сортів: 6–10+ кг з куща).<br>
<b>Морозостійкість</b>: висока (добре витримує морози, чудово адаптований до погодних умов України).<br>
<b>Особливості</b>: легко бланшується. Частково самоплідний (кращі запилювачі: Ноккьоне, Тонда ді Джіффоні, Косфорд). Сам є сильним запилювачем для інших сортів.<br>
<b>Призначення</b>: універсальний сорт найвищої товарної якості (промисловість, кондитерка, свіже споживання).`,
        "Барселонна": `Фундук «Барселона» (Barcelona) — класичний іспанський крупноплідний сорт (Каталонія), еталон для промислового вирощування та один із найнадійніших базових сортів.<br><br>
<b>Кущ</b>: сильнорослий (4–6 м), крона широка, розлога. Добре утворює поросль.<br>
<b>Дозрівання</b>: середнє або пізнє (кінець серпня – середина вересня).<br>
<b>Горіхи</b>: дуже великі (3,3–4,5 г, діаметр >20 мм), округлі. Збираються по 2–6 шт. Ядро велике та щільне, з потужним горіховим смаком (вихід 39–43%).<br>
<b>Урожайність</b>: висока (6–12 кг з куща).<br>
<b>Морозостійкість</b>: висока (до -30 °C), відмінна посухостійкість.<br>
<b>Особливості</b>: надзвичайно швидке вступання в плодоношення (з 2-4 року). Частково самоплідний (відмінні запилювачі: Косфорд, Галле, Тонда ді Джіффоні). Пелікула погано відокремлюється (слабке бланшування).<br>
<b>Призначення</b>: завдяки величезному розміру та привабливій формі ідеально підходить для продажу в шкаралупі (in-shell як столовий горіх) та свіжого споживання.`,
        "Біглінні": `Фундук «Тонда ді Бігліні» (Tonda di Biglini) — італійський сорт, селекційний клон славетного Tonda Gentile delle Langhe. Зберіг його преміальні смакові якості, але отримав значно кращу врожайність.<br><br>
<b>Кущ</b>: середньорослий (3–4 м), крона розлога, середньої густоти.<br>
<b>Дозрівання</b>: дуже раннє або раннє (кінець серпня – початок вересня).<br>
<b>Горіхи</b>: середні (2,8–3,3 г), округлі. Збираються по 3–5 шт. Шкаралупа міцна. Ядро кремове, хрустке та дуже ароматне (вихід 40–43%).<br>
<b>Урожайність</b>: дуже висока та стабільна (один із найпродуктивніших клонів, знижена періодичність плодоношення).<br>
<b>Морозостійкість</b>: добра (нижча чутливість до весняних заморозків порівняно з оригіналом; витримує зими України у відповідних місцях).<br>
<b>Особливості</b>: чудово бланшується (шкірка легко відходить). Частково самоплідний (кращі запилювачі: Tonda Gentile Romana, Nocchione, Tonda di Giffoni).<br>
<b>Призначення</b>: преміальний сорт найвищої товарної якості для кондитерської промисловості та свіжого ринку.`
    };

    const productGrid = document.getElementById("product-grid");
    const cartCountEl = document.querySelector(".cart-count");
    
    let products = [];
    
    // Show loading text
    productGrid.innerHTML = '<p style="text-align: center; width: 100%; grid-column: 1 / -1;">Завантаження товарів...</p>';

    try {
        const querySnapshot = await getDocs(collection(db, "seedlings"));
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Only add products that are available
            if (data.available !== false) {
                products.push({ id: doc.id, ...data });
            }
        });
        
        // Sort products alphabetically
        products.sort((a, b) => a.title.localeCompare(b.title));
        
        // Initial render now that products are loaded
        renderProducts();
    } catch (error) {
        console.error("Помилка завантаження товарів:", error);
        productGrid.innerHTML = '<p style="text-align: center; width: 100%; grid-column: 1 / -1; color: #ff4d4d;">Сталася помилка при завантаженні магазину =(. Будь ласка, оновіть сторінку.</p>';
        return;
    }

    // Cart Elements
    const cartOverlay = document.getElementById("cart-overlay");
    const cartIcon = document.querySelector(".cart-icon");
    const closeCartBtn = document.getElementById("close-cart");
    const cartItemsContainer = document.getElementById("cart-items");
    const cartTotalPriceEl = document.getElementById("cart-total-price");
    const checkoutForm = document.getElementById("checkout-form");
    const filterBtns = document.querySelectorAll(".filter-btn");

    let cart = [];

    // Generate product cards function
    function renderProducts(filterCategory = 'all') {
        productGrid.innerHTML = ''; // Clear grid

        const filteredProducts = products.filter(product => product.categories.includes(filterCategory));

        if (filteredProducts.length === 0) {
            productGrid.innerHTML = '<p style="text-align: center; width: 100%; grid-column: 1 / -1;">В цій категорії поки немає товарів.</p>';
            return;
        }

        filteredProducts.forEach((product, index) => {
            // Find original index for cart functionality
            const originalIndex = products.findIndex(p => p.title === product.title);

            const card = document.createElement("div");
            card.className = "product-card animate-in";
            // Reduce animation delay to make it snappier when filtering
            card.style.animationDelay = `${(index % 10) * 0.03}s`;

            const unitLabel = 'шт.';

            card.innerHTML = `
                <div class="product-image-wrapper">
                    <img src="${product.image}" alt="${product.title}" class="product-image" onerror="this.src='logo.png'">
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.title}</h3>
                    <button class="desc-btn" style="width:100%; margin-bottom:15px; padding:10px; font-size:0.95em; font-weight:600; background:none; border:1px solid var(--accent-gold); color:var(--accent-gold); border-radius:8px; cursor:pointer; transition:all 0.3s ease;">📖 Читати опис сорту</button>
                    <div class="price-row" style="margin-bottom: 10px;">
                        <span class="price-placeholder">${product.price} грн / ${unitLabel}</span>
                    </div>
                    <button class="add-to-cart w-100" data-index="${originalIndex}">Обрати кількість</button>
                </div>
            `;

            productGrid.appendChild(card);
        });

        // Re-attach event listeners to new buttons
        attachAddToCartListeners();
    }

    // Initial render
    renderProducts();

    // Filter Button Logic
    const categoryDescContainer = document.getElementById("category-description-container");

    filterBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            // Remove active class from all
            filterBtns.forEach(b => b.classList.remove("active"));
            // Add active class to clicked
            btn.classList.add("active");

            const filterValue = btn.getAttribute("data-filter");
            const filterName = btn.textContent.trim().replace('🌳 ', '');
            
            if (filterValue === 'all') {
                categoryDescContainer.style.display = 'none';
            } else {
                const descText = VARIETY_DESCRIPTIONS[filterName];
                if (descText) {
                    categoryDescContainer.innerHTML = `<h3 style="color: var(--accent-gold); margin-bottom: 15px; font-size: 1.6em;">${filterName}</h3>${descText}`;
                    categoryDescContainer.style.display = 'block';
                } else {
                    categoryDescContainer.style.display = 'none';
                }
            }

            renderProducts(filterValue);
        });
    });

    // Update Cart UI
    function updateCartUI() {
        cartItemsContainer.innerHTML = "";
        let total = 0;
        let count = 0;

        cart.forEach((item, index) => {
            const itemSum = item.price * item.amount;
            total += itemSum;

            const amountDisplay = `${item.amount} шт.`;

            const cartItemEl = document.createElement("div");
            cartItemEl.className = "cart-item";
            cartItemEl.innerHTML = `
                <img src="${item.image}" alt="${item.title}">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.title}</div>
                    <div class="cart-item-price">${amountDisplay} x ~${item.price} грн = ~${Math.round(itemSum)} грн</div>
                </div>
                <div class="cart-item-actions">
                    <button class="remove-item" data-index="${index}">&times;</button>
                </div>
            `;
            cartItemsContainer.appendChild(cartItemEl);
        });

        cartCountEl.textContent = cart.length;
        cartTotalPriceEl.textContent = `~${Math.round(total)} грн`;

        // Attach remove events
        document.querySelectorAll(".remove-item").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const itemIndex = e.target.getAttribute("data-index");
                cart.splice(itemIndex, 1);
                updateCartUI();
            });
        });
    }

    // Qty Modal Elements
    const qtyModalOverlay = document.getElementById("qty-modal-overlay");
    const closeQtyModalBtn = document.getElementById("close-qty-modal");

    const detailsModalOverlay = document.getElementById("details-modal-overlay");
    const closeDetailsModalBtn = document.getElementById("close-details-modal");
    const detailsProductImg = document.getElementById("details-product-img");
    const detailsProductName = document.getElementById("details-product-name");
    const detailsProductDesc = document.getElementById("details-product-desc");
    const detailsPriceSpan = document.getElementById("details-price");
    const addToCartFromDetailsBtn = document.getElementById("add-to-cart-from-details");

    closeDetailsModalBtn.addEventListener('click', () => {
        detailsModalOverlay.classList.remove('active');
    });
    
    detailsModalOverlay.addEventListener('click', (e) => {
        if (e.target === detailsModalOverlay) {
            detailsModalOverlay.classList.remove('active');
        }
    });

    function openQtyModal(product, originalIndex) {
        currentSelectedProductIndex = originalIndex;
        
        qtyProductName.textContent = product.title;
        
        // Build dynamic selector for pieces (pcs)
        let selectorHTML = `
            <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin: 20px 0;">
                <button id="qty-minus" style="width: 40px; height: 40px; border-radius: 50%; border: 1px solid var(--accent-gold); background: transparent; color: var(--accent-gold); font-size: 1.5rem;">-</button>
                <input type="number" id="modal-qty-input" value="1" min="1" max="50" style="width: 80px; text-align: center; font-size: 1.5rem; background: var(--bg-dark); color: white; border: 1px solid var(--border-color); padding: 10px; border-radius: 5px;">
                <button id="qty-plus" style="width: 40px; height: 40px; border-radius: 50%; border: 1px solid var(--accent-gold); background: transparent; color: var(--accent-gold); font-size: 1.5rem;">+</button>
                <span style="font-size: 1.2rem;">шт</span>
            </div>
        `;
        qtySelectorContainer.innerHTML = selectorHTML;
        
        document.getElementById('qty-minus').addEventListener('click', () => {
            let input = document.getElementById('modal-qty-input');
            if (input.value > 1) input.value = parseInt(input.value) - 1;
        });
        document.getElementById('qty-plus').addEventListener('click', () => {
            let input = document.getElementById('modal-qty-input');
            if (input.value < 50) input.value = parseInt(input.value) + 1;
        });

        qtyModalOverlay.classList.add("active");
    }

    function openDetailsModal(product) {
        detailsProductImg.src = product.image;
        detailsProductImg.onerror = function() {this.src='logo.png'};
        detailsProductName.textContent = product.title;
        detailsProductDesc.innerHTML = product.description || VARIETY_DESCRIPTIONS[product.title] || 'На жаль, детального опису щодо цього сорту поки що немає.';
        detailsPriceSpan.textContent = product.price;
        
        addToCartFromDetailsBtn.onclick = () => {
            detailsModalOverlay.classList.remove('active');
            let idx = products.findIndex(p => p.id === product.id);
            openQtyModal(product, idx);
        };

        detailsModalOverlay.classList.add('active');
    }
    const qtyProductName = document.getElementById("qty-product-name");
    const qtySelectorContainer = document.getElementById("qty-selector-container");
    const confirmAddToCartBtn = document.getElementById("confirm-add-to-cart");
    
    let currentSelectedProductIndex = null;

    closeQtyModalBtn.addEventListener("click", () => {
        qtyModalOverlay.classList.remove("active");
    });
    
    qtyModalOverlay.addEventListener("click", (e) => {
        if (e.target === qtyModalOverlay) {
            qtyModalOverlay.classList.remove("active");
        }
    });

    // Add to cart functionality
    function attachAddToCartListeners() {
        document.querySelectorAll(".add-to-cart").forEach(btn => {
            btn.replaceWith(btn.cloneNode(true));
        });

        document.querySelectorAll(".product-card").forEach(card => {
            const productIndex = card.querySelector(".add-to-cart").getAttribute("data-index");
            const product = products[productIndex];

            const descBtn = card.querySelector('.desc-btn');
            if (descBtn) {
                descBtn.addEventListener('click', () => {
                    openDetailsModal(product);
                });
                descBtn.addEventListener('mouseenter', () => {
                    descBtn.style.background = 'var(--accent-gold)';
                    descBtn.style.color = 'white';
                });
                descBtn.addEventListener('mouseleave', () => {
                    descBtn.style.background = 'none';
                    descBtn.style.color = 'var(--accent-gold)';
                });
            }

            const addToCartBtn = card.querySelector(".add-to-cart");
            addToCartBtn.addEventListener("click", function () {
                openQtyModal(product, productIndex);
            });
        });
    }
    
    // Confirm button in Qty Modal
    confirmAddToCartBtn.addEventListener("click", () => {
        if (currentSelectedProductIndex === null) return;
        
        const product = products[currentSelectedProductIndex];
        let amount = parseInt(document.getElementById("modal-qty-input").value) || 1;

        const existingItem = cart.find(i => i.title === product.title);
        if (existingItem) {
            existingItem.amount += amount;
        } else {
            cart.push({ ...product, amount: amount });
        }

        updateCartUI();

        // Close modal
        qtyModalOverlay.classList.remove("active");

        // Cart bounce animation
        cartCountEl.parentElement.style.transform = "scale(1.3)";
        setTimeout(() => {
            cartCountEl.parentElement.style.transform = "scale(1)";
        }, 200);
        
        // Show temporary toast feedback (using standard alert if no toast exists, or update cart count visually)
        const btn = document.querySelector(`.add-to-cart[data-index="${currentSelectedProductIndex}"]`);
        if (btn) {
            const originalText = btn.textContent;
            btn.textContent = "Додано!";
            btn.style.background = "var(--accent-gold)";
            btn.style.color = "var(--bg-dark)";
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = "transparent";
                btn.style.color = "var(--accent-gold)";
            }, 1000);
        }
    });

    // Cart Modal Toggles
    cartIcon.addEventListener("click", () => {
        cartOverlay.classList.add("active");
    });

    closeCartBtn.addEventListener("click", () => {
        cartOverlay.classList.remove("active");
    });

    cartOverlay.addEventListener("click", (e) => {
        if (e.target === cartOverlay) {
            cartOverlay.classList.remove("active");
        }
    });

    // Form Submission (Web3Forms Integration)
    const submitBtn = document.getElementById("submit-btn");
    const formResult = document.getElementById("form-result");

    checkoutForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (cart.length === 0) {
            alert("Ваш кошик порожній. Додайте товари перед оформленням замовлення.");
            return;
        }

        let totalOrderSum = 0;
        let orderList = cart.map(item => {
            const itemSum = Math.round(item.price * item.amount);
            totalOrderSum += itemSum;
            const amountDisplay = `${item.amount} шт.`;
            return `- ${item.title}: ${amountDisplay} x ~${item.price} грн = ~${itemSum} грн`;
        });

        orderList.push(`\nЗагальна сума (орієнтовно): ~${totalOrderSum} грн`);

        document.getElementById("orderDetails").value = orderList.join("\n");

        const formData = new FormData(checkoutForm);
        const object = {};
        formData.forEach((value, key) => {
            object[key] = value;
        });
        const json = JSON.stringify(object);

        submitBtn.textContent = "Обробка...";
        submitBtn.disabled = true;

        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json"
                },
                body: json
            });

            const jsonResponse = await response.json();

            if (response.status === 200) {
                formResult.style.display = "block";
                formResult.style.color = "#4BB543";
                formResult.textContent = "Дякуємо! Ваше замовлення успішно відправлено.";

                // Clear cart
                cart = [];
                updateCartUI();
                checkoutForm.reset();

                setTimeout(() => {
                    formResult.style.display = "none";
                    cartOverlay.classList.remove("active");
                    submitBtn.textContent = "Відправити замовлення";
                    submitBtn.disabled = false;
                }, 3000);
            } else {
                console.log(response);
                formResult.style.display = "block";
                formResult.style.color = "#ff4d4d";
                formResult.textContent = "❌ Помилка: " + jsonResponse.message;
                submitBtn.textContent = "Відправити замовлення";
                submitBtn.disabled = false;
            }
        } catch (error) {
            console.log(error);
            formResult.style.display = "block";
            formResult.style.color = "#ff4d4d";
            formResult.textContent = "❌ Сталася помилка. Перевірте з'єднання з інтернетом.";
            submitBtn.textContent = "Відправити замовлення";
            submitBtn.disabled = false;
        }
    });

    // Smooth scroll for anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                targetEl.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});
