export function getCurrentUser() {
    const userJson = localStorage.getItem("user");
    return userJson ? JSON.parse(userJson) : null;
}

export function logout() {
    localStorage.removeItem("user");
    window.location.href = "/register";
}


