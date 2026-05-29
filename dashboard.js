const $ = id => document.getElementById(id);
const navItems = ["dashboard","tasks","progress","notes","summary"];
const toggleActionButton = (id, text, show) => {
  const el = $(id);
  if(!el) return;
  if(text) el.innerText = text;
  if(show !== undefined) el.style.display = show ? "inline-block" : "none";
};
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let editId = null;
const titles = {
  dashboard: "Progress Tracker",
  tasks: "Tasks",
  progress: "Progress Overview",
  notes: "Notes",
  summary: "Summary"
};

const getNextTaskId = () => tasks.length ? Math.max(...tasks.map(t => t.id)) + 1 : 1;

const getStatusCounts = (taskArray = tasks) => taskArray.reduce((acc, { taskStatus }) => {
  acc[taskStatus === "Completed" ? "completed" : taskStatus === "Pending" ? "pending" : "inProgress"]++;
  return acc;
}, { completed: 0, pending: 0, inProgress: 0 });

showSection("dashboard");
displayTasks();
displayNotes();
updateProgressSection();

function showSection(section) {
  navItems.forEach(name => {
    const sectionEl = $(name + "Section");
    const navEl = $("nav" + name[0].toUpperCase() + name.slice(1));
    if(sectionEl) sectionEl.classList.toggle("active-section", name === section);
    if(navEl) navEl.classList.toggle("active", name === section);
  });

  $("pageTitle").innerText = titles[section] || "OJT Tracker";
  if(section === "progress") updateProgressSection();
  if(section === "dashboard") displayDashboardTasks();
  if(section === "summary") updateSummarySection();
  if(section === "tasks") {
    $("taskId").value = getNextTaskId();
    toggleActionButton("taskSubmitBtn", editId ? "Save Task" : "Add Task");
    toggleActionButton("taskCancelBtn", null, Boolean(editId));
  }
}

function addTask() {
  const taskIdInput = document.getElementById("taskId").value.trim();
  const taskId = parseInt(taskIdInput, 10);
  const taskName = document.getElementById("taskName").value.trim();
  const taskCategory = document.getElementById("taskCategory").value.trim();
  const taskDate = document.getElementById("taskDate").value;
  const taskStatus = document.getElementById("taskStatus").value;
  const taskNotes = document.getElementById("taskNotes").value.trim();

  if(!taskIdInput || isNaN(taskId) || taskId < 1) {
    alert("Please enter a valid Task ID.");
    return;
  }

  if(taskName === "" || taskCategory === "" || taskDate === "") {
    alert("Please fill all required fields.");
    return;
  }

  const duplicateTask = tasks.find(task => task.id === taskId);

  if(editId) {
    if(duplicateTask && duplicateTask.id !== editId) {
      alert("Task ID already exists. Please use a unique Task ID.");
      return;
    }

    tasks = tasks.map(task => {
      if(task.id === editId) {
        return {
          id: taskId,
          taskName,
          taskCategory,
          taskDate,
          taskStatus,
          taskNotes
        };
      }
      return task;
    });
    editId = null;
  } else {
    if(duplicateTask) {
      alert("Task ID already exists. Please use a unique Task ID.");
      return;
    }

    tasks.push({
      id: taskId,
      taskName,
      taskCategory,
      taskDate,
      taskStatus,
      taskNotes
    });
  }

  saveTasks();
  displayTasks();
  clearForm();
}

function renderTasks(tableBodyId, filteredTasks = []) {
  const taskList = $(tableBodyId);
  taskList.innerHTML = filteredTasks.length === 0
    ? `<tr><td colspan="5">No tasks found.</td></tr>`
    : [...filteredTasks].reverse().map(task => {
      const statusClass = task.taskStatus === "Completed"
        ? "completed"
        : task.taskStatus === "Pending"
          ? "pending"
          : "progress";
      return `
        <tr>
          <td><strong>#${task.id}</strong></td>
          <td>${task.taskName}</td>
          <td>${task.taskCategory}</td>
          <td><span class="status ${statusClass}">${task.taskStatus}</span></td>
          <td>${task.taskDate}</td>
          <td class="actions">
            <div class="action-panel">
              <button class="action-toggle" onclick="toggleActionMenu(event, ${task.id})">Action</button>
              <div class="action-menu" id="actionMenu-${task.id}">
                <button onclick="markComplete(${task.id}); event.stopPropagation();">Complete</button>
                <button onclick="editTask(${task.id}); event.stopPropagation();">Edit</button>
                <button onclick="deleteTask(${task.id}); event.stopPropagation();">Delete</button>
              </div>
            </div>
          </td>
        </tr>`;
    }).join("");
}

