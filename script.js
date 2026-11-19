// =====================================================
//   Contact Management System — script.js
// =====================================================

// ----- State -----
let contacts  = JSON.parse(localStorage.getItem("contacts_v1")) || [];
let editingId = null;   // null = adding new | number = editing existing

// ----- DOM refs -----
const nameEl    = () => document.getElementById("name");
const phoneEl   = () => document.getElementById("phone");
const emailEl   = () => document.getElementById("email");
const addressEl = () => document.getElementById("address");
const errorEl   = () => document.getElementById("errorMsg");
const addBtn    = document.getElementById("addBtn");
const formHead  = document.getElementById("formHeading");
const list      = document.getElementById("contactList");
const badge     = document.getElementById("badge");

// ----- Save to localStorage -----
function saveData() {
  localStorage.setItem("contacts_v1", JSON.stringify(contacts));
}

// ----- HTML escape (XSS protection) -----
function esc(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ----- Toast notification -----
let toastTimer = null;
function showToast(msg, type) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className   = "toast " + type + " show";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 3000);
}

// ----- Validation -----
function validate(name, phone, email, address) {
  if (!name)    { setError("Full Name is required.");     return false; }
  if (!phone)   { setError("Phone Number is required.");  return false; }
  if (!email)   { setError("Email Address is required."); return false; }
  if (!address) { setError("Home Address is required.");  return false; }

  if (!/^[0-9+\-()\s]{7,15}$/.test(phone)) {
    setError("Enter a valid phone number (7-15 digits).");
    return false;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setError("Enter a valid email address.");
    return false;
  }

  setError("");
  return true;
}

function setError(msg) {
  errorEl().textContent = msg;
}

// ----- Clear form -----
function clearForm() {
  nameEl().value    = "";
  phoneEl().value   = "";
  emailEl().value   = "";
  addressEl().value = "";
  setError("");
}

// ----- Reset to Add mode -----
function resetToAddMode() {
  editingId = null;
  addBtn.textContent = "Add Contact";
  addBtn.classList.remove("update-mode");
  formHead.textContent = "Add New Contact";
}

// ----- Handle Add / Update -----
function handleSubmit() {
  const name    = nameEl().value.trim();
  const phone   = phoneEl().value.trim();
  const email   = emailEl().value.trim();
  const address = addressEl().value.trim();

  if (!validate(name, phone, email, address)) return;

  if (editingId !== null) {
    // Update existing contact
    const idx = contacts.findIndex(c => c.id === editingId);
    if (idx !== -1) {
      contacts[idx] = { id: editingId, name, phone, email, address };
    }
    showToast("Contact updated successfully!", "updated");
    resetToAddMode();
  } else {
    // Add new contact
    contacts.push({ id: Date.now(), name, phone, email, address });
    showToast("Contact added successfully!", "added");
  }

  saveData();
  clearForm();
  renderAll();
}

// ----- Edit a contact -----
function editContact(id) {
  const c = contacts.find(c => c.id === id);
  if (!c) return;

  nameEl().value    = c.name;
  phoneEl().value   = c.phone;
  emailEl().value   = c.email;
  addressEl().value = c.address;

  editingId = id;
  addBtn.textContent = "Update Contact";
  addBtn.classList.add("update-mode");
  formHead.textContent = "Edit Contact";
  setError("");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ----- Delete a contact -----
function deleteContact(id) {
  if (!confirm("Delete this contact? This cannot be undone.")) return;

  contacts = contacts.filter(c => c.id !== id);

  if (editingId === id) {
    clearForm();
    resetToAddMode();
  }

  saveData();
  showToast("Contact deleted.", "deleted");
  renderAll();
}

// ----- Render all cards -----
function renderAll() {
  badge.textContent = contacts.length;

  if (contacts.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <p>No contacts yet. Add your first contact above!</p>
      </div>`;
    return;
  }

  list.innerHTML = contacts.map(c => `
    <div class="contact-card" id="card-${c.id}">

      <div class="card-name">${esc(c.name)}</div>

      <div class="card-info">
        <div><span class="lbl">Phone:</span> ${esc(c.phone)}</div>
        <div><span class="lbl">Email:</span> ${esc(c.email)}</div>
        <div><span class="lbl">Address:</span> ${esc(c.address)}</div>
      </div>

      <hr class="card-divider" />

      <div class="card-actions">
        <button class="btn-edit"   onclick="editContact(${c.id})">Edit</button>
        <button class="btn-delete" onclick="deleteContact(${c.id})">Delete</button>
      </div>

    </div>
  `).join("");
}

// ----- Load on page start -----
renderAll();
