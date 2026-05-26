let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let notes = JSON.parse(localStorage.getItem("notes")) || [];
let editId = null;

showSection("dashboard");
displayTasks();
displayNotes();
updateProgressSection();

function showSection(section) {
  const sections = ["dashboard", "tasks", "progress", "notes"];
  sections.forEach(name => {
    const el = document.getElementById(`${name}Section`);
    if(el) {
      el.classList.toggle("active-section", name === section);
    }

    const navItem = document.getElementById(`nav${name.charAt(0).toUpperCase() + name.slice(1)}`);
    if(navItem) {
      navItem.classList.toggle("active", name === section);
    }
  });

  const titles = {
    dashboard: "Interactive Progress Tracker",
    tasks: "Tasks",
    progress: "Progress Overview",
    notes: "Notes"
  };

  document.getElementById("pageTitle").innerText = titles[section] || "OJT Tracker";

  if(section === "progress") {
    updateProgressSection();
  }

  if(section === "dashboard") {
    displayDashboardTasks();
  }
}

function addTask() {
  const taskName = document.getElementById("taskName").value.trim();
  const taskCategory = document.getElementById("taskCategory").value.trim();
  const taskDate = document.getElementById("taskDate").value;
  const taskStatus = document.getElementById("taskStatus").value;
  const taskNotes = document.getElementById("taskNotes").value.trim();

  if(taskName === "" || taskCategory === "" || taskDate === "") {
    alert("Please fill all required fields.");
    return;
  }

  if(editId) {
    tasks = tasks.map(task => {
      if(task.id === editId) {
        return {
          ...task,
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
    tasks.push({
      id: Date.now(),
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
  const taskList = document.getElementById(tableBodyId);
  taskList.innerHTML = "";

  if(filteredTasks.length === 0) {
    taskList.innerHTML = `<tr><td colspan="5">No tasks found.</td></tr>`;
    return;
  }

  [...filteredTasks].reverse().forEach(task => {
    let statusClass = "progress";
    if(task.taskStatus === "Completed") {
      statusClass = "completed";
    } else if(task.taskStatus === "Pending") {
      statusClass = "pending";
    }

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${task.taskName}</td>
      <td>${task.taskCategory}</td>
      <td>
        <span class="status ${statusClass}">${task.taskStatus}</span>
      </td>
      <td>${task.taskDate}</td>
      <td class="actions">
        <button class="complete-btn" onclick="markComplete(${task.id})">Complete</button>
        <button class="edit-btn" onclick="editTask(${task.id})">Edit</button>
        <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
      </td>
    `;
    taskList.appendChild(row);
  });
}

function displayTasks(filteredTasks = tasks) {
  renderTasks("taskList", filteredTasks);
  updateSummary();
  displayDashboardTasks();
  updateProgressSection();
}

function displayDashboardTasks() {
  const recentTasks = tasks.slice(-5);
  renderTasks("dashboardTaskList", recentTasks);
}

function updateSummary() {
  const total = tasks.length;
  const completed = tasks.filter(task => task.taskStatus === "Completed").length;
  const pending = tasks.filter(task => task.taskStatus === "Pending").length;
  const inProgress = tasks.filter(task => task.taskStatus === "In Progress").length;

  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  document.getElementById("totalTasks").innerText = total;
  document.getElementById("completedTasks").innerText = completed;
  document.getElementById("pendingTasks").innerText = pending;
  document.getElementById("progressPercent").innerText = progress + "%";

  document.getElementById("progressTotalTasks").innerText = total;
  document.getElementById("progressCompletedTasks").innerText = completed;
  document.getElementById("progressPendingTasks").innerText = pending;
  document.getElementById("progressInProgressTasks").innerText = inProgress;
}

function updateProgressSection() {
  const total = tasks.length;
  const completed = tasks.filter(task => task.taskStatus === "Completed").length;
  const inProgress = tasks.filter(task => task.taskStatus === "In Progress").length;
  const pending = tasks.filter(task => task.taskStatus === "Pending").length;

  const completedPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const inProgressPercent = total > 0 ? Math.round((inProgress / total) * 100) : 0;
  const pendingPercent = total > 0 ? Math.round((pending / total) * 100) : 0;

  document.getElementById("completedProgressFill").style.width = `${completedPercent}%`;
  document.getElementById("inProgressFill").style.width = `${inProgressPercent}%`;
  document.getElementById("pendingProgressFill").style.width = `${pendingPercent}%`;

  document.getElementById("completedProgressPercent").innerText = `${completedPercent}%`;
  document.getElementById("inProgressPercent").innerText = `${inProgressPercent}%`;
  document.getElementById("pendingProgressPercent").innerText = `${pendingPercent}%`;
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

  document.getElementById("taskName").value = task.taskName;
  document.getElementById("taskCategory").value = task.taskCategory;
  document.getElementById("taskDate").value = task.taskDate;
  document.getElementById("taskStatus").value = task.taskStatus;
  document.getElementById("taskNotes").value = task.taskNotes;

  editId = id;
  showSection("tasks");
  window.scrollTo({ top: 0, behavior: "smooth" });
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
  document.getElementById("taskName").value = "";
  document.getElementById("taskCategory").value = "";
  document.getElementById("taskDate").value = "";
  document.getElementById("taskStatus").value = "Pending";
  document.getElementById("taskNotes").value = "";
  editId = null;
}

function addNote() {
  const noteTitle = document.getElementById("noteTitle").value.trim();
  const noteBody = document.getElementById("noteBody").value.trim();
  if(noteTitle === "" || noteBody === "") {
    alert("Please enter a note title and content.");
    return;
  }

  notes.push({ id: Date.now(), title: noteTitle, body: noteBody });
  saveNotes();
  displayNotes();
  clearNoteForm();
}

function displayNotes() {
  const noteList = document.getElementById("noteList");
  noteList.innerHTML = "";
  if(notes.length === 0) {
    noteList.innerHTML = `<tr><td colspan="3">No notes yet.</td></tr>`;
    return;
  }

  [...notes].reverse().forEach(note => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${note.title}</td>
      <td>${note.body}</td>
      <td><button class="delete-btn" onclick="deleteNote(${note.id})">Delete</button></td>
    `;
    noteList.appendChild(row);
  });
}

function deleteNote(id) {
  notes = notes.filter(note => note.id !== id);
  saveNotes();
  displayNotes();
}

function saveNotes() {
  localStorage.setItem("notes", JSON.stringify(notes));
}

function clearNoteForm() {
  document.getElementById("noteTitle").value = "";
  document.getElementById("noteBody").value = "";
}