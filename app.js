const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const bcrypt = require('bcrypt');
const session = require('express-session');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;
const USERS_DB = path.join(__dirname, 'data', 'users.json');
const TODOS_DB = path.join(__dirname, 'data', 'todos.json');
const CATEGORIES_DB = path.join(__dirname, 'data', 'categories.json');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    secret: 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
async function initializeDB() {
    try {
        await fs.mkdir('data', { recursive: true });
        try {
            await fs.access(USERS_DB);
        } catch {
            await fs.writeFile(USERS_DB, JSON.stringify([], null, 2));
        }
        try {
            await fs.access(TODOS_DB);
        } catch {
            await fs.writeFile(TODOS_DB, JSON.stringify([], null, 2));
        }
        try {
            await fs.access(CATEGORIES_DB);
        } catch {
            const defaultCategories = [
                { id: '1', name: 'Work', color: '#ff6b6b', userId: null },
                { id: '2', name: 'Personal', color: '#4ecdc4', userId: null },
                { id: '3', name: 'Shopping', color: '#45b7d1', userId: null },
                { id: '4', name: 'Health', color: '#96ceb4', userId: null }
            ];
            await fs.writeFile(CATEGORIES_DB, JSON.stringify(defaultCategories, null, 2));
        }
    } catch (error) {
        console.error('Error initializing database:', error);
    }
}
async function readDB(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
        return [];
    }
}
async function writeDB(filePath, data) {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Error writing ${filePath}:`, error);
        return false;
    }
}
function requireAuth(req, res, next) {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/login');
    }
}
app.get('/', requireAuth, async (req, res) => {
    try {
        const todos = await readDB(TODOS_DB);
        const categories = await readDB(CATEGORIES_DB);
        const userTodos = todos.filter(todo => todo.userId === req.session.userId);
        const userCategories = categories.filter(cat => cat.userId === req.session.userId || cat.userId === null);
        res.render('index', {
            todos: userTodos,
            categories: userCategories,
            user: req.session.user
        });
    } catch (error) {
        console.error('Error loading todos:', error);
        res.status(500).send('Error loading todos');
    }
});
app.get('/login', (req, res) => {
    res.render('auth', { mode: 'login', error: null });
});
app.get('/register', (req, res) => {
    res.render('auth', { mode: 'register', error: null });
});
app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const users = await readDB(USERS_DB);
        const existingUser = users.find(u => u.email === email || u.username === username);
        if (existingUser) {
            return res.render('auth', {
                mode: 'register',
                error: 'Username or email already exists'
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            id: uuidv4(),
            username,
            email,
            password: hashedPassword,
            createdAt: new Date().toISOString()
        };
        users.push(newUser);
        await writeDB(USERS_DB, users);
        req.session.userId = newUser.id;
        req.session.user = { username: newUser.username, email: newUser.email };
        res.redirect('/');
    } catch (error) {
        console.error('Registration error:', error);
        res.render('auth', { mode: 'register', error: 'Registration failed' });
    }
});
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const users = await readDB(USERS_DB);
        const user = users.find(u => u.email === email);
        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.render('auth', {
                mode: 'login',
                error: 'Invalid email or password'
            });
        }
        req.session.userId = user.id;
        req.session.user = { username: user.username, email: user.email };
        res.redirect('/');
    } catch (error) {
        console.error('Login error:', error);
        res.render('auth', { mode: 'login', error: 'Login failed' });
    }
});
app.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});
app.post('/api/todos', requireAuth, async (req, res) => {
    try {
        const { title, description, category, priority, dueDate, tags } = req.body;
        const todos = await readDB(TODOS_DB);
        const newTodo = {
            id: uuidv4(),
            title,
            description: description || '',
            category: category || 'Personal',
            priority: priority || 'medium',
            dueDate: dueDate || null,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            completed: false,
            userId: req.session.userId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            order: todos.filter(t => t.userId === req.session.userId).length
        };
        todos.push(newTodo);
        await writeDB(TODOS_DB, todos);
        res.json({ success: true, todo: newTodo });
    } catch (error) {
        console.error('Error creating todo:', error);
        res.status(500).json({ success: false, error: 'Failed to create todo' });
    }
});
app.put('/api/todos/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const todos = await readDB(TODOS_DB);
        const todoIndex = todos.findIndex(t => t.id === id && t.userId === req.session.userId);
        if (todoIndex === -1) {
            return res.status(404).json({ success: false, error: 'Todo not found' });
        }
        todos[todoIndex] = {
            ...todos[todoIndex],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        await writeDB(TODOS_DB, todos);
        res.json({ success: true, todo: todos[todoIndex] });
    } catch (error) {
        console.error('Error updating todo:', error);
        res.status(500).json({ success: false, error: 'Failed to update todo' });
    }
});
app.delete('/api/todos/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const todos = await readDB(TODOS_DB);
        const filteredTodos = todos.filter(t => !(t.id === id && t.userId === req.session.userId));
        if (filteredTodos.length === todos.length) {
            return res.status(404).json({ success: false, error: 'Todo not found' });
        }
        await writeDB(TODOS_DB, filteredTodos);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting todo:', error);
        res.status(500).json({ success: false, error: 'Failed to delete todo' });
    }
});
app.post('/api/todos/reorder', requireAuth, async (req, res) => {
    try {
        const { todoIds } = req.body;
        const todos = await readDB(TODOS_DB);
        const userTodos = todos.filter(t => t.userId === req.session.userId);
        const otherTodos = todos.filter(t => t.userId !== req.session.userId);
        todoIds.forEach((id, index) => {
            const todo = userTodos.find(t => t.id === id);
            if (todo) {
                todo.order = index;
            }
        });
        const updatedTodos = [...otherTodos, ...userTodos];
        await writeDB(TODOS_DB, updatedTodos);
        res.json({ success: true });
    } catch (error) {
        console.error('Error reordering todos:', error);
        res.status(500).json({ success: false, error: 'Failed to reorder todos' });
    }
});
app.post('/api/categories', requireAuth, async (req, res) => {
    try {
        const { name, color } = req.body;
        const categories = await readDB(CATEGORIES_DB);
        const newCategory = {
            id: uuidv4(),
            name,
            color: color || '#4ecdc4',
            userId: req.session.userId
        };
        categories.push(newCategory);
        await writeDB(CATEGORIES_DB, categories);
        res.json({ success: true, category: newCategory });
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ success: false, error: 'Failed to create category' });
    }
});
app.get('/api/export', requireAuth, async (req, res) => {
    try {
        const todos = await readDB(TODOS_DB);
        const categories = await readDB(CATEGORIES_DB);
        const userTodos = todos.filter(todo => todo.userId === req.session.userId);
        const userCategories = categories.filter(cat => cat.userId === req.session.userId);
        const exportData = {
            todos: userTodos,
            categories: userCategories,
            exportedAt: new Date().toISOString(),
            user: req.session.user
        };
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename="todos-export.json"');
        res.json(exportData);
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ success: false, error: 'Export failed' });
    }
});
app.get('/api/search', requireAuth, async (req, res) => {
    try {
        const { q, category, priority, completed } = req.query;
        const todos = await readDB(TODOS_DB);
        let results = todos.filter(todo => todo.userId === req.session.userId);
        if (q) {
            const query = q.toLowerCase();
            results = results.filter(todo =>
                todo.title.toLowerCase().includes(query) ||
                todo.description.toLowerCase().includes(query) ||
                todo.tags.some(tag => tag.toLowerCase().includes(query))
            );
        }
        if (category) {
            results = results.filter(todo => todo.category === category);
        }
        if (priority) {
            results = results.filter(todo => todo.priority === priority);
        }
        if (completed !== undefined) {
            results = results.filter(todo => todo.completed === (completed === 'true'));
        }
        res.json({ success: true, todos: results });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ success: false, error: 'Search failed' });
    }
});
initializeDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Todo app running on http://localhost:${PORT}`);
    });
});