
"use strict";

// =====================================
// 1. HTML ELEMENTS
// =====================================

const addItemBtn = document.getElementById("addItemBtn");
const inventoryAddBtn = document.getElementById("inventoryAddBtn");

const itemModal = document.getElementById("itemModal");
const itemForm = document.getElementById("itemForm");
const itemsTable = document.getElementById("itemsTable");
const inventoryTable = document.getElementById("inventoryTable");

const closeModalBtn = document.getElementById("closeModal");
const cancelModalBtn = document.getElementById("cancelModal");
const formError = document.getElementById("formError");

const inventorySearch = document.getElementById("inventorySearch");
const categoryFilter = document.getElementById("categoryFilter");
const statusFilter = document.getElementById("statusFilter");
const sortInventory = document.getElementById("sortInventory");

const inventoryCount = document.getElementById("inventoryCount");
const inventoryEmptyMessage =
    document.getElementById("inventoryEmptyMessage");

let editingItemId = null;

// =====================================
// 2. LOAD SAVED ITEMS
// =====================================

let items = [];

try {
    const savedItems = localStorage.getItem("expiryAlertItems");
    const parsedItems = savedItems ? JSON.parse(savedItems) : [];

    if (Array.isArray(parsedItems)) {
        items = parsedItems.filter(item =>
            item &&
            typeof item.name === "string" &&
            typeof item.expiry === "string" &&
            typeof item.category === "string"
        );
    }
} catch (error) {
    console.error("Unable to load saved items:", error);
}

// =====================================
// 3. SAVE ITEMS
// =====================================

function saveItems() {
    try {
        localStorage.setItem("expiryAlertItems", JSON.stringify(items));
        return true;
    } catch (error) {
        console.error("Unable to save items:", error);
        alert("Items save nahi ho paaye. Browser storage check karo.");
        return false;
    }
}

// =====================================
// 4. PAGE NAVIGATION
// =====================================

const pages = {
    dashboard: document.getElementById("dashboardPage"),
    inventory: document.getElementById("inventoryPage"),
    analytics: document.getElementById("analyticsPage"),
    waste: document.getElementById("wastePage")
};

const navLinks = {
    dashboard: document.getElementById("dashboardNav"),
    inventory: document.getElementById("inventoryNav"),
    analytics: document.getElementById("analyticsNav"),
    waste: document.getElementById("wasteNav")
};

function showPage(pageName) {
    if (!pages[pageName]) return;

    Object.entries(pages).forEach(([name, page]) => {
        page.classList.toggle("hidden", name !== pageName);
    });

    Object.entries(navLinks).forEach(([name, link]) => {
        link.classList.toggle("active", name === pageName);
    });

    if (pageName === "dashboard") {
        renderDashboard();
    }

    if (pageName === "inventory") {
        renderInventory();
    }

    if (pageName === "analytics") {
        renderAnalytics();
    }

    if (pageName === "waste") {
        renderWaste();
    }
}

Object.entries(navLinks).forEach(([pageName, link]) => {
    link.addEventListener("click", function (event) {
        event.preventDefault();
        showPage(pageName);
    });
});

document.getElementById("viewInventoryBtn").addEventListener(
    "click",
    () => showPage("inventory")
);

// =====================================
// 5. ADD / EDIT ITEM MODAL
// =====================================

function openModal() {
    itemForm.reset();
    editingItemId = null;

    formError.textContent = "";
    formError.classList.add("hidden");

    document.getElementById("modalTitle").textContent = "Add New Item";

    document.getElementById("modalDescription").textContent =
        "Enter your item's details below.";

    document.getElementById("saveItemBtn").textContent = "Save Item";

    itemModal.classList.remove("hidden");
    document.getElementById("itemName").focus();
}

function closeModal() {
    itemModal.classList.add("hidden");
    itemForm.reset();

    formError.textContent = "";
    formError.classList.add("hidden");
}