function toggleActionMenu(event, taskId) {
  event.stopPropagation();
  closeAllActionMenus();
  const menu = $("actionMenu-" + taskId);
  if(menu) {
    menu.classList.toggle("open");
  }
}

function closeAllActionMenus(excludeMenu) {
  document.querySelectorAll(".action-menu.open").forEach(menu => {
    if(menu !== excludeMenu) {
      menu.classList.remove("open");
    }
  });
}

document.addEventListener("click", () => closeAllActionMenus());

function displayTasks(filteredTasks = tasks) {
  renderTasks("taskList", filteredTasks);
  updateSummary();
  displayDashboardTasks();
  updateProgressSection();
  updateSummarySection();
}

function updateTaskSummaryRow(task) {
  const summaryRow = document.getElementById("taskSummaryRow");
  if(!summaryRow) return;

  if(!task) {
    summaryRow.style.display = "none";
    return;
  }

  document.getElementById("summaryTaskInfo").innerText = `#${task.id} - ${task.taskName}`;
  document.getElementById("summaryTaskStatus").innerText = task.taskStatus;
  document.getElementById("summaryTaskNotes").innerText = task.taskNotes || "No notes available.";
  summaryRow.style.display = "grid";
}

function clearTaskSummaryRow() {
  const summaryRow = document.getElementById("taskSummaryRow");
  if(!summaryRow) return;
  summaryRow.style.display = "none";
}

function displayDashboardTasks() {
  const recentTasks = tasks.slice(-5);
  renderTasks("dashboardTaskList", recentTasks);
}

function updateSummary() {
  const total = tasks.length;
  const counts = getStatusCounts();
  const progress = total ? Math.round((counts.completed / total) * 100) : 0;
  $("totalTasks").innerText = total;
  $("completedTasks").innerText = counts.completed;
  $("pendingTasks").innerText = counts.pending;
  $("progressPercent").innerText = progress + "%";
  $("progressTotalTasks").innerText = total;
  $("progressCompletedTasks").innerText = counts.completed;
  $("progressPendingTasks").innerText = counts.pending;
  $("progressInProgressTasks").innerText = counts.inProgress;
}

function updateSummarySection() {
  const notesCount = tasks.filter(task => task.taskNotes && task.taskNotes.trim() !== "").length;
  const counts = getStatusCounts();

  $("summaryTotalTasks").innerText = tasks.length;
  $("summaryCompletedTasks").innerText = counts.completed;
  $("summaryPendingTasks").innerText = counts.pending;
  $("summaryNotesCount").innerText = notesCount;

  const summaryTableBody = $("summaryTableBody");
  if(!summaryTableBody) return;

  summaryTableBody.innerHTML = tasks.length === 0
    ? `<tr><td colspan="4">No tasks available.</td></tr>`
    : tasks.map(task => `
      <tr>
        <td><strong>#${task.id}</strong></td>
        <td>${task.taskName}</td>
        <td>${task.taskStatus}</td>
        <td>${task.taskNotes ? task.taskNotes : "-"}</td>
      </tr>
    `).join("");
}

function updateProgressSection() {
  const total = tasks.length;
  const counts = getStatusCounts();
  const pct = value => total ? Math.round((value / total) * 100) : 0;
  [
    ["completed", "completedProgressFill", "completedProgressPercent"],
    ["inProgress", "inProgressFill", "inProgressPercent"],
    ["pending", "pendingProgressFill", "pendingProgressPercent"]
  ].forEach(([key, barId, percentId]) => {
    if($(barId)) $(barId).style.width = `${pct(counts[key])}%`;
    if($(percentId)) $(percentId).innerText = `${pct(counts[key])}%`;
  });
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  displayTasks();
}

function markComplete(id) {
  tasks = tasks.map(task => {
    if(task.id === id) {
      return { ...task, taskStatus: "Completed" };
    }
    return task;
  });
  saveTasks();
  displayTasks();
}

