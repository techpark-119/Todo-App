// Global state
let todos = [];
let categories = [];
let currentEditId = null;
let draggedElement = null;
let searchTimeout = null;

const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const priorityFilter = document.getElementById('priority-filter');
const statusFilter = document.getElementById('status-filter');
const todosContainer = document.getElementById('todos-container');
const todoModal = document.getElementById('todo-modal');
const categoryModal = document.getElementById('category-modal');
const addTodoBtn = document.getElementById('add-todo-btn');
const addCategoryBtn = document.getElementById('add-category-btn');
const themeToggle = document.getElementById('theme-toggle');
const exportBtn = document.getElementById('export-btn');

document.addEventListener('DOMContentLoaded', function () {
    initializeTheme();
    loadTodos();
    setupEventListeners();
    updateStats();
    setupDragAndDrop();
});
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}
function toggleTheme() {
    document.body.classList.add('theme-transition');
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);

    setTimeout(() => {
        document.body.classList.remove('theme-transition');
    }, 300);
}
function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    if (theme === 'dark') {
        icon.className = 'fas fa-sun';
        themeToggle.title = 'Switch to Light Mode';
    } else {
        icon.className = 'fas fa-moon';
        themeToggle.title = 'Switch to Dark Mode';
    }
}
function setupEventListeners() {
    themeToggle.addEventListener('click', toggleTheme);
    exportBtn.addEventListener('click', exportData);
    searchInput.addEventListener('input', debounceSearch);
    categoryFilter.addEventListener('change', applyFilters);
    priorityFilter.addEventListener('change', applyFilters);
    statusFilter.addEventListener('change', applyFilters);
    addTodoBtn.addEventListener('click', () => openTodoModal());
    addCategoryBtn.addEventListener('click', () => openCategoryModal());
    document.getElementById('todo-form').addEventListener('submit', handleTodoSubmit);
    document.getElementById('category-form').addEventListener('submit', handleCategorySubmit);
    document.addEventListener('click', handleModalClose);
    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('click', handleCategoryClick);
}
function debounceSearch() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        applyFilters();
    }, 300);
}
async function applyFilters() {
    const query = searchInput.value.trim();
    const category = categoryFilter.value;
    const priority = priorityFilter.value;
    const completed = statusFilter.value;
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (category) params.append('category', category);
    if (priority) params.append('priority', priority);
    if (completed) params.append('completed', completed);
    try {
        const response = await fetch(`/api/search?${params}`);
        const data = await response.json();
        if (data.success) {
            renderTodos(data.todos);
            updateStats(data.todos);
        }
    } catch (error) {
        console.error('Search error:', error);
        showNotification('Search failed', 'error');
    }
}
async function loadTodos() {
    try {
        const todoElements = document.querySelectorAll('.todo-item');
        todos = Array.from(todoElements).map(el => ({
            id: el.dataset.id,
        }));

        // Alternatively, fetch fresh data
        // const response = await fetch('/api/todos');
        // const data = await response.json();
        // todos = data.todos || [];

        updateStats();
    } catch (error) {
        console.error('Error loading todos:', error);
        showNotification('Failed to load todos', 'error');
    }
}
function renderTodos(todosToRender = todos) {
    if (todosToRender.length === 0) {
        todosContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <h3>No tasks found!</h3>
                <p>Try adjusting your search or filters.</p>
            </div>
        `;
        return;
    }
    todosContainer.innerHTML = todosToRender
        .sort((a, b) => a.order - b.order)
        .map(todo => createTodoHTML(todo))
        .join('');
    setupDragAndDrop();
}
function createTodoHTML(todo) {
    const category = categories.find(c => c.name === todo.category) || { color: '#4ecdc4' };
    const dueDate = todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : '';
    const tags = todo.tags || [];
    return `
        <div class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}" draggable="true">
            <div class="todo-checkbox">
                <input type="checkbox" ${todo.completed ? 'checked' : ''} 
                       onchange="toggleTodo('${todo.id}')">
            </div>
            <div class="todo-content">
                <h4 class="todo-title">${escapeHtml(todo.title)}</h4>
                ${todo.description ? `<p class="todo-description">${escapeHtml(todo.description)}</p>` : ''}
                <div class="todo-meta">
                    <span class="todo-category" style="background-color: ${category.color}">
                        ${escapeHtml(todo.category)}
                    </span>
                    <span class="todo-priority priority-${todo.priority}">
                        <i class="fas fa-flag"></i> ${todo.priority}
                    </span>
                    ${dueDate ? `<span class="todo-due-date">
                        <i class="fas fa-calendar"></i> ${dueDate}
                    </span>` : ''}
                </div>
                ${tags.length > 0 ? `<div class="todo-tags">
                    ${tags.map(tag => `<span class="tag">#${escapeHtml(tag)}</span>`).join('')}
                </div>` : ''}
            </div>
            <div class="todo-actions">
                <button class="btn-icon" onclick="editTodo('${todo.id}')" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-danger" onclick="deleteTodo('${todo.id}')" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
                <div class="drag-handle" title="Drag to reorder">
                    <i class="fas fa-grip-vertical"></i>
                </div>
            </div>
        </div>
    `;
}
async function toggleTodo(id) {
    try {
        showLoading(true);
        const todo = todos.find(t => t.id === id);
        const response = await fetch(`/api/todos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed: !todo.completed })
        });
        const data = await response.json();
        if (data.success) {
            todo.completed = !todo.completed;
            const todoElement = document.querySelector(`[data-id="${id}"]`);
            todoElement.classList.toggle('completed', todo.completed);
            updateStats();
            showNotification('Task updated successfully', 'success');
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Toggle error:', error);
        showNotification('Failed to update task', 'error');
        const checkbox = document.querySelector(`[data-id="${id}"] input[type="checkbox"]`);
        checkbox.checked = !checkbox.checked;
    } finally {
        showLoading(false);
    }
}
async function deleteTodo(id) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
        showLoading(true);
        const response = await fetch(`/api/todos/${id}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        if (data.success) {
            todos = todos.filter(t => t.id !== id);
            document.querySelector(`[data-id="${id}"]`).remove();
            updateStats();
            showNotification('Task deleted successfully', 'success');
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Delete error:', error);
        showNotification('Failed to delete task', 'error');
    } finally {
        showLoading(false);
    }
}
function editTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    currentEditId = id;
    document.getElementById('modal-title').textContent = 'Edit Task';
    document.getElementById('todo-id').value = id;
    document.getElementById('todo-title').value = todo.title;
    document.getElementById('todo-description').value = todo.description || '';
    document.getElementById('todo-category').value = todo.category;
    document.getElementById('todo-priority').value = todo.priority;
    document.getElementById('todo-due-date').value = todo.dueDate ? todo.dueDate.split('T')[0] : '';
    document.getElementById('todo-tags').value = (todo.tags || []).join(', ');
    openTodoModal();
}
function openTodoModal(todoId = null) {
    if (!todoId) {
        currentEditId = null;
        document.getElementById('modal-title').textContent = 'Add New Task';
        document.getElementById('todo-form').reset();
        document.getElementById('todo-id').value = '';
    }
    todoModal.classList.add('show');
    document.body.style.overflow = 'hidden';
    document.getElementById('todo-title').focus();
}
function closeTodoModal() {
    todoModal.classList.remove('show');
    document.body.style.overflow = '';
    currentEditId = null;
}
function openCategoryModal() {
    categoryModal.classList.add('show');
    document.body.style.overflow = 'hidden';
    document.getElementById('category-name').focus();
}
function closeCategoryModal() {
    categoryModal.classList.remove('show');
    document.body.style.overflow = '';
    document.getElementById('category-form').reset();
}
async function handleTodoSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const todoData = {
        title: document.getElementById('todo-title').value.trim(),
        description: document.getElementById('todo-description').value.trim(),
        category: document.getElementById('todo-category').value,
        priority: document.getElementById('todo-priority').value,
        dueDate: document.getElementById('todo-due-date').value || null,
        tags: document.getElementById('todo-tags').value
    };
    if (!todoData.title) {
        showNotification('Title is required', 'error');
        return;
    }
    try {
        showLoading(true);
        const url = currentEditId ? `/api/todos/${currentEditId}` : '/api/todos';
        const method = currentEditId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(todoData)
        });
        const data = await response.json();
        if (data.success) {
            if (currentEditId) {
                const todoIndex = todos.findIndex(t => t.id === currentEditId);
                todos[todoIndex] = data.todo;
            } else {
                todos.push(data.todo);
            }
            closeTodoModal();
            location.reload(); // Reload to get fresh server-rendered data
            showNotification(
                currentEditId ? 'Task updated successfully' : 'Task created successfully',
                'success'
            );
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Save error:', error);
        showNotification('Failed to save task', 'error');
    } finally {
        showLoading(false);
    }
}
async function handleCategorySubmit(e) {
    e.preventDefault();
    const categoryData = {
        name: document.getElementById('category-name').value.trim(),
        color: document.getElementById('category-color').value
    };
    if (!categoryData.name) {
        showNotification('Category name is required', 'error');
        return;
    }
    try {
        showLoading(true);
        const response = await fetch('/api/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(categoryData)
        });
        const data = await response.json();
        if (data.success) {
            categories.push(data.category);
            closeCategoryModal();
            location.reload(); // Reload to get fresh server-rendered data
            showNotification('Category created successfully', 'success');
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Category save error:', error);
        showNotification('Failed to create category', 'error');
    } finally {
        showLoading(false);
    }
}
function handleModalClose(e) {
    if (e.target === todoModal) {
        closeTodoModal();
    }
    if (e.target === categoryModal) {
        closeCategoryModal();
    }
}
function handleKeydown(e) {
    if (e.key === 'Escape') {
        closeTodoModal();
        closeCategoryModal();
    }
}
function handleCategoryClick(e) {
    if (e.target.closest('.category-item')) {
        const categoryName = e.target.closest('.category-item').dataset.category;
        categoryFilter.value = categoryName;
        applyFilters();
    }
}
function setupDragAndDrop() {
    const todoItems = document.querySelectorAll('.todo-item');
    todoItems.forEach(item => {
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragover', handleDragOver);
        item.addEventListener('drop', handleDrop);
        item.addEventListener('dragend', handleDragEnd);
        item.addEventListener('dragenter', handleDragEnter);
        item.addEventListener('dragleave', handleDragLeave);
    });
}
function handleDragStart(e) {
    draggedElement = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.outerHTML);
}
function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}
function handleDragEnter(e) {
    if (this !== draggedElement) {
        this.classList.add('drag-over');
    }
}
function handleDragLeave(e) {
    this.classList.remove('drag-over');
}
function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    if (draggedElement !== this) {
        const allItems = Array.from(todosContainer.children);
        const draggedIndex = allItems.indexOf(draggedElement);
        const targetIndex = allItems.indexOf(this);

        if (draggedIndex < targetIndex) {
            this.parentNode.insertBefore(draggedElement, this.nextSibling);
        } else {
            this.parentNode.insertBefore(draggedElement, this);
        }
        updateTodoOrder();
    }
    this.classList.remove('drag-over');
    return false;
}
function handleDragEnd(e) {
    this.classList.remove('dragging');
    document.querySelectorAll('.todo-item').forEach(item => {
        item.classList.remove('drag-over');
    });
}
async function updateTodoOrder() {
    try {
        const todoItems = Array.from(todosContainer.children);
        const todoIds = todoItems.map(item => item.dataset.id);

        const response = await fetch('/api/todos/reorder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ todoIds })
        });
        const data = await response.json();
        if (!data.success) {
            throw new Error(data.error);
        }
        showNotification('Tasks reordered successfully', 'success');
    } catch (error) {
        console.error('Reorder error:', error);
        showNotification('Failed to reorder tasks', 'error');
        location.reload(); // Reload to restore original order
    }
}
function updateStats(filteredTodos = todos) {
    const totalTasks = filteredTodos.length;
    const completedTasks = filteredTodos.filter(t => t.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    document.getElementById('total-tasks').textContent = totalTasks;
    document.getElementById('completed-tasks').textContent = completedTasks;
    document.getElementById('pending-tasks').textContent = pendingTasks;
    const progressFill = document.getElementById('progress-fill');
    if (progressFill) {
        progressFill.style.width = `${progressPercentage}%`;
    }
    document.title = `TodoMaster (${completedTasks}/${totalTasks})`;
}
function selectColor(color) {
    document.getElementById('category-color').value = color;
}
async function exportData() {
    try {
        showLoading(true);
        const response = await fetch('/api/export');
        if (!response.ok) {
            throw new Error('Export failed');
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `todos-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        showNotification('Data exported successfully', 'success');
    } catch (error) {
        console.error('Export error:', error);
        showNotification('Failed to export data', 'error');
    } finally {
        showLoading(false);
    }
}
function showNotification(message, type = 'info') {
    const container = document.getElementById('notifications-container');
    const notification = document.createElement('div');
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        info: 'fas fa-info-circle',
        warning: 'fas fa-exclamation-triangle'
    };
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="${icons[type]}"></i>
        <span>${escapeHtml(message)}</span>
    `;
    container.appendChild(notification);
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}
function showLoading(isLoading) {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => {
        if (isLoading) {
            btn.classList.add('loading');
            btn.disabled = true;
        } else {
            btn.classList.remove('loading');
            btn.disabled = false;
        }
    });
}
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
function formatDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow';
    } else if (date < today) {
        return 'Overdue';
    } else {
        return date.toLocaleDateString();
    }
}
document.addEventListener('keydown', function (e) {
    // Ctrl/Cmd + N - New task
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        openTodoModal();
    }
    // Ctrl/Cmd + F - Focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        searchInput.focus();
    }
    // Ctrl/Cmd + T - Toggle theme
    if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        toggleTheme();
    }
    // Ctrl/Cmd + E - Export
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        exportData();
    }
});
let draftTimeout;
const DRAFT_KEY = 'todo_draft';
function saveDraft() {
    const formData = {
        title: document.getElementById('todo-title').value,
        description: document.getElementById('todo-description').value,
        category: document.getElementById('todo-category').value,
        priority: document.getElementById('todo-priority').value,
        dueDate: document.getElementById('todo-due-date').value,
        tags: document.getElementById('todo-tags').value
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
}
function loadDraft() {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft && !currentEditId) {
        const formData = JSON.parse(draft);
        if (formData.title || formData.description) {
            document.getElementById('todo-title').value = formData.title || '';
            document.getElementById('todo-description').value = formData.description || '';
            document.getElementById('todo-category').value = formData.category || 'Personal';
            document.getElementById('todo-priority').value = formData.priority || 'medium';
            document.getElementById('todo-due-date').value = formData.dueDate || '';
            document.getElementById('todo-tags').value = formData.tags || '';
        }
    }
}
function clearDraft() {
    localStorage.removeItem(DRAFT_KEY);
}
document.addEventListener('DOMContentLoaded', function () {
    const formInputs = ['todo-title', 'todo-description', 'todo-category', 'todo-priority', 'todo-due-date', 'todo-tags'];

    formInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', function () {
                clearTimeout(draftTimeout);
                draftTimeout = setTimeout(saveDraft, 1000);
            });
        }
    });
});
const originalOpenTodoModal = openTodoModal;
openTodoModal = function (todoId = null) {
    originalOpenTodoModal(todoId);
    if (!todoId) {
        setTimeout(loadDraft, 100);
    }
};
const originalHandleTodoSubmit = handleTodoSubmit;
handleTodoSubmit = async function (e) {
    const result = await originalHandleTodoSubmit(e);
    if (result !== false) {
        clearDraft();
    }
    return result;
};
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('/sw.js')
            .then(function (registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function (err) {
                console.log('ServiceWorker registration failed');
            });
    });
}
window.addEventListener('online', function () {
    showNotification('You are back online!', 'success');
});
window.addEventListener('offline', function () {
    showNotification('You are offline. Some features may not work.', 'warning');
});
const observerOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1
};
const todoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, observerOptions);

function observeTodoItems() {
    const todoItems = document.querySelectorAll('.todo-item:not(.observed)');
    todoItems.forEach(item => {
        todoObserver.observe(item);
        item.classList.add('observed');
    });
}
const originalRenderTodos = renderTodos;
renderTodos = function (todosToRender) {
    originalRenderTodos(todosToRender);
    setTimeout(observeTodoItems, 100);
};

const style = document.createElement('style');
style.textContent = `
    .todo-item {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.3s ease, transform 0.3s ease;
    }
    .todo-item.animate-in {
        opacity: 1;
        transform: translateY(0);
    }
`;
document.head.appendChild(style);
// Apply colors from data attributes
document.querySelectorAll('[data-color]').forEach(el => {
    el.style.backgroundColor = el.dataset.color;
});

document.querySelectorAll('[data-category-color]').forEach(el => {
    el.style.backgroundColor = el.dataset.categoryColor;
});
console.log('TodoMaster JavaScript loaded successfully!');