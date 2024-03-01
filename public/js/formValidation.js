const form = document.querySelector("form");
const emailInput = document.querySelector("input[type='email']");
const emailError = document.querySelector(".email-error");
const passwordInput = document.querySelector(".password-input");
const passwordError = document.querySelector(".password-error");
const confirmPasswordInput = document.querySelector(".confirm-password-input");
const confirmPasswordError = document.querySelector(".confirm-password-error");

const showError = (inputField, errorField) => {
    errorField.style.marginTop = "5px";
    if (inputField.validity.valueMissing) {
        errorField.textContent = "This field is required";
    } else if (inputField.validity.typeMismatch) {
        if (inputField.getAttribute("type") === "email") {
            errorField.textContent = "Please provide a valid email address";
        }
    } else if (
        inputField.classList.contains("password-input") &&
        inputField.validity.tooShort
    ) {
        errorField.textContent = `Password should be at least ${passwordInput.minLength} characters`;
    } else if (inputField.classList.contains("confirm-password-input")) {
        errorField.textContent = "Passwords did not match";
    }
};

emailInput.addEventListener("input", () => {
    if (emailInput.validity.valid) {
        emailError.textContent = "";
        emailError.style.marginTop = "0";
        emailInput.classList.remove("error");
    } else {
        emailInput.classList.add("error");
        showError(emailInput, emailError);
    }
});

passwordInput.addEventListener("input", () => {
    if (passwordInput.validity.valid) {
        passwordError.textContent = "";
        passwordError.style.marginTop = "0";
        passwordInput.classList.remove("error");
    } else {
        passwordInput.classList.add("error");
        showError(passwordInput, passwordError);
    }
});

if (confirmPasswordInput !== null) {
    confirmPasswordInput.addEventListener("input", () => {
        if (confirmPasswordInput.value === passwordInput.value) {
            confirmPasswordError.textContent = "";
            confirmPasswordError.style.marginTop = "0";
            confirmPasswordInput.classList.remove("error");
        } else {
            confirmPasswordInput.classList.add("error");
            showError(confirmPasswordInput, confirmPasswordError);
        }
    });
}

form.addEventListener("submit", (event) => {
    if (!emailInput.validity.valid) {
        emailInput.classList.add("error");
        showError(emailInput, emailError);
        event.preventDefault();
    }
    if (!passwordInput.validity.valid) {
        passwordInput.classList.add("error");
        showError(passwordInput, passwordError);
        event.preventDefault();
    }
    if (
        confirmPasswordInput !== null &&
        (confirmPasswordInput.value === "" ||
            confirmPasswordInput.value !== passwordInput.value)
    ) {
        confirmPasswordInput.classList.add("error");
        showError(confirmPasswordInput, confirmPasswordError);
        event.preventDefault();
    }
});
