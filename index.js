import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  getFirestore,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDGPo9LZNelY114oV_QILO7p6xV6f91Uss",
  authDomain: "my-own-project-47240.firebaseapp.com",
  projectId: "my-own-project-47240",
  storageBucket: "my-own-project-47240.firebasestorage.app",
  messagingSenderId: "1045587179020",
  appId: "1:1045587179020:web:dcd8ac9d9272e6dcb8e029",
  measurementId: "G-JFW9SQEHZB"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const productsRef = collection(db, "products");

const $ = (id) => document.getElementById(id);

const ui = {
  cards: $("card_data"),
  addBtn: $("dreamBtn"),
  clearBtn: $("clearBtn"),
  addForm: {
    title: $("title"),
    price: $("Price"),
    imageUrl: $("url"),
    category: $("category"),
    description: $("description")
  },
  modal: $("editModal"),
  modalClose: $("editClose"),
  modalCancel: $("editCancel"),
  modalSave: $("editSave"),
  editForm: {
    title: $("editTitle"),
    price: $("editPrice"),
    imageUrl: $("editUrl"),
    category: $("editCategory"),
    description: $("editDescription")
  }
};

const state = {
  byId: new Map(),
  editingId: null
};

function normalizeValues(values) {
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, (value || "").trim()])
  );
}

function hasEmptyValue(values) {
  return Object.values(values).some((value) => !value);
}

function getAddFormData() {
  return normalizeValues({
    title: ui.addForm.title.value,
    price: ui.addForm.price.value,
    imageUrl: ui.addForm.imageUrl.value,
    category: ui.addForm.category.value,
    description: ui.addForm.description.value
  });
}

function getEditFormData() {
  return normalizeValues({
    title: ui.editForm.title.value,
    price: ui.editForm.price.value,
    imageUrl: ui.editForm.imageUrl.value,
    category: ui.editForm.category.value,
    description: ui.editForm.description.value
  });
}

function clearAddForm() {
  ui.addForm.title.value = "";
  ui.addForm.price.value = "";
  ui.addForm.imageUrl.value = "";
  ui.addForm.category.value = "";
  ui.addForm.description.value = "";
}

function ensureCategoryOption(value) {
  if (!value) return;

  const exists = Array.from(ui.editForm.category.options).some(
    (option) => option.value === value
  );

  if (!exists) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    ui.editForm.category.appendChild(option);
  }
}

function fillEditForm(product) {
  ui.editForm.title.value = product.title || "";
  ui.editForm.price.value = product.price || "";
  ui.editForm.imageUrl.value = product.imageUrl || "";

  const category = product.category || "";
  ensureCategoryOption(category);
  ui.editForm.category.value = category;

  ui.editForm.description.value = product.description || "";
}

function openEditModal(productId) {
  const product = state.byId.get(productId);
  if (!product) return;

  state.editingId = productId;
  fillEditForm(product);
  ui.modal.classList.add("is-open");
  document.body.style.overflow = "hidden";
}

function closeEditModal() {
  state.editingId = null;
  ui.modal.classList.remove("is-open");
  document.body.style.overflow = "";
}

function renderProductCard(id, item) {
  return `
    <article class="wcard" data-id="${id}">
      <div class="wcard-img">
        <img src="${item.imageUrl || ""}" alt="${item.title || "Dream item"}" />
        <div class="wcard-img-overlay"></div>
        <div class="wcard-badge badge-pending">
          <div class="badge-dot"></div> Pending
        </div>
        <div class="wcard-heart loved"><i class="fa-solid fa-heart"></i></div>
        <div class="wcard-actions-overlay">
          <button class="oa-btn oa-edit" title="Edit"><i class="fa-solid fa-pen"></i></button>
          <button class="oa-btn oa-achieve" title="Mark Achieved"><i class="fa-solid fa-check"></i></button>
          <button class="oa-btn oa-del" title="Delete"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
      <div class="wcard-body">
        <div class="wcard-cat"><i class="fa-solid fa-plane-up"></i> ${item.category || "Wishlist"}</div>
        <div class="wcard-title">${item.title || "Untitled Dream"}</div>
        <div class="wcard-desc">${item.description || "No description added yet."}</div>
        <div class="wcard-footer">
          <div class="wcard-price-wrap">
            <div class="wcard-price-label">Budget</div>
            <div class="wcard-price">${item.price || "N/A"}</div>
          </div>
          <div class="wcard-progress-ring">
            <svg class="ring-svg" width="48" height="48" viewBox="0 0 48 48">
              <circle class="ring-bg" cx="24" cy="24" r="20"></circle>
              <circle class="ring-fill" cx="24" cy="24" r="20" stroke-dasharray="125.6" stroke-dashoffset="75"></circle>
            </svg>
            <div class="ring-text">40%<small>saved</small></div>
          </div>
        </div>
      </div>
    </article>
  `;
}

async function loadProducts() {
  const snapshot = await getDocs(productsRef);
  const cards = [];

  state.byId.clear();

  snapshot.forEach((productDoc) => {
    const id = productDoc.id;
    const data = productDoc.data();
    state.byId.set(id, data);
    cards.push(renderProductCard(id, data));
  });

  ui.cards.innerHTML = cards.join("");
}

async function handleCreate() {
  const payload = getAddFormData();

  if (hasEmptyValue(payload)) {
    alert("Please fill all fields first!");
    return;
  }

  try {
    await addDoc(productsRef, payload);
    clearAddForm();
    await loadProducts();
    alert("Data submitted successfully.");
  } catch (error) {
    console.error("Create error:", error);
    alert("Unable to save right now. Please try again.");
  }
}

async function handleUpdate() {
  if (!state.editingId) return;

  const payload = getEditFormData();

  if (hasEmptyValue(payload)) {
    alert("Please fill all fields first!");
    return;
  }

  try {
    await updateDoc(doc(db, "products", state.editingId), payload);
    closeEditModal();
    await loadProducts();
    alert("Product updated successfully.");
  } catch (error) {
    console.error("Update error:", error);
    alert("Unable to update right now. Please try again.");
  }
}

function wireEvents() {
  ui.addBtn.addEventListener("click", handleCreate);
  ui.clearBtn.addEventListener("click", clearAddForm);
  ui.modalSave.addEventListener("click", handleUpdate);
  ui.modalClose.addEventListener("click", closeEditModal);
  ui.modalCancel.addEventListener("click", closeEditModal);

  ui.cards.addEventListener("click", (event) => {
    if (!event.target.closest(".oa-edit")) return;

    const card = event.target.closest(".wcard");
    if (!card) return;

    const productId = card.getAttribute("data-id");
    if (!productId) return;

    openEditModal(productId);
  });

  ui.modal.addEventListener("click", (event) => {
    if (event.target === ui.modal) {
      closeEditModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && ui.modal.classList.contains("is-open")) {
      closeEditModal();
    }
  });
}

async function init() {
  wireEvents();
  await loadProducts();
}

init();