addItemBtn.addEventListener("click", openModal);
inventoryAddBtn.addEventListener("click", openModal);
closeModalBtn.addEventListener("click", closeModal);
cancelModalBtn.addEventListener("click", closeModal);

itemModal.addEventListener("click", function (event) {
    if (event.target === itemModal) {
        closeModal();
    }
});

document.addEventListener("keydown", function (event) {
    if (
        event.key === "Escape" &&
        !itemModal.classList.contains("hidden")
    ) {
        closeModal();
    }
});

// =====================================
// 6. DATE VALIDATION AND HELPERS
// =====================================

function isValidDate(dateString) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString || "");

    if (!match) return false;

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    const date = new Date(Date.UTC(year, month - 1, day));

    return (
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day
    );
}

function getExpiryStatus(expiryDate) {
    if (!isValidDate(expiryDate)) {
        return { label: "Invalid Date", className: "expired" };
    }

    const today = new Date();

    const todayUTC = Date.UTC(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    );

    const [year, month, day] = expiryDate.split("-").map(Number);
    const expiryUTC = Date.UTC(year, month - 1, day);

    const daysLeft = Math.round((expiryUTC - todayUTC) / 86400000);

    if (daysLeft < 0) {
        return { label: "Expired", className: "expired" };
    }

    if (daysLeft <= 7) {
        return { label: "Expiring Soon", className: "soon" };
    }

    return { label: "Not Soon", className: "safe" };
}

