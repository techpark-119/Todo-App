# 📋 TodoMaster - Advanced Task Management Application

<div align="center">

![TodoMaster Logo](https://img.shields.io/badge/TodoMaster-v1.0.0-blue?style=for-the-badge&logo=checkmarx)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)
![Express](https://img.shields.io/badge/Express-4.18+-lightgrey?style=for-the-badge&logo=express)
![EJS](https://img.shields.io/badge/EJS-3.1+-red?style=for-the-badge&logo=ejs)

**A modern, feature-rich todo application with beautiful UI/UX and comprehensive task management capabilities.**

[Demo](#demo) • [Features](#features) • [Installation](#installation) • [Usage](#usage) • [API](#api) • [Contributing](#contributing)

</div>

---

## 🌟 Features

### 🔐 **Authentication & Security**
- 🔒 **Secure User Registration & Login** - Bcrypt password hashing
- 🛡️ **Session Management** - Express sessions with secure cookies
- 👤 **User Isolation** - Each user's data is completely separate

### 📝 **Task Management**
- ✅ **Complete CRUD Operations** - Create, Read, Update, Delete todos
- 🏷️ **Categories & Tags** - Organize tasks with colorful categories and custom tags
- 🚩 **Priority Levels** - High, Medium, Low priority with visual indicators
- 📅 **Due Dates** - Calendar integration with overdue detection
- ✔️ **Task Completion** - Mark tasks as completed with progress tracking

### 🎨 **Modern UI/UX**
- 🌙 **Light/Dark Mode Toggle** - Beautiful theme switching with smooth transitions
- 📱 **Fully Responsive Design** - Perfect experience on desktop, tablet, and mobile
- 🎭 **Glassmorphism & Gradients** - Modern visual effects and styling
- ⚡ **Smooth Animations** - Micro-interactions and loading states
- 🎯 **Drag & Drop Reordering** - Intuitive task organization

### 🔍 **Advanced Functionality**
- 🔎 **Real-time Search** - Instant search with debounced input
- 🎛️ **Multi-filter System** - Filter by category, priority, and completion status
- 📊 **Progress Tracking** - Visual progress bars and statistics dashboard
- 📤 **Data Export** - Download your tasks as JSON for backup
- 💾 **Auto-save Drafts** - Never lose your work while typing
- ⌨️ **Keyboard Shortcuts** - Power user features for efficiency

### 🔔 **Notifications & Feedback**
- 🎉 **Toast Notifications** - Success, error, and info messages
- 📈 **Live Statistics** - Real-time task completion tracking
- 🎨 **Visual Feedback** - Hover effects, loading states, and animations

---

## 🛠️ Technology Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| **Node.js** | Runtime Environment | 18+ |
| **Express.js** | Web Framework | 4.18+ |
| **EJS** | Template Engine | 3.1+ |
| **JSON Files** | Database Storage | - |
| **bcrypt** | Password Hashing | 5.1+ |
| **UUID** | Unique ID Generation | 9.0+ |
| **CSS3** | Styling & Animations | - |
| **JavaScript (ES6+)** | Frontend Logic | - |

---

## 📦 Installation

### Prerequisites
- **Node.js** (v14.0.0 or higher)
- **npm** (comes with Node.js)

### Quick Start

1. **Clone the Repository**
```bash
git clone https://github.com/techpark-119/Todo-App.git
```

2. **Install Dependencies**
```bash
npm install
```

3. **Start the Application**
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

4. **Access the Application**
```
Open your browser and navigate to: http://localhost:3000
```

### 🎯 First Time Setup
1. **Register** a new account on the login page
2. **Create** your first category (optional)
3. **Add** your first todo task
4. **Explore** all the features!

---

## 📁 Project Structure

```
Todo-App/
├── 📄 app.js                 # Main Express server
├── 📄 package.json          # Project dependencies
├── 📄 README.md             # This file
├── 📁 views/                # EJS templates
│   ├── 📄 index.ejs         # Main todo interface
│   └── 📄 auth.ejs          # Authentication page
├── 📁 public/               # Static assets
│   ├── 📄 styles.css        # Main application styles
│   ├── 📄 auth.css          # Authentication styles
│   └── 📄 script.js         # Frontend JavaScript
└── 📁 data/                 # JSON database (auto-created)
    ├── 📄 users.json        # User accounts
    ├── 📄 todos.json        # Todo tasks
    └── 📄 categories.json   # Task categories
```

---

## 🎮 Usage Guide

### 🏠 **Dashboard Overview**
- **Header**: Logo, user welcome, theme toggle, export, logout
- **Sidebar**: Search, filters, statistics, categories
- **Main Area**: Todo list with drag-and-drop functionality

### ➕ **Creating Tasks**
1. Click the **"Add Task"** button
2. Fill in the task details:
   - **Title** (required)
   - **Description** (optional)
   - **Category** (select from existing)
   - **Priority** (High/Medium/Low)
   - **Due Date** (optional)
   - **Tags** (comma-separated)
3. Click **"Save Task"**

### ✏️ **Managing Tasks**
- **Complete**: Check the checkbox next to any task
- **Edit**: Click the edit icon on any task
- **Delete**: Click the delete icon (with confirmation)
- **Reorder**: Drag tasks using the grip handle

### 🎨 **Customization**
- **Theme**: Toggle between light and dark modes
- **Categories**: Create custom categories with colors
- **Filters**: Use search and filters to find specific tasks

### ⌨️ **Keyboard Shortcuts**
| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + N` | Create new task |
| `Ctrl/Cmd + F` | Focus search |
| `Ctrl/Cmd + T` | Toggle theme |
| `Ctrl/Cmd + E` | Export data |
| `Escape` | Close modal |

---

## 🔌 API Endpoints

### Authentication
- `POST /register` - Register new user
- `POST /login` - User login
- `POST /logout` - User logout

### Todos
- `GET /` - Main dashboard (requires auth)
- `POST /api/todos` - Create new todo
- `PUT /api/todos/:id` - Update todo
- `DELETE /api/todos/:id` - Delete todo
- `POST /api/todos/reorder` - Reorder todos

### Categories
- `POST /api/categories` - Create new category

### Utilities
- `GET /api/search` - Search and filter todos
- `GET /api/export` - Export user data

---

## 🎨 Design Features

### **Color Schemes**
- **Light Mode**: Clean whites and soft grays
- **Dark Mode**: Deep blues and elegant darks
- **Accent Colors**: Vibrant gradients and modern palettes

### **Animations**
- **Page Transitions**: Smooth fade-ins and slide effects
- **Hover States**: Interactive button and card effects
- **Loading States**: Professional spinners and skeleton screens
- **Drag & Drop**: Visual feedback during interactions

### **Responsive Design**
- **Desktop**: Full sidebar and multi-column layout
- **Tablet**: Adaptive layout with collapsible sidebar
- **Mobile**: Stack layout with touch-optimized controls

---

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
PORT=3000
SESSION_SECRET=your-super-secret-key-change-this-in-production
NODE_ENV=development
```

### Database Configuration
The application uses JSON files for data storage:
- **Location**: `./data/` directory
- **Auto-creation**: Files are created automatically on first run
- **Backup**: Simply copy the `data` folder

---

## 🚀 Deployment

### **Local Development**
```bash
npm run dev
```

### **Production**
```bash
npm start
```

### **Docker** (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### **Heroku**
```bash
git add .
git commit -m "Deploy to Heroku"
heroku create your-app-name
git push heroku main
```

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Create, edit, delete todos
- [ ] Search and filter functionality
- [ ] Drag and drop reordering
- [ ] Theme switching
- [ ] Data export
- [ ] Responsive design on different devices

### Performance Testing
- **Lighthouse Score**: Aim for 90+ in all categories
- **Load Testing**: Test with 100+ todos
- **Browser Compatibility**: Chrome, Firefox, Safari, Edge

---

## 🐛 Troubleshooting

### Common Issues

**Q: Port 3000 is already in use**
```bash
# Kill process on port 3000
sudo lsof -t -i tcp:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm start
```

**Q: Data files not being created**
- Ensure write permissions in the project directory
- Check console for error messages
- Verify Node.js version compatibility

**Q: Sessions not persisting**
- Check if `SESSION_SECRET` is set
- Verify browser cookies are enabled
- Clear browser cache and cookies

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### **Getting Started**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and ensure code quality
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### **Development Guidelines**
- Follow existing code style and conventions
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation if needed

### **Bug Reports**
Please include:
- Operating system and version
- Node.js version
- Browser and version
- Steps to reproduce
- Expected vs actual behavior

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 TodoMaster Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 👥 Authors & Acknowledgments

### **Created By**
- **Arham Ali** - *Initial work and ongoing development*

### **Special Thanks**
- Font Awesome for the beautiful icons
- Google Fonts for the Inter typeface
- The Node.js and Express.js communities
- All contributors and users

### **Inspiration**
This project was inspired by modern productivity apps like Todoist, Any.do, and TickTick, with a focus on simplicity and powerful features.

---

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/techpark-119/Todo-App?style=social)
![GitHub forks](https://img.shields.io/github/forks/techpark-119/Todo-App?style=social)
![GitHub issues](https://img.shields.io/github/issues/techpark-119/Todo-App)
![GitHub license](https://img.shields.io/github/license/techpark-119/Todo-App)

---

## 🔮 Roadmap

### **Upcoming Features**
- [ ] 📱 Mobile app (React Native)
- [ ] 🔄 Real-time collaboration
- [ ] 📧 Email notifications
- [ ] 🗂️ File attachments
- [ ] 📊 Advanced analytics
- [ ] 🔗 Third-party integrations
- [ ] 🌐 Multi-language support

### **Version History**
- **v1.0.0** - Initial release with core features
- **v1.1.0** - Coming soon: Mobile optimizations
- **v2.0.0** - Planned: Real-time features

---

<div align="center">

**Made with ❤️ by the TodoMaster Team**

[⭐ Star this repo](https://github.com/techpark-119/Todo-App) • [🐛 Report Bug](https://github.com/techpark-119/Todo-App/issues) • [✨ Request Feature](https://github.com/techpark-119/Todo-App/issues)

</div>