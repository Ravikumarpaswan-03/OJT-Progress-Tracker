OJT Progress Tracker

A modern and interactive OJT (On Job Training) Progress Tracker web application developed using HTML, CSS and JavaScript. The project helps students manage tasks, track progress, maintain notes, and monitor daily OJT activities efficiently.

## 🚀 Features

- Dashboard Overview
- Task Management (Add, Edit, Delete)
- Progress Tracking
- Notes Management
- Summary Section
- Search & Filter Tasks
- Responsive User Interface
- Local Storage Data Persistence

---

## 🛠 Technologies Used

- HTML5
- CSS3
- JavaScript (ES6)
- Local Storage
- Git & GitHub

---

## 📂 Modules

### Dashboard
Displays overall project statistics and task summaries.

### Tasks
Create, update, delete, and manage daily OJT tasks.

### Progress
Tracks task completion percentage and overall progress.

### Notes
Store and manage task-related notes and learning points.

### Summary
Provides a consolidated view of tasks, notes, and progress.

---

## 💾 Data Storage

The application uses browser Local Storage to store task and notes data.

```javascript
localStorage.setItem("tasks", JSON.stringify(tasks));

const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
```

### Benefits
- Data remains available after page refresh.
- No external database required.
- Fast and lightweight storage solution.

---

## ⚡ Key Concepts Used

- CRUD Operations
- DOM Manipulation
- Event Handling
- Dynamic Rendering
- Local Storage
- Responsive Design
- JavaScript Array Methods

---

## ▶️ How to Run

1. Clone or download the repository.
2. Open the project in VS Code.
3. Install the Live Server extension.
4. Right-click on `index.html`.
5. Select **Open with Live Server**.

---

## 🔗 Git Commands

```bash
git add .
git commit -m "Project Update"
git push origin main
```

---

## 📈 Future Enhancements

- User Authentication
- Dark Mode
- Backend Integration
- Database Support
- Export Reports (PDF/Excel)
- Charts & Analytics

---

## 👨‍💻 Developed By

**Ravikumar Paswan**

OJT Progress Tracker Project  
HTML | CSS | JavaScript