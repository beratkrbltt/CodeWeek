import { getCurrentUser, logout } from "../auth.js";
document.addEventListener("DOMContentLoaded", init);

async function init() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = "/register";
        return;
    }
    displayUserInfo(user);
    setupLogout();
    renderDays(currentStartDate);
}

/* ---------- USER UI ---------- */
function displayUserInfo(user) {
    const nameSpan = document.getElementById("nameSpan");
    const userName = document.getElementById("userName");
    const userMail = document.getElementById("userMail");
    const memberSinceEl = document.querySelector(".member-since time");

    if (nameSpan) nameSpan.textContent = user.name;
    if (userName) userName.textContent = user.name;
    if (userMail) userMail.textContent = user.email;

    if (memberSinceEl && user.memberSince) {
        const date = new Date(user.memberSince);
        memberSinceEl.textContent = date.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric"
        });
        memberSinceEl.setAttribute("datetime", date.toISOString().split("T")[0]);
    }
}

function setupLogout() {
    const outBtn = document.getElementById("outBtn");
    if (!outBtn) return;
    outBtn.addEventListener("click", logout);
}

/* ---------- CALENDAR ---------- */
const daysContainer = document.getElementById("daysContainer");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const selectedDateDisplay = document.getElementById("selectedDateDisplay");
const todoDate = document.getElementById("todoDate");

let currentStartDate = new Date();
let selectedDate = new Date();

/* ---------- HELPERS ---------- */
function formatDate(date) {
    return date.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

/* ---------- RENDER DAYS ---------- */
function renderDays(startDate) {
    daysContainer.innerHTML = "";

    for (let i = 0; i < 7; i++) {
        const dayDate = new Date(startDate);
        dayDate.setDate(startDate.getDate() + i);

        const li = document.createElement("li");
        li.className = "day-card";
        li.setAttribute("role", "listitem");
        li.innerHTML = `
            <div>${dayDate.toLocaleDateString("en-GB", { weekday: "short" })}</div>
            <strong>${dayDate.getDate()}</strong>
        `;

        if (dayDate.toDateString() === selectedDate.toDateString()) {
            li.classList.add("selected");
        }

        li.addEventListener("click", () => {
            document.querySelectorAll(".day-card").forEach(card =>
                card.classList.remove("selected")
            );
            li.classList.add("selected");
            selectedDate = new Date(dayDate);

            selectedDateDisplay.textContent = "Selected date: " + formatDate(selectedDate);
            todoDate.textContent = formatDate(selectedDate);
            window.dispatchEvent(new Event("selectedDateChanged"));
        });

        daysContainer.appendChild(li);
    }

    selectedDateDisplay.textContent = "Selected date: " + formatDate(selectedDate);
    todoDate.textContent = formatDate(selectedDate);
}

/* ---------- NAVIGATION ---------- */
prevBtn.addEventListener("click", () => {
    currentStartDate.setDate(currentStartDate.getDate() - 7);
    renderDays(currentStartDate);
});

nextBtn.addEventListener("click", () => {
    currentStartDate.setDate(currentStartDate.getDate() + 7);
    renderDays(currentStartDate);
});

/* ---------- EXPORT ---------- */
window.getSelectedDate = () => selectedDate.toISOString().split("T")[0];
