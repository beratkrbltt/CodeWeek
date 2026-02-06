document.addEventListener("DOMContentLoaded", () => {
    const toggleLink = document.getElementById("toggle-auth");
    const title = document.getElementById("register-title");
    const subtitle = document.getElementById("register-subtitle");
    const submitBtn = document.getElementById("submit-btn");
    const toggleText = document.getElementById("toggle-text");
    const registerOnlyFields = document.querySelectorAll(".register-only");

    window.isLoginMode = false;
    function updateForm() {
        if (window.isLoginMode) {
            // LOGIN MODE
            title.textContent = "Welcome Back";
            subtitle.textContent = "Log in to continue your coding journey";
            submitBtn.textContent = "Login";
            toggleText.textContent = "Don’t have an account?";
            toggleLink.textContent = "Create account";

            registerOnlyFields.forEach(el => el.classList.add("hidden"));
        } else {
            // REGISTER MODE
            title.textContent = "Create Account";
            subtitle.textContent = "Start tracking your coding journey today";
            submitBtn.textContent = "Create Account";
            toggleText.textContent = "Already have an account?";
            toggleLink.textContent = "Log in";

            registerOnlyFields.forEach(el => el.classList.remove("hidden"));
        }
    }
    updateForm();
    toggleLink.addEventListener("click", (e) => {
        e.preventDefault();
        window.isLoginMode = !window.isLoginMode;
        updateForm();
    });
});