function editTask(id) {
  const task = tasks.find(task => task.id === id);
  if(!task) return;

  $("taskId").value = task.id;
  $("taskName").value = task.taskName;
  $("taskCategory").value = task.taskCategory;
  $("taskDate").value = task.taskDate;
  $("taskStatus").value = task.taskStatus;
  $("taskNotes").value = task.taskNotes;

  editId = id;
  showSection("tasks");
  toggleActionButton("taskSubmitBtn", "Save Task");
  toggleActionButton("taskCancelBtn", null, true);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function searchTaskByIdOrName() {
  const search = document.getElementById("taskSearchInput").value.trim();
  const searchResultsContainer = document.getElementById("searchResultsContainer");
  const notFoundMessage = document.getElementById("notFoundMessage");
  const searchResultsList = document.getElementById("searchResultsList");

  // Hide both containers initially
  searchResultsContainer.style.display = "none";
  notFoundMessage.style.display = "none";
  clearTaskSummaryRow();

  if(search === "") {
    return;
  }

  // Search by ID (numeric) or by name (text)
  let filtered = [];
  const searchAsNumber = parseInt(search, 10);

  if(!isNaN(searchAsNumber)) {
    // Search by ID
    filtered = tasks.filter(task => task.id === searchAsNumber);
  } else {
    // Search by name (case-insensitive)
    filtered = tasks.filter(task =>
      task.taskName.toLowerCase().includes(search.toLowerCase())
    );
  }

  if(filtered.length === 0) {
    notFoundMessage.style.display = "block";
    clearTaskSummaryRow();
  } else {
    searchResultsContainer.style.display = "block";
    renderTasks("searchResultsList", filtered);
    updateTaskSummaryRow(filtered[0]);
  }
}

function searchTasks() {
  const search = document.getElementById("searchInput").value.toLowerCase();
  const filtered = tasks.filter(task =>
    task.taskName.toLowerCase().includes(search) ||
    task.taskCategory.toLowerCase().includes(search) ||
    task.taskNotes.toLowerCase().includes(search)
  );
  displayTasks(filtered);
}

function filterTasks() {
  const filter = document.getElementById("filterStatus").value;
  if(filter === "All") {
    displayTasks(tasks);
    return;
  }
  const filtered = tasks.filter(task => task.taskStatus === filter);
  displayTasks(filtered);
}

function clearForm() {
  $("taskId").value = getNextTaskId();
  ["taskName","taskCategory","taskDate","taskNotes"].forEach(id => $(id).value = "");
  $("taskStatus").value = "Pending";
  editId = null;
  toggleActionButton("taskSubmitBtn", "Add Task");
  toggleActionButton("taskCancelBtn", null, false);
}

function saveTaskNote() {
  const taskIdInput = $("noteTaskId").value.trim();
  const noteBody = $("noteBody").value.trim();
  const taskId = parseInt(taskIdInput, 10);

  if(!taskIdInput || isNaN(taskId) || taskId < 1) {
    alert("Please enter a valid Task ID.");
    return;
  }

  if(noteBody === "") {
    alert("Please enter note content.");
    return;
  }

  const task = tasks.find(task => task.id === taskId);
  if(!task) {
    alert("Task not found. Please use a valid Task ID.");
    return;
  }

  task.taskNotes = noteBody;
  saveTasks();
  displayNotes();
  displayTasks();
  clearNoteForm();
}

function displayNotes() {
  const noteList = document.getElementById("noteList");
  noteList.innerHTML = "";
  const tasksWithNotes = tasks.filter(task => task.taskNotes && task.taskNotes.trim() !== "");
  if(tasksWithNotes.length === 0) {
    noteList.innerHTML = `<tr><td colspan="4">No task notes yet.</td></tr>`;
    return;
  }

  [...tasksWithNotes].reverse().forEach(task => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><strong>#${task.id}</strong></td>
      <td>${task.taskName}</td>
      <td>${task.taskNotes}</td>
      <td>
        <div class="action-panel">
          <button class="action-toggle" onclick="toggleActionMenu(event, 'note-${task.id}')">Actions</button>
          <div class="action-menu" id="actionMenu-note-${task.id}">
            <button onclick="editTaskNote(${task.id}); event.stopPropagation();">Edit</button>
            <button onclick="deleteTaskNote(${task.id}); event.stopPropagation();">Delete</button>
          </div>
        </div>
      </td>
    `;
    noteList.appendChild(row);
  });
}

function deleteTaskNote(id) {
  tasks = tasks.map(task => {
    if(task.id === id) {
      return { ...task, taskNotes: "" };
    }
    return task;
  });
  saveTasks();
  displayNotes();
  displayTasks();
}

function editTaskNote(id) {
  const task = tasks.find(task => task.id === id);
  if(!task) return;

  $("noteTaskId").value = task.id;
  $("noteTaskId").readOnly = true;
  $("noteTaskName").value = task.taskName;
  $("noteBody").value = task.taskNotes;

  const submit = $("noteSubmitBtn"); if(submit) submit.innerText = "Save Note";
  const cancel = $("noteCancelBtn"); if(cancel) cancel.style.display = "inline-block";
  showSection("notes");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function clearNoteForm() {
  $("noteTaskId").value = "";
  $("noteTaskId").readOnly = false;
  $("noteTaskName").value = "";
  $("noteBody").value = "";
  const submit = $("noteSubmitBtn"); if(submit) submit.innerText = "Add Note";
  const cancel = $("noteCancelBtn"); if(cancel) cancel.style.display = "none";
}

function cancelEdit() {
  clearForm();
  showSection("tasks");
}