// ---------- 1. Dropdown menu ----------
const dropdownBtn = document.getElementById("dropdownBtn");
const dropdownMenu = document.getElementById("dropdownMenu");

dropdownBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  dropdownMenu.classList.toggle("show");
});

// Close dropdown when clicking anywhere else
document.addEventListener("click", () => {
  dropdownMenu.classList.remove("show");
});

// ---------- 2. Modal ----------
const openModalBtn = document.getElementById("openModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const modalOverlay = document.getElementById("modalOverlay");

openModalBtn.addEventListener("click", () => modalOverlay.classList.add("show"));
closeModalBtn.addEventListener("click", () => modalOverlay.classList.remove("show"));

// Close modal when clicking the dark overlay (but not the modal box itself)
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) modalOverlay.classList.remove("show");
});

// Close modal with Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") modalOverlay.classList.remove("show");
});

// ---------- 3. Form validation ----------
const form = document.getElementById("signupForm");
const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const usernameError = document.getElementById("usernameError");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const formSuccess = document.getElementById("formSuccess");

function validateUsername() {
  const value = usernameInput.value.trim();
  if (value.length < 3) {
    setError(usernameInput, usernameError, "Username must be at least 3 characters.");
    return false;
  }
  clearError(usernameInput, usernameError);
  return true;
}

function validateEmail() {
  const value = emailInput.value.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(value)) {
    setError(emailInput, emailError, "Please enter a valid email address.");
    return false;
  }
  clearError(emailInput, emailError);
  return true;
}

function validatePassword() {
  const value = passwordInput.value;
  if (value.length < 8) {
    setError(passwordInput, passwordError, "Password must be at least 8 characters.");
    return false;
  }
  clearError(passwordInput, passwordError);
  return true;
}

function setError(input, errorEl, message) {
  input.classList.add("invalid");
  errorEl.textContent = message;
}

function clearError(input, errorEl) {
  input.classList.remove("invalid");
  errorEl.textContent = "";
}

// Live validation as the user types
usernameInput.addEventListener("input", validateUsername);
emailInput.addEventListener("input", validateEmail);
passwordInput.addEventListener("input", validatePassword);

form.addEventListener("submit", (e) => {
  e.preventDefault();
  formSuccess.textContent = "";

  const isUsernameValid = validateUsername();
  const isEmailValid = validateEmail();
  const isPasswordValid = validatePassword();

  if (isUsernameValid && isEmailValid && isPasswordValid) {
    formSuccess.textContent = "Account created! (This is a front-end demo only.)";
    form.reset();
  }
});