function formatDate(dateString) {
    if (!isValidDate(dateString)) return "Invalid date";

    const [year, month, day] = dateString.split("-").map(Number);

    return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function getActiveItems() {
    return items.filter(item => item.status !== "wasted");
}

function getWastedItems() {
    return items.filter(item => item.status === "wasted");
}

// =====================================
// 7. DASHBOARD COUNTERS
// =====================================

function updateDashboard() {
    const activeItems = getActiveItems();

    const expired = activeItems.filter(
        item => getExpiryStatus(item.expiry).label === "Expired"
    ).length;

    const expiring = activeItems.filter(
        item => getExpiryStatus(item.expiry).label === "Expiring Soon"
    ).length;

    const wasted = getWastedItems().length;

    document.getElementById("totalItems").textContent = activeItems.length;
    document.getElementById("expiringItems").textContent = expiring;
    document.getElementById("expiredItems").textContent = expired;
    document.getElementById("wastedItems").textContent = wasted;
}

// =====================================
// 8. DASHBOARD TABLE
// =====================================

function renderDashboard() {
    const activeItems = getActiveItems().sort(
        (a, b) => a.expiry.localeCompare(b.expiry)
    );

    if (activeItems.length === 0) {
        itemsTable.innerHTML = `
            <tr>
                <td colspan="4" class="empty-message">
                    No items yet. Add your first item!
                </td>
            </tr>
        `;
    } else {
        itemsTable.innerHTML = activeItems.slice(0, 8).map(item => {
            const status = getExpiryStatus(item.expiry);

            return `
                <tr>
                    <td><strong>${escapeHTML(item.name)}</strong></td>
                    <td>${escapeHTML(item.category)}</td>
                    <td>${formatDate(item.expiry)}</td>
                    <td>
                        <span class="status-badge ${status.className}">
                            ${status.label}
                        </span>
                    </td>
                </tr>
            `;
        }).join("");
    }

    updateDashboard();
}

// =====================================
// 9. INVENTORY SEARCH, FILTER AND SORT
// =====================================

function renderInventory() {
    const searchText = inventorySearch.value.trim().toLowerCase();
    const selectedCategory = categoryFilter.value;
    const selectedStatus = statusFilter.value;
    const sortMode = sortInventory.value;

    let filteredItems = getActiveItems().filter(item => {
        const matchesName = item.name.toLowerCase().includes(searchText);

        const matchesCategory =
            selectedCategory === "all" ||
            item.category === selectedCategory;

        const matchesStatus =
            selectedStatus === "all" ||
            getExpiryStatus(item.expiry).label === selectedStatus;

        return matchesName && matchesCategory && matchesStatus;
    });

    filteredItems.sort((a, b) => {
        switch (sortMode) {
            case "expiryDesc":
                return b.expiry.localeCompare(a.expiry);
            case "nameAsc":
                return a.name.localeCompare(b.name);
            case "nameDesc":
                return b.name.localeCompare(a.name);
            case "quantityDesc":
                return Number(b.quantity || 0) - Number(a.quantity || 0);
            case "quantityAsc":
                return Number(a.quantity || 0) - Number(b.quantity || 0);
            case "expiryAsc":
            default:
                return a.expiry.localeCompare(b.expiry);
        }
    });

    inventoryCount.textContent =
        `${filteredItems.length} ${filteredItems.length === 1 ? "item" : "items"}`;

    if (filteredItems.length === 0) {
        inventoryTable.innerHTML = `
            <tr>
                <td colspan="6" class="empty-message">
                    No matching items found.
                </td>
            </tr>
        `;

        inventoryEmptyMessage.classList.add("hidden");
        return;
    }

    inventoryEmptyMessage.classList.add("hidden");

    inventoryTable.innerHTML = filteredItems.map(item => {
        const status = getExpiryStatus(item.expiry);

        return `
            <tr>
                <td><strong>${escapeHTML(item.name)}</strong></td>
                <td>${escapeHTML(item.category)}</td>
                <td>${Number(item.quantity) || 0}</td>
                <td>${formatDate(item.expiry)}</td>
                <td>
                    <span class="status-badge ${status.className}">
                        ${status.label}
                    </span>
                </td>
                <td>
                    <button type="button"
                        class="inventory-action"
                        data-action="edit"
                        data-id="${escapeHTML(item.id)}">Edit</button>

                    <button type="button"
                        class="inventory-action"
                        data-action="waste"
                        data-id="${escapeHTML(item.id)}">Mark as Wasted</button>

                    <button type="button"
                        class="inventory-action delete-action"
                        data-action="delete"
                        data-id="${escapeHTML(item.id)}">Delete</button>
                </td>
            </tr>
        `;
    }).join("");
}

inventorySearch.addEventListener("input", renderInventory);
categoryFilter.addEventListener("change", renderInventory);
statusFilter.addEventListener("change", renderInventory);
sortInventory.addEventListener("change", renderInventory);

// =====================================
// 10. ANALYTICS PAGE
// =====================================

function renderAnalytics() {
    const activeItems = getActiveItems();

    const expired = activeItems.filter(
        item => getExpiryStatus(item.expiry).label === "Expired"
    ).length;

    const expiring = activeItems.filter(
        item => getExpiryStatus(item.expiry).label === "Expiring Soon"
    ).length;

    const categories = {};

    activeItems.forEach(item => {
        categories[item.category] = (categories[item.category] || 0) + 1;
    });

    document.getElementById("analyticsTotal").textContent =
        activeItems.length;

    document.getElementById("analyticsExpired").textContent = expired;
    document.getElementById("analyticsExpiring").textContent = expiring;

    document.getElementById("analyticsCategories").textContent =
        Object.keys(categories).length;

    const categoryBreakdown = document.getElementById("categoryBreakdown");

    if (activeItems.length === 0) {
        categoryBreakdown.innerHTML =
            '<p class="empty-message">No inventory data available yet.</p>';
    } else {
        categoryBreakdown.innerHTML = Object.entries(categories)
            .sort((a, b) => b[1] - a[1])
            .map(([category, count]) => {
                const percentage = (count / activeItems.length) * 100;

                return `
                    <div class="analytics-bar-row">
                        <div class="analytics-bar-label">
                            <span>${escapeHTML(category)}</span>
                            <strong>${count}</strong>
                        </div>
                        <div class="analytics-bar-track">
                            <div class="analytics-bar-fill"
                                style="width: ${percentage}%"></div>
                        </div>
                    </div>
                `;
            }).join("");
    }

    const safeCount = activeItems.filter(
        item => getExpiryStatus(item.expiry).label === "Not Soon"
    ).length;

    const expiryBreakdown = document.getElementById("expiryBreakdown");

    expiryBreakdown.innerHTML = `
        <div class="analytics-status-row">
            <span class="status-badge expired">Expired</span>
            <strong>${expired}</strong>
        </div>
        <div class="analytics-status-row">
            <span class="status-badge soon">Expiring Soon</span>
            <strong>${expiring}</strong>
        </div>
        <div class="analytics-status-row">
            <span class="status-badge safe">Not Soon</span>
            <strong>${safeCount}</strong>
        </div>
    `;
}

// =====================================
// 11. WASTE TRACKER
// =====================================

function renderWaste() {
    const wastedItems = getWastedItems();

    const totalWastedQuantity = wastedItems.reduce(
        (total, item) => total + (Number(item.quantity) || 0),
        0
    );

    document.getElementById("wasteTotal").textContent =
        wastedItems.length;

    document.getElementById("wasteQuantity").textContent =
        totalWastedQuantity;

    const wasteTable = document.getElementById("wasteTable");
    const wasteEmptyMessage =
        document.getElementById("wasteEmptyMessage");

    if (wastedItems.length === 0) {
        wasteTable.innerHTML = "";
        wasteEmptyMessage.classList.remove("hidden");
        return;
    }

    wasteEmptyMessage.classList.add("hidden");

    wasteTable.innerHTML = wastedItems.map(item => `
        <tr>
            <td><strong>${escapeHTML(item.name)}</strong></td>
            <td>${escapeHTML(item.category)}</td>
            <td>${Number(item.quantity) || 0}</td>
            <td>${formatDate(item.expiry)}</td>
            <td>
                <span class="status-badge expired">Wasted</span>
                <button type="button"
                    class="inventory-action"
                    data-waste-action="restore"
                    data-id="${escapeHTML(item.id)}">Restore</button>
            </td>
        </tr>
    `).join("");
}

// =====================================
// 12. ADD / UPDATE ITEM FORM
// =====================================

itemForm.addEventListener("submit", function (event) {
    event.preventDefault();

    formError.textContent = "";
    formError.classList.add("hidden");

    const name = document.getElementById("itemName").value.trim();
    const category = document.getElementById("itemCategory").value;
    const quantity = Number(document.getElementById("itemQuantity").value);
    const expiry = document.getElementById("itemExpiry").value;
    const notes = document.getElementById("itemNotes").value.trim();

    if (!name) {
        showError("Please enter an item name.");
        return;
    }

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100000) {
        showError("Enter a valid quantity between 1 and 100000.");
        return;
    }

    if (!isValidDate(expiry)) {
        showError("Please select a valid expiry date.");
        return;
    }

    // UPDATE EXISTING ITEM
    if (editingItemId !== null) {
        const index = items.findIndex(
            item => String(item.id) === String(editingItemId)
        );

        if (index === -1) {
            showError("Item nahi mila. Inventory refresh karke try karo.");
            return;
        }

        const previousItem = items[index];

        items[index] = {
            ...previousItem,
            name,
            category,
            quantity,
            expiry,
            notes
        };

        if (!saveItems()) {
            items[index] = previousItem;
            return;
        }

        editingItemId = null;

        renderDashboard();
        renderInventory();
        renderAnalytics();
        renderWaste();
        closeModal();

        alert("Item updated successfully!");
        return;
    }

    // ADD NEW ITEM
    const newItem = {
        id: Date.now().toString(),
        name,
        category,
        quantity,
        expiry,
        notes,
        status: "active",
        addedAt: new Date().toISOString()
    };

    items.push(newItem);

    if (!saveItems()) {
        items.pop();
        return;
    }

    renderDashboard();
    renderInventory();
    renderAnalytics();
    renderWaste();
    closeModal();

    alert("Item added successfully!");
});

