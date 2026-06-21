// القاموس اللغوي الموحد
const globalDictionary = {
    ar: {
        dir: "rtl",
        addToCart: "إضافة للسلة 🛒",
        itemAdded: "تمت الإضافة ✓",
        searchAlert: "جاري البحث في قاعدة تتبع TUNCAR عن القطعة أو رقم VIN المكتوب...",
        tlStep1: "المراجعة", tlStep2: "العنوان", tlStep3: "الدفع", tlStep4: "التقرير والتحقق", tlStep5: "الضمان النشط",
        summaryTitle: "ملخص الحساب المالي", subtotal: "إجمالي القطع:", shipping: "الشحن المؤمن:", netTotal: "الصافي النهائي:",
        usedText: "مستعمل (كمية مقفلة 1)", newText: "جديد باكور",
        statePending: "قيد المراجعة والتحقق الفني", stateVerified: "تم التحقق وتشغيل الضمان بنجاح", stateUnclear: "المصادر غير واضحة - نرجو إعادة رفع الفيديو"
    },
    en: {
        dir: "ltr",
        addToCart: "Add to Cart 🛒",
        itemAdded: "Added ✓",
        searchAlert: "Searching TUNCAR database for the requested part or VIN...",
        tlStep1: "Validation", tlStep2: "Address", tlStep3: "Payment", tlStep4: "Unboxing Report", tlStep5: "Warranty Hub",
        summaryTitle: "Financial Summary", subtotal: "Parts Subtotal:", shipping: "Insured Shipping:", netTotal: "Net Total Due:",
        usedText: "USED (Qty Locked)", newText: "NEW (Factory)",
        statePending: "Pending Verification Review", stateVerified: "Verified & Warranty Activated", stateUnclear: "Unclear Video - Action Required"
    }
};

// 1. إدارة الحالة وقاعدة المنتجات الثابتة
const allAvailableProducts = [
    { id: "p1", name: "Culasse d'origine importé - Golf 6", price: 850.000, condition: "used", trackingId: "TUNCAR-USD-99201", img: "🔧" },
    { id: "p2", name: "Paire Amortisseurs Avant Bilstein", price: 420.000, condition: "new", trackingId: "TUNCAR-NEW-11048", img: "🛑" },
    { id: "p3", name: "Capteur de Pression OBD2 MPX Moteur", price: 145.000, condition: "new", trackingId: "TUNCAR-NEW-88391", img: "⚡" }
];

const userSavedAddresses = [
    { id: "addr_1", title: "المنزل الرئيسي", fullAddress: "نهج ابن خلدون، بوفيشة، سوسة" },
    { id: "addr_2", title: "موقع عمل مشروع Salloum", fullAddress: "منطقة السلوم، بوفيشة" }
];

let currentLang = localStorage.getItem("tuncar_lang") || "ar";
let cart = JSON.parse(localStorage.getItem("tuncar_cart")) || [];
let countdownInterval;
let inspectionAnswers = { q1: null, q2: null };
let unboxingVideoUrl = "";

// 2. التشغيل الأساسي عند تحميل أي صفحة
document.addEventListener("DOMContentLoaded", () => {
    applyLanguageDOM();
    updateCartGlobalBadge();
    
    // تشغيل الدوال المخصصة بناءً على الصفحة الحالية
    if (document.getElementById("catalogProductsGrid")) {
        renderCatalog();
    }
    if (document.getElementById("validationItemsContainer")) {
        renderValidationItems();
        renderSummaries();
        renderSavedAddresses();
    }
});

function toggleLanguage() {
    currentLang = currentLang === "ar" ? "en" : "ar";
    localStorage.setItem("tuncar_lang", currentLang);
    applyLanguageDOM();
    location.reload(); // إعادة تحميل لتحديث النصوص بالكامل
}

