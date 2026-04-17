
        // Mock Data
        let projects = [
            { id: 1, title: "Website Redesign", status: "Active", progress: 65, dueDate: "2026-05-15", budget: 500000, tasks: [
                { id: 101, title: "Wireframes", assignee: "Alice", priority: "High", completed: true },
                { id: 102, title: "Mockups", assignee: "Bob", priority: "Medium", completed: false },
                { id: 103, title: "Frontend Dev", assignee: "Charlie", priority: "High", completed: false }
            ]},
            { id: 2, title: "Mobile App MVP", status: "Planning", progress: 15, dueDate: "2026-08-01", budget: 300000, tasks: [
                { id: 201, title: "User Research", assignee: "Alice", priority: "High", completed: true },
                { id: 202, title: "Database Schema", assignee: "Dave", priority: "High", completed: false }
            ]},
            { id: 3, title: "Marketing Campaign", status: "Completed", progress: 100, dueDate: "2026-04-01", budget: 200000, tasks: [
                { id: 301, title: "Ad Copy", assignee: "Eve", priority: "Medium", completed: true },
                { id: 302, title: "Social Media Assets", assignee: "Bob", priority: "Low", completed: true }
            ]},
            { id: 4, title: "Substation", status: "Active", progress: 40, dueDate: "2026-07-04", budget: 0, tasks: [
                { id: 401, title: "Data Collection", assignee: "Frank", priority: "High", completed: true },
                { id: 402, title: "Analysis", assignee: "Frank", priority: "High", completed: false }
            ]}
        ];

        // DOM Elements
        const contentArea = document.getElementById('contentArea');
        const themeToggle = document.getElementById('themeToggle');
        const htmlEl = document.documentElement;
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileDrawer = document.getElementById('mobileDrawer');
        const subNavBar = document.getElementById('subNavBar');
        const mobileSubNav = document.getElementById('mobileSubNav');
        const selectedProjectName = document.getElementById('selectedProjectName');
        const breadcrumbProjectName = document.getElementById('breadcrumbProjectName');
        
        const newProjectModal = document.getElementById('newProjectModal');
        const closeModalBtn = document.getElementById('closeModalBtn');
        const cancelModalBtn = document.getElementById('cancelModalBtn');
        const newProjectForm = document.getElementById('newProjectForm');

        let currentProjectId = null;
        let currentCalendarDate = new Date();
        let selectedCalendarDate = new Date();

        // Theme Management
        const savedTheme = localStorage.getItem('theme') || 'light';
        htmlEl.setAttribute('data-theme', savedTheme);

        themeToggle.addEventListener('click', () => {
            const currentTheme = htmlEl.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            htmlEl.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });

        // Mobile Menu
        mobileMenuBtn.addEventListener('click', () => {
            mobileDrawer.classList.toggle('open');
        });

        // Close drawer when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileDrawer.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                mobileDrawer.classList.remove('open');
            }
        });

        // Modal Management
        window.openModal = () => newProjectModal.classList.add('active');
        const closeModal = () => {
            newProjectModal.classList.remove('active');
            newProjectForm.reset();
        };

        closeModalBtn.addEventListener('click', closeModal);
        cancelModalBtn.addEventListener('click', closeModal);
        newProjectModal.addEventListener('click', (e) => {
            if (e.target === newProjectModal) closeModal();
        });

        // Form Submission
        newProjectForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('projTitle').value;
            const status = document.getElementById('projStatus').value;
            const dueDate = document.getElementById('projDate').value;
            const budgetVal = document.getElementById('projBudget').value;
            
            const newProject = {
                id: Date.now(),
                title,
                status,
                progress: 0,
                dueDate,
                budget: budgetVal ? parseInt(budgetVal, 10) : 0,
                tasks: []
            };
            
            projects.unshift(newProject);
            closeModal();
            if (currentView === 'projects') renderProjectsView();
            else renderDashboard();
        });

        let sortBy = 'dueDate';
        let sortAsc = true;
        let currentView = 'dashboard';

        function getKPIs() {
            const total = projects.length;
            const active = projects.filter(p => p.status === 'Active').length;
            const completed = projects.filter(p => p.status === 'Completed').length;
            const avgProgress = total === 0 ? 0 : Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / total);
            return { total, active, completed, avgProgress };
        }

        function sortProjects(projectsArray) {
            return [...projectsArray].sort((a, b) => {
                let valA = a[sortBy];
                let valB = b[sortBy];
                
                if (sortBy === 'dueDate') {
                    valA = new Date(valA).getTime();
                    valB = new Date(valB).getTime();
                } else if (sortBy === 'title' || sortBy === 'status') {
                    valA = valA.toLowerCase();
                    valB = valB.toLowerCase();
                }

                if (valA < valB) return sortAsc ? -1 : 1;
                if (valA > valB) return sortAsc ? 1 : -1;
                return 0;
            });
        }

        window.handleSortChange = function(value) {
            sortBy = value;
            if (currentView === 'dashboard') renderDashboard();
            else if (currentView === 'projects') renderProjectsView();
        }

        window.toggleSortDirection = function() {
            sortAsc = !sortAsc;
            if (currentView === 'dashboard') renderDashboard();
            else if (currentView === 'projects') renderProjectsView();
        }

        window.goBack = function() {
            if (currentView === 'projects') renderProjectsView();
            else renderDashboard();
        }

        function generateProjectCardsHtml(projectsToRender) {
            let html = '<div class="project-grid">';
            projectsToRender.forEach(p => {
                const statusClass = p.status.toLowerCase();
                html += `
                    <div class="project-card" onclick="renderProjectView(${p.id})">
                        <div class="card-header">
                            <div>
                                <h3 class="card-title">${p.title}</h3>
                                <div class="card-subtitle">Due: ${new Date(p.dueDate).toLocaleDateString()}</div>
                            </div>
                            <span class="badge ${statusClass}">${p.status}</span>
                        </div>
                        <div class="progress-container">
                            <div class="progress-header">
                                <span>Progress</span>
                                <span>${p.progress}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${p.progress}%"></div>
                            </div>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            return html;
        }

        // Render Dashboard (KPIs + Project Grid)
        window.renderDashboard = function() {
            currentView = 'dashboard';
            currentProjectId = null;
            updateSubNavVisibility();
            
            const total = projects.length;
            const active = projects.filter(p => p.status === 'Active').length;
            const planning = projects.filter(p => p.status === 'Planning').length;
            
            const todayStr = new Date().toISOString().split('T')[0];
            const dueToday = projects.filter(p => p.dueDate === todayStr).length;
            
            const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
            const withBudget = projects.filter(p => (p.budget || 0) > 0).length;
            
            const formatCurrency = (val) => '₱' + val.toLocaleString();

            let html = `
                <div class="dashboard-header">
                    <div class="dashboard-title">
                        <h1>Dashboard</h1>
                        <p>Manage your projects and track project status</p>
                    </div>
                    <div style="display: flex; gap: 16px; align-items: center;">
                        <button class="btn btn-primary desktop-only" onclick="openModal()">+ New Project</button>
                        <a href="#" class="view-all-link" onclick="renderProjectsView(); return false;">View All Projects &rarr;</a>
                    </div>
                </div>
                
                <div class="kpi-grid">
                    <div class="kpi-card">
                        <div class="kpi-card-header">
                            <div class="kpi-label">Active Projects</div>
                            <div class="kpi-icon blue">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="9" y1="14" x2="15" y2="14"/></svg>
                            </div>
                        </div>
                        <div class="kpi-value">${active} / ${total}</div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-card-header">
                            <div class="kpi-label">Creating Projects</div>
                            <div class="kpi-icon yellow">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            </div>
                        </div>
                        <div class="kpi-value">${planning}</div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-card-header">
                            <div class="kpi-label">Due Today</div>
                            <div class="kpi-icon green">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                            </div>
                        </div>
                        <div class="kpi-value">${dueToday}</div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-card-header">
                            <div class="kpi-label">Total Budget</div>
                            <div class="kpi-icon purple">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"/></svg>
                            </div>
                        </div>
                        <div class="kpi-value">${formatCurrency(totalBudget)}</div>
                    </div>
                </div>

                <div class="dashboard-content">
                    <div class="dashboard-panel">
                        <div class="panel-header">
                            <div class="panel-title">Active Projects</div>
                            <a href="#" class="panel-link" onclick="renderProjectsView(); return false;">View all</a>
                        </div>
                        <div class="panel-body">
            `;

            const activeProjects = projects.filter(p => p.status === 'Active');
            if (activeProjects.length === 0) {
                html += `<div class="empty-state">No active projects found.</div>`;
            } else {
                activeProjects.forEach(p => {
                    html += `
                        <div class="active-project-item">
                            <div>
                                <div style="font-weight: 500">${p.title}</div>
                                <div style="font-size: 0.85rem; color: var(--text-muted)">Due: ${new Date(p.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                            </div>
                            <button class="btn btn-secondary" style="padding: 4px 12px; font-size: 0.8rem" onclick="renderProjectView(${p.id})">View</button>
                        </div>
                    `;
                });
            }

            html += `
                        </div>
                    </div>
                    
                    <div class="dashboard-sidebar">
                        <div class="dashboard-panel" style="margin-bottom: 20px;">
                            <div class="panel-header">
                                <div class="panel-title">Upcoming Deadlines</div>
                            </div>
                            <div class="panel-body">
            `;

            // Sort by due date ascending
            const upcoming = [...projects].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).slice(0, 3);
            if (upcoming.length === 0) {
                html += `<div class="empty-state">No upcoming deadlines.</div>`;
            } else {
                upcoming.forEach(p => {
                    html += `
                        <div class="deadline-item">
                            <div class="deadline-title">${p.title}</div>
                            <div class="deadline-date">${new Date(p.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                        </div>
                    `;
                });
            }

            html += `
                            </div>
                        </div>
                        
                        <div class="dashboard-panel">
                            <div class="panel-header">
                                <div class="panel-title">Budget Snapshot</div>
                            </div>
                            <div class="panel-body">
                                <div class="budget-list">
                                    <div class="budget-item">
                                        <span class="budget-item-label">Total Projects</span>
                                        <span class="budget-item-value">${total}</span>
                                    </div>
                                    <div class="budget-item">
                                        <span class="budget-item-label">With Budget</span>
                                        <span class="budget-item-value">${withBudget}</span>
                                    </div>
                                    <div class="budget-item">
                                        <span class="budget-item-label">Total Budget</span>
                                        <span class="budget-item-value">${formatCurrency(totalBudget)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            contentArea.innerHTML = html;
        }

        // Render Projects View (Just Project Grid)
        window.renderProjectsView = function() {
            currentView = 'projects';
            currentProjectId = null;
            updateSubNavVisibility();
            
            const sortedProjects = sortProjects(projects);
            
            let html = `
                <div class="view-header">
                    <h1>All Projects</h1>
                    <div style="display: flex; gap: 16px; align-items: center;">
                        <button class="btn btn-primary" onclick="openModal()">+ New Project</button>
                        <div class="sort-controls">
                            <label>Sort by:</label>
                            <select id="sortSelect" onchange="handleSortChange(this.value)">
                                <option value="dueDate" ${sortBy === 'dueDate' ? 'selected' : ''}>Due Date</option>
                                <option value="title" ${sortBy === 'title' ? 'selected' : ''}>Title</option>
                                <option value="status" ${sortBy === 'status' ? 'selected' : ''}>Status</option>
                            </select>
                            <button class="btn btn-secondary sort-btn" onclick="toggleSortDirection()">
                                ${sortAsc ? '↑ Asc' : '↓ Desc'}
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            html += generateProjectCardsHtml(sortedProjects);
            contentArea.innerHTML = html;
        }

        // Render Single Project (Task List)
        window.renderProjectView = function(projectId) {
            const project = projects.find(p => p.id === projectId);
            if (!project) return;
            
            currentView = 'project_detail';
            currentProjectId = projectId;
            updateSubNavVisibility();
            
            let html = `
                <div class="view-header" style="display: flex; justify-content: space-between; align-items: center;">
                    <h1>${project.title} - Tasks</h1>
                    <button class="btn btn-primary" onclick="openModal()">+ New Task</button>
                </div>
                <div class="task-list">
            `;
            
            if (project.tasks.length === 0) {
                html += `<div style="padding: 24px; color: var(--text-muted);">No tasks yet.</div>`;
            } else {
                project.tasks.forEach(t => {
                    const priorityClass = `priority-${t.priority.toLowerCase()}`;
                    html += `
                        <div class="task-item ${t.completed ? 'completed' : ''}">
                            <input type="checkbox" class="task-checkbox" ${t.completed ? 'checked' : ''} onchange="toggleTask(${project.id}, ${t.id})">
                            <div class="task-content">
                                <div class="task-title">${t.title}</div>
                                <div class="task-meta">
                                    <span>Assignee: ${t.assignee}</span>
                                    <span class="task-priority ${priorityClass}">
                                        Priority: ${t.priority}
                                    </span>
                                </div>
                            </div>
                        </div>
                    `;
                });
            }
            
            html += `</div>`;
            contentArea.innerHTML = html;
        }

        // Toggle Task Completion
        window.toggleTask = function(projectId, taskId) {
            const project = projects.find(p => p.id === projectId);
            const task = project.tasks.find(t => t.id === taskId);
            if (task) {
                task.completed = !task.completed;
                // Update progress
                if (project.tasks.length > 0) {
                    const completedTasks = project.tasks.filter(t => t.completed).length;
                    project.progress = Math.round((completedTasks / project.tasks.length) * 100);
                    if (project.progress === 100) project.status = 'Completed';
                    else if (project.progress > 0) project.status = 'Active';
                    else project.status = 'Planning';
                }
                
                renderProjectView(projectId);
            }
        }

        window.renderTasksView = function(tab = 'kanban') {
            currentView = 'tasks';
            currentProjectId = null;
            updateSubNavVisibility();
            
            // Gather all tasks from all projects for the global view
            let allTasks = [];
            projects.forEach(p => {
                p.tasks.forEach(t => {
                    allTasks.push({...t, projectName: p.title});
                });
            });

            const todoTasks = allTasks.filter(t => !t.completed && t.priority !== 'High');
            const inProgressTasks = allTasks.filter(t => !t.completed && t.priority === 'High'); // Just for demo distribution
            const reviewTasks = [];
            const completedTasks = allTasks.filter(t => t.completed);

            let html = `
                <div class="view-header">
                    <div>
                        <h1>Tasks</h1>
                        <div style="color: var(--text-muted); font-size: 0.9rem; margin-top: 4px;">Track work items and execution</div>
                    </div>
                    <div style="display: flex; gap: 12px; align-items: center;">
                        <div style="display: flex; gap: 16px; font-size: 0.85rem; font-weight: 600; margin-right: 16px;">
                            <span>${allTasks.length} <span style="color:var(--text-muted)">Total Tasks</span></span>
                            <span style="color: #0052cc">${todoTasks.length} <span style="color:var(--text-muted)">To Do</span></span>
                            <span style="color: #ff9900">${inProgressTasks.length} <span style="color:var(--text-muted)">In Progress</span></span>
                            <span style="color: #9933ff">${reviewTasks.length} <span style="color:var(--text-muted)">Review</span></span>
                            <span style="color: #00b300">${completedTasks.length} <span style="color:var(--text-muted)">Completed</span></span>
                        </div>
                        <button class="btn btn-primary">+ New Task</button>
                    </div>
                </div>
                
                <div style="margin-bottom: 24px; display: flex; gap: 8px;">
                    <button class="btn btn-secondary" style="background: var(--bg-surface); ${tab === 'kanban' ? 'border-color: var(--primary); color: var(--primary);' : ''}" onclick="renderTasksView('kanban')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg> Kanban</button>
                    <button class="btn btn-secondary" style="background: var(--bg-surface); ${tab === 'list' ? 'border-color: var(--primary); color: var(--primary);' : ''}" onclick="renderTasksView('list')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> List</button>
                    <button class="btn btn-secondary" style="background: var(--bg-surface); ${tab === 'timeline' ? 'border-color: var(--primary); color: var(--primary);' : ''}" onclick="renderTasksView('timeline')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> Timeline</button>
                </div>
            `;

            if (tab === 'kanban') {
                html += `
                <div class="kanban-board">
                    <div class="kanban-column todo" ondragover="allowDrop(event)" ondrop="dropTask(event, 'Planning')">
                        <div class="kanban-header">
                            <span>To Do</span>
                            <span class="kanban-count">${todoTasks.length}</span>
                        </div>
                        <div class="kanban-body">
                            ${todoTasks.map(t => `
                                <div class="kanban-card" draggable="true" ondragstart="dragTask(event, ${t.id})">
                                    <div class="kanban-card-title">${t.title}</div>
                                    <div style="display: flex; justify-content: space-between; align-items: center;">
                                        <span class="kanban-badge medium">${t.priority}</span>
                                        <span style="font-size: 0.75rem; color: var(--text-muted);">${t.projectName}</span>
                                    </div>
                                </div>
                            `).join('')}
                            ${todoTasks.length === 0 ? '<div class="kanban-empty">Drop tasks here</div>' : ''}
                        </div>
                    </div>
                    
                    <div class="kanban-column in-progress" ondragover="allowDrop(event)" ondrop="dropTask(event, 'Active')">
                        <div class="kanban-header">
                            <span>In Progress</span>
                            <span class="kanban-count">${inProgressTasks.length}</span>
                        </div>
                        <div class="kanban-body">
                            ${inProgressTasks.map(t => `
                                <div class="kanban-card" draggable="true" ondragstart="dragTask(event, ${t.id})">
                                    <div class="kanban-card-title">${t.title}</div>
                                    <div style="display: flex; justify-content: space-between; align-items: center;">
                                        <span class="kanban-badge medium" style="color: #ff3333; background: rgba(255,51,51,0.1); border-color: rgba(255,51,51,0.2)">${t.priority}</span>
                                        <span style="font-size: 0.75rem; color: var(--text-muted);">${t.projectName}</span>
                                    </div>
                                </div>
                            `).join('')}
                            ${inProgressTasks.length === 0 ? '<div class="kanban-empty">Drop tasks here</div>' : ''}
                        </div>
                    </div>
                    
                    <div class="kanban-column review" ondragover="allowDrop(event)" ondrop="dropTask(event, 'Review')">
                        <div class="kanban-header">
                            <span>Review</span>
                            <span class="kanban-count">${reviewTasks.length}</span>
                        </div>
                        <div class="kanban-body">
                            ${reviewTasks.length === 0 ? '<div class="kanban-empty">Drop tasks here</div>' : ''}
                        </div>
                    </div>
                    
                    <div class="kanban-column completed" ondragover="allowDrop(event)" ondrop="dropTask(event, 'Completed')">
                        <div class="kanban-header">
                            <span>Completed</span>
                            <span class="kanban-count">${completedTasks.length}</span>
                        </div>
                        <div class="kanban-body">
                            ${completedTasks.map(t => `
                                <div class="kanban-card" draggable="true" ondragstart="dragTask(event, ${t.id})" style="opacity: 0.7">
                                    <div class="kanban-card-title" style="text-decoration: line-through; color: var(--text-muted)">${t.title}</div>
                                    <div style="display: flex; justify-content: space-between; align-items: center;">
                                        <span class="kanban-badge" style="background: rgba(0,179,0,0.1); color: #00b300; border: 1px solid rgba(0,179,0,0.2)">Done</span>
                                        <span style="font-size: 0.75rem; color: var(--text-muted);">${t.projectName}</span>
                                    </div>
                                </div>
                            `).join('')}
                            ${completedTasks.length === 0 ? '<div class="kanban-empty">Drop tasks here</div>' : ''}
                        </div>
                    </div>
                </div>
                `;
            } else if (tab === 'list') {
                html += `
                <div style="background: var(--bg-surface); border-radius: var(--radius-md); border: 1px solid var(--border-color); overflow: hidden;">
                    <table style="width: 100%; border-collapse: collapse; text-align: left;">
                        <thead style="background: var(--bg-body); border-bottom: 1px solid var(--border-color);">
                            <tr>
                                <th style="padding: 12px 16px; font-weight: 600; color: var(--text-muted); font-size: 0.85rem;">Task Name</th>
                                <th style="padding: 12px 16px; font-weight: 600; color: var(--text-muted); font-size: 0.85rem;">Project</th>
                                <th style="padding: 12px 16px; font-weight: 600; color: var(--text-muted); font-size: 0.85rem;">Status</th>
                                <th style="padding: 12px 16px; font-weight: 600; color: var(--text-muted); font-size: 0.85rem;">Priority</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${allTasks.map(t => `
                                <tr style="border-bottom: 1px solid var(--border-color);">
                                    <td style="padding: 12px 16px; font-weight: 500;">${t.title}</td>
                                    <td style="padding: 12px 16px; color: var(--text-muted); font-size: 0.9rem;">${t.projectName}</td>
                                    <td style="padding: 12px 16px;"><span class="kanban-badge" style="${t.completed ? 'background: rgba(0,179,0,0.1); color: #00b300; border: 1px solid rgba(0,179,0,0.2);' : 'background: rgba(0,82,204,0.1); color: #0052cc; border: 1px solid rgba(0,82,204,0.2);'}">${t.completed ? 'Done' : 'Active'}</span></td>
                                    <td style="padding: 12px 16px;"><span class="kanban-badge medium" style="${t.priority === 'High' ? 'color: #ff3333; background: rgba(255,51,51,0.1); border-color: rgba(255,51,51,0.2)' : ''}">${t.priority}</span></td>
                                </tr>
                            `).join('')}
                            ${allTasks.length === 0 ? '<tr><td colspan="4" style="padding: 24px; text-align: center; color: var(--text-muted);">No tasks found.</td></tr>' : ''}
                        </tbody>
                    </table>
                </div>
                `;
            } else if (tab === 'timeline') {
                html += `
                <div style="background: var(--bg-surface); border-radius: var(--radius-md); border: 1px solid var(--border-color); padding: 24px; height: calc(100vh - 280px); overflow-y: auto;">
                    <div style="color: var(--text-muted); margin-bottom: 24px; font-size: 0.9rem;">Timeline View (Gantt Chart representation)</div>
                    <div style="display: flex; flex-direction: column; gap: 16px;">
                        ${allTasks.map((t, i) => `
                            <div style="display: flex; align-items: center; gap: 16px;">
                                <div style="width: 250px; font-size: 0.9rem; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                    ${t.title}
                                    <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: normal;">${t.projectName}</div>
                                </div>
                                <div style="flex: 1; background: var(--bg-body); height: 28px; border-radius: 14px; position: relative; border: 1px solid var(--border-color);">
                                    <div style="position: absolute; left: ${Math.random() * 30}%; width: ${20 + Math.random() * 40}%; height: 100%; background: ${t.completed ? '#00b300' : 'var(--primary)'}; border-radius: 14px; opacity: 0.8; display: flex; align-items: center; padding: 0 12px; color: white; font-size: 0.75rem; font-weight: 600;">
                                        ${t.completed ? 'Completed' : 'Scheduled'}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                `;
            }
            
            contentArea.innerHTML = html;
        }

        window.renderCalendarView = function(tab = 'month') {
            currentView = 'calendar';
            currentProjectId = null;
            updateSubNavVisibility();

            const viewDate = new Date(currentCalendarDate);
            const currentMonthName = viewDate.toLocaleString('default', { month: 'long' });
            const currentYear = viewDate.getFullYear();
            const currentMonth = viewDate.getMonth();
            
            let html = `
                <div class="view-header">
                    <div>
                        <h1>Calendar</h1>
                        <div style="color: var(--text-muted); font-size: 0.9rem; margin-top: 4px;">Schedule and timeline overview</div>
                    </div>
                </div>
                
                <div style="margin-bottom: 24px; display: flex; gap: 8px;">
                    <button class="btn btn-secondary" style="background: var(--bg-surface); ${tab === 'month' ? 'border-color: var(--primary); color: var(--primary);' : ''}" onclick="renderCalendarView('month')">Month</button>
                    <button class="btn btn-secondary" style="background: var(--bg-surface); ${tab === 'week' ? 'border-color: var(--primary); color: var(--primary);' : ''}" onclick="renderCalendarView('week')">Week</button>
                    <button class="btn btn-secondary" style="background: var(--bg-surface); ${tab === 'day' ? 'border-color: var(--primary); color: var(--primary);' : ''}" onclick="renderCalendarView('day')">Day</button>
                </div>

                <div class="calendar-layout">
                    <div class="calendar-main">
            `;

            if (tab === 'month') {
                const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
                const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
                const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

                let emptyCells = '';
                for (let i = 0; i < firstDayOfMonth; i++) {
                    const day = daysInPrevMonth - firstDayOfMonth + i + 1;
                    emptyCells += `<div class="calendar-cell muted"><div class="calendar-date">${day}</div></div>`;
                }

                let calendarCells = '';
                for (let i = 1; i <= daysInMonth; i++) {
                    let cellClass = 'calendar-cell';
                    let content = `<div class="calendar-date">${i}</div>`;
                    
                    const cellDate = new Date(currentYear, currentMonth, i);
                    const isToday = cellDate.toDateString() === new Date().toDateString();
                    const isSelected = cellDate.toDateString() === selectedCalendarDate.toDateString();
                    
                    if (isToday) cellClass += ' today';
                    if (isSelected) cellClass += ' selected';
                    
                    // Add events from projects
                    const dateStr = cellDate.toISOString().split('T')[0];
                    const deadlines = projects.filter(p => p.dueDate === dateStr);
                    deadlines.forEach(p => {
                        content += `<div class="calendar-event" style="font-size: 0.7rem; background: rgba(0,82,204,0.1); color: var(--primary); padding: 2px 4px; border-radius: 4px; margin-bottom: 4px; border-left: 2px solid var(--primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.title}</div>`;
                    });

                    calendarCells += `<div class="${cellClass}" onclick="selectCalendarDate(${currentYear}, ${currentMonth}, ${i})">${content}</div>`;
                }
                
                const totalCells = firstDayOfMonth + daysInMonth;
                const remainingCells = Math.ceil(totalCells / 7) * 7 - totalCells;
                let endEmptyCells = '';
                for (let i = 1; i <= remainingCells; i++) {
                    endEmptyCells += `<div class="calendar-cell muted"><div class="calendar-date">${i}</div></div>`;
                }

                html += `
                        <div class="calendar-header-row">
                            <h2 style="margin: 0; font-size: 1.25rem;">${currentMonthName} ${currentYear}</h2>
                            <div style="display: flex; gap: 8px;">
                                <button class="btn btn-secondary" style="padding: 4px 8px;" onclick="changeCalendarMonth(-1)">&lt;</button>
                                <button class="btn btn-secondary" style="padding: 4px 8px;" onclick="changeCalendarMonth(1)">&gt;</button>
                            </div>
                        </div>
                        <div class="calendar-grid">
                            <div class="calendar-day-header">Sun</div>
                            <div class="calendar-day-header">Mon</div>
                            <div class="calendar-day-header">Tue</div>
                            <div class="calendar-day-header">Wed</div>
                            <div class="calendar-day-header">Thu</div>
                            <div class="calendar-day-header">Fri</div>
                            <div class="calendar-day-header">Sat</div>
                            ${emptyCells}
                            ${calendarCells}
                            ${endEmptyCells}
                        </div>
                `;
            } else if (tab === 'week') {
                // Week view logic (simplified for demo)
                html += `
                        <div class="calendar-header-row">
                            <h2 style="margin: 0; font-size: 1.25rem;">Week of ${currentMonthName} ${currentYear}</h2>
                            <div style="display: flex; gap: 8px;">
                                <button class="btn btn-secondary" style="padding: 4px 8px;" onclick="changeCalendarMonth(-1)">&lt;</button>
                                <button class="btn btn-secondary" style="padding: 4px 8px;" onclick="changeCalendarMonth(1)">&gt;</button>
                            </div>
                        </div>
                        <div style="display: grid; grid-template-columns: 60px repeat(7, 1fr); background: var(--bg-body); border-bottom: 1px solid var(--border-color);">
                            <div class="calendar-day-header" style="border-right: 1px solid var(--border-color);">Time</div>
                            <div class="calendar-day-header">Sun</div>
                            <div class="calendar-day-header">Mon</div>
                            <div class="calendar-day-header">Tue</div>
                            <div class="calendar-day-header">Wed</div>
                            <div class="calendar-day-header">Thu</div>
                            <div class="calendar-day-header">Fri</div>
                            <div class="calendar-day-header">Sat</div>
                        </div>
                        <div style="flex: 1; overflow-y: auto; display: grid; grid-template-columns: 60px repeat(7, 1fr);">
                            ${Array.from({length: 12}).map((_, i) => `
                                <div style="border-right: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); padding: 8px; font-size: 0.75rem; color: var(--text-muted); text-align: right;">${i + 8} AM</div>
                                ${Array.from({length: 7}).map((_, j) => `
                                    <div style="border-right: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); padding: 4px; min-height: 60px; position: relative;">
                                    </div>
                                `).join('')}
                            `).join('')}
                        </div>
                `;
            } else if (tab === 'day') {
                html += `
                        <div class="calendar-header-row">
                            <h2 style="margin: 0; font-size: 1.25rem;">${selectedCalendarDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</h2>
                            <div style="display: flex; gap: 8px;">
                                <button class="btn btn-secondary" style="padding: 4px 8px;" onclick="changeCalendarDay(-1)">&lt;</button>
                                <button class="btn btn-secondary" style="padding: 4px 8px;" onclick="changeCalendarDay(1)">&gt;</button>
                            </div>
                        </div>
                        <div style="flex: 1; overflow-y: auto; display: flex; flex-direction: column;">
                            ${Array.from({length: 12}).map((_, i) => `
                                <div style="display: flex; border-bottom: 1px solid var(--border-color); min-height: 80px;">
                                    <div style="width: 80px; padding: 12px; font-size: 0.85rem; color: var(--text-muted); text-align: right; border-right: 1px solid var(--border-color);">${i + 8}:00 AM</div>
                                    <div style="flex: 1; padding: 8px; position: relative;">
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                `;
            }

            // Sidebar Deadlines for selected date
            const selectedDateStr = selectedCalendarDate.toISOString().split('T')[0];
            const dayDeadlines = projects.filter(p => p.dueDate === selectedDateStr);

            html += `
                    </div>
                    
                    <div class="calendar-sidebar">
                        <div class="sidebar-card">
                            <h3>${selectedCalendarDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</h3>
                            ${dayDeadlines.length === 0 ? 
                                '<div style="color: var(--text-muted); font-size: 0.9rem;">No deadlines</div>' : 
                                dayDeadlines.map(p => `
                                    <div style="margin-bottom: 12px; padding: 8px; border-radius: 4px; background: rgba(0,82,204,0.05); border-left: 3px solid var(--primary);">
                                        <div style="font-weight: 600; font-size: 0.9rem;">${p.title}</div>
                                        <div style="font-size: 0.8rem; color: var(--text-muted);">Project Deadline</div>
                                    </div>
                                `).join('')
                            }
                        </div>
                        
                        <div class="sidebar-card">
                            <h3>Upcoming Deadlines</h3>
                            ${projects
                                .filter(p => new Date(p.dueDate) >= new Date())
                                .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                                .slice(0, 5)
                                .map(p => `
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                        <div style="display: flex; align-items: center; gap: 8px;">
                                            <div style="width: 8px; height: 8px; border-radius: 50%; background: var(--primary);"></div>
                                            <span style="font-weight: 500; font-size: 0.9rem;">${p.title}</span>
                                        </div>
                                        <span style="font-size: 0.8rem; color: var(--text-muted);">${new Date(p.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                    </div>
                                `).join('')
                            }
                        </div>
                        
                        <div class="sidebar-card">
                            <h3>Legend</h3>
                            <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.8rem; color: var(--text-muted);">
                                <div style="display: flex; align-items: center; gap: 6px;">
                                    <div style="width: 8px; height: 8px; border-radius: 50%; background: var(--primary);"></div> Project Deadline
                                </div>
                                <div style="display: flex; align-items: center; gap: 6px;">
                                    <div style="width: 8px; height: 8px; border-radius: 50%; background: #ff3333;"></div> High Priority Task
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            contentArea.innerHTML = html;
        }

        window.changeCalendarMonth = function(delta) {
            currentCalendarDate.setMonth(currentCalendarDate.getMonth() + delta);
            renderCalendarView('month');
        }

        window.changeCalendarDay = function(delta) {
            selectedCalendarDate.setDate(selectedCalendarDate.getDate() + delta);
            currentCalendarDate = new Date(selectedCalendarDate);
            renderCalendarView('day');
        }

        window.selectCalendarDate = function(year, month, day) {
            selectedCalendarDate = new Date(year, month, day);
            renderCalendarView('month');
        }

        // --- Request View & PRS Logic ---
        let prsRecords = [
            {
                id: 1,
                projectId: 1,
                prsNo: 'PRS-2026-001',
                transaction: 'MNL-MNL',
                description: 'civil bulk',
                activityCharging: 'Civil Works',
                status: 'Approved',
                dateRequested: '2026-03-01'
            }
        ];
        let manilaRecords = [
            {
                id: 1,
                projectId: 1,
                prsId: 1,
                subtaskCharging: 'PROCUREMENT',
                workItemNo: '',
                poNo: 'PO-2026-001',
                supplier: '',
                dateDelivered: '',
                daysDelayed: 0,
                procurementStatus: 'Delivered',
                currentDepartment: '',
                totalCost: 15000,
                vatType: 'Non-VAT',
                vatAmount: 0,
                netOfVat: 15000,
                paymentTermsPercent: 100,
                paymentTerms: '',
                ewt: 0,
                actualAmount: 15000,
                paymentNeededDate: '2026-03-09',
                checkInventory: '',
                paymentReleased: '2026-03-09',
                paymentMonth: 'March - 2026',
                paymentStatus: 'Paid',
                remarks: ''
            }
        ];
        let currentManilaTab = 'procurement';
        let editingManilaId = null;

        let localRecords = [];
        let currentLocalTab = 'procurement';
        let editingLocalId = null;

        let fuelRecords = [
            { id: 1, date: '2025-08-09', qtyIn: 10000, qtyOut: 0, time: '10:00', equipment: '', remarks: 'DELIVERED AT STA FE. DPP' },
            { id: 2, date: '2025-10-14', qtyIn: 0, qtyOut: 150, time: '07:45', equipment: 'BOOM TRUCK', remarks: 'BOOM TRUCK' },
            { id: 3, date: '2025-10-15', qtyIn: 0, qtyOut: 100, time: '09:20', equipment: 'WHEEL TYPE', remarks: 'WHEEL TYPE' },
            { id: 4, date: '2025-10-15', qtyIn: 0, qtyOut: 100, time: '09:25', equipment: 'DUMP TRUCK', remarks: 'DUMP TRUCK' },
            { id: 5, date: '2025-10-20', qtyIn: 0, qtyOut: 50, time: '09:46', equipment: 'BOOM TRUCK', remarks: 'BOOM TRUCK' },
            { id: 6, date: '2025-10-21', qtyIn: 0, qtyOut: 5, time: '09:00', equipment: 'WATER PUMP', remarks: 'WATER PUMP' },
            { id: 7, date: '2025-10-22', qtyIn: 0, qtyOut: 200, time: '18:54', equipment: 'DUMP TRUCK', remarks: 'DUMP TRUCK' },
            { id: 8, date: '2025-10-22', qtyIn: 0, qtyOut: 200, time: '08:30', equipment: 'FORKLIFT', remarks: 'FORKLIFT' },
            { id: 9, date: '2025-11-21', qtyIn: 0, qtyOut: 200, time: '07:30', equipment: 'WHEEL TYPE', remarks: 'WHEEL TYPE' },
            { id: 10, date: '2025-12-05', qtyIn: 0, qtyOut: 200, time: '14:10', equipment: 'BOOM TRUCK', remarks: 'BOOM TRUCK' },
            { id: 11, date: '2025-12-15', qtyIn: 0, qtyOut: 15, time: '08:00', equipment: 'FORD', remarks: 'FORD' },
            { id: 12, date: '2025-12-23', qtyIn: 0, qtyOut: 60, time: '09:30', equipment: 'FORD', remarks: 'FORD' },
            { id: 13, date: '2025-12-27', qtyIn: 0, qtyOut: 7800, time: '14:32', equipment: '', remarks: 'TRANSFER TO BATIANO POWER PLANT' }
        ];
        
        let equipmentList = [
            'BAGGER MIXER', 'BOOM TRUCK', 'CRANE', 'DUMP TRUCK', 'FORD', 'FORKLIFT', 
            'GENERATOR', 'NFF8971', 'PLATE COMPACTOR', 'SBD', 'SBH', 'TRACTOR HEAD', 
            'WALK BEHIND', 'BACK HOE', 'MOBILE CRANE', 'WHEEL TYPE', 'WATER PUMP'
        ];

        const subtaskChargingOptions = [
            "A1 - BIDDING DOCUMENTS", "A2 - BIDDING SECURITY", "A3 - OTHER BIDDING EXPENSES",
            "B1 - LAND ACQUISITION", "B2.1 - LGU", "B2.2 - DENR TRANSACTION", "B2.3 - NCIP", "B2.4 - NWRB",
            "B2.5 - CERTIFICATE OF ENDORSEMENT APPLICATION (COE) WITH DOE", "B2.6 - ERC APPLICATION",
            "B2.7 - EXTERNAL COUNSELS", "B3.1 - GENERAL FEASIBILITY STUDIES", "B3.2 - CIVIL WORKS STUDIES",
            "B3.3 - ELECTRICAL WORKS STUDIES", "B3.4 - MECHANICAL WORKS STUDIES", "B3.5 - POWER SYSTEM SOFTWARE",
            "B4.1 - WATER CONNECTION", "B4.2 - ELECTRICAL CONNECTION", "B4.3 - INTERNET CONNECTION",
            "B5.1 - SPECIAL TOOLS", "B5.2 - OFFICE SUPPLIES", "B5.3 - STAFF HOUSE SUPPLIES", "B5.4 - SAFETY PPE",
            "B5.5 - FIRE PROTECTION", "B6.1 - SHARED SERVICES", "B6.2 - MANILA ADMIN", "B6.3 - PROJECT ADMIN",
            "B6.4 - OTHER ADMIN COST", "C1.1 - INTERNATIONAL LOGISTICS", "C1.2 - LOCAL LOGISTICS",
            "C2.1 - MOBILIZATION (PROCUREMENT)", "C2.2 - TEMPORARY FACILITIES (PROCUREMENT)",
            "C2.3 - SITE GRADING (PROCUREMENT)", "C2.4 - ROAD DEVELOPMENT (Internal Access Road) (PROCUREMENT)",
            "C2.5 - ROAD DEVELOPMENT (Right of way) (PROCUREMENT)", "C2.6 - DOMESTIC WATER SYSTEM (PROCUREMENT)",
            "C2.7 - DRAINAGE SYSTEM (PROCUREMENT)", "C2.8 - SLOPE PROTECTION (PROCUREMENT)",
            "C2.9 - CONTROL BUILDING (PROCUREMENT)", "C2.10 - WAREHOUSE AND WORKSHOP BUILDING (PROCUREMENT)",
            "C2.11 - ADMIN AND AMENITIES BUILDING (PROCUREMENT)", "C2.12 - GUARD HOUSE (PROCUREMENT)",
            "C2.13 - MATERIAL RECOVERY FACILITY (PROCUREMENT)", "C2.14 - LIGHTNING PROTECTION (PROCUREMENT)",
            "C2.15 - CHB FENCE & GATE (PROCUREMENT)", "C2.16 - CCTV SYSTEM (PROCUREMENT)",
            "C3.1 - FOUNDATION WORKS (PROCUREMENT)", "C3.2 - FUEL SYSTEM (PROCUREMENT)",
            "C3.3 - LUBE OIL SYSTEM (PROCUREMENT)", "C3.4 - TRENCH WORKS (PROCUREMENT)",
            "C3.5 - GENERATOR SET & SKID ASSEMBLY (PROCUREMENT)", "C3.6 - WIRING & TERMINATION (PROCUREMENT)",
            "C3.7 - GROUNDING SYSTEM (Equiment & Materials) (PROCUREMENT)", "C4.1 - TRANSMISSION LINE (PROCUREMENT)",
            "C4.2 - TRANSFORMER & DISCONNECT SWITCH FOUNDATION (PROCUREMENT)",
            "C4.3 - CABLE TRENCH, MANHOLE, & DUCT BANK (PROCUREMENT)", "C4.4 - TRANSFORMER INSTALLATION (PROCUREMENT)",
            "C4.5 - SUBSTATION PROTECTION (PROCUREMENT)", "C4.6 - REVENUE WIRING AND TERMINATION (PROCUREMENT)",
            "C4.7 - CABLE WIRING AND TERMINATION (PROCUREMENT)", "C4.8 - SECLUSION FENCE AND GATE (PROCUREMENT)",
            "C4.9 - GROUNDING SYSTEM (PROCUREMENT)", "C5.1 - SCADA system (PROCUREMENT)",
            "C6.1 - CONSUMABLES (PROCUREMENT)", "C7 - MISCELLANEOUS (PROCUREMENT)",
            "D1.1 - MOBILIZATION (CONSTRUCTION)", "D1.2 - TEMPORARY FACILITIES (CONSTRUCTION)",
            "D1.3 - SITE GRADING (CONSTRUCTION)", "D1.4 - ROAD DEVELOPMENT (Internal Access Road) (CONSTRUCTION)",
            "D1.5 - ROAD DEVELOPMENT (Right of way) (CONSTRUCTION)", "D1.6 - DOMESTIC WATER SYSTEM (CONSTRUCTION)",
            "D1.7 - DRAINAGE SYSTEM (CONSTRUCTION)", "D1.8 - SLOPE PROTECTION (CONSTRUCTION)",
            "D1.9 - CONTROL BUILDING (CONSTRUCTION)", "D1.10 - WAREHOUSE AND WORKSHOP BUILDING (CONSTRUCTION)",
            "D1.11 - ADMIN AND AMENITIES BUILDING (CONSTRUCTION)", "D1.12 - GUARD HOUSE (CONSTRUCTION)",
            "D1.13 - MATERIAL RECOVERY FACILITY (CONSTRUCTION)", "D1.14 - LIGHTNING PROTECTION (CONSTRUCTION)",
            "D1.15 - CHB FENCE & GATE (CONSTRUCTION)", "D1.16 - CCTV SYSTEM (CONSTRUCTION)",
            "D2.1 - FOUNDATION WORKS (CONSTRUCTION)", "D2.2 - FUEL SYSTEM (CONSTRUCTION)",
            "D2.3 - LUBE OIL SYSTEM (CONSTRUCTION)", "D2.4 - TRENCH WORKS (CONSTRUCTION)",
            "D2.5 - GENERATOR SET & SKID ASSEMBLY (CONSTRUCTION)", "D2.6 - WIRING & TERMINATION (CONSTRUCTION)",
            "D2.7 - GROUNDING SYSTEM (CONSTRUCTION)", "D3.1 - TRANSMISSION LINE (TIELCO) (CONSTRUCTION)",
            "D3.2 - TRANSFORMER & DISCONNECT SWITCH FOUNDATION (CONSTRUCTION)",
            "D3.3 - CABLE TRENCH, MANHOLE, & DUCT BANK (CONSTRUCTION)", "D3.4 - TRANSFORMER INSTALLATION (CONSTRUCTION)",
            "D3.5 - SUBSTATION PROTECTION (CONSTRUCTION)", "D3.6 - REVENUE WIRING AND TERMINATION (CONSTRUCTION)",
            "D3.7 - CABLE WIRING AND TERMINATION (CONSTRUCTION)", "D3.8 - SECLUSION FENCE AND GATE (CONSTRUCTION)",
            "D3.9 - GROUNDING SYSTEM (LABOR) (CONSTRUCTION)", "D4.1 - SCADA system (CONSTRUCTION)",
            "D5.1 - CONSUMABLES (CONSTRUCTION)", "D6 - MISCELLANEOUS (CONSTRUCTION)"
        ];

        let prsCounters = {
            'Civil': 25001,
            'Mechanical': 25201,
            'Electrical': 25301,
            'SCADA': 25401,
            'Safety': 25451,
            'Admin': 25501,
            'Accounting': 25701,
            'Logistics': 25801
        };

        let editingPrsId = null;

        window.renderProcurementDashboard = function() {
            currentView = 'procurement-dashboard';
            updateSubNavVisibility();
            
            // Calculate summaries
            const totalPrs = prsRecords.length;
            const pendingPrs = prsRecords.filter(r => r.status === 'Pending').length;
            
            const totalManila = manilaRecords.length;
            const manilaDelivered = manilaRecords.filter(r => r.procurementStatus === 'Delivered').length;
            
            const totalLocal = localRecords.length;
            const localDelivered = localRecords.filter(r => r.procurementStatus === 'Delivered').length;
            
            const totalMaterials = typeof materialsMasterlist !== 'undefined' ? materialsMasterlist.length : 0;
            const lowStockMaterials = typeof materialsMasterlist !== 'undefined' ? materialsMasterlist.filter(m => m.currentStock <= m.minStock).length : 0;
            
            const totalFuel = typeof fuelRecords !== 'undefined' ? fuelRecords.length : 0;
            
            let html = `
                <div class="view-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                    <div>
                        <h1 style="font-size: 1.5rem; font-weight: 700;">Procurement Dashboard</h1>
                        <div style="color: var(--text-muted); font-size: 0.85rem;">Centralized overview of all procurement activities</div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-bottom: 24px;">
                    <!-- Request Summary -->
                    <div class="card" style="padding: 20px; cursor: pointer;" onclick="renderRequestView()">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                            <h3 style="font-size: 1rem; font-weight: 600; color: var(--text-main);">Requests (PRS)</h3>
                            <div style="background: #e0f2fe; color: #0284c7; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">View All</div>
                        </div>
                        <div style="font-size: 2rem; font-weight: 700; margin-bottom: 4px;">${totalPrs}</div>
                        <div style="font-size: 0.85rem; color: var(--text-muted);">Total Requests</div>
                    </div>

                    <!-- Manila Summary -->
                    <div class="card" style="padding: 20px; cursor: pointer;" onclick="renderManilaView()">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                            <h3 style="font-size: 1rem; font-weight: 600; color: var(--text-main);">Manila Procurement</h3>
                            <div style="background: #fef08a; color: #a16207; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">View All</div>
                        </div>
                        <div style="font-size: 2rem; font-weight: 700; margin-bottom: 4px;">${totalManila}</div>
                        <div style="font-size: 0.85rem; color: var(--text-muted);">${manilaDelivered} Delivered</div>
                    </div>

                    <!-- Local Summary -->
                    <div class="card" style="padding: 20px; cursor: pointer;" onclick="renderLocalView()">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                            <h3 style="font-size: 1rem; font-weight: 600; color: var(--text-main);">Local Procurement</h3>
                            <div style="background: #dcfce7; color: #16a34a; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">View All</div>
                        </div>
                        <div style="font-size: 2rem; font-weight: 700; margin-bottom: 4px;">${totalLocal}</div>
                        <div style="font-size: 0.85rem; color: var(--text-muted);">${localDelivered} Delivered</div>
                    </div>

                    <!-- Materials Summary -->
                    <div class="card" style="padding: 20px; cursor: pointer;" onclick="renderMaterialsView()">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                            <h3 style="font-size: 1rem; font-weight: 600; color: var(--text-main);">Materials Inventory</h3>
                            <div style="background: #f3e8ff; color: #9333ea; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">View All</div>
                        </div>
                        <div style="font-size: 2rem; font-weight: 700; margin-bottom: 4px;">${totalMaterials}</div>
                        <div style="font-size: 0.85rem; color: ${lowStockMaterials > 0 ? '#ea580c' : 'var(--text-muted)'};">${lowStockMaterials} Low Stock Items</div>
                    </div>

                    <!-- Fuel Summary -->
                    <div class="card" style="padding: 20px; cursor: pointer;" onclick="renderFuelView()">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                            <h3 style="font-size: 1rem; font-weight: 600; color: var(--text-main);">Fuel Records</h3>
                            <div style="background: #ffedd5; color: #ea580c; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">View All</div>
                        </div>
                        <div style="font-size: 2rem; font-weight: 700; margin-bottom: 4px;">${totalFuel}</div>
                        <div style="font-size: 0.85rem; color: var(--text-muted);">Total Transactions</div>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                    <!-- Recent PRS -->
                    <div class="card" style="padding: 20px;">
                        <h3 style="font-size: 1.1rem; font-weight: 600; margin-bottom: 16px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">Recent Requests</h3>
                        <div style="display: flex; flex-direction: column; gap: 12px;">
                            ${prsRecords.slice(-5).reverse().map(r => `
                                <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 8px; border-bottom: 1px solid var(--border-color);">
                                    <div>
                                        <div style="font-weight: 600; font-size: 0.9rem;">${r.prsNo}</div>
                                        <div style="font-size: 0.75rem; color: var(--text-muted);">${r.description || 'No description'}</div>
                                    </div>
                                    <div style="font-size: 0.85rem; font-weight: 600;">₱${(r.projectedAmount || 0).toLocaleString()}</div>
                                </div>
                            `).join('') || '<div style="color: var(--text-muted); font-size: 0.85rem;">No recent requests found.</div>'}
                        </div>
                    </div>
                    
                    <!-- Recent Procurement (Manila + Local) -->
                    <div class="card" style="padding: 20px;">
                        <h3 style="font-size: 1.1rem; font-weight: 600; margin-bottom: 16px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">Recent Procurements</h3>
                        <div style="display: flex; flex-direction: column; gap: 12px;">
                            ${[...manilaRecords, ...localRecords].sort((a, b) => b.id - a.id).slice(0, 5).map(r => `
                                <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 8px; border-bottom: 1px solid var(--border-color);">
                                    <div>
                                        <div style="font-weight: 600; font-size: 0.9rem;">${r.prsNo || r.repleNo || 'Standalone'} <span style="font-size: 0.7rem; background: var(--bg-surface); padding: 2px 6px; border-radius: 4px; margin-left: 4px;">${r.process}</span></div>
                                        <div style="font-size: 0.75rem; color: var(--text-muted);">${r.item || 'No item description'}</div>
                                    </div>
                                    <div style="font-size: 0.85rem; font-weight: 600;">
                                        <span style="color: ${r.procurementStatus === 'Delivered' ? '#16a34a' : '#ea580c'};">${r.procurementStatus || 'Pending'}</span>
                                    </div>
                                </div>
                            `).join('') || '<div style="color: var(--text-muted); font-size: 0.85rem;">No recent procurements found.</div>'}
                        </div>
                    </div>
                </div>
            `;
            
            contentArea.innerHTML = html;
        }

        window.renderRequestView = function() {
            currentView = 'request';
            updateSubNavVisibility();
            
            const projectRecords = prsRecords.filter(r => r.projectId === currentProjectId);
            const totalRequest = projectRecords.length;
            const totalProjected = projectRecords.reduce((sum, r) => sum + r.projectedAmount, 0);
            const totalActual = projectRecords.reduce((sum, r) => sum + r.actualAmount, 0);
            const formatCurrency = (val) => '₱' + val.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
            
            let html = `
                <div class="view-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <div>
                        <h1 style="font-size: 1.5rem; font-weight: 700;">Request</h1>
                        <div style="color: var(--text-muted); font-size: 0.85rem;">Manage procurement requests</div>
                    </div>
                </div>

                <div class="kpi-grid" style="margin-bottom: 16px; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                    <div class="kpi-card" style="padding: 12px; min-height: auto;">
                        <div class="kpi-card-header" style="margin-bottom: 8px;">
                            <div class="kpi-label" style="font-size: 0.75rem;">Total Request</div>
                            <div class="kpi-icon blue" style="width: 28px; height: 28px; padding: 6px;">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                            </div>
                        </div>
                        <div class="kpi-value" id="kpiTotalRequest" style="font-size: 1.25rem;">${totalRequest}</div>
                    </div>
                    <div class="kpi-card" style="padding: 12px; min-height: auto;">
                        <div class="kpi-card-header" style="margin-bottom: 8px;">
                            <div class="kpi-label" style="font-size: 0.75rem;">Total Projected Amount</div>
                            <div class="kpi-icon yellow" style="width: 28px; height: 28px; padding: 6px;">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                            </div>
                        </div>
                        <div class="kpi-value" id="kpiTotalProjected" style="font-size: 1.25rem;">${formatCurrency(totalProjected)}</div>
                    </div>
                    <div class="kpi-card" style="padding: 12px; min-height: auto;">
                        <div class="kpi-card-header" style="margin-bottom: 8px;">
                            <div class="kpi-label" style="font-size: 0.75rem;">Total Actual Amount</div>
                            <div class="kpi-icon green" style="width: 28px; height: 28px; padding: 6px;">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                            </div>
                        </div>
                        <div class="kpi-value" id="kpiTotalActual" style="font-size: 1.25rem;">${formatCurrency(totalActual)}</div>
                    </div>
                </div>

                <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px; margin-bottom: 16px; display: flex; gap: 12px; align-items: center;">
                    <div style="flex: 1; position: relative;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted);"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        <input type="text" id="prsSearchInput" oninput="renderPrsTable()" placeholder="Search PRS no. or requestor..." style="width: 100%; padding: 8px 12px 8px 36px; border: 1px solid var(--border-color); border-radius: var(--radius-md); font-size: 0.9rem; background: var(--bg-body); color: var(--text-main);">
                    </div>
                    <select id="prsDesignationFilter" onchange="renderPrsTable()" style="padding: 8px 12px; border: 1px solid var(--border-color); border-radius: var(--radius-md); font-size: 0.9rem; background: var(--bg-body); color: var(--text-main); min-width: 150px;">
                        <option value="">All Designations</option>
                        <option value="Civil">Civil</option>
                        <option value="Mechanical">Mechanical</option>
                        <option value="Electrical">Electrical</option>
                        <option value="SCADA">SCADA</option>
                        <option value="Safety">Safety</option>
                        <option value="Admin">Admin</option>
                        <option value="Accounting">Accounting</option>
                        <option value="Logistics">Logistics</option>
                    </select>
                    <select id="prsTransactionFilter" onchange="renderPrsTable()" style="padding: 8px 12px; border: 1px solid var(--border-color); border-radius: var(--radius-md); font-size: 0.9rem; background: var(--bg-body); color: var(--text-main); min-width: 150px;">
                        <option value="">All Transactions</option>
                        <option value="MNL-MNL">MNL-MNL</option>
                        <option value="MNL-LCL">MNL-LCL</option>
                        <option value="LCL-LCL">LCL-LCL</option>
                        <option value="LCL-MNL">LCL-MNL</option>
                    </select>
                    <button class="btn btn-primary" onclick="openPrsModal()" style="background: #2563eb; color: white; border: none;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> New PRS</button>
                </div>

                <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-sm);">
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: separate; border-spacing: 0; text-align: left; font-size: 0.85rem; font-family: 'Inter', system-ui, sans-serif;">
                            <thead style="background: var(--bg-body);">
                                <tr>
                                    <th style="padding: 14px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">Type</th>
                                    <th style="padding: 14px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">Transaction</th>
                                    <th style="padding: 14px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">Requestor Designation</th>
                                    <th style="padding: 14px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">PRS No.</th>
                                    <th style="padding: 14px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">Subtask Charging</th>
                                    <th style="padding: 14px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">Description</th>
                                    <th style="padding: 14px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">PRS Date</th>
                                    <th style="padding: 14px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">Target Date</th>
                                    <th style="padding: 14px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">Projected Amount</th>
                                    <th style="padding: 14px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">Actual Amount</th>
                                    <th style="padding: 14px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="prsTableBody">
                                <!-- PRS records will go here -->
                            </tbody>
                        </table>
                    </div>
                    <div style="padding: 12px 16px; border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; color: var(--text-muted); background: var(--bg-surface);">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span>Rows per page:</span>
                            <select id="prsRowsPerPage" onchange="changePrsRowsPerPage()" style="padding: 4px 8px; border: 1px solid var(--border-color); border-radius: var(--radius-md); background: var(--bg-body); color: var(--text-main);">
                                <option value="5">5</option>
                                <option value="10" selected>10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                                <option value="all">All</option>
                            </select>
                        </div>
                        <div style="display: flex; align-items: center; gap: 16px;">
                            <span id="prsPaginationInfo">Page 1 of 1</span>
                            <div style="display: flex; gap: 8px;">
                                <button id="prsPrevBtn" class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.8rem;" onclick="changePrsPage(-1)">&lt; Prev</button>
                                <button id="prsNextBtn" class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.8rem;" onclick="changePrsPage(1)">Next &gt;</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            contentArea.innerHTML = html;
            renderPrsTable();
        }

        window.openPrsModal = () => {
            const modalOverlay = document.getElementById('newPrsModal');
            if(modalOverlay) {
                modalOverlay.classList.add('active');
                const modal = modalOverlay.querySelector('.modal');
                if (modal) modal.classList.add('active');
                generatePrsNo();
            }
        };
        
        window.closePrsModal = () => {
            const modalOverlay = document.getElementById('newPrsModal');
            if(modalOverlay) {
                modalOverlay.classList.remove('active');
                const modal = modalOverlay.querySelector('.modal');
                if (modal) modal.classList.remove('active');
                document.getElementById('newPrsForm').reset();
            }
        };

        window.generatePrsNo = function() {
            const designation = document.getElementById('prsDesignation').value;
            const counter = prsCounters[designation];
            document.getElementById('prsNo').value = `STEC-ALC-${counter}`;
        };

        let prsCurrentPage = 1;
        let prsRowsPerPageValue = 10;

        window.changePrsRowsPerPage = function() {
            const select = document.getElementById('prsRowsPerPage');
            if (select) {
                prsRowsPerPageValue = select.value === 'all' ? 'all' : parseInt(select.value, 10);
                prsCurrentPage = 1;
                renderPrsTable();
            }
        };

        window.changePrsPage = function(dir) {
            prsCurrentPage += dir;
            renderPrsTable();
        };

        window.renderPrsTable = function() {
            const tbody = document.getElementById('prsTableBody');
            if (!tbody) return;
            
            const searchInput = document.getElementById('prsSearchInput');
            const designationFilter = document.getElementById('prsDesignationFilter');
            const transactionFilter = document.getElementById('prsTransactionFilter');
            
            const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
            const designationVal = designationFilter ? designationFilter.value : '';
            const transactionVal = transactionFilter ? transactionFilter.value : '';
            
            let projectRecords = prsRecords.filter(r => r.projectId === currentProjectId);
            
            if (searchTerm) {
                projectRecords = projectRecords.filter(r => 
                    r.prsNo.toLowerCase().includes(searchTerm) || 
                    r.designation.toLowerCase().includes(searchTerm) ||
                    r.description.toLowerCase().includes(searchTerm)
                );
            }
            if (designationVal) {
                projectRecords = projectRecords.filter(r => r.designation === designationVal);
            }
            if (transactionVal) {
                projectRecords = projectRecords.filter(r => r.transaction === transactionVal);
            }
            
            // Update KPIs
            const kpiTotalRequest = document.getElementById('kpiTotalRequest');
            const kpiTotalProjected = document.getElementById('kpiTotalProjected');
            const kpiTotalActual = document.getElementById('kpiTotalActual');
            const formatCurrency = (val) => '₱' + val.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
            
            if (kpiTotalRequest) kpiTotalRequest.textContent = projectRecords.length;
            if (kpiTotalProjected) kpiTotalProjected.textContent = formatCurrency(projectRecords.reduce((sum, r) => sum + r.projectedAmount, 0));
            if (kpiTotalActual) kpiTotalActual.textContent = formatCurrency(projectRecords.reduce((sum, r) => sum + r.actualAmount, 0));
            
            if (projectRecords.length === 0) {
                tbody.innerHTML = `<tr><td colspan="11" style="padding: 24px 16px; text-align: center; color: var(--text-muted);">No records to display.</td></tr>`;
                
                const paginationInfo = document.getElementById('prsPaginationInfo');
                const prevBtn = document.getElementById('prsPrevBtn');
                const nextBtn = document.getElementById('prsNextBtn');
                if (paginationInfo) paginationInfo.textContent = 'No records';
                if (prevBtn) prevBtn.disabled = true;
                if (nextBtn) nextBtn.disabled = true;
                
                return;
            }
            
            // Pagination logic
            let totalPages = 1;
            let paginatedRecords = projectRecords;
            
            if (prsRowsPerPageValue !== 'all') {
                totalPages = Math.ceil(projectRecords.length / prsRowsPerPageValue) || 1;
                if (prsCurrentPage > totalPages) prsCurrentPage = totalPages;
                if (prsCurrentPage < 1) prsCurrentPage = 1;
                
                const startIndex = (prsCurrentPage - 1) * prsRowsPerPageValue;
                paginatedRecords = projectRecords.slice(startIndex, startIndex + prsRowsPerPageValue);
            }
            
            // Update pagination UI
            const paginationInfo = document.getElementById('prsPaginationInfo');
            const prevBtn = document.getElementById('prsPrevBtn');
            const nextBtn = document.getElementById('prsNextBtn');
            
            if (paginationInfo) {
                if (prsRowsPerPageValue === 'all') {
                    paginationInfo.textContent = `Showing all ${projectRecords.length} records`;
                } else {
                    const start = (prsCurrentPage - 1) * prsRowsPerPageValue + 1;
                    const end = Math.min(prsCurrentPage * prsRowsPerPageValue, projectRecords.length);
                    paginationInfo.textContent = `${start}-${end} of ${projectRecords.length}`;
                }
            }
            
            if (prevBtn) prevBtn.disabled = prsCurrentPage <= 1;
            if (nextBtn) nextBtn.disabled = prsCurrentPage >= totalPages || prsRowsPerPageValue === 'all';
            
            let html = '';
            paginatedRecords.forEach(record => {
                html += `
                    <tr style="transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='rgba(0,0,0,0.02)'" onmouseout="this.style.backgroundColor='transparent'">
                        <td style="padding: 14px 16px; border-bottom: 1px solid var(--border-color);">${record.type}</td>
                        <td style="padding: 14px 16px; border-bottom: 1px solid var(--border-color);">${record.transaction}</td>
                        <td style="padding: 14px 16px; border-bottom: 1px solid var(--border-color);">${record.designation}</td>
                        <td style="padding: 14px 16px; border-bottom: 1px solid var(--border-color); font-weight: 500;">${record.prsNo}</td>
                        <td style="padding: 14px 16px; border-bottom: 1px solid var(--border-color);">${record.activityCharging}</td>
                        <td style="padding: 14px 16px; border-bottom: 1px solid var(--border-color); max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${record.description}">${record.description}</td>
                        <td style="padding: 14px 16px; border-bottom: 1px solid var(--border-color);">${record.prsDate}</td>
                        <td style="padding: 14px 16px; border-bottom: 1px solid var(--border-color);">${record.targetDate}</td>
                        <td style="padding: 14px 16px; border-bottom: 1px solid var(--border-color);">${record.projectedAmount.toFixed(2)}</td>
                        <td style="padding: 14px 16px; border-bottom: 1px solid var(--border-color);">${record.actualAmount.toFixed(2)}</td>
                        <td style="padding: 14px 16px; border-bottom: 1px solid var(--border-color);">
                            <div style="display: flex; gap: 8px;">
                                <button class="icon-btn" onclick="editPrsRecord(${record.id})" style="padding: 6px; color: var(--text-muted); background: var(--bg-body); border-radius: 6px;" title="Edit" onmouseover="this.style.color='var(--primary)'" onmouseout="this.style.color='var(--text-muted)'"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg></button>
                                <button class="icon-btn" onclick="deletePrsRecord(${record.id})" style="padding: 6px; color: var(--text-muted); background: var(--bg-body); border-radius: 6px;" title="Delete" onmouseover="this.style.color='var(--danger)'" onmouseout="this.style.color='var(--text-muted)'"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg></button>
                            </div>
                        </td>
                    </tr>
                `;
            });
            tbody.innerHTML = html;
        };

        window.editPrsRecord = function(id) {
            openPrsModal(id);
        };

        window.deletePrsRecord = function(id) {
            if (confirm('Are you sure you want to delete this PRS record?')) {
                prsRecords = prsRecords.filter(r => r.id !== id);
                manilaRecords = manilaRecords.filter(m => m.prsId !== id);
                localRecords = localRecords.filter(m => m.prsId !== id);
                renderRequestView(); // Re-render the whole view to update KPIs
            }
        };

        window.openPrsModal = (id = null) => {
            editingPrsId = id;
            const modalOverlay = document.getElementById('newPrsModal');
            if(modalOverlay) {
                modalOverlay.classList.add('active');
                const modal = modalOverlay.querySelector('.modal');
                if (modal) modal.classList.add('active');
                
                if (id) {
                    const record = prsRecords.find(r => r.id === id);
                    if (record) {
                        document.getElementById('prsType').value = record.type;
                        document.getElementById('prsDate').value = record.prsDate;
                        document.getElementById('prsTransaction').value = record.transaction;
                        document.getElementById('prsDesignation').value = record.designation;
                        document.getElementById('prsNo').value = record.prsNo;
                        document.getElementById('prsTargetDate').value = record.targetDate;
                        document.getElementById('prsActivityCharging').value = record.activityCharging;
                        document.getElementById('prsDescription').value = record.description;
                        document.getElementById('prsProjectedAmount').value = record.projectedAmount;
                        document.getElementById('prsActualAmount').value = record.actualAmount;
                    }
                } else {
                    document.getElementById('newPrsForm').reset();
                    // Set default dates
                    const today = new Date().toISOString().split('T')[0];
                    const prsDateInput = document.getElementById('prsDate');
                    if (prsDateInput) prsDateInput.value = today;
                    generatePrsNo();
                }
            }
        };

        // Event Listeners for PRS Modal
        document.addEventListener('DOMContentLoaded', () => {
            const prsForm = document.getElementById('newPrsForm');
            if (prsForm) {
                prsForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    
                    const designation = document.getElementById('prsDesignation').value;
                    const prsNo = document.getElementById('prsNo').value;
                    
                    if (editingPrsId) {
                        const recordIndex = prsRecords.findIndex(r => r.id === editingPrsId);
                        if (recordIndex !== -1) {
                            prsRecords[recordIndex] = {
                                ...prsRecords[recordIndex],
                                type: document.getElementById('prsType').value,
                                prsDate: document.getElementById('prsDate').value,
                                transaction: document.getElementById('prsTransaction').value,
                                designation: designation,
                                prsNo: prsNo,
                                targetDate: document.getElementById('prsTargetDate').value,
                                activityCharging: document.getElementById('prsActivityCharging').value,
                                description: document.getElementById('prsDescription').value,
                                projectedAmount: parseFloat(document.getElementById('prsProjectedAmount').value) || 0,
                                actualAmount: parseFloat(document.getElementById('prsActualAmount').value) || 0
                            };
                            
                            // Handle Manila record auto-creation/deletion
                            const isManila = prsRecords[recordIndex].transaction === 'MNL-MNL' || prsRecords[recordIndex].transaction === 'LCL-MNL';
                            const existingManilaIndex = manilaRecords.findIndex(m => m.prsId === editingPrsId);
                            
                            if (isManila && existingManilaIndex === -1) {
                                createManilaRecord(editingPrsId);
                            } else if (!isManila && existingManilaIndex !== -1) {
                                manilaRecords.splice(existingManilaIndex, 1);
                            }

                            // Handle Local record auto-creation/deletion
                            const isLocal = prsRecords[recordIndex].transaction === 'LCL-LCL' || prsRecords[recordIndex].transaction === 'MNL-LCL';
                            const existingLocalIndex = localRecords.findIndex(m => m.prsId === editingPrsId);
                            
                            if (isLocal && existingLocalIndex === -1) {
                                createLocalRecord(editingPrsId);
                            } else if (!isLocal && existingLocalIndex !== -1) {
                                localRecords.splice(existingLocalIndex, 1);
                            }
                        }
                    } else {
                        const newRecord = {
                            id: Date.now(),
                            projectId: currentProjectId,
                            type: document.getElementById('prsType').value,
                            prsDate: document.getElementById('prsDate').value,
                            transaction: document.getElementById('prsTransaction').value,
                            designation: designation,
                            prsNo: prsNo,
                            targetDate: document.getElementById('prsTargetDate').value,
                            activityCharging: document.getElementById('prsActivityCharging').value,
                            description: document.getElementById('prsDescription').value,
                            projectedAmount: parseFloat(document.getElementById('prsProjectedAmount').value) || 0,
                            actualAmount: parseFloat(document.getElementById('prsActualAmount').value) || 0
                        };
                        
                        prsRecords.unshift(newRecord); // Add to beginning
                        prsCounters[designation]++; // Increment counter for next time
                        
                        // Auto-create Manila record
                        if (newRecord.transaction === 'MNL-MNL' || newRecord.transaction === 'LCL-MNL') {
                            createManilaRecord(newRecord.id);
                        }

                        // Auto-create Local record
                        if (newRecord.transaction === 'LCL-LCL' || newRecord.transaction === 'MNL-LCL') {
                            createLocalRecord(newRecord.id);
                        }
                    }
                    
                    closePrsModal();
                    if (currentView === 'request') {
                        renderRequestView(); // Re-render the whole view to update KPIs and table
                    }
                });
            }
            
            const closeBtn = document.getElementById('closePrsModalBtn');
            if (closeBtn) closeBtn.addEventListener('click', closePrsModal);
            
            const cancelBtn = document.getElementById('cancelPrsModalBtn');
            if (cancelBtn) cancelBtn.addEventListener('click', closePrsModal);
            
            // Set default dates
            const today = new Date().toISOString().split('T')[0];
            const prsDateInput = document.getElementById('prsDate');
            if (prsDateInput) prsDateInput.value = today;

            const manilaForm = document.getElementById('manilaForm');
            if (manilaForm) {
                manilaForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    
                    if (editingManilaId) {
                        const recordIndex = manilaRecords.findIndex(r => r.id === editingManilaId);
                        if (recordIndex !== -1) {
                            manilaRecords[recordIndex] = {
                                ...manilaRecords[recordIndex],
                                prsId: parseInt(document.getElementById('manilaPrsSelect').value),
                                subtaskCharging: document.getElementById('manilaSubtaskCharging').value,
                                workItemNo: document.getElementById('manilaWorkItemNo').value,
                                poNo: document.getElementById('manilaPoNo').value,
                                supplier: document.getElementById('manilaSupplier').value,
                                dateDelivered: document.getElementById('manilaDateDelivered').value,
                                daysDelayed: parseInt(document.getElementById('manilaDaysDelayed').value) || 0,
                                procurementStatus: document.getElementById('manilaProcurementStatus').value,
                                currentDepartment: document.getElementById('manilaCurrentDept').value,
                                totalCost: parseFloat(document.getElementById('manilaTotalCost').value) || 0,
                                vatType: document.getElementById('manilaVatType').value,
                                vatAmount: parseFloat(document.getElementById('manilaVatAmount').value) || 0,
                                netOfVat: parseFloat(document.getElementById('manilaNetOfVat').value) || 0,
                                paymentTermsPercent: parseFloat(document.getElementById('manilaPaymentTermsPercent').value) || 0,
                                paymentTerms: document.getElementById('manilaPaymentTerms').value,
                                ewt: parseFloat(document.getElementById('manilaEwt').value) || 0,
                                actualAmount: parseFloat(document.getElementById('manilaActualAmount').value) || 0,
                                paymentNeededDate: document.getElementById('manilaPaymentNeededDate').value,
                                checkInventory: document.getElementById('manilaCheckInventory').value,
                                paymentReleased: document.getElementById('manilaPaymentReleased').value,
                                paymentMonth: document.getElementById('manilaMonth').value,
                                paymentStatus: document.getElementById('manilaPaymentStatus').value,
                                remarks: document.getElementById('manilaRemarks').value
                            };
                        }
                    } else {
                        const newRecord = {
                            id: Date.now(),
                            projectId: currentProjectId,
                            prsId: parseInt(document.getElementById('manilaPrsSelect').value),
                            subtaskCharging: document.getElementById('manilaSubtaskCharging').value,
                            workItemNo: document.getElementById('manilaWorkItemNo').value,
                            poNo: document.getElementById('manilaPoNo').value,
                            supplier: document.getElementById('manilaSupplier').value,
                            dateDelivered: document.getElementById('manilaDateDelivered').value,
                            daysDelayed: parseInt(document.getElementById('manilaDaysDelayed').value) || 0,
                            procurementStatus: document.getElementById('manilaProcurementStatus').value,
                            currentDepartment: document.getElementById('manilaCurrentDept').value,
                            totalCost: parseFloat(document.getElementById('manilaTotalCost').value) || 0,
                            vatType: document.getElementById('manilaVatType').value,
                            vatAmount: parseFloat(document.getElementById('manilaVatAmount').value) || 0,
                            netOfVat: parseFloat(document.getElementById('manilaNetOfVat').value) || 0,
                            paymentTermsPercent: parseFloat(document.getElementById('manilaPaymentTermsPercent').value) || 0,
                            paymentTerms: document.getElementById('manilaPaymentTerms').value,
                            ewt: parseFloat(document.getElementById('manilaEwt').value) || 0,
                            actualAmount: parseFloat(document.getElementById('manilaActualAmount').value) || 0,
                            paymentNeededDate: document.getElementById('manilaPaymentNeededDate').value,
                            checkInventory: document.getElementById('manilaCheckInventory').value,
                            paymentReleased: document.getElementById('manilaPaymentReleased').value,
                            paymentMonth: document.getElementById('manilaMonth').value,
                            paymentStatus: document.getElementById('manilaPaymentStatus').value,
                            remarks: document.getElementById('manilaRemarks').value
                        };
                        manilaRecords.push(newRecord);
                    }
                    
                    closeManilaModal();
                    if (currentView === 'manila') {
                        renderManilaTable();
                    }
                });
            }
        });

        // Kanban Drag and Drop
        
        function createManilaRecord(prsId) {
            const prs = prsRecords.find(p => p.id === prsId);
            const matchedSubtask = prs ? subtaskChargingOptions.find(opt => opt.includes(prs.activityCharging)) : '';
            
            const newManilaRecord = {
                id: Date.now() + Math.floor(Math.random() * 1000),
                projectId: currentProjectId,
                prsId: prsId,
                subtaskCharging: matchedSubtask || '',
                workItemNo: '',
                poNo: '',
                supplier: '',
                dateDelivered: '',
                daysDelayed: 0,
                procurementStatus: 'Pending',
                currentDepartment: '',
                totalCost: 0,
                vatType: 'Non-VAT',
                vatAmount: 0,
                netOfVat: 0,
                paymentTermsPercent: 100,
                paymentTerms: '',
                ewt: 0,
                actualAmount: 0,
                paymentNeededDate: '',
                checkInventory: '',
                paymentReleased: '',
                paymentMonth: '',
                paymentStatus: 'Unpaid',
                remarks: ''
            };
            manilaRecords.push(newManilaRecord);
        }

        // --- Manila View Logic ---
        window.renderManilaView = function() {
            if (!currentProjectId) return;
            currentView = 'manila';
            updateSubNavVisibility();
            
            let html = `
                <div class="view-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <div>
                        <h1 style="font-size: 1.5rem; font-weight: 700;">Materials Monitoring</h1>
                        <div style="color: var(--text-muted); font-size: 0.85rem;">Track MNL-MNL and LCL-MNL materials procurement</div>
                    </div>
                    <button class="btn btn-primary" onclick="openManilaModal()" style="background: #2563eb; color: white; border: none;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> Add Material Record</button>
                </div>

                <div style="background: rgba(0, 82, 204, 0.05); border: 1px solid rgba(0, 82, 204, 0.2); border-radius: var(--radius-md); padding: 16px; margin-bottom: 24px; display: flex; gap: 12px;">
                    <div style="color: var(--primary);"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
                    <div>
                        <div style="font-weight: 600; color: var(--primary); font-size: 0.9rem; margin-bottom: 4px;">Auto-Linked to PRS</div>
                        <div style="font-size: 0.85rem; color: var(--text-muted);">Materials monitoring records are automatically created when a PRS with MNL-MNL or LCL-MNL process is added.</div>
                    </div>
                </div>

                <!-- Controls -->
                <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px; margin-bottom: 16px; display: flex; gap: 12px; align-items: center; justify-content: space-between;">
                    <div style="flex: 1; max-width: 400px; position: relative;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted);"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        <input type="text" id="manilaSearchInput" oninput="renderManilaTable()" placeholder="Search PRS, item, supplier, PO..." style="width: 100%; padding: 8px 12px 8px 36px; border: 1px solid var(--border-color); border-radius: var(--radius-md); font-size: 0.9rem; background: var(--bg-body); color: var(--text-main);">
                    </div>
                    
                    <div style="display: flex; gap: 12px; align-items: center;">
                        <div style="display: flex; background: var(--bg-body); border-radius: var(--radius-md); padding: 4px; border: 1px solid var(--border-color);">
                            <button id="manilaTabProcurement" onclick="setManilaTab('procurement')" style="padding: 6px 16px; border: none; background: ${currentManilaTab === 'procurement' ? 'var(--bg-surface)' : 'transparent'}; color: ${currentManilaTab === 'procurement' ? 'var(--text-main)' : 'var(--text-muted)'}; border-radius: 4px; font-size: 0.85rem; font-weight: ${currentManilaTab === 'procurement' ? '600' : '500'}; cursor: pointer; box-shadow: ${currentManilaTab === 'procurement' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'};">Procurement</button>
                            <button id="manilaTabBudget" onclick="setManilaTab('budget')" style="padding: 6px 16px; border: none; background: ${currentManilaTab === 'budget' ? 'var(--bg-surface)' : 'transparent'}; color: ${currentManilaTab === 'budget' ? 'var(--text-main)' : 'var(--text-muted)'}; border-radius: 4px; font-size: 0.85rem; font-weight: ${currentManilaTab === 'budget' ? '600' : '500'}; cursor: pointer; box-shadow: ${currentManilaTab === 'budget' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'};">Budget</button>
                        </div>
                        
                        <select id="manilaDesignationFilter" onchange="renderManilaTable()" style="padding: 8px 12px; border: 1px solid var(--border-color); border-radius: var(--radius-md); font-size: 0.9rem; background: var(--bg-body); color: var(--text-main); min-width: 150px;">
                            <option value="">All Designations</option>
                            <option value="Civil">Civil</option>
                            <option value="Mechanical">Mechanical</option>
                            <option value="Electrical">Electrical</option>
                            <option value="SCADA">SCADA</option>
                            <option value="Safety">Safety</option>
                            <option value="Admin">Admin</option>
                            <option value="Accounting">Accounting</option>
                            <option value="Logistics">Logistics</option>
                        </select>

                        <select id="manilaStatusFilter" onchange="renderManilaTable()" style="padding: 8px 12px; border: 1px solid var(--border-color); border-radius: var(--radius-md); font-size: 0.9rem; background: var(--bg-body); color: var(--text-main); min-width: 150px;">
                            <option value="">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Unpaid">Unpaid</option>
                            <option value="Paid">Paid</option>
                        </select>

                        <select id="manilaRowsPerPage" onchange="changeManilaRowsPerPage()" style="padding: 8px 12px; border: 1px solid var(--border-color); border-radius: var(--radius-md); font-size: 0.9rem; background: var(--bg-body); color: var(--text-main);">
                            <option value="5">5</option>
                            <option value="10" selected>10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                            <option value="all">All</option>
                        </select>
                    </div>
                </div>

                <!-- Table -->
                <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-sm);">
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: separate; border-spacing: 0; text-align: left; font-size: 0.85rem; font-family: 'Inter', system-ui, sans-serif;">
                            <thead id="manilaTableHeader" style="background: var(--bg-body);">
                                <!-- Headers will be injected based on tab -->
                            </thead>
                            <tbody id="manilaTableBody">
                                <!-- Records will go here -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Pagination -->
                <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 16px; margin-bottom: 24px;">
                    <div style="color: var(--text-muted); font-size: 0.85rem;" id="manilaPaginationInfo">Showing 0 records</div>
                    <div style="display: flex; gap: 8px;">
                        <button id="manilaPrevBtn" onclick="changeManilaPage(-1)" class="btn btn-secondary" disabled>Previous</button>
                        <button id="manilaNextBtn" onclick="changeManilaPage(1)" class="btn btn-secondary" disabled>Next</button>
                    </div>
                </div>
            `;
            
            contentArea.innerHTML = html;
            renderManilaTable();
        };

        window.setManilaTab = function(tab) {
            currentManilaTab = tab;
            renderManilaView();
        };

        window.deleteManilaRecord = function(id) {
            if (confirm('Are you sure you want to delete this Manila record?')) {
                manilaRecords = manilaRecords.filter(m => m.id !== id);
                renderManilaTable();
            }
        };

        let manilaCurrentPage = 1;
        let manilaRowsPerPageValue = 10;

        window.changeManilaRowsPerPage = function() {
            const select = document.getElementById('manilaRowsPerPage');
            if (select) {
                manilaRowsPerPageValue = select.value === 'all' ? 'all' : parseInt(select.value, 10);
                manilaCurrentPage = 1;
                renderManilaTable();
            }
        };

        window.changeManilaPage = function(dir) {
            manilaCurrentPage += dir;
            renderManilaTable();
        };

        window.renderManilaTable = function() {
            const thead = document.getElementById('manilaTableHeader');
            const tbody = document.getElementById('manilaTableBody');
            if (!thead || !tbody) return;

            const searchInput = document.getElementById('manilaSearchInput');
            const statusFilter = document.getElementById('manilaStatusFilter');
            const designationFilter = document.getElementById('manilaDesignationFilter');
            
            const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
            const statusVal = statusFilter ? statusFilter.value : '';
            const designationVal = designationFilter ? designationFilter.value : '';

            // Filter records
            let records = manilaRecords.filter(m => m.projectId === currentProjectId);
            
            if (searchTerm) {
                records = records.filter(m => {
                    const prs = prsRecords.find(p => p.id === m.prsId);
                    return (prs && prs.prsNo.toLowerCase().includes(searchTerm)) ||
                           (prs && prs.description.toLowerCase().includes(searchTerm)) ||
                           m.supplier.toLowerCase().includes(searchTerm) ||
                           m.poNo.toLowerCase().includes(searchTerm);
                });
            }
            
            if (statusVal) {
                if (currentManilaTab === 'procurement') {
                    records = records.filter(m => m.procurementStatus === statusVal);
                } else {
                    records = records.filter(m => m.paymentStatus === statusVal);
                }
            }

            if (designationVal) {
                records = records.filter(m => {
                    const prs = prsRecords.find(p => p.id === m.prsId);
                    return prs && prs.designation === designationVal;
                });
            }

            // Pagination logic
            let paginatedRecords = records;
            let totalPages = 1;
            
            if (manilaRowsPerPageValue !== 'all') {
                totalPages = Math.ceil(records.length / manilaRowsPerPageValue) || 1;
                if (manilaCurrentPage > totalPages) manilaCurrentPage = totalPages;
                if (manilaCurrentPage < 1) manilaCurrentPage = 1;
                
                const startIndex = (manilaCurrentPage - 1) * manilaRowsPerPageValue;
                paginatedRecords = records.slice(startIndex, startIndex + manilaRowsPerPageValue);
            }
            
            // Update pagination UI
            const paginationInfo = document.getElementById('manilaPaginationInfo');
            const prevBtn = document.getElementById('manilaPrevBtn');
            const nextBtn = document.getElementById('manilaNextBtn');
            
            if (paginationInfo) {
                if (manilaRowsPerPageValue === 'all') {
                    paginationInfo.textContent = `Showing all ${records.length} records`;
                } else {
                    const start = (manilaCurrentPage - 1) * manilaRowsPerPageValue + 1;
                    const end = Math.min(manilaCurrentPage * manilaRowsPerPageValue, records.length);
                    paginationInfo.textContent = `${start}-${end} of ${records.length}`;
                }
            }
            
            if (prevBtn) prevBtn.disabled = manilaCurrentPage <= 1;
            if (nextBtn) nextBtn.disabled = manilaCurrentPage >= totalPages || manilaRowsPerPageValue === 'all';

            // Render Headers
            if (currentManilaTab === 'procurement') {
                thead.innerHTML = `
                    <tr>
                        <th style="padding: 12px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">PROCESS</th>
                        <th style="padding: 12px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">DESIGNATION</th>
                        <th style="padding: 12px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">PRS NO.</th>
                        <th style="padding: 12px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">ITEM/PARTICULARS</th>
                        <th style="padding: 12px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">PRS DATE</th>
                        <th style="padding: 12px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">SUBTASK CHARGING</th>
                        <th style="padding: 12px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">PO NO.</th>
                        <th style="padding: 12px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">SUPPLIER</th>
                        <th style="padding: 12px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">TARGET DATE</th>
                        <th style="padding: 12px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">DATE DELIVERED</th>
                        <th style="padding: 12px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">DAYS DELAYED</th>
                        <th style="padding: 12px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">STATUS</th>
                        <th style="padding: 12px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">DEPT.</th>
                        <th style="padding: 12px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">REMARKS</th>
                        <th style="padding: 12px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);"></th>
                    </tr>
                `;
            } else {
                thead.innerHTML = `
                    <tr>
                        <th style="padding: 12px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">PROCESS</th>
                        <th style="padding: 12px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">DESIGNATION</th>
                        <th style="padding: 12px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">PRS NO.</th>
                        <th style="padding: 12px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">TOTAL COST</th>
                        <th style="padding: 12px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">VAT</th>
                        <th style="padding: 12px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">VAT AMT</th>
                        <th style="padding: 12px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">TERMS %</th>
                        <th style="padding: 12px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">NET OF VAT</th>
                        <th style="padding: 12px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">PAYMENT TERMS</th>
                        <th style="padding: 12px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">EWT</th>
                        <th style="padding: 12px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">ACTUAL AMT</th>
                        <th style="padding: 12px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">NEEDED DATE</th>
                        <th style="padding: 12px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">CHECK INV.</th>
                        <th style="padding: 12px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">RELEASED</th>
                        <th style="padding: 12px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">MONTH</th>
                        <th style="padding: 12px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">STATUS</th>
                        <th style="padding: 12px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);"></th>
                    </tr>
                `;
            }

            // Render Body
            if (paginatedRecords.length === 0) {
                tbody.innerHTML = `<tr><td colspan="20" style="padding: 24px; text-align: center; color: var(--text-muted);">No records found.</td></tr>`;
                return;
            }

            tbody.innerHTML = paginatedRecords.map(m => {
                const prs = prsRecords.find(p => p.id === m.prsId) || {};
                
                let rowHtml = `<tr style="transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='var(--bg-body)'" onmouseout="this.style.backgroundColor='transparent'">`;
                
                // Common columns
                rowHtml += `
                    <td style="padding: 12px 16px; border-bottom: 1px solid var(--border-color); color: var(--primary); font-weight: 500;">${prs.transaction || '-'}</td>
                    <td style="padding: 12px 16px; border-bottom: 1px solid var(--border-color);"><span style="background: var(--bg-body); padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; border: 1px solid var(--border-color);">${prs.designation || '-'}</span></td>
                    <td style="padding: 12px 16px; border-bottom: 1px solid var(--border-color); color: var(--primary); font-weight: 500;">${prs.prsNo || '-'}</td>
                `;

                if (currentManilaTab === 'procurement') {
                    rowHtml += `
                        <td style="padding: 12px 16px; border-bottom: 1px solid var(--border-color); max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${prs.description || ''}">${prs.description || '-'}</td>
                        <td style="padding: 12px 16px; border-bottom: 1px solid var(--border-color);">${prs.prsDate || '-'}</td>
                        <td style="padding: 12px 16px; border-bottom: 1px solid var(--border-color); max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${m.subtaskCharging}">${m.subtaskCharging || '-'}</td>
                        <td style="padding: 12px 16px; border-bottom: 1px solid var(--border-color);">${m.poNo || '-'}</td>
                        <td style="padding: 12px 16px; border-bottom: 1px solid var(--border-color);">${m.supplier || '-'}</td>
                        <td style="padding: 12px 16px; border-bottom: 1px solid var(--border-color);">${prs.targetDate || '-'}</td>
                        <td style="padding: 12px 16px; border-bottom: 1px solid var(--border-color);">${m.dateDelivered || '-'}</td>
                        <td style="padding: 12px 16px; border-bottom: 1px solid var(--border-color);">${m.daysDelayed}</td>
                        <td style="padding: 12px 16px; border-bottom: 1px solid var(--border-color);"><span style="padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; background: ${m.procurementStatus === 'Delivered' ? 'rgba(16, 185, 129, 0.1)' : m.procurementStatus === 'In Progress' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(245, 158, 11, 0.1)'}; color: ${m.procurementStatus === 'Delivered' ? 'var(--success)' : m.procurementStatus === 'In Progress' ? 'var(--primary)' : 'var(--warning)'}; border: 1px solid ${m.procurementStatus === 'Delivered' ? 'rgba(16, 185, 129, 0.2)' : m.procurementStatus === 'In Progress' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(245, 158, 11, 0.2)'};">${m.procurementStatus}</span></td>
                        <td style="padding: 12px 16px; border-bottom: 1px solid var(--border-color);">${m.currentDepartment || '-'}</td>
                        <td style="padding: 12px 16px; border-bottom: 1px solid var(--border-color); max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${m.remarks}">${m.remarks || '-'}</td>
                    `;
                } else {
                    rowHtml += `
                        <td style="padding: 12px 16px; border-bottom: 1px solid var(--border-color); font-weight: 500;">₱${m.totalCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                        <td style="padding: 12px 16px; border-bottom: 1px solid var(--border-color);">${m.vatType}</td>
                        <td style="padding: 12px 16px; border-bottom: 1px solid var(--border-color);">₱${m.vatAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                        <td style="padding: 12px 16px; border-bottom: 1px solid var(--border-color);">${m.paymentTermsPercent}%</td>
                        <td style="padding: 12px 16px; border-bottom: 1px solid var(--border-color);">₱${m.netOfVat.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                        <td style="padding: 12px 16px; border-bottom: 1px solid var(--border-color);">${m.paymentTerms || '-'}</td>
                        <td style="padding: 12px 16px; border-bottom: 1px solid var(--border-color);">${m.ewt == 0 ? 'No EWT' : (m.ewt * 100) + '%'}</td>
                        <td style="padding: 12px 16px; border-bottom: 1px solid var(--border-color); font-weight: 600; color: var(--success);">₱${m.actualAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                        <td style="padding: 12px 16px; border-bottom: 1px solid var(--border-color);">${m.paymentNeededDate || '-'}</td>
                        <td style="padding: 12px 16px; border-bottom: 1px solid var(--border-color);">${m.checkInventory || '-'}</td>
                        <td style="padding: 12px 16px; border-bottom: 1px solid var(--border-color);">${m.paymentReleased || '-'}</td>
                        <td style="padding: 12px 16px; border-bottom: 1px solid var(--border-color);">${m.paymentMonth || '-'}</td>
                        <td style="padding: 12px 16px; border-bottom: 1px solid var(--border-color);"><span style="padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; background: ${m.paymentStatus === 'Paid' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'}; color: ${m.paymentStatus === 'Paid' ? 'var(--success)' : 'var(--danger)'}; border: 1px solid ${m.paymentStatus === 'Paid' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'};">${m.paymentStatus}</span></td>
                    `;
                }

                rowHtml += `
                        <td style="padding: 12px 16px; border-bottom: 1px solid var(--border-color); text-align: right;">
                            <div style="display: flex; gap: 8px; justify-content: flex-end;">
                                <button class="btn btn-secondary" onclick="openManilaModal(${m.id})" style="padding: 4px 8px; font-size: 0.8rem;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                                <button class="btn btn-secondary" onclick="deleteManilaRecord(${m.id})" style="padding: 4px 8px; font-size: 0.8rem; color: var(--danger);"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg></button>
                            </div>
                        </td>
                    </tr>
                `;
                return rowHtml;
            }).join('');
        };

        window.openManilaModal = function(id = null) {
            editingManilaId = id;
            const modalOverlay = document.getElementById('manilaModal');
            if(modalOverlay) {
                modalOverlay.classList.add('active');
                const modal = modalOverlay.querySelector('.modal');
                if (modal) modal.classList.add('active');
                
                // Populate PRS Select
                const prsSelect = document.getElementById('manilaPrsSelect');
                if (prsSelect) {
                    prsSelect.innerHTML = '<option value="">Select existing PRS (MNL-MNL or LCL-MNL only)</option>';
                    const eligiblePrs = prsRecords.filter(p => {
                        if (p.projectId !== currentProjectId) return false;
                        if (p.transaction !== 'MNL-MNL' && p.transaction !== 'LCL-MNL') return false;
                        // If editing, allow the current PRS. If new, only allow PRS without a Manila record.
                        if (id) {
                            const currentRecord = manilaRecords.find(m => m.id === id);
                            if (currentRecord && currentRecord.prsId === p.id) return true;
                        }
                        return !manilaRecords.some(m => m.prsId === p.id);
                    });
                    eligiblePrs.forEach(p => {
                        const option = document.createElement('option');
                        option.value = p.id;
                        option.textContent = `${p.prsNo} - ${p.description.substring(0, 30)}...`;
                        prsSelect.appendChild(option);
                    });
                }
                
                // Populate Subtask Charging options
                const subtaskSelect = document.getElementById('manilaSubtaskCharging');
                if (subtaskSelect && subtaskSelect.options.length <= 1) {
                    subtaskChargingOptions.forEach(opt => {
                        const option = document.createElement('option');
                        option.value = opt;
                        option.textContent = opt;
                        subtaskSelect.appendChild(option);
                    });
                }

                if (id) {
                    const record = manilaRecords.find(r => r.id === id);
                    if (record) {
                        document.getElementById('manilaPrsSelect').value = record.prsId;
                        handleManilaPrsChange(); // Auto-fill PRS details
                        
                        document.getElementById('manilaSubtaskCharging').value = record.subtaskCharging;
                        document.getElementById('manilaWorkItemNo').value = record.workItemNo;
                        document.getElementById('manilaPoNo').value = record.poNo;
                        document.getElementById('manilaSupplier').value = record.supplier;
                        document.getElementById('manilaDateDelivered').value = record.dateDelivered;
                        document.getElementById('manilaDaysDelayed').value = record.daysDelayed;
                        document.getElementById('manilaProcurementStatus').value = record.procurementStatus;
                        document.getElementById('manilaCurrentDept').value = record.currentDepartment;
                        document.getElementById('manilaTotalCost').value = record.totalCost;
                        document.getElementById('manilaVatType').value = record.vatType;
                        document.getElementById('manilaPaymentTermsPercent').value = record.paymentTermsPercent;
                        document.getElementById('manilaPaymentTerms').value = record.paymentTerms;
                        document.getElementById('manilaEwt').value = record.ewt;
                        document.getElementById('manilaPaymentNeededDate').value = record.paymentNeededDate;
                        document.getElementById('manilaCheckInventory').value = record.checkInventory;
                        document.getElementById('manilaPaymentReleased').value = record.paymentReleased;
                        document.getElementById('manilaMonth').value = record.paymentMonth;
                        document.getElementById('manilaPaymentStatus').value = record.paymentStatus;
                        document.getElementById('manilaRemarks').value = record.remarks;
                        
                        calculateManilaBudget(); // Recalculate
                    }
                } else {
                    document.getElementById('manilaForm').reset();
                    document.getElementById('manilaPaymentTermsPercent').value = 100;
                    handleManilaPrsChange(); // Clear PRS details
                }
            }
        };

        window.closeManilaModal = function() {
            const modalOverlay = document.getElementById('manilaModal');
            if(modalOverlay) {
                modalOverlay.classList.remove('active');
                const modal = modalOverlay.querySelector('.modal');
                if (modal) modal.classList.remove('active');
            }
            editingManilaId = null;
        };

        window.handleManilaPrsChange = function() {
            const prsId = document.getElementById('manilaPrsSelect').value;
            if (prsId) {
                const prs = prsRecords.find(p => p.id == prsId);
                if (prs) {
                    document.getElementById('manilaProcess').value = prs.transaction;
                    document.getElementById('manilaPurchase').value = prs.type;
                    document.getElementById('manilaFund').value = prs.activityCharging;
                    document.getElementById('manilaDesignation').value = prs.designation;
                    document.getElementById('manilaPrsNo').value = prs.prsNo;
                    document.getElementById('manilaPrsDate').value = prs.prsDate;
                    document.getElementById('manilaItem').value = prs.description;
                    document.getElementById('manilaTargetDate').value = prs.targetDate;
                    
                    // Link subtask charging
                    const matchedSubtask = subtaskChargingOptions.find(opt => opt.includes(prs.activityCharging));
                    if (matchedSubtask) {
                        document.getElementById('manilaSubtaskCharging').value = matchedSubtask;
                    }
                    
                    calculateManilaDaysDelayed();
                }
            } else {
                document.getElementById('manilaProcess').value = '';
                document.getElementById('manilaPurchase').value = '';
                document.getElementById('manilaFund').value = '';
                document.getElementById('manilaDesignation').value = '';
                document.getElementById('manilaPrsNo').value = '';
                document.getElementById('manilaPrsDate').value = '';
                document.getElementById('manilaItem').value = '';
                document.getElementById('manilaTargetDate').value = '';
                document.getElementById('manilaSubtaskCharging').value = '';
                document.getElementById('manilaDaysDelayed').value = 0;
            }
        };

        window.calculateManilaDaysDelayed = function() {
            const targetDateStr = document.getElementById('manilaTargetDate').value;
            const deliveredDateStr = document.getElementById('manilaDateDelivered').value;
            
            if (targetDateStr && deliveredDateStr) {
                const target = new Date(targetDateStr);
                const delivered = new Date(deliveredDateStr);
                const diffTime = delivered - target;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                document.getElementById('manilaDaysDelayed').value = diffDays > 0 ? diffDays : 0;
            } else {
                document.getElementById('manilaDaysDelayed').value = 0;
            }
        };

        window.calculateManilaBudget = function() {
            const totalCost = parseFloat(document.getElementById('manilaTotalCost').value) || 0;
            const vatType = document.getElementById('manilaVatType').value;
            const termsPercent = parseFloat(document.getElementById('manilaPaymentTermsPercent').value) || 0;
            const ewtRate = parseFloat(document.getElementById('manilaEwt').value) || 0;
            
            let vatAmount = 0;
            let netOfVat = totalCost;
            
            if (vatType === 'VAT') {
                netOfVat = totalCost / 1.12;
                vatAmount = totalCost - netOfVat;
            }
            
            document.getElementById('manilaVatAmount').value = vatAmount.toFixed(2);
            document.getElementById('manilaNetOfVat').value = netOfVat.toFixed(2);
            
            const ewtAmount = netOfVat * ewtRate;
            const actualAmount = (totalCost * (termsPercent / 100)) - ewtAmount;
            
            document.getElementById('manilaActualAmount').value = actualAmount.toFixed(2);
        };

        window.updateManilaMonth = function() {
            const releasedDateStr = document.getElementById('manilaPaymentReleased').value;
            if (releasedDateStr) {
                const date = new Date(releasedDateStr);
                const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                document.getElementById('manilaMonth').value = monthNames[date.getMonth()] + " - " + date.getFullYear();
            } else {
                document.getElementById('manilaMonth').value = '';
            }
        };

        // --- Local (Replenishment) View Logic ---
        window.renderLocalView = function() {
            if (!currentProjectId) return;
            currentView = 'local';
            updateSubNavVisibility();
            
            let html = `
                <div class="view-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <div>
                        <h1 style="font-size: 1.5rem; font-weight: 700;">Replenishment Monitoring</h1>
                        <div style="color: var(--text-muted); font-size: 0.85rem;">Track LCL-LCL and MNL-LCL replenishment transactions</div>
                    </div>
                    <button class="btn btn-primary" onclick="openLocalModal()" style="background: #2563eb; color: white; border: none;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> Add New Replenishment</button>
                </div>

                <div style="background: rgba(0, 82, 204, 0.05); border: 1px solid rgba(0, 82, 204, 0.2); border-radius: var(--radius-md); padding: 16px; margin-bottom: 24px; display: flex; gap: 12px;">
                    <div style="color: var(--primary);"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2v6h-6"></path><path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path><path d="M3 22v-6h6"></path><path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path></svg></div>
                    <div>
                        <div style="font-weight: 600; color: var(--primary); font-size: 0.9rem; margin-bottom: 4px;">Flexible Entry</div>
                        <div style="font-size: 0.85rem; color: var(--text-muted);">Replenishments can be linked to existing PRS or created as standalone entries for independent transactions.</div>
                    </div>
                </div>

                <!-- Controls -->
                <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px; margin-bottom: 16px; display: flex; gap: 12px; align-items: center; justify-content: space-between;">
                    <div style="flex: 1; max-width: 400px; position: relative;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted);"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        <input type="text" id="localSearchInput" oninput="renderLocalTable()" placeholder="Search REPLE no., item, supplier, charging..." style="width: 100%; padding: 8px 12px 8px 36px; border: 1px solid var(--border-color); border-radius: var(--radius-md); font-size: 0.9rem; background: var(--bg-body); color: var(--text-main);">
                    </div>
                    
                    <div style="display: flex; gap: 12px; align-items: center;">
                        <div style="display: flex; background: var(--bg-body); border-radius: var(--radius-md); padding: 4px; border: 1px solid var(--border-color);">
                            <button id="localTabProcurement" onclick="setLocalTab('procurement')" style="padding: 6px 16px; border: none; background: ${currentLocalTab === 'procurement' ? 'var(--bg-surface)' : 'transparent'}; color: ${currentLocalTab === 'procurement' ? 'var(--text-main)' : 'var(--text-muted)'}; border-radius: 4px; font-size: 0.85rem; font-weight: ${currentLocalTab === 'procurement' ? '600' : '500'}; cursor: pointer; box-shadow: ${currentLocalTab === 'procurement' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'};">Procurement</button>
                            <button id="localTabSupplies" onclick="setLocalTab('supplies')" style="padding: 6px 16px; border: none; background: ${currentLocalTab === 'supplies' ? 'var(--bg-surface)' : 'transparent'}; color: ${currentLocalTab === 'supplies' ? 'var(--text-main)' : 'var(--text-muted)'}; border-radius: 4px; font-size: 0.85rem; font-weight: ${currentLocalTab === 'supplies' ? '600' : '500'}; cursor: pointer; box-shadow: ${currentLocalTab === 'supplies' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'};">Supplies</button>
                            <button id="localTabBudget" onclick="setLocalTab('budget')" style="padding: 6px 16px; border: none; background: ${currentLocalTab === 'budget' ? 'var(--bg-surface)' : 'transparent'}; color: ${currentLocalTab === 'budget' ? 'var(--text-main)' : 'var(--text-muted)'}; border-radius: 4px; font-size: 0.85rem; font-weight: ${currentLocalTab === 'budget' ? '600' : '500'}; cursor: pointer; box-shadow: ${currentLocalTab === 'budget' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'};">Budget</button>
                        </div>
                        
                        <select id="localCategoryFilter" onchange="renderLocalTable()" style="padding: 8px 12px; border: 1px solid var(--border-color); border-radius: var(--radius-md); font-size: 0.9rem; background: var(--bg-body); color: var(--text-main); min-width: 150px;">
                            <option value="">All Categories</option>
                            <option value="Admin Expense">Admin Expense</option>
                            <option value="Operations">Operations</option>
                            <option value="Logistics">Logistics</option>
                        </select>

                        <select id="localStatusFilter" onchange="renderLocalTable()" style="padding: 8px 12px; border: 1px solid var(--border-color); border-radius: var(--radius-md); font-size: 0.9rem; background: var(--bg-body); color: var(--text-main); min-width: 150px;">
                            <option value="">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Unpaid">Unpaid</option>
                            <option value="Paid">Paid</option>
                        </select>

                        <select id="localRowsPerPage" onchange="changeLocalRowsPerPage()" style="padding: 8px 12px; border: 1px solid var(--border-color); border-radius: var(--radius-md); font-size: 0.9rem; background: var(--bg-body); color: var(--text-main);">
                            <option value="5">5</option>
                            <option value="10" selected>10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                            <option value="all">All</option>
                        </select>
                    </div>
                </div>

                <!-- Table -->
                <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-sm);">
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: separate; border-spacing: 0; text-align: left; font-size: 0.85rem; font-family: 'Inter', system-ui, sans-serif;">
                            <thead id="localTableHeader" style="background: var(--bg-body);">
                                <!-- Headers will be injected based on tab -->
                            </thead>
                            <tbody id="localTableBody">
                                <!-- Records will go here -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Pagination -->
                <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 16px; margin-bottom: 24px;">
                    <div style="color: var(--text-muted); font-size: 0.85rem;" id="localPaginationInfo">Showing 0 records</div>
                    <div style="display: flex; gap: 8px;">
                        <button id="localPrevBtn" onclick="changeLocalPage(-1)" class="btn btn-secondary" disabled>Previous</button>
                        <button id="localNextBtn" onclick="changeLocalPage(1)" class="btn btn-secondary" disabled>Next</button>
                    </div>
                </div>
            `;
            
            contentArea.innerHTML = html;
            renderLocalTable();
        };

        window.setLocalTab = function(tab) {
            currentLocalTab = tab;
            renderLocalView();
        };

        window.deleteLocalRecord = function(id) {
            if (confirm('Are you sure you want to delete this Replenishment record?')) {
                localRecords = localRecords.filter(m => m.id !== id);
                renderLocalTable();
            }
        };

        let localCurrentPage = 1;
        let localRowsPerPageValue = 10;

        window.changeLocalRowsPerPage = function() {
            const select = document.getElementById('localRowsPerPage');
            if (select) {
                localRowsPerPageValue = select.value === 'all' ? 'all' : parseInt(select.value, 10);
                localCurrentPage = 1;
                renderLocalTable();
            }
        };

        window.changeLocalPage = function(dir) {
            localCurrentPage += dir;
            renderLocalTable();
        };

        window.renderLocalTable = function() {
            const thead = document.getElementById('localTableHeader');
            const tbody = document.getElementById('localTableBody');
            if (!thead || !tbody) return;

            const searchInput = document.getElementById('localSearchInput');
            const statusFilter = document.getElementById('localStatusFilter');
            const categoryFilter = document.getElementById('localCategoryFilter');
            
            const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
            const statusVal = statusFilter ? statusFilter.value : '';
            const categoryVal = categoryFilter ? categoryFilter.value : '';

            // Filter records
            let records = localRecords.filter(m => m.projectId === currentProjectId);
            
            if (searchTerm) {
                records = records.filter(m => {
                    const prs = m.prsId ? prsRecords.find(p => p.id === m.prsId) : null;
                    return (prs && prs.prsNo.toLowerCase().includes(searchTerm)) ||
                           (m.repleNo && m.repleNo.toLowerCase().includes(searchTerm)) ||
                           (m.item && m.item.toLowerCase().includes(searchTerm)) ||
                           (m.supplier && m.supplier.toLowerCase().includes(searchTerm)) ||
                           (m.poNo && m.poNo.toLowerCase().includes(searchTerm));
                });
            }
            
            if (statusVal) {
                if (currentLocalTab === 'procurement' || currentLocalTab === 'supplies') {
                    records = records.filter(m => m.procurementStatus === statusVal);
                } else {
                    records = records.filter(m => m.paymentStatus === statusVal);
                }
            }

            if (categoryVal) {
                records = records.filter(m => m.repleCategory === categoryVal);
            }

            // Pagination logic
            let paginatedRecords = records;
            let totalPages = 1;
            
            if (localRowsPerPageValue !== 'all') {
                totalPages = Math.ceil(records.length / localRowsPerPageValue) || 1;
                if (localCurrentPage > totalPages) localCurrentPage = totalPages;
                if (localCurrentPage < 1) localCurrentPage = 1;
                
                const startIndex = (localCurrentPage - 1) * localRowsPerPageValue;
                paginatedRecords = records.slice(startIndex, startIndex + localRowsPerPageValue);
            }
            
            // Update pagination UI
            const paginationInfo = document.getElementById('localPaginationInfo');
            const prevBtn = document.getElementById('localPrevBtn');
            const nextBtn = document.getElementById('localNextBtn');
            
            if (paginationInfo) {
                if (localRowsPerPageValue === 'all') {
                    paginationInfo.textContent = `Showing all ${records.length} records`;
                } else {
                    const start = (localCurrentPage - 1) * localRowsPerPageValue + 1;
                    const end = Math.min(localCurrentPage * localRowsPerPageValue, records.length);
                    paginationInfo.textContent = `${start}-${end} of ${records.length}`;
                }
            }
            
            if (prevBtn) prevBtn.disabled = localCurrentPage <= 1;
            if (nextBtn) nextBtn.disabled = localCurrentPage >= totalPages || localRowsPerPageValue === 'all';

            // Render Headers
            if (currentLocalTab === 'procurement') {
                thead.innerHTML = `
                    <tr>
                        <th style="padding: 14px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">PROCESS</th>
                        <th style="padding: 14px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">CATEGORY</th>
                        <th style="padding: 14px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">REPLE NO.</th>
                        <th style="padding: 14px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">PRS NO.</th>
                        <th style="padding: 14px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">ITEM/PARTICULARS</th>
                        <th style="padding: 14px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">CHARGING CAT.</th>
                        <th style="padding: 14px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">BOQ CHARGING</th>
                        <th style="padding: 14px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">NOTE</th>
                        <th style="padding: 14px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">SUBTASK</th>
                        <th style="padding: 14px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">WORK ITEM</th>
                        <th style="padding: 14px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">STATUS</th>
                        <th style="padding: 14px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color); text-align: right;"></th>
                    </tr>
                `;
            } else if (currentLocalTab === 'supplies') {
                thead.innerHTML = `
                    <tr>
                        <th style="padding: 14px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">PROCESS</th>
                        <th style="padding: 14px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">CATEGORY</th>
                        <th style="padding: 14px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">REPLE NO.</th>
                        <th style="padding: 14px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">PRS NO.</th>
                        <th style="padding: 14px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">PO NO.</th>
                        <th style="padding: 14px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">SUPPLIER</th>
                        <th style="padding: 14px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">TARGET DATE</th>
                        <th style="padding: 14px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">DELIVERED</th>
                        <th style="padding: 14px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">DELAYED</th>
                        <th style="padding: 14px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">STATUS</th>
                        <th style="padding: 14px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">DEPT.</th>
                        <th style="padding: 14px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">REMARKS</th>
                        <th style="padding: 14px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color); text-align: right;"></th>
                    </tr>
                `;
            } else {
                thead.innerHTML = `
                    <tr>
                        <th style="padding: 14px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">PROCESS</th>
                        <th style="padding: 14px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">CATEGORY</th>
                        <th style="padding: 14px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">REPLE NO.</th>
                        <th style="padding: 14px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">PRS NO.</th>
                        <th style="padding: 14px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">TOTAL COST</th>
                        <th style="padding: 14px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">VAT</th>
                        <th style="padding: 14px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">VAT AMT</th>
                        <th style="padding: 14px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">TERMS %</th>
                        <th style="padding: 14px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">EWT</th>
                        <th style="padding: 14px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">ACTUAL AMT</th>
                        <th style="padding: 14px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">NEEDED DATE</th>
                        <th style="padding: 14px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">MONTH</th>
                        <th style="padding: 14px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">STATUS</th>
                        <th style="padding: 14px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">CONCERNS</th>
                        <th style="padding: 14px 16px; font-weight: 600; color: var(--text-muted); border-bottom: 1px solid var(--border-color); text-align: right;"></th>
                    </tr>
                `;
            }

            // Render Body
            tbody.innerHTML = '';
            if (paginatedRecords.length === 0) {
                tbody.innerHTML = `<tr><td colspan="15" style="padding: 24px; text-align: center; color: var(--text-muted);">No replenishment records found.</td></tr>`;
                return;
            }

            paginatedRecords.forEach(m => {
                const prs = m.prsId ? prsRecords.find(p => p.id === m.prsId) : null;
                const prsNo = prs ? prs.prsNo : '-';
                
                let statusBadge = '';
                if (currentLocalTab === 'procurement' || currentLocalTab === 'supplies') {
                    if (m.procurementStatus === 'Delivered') statusBadge = `<span style="padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 500; background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2);">Delivered</span>`;
                    else if (m.procurementStatus === 'In Progress') statusBadge = `<span style="padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 500; background: rgba(245, 158, 11, 0.1); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.2);">In Progress</span>`;
                    else statusBadge = `<span style="padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 500; background: rgba(100, 116, 139, 0.1); color: #64748b; border: 1px solid rgba(100, 116, 139, 0.2);">Pending</span>`;
                } else {
                    if (m.paymentStatus === 'Paid') statusBadge = `<span style="padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 500; background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2);">Paid</span>`;
                    else statusBadge = `<span style="padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 500; background: rgba(245, 158, 11, 0.1); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.2);">Unpaid</span>`;
                }

                const ewtLabels = {0: 'No EWT', 1: 'Goods (1%)', 2: 'Services (2%)'};
                const ewtLabel = ewtLabels[m.ewt] || 'No EWT';

                let rowHtml = `<tr>
                    <td style="padding: 12px 16px; border-bottom: 1px solid var(--border-color);"><span style="color: var(--primary); font-weight: 500; background: rgba(0, 82, 204, 0.1); padding: 2px 6px; border-radius: 4px; font-size: 0.75rem;">${m.process}</span></td>
                    <td style="padding: 12px 16px; border-bottom: 1px solid var(--border-color);"><span style="color: #d97706; font-weight: 500; background: rgba(245, 158, 11, 0.1); padding: 2px 6px; border-radius: 4px; font-size: 0.75rem;">${m.repleCategory}</span></td>
                    <td style="padding: 12px 16px; border-bottom: 1px solid var(--border-color); font-weight: 600;">${m.repleNo || '-'}</td>
                    <td style="padding: 12px 16px; border-bottom: 1px solid var(--border-color); color: var(--primary);">${prsNo}</td>
                `;

                if (currentLocalTab === 'procurement') {
                    const chargingCat = m.chargingNoteCode ? m.chargingNoteCode.split(' - ')[0] : '-';
                    rowHtml += `
                        <td style="padding: 12px 16px; border-bottom: 1px solid var(--border-color);">${m.item || '-'}</td>
                        <td style="padding: 12px 16px; border-bottom: 1px solid var(--border-color);">${chargingCat}</td>
                        <td style="padding: 12px 16px; border-bottom: 1px solid var(--border-color);">${m.boqCharging || '-'}</td>
                        <td style="padding: 12px 16px; border-bottom: 1px solid var(--border-color);">${chargingCat}</td>
                        <td style="padding: 12px 16px; border-bottom: 1px solid var(--border-color);">${m.subtaskCharging || '-'}</td>
                        <td style="padding: 12px 16px; border-bottom: 1px solid var(--border-color);">${m.workItemNo || '-'}</td>
                        <td style="padding: 12px 16px; border-bottom: 1px solid var(--border-color);">${statusBadge}</td>
                    `;
                } else if (currentLocalTab === 'supplies') {
                    rowHtml += `
                        <td style="padding: 12px 16px; border-bottom: 1px solid var(--border-color);">${m.poNo || '-'}</td>
                        <td style="padding: 12px 16px; border-bottom: 1px solid var(--border-color);">${m.supplier || '-'}</td>
                        <td style="padding: 12px 16px; border-bottom: 1px solid var(--border-color);">${m.targetDate ? new Date(m.targetDate).toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'}).replace(/ /g, '-') : '-'}</td>
                        <td style="padding: 12px 16px; border-bottom: 1px solid var(--border-color);">${m.dateDelivered ? new Date(m.dateDelivered).toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'}).replace(/ /g, '-') : '-'}</td>
                        <td style="padding: 12px 16px; border-bottom: 1px solid var(--border-color);">${m.daysDelayed}</td>
                        <td style="padding: 12px 16px; border-bottom: 1px solid var(--border-color);">${statusBadge}</td>
                        <td style="padding: 12px 16px; border-bottom: 1px solid var(--border-color);">${m.currentDepartment || '-'}</td>
                        <td style="padding: 12px 16px; border-bottom: 1px solid var(--border-color);">${m.concerns || '-'}</td>
                    `;
                } else {
                    rowHtml += `
                        <td style="padding: 12px 16px; border-bottom: 1px solid var(--border-color); font-weight: 500;">₱${m.totalCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                        <td style="padding: 12px 16px; border-bottom: 1px solid var(--border-color);">${m.vatType}</td>
                        <td style="padding: 12px 16px; border-bottom: 1px solid var(--border-color);">₱${m.vatAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                        <td style="padding: 12px 16px; border-bottom: 1px solid var(--border-color);">${m.paymentTermsPercent}%</td>
                        <td style="padding: 12px 16px; border-bottom: 1px solid var(--border-color);">${ewtLabel}</td>
                        <td style="padding: 12px 16px; border-bottom: 1px solid var(--border-color); font-weight: 600; color: var(--success);">₱${m.actualAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                        <td style="padding: 12px 16px; border-bottom: 1px solid var(--border-color);">${m.paymentNeededDate ? new Date(m.paymentNeededDate).toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'}).replace(/ /g, '-') : '-'}</td>
                        <td style="padding: 12px 16px; border-bottom: 1px solid var(--border-color);">${m.paymentMonth || '-'}</td>
                        <td style="padding: 12px 16px; border-bottom: 1px solid var(--border-color);">${statusBadge}</td>
                        <td style="padding: 12px 16px; border-bottom: 1px solid var(--border-color);">${m.concerns || '-'}</td>
                    `;
                }

                rowHtml += `
                        <td style="padding: 12px 16px; border-bottom: 1px solid var(--border-color); text-align: right;">
                            <div style="display: flex; gap: 8px; justify-content: flex-end;">
                                <button class="btn btn-secondary" onclick="openLocalModal(${m.id})" style="padding: 4px 8px; font-size: 0.8rem;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                                <button class="btn btn-secondary" onclick="deleteLocalRecord(${m.id})" style="padding: 4px 8px; font-size: 0.8rem; color: var(--danger);"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg></button>
                            </div>
                        </td>
                    </tr>
                `;
                tbody.innerHTML += rowHtml;
            });
        };

        window.openLocalModal = function(id = null) {
            editingLocalId = id;
            const modalOverlay = document.getElementById('localModal');
            if(modalOverlay) {
                modalOverlay.classList.add('active');
                const modal = modalOverlay.querySelector('.modal');
                if (modal) modal.classList.add('active');
                
                // Populate Charging Note Code Select
                const chargingSelect = document.getElementById('localChargingNoteCode');
                if (chargingSelect && chargingSelect.options.length <= 1) {
                    subtaskChargingOptions.forEach(opt => {
                        const option = document.createElement('option');
                        option.value = opt;
                        option.textContent = opt;
                        chargingSelect.appendChild(option);
                    });
                }

                // Populate PRS Select
                const prsSelect = document.getElementById('localPrsSelect');
                if (prsSelect) {
                    prsSelect.innerHTML = '<option value="">Select existing PRS (LCL-LCL or MNL-LCL)</option>';
                    const eligiblePrs = prsRecords.filter(p => {
                        if (p.projectId !== currentProjectId) return false;
                        if (p.transaction !== 'LCL-LCL' && p.transaction !== 'MNL-LCL') return false;
                        // If editing, allow the current PRS. If new, only allow PRS without a Local record.
                        if (id) {
                            const currentRecord = localRecords.find(m => m.id === id);
                            if (currentRecord && currentRecord.prsId === p.id) return true;
                        }
                        return !localRecords.some(m => m.prsId === p.id);
                    });
                    eligiblePrs.forEach(p => {
                        const option = document.createElement('option');
                        option.value = p.id;
                        option.textContent = `${p.prsNo} - ${p.description.substring(0, 30)}...`;
                        prsSelect.appendChild(option);
                    });
                }

                if (id) {
                    const record = localRecords.find(r => r.id === id);
                    if (record) {
                        document.getElementById('localStandaloneToggle').checked = !record.prsId;
                        toggleLocalStandalone();

                        if (record.prsId) {
                            document.getElementById('localPrsSelect').value = record.prsId;
                            handleLocalPrsChange(); // Auto-fill PRS details
                        }

                        document.getElementById('localProcess').value = record.process;
                        document.getElementById('localRepleCategory').value = record.repleCategory;
                        document.getElementById('localRepleNo').value = record.repleNo;
                        document.getElementById('localItem').value = record.item;
                        document.getElementById('localChargingNoteCode').value = record.chargingNoteCode;
                        document.getElementById('localChargingCategory').value = record.chargingCategory;
                        document.getElementById('localBoqCharging').value = record.boqCharging;
                        document.getElementById('localSubtaskCharging').value = record.subtaskCharging;
                        document.getElementById('localWorkItemNo').value = record.workItemNo;
                        document.getElementById('localStartDate').value = record.startDate;
                        document.getElementById('localEndDate').value = record.endDate;
                        
                        document.getElementById('localPoNo').value = record.poNo;
                        document.getElementById('localSupplier').value = record.supplier;
                        document.getElementById('localTargetDate').value = record.targetDate;
                        document.getElementById('localDateDelivered').value = record.dateDelivered;
                        document.getElementById('localDaysDelayed').value = record.daysDelayed;
                        document.getElementById('localProcurementStatus').value = record.procurementStatus;
                        document.getElementById('localCurrentDept').value = record.currentDepartment;
                        
                        document.getElementById('localTotalCost').value = record.totalCost;
                        document.getElementById('localVatType').value = record.vatType;
                        document.getElementById('localPaymentTermsPercent').value = record.paymentTermsPercent;
                        document.getElementById('localPaymentTerms').value = record.paymentTerms;
                        document.getElementById('localEwt').value = record.ewt;
                        document.getElementById('localPaymentNeededDate').value = record.paymentNeededDate;
                        document.getElementById('localPaymentReleased').value = record.paymentReleased;
                        document.getElementById('localMonth').value = record.paymentMonth;
                        document.getElementById('localPaymentStatus').value = record.paymentStatus;
                        document.getElementById('localConcerns').value = record.concerns;
                        
                        calculateLocalBudget();
                    }
                } else {
                    document.getElementById('localForm').reset();
                    document.getElementById('localStandaloneToggle').checked = false;
                    toggleLocalStandalone();
                    document.getElementById('localPaymentTermsPercent').value = 100;
                    handleLocalPrsChange(); // Clear PRS details
                }
            }
        };

        window.closeLocalModal = function() {
            const modalOverlay = document.getElementById('localModal');
            if(modalOverlay) {
                modalOverlay.classList.remove('active');
                const modal = modalOverlay.querySelector('.modal');
                if (modal) modal.classList.remove('active');
            }
            editingLocalId = null;
        };

        window.toggleLocalStandalone = function() {
            const isStandalone = document.getElementById('localStandaloneToggle').checked;
            const prsGroup = document.getElementById('localPrsSelectGroup');
            const prsSelect = document.getElementById('localPrsSelect');
            
            if (isStandalone) {
                prsGroup.style.display = 'none';
                prsSelect.removeAttribute('required');
                prsSelect.value = '';
                handleLocalPrsChange(); // Clear linked fields
            } else {
                prsGroup.style.display = 'block';
                prsSelect.setAttribute('required', 'required');
            }
        };

        window.handleLocalPrsChange = function() {
            const prsId = document.getElementById('localPrsSelect').value;
            if (prsId) {
                const prs = prsRecords.find(p => p.id == prsId);
                if (prs) {
                    document.getElementById('localProcess').value = prs.transaction;
                    document.getElementById('localPrsNo').value = prs.prsNo;
                    document.getElementById('localItem').value = prs.description;
                    document.getElementById('localTargetDate').value = prs.targetDate;
                    
                    const matchedSubtask = subtaskChargingOptions.find(opt => opt.includes(prs.activityCharging));
                    if (matchedSubtask) {
                        document.getElementById('localChargingNoteCode').value = matchedSubtask;
                        const parts = matchedSubtask.split(' - ');
                        if (parts.length > 1) {
                            document.getElementById('localChargingCategory').value = parts[0];
                            document.getElementById('localBoqCharging').value = parts[1];
                        }
                        document.getElementById('localSubtaskCharging').value = matchedSubtask;
                    }

                    calculateLocalDaysDelayed();
                }
            } else {
                document.getElementById('localPrsNo').value = '';
                if (!document.getElementById('localStandaloneToggle').checked) {
                    document.getElementById('localProcess').value = 'LCL-LCL';
                    document.getElementById('localItem').value = '';
                    document.getElementById('localTargetDate').value = '';
                    document.getElementById('localChargingNoteCode').value = '';
                    document.getElementById('localChargingCategory').value = '';
                    document.getElementById('localBoqCharging').value = '';
                    document.getElementById('localSubtaskCharging').value = '';
                    document.getElementById('localDaysDelayed').value = 0;
                }
            }
        };

        document.getElementById('localChargingNoteCode').addEventListener('change', function() {
            const val = this.value;
            if (val) {
                const parts = val.split(' - ');
                document.getElementById('localChargingCategory').value = parts[0];
                document.getElementById('localBoqCharging').value = parts[1] || '';
                document.getElementById('localSubtaskCharging').value = val;
            } else {
                document.getElementById('localChargingCategory').value = '';
                document.getElementById('localBoqCharging').value = '';
                document.getElementById('localSubtaskCharging').value = '';
            }
        });

        window.calculateLocalDaysDelayed = function() {
            const targetDateStr = document.getElementById('localTargetDate').value;
            const deliveredDateStr = document.getElementById('localDateDelivered').value;
            
            if (targetDateStr && deliveredDateStr) {
                const target = new Date(targetDateStr);
                const delivered = new Date(deliveredDateStr);
                const diffTime = delivered - target;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                document.getElementById('localDaysDelayed').value = diffDays > 0 ? diffDays : 0;
            } else {
                document.getElementById('localDaysDelayed').value = 0;
            }
        };

        window.calculateLocalBudget = function() {
            const totalCost = parseFloat(document.getElementById('localTotalCost').value) || 0;
            const vatType = document.getElementById('localVatType').value;
            const paymentTermsPercent = parseFloat(document.getElementById('localPaymentTermsPercent').value) || 0;
            const ewtRate = parseFloat(document.getElementById('localEwt').value) || 0;

            let vatAmount = 0;
            let netOfVat = totalCost;

            if (vatType === 'VAT') {
                netOfVat = totalCost / 1.12;
                vatAmount = totalCost - netOfVat;
            }

            const termsAmount = totalCost * (paymentTermsPercent / 100);
            const ewtAmount = netOfVat * (ewtRate / 100);
            const actualAmount = termsAmount - ewtAmount;

            document.getElementById('localVatAmount').value = vatAmount.toFixed(2);
            document.getElementById('localNetOfVat').value = netOfVat.toFixed(2);
            document.getElementById('localActualAmount').value = actualAmount.toFixed(2);
        };

        window.updateLocalMonth = function() {
            const releasedDateStr = document.getElementById('localPaymentReleased').value;
            if (releasedDateStr) {
                const date = new Date(releasedDateStr);
                const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                document.getElementById('localMonth').value = monthNames[date.getMonth()] + " - " + date.getFullYear();
            } else {
                document.getElementById('localMonth').value = '';
            }
        };

        const localForm = document.getElementById('localForm');
        if (localForm) {
            localForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const isStandalone = document.getElementById('localStandaloneToggle').checked;
                const prsIdVal = document.getElementById('localPrsSelect').value;
                const prsId = isStandalone ? null : (prsIdVal ? parseInt(prsIdVal) : null);

                const recordData = {
                    projectId: currentProjectId,
                    prsId: prsId,
                    process: document.getElementById('localProcess').value,
                    repleCategory: document.getElementById('localRepleCategory').value,
                    repleNo: document.getElementById('localRepleNo').value,
                    item: document.getElementById('localItem').value,
                    chargingNoteCode: document.getElementById('localChargingNoteCode').value,
                    chargingCategory: document.getElementById('localChargingCategory').value,
                    boqCharging: document.getElementById('localBoqCharging').value,
                    subtaskCharging: document.getElementById('localSubtaskCharging').value,
                    workItemNo: document.getElementById('localWorkItemNo').value,
                    startDate: document.getElementById('localStartDate').value,
                    endDate: document.getElementById('localEndDate').value,
                    
                    poNo: document.getElementById('localPoNo').value,
                    supplier: document.getElementById('localSupplier').value,
                    targetDate: document.getElementById('localTargetDate').value,
                    dateDelivered: document.getElementById('localDateDelivered').value,
                    daysDelayed: parseInt(document.getElementById('localDaysDelayed').value) || 0,
                    procurementStatus: document.getElementById('localProcurementStatus').value,
                    currentDepartment: document.getElementById('localCurrentDept').value,
                    
                    totalCost: parseFloat(document.getElementById('localTotalCost').value) || 0,
                    vatType: document.getElementById('localVatType').value,
                    vatAmount: parseFloat(document.getElementById('localVatAmount').value) || 0,
                    netOfVat: parseFloat(document.getElementById('localNetOfVat').value) || 0,
                    paymentTermsPercent: parseFloat(document.getElementById('localPaymentTermsPercent').value) || 0,
                    paymentTerms: document.getElementById('localPaymentTerms').value,
                    ewt: parseFloat(document.getElementById('localEwt').value) || 0,
                    actualAmount: parseFloat(document.getElementById('localActualAmount').value) || 0,
                    paymentNeededDate: document.getElementById('localPaymentNeededDate').value,
                    paymentReleased: document.getElementById('localPaymentReleased').value,
                    paymentMonth: document.getElementById('localMonth').value,
                    paymentStatus: document.getElementById('localPaymentStatus').value,
                    concerns: document.getElementById('localConcerns').value
                };

                if (editingLocalId) {
                    const recordIndex = localRecords.findIndex(r => r.id === editingLocalId);
                    if (recordIndex !== -1) {
                        localRecords[recordIndex] = {
                            ...localRecords[recordIndex],
                            ...recordData
                        };
                    }
                } else {
                    localRecords.push({
                        id: Date.now(),
                        ...recordData
                    });
                }

                closeLocalModal();
                if (currentView === 'local') {
                    renderLocalTable();
                }
            });
        }

        window.createLocalRecord = function(prsId) {
            const prs = prsRecords.find(p => p.id === prsId);
            if (!prs) return;

            const matchedSubtask = subtaskChargingOptions.find(opt => opt.includes(prs.activityCharging));
            const chargingCat = matchedSubtask ? matchedSubtask.split(' - ')[0] : '';
            const boqCharging = matchedSubtask ? matchedSubtask.split(' - ')[1] : '';

            const newLocalRecord = {
                id: Date.now() + Math.floor(Math.random() * 1000),
                projectId: currentProjectId,
                prsId: prsId,
                process: prs.transaction,
                repleCategory: 'Admin Expense',
                repleNo: '',
                item: prs.description,
                chargingNoteCode: matchedSubtask || '',
                chargingCategory: chargingCat,
                boqCharging: boqCharging,
                subtaskCharging: matchedSubtask || '',
                workItemNo: '',
                startDate: '',
                endDate: '',
                poNo: '',
                supplier: '',
                targetDate: prs.targetDate,
                dateDelivered: '',
                daysDelayed: 0,
                procurementStatus: 'Pending',
                currentDepartment: '',
                totalCost: 0,
                vatType: 'Non-VAT',
                vatAmount: 0,
                netOfVat: 0,
                paymentTermsPercent: 100,
                paymentTerms: 'Full Payment (100%)',
                ewt: 0,
                actualAmount: 0,
                paymentNeededDate: '',
                paymentReleased: '',
                paymentMonth: '',
                paymentStatus: 'Unpaid',
                concerns: ''
            };
            localRecords.push(newLocalRecord);
        }

        window.renderExpenseOverview = function() {
            if (!currentProjectId) return;
            currentView = 'expense-overview';
            updateSubNavVisibility();
            
            contentArea.innerHTML = `
                <div class="view-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
                    <div>
                        <h1 style="font-size: 1.5rem; font-weight: 700; color: var(--text-main); margin-bottom: 4px;">Expense Overview</h1>
                        <div style="color: var(--text-muted); font-size: 0.9rem;">Track procurement expenses across Manila and Local</div>
                    </div>
                </div>

                <!-- KPI Cards -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; margin-bottom: 24px;" id="expenseKpis">
                    <!-- Populated by JS -->
                </div>

                <!-- Budget Summary -->
                <div class="card" style="margin-bottom: 24px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                        <h3 style="font-size: 1rem; font-weight: 600;">Budget Summary (Month - Year)</h3>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 0.85rem; color: var(--text-muted);">Month</span>
                            <select id="expenseMonthFilter" onchange="renderExpenseDashboard()" style="padding: 6px 12px; border: 1px solid var(--border-color); border-radius: var(--radius-md); font-size: 0.85rem;">
                                <option value="all">All Months</option>
                            </select>
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                        <!-- Summary Table -->
                        <div>
                            <table class="table" style="width: 100%;">
                                <thead>
                                    <tr>
                                        <th>MONTH - YEAR</th>
                                        <th style="text-align: right;">PAID</th>
                                        <th style="text-align: right;">UNPAID</th>
                                        <th style="text-align: right;">TOTAL</th>
                                    </tr>
                                </thead>
                                <tbody id="expenseSummaryTableBody">
                                    <!-- Populated by JS -->
                                </tbody>
                            </table>
                        </div>
                        
                        <!-- Chart -->
                        <div style="border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 24px; display: flex; flex-direction: column; justify-content: center;" id="expenseChartContainer">
                            <!-- Populated by JS -->
                        </div>
                    </div>
                </div>

                <!-- Manila Procurement Table -->
                <div class="card" style="margin-bottom: 24px;">
                    <h3 style="font-size: 1rem; font-weight: 600; margin-bottom: 16px;">Manila Procurement (Materials)</h3>
                    <div class="table-container">
                        <table class="table" style="width: 100%;">
                            <thead>
                                <tr>
                                    <th>ITEM</th>
                                    <th>SUPPLIER</th>
                                    <th>PAYMENT DATE</th>
                                    <th>MONTH</th>
                                    <th>ACTUAL AMOUNT</th>
                                    <th>PAYMENT TERMS</th>
                                    <th>CHARGING</th>
                                    <th>PAYMENT STATUS</th>
                                    <th>REMARKS</th>
                                </tr>
                            </thead>
                            <tbody id="expenseManilaTableBody">
                                <!-- Populated by JS -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Local Procurement Table -->
                <div class="card">
                    <div style="margin-bottom: 16px;">
                        <h3 style="font-size: 1rem; font-weight: 600; margin-bottom: 4px;">Local Procurement (Replenishment)</h3>
                        <div style="color: var(--text-muted); font-size: 0.85rem;">Grouped by Reple No + Reple Category per Month/Status</div>
                    </div>
                    <div class="table-container">
                        <table class="table" style="width: 100%;">
                            <thead>
                                <tr>
                                    <th>REPLE NO</th>
                                    <th>REPLE CATEGORY</th>
                                    <th>PAYMENT DATE</th>
                                    <th>MONTH</th>
                                    <th>ACTUAL AMOUNT</th>
                                    <th>PAYMENT TERMS</th>
                                    <th>CHARGING</th>
                                    <th>PAYMENT STATUS</th>
                                    <th>REMARKS</th>
                                </tr>
                            </thead>
                            <tbody id="expenseLocalTableBody">
                                <!-- Populated by JS -->
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
            
            populateExpenseMonthFilter();
            renderExpenseDashboard();
        };

        window.populateExpenseMonthFilter = function() {
            const filter = document.getElementById('expenseMonthFilter');
            if (!filter) return;
            
            const months = new Set();
            
            const processRecords = (records) => {
                records.forEach(r => {
                    if (r.projectId === currentProjectId && r.paymentMonth) {
                        months.add(r.paymentMonth);
                    }
                });
            };
            
            processRecords(manilaRecords);
            processRecords(localRecords);
            
            const sortedMonths = Array.from(months).sort((a, b) => {
                // Format is "Month - Year" e.g. "March - 2026"
                const getSortable = (str) => {
                    const parts = str.split(' - ');
                    if (parts.length !== 2) return str;
                    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                    const monthIdx = monthNames.indexOf(parts[0]);
                    return `${parts[1]}-${monthIdx.toString().padStart(2, '0')}`;
                };
                return getSortable(b).localeCompare(getSortable(a));
            });
            
            let options = '<option value="all">All Months</option>';
            sortedMonths.forEach(m => {
                options += `<option value="${m}">${m}</option>`;
            });
            
            filter.innerHTML = options;
        };

        window.renderExpenseDashboard = function() {
            const filterMonth = document.getElementById('expenseMonthFilter')?.value || 'all';
            
            const formatDate = (dateStr) => {
                if (!dateStr) return '-';
                try {
                    const date = new Date(dateStr);
                    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                    return `${days[date.getDay()]}, ${String(date.getDate()).padStart(2, '0')} - ${months[date.getMonth()]} - ${date.getFullYear()}`;
                } catch(e) {
                    return dateStr;
                }
            };
            
            let mnlRecords = manilaRecords.filter(r => r.projectId === currentProjectId);
            let lclRecords = localRecords.filter(r => r.projectId === currentProjectId);
            
            if (filterMonth !== 'all') {
                mnlRecords = mnlRecords.filter(r => r.paymentMonth === filterMonth);
                lclRecords = lclRecords.filter(r => r.paymentMonth === filterMonth);
            }
            
            let totalPaid = 0;
            let totalUnpaid = 0;
            
            const processTotals = (records) => {
                records.forEach(r => {
                    const amount = parseFloat(r.actualAmount) || 0;
                    if (r.paymentStatus === 'Paid') {
                        totalPaid += amount;
                    } else {
                        totalUnpaid += amount;
                    }
                });
            };
            
            processTotals(mnlRecords);
            processTotals(lclRecords);
            
            const grandTotal = totalPaid + totalUnpaid;
            
            // Format currency
            const formatCurrency = (val) => '₱' + val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            
            // Render KPIs
            const kpisHtml = `
                <div class="card" style="background: #eafff5; border: 1px solid #a7f3d0; display: flex; align-items: center; padding: 20px;">
                    <div style="width: 48px; height: 48px; border-radius: 12px; background: #00c48c; display: flex; align-items: center; justify-content: center; margin-right: 16px; color: white; flex-shrink: 0;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
                    </div>
                    <div>
                        <div style="color: #008a63; font-size: 0.9rem; font-weight: 500; margin-bottom: 4px;">Total Paid</div>
                        <div style="font-size: 1.75rem; font-weight: 700; color: #004d37;">${formatCurrency(totalPaid)}</div>
                    </div>
                </div>
                <div class="card" style="background: #fff0f0; border: 1px solid #fecaca; display: flex; align-items: center; padding: 20px;">
                    <div style="width: 48px; height: 48px; border-radius: 12px; background: #ff4d4f; display: flex; align-items: center; justify-content: center; margin-right: 16px; color: white; flex-shrink: 0;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline><polyline points="16 17 22 17 22 11"></polyline></svg>
                    </div>
                    <div>
                        <div style="color: #cf1322; font-size: 0.9rem; font-weight: 500; margin-bottom: 4px;">Total Unpaid</div>
                        <div style="font-size: 1.75rem; font-weight: 700; color: #820014;">${formatCurrency(totalUnpaid)}</div>
                    </div>
                </div>
                <div class="card" style="background: #f8fafc; border: 1px solid #e2e8f0; display: flex; align-items: center; padding: 20px;">
                    <div style="width: 48px; height: 48px; border-radius: 12px; background: #64748b; display: flex; align-items: center; justify-content: center; margin-right: 16px; color: white; flex-shrink: 0;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    </div>
                    <div>
                        <div style="color: #475569; font-size: 0.9rem; font-weight: 500; margin-bottom: 4px;">Grand Total</div>
                        <div style="font-size: 1.75rem; font-weight: 700; color: #0f172a;">${formatCurrency(grandTotal)}</div>
                    </div>
                </div>
            `;
            
            const kpisContainer = document.getElementById('expenseKpis');
            if (kpisContainer) kpisContainer.innerHTML = kpisHtml;
            
            // Summary Table
            const summaryTableBody = document.getElementById('expenseSummaryTableBody');
            if (summaryTableBody) {
                let summaryHtml = '';
                
                // Group by month
                const monthTotals = {};
                const processMonthTotals = (records) => {
                    records.forEach(r => {
                        const month = r.paymentMonth || 'Unspecified';
                        if (!monthTotals[month]) monthTotals[month] = { paid: 0, unpaid: 0 };
                        const amount = parseFloat(r.actualAmount) || 0;
                        if (r.paymentStatus === 'Paid') {
                            monthTotals[month].paid += amount;
                        } else {
                            monthTotals[month].unpaid += amount;
                        }
                    });
                };
                
                processMonthTotals(mnlRecords);
                processMonthTotals(lclRecords);
                
                Object.keys(monthTotals).forEach(month => {
                    const data = monthTotals[month];
                    const total = data.paid + data.unpaid;
                    summaryHtml += `
                        <tr>
                            <td>${month}</td>
                            <td style="text-align: right;">${formatCurrency(data.paid)}</td>
                            <td style="text-align: right;">${formatCurrency(data.unpaid)}</td>
                            <td style="text-align: right; font-weight: 600;">${formatCurrency(total)}</td>
                        </tr>
                    `;
                });
                
                // Add Total row
                summaryHtml += `
                    <tr style="background: var(--bg-surface); font-weight: 700;">
                        <td>TOTAL</td>
                        <td style="text-align: right;">${formatCurrency(totalPaid)}</td>
                        <td style="text-align: right;">${formatCurrency(totalUnpaid)}</td>
                        <td style="text-align: right;">${formatCurrency(grandTotal)}</td>
                    </tr>
                `;
                
                summaryTableBody.innerHTML = summaryHtml;
            }
            
            // Chart
            const chartContainer = document.getElementById('expenseChartContainer');
            if (chartContainer) {
                const maxVal = Math.max(totalPaid, totalUnpaid, 1); // Avoid division by zero
                // Round up to nearest nice number for axis
                const axisMax = Math.ceil(maxVal / 2500) * 2500;
                const paidPct = (totalPaid / axisMax) * 100;
                const unpaidPct = (totalUnpaid / axisMax) * 100;
                
                chartContainer.innerHTML = `
                    <div style="position: relative; padding-bottom: 30px; padding-left: 60px; min-height: 200px; display: flex; flex-direction: column; justify-content: center;">
                        <!-- Grid lines -->
                        <div style="position: absolute; top: 0; bottom: 30px; left: 60px; right: 0; display: flex; justify-content: space-between;">
                            <div style="border-left: 1px solid var(--border-color); height: 100%;"></div>
                            <div style="border-left: 1px solid var(--border-color); height: 100%;"></div>
                            <div style="border-left: 1px solid var(--border-color); height: 100%;"></div>
                            <div style="border-left: 1px solid var(--border-color); height: 100%;"></div>
                            <div style="border-left: 1px solid var(--border-color); height: 100%;"></div>
                            <div style="border-left: 1px solid var(--border-color); height: 100%;"></div>
                            <div style="border-left: 1px solid var(--border-color); height: 100%;"></div>
                        </div>
                        
                        <!-- Bars -->
                        <div style="position: relative; z-index: 1;">
                            <div style="display: flex; align-items: center; margin-bottom: 40px;">
                                <div style="width: 60px; position: absolute; left: -60px; font-size: 0.85rem; color: var(--text-main); text-align: right; padding-right: 12px;">Paid</div>
                                <div style="flex: 1; height: 40px; position: relative;">
                                    <div style="position: absolute; top: 0; left: 0; height: 100%; width: ${paidPct}%; background: #3b82f6; transition: width 0.5s ease;"></div>
                                </div>
                            </div>
                            <div style="display: flex; align-items: center;">
                                <div style="width: 60px; position: absolute; left: -60px; font-size: 0.85rem; color: var(--text-main); text-align: right; padding-right: 12px;">Unpaid</div>
                                <div style="flex: 1; height: 40px; position: relative;">
                                    <div style="position: absolute; top: 0; left: 0; height: 100%; width: ${unpaidPct}%; background: #3b82f6; transition: width 0.5s ease;"></div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- X Axis Labels -->
                        <div style="position: absolute; bottom: 0; left: 60px; right: 0; display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted);">
                            <span style="transform: translateX(-50%);">0</span>
                            <span style="transform: translateX(-50%);">${(axisMax / 6).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                            <span style="transform: translateX(-50%);">${(axisMax * 2 / 6).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                            <span style="transform: translateX(-50%);">${(axisMax * 3 / 6).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                            <span style="transform: translateX(-50%);">${(axisMax * 4 / 6).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                            <span style="transform: translateX(-50%);">${(axisMax * 5 / 6).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                            <span style="transform: translateX(-50%);">${axisMax.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                        </div>
                    </div>
                `;
            }
            
            // Manila Table
            const manilaTableBody = document.getElementById('expenseManilaTableBody');
            if (manilaTableBody) {
                let mnlHtml = '';
                if (mnlRecords.length === 0) {
                    mnlHtml = '<tr><td colspan="9" style="text-align: center; color: var(--text-muted);">No records found.</td></tr>';
                } else {
                    mnlRecords.forEach(r => {
                        const prs = prsRecords.find(p => p.id === r.prsId);
                        const itemDesc = prs ? prs.description : 'Unknown Item';
                        
                        mnlHtml += `
                            <tr>
                                <td>${itemDesc}</td>
                                <td>${r.supplier || '-'}</td>
                                <td>${formatDate(r.paymentReleased || r.paymentNeededDate)}</td>
                                <td>${r.paymentMonth || '-'}</td>
                                <td>${formatCurrency(r.actualAmount)}</td>
                                <td>${r.paymentTerms || '-'}</td>
                                <td>${r.subtaskCharging || '-'}</td>
                                <td><span class="badge ${r.paymentStatus === 'Paid' ? 'badge-success' : 'badge-warning'}">${r.paymentStatus}</span></td>
                                <td>${r.remarks || '-'}</td>
                            </tr>
                        `;
                    });
                }
                manilaTableBody.innerHTML = mnlHtml;
            }
            
            // Local Table
            const localTableBody = document.getElementById('expenseLocalTableBody');
            if (localTableBody) {
                let lclHtml = '';
                if (lclRecords.length === 0) {
                    lclHtml = '<tr><td colspan="9" style="text-align: center; color: var(--text-muted);">No records found.</td></tr>';
                } else {
                    lclRecords.forEach(r => {
                        lclHtml += `
                            <tr>
                                <td>${r.repleNo || '-'}</td>
                                <td>${r.repleCategory || '-'}</td>
                                <td>${formatDate(r.paymentReleased || r.paymentNeededDate)}</td>
                                <td>${r.paymentMonth || '-'}</td>
                                <td>${formatCurrency(r.actualAmount)}</td>
                                <td>${r.paymentTerms || '-'}</td>
                                <td>${r.subtaskCharging || r.boqCharging || '-'}</td>
                                <td><span class="badge ${r.paymentStatus === 'Paid' ? 'badge-success' : 'badge-warning'}">${r.paymentStatus}</span></td>
                                <td>${r.concerns || '-'}</td>
                            </tr>
                        `;
                    });
                }
                localTableBody.innerHTML = lclHtml;
            }
        };

        window.renderFuelView = function() {
            currentView = 'fuel';
            updateSubNavVisibility();
            
            contentArea.innerHTML = `
                <div class="view-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
                    <div>
                        <h1 style="font-size: 1.5rem; font-weight: 700; color: var(--text-main); margin-bottom: 4px;">Fuel Inventory</h1>
                        <div style="color: var(--text-muted); font-size: 0.9rem;">Track fuel consumption and distribution by equipment</div>
                    </div>
                    <button class="btn btn-primary" onclick="openFuelModal()" style="background: #3b82f6; border-color: #3b82f6;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Fuel Record
                    </button>
                </div>

                <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 20px; margin-bottom: 24px;">
                    <div style="display: flex; gap: 20px; align-items: flex-end;">
                        <div class="form-group" style="margin-bottom: 0;">
                            <label style="font-weight: 600; font-size: 0.85rem; margin-bottom: 8px; display: block;">Start Date</label>
                            <input type="date" id="fuelStartDate" onchange="renderFuelDashboard()" style="padding: 8px 12px; border: 1px solid var(--border-color); border-radius: var(--radius-md); font-size: 0.9rem; background: var(--bg-body); color: var(--text-main);">
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <label style="font-weight: 600; font-size: 0.85rem; margin-bottom: 8px; display: block;">End Date</label>
                            <input type="date" id="fuelEndDate" onchange="renderFuelDashboard()" style="padding: 8px 12px; border: 1px solid var(--border-color); border-radius: var(--radius-md); font-size: 0.9rem; background: var(--bg-body); color: var(--text-main);">
                        </div>
                        <button class="btn btn-secondary" onclick="document.getElementById('fuelStartDate').value=''; document.getElementById('fuelEndDate').value=''; renderFuelDashboard();" style="height: 38px;">Clear Filter</button>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
                    <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 20px;">
                        <h3 style="font-size: 1rem; font-weight: 600; margin-bottom: 20px; color: var(--text-main);">Fuel Distribution by Equipment</h3>
                        <div id="fuelChartContainer" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 250px;">
                            <!-- Chart will be rendered here -->
                        </div>
                    </div>
                    <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 20px;">
                        <h3 style="font-size: 1rem; font-weight: 600; margin-bottom: 20px; color: var(--text-main);">Summary</h3>
                        <div id="fuelSummaryContainer" style="display: flex; flex-direction: column; gap: 16px;">
                            <!-- Summary will be rendered here -->
                        </div>
                    </div>
                </div>

                <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); overflow: hidden;">
                    <div style="padding: 20px; border-bottom: 1px solid var(--border-color);">
                        <h3 style="font-size: 1rem; font-weight: 600; color: var(--text-main);">Fuel Inventory Records</h3>
                    </div>
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse; text-align: left;">
                            <thead>
                                <tr style="background: var(--bg-body); border-bottom: 1px solid var(--border-color);">
                                    <th style="padding: 12px 20px; font-weight: 600; font-size: 0.85rem; color: var(--text-muted);">NO.</th>
                                    <th style="padding: 12px 20px; font-weight: 600; font-size: 0.85rem; color: var(--text-muted);">DATE</th>
                                    <th style="padding: 12px 20px; font-weight: 600; font-size: 0.85rem; color: var(--text-muted);">QTY. IN</th>
                                    <th style="padding: 12px 20px; font-weight: 600; font-size: 0.85rem; color: var(--text-muted);">QTY. OUT</th>
                                    <th style="padding: 12px 20px; font-weight: 600; font-size: 0.85rem; color: var(--text-muted);">REMAINING</th>
                                    <th style="padding: 12px 20px; font-weight: 600; font-size: 0.85rem; color: var(--text-muted);">TIME</th>
                                    <th style="padding: 12px 20px; font-weight: 600; font-size: 0.85rem; color: var(--text-muted);">REMARKS</th>
                                    <th style="padding: 12px 20px; width: 50px;"></th>
                                </tr>
                            </thead>
                            <tbody id="fuelTableBody">
                                <!-- Records will go here -->
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
            
            renderFuelDashboard();
        }

        window.renderFuelDashboard = function() {
            const startDate = document.getElementById('fuelStartDate')?.value;
            const endDate = document.getElementById('fuelEndDate')?.value;
            
            let sortedRecords = [...fuelRecords].sort((a, b) => {
                const dateA = new Date(a.date + 'T' + (a.time || '00:00'));
                const dateB = new Date(b.date + 'T' + (b.time || '00:00'));
                return dateA - dateB;
            });
            
            let currentRemaining = 0;
            sortedRecords.forEach(record => {
                currentRemaining += (Number(record.qtyIn) || 0) - (Number(record.qtyOut) || 0);
                record.calculatedRemaining = currentRemaining;
            });
            
            let filteredRecords = sortedRecords;
            if (startDate) {
                filteredRecords = filteredRecords.filter(r => r.date >= startDate);
            }
            if (endDate) {
                filteredRecords = filteredRecords.filter(r => r.date <= endDate);
            }
            
            let totalIn = 0;
            let totalOut = 0;
            let equipmentUsage = {};
            
            filteredRecords.forEach(record => {
                totalIn += Number(record.qtyIn) || 0;
                totalOut += Number(record.qtyOut) || 0;
                
                if (record.equipment && record.qtyOut > 0) {
                    equipmentUsage[record.equipment] = (equipmentUsage[record.equipment] || 0) + Number(record.qtyOut);
                }
            });
            
            const finalRemaining = sortedRecords.length > 0 ? sortedRecords[sortedRecords.length - 1].calculatedRemaining : 0;
            
            const summaryContainer = document.getElementById('fuelSummaryContainer');
            if (summaryContainer) {
                summaryContainer.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: rgba(16, 185, 129, 0.1); border-radius: var(--radius-md);">
                        <span style="font-weight: 500; color: var(--text-main);">Total Qty. IN</span>
                        <span style="font-weight: 700; font-size: 1.1rem; color: #10b981;">${totalIn.toFixed(1)} L</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: rgba(239, 68, 68, 0.1); border-radius: var(--radius-md);">
                        <span style="font-weight: 500; color: var(--text-main);">Total Qty. OUT</span>
                        <span style="font-weight: 700; font-size: 1.1rem; color: #ef4444;">${totalOut.toFixed(1)} L</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: rgba(16, 185, 129, 0.1); border-radius: var(--radius-md);">
                        <span style="font-weight: 500; color: var(--text-main);">Total Remaining Fuel</span>
                        <span style="font-weight: 700; font-size: 1.1rem; color: #10b981;">${finalRemaining.toFixed(1)} L</span>
                    </div>
                `;
            }
            
            const chartContainer = document.getElementById('fuelChartContainer');
            if (chartContainer) {
                if (Object.keys(equipmentUsage).length === 0) {
                    chartContainer.innerHTML = `<div style="color: var(--text-muted);">No equipment usage data available for selected period.</div>`;
                } else {
                    const colors = ['#2dd4bf', '#fbbf24', '#f43f5e', '#3b82f6', '#a855f7', '#ec4899', '#14b8a6', '#f59e0b', '#ef4444', '#6366f1'];
                    let totalUsage = Object.values(equipmentUsage).reduce((a, b) => a + b, 0);
                    
                    let conicGradientParts = [];
                    let currentAngle = 0;
                    let legendHtml = '';
                    
                    Object.entries(equipmentUsage).forEach(([eq, qty], index) => {
                        const color = colors[index % colors.length];
                        const percentage = (qty / totalUsage) * 100;
                        const angle = (percentage / 100) * 360;
                        
                        if (index > 0) {
                            conicGradientParts.push(`var(--bg-surface) ${currentAngle}deg ${currentAngle + 2}deg`);
                            currentAngle += 2;
                        }
                        
                        conicGradientParts.push(`${color} ${currentAngle}deg ${currentAngle + angle - (index === 0 ? 2 : 0)}deg`);
                        currentAngle += angle - (index === 0 ? 2 : 0);
                        
                        legendHtml += `
                            <div style="display: flex; align-items: center; gap: 6px; font-size: 0.8rem; color: ${color}; font-weight: 600; text-transform: uppercase;">
                                <div style="width: 12px; height: 12px; background: ${color};"></div>
                                ${eq}
                            </div>
                        `;
                    });
                    
                    chartContainer.innerHTML = `
                        <div style="position: relative; width: 180px; height: 180px; border-radius: 50%; background: conic-gradient(${conicGradientParts.join(', ')}); margin-bottom: 24px;">
                            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 130px; height: 130px; background: var(--bg-surface); border-radius: 50%;"></div>
                        </div>
                        <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 12px 20px;">
                            ${legendHtml}
                        </div>
                    `;
                }
            }
            
            const tableBody = document.getElementById('fuelTableBody');
            if (tableBody) {
                if (filteredRecords.length === 0) {
                    tableBody.innerHTML = `<tr><td colspan="8" style="padding: 20px; text-align: center; color: var(--text-muted);">No records found.</td></tr>`;
                } else {
                    tableBody.innerHTML = filteredRecords.map((record, index) => {
                        const dateObj = new Date(record.date);
                        const formattedDate = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');
                        
                        const qtyInDisplay = record.qtyIn > 0 ? `<span style="color: #10b981; font-weight: 500;">${record.qtyIn}</span>` : '<span style="color: #10b981;">-</span>';
                        const qtyOutDisplay = record.qtyOut > 0 ? `<span style="color: #ef4444; font-weight: 500;">${record.qtyOut}</span>` : '<span style="color: #ef4444;">-</span>';
                        
                        return `
                            <tr style="border-bottom: 1px solid var(--border-color); transition: background 0.2s;">
                                <td style="padding: 12px 20px; font-size: 0.9rem; color: var(--text-main);">${index + 1}</td>
                                <td style="padding: 12px 20px; font-size: 0.9rem; color: var(--text-main);">${formattedDate}</td>
                                <td style="padding: 12px 20px; font-size: 0.9rem;">${qtyInDisplay}</td>
                                <td style="padding: 12px 20px; font-size: 0.9rem;">${qtyOutDisplay}</td>
                                <td style="padding: 12px 20px; font-size: 0.9rem; color: var(--text-main);">${record.calculatedRemaining.toFixed(1)}</td>
                                <td style="padding: 12px 20px; font-size: 0.9rem; color: var(--text-main);">${record.time || '-'}</td>
                                <td style="padding: 12px 20px; font-size: 0.9rem; color: var(--text-main);">${record.remarks || '-'}</td>
                                <td style="padding: 12px 20px; text-align: right;">
                                    <div class="dropdown" style="display: inline-block;">
                                        <button class="icon-btn" style="width: 28px; height: 28px;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg></button>
                                        <div class="dropdown-content" style="right: 0; left: auto; min-width: 120px;">
                                            <a href="#" onclick="editFuelRecord(${record.id}); return false;">Edit</a>
                                            <a href="#" onclick="deleteFuelRecord(${record.id}); return false;" style="color: var(--danger-color);">Delete</a>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        `;
                    }).join('');
                }
            }
        }

        window.openFuelModal = function() {
            document.getElementById('fuelRecordId').value = '';
            document.getElementById('fuelForm').reset();
            populateEquipmentDropdown();
            
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('fuelDate').value = today;
            
            document.querySelector('#fuelModal .modal-header h2').textContent = 'Add Fuel Record';
            document.querySelector('#fuelModal button[type="submit"]').textContent = 'Add Record';
            
            document.getElementById('fuelModal').classList.add('active');
        }

        window.closeFuelModal = function() {
            document.getElementById('fuelModal').classList.remove('active');
        }

        window.populateEquipmentDropdown = function() {
            const select = document.getElementById('fuelEquipment');
            if (!select) return;
            const currentValue = select.value;
            
            select.innerHTML = '<option value="">Select equipment</option>' + 
                equipmentList.sort().map(eq => `<option value="${eq}">${eq}</option>`).join('');
                
            if (currentValue && equipmentList.includes(currentValue)) {
                select.value = currentValue;
            }
        }

        window.addEquipment = function() {
            const newEq = prompt('Enter new equipment name:');
            if (newEq && newEq.trim() !== '') {
                const upperEq = newEq.trim().toUpperCase();
                if (!equipmentList.includes(upperEq)) {
                    equipmentList.push(upperEq);
                    populateEquipmentDropdown();
                }
                document.getElementById('fuelEquipment').value = upperEq;
                document.getElementById('fuelRemarks').value = upperEq;
            }
        }

        window.editFuelRecord = function(id) {
            const record = fuelRecords.find(r => r.id == id);
            if (record) {
                document.getElementById('fuelRecordId').value = record.id;
                document.getElementById('fuelDate').value = record.date;
                document.getElementById('fuelQtyIn').value = record.qtyIn;
                document.getElementById('fuelQtyOut').value = record.qtyOut;
                document.getElementById('fuelTime').value = record.time;
                
                populateEquipmentDropdown();
                document.getElementById('fuelEquipment').value = record.equipment || '';
                document.getElementById('fuelRemarks').value = record.remarks || '';
                
                document.querySelector('#fuelModal .modal-header h2').textContent = 'Edit Fuel Record';
                document.querySelector('#fuelModal button[type="submit"]').textContent = 'Update Record';
                
                document.getElementById('fuelModal').classList.add('active');
            }
        }

        window.deleteFuelRecord = function(id) {
            if (confirm('Are you sure you want to delete this fuel record?')) {
                fuelRecords = fuelRecords.filter(r => r.id != id);
                renderFuelDashboard();
            }
        }

        document.addEventListener('DOMContentLoaded', () => {
            document.body.addEventListener('change', function(e) {
                if (e.target && e.target.id === 'fuelEquipment') {
                    if (e.target.value) {
                        document.getElementById('fuelRemarks').value = e.target.value;
                    }
                }
            });

            document.body.addEventListener('submit', function(e) {
                if (e.target && e.target.id === 'fuelForm') {
                    e.preventDefault();
                    
                    const id = document.getElementById('fuelRecordId').value;
                    const date = document.getElementById('fuelDate').value;
                    const qtyIn = parseFloat(document.getElementById('fuelQtyIn').value) || 0;
                    const qtyOut = parseFloat(document.getElementById('fuelQtyOut').value) || 0;
                    const time = document.getElementById('fuelTime').value;
                    const equipment = document.getElementById('fuelEquipment').value;
                    const remarks = document.getElementById('fuelRemarks').value;
                    
                    if (id) {
                        const recordIndex = fuelRecords.findIndex(r => r.id == id);
                        if (recordIndex !== -1) {
                            fuelRecords[recordIndex] = {
                                ...fuelRecords[recordIndex],
                                date, qtyIn, qtyOut, time, equipment, remarks
                            };
                        }
                    } else {
                        fuelRecords.push({
                            id: Date.now(),
                            date, qtyIn, qtyOut, time, equipment, remarks
                        });
                    }
                    
                    closeFuelModal();
                    renderFuelDashboard();
                }
            });
        });

        window.dragTask = function(ev, taskId) {
            ev.dataTransfer.setData("taskId", taskId);
        }

        window.allowDrop = function(ev) {
            ev.preventDefault();
        }

        window.dropTask = function(ev, newStatus) {
            ev.preventDefault();
            const taskId = ev.dataTransfer.getData("taskId");
            
            // Find task and update status
            projects.forEach(p => {
                const task = p.tasks.find(t => t.id == taskId);
                if (task) {
                    if (newStatus === 'Completed') {
                        task.completed = true;
                    } else {
                        task.completed = false;
                        if (newStatus === 'Active') task.priority = 'High';
                        else if (newStatus === 'Planning') task.priority = 'Medium';
                        else if (newStatus === 'Review') task.priority = 'Low';
                    }
                    
                    // Update project progress
                    const completedTasks = p.tasks.filter(t => t.completed).length;
                    p.progress = Math.round((completedTasks / p.tasks.length) * 100);
                    if (p.progress === 100) p.status = 'Completed';
                    else if (p.progress > 0) p.status = 'Active';
                    else p.status = 'Planning';
                }
            });
            
            renderTasksView('kanban');
        }

        // Navigation Highlight
        const navItems = document.querySelectorAll('.nav-item, .mobile-nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                navItems.forEach(nav => nav.classList.remove('active'));
                
                const view = item.getAttribute('data-view');
                
                // Highlight matching items in both desktop and mobile nav
                document.querySelectorAll(`[data-view="${view}"]`).forEach(el => el.classList.add('active'));
                
                if (view === 'dashboard') {
                    renderDashboard();
                } else if (view === 'projects') {
                    renderProjectsView();
                } else if (view === 'tasks') {
                    renderTasksView();
                } else if (view === 'calendar') {
                    renderCalendarView();
                } else if (view === 'request') {
                    renderRequestView();
                } else if (view === 'manila') {
                    renderManilaView();
                } else if (view === 'local') {
                    renderLocalView();
                } else if (view === 'fuel') {
                    renderFuelView();
                } else if (view === 'expense-overview') {
                    renderExpenseOverview();
                } else {
                    currentView = view;
                    currentProjectId = null;
                    updateSubNavVisibility();
                    contentArea.innerHTML = `<div class="view-header"><h1>${view.charAt(0).toUpperCase() + view.slice(1)}</h1></div><div style="color: var(--text-muted)">This section is under construction.</div>`;
                }
                
                mobileDrawer.classList.remove('open');
            });
        });

        function updateSubNavVisibility() {
            if (currentProjectId) {
                const project = projects.find(p => p.id === currentProjectId);
                if (project) {
                    selectedProjectName.textContent = project.title;
                    breadcrumbProjectName.textContent = project.title;
                    subNavBar.style.display = 'flex';
                    mobileSubNav.style.display = 'block';
                }
            } else {
                selectedProjectName.textContent = 'Select Project';
                subNavBar.style.display = 'none';
                mobileSubNav.style.display = 'none';
            }
        }

        // Initial Render
        renderDashboard();
    