function showError(message) {
    formError.textContent = message;
    formError.classList.remove("hidden");
}

// =====================================
// 13. EDIT, DELETE AND MARK AS WASTED
// =====================================

function editItem(id) {
    const item = items.find(
        entry => String(entry.id) === String(id)
    );

    if (!item) {
        alert("Item nahi mila.");
        return;
    }

    editingItemId = item.id;

    document.getElementById("modalTitle").textContent = "Edit Item";

    document.getElementById("modalDescription").textContent =
        "Update your item's details below.";

    document.getElementById("saveItemBtn").textContent = "Update Item";

    document.getElementById("itemName").value = item.name;
    document.getElementById("itemCategory").value = item.category;
    document.getElementById("itemQuantity").value = item.quantity;
    document.getElementById("itemExpiry").value = item.expiry;
    document.getElementById("itemNotes").value = item.notes || "";

    formError.textContent = "";
    formError.classList.add("hidden");

    itemModal.classList.remove("hidden");
    document.getElementById("itemName").focus();
}

function markItemAsWasted(id) {
    const item = items.find(
        entry => String(entry.id) === String(id)
    );

    if (!item) {
        alert("Item nahi mila.");
        return;
    }

    const confirmed = confirm(
        `Kya "${item.name}" ko wasted mark karna hai?`
    );

    if (!confirmed) return;

    const previousStatus = item.status;
    item.status = "wasted";
    item.wastedAt = new Date().toISOString();

    if (!saveItems()) {
        item.status = previousStatus;

        delete item.wastedAt;
        return;
    }

    renderDashboard();
    renderInventory();
    renderAnalytics();
    renderWaste();

    alert("Item Waste Tracker mein add ho gaya!");
}

