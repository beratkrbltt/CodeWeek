import { getCurrentUser } from "../auth.js";

document.addEventListener("DOMContentLoaded", async () => {
    /* ================= AUTH ================= */
    const currentUser = getCurrentUser();
    if (!currentUser) {
        console.error("Kullanıcı giriş yapmamış!");
        return;
    }

    const userId = currentUser.id;
    let currentDate = new Date();

    /* ================= DOM ================= */
    const prevBtn = document.getElementById("prevWeek");
    const nextBtn = document.getElementById("nextWeek");
    const weekDisplay = document.getElementById("weekDisplay");

    let weeklyChart = null;
    let techChart = null;

    /* ================= HELPERS ================= */

    function formatDuration(sec) {
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        if (h > 0) return `${h}h ${m}m`;
        return `${m}m`;
    }

    function parseDuration(duration) {
        if (!duration) return 0;
        return Number(duration);
    }

    /* ================= TECH COLORS (OFFICIAL) ================= */
    const techColors = {
        "Other": "#a60095",
        "JavaScript": "#F7DF1E",
        "TypeScript": "#3178C6",
        "HTML / CSS": "#E34F26",
        "React": "#61DAFB",
        "Vue.js": "#42B883",
        "Angular": "#DD0031",

        "Node.js": "#339933",
        "Python": "#3776AB",
        "Java": "#ED8B00",
        "C# (.NET)": "#512BD4",
        "PHP": "#777BB4",
        "Go": "#00ADD8",
        "Ruby": "#CC342D",

        "Flutter (Dart)": "#02569B",
        "Swift (iOS)": "#FA7343",
        "Kotlin (Android)": "#7F52FF",

        "SQL": "#336791",
        "MongoDB": "#47A248",
        "Docker": "#2496ED",
        "Kubernetes": "#326CE5"
    };

    /* ================= MAIN ================= */

    async function updateCharts() {
        /* ---------- WEEK RANGE ---------- */
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        weekDisplay.textContent =
            `${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`;

        /* ---------- FETCH TODOS ---------- */
        let todos = [];
        try {
            const res = await fetch("http://localhost:3000/todos");
            todos = await res.json();
        } catch (err) {
            console.error("Veri çekilemedi:", err);
        }

        /* ---------- WEEKLY FILTER ---------- */
        const weeklyTodos = todos
            .filter(todo => todo.userId === userId)
            .filter(todo => {
                const d = new Date(todo.date);
                return d >= startOfWeek && d <= endOfWeek;
            });

        /* ================= WEEKLY BAR ================= */
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const weeklyData = Array(7).fill(0);

        weeklyTodos.forEach(todo => {
            const dayIndex = new Date(todo.date).getDay();
            weeklyData[dayIndex] += parseDuration(todo.duration);
        });

        if (weeklyChart) weeklyChart.destroy();
        weeklyChart = new Chart(document.getElementById("weeklyActivity"), {
            type: "bar",
            data: {
                labels: days,
                datasets: [{
                    data: weeklyData,
                    backgroundColor: "rgba(124, 58, 237, 0.8)"
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        ticks: {
                            callback: value => formatDuration(value)
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: ctx => formatDuration(ctx.raw)
                        }
                    }
                }
            }
        });

        /* ================= TECH DOUGHNUT ================= */
        const techMap = {};
        weeklyTodos.forEach(todo => {
            if (!todo.technology) return;
            const sec = parseDuration(todo.duration);
            techMap[todo.technology] =
                (techMap[todo.technology] || 0) + sec;
        });

        const techLabels = Object.keys(techMap);
        const techData = Object.values(techMap);

        const backgroundColors = techLabels.map(
            label => techColors[label] || "#9CA3AF"
        );

        if (techChart) techChart.destroy();
        techChart = new Chart(document.getElementById("techChart"), {
            type: "doughnut",
            data: {
                labels: techLabels.length ? techLabels : ["No Activity"],
                datasets: [{
                    data: techLabels.length ? techData : [1],
                    backgroundColor: techLabels.length
                        ? backgroundColors
                        : ["#6d6d6d"]
                }]
            },
            options: {
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: ctx => formatDuration(ctx.raw)
                        }
                    }
                }
            }
        });

        /* ================= USER STATS ================= */
        const memberSinceEl = document.querySelector(".member-since time");
        const totalTimeEl = document.querySelector(".total-time");
        const thisWeekEl = document.querySelector(".this-week");
        const thisMonthEl = document.querySelector(".this-month");

        memberSinceEl.textContent = new Date(currentUser.memberSince)
            .toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric"
            });

        const totalSeconds = todos
            .filter(todo => todo.userId === userId)
            .reduce((sum, todo) => sum + parseDuration(todo.duration), 0);

        const weekSeconds = weeklyData.reduce((a, b) => a + b, 0);

        const startOfMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            1
        );
        const endOfMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() + 1,
            0
        );

        const monthSeconds = todos
            .filter(todo => todo.userId === userId)
            .filter(todo => {
                const d = new Date(todo.date);
                return d >= startOfMonth && d <= endOfMonth;
            })
            .reduce((sum, todo) => sum + parseDuration(todo.duration), 0);

        totalTimeEl.textContent = formatDuration(totalSeconds);
        thisWeekEl.textContent = formatDuration(weekSeconds);
        thisMonthEl.textContent = formatDuration(monthSeconds);
    }

    /* ================= NAV ================= */
    prevBtn.addEventListener("click", () => {
        currentDate.setDate(currentDate.getDate() - 7);
        updateCharts();
    });

    nextBtn.addEventListener("click", () => {
        currentDate.setDate(currentDate.getDate() + 7);
        updateCharts();
    });

    updateCharts();
});