function applyLanguageDOM() {
    const data = globalDictionary[currentLang];
    const root = document.getElementById("htmlRoot");
    if(root) {
        root.setAttribute("dir", data.dir);
        root.setAttribute("lang", currentLang);
    }
}

// 3. منطق الصفحة الرئيسية (البحث)
function handleMainSearch() {
    const input = document.getElementById("vinSearchInput").value;
    if(!input.trim()) return;
    alert(globalDictionary[currentLang].searchAlert + "\n" + input);
    window.location.href = "catalog.html";
}

// 4. منطق صفحة الكتالوج (المتجر)
function renderCatalog() {
    const grid = document.getElementById("catalogProductsGrid");
    grid.innerHTML = "";
    
    allAvailableProducts.forEach(p => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
            <div>
                <div class="prod-meta">
                    <span class="badge-condition ${p.condition === 'new' ? 'badge-new' : 'badge-used'}">
                        ${p.condition === 'new' ? 'NEW' : 'USED'}
                    </span>
                    <small style="color:#64748b; font-family:monospace;">${p.trackingId}</small>
                </div>
                <div style="font-size:30px; margin-bottom:10px;">${p.img}</div>
                <strong style="color:#fff; display:block; margin-bottom:8px;">${p.name}</strong>
            </div>
            <div>
                <div style="font-size:16px; color:var(--cyber-blue); font-weight:bold; margin-bottom:15px;">${p.price.toFixed(3)} DT</div>
                <button class="btn-cyber" id="btn-add-${p.id}" onclick="addToCart('${p.id}')">${globalDictionary[currentLang].addToCart}</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function addToCart(id) {
    const product = allAvailableProducts.find(p => p.id === id);
    const existing = cart.find(item => item.id === id);
    
    if (existing) {
        if(product.condition !== "used") existing.qty += 1;
    } else {
        cart.push({ ...product, qty: 1 });
    }
    
    localStorage.setItem("tuncar_cart", JSON.stringify(cart));
    updateCartGlobalBadge();
    
    const btn = document.getElementById(`btn-add-${id}`);
    if(btn) {
        btn.innerText = globalDictionary[currentLang].itemAdded;
        btn.style.background = "var(--cyber-green)";
        setTimeout(() => {
            if(btn) {
                btn.innerText = globalDictionary[currentLang].addToCart;
                btn.style.background = "var(--cyber-blue)";
            }
        }, 1500);
    }
}

function updateCartGlobalBadge() {
    const badge = document.getElementById("cartGlobalCount");
    if(badge) {
        badge.innerText = cart.reduce((acc, item) => acc + item.qty, 0);
    }
}

// 5. منطق السلة والخطوات (Checkout & Warranty)
function calculateFinancials() {
    let subtotal = cart.reduce((acc, p) => acc + (p.price * p.qty), 0);
    const shipping = cart.length > 0 ? 7.000 : 0;
    return { subtotal, shipping, total: subtotal + shipping };
}

function renderSummaries() {
    const fin = calculateFinancials();
    const data = globalDictionary[currentLang];
    const htmlContent = `
        <h4 style="margin-top:0; color:var(--cyber-amber); border-bottom:1px solid var(--border-blue); padding-bottom:10px;">${data.summaryTitle}</h4>
        <div style="display:flex; justify-content:space-between; margin-bottom:10px;"><span>${data.subtotal}</span><strong>${fin.subtotal.toFixed(3)} DT</strong></div>
        <div style="display:flex; justify-content:space-between; margin-bottom:10px;"><span>${data.shipping}</span><strong>${fin.shipping.toFixed(3)} DT</strong></div>
        <div style="display:flex; justify-content:space-between; margin-top:15px; padding-top:10px; border-top:1px dashed var(--border-blue); color:var(--cyber-green); font-size:16px; font-weight:bold;">
            <span>${data.netTotal}</span><strong>${fin.total.toFixed(3)} DT</strong>
        </div>
    `;
    if(document.getElementById("miniCartSummary1")) document.getElementById("miniCartSummary1").innerHTML = htmlContent;
    if(document.getElementById("miniCartSummary2")) document.getElementById("miniCartSummary2").innerHTML = htmlContent;
}

function updateTimeline(activeStepNumber) {
    const progressPercent = ((activeStepNumber - 1) / 4) * 100;
    document.getElementById("timelineProgress").style.width = progressPercent + "%";
    for (let i = 1; i <= 5; i++) {
        const stepNode = document.getElementById(`step${i}`);
        stepNode.classList.remove("active", "completed");
        if (i < activeStepNumber) stepNode.classList.add("completed");
        else if (i === activeStepNumber) stepNode.classList.add("active");
    }
}

function switchPanel(panelId) {
    document.querySelectorAll(".checkout-step-panel").forEach(p => p.classList.remove("active-panel"));
    document.getElementById(panelId).classList.add("active-panel");
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderValidationItems() {
    const container = document.getElementById("validationItemsContainer");
    if(!container) return;
    container.innerHTML = "";
    
    if(cart.length === 0) {
        container.innerHTML = `<p style="text-align:center; color:#64748b;">السلة فارغة حالياً، يرجى إضافة قطع من المتجر.</p>`;
        return;
    }

    cart.forEach(p => {
        const isUsed = p.condition === "used";
        const row = document.createElement("div");
        row.className = "cart-item-row";
        row.innerHTML = `
            <div style="display:flex; align-items:center; gap:15px;">
                <span style="font-size:24px;">${p.img}</span>
                <div>
                    <strong style="color:#fff; font-size:14px;">${p.name}</strong>
                    <div style="font-size:11px; ${isUsed ? 'color:var(--cyber-amber);' : 'color:var(--cyber-green);'}">${isUsed ? globalDictionary[currentLang].usedText : globalDictionary[currentLang].newText}</div>
                </div>
            </div>
            <div style="display:flex; align-items:center; gap:20px;">
                <div class="qty-control">
                    <button class="qty-btn" onclick="changeQty('${p.id}', 1)" ${isUsed ? 'disabled' : ''}>+</button>
                    <span class="qty-val">${p.qty}</span>
                    <button class="qty-btn" onclick="changeQty('${p.id}', -1)" ${isUsed ? 'disabled' : ''}>-</button>
                </div>
                <strong style="font-family:monospace; min-width:80px; text-align:end;">${(p.price * p.qty).toFixed(3)} DT</strong>
            </div>
        `;
        container.appendChild(row);
    });
}

function changeQty(id, change) {
    const product = cart.find(p => p.id === id);
    if (product && product.condition !== 'used') {
        product.qty += change;
        if (product.qty <= 0) cart = cart.filter(p => p.id !== id);
        localStorage.setItem("tuncar_cart", JSON.stringify(cart));
        renderValidationItems();
        renderSummaries();
    }
}

function nextToAddress() {
    if (cart.length === 0) return alert("السلة فارغة!");
    updateTimeline(2); switchPanel("panel-address");
}
function prevToValidation() { updateTimeline(1); switchPanel("panel-validation"); }

function renderSavedAddresses() {
    const grid = document.getElementById("savedAddressesGrid");
    if(!grid) return;
    grid.innerHTML = "";
    userSavedAddresses.forEach((addr, index) => {
        const card = document.createElement("div");
        card.className = `address-card ${index === 0 ? 'selected' : ''}`;
        card.setAttribute("onclick", `selectAddressCard('${addr.id}')`);
        card.id = `addrCard_${addr.id}`;
        card.innerHTML = `
            <input type="radio" name="selectedUserAddress" value="${addr.id}" ${index === 0 ? 'checked' : ''}>
            <div class="address-card-content">
                <strong style="color:var(--cyber-blue); display:block; margin-bottom:5px;">${addr.title}</strong>
                <span style="font-size:13px; color:#94a3b8;">${addr.fullAddress}</span>
            </div>
        `;
        grid.appendChild(card);
    });
}

function selectAddressCard(id) {
    document.querySelectorAll(".address-card").forEach(c => c.classList.remove("selected"));
    const targetCard = document.getElementById(`addrCard_${id}`);
    if(targetCard) {
        targetCard.classList.add("selected");
        targetCard.querySelector('input[type="radio"]').checked = true;
    }
}

function submitAddressSelection() {
    updateTimeline(3); switchPanel("panel-payment");
}
function prevToAddress() { updateTimeline(2); switchPanel("panel-address"); }
function nextToTracking() { updateTimeline(4); switchPanel("panel-tracking"); }

function togglePaymentGateway() {
    const method = document.getElementById("paymentMethod").value;
    document.getElementById("clickToPayGateway").style.display = method === "card" ? "block" : "none";
}

function handleFileChange(input, statusId) {
    const file = input.files[0];
    const statusLabel = document.getElementById(statusId);
    if (file) {
        statusLabel.innerText = `✔️ ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)`;
        if(input.id === "unboxingVideoInput") unboxingVideoUrl = URL.createObjectURL(file);
    }
}

function selectQuestionOption(questionKey, optionValue) {
    inspectionAnswers[questionKey] = optionValue;
    document.getElementById(`${questionKey}-yes`).classList.remove("selected");
    document.getElementById(`${questionKey}-no`).classList.remove("selected");
    document.getElementById(`${questionKey}-${optionValue}`).classList.add("selected");
}

function validateAndSubmitReport() {
    const imgFile = document.getElementById("unboxingImageInput").files[0];
    const vidFile = document.getElementById("unboxingVideoInput").files[0];
    if (!imgFile || !vidFile) return alert("الرجاء رفع صورة الطرد وفيديو فتح العلبة كدليل لتفعيل الضمان!");
    if (inspectionAnswers.q1 === null || inspectionAnswers.q2 === null) return alert("الرجاء الإجابة على أسئلة التحقق الفني!");

    updateTimeline(5); switchPanel("panel-completed");
    startWarrantyCountdown();
    if (unboxingVideoUrl) {
        const playback = document.getElementById("unboxingPlayback");
        playback.src = unboxingVideoUrl; playback.load();
    }
}

function startWarrantyCountdown() {
    if (countdownInterval) clearInterval(countdownInterval);
    const targetDate = new Date(); targetDate.setFullYear(targetDate.getFullYear() + 1);
    countdownInterval = setInterval(() => {
        const difference = targetDate - new Date();
        if (difference <= 0) return clearInterval(countdownInterval);
        
        document.getElementById('cd-days').innerText = String(Math.floor(difference / (1000 * 60 * 60 * 24))).padStart(2, '0');
        document.getElementById('cd-hours').innerText = String(Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
        document.getElementById('cd-mins').innerText = String(Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
        document.getElementById('cd-secs').innerText = String(Math.floor((difference % (1000 * 60)) / 1000)).padStart(2, '0');
    }, 1000);
}

function simulateAdminReview(state) {
    const badge = document.getElementById("adminStatusBadge");
    const icon = document.getElementById("badgeIcon");
    const text = document.getElementById("badgeText");
    badge.className = "verification-badge";

    if (state === 'pending') {
        badge.classList.add("badge-pending"); icon.innerText = "⏳"; text.innerText = globalDictionary[currentLang].statePending;
    } else if (state === 'verified') {
        badge.classList.add("badge-verified"); icon.innerText = "✅"; text.innerText = globalDictionary[currentLang].stateVerified;
    } else if (state === 'unclear') {
        badge.classList.add("badge-unclear"); icon.innerText = "⚠️"; text.innerText = globalDictionary[currentLang].stateUnclear;
    }
}

function resetWholeProcess() {
    cart = [];
    localStorage.removeItem("tuncar_cart");
    window.location.href = "index.html";
}
