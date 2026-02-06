document.addEventListener("DOMContentLoaded", () => {
    /* ========= ELEMENTS ========= */
    const $ = id => document.getElementById(id);

    const timer = {
        display: $("timerDisplay"),
        start: $("startBtn"),
        stop: $("stopBtn"),
        finish: $("finishBtn")
    };

    const modal = {
        tech: $("technology"),
        topic: $("topic"),
        time: $("elapsedTime"),
        note: $("note"),
        save: $("saveBtn"),
        close: $("closeModal"),
        box: $("sessionModal")
    };

    const addBtn = $("addSessionBtn");
    const todoList = $("todoList");
    const alertText = document.querySelector(".todoalert");

    /* ========= STATE ========= */
    let seconds = 0;
    let interval = null;

    /* ========= TIME ========= */
    const pad = n => String(n).padStart(2, "0");

    const formatTime = s =>
        `${pad(s / 3600 | 0)}:${pad((s % 3600) / 60 | 0)}:${pad(s % 60)}`;

    const formatDuration = s => {
        const h = s / 3600 | 0, m = (s % 3600) / 60 | 0;
        return h ? `${h}h${m ? ` ${m}m` : ""}` : m ? `${m}m` : `${s}s`;
    };

    const parseTime = v => {
        const m = v.match(/^(\d{1,2}):([0-5]\d):([0-5]\d)$/);
        return m ? (+m[1] * 3600 + +m[2] * 60 + +m[3]) : null;
    };

    /* ========= INPUT FORMAT ========= */
    modal.time.addEventListener("input", e => {
        const el = e.target;
        const pos = el.selectionStart;

        let v = el.value.replace(/\D/g, "").slice(0, 6);

        el.value =
            v.slice(0, 2) +
            (v.length > 2 ? ":" + v.slice(2, 4) : "") +
            (v.length > 4 ? ":" + v.slice(4, 6) : "");

        el.setSelectionRange(pos, pos);
    });


    /* ========= TIMER ========= */
    const resetTimer = () => {
        seconds = 0;
        timer.display.textContent = "00:00:00";
        interval && clearInterval(interval);
        interval = null;

        timer.start.disabled = false;
        timer.stop.disabled = true;
        timer.finish.disabled = true;

        modal.time.value = "";
        modal.time.dataset.seconds = "";
        modal.time.readOnly = false;
    };

    const startTimer = () => {
        if (interval) return;
        interval = setInterval(() => {
            seconds++;
            timer.display.textContent = formatTime(seconds);
        }, 1000);

        modal.time.readOnly = true;
        timer.start.disabled = true;
        timer.stop.disabled = false;
        timer.finish.disabled = false;
    };

    const stopTimer = () => {
        clearInterval(interval);
        interval = null;
        timer.start.disabled = false;
        timer.stop.disabled = true;
    };

    const finishTimer = () => {
        clearInterval(interval);
        interval = null;

        modal.time.value = formatTime(seconds);
        modal.time.dataset.seconds = seconds;
        modal.box.style.display = "flex";
    };

    timer.start.onclick = startTimer;
    timer.stop.onclick = stopTimer;
    timer.finish.onclick = finishTimer;

    /* ========= MODAL ========= */
    modal.close.onclick = () => modal.box.style.display = "none";
    addBtn.onclick = () => modal.box.style.display = "flex";

    /* ========= SAVE ========= */
    modal.save.onclick = async () => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || !modal.topic.value.trim()) return alert("Konu boş olamaz");

        const duration =
            modal.time.dataset.seconds ||
            parseTime(modal.time.value.trim());

        if (!duration || duration <= 0)
            return alert("Geçerli süre gir (HH:MM:SS)");

        await fetch("http://localhost:3000/todos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: user.id,
                technology: modal.tech.value,
                topic: modal.topic.value.trim(),
                note: modal.note.value.trim(),
                duration: +duration,
                date: window.getSelectedDate(),
                createdAt: new Date().toISOString()
            })
        });

        modal.box.style.display = "none";
        resetTimer();
        fetchTodos();
    };

    /* ========= TODOS ========= */
    async function fetchTodos() {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) return;

        const res = await fetch(
            `http://localhost:3000/todos?userId=${user.id}&date=${window.getSelectedDate()}&_sort=createdAt&_order=desc`
        );

        renderTodos(await res.json());
    }

    function renderTodos(todos) {
        todoList.innerHTML = "";
        alertText.style.display = todos.length ? "none" : "block";

        todos.forEach(todo => {
            const li = document.createElement("li");
            li.className = "todo-card";

            li.innerHTML = `
                <div class="todo-card-header">
                    <h4 class="todo-topic">${todo.topic}</h4>
                    <span class="todo-duration">
                        ${formatDuration(todo.duration)}
                    </span>
                </div>
                <div class="todo-card-meta">${todo.technology}</div>
                ${todo.note ? `<p class="todo-note">${todo.note}</p>` : ""}
                <div class="todo-card-actions">
                    <button class="delete-btn" data-id="${todo.id}">🗑 Delete</button>
                </div>
            `;

            todoList.appendChild(li);
        });
    }

    /* ========= DELETE ========= */
    todoList.onclick = async e => {
        if (!e.target.classList.contains("delete-btn")) return;
        await fetch(`http://localhost:3000/todos/${e.target.dataset.id}`, { method: "DELETE" });
        fetchTodos();
    };

    window.addEventListener("selectedDateChanged", fetchTodos);

    /* ========= INIT ========= */
    resetTimer();
    fetchTodos();
});