// ------------------------------------------------------------
// Toast Helper
// ------------------------------------------------------------
function showToast(text, type = "info") {
    const colors = {
        success: "linear-gradient(to right, #00b09b, #96c93d)",
        error: "linear-gradient(to right, #ff416c, #ff4b2b)",
        warning: "linear-gradient(to right, #f7971e, #ffd200)",
        info: "linear-gradient(to right, #2193b0, #6dd5ed)"
    };

    Toastify({
        text,
        duration: 3000,
        gravity: "top",
        position: "right",
        close: true,
        backgroundColor: colors[type] || colors.info,
    }).showToast();
}

// ------------------------------------------------------------
// JSON Server Endpoint
// ------------------------------------------------------------
const API_URL = "http://localhost:3000/users";

// ------------------------------------------------------------
// User Class
// ------------------------------------------------------------
class User {
    constructor(name, email, password) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.memberSince = new Date().toISOString().split("T")[0];
    }

    async save() {
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(this)
            });
            const data = await response.json();
            localStorage.setItem("user", JSON.stringify(data));

            showToast("User registered successfully!", "success");
        } catch (error) {
            console.error(error);
            showToast("Failed to register user.", "error");
        }
    }
}


// ------------------------------------------------------------
// Form
// ------------------------------------------------------------
const form = document.getElementById("auth-form");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("fullname")?.value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const passwordConfirm = document.getElementById("confirm-password")?.value.trim();
    if (!email || !password) {
        showToast("Email and password are required!", "warning");
        return;
    }

    // ------------------------------------------------------------
    // LOGIN
    // ------------------------------------------------------------
    if (window.isLoginMode) {
        try {
            const res = await fetch(`${API_URL}?email=${encodeURIComponent(email)}`);
            const users = await res.json();

            if (users.length === 0) {
                showToast("No user found with this email!", "error");
                return;
            }

            const user = users[0];

            if (user.password !== password) {
                showToast("Incorrect password!", "error");
                return;
            }

            showToast(`Welcome back, ${user.name}!`, "success");

            localStorage.setItem("user", JSON.stringify(user));

            setTimeout(() => {
                window.location.href = "/userPage";
            }, 1500);

        } catch (err) {
            console.error(err);
            showToast("Login failed!", "error");
        }
    }

    // ------------------------------------------------------------
    // REGISTER
    // ------------------------------------------------------------
    else {
        if (!name) {
            showToast("Name is required!", "warning");
            return;
        }

        if (password !== passwordConfirm) {
            showToast("Passwords do not match!", "error");
            return;
        }

        try {
            const res = await fetch(`${API_URL}?email=${encodeURIComponent(email)}`);
            const existingUsers = await res.json();

            if (existingUsers.length > 0) {
                showToast("This email is already registered!", "info");
                return;
            }

            const newUser = new User(name, email, password);
            await newUser.save();
            form.reset();

        } catch (err) {
            console.error(err);
            showToast("Registration failed!", "error");
        }
    }
});
