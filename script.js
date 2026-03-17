// ==========================================================================
// Modern Todo App – JavaScript Logic
// ==========================================================================

// DOM Elements
const els = {
  newTask: document.getElementById('newTask'),
  category: document.getElementById('taskCategory'),
  priority: document.getElementById('taskPriority'),
  dueDate: document.getElementById('taskDueDate'),
  addBtn: document.getElementById('addTaskBtn'),
  taskList: document.getElementById('taskList'),
  dateDisplay: document.getElementById('currentDate'),
  themeToggle: document.getElementById('themeToggle'),
  emptyState: document.getElementById('emptyState'),
  filterBtns: document.querySelectorAll('.filter-btn'),
  catSpans: document.querySelectorAll('.category span'),
};

// State
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';

// ==========================================================================
// Helpers
// ==========================================================================

function save() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function updateCounts() {
  const counts = {health:0, work:0, mental:0, others:0};
  tasks.forEach(t => { if (!t.completed) counts[t.category]++; });
  els.catSpans.forEach(span => {
    const cat = span.parentElement.dataset.category;
    span.textContent = counts[cat] || 0;
  });
}

function getFiltered() {
  if (currentFilter === 'active')    return tasks.filter(t => !t.completed);
  if (currentFilter === 'completed') return tasks.filter(t => t.completed);
  return [...tasks];
}

// ==========================================================================
// Render
// ==========================================================================

function render() {
  els.taskList.innerHTML = '';
  const filtered = getFiltered();
  let visible = 0;

  filtered.forEach((task, i) => {
    visible++;
    const li = document.createElement('li');
    li.className = `task-item priority-${task.priority}`;
    if (task.completed) li.classList.add('completed');

    li.innerHTML = `
      <input type="checkbox" ${task.completed?'checked':''} data-index="${i}">
      <span class="task-text">${task.text}</span>
      <span class="category-tag">${task.category}</span>
      ${task.dueDate ? `<span class="due-date">Due ${new Date(task.dueDate).toLocaleDateString('en-GB')}</span>` : ''}
      <div class="task-actions">
        <button class="delete-btn" data-index="${i}" title="Delete task">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    `;

    els.taskList.appendChild(li);
  });

  els.emptyState.classList.toggle('hidden', visible > 0);
  updateCounts();
}

// ==========================================================================
// Actions
// ==========================================================================

function addTask() {
  const text = els.newTask.value.trim();
  if (!text) return;

  tasks.push({
    text,
    category: els.category.value,
    priority: els.priority.value,
    dueDate: els.dueDate.value || null,
    completed: false,
    created: Date.now()
  });

  els.newTask.value = '';
  els.dueDate.value = '';
  save();
  render();
}

// ==========================================================================
// Event Listeners
// ==========================================================================

els.addBtn.onclick = addTask;
els.newTask.onkeypress = e => { if (e.key === 'Enter') { e.preventDefault(); addTask(); } };

els.taskList.onclick = e => {
  const btn = e.target.closest('.delete-btn');
  if (btn) {
    const i = Number(btn.dataset.index);
    if (!isNaN(i) && confirm('Delete this task?')) {
      tasks.splice(i, 1);
      save();
      render();
    }
    return;
  }

  const chk = e.target.closest('input[type="checkbox"]');
  if (chk) {
    const i = Number(chk.dataset.index);
    if (!isNaN(i)) {
      tasks[i].completed = chk.checked;
      save();
      render();
    }
  }
};

els.filterBtns.forEach(btn => {
  btn.onclick = () => {
    els.filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    render();
  };
});

// Show dark and light mode
els.themeToggle.onclick = () => {
  const cur = document.documentElement.dataset.theme || 'dark';
  const next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  els.themeToggle.innerHTML = next === 'dark'
    ? '<i class="fa-solid fa-moon"></i>'
    : '<i class="fa-solid fa-sun"></i>';
};

// Show current date
els.dateDisplay.textContent = new Date().toLocaleDateString('en-US', {
  weekday: 'long', month: 'short', day: 'numeric'
});

// Start
render();