function restoreWastedItem(id) {
    const item = items.find(
        entry => String(entry.id) === String(id)
    );

    if (!item || item.status !== "wasted") return;

    const confirmed = confirm(
        `Kya "${item.name}" ko inventory mein restore karna hai?`
    );

    if (!confirmed) return;

    const previousStatus = item.status;
    const previousWastedAt = item.wastedAt;

    item.status = "active";
    delete item.wastedAt;

    if (!saveItems()) {
        item.status = previousStatus;

        if (previousWastedAt !== undefined) {
            item.wastedAt = previousWastedAt;
        }

        return;
    }

    renderDashboard();
    renderInventory();
    renderAnalytics();
    renderWaste();

    alert("Item inventory mein restore ho gaya!");
}

inventoryTable.addEventListener("click", function (event) {
    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const id = button.dataset.id;
    const action = button.dataset.action;

    if (action === "edit") {
        editItem(id);
        return;
    }

    if (action === "waste") {
        markItemAsWasted(id);
        return;
    }

    if (action === "delete") {
        const confirmed = confirm(
            "Kya tum is item ko permanently delete karna chahte ho?"
        );

        if (!confirmed) return;

        const previousItems = items;

        items = items.filter(
            item => String(item.id) !== String(id)
        );

        if (!saveItems()) {
            items = previousItems;
            return;
        }

        renderDashboard();
        renderInventory();
        renderAnalytics();
        renderWaste();
    }
});

// Waste History: Restore button

document.getElementById("wasteTable").addEventListener(
    "click",
    function (event) {
        const button = event.target.closest(
            'button[data-waste-action="restore"]'
        );

        if (!button) return;

        restoreWastedItem(button.dataset.id);
    }
);

// =====================================
// 14. INITIAL PAGE LOAD
// =====================================

renderDashboard();
renderInventory();
renderAnalytics();
renderWaste();
showPage("dashboard");
