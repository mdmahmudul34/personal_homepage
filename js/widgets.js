async function initFortuneGenerator() {
  const box = document.getElementById("fortune-box");
  const controls = document.querySelector(".fortune-controls");
  if (!box || !controls) return;

  try {
    const data = await loadFortunesData();
    box.textContent = data.messages[Math.floor(Math.random() * data.messages.length)];

    controls.innerHTML = data.presets
      .map((preset, i) => `<button class="btn" data-index="${i}">${preset.label}</button>`)
      .join("");

    controls.querySelectorAll(".btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const p = data.presets[Number(btn.dataset.index)];
        box.style.backgroundColor = p.background;
        box.style.color = p.color;
        box.style.borderColor = p.border;
        box.style.fontSize = p.fontSize;
        box.style.fontFamily = p.fontFamily;
        box.textContent = data.messages[Math.floor(Math.random() * data.messages.length)];
      });
    });
  } catch (err) {
    box.textContent = "Could not load fortunes.";
  }
}

function initWeightConverter() {
  const btn = document.getElementById("convert-btn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const val = parseFloat(document.getElementById("input-weight").value);
    const unit = document.getElementById("weight-unit").value;
    let result = "";

    if (!isNaN(val)) {
      result = unit === "kg-to-lb" ? `${(val * 2.2046).toFixed(2)} lbs` : `${(val * 0.4536).toFixed(2)} kg`;
    }
    document.getElementById("converter-result").textContent = result;
  });
}

function initStopwatch() {
  const display = document.getElementById("timer-display");
  const startBtn = document.getElementById("start-btn");
  const stopBtn = document.getElementById("stop-btn");
  const resetBtn = document.getElementById("reset-btn");
  if (!display || !startBtn) return;

  let timer = 0;
  let interval = null;

  startBtn.addEventListener("click", () => {
    if (interval) return;
    interval = setInterval(() => {
      timer++;
      display.textContent = `${timer} s`;
      if (timer >= 30) {
        clearInterval(interval);
        interval = null;
      }
    }, 1000);
  });

  stopBtn.addEventListener("click", () => {
    clearInterval(interval);
    interval = null;
  });

  resetBtn.addEventListener("click", () => {
    clearInterval(interval);
    interval = null;
    timer = 0;
    display.textContent = "0 s";
  });
}

function initTodoList() {
  const todoInput = document.getElementById("todo-input");
  const todoList = document.getElementById("todo-list");
  const addBtn = document.getElementById("add-todo-btn");
  if (!todoInput || !todoList || !addBtn) return;

  let todos = JSON.parse(localStorage.getItem("todos") || "[]");

  function save() {
    localStorage.setItem("todos", JSON.stringify(todos));
  }

  function renderTodos() {
    todoList.innerHTML = "";
    todos.forEach((t, i) => {
      const li = document.createElement("li");

      const chk = document.createElement("input");
      chk.type = "checkbox";
      chk.checked = t.done;
      chk.addEventListener("change", () => {
        t.done = chk.checked;
        save();
        renderTodos();
      });

      const span = document.createElement("span");
      span.textContent = t.text;
      if (t.done) {
        span.style.textDecoration = "line-through";
        span.style.opacity = "0.6";
      }

      const del = document.createElement("button");
      del.className = "btn btn-sm";
      del.textContent = "Delete";
      del.addEventListener("click", () => {
        todos.splice(i, 1);
        save();
        renderTodos();
      });

      li.append(chk, span, del);
      todoList.appendChild(li);
    });
  }

  addBtn.addEventListener("click", () => {
    const text = todoInput.value.trim();
    if (!text) return;
    todos.push({ text, done: false });
    save();
    renderTodos();
    todoInput.value = "";
  });

  todoInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addBtn.click();
  });

  renderTodos();
}
