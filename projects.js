/**
 * projects.js
 * Centralized data store and management for Portfolio Projects.
 * Synchronizes with localStorage and provides exportable data for static deployment.
 */

const DEFAULT_PROJECTS = [
    {
        id: "proj-mern-shoe",
        title: "Online Shoe Market - MERN Stack E-Commerce Platform",
        category: "Full Stack / Web Dev",
        image: "images/mern.png",
        description: "Developed a full-stack MERN e-commerce web app with authentication, product management, search, cart, and OTP-based password reset. Designed responsive UI using Tailwind CSS and integrated REST APIs.",
        links: [
            { label: "GitHub-Frontend", url: "https://github.com/Ehashan/online-shoe-market-frontend", icon: "bx bxl-github" },
            { label: "GitHub-Backend", url: "https://github.com/Ehashan/online-shoe-market-backend", icon: "bx bxl-github" },
            { label: "Live Demo", url: "https://shoe-market-sandy.vercel.app/", icon: "bx bx-globe" }
        ]
    },
    {
        id: "proj-aws-cloud",
        title: "Cloud Migration Project (AWS)",
        category: "Cloud & DevOps",
        image: "images/cloud.png",
        description: "Designed and deployed a SmartInventory web application on AWS using a secure three-tier architecture with VPC, EC2, RDS, and Application Load Balancer. Implemented monitoring, storage, and cost optimization using CloudWatch and S3.",
        links: [
            { label: "GitHub", url: "https://github.com/Ehashan", icon: "bx bxl-github" },
            { label: "Live Demo", url: "http://smartinventory-alb-103687916.us-east-1.elb.amazonaws.com/", icon: "bx bx-globe" }
        ]
    },
    {
        id: "proj-my-portfolio",
        title: "My Portfolio",
        category: "Web Dev",
        image: "images/portfolio.png",
        description: "A responsive personal portfolio website built using HTML, CSS, and JavaScript, showcasing my skills, projects, and contact information with smooth animations and an interactive user interface.",
        links: [
            { label: "GitHub", url: "https://github.com/Ehashan/My-Portfolio", icon: "bx bxl-github" },
            { label: "Live Demo", url: "https://ehashan.github.io/My-Portfolio-/", icon: "bx bx-globe" }
        ]
    },
    {
        id: "proj-android-elawalu",
        title: "Mobile-App-Development-Elawalu.lk",
        category: "Mobile App",
        image: "images/elawalu.png",
        description: "A full-featured Android marketplace application built with Java and Firebase that connects vegetable sellers directly with buyers, offering product management, shopping cart functionality, and secure online payments through PayHere.",
        links: [
            { label: "GitHub", url: "https://github.com/Ehashan/Mobile-App-Development-Elawalu.lk/tree/main", icon: "bx bxl-github" },
            { label: "Live Demo", url: "#", icon: "bx bx-globe", disabled: true }
        ]
    },
    {
        id: "proj-diabetes-ml",
        title: "Diabetes Prediction ML Web Application",
        category: "AI & Machine Learning",
        image: "images/diabetes.png",
        description: "A machine learning web application developed using Python and Streamlit that predicts diabetes risk using Logistic Regression and Random Forest models trained on the Pima Indians Diabetes dataset.",
        links: [
            { label: "GitHub", url: "https://github.com/Ehashan/Diabetes-Prediction.git", icon: "bx bxl-github" },
            { label: "Live Demo", url: "https://diabetes-prediction-o5vfijkszyomgf6bp37lgq.streamlit.app/", icon: "bx bx-globe" }
        ]
    },
    {
        id: "proj-rest-ms",
        title: "Restaurant Management System",
        category: "Web Dev & Database",
        image: "images/rest.png",
        description: "A web-based restaurant management system developed usingJavaScript, CSS, and MySQL to manage menu items, customer orders, and basic restaurant operations through a user-friendly interface.",
        links: [
            { label: "GitHub", url: "https://github.com/Ehashan/Restaurant", icon: "bx bxl-github" },
            { label: "Live Demo", url: "#", icon: "bx bx-globe", disabled: true }
        ]
    },
    {
        id: "proj-library-ms",
        title: "Library Management System",
        category: "Desktop Application",
        image: "images/library_ms.png",
        description: "A desktop-based library management system developed using Java (NetBeans) and MySQL, implementing CRUD operations to manage books, members, and borrowing records efficiently.",
        links: [
            { label: "GitHub", url: "https://github.com/Ehashan/ITBIIN_2211_0192", icon: "bx bxl-github" },
            { label: "Live Demo", url: "https://www.youtube.com/watch?v=hPyvjUK1dis", icon: "bx bx-globe" }
        ]
    }
];

const STORAGE_KEY = "my_portfolio_projects_data";

/**
 * Project Storage Management
 */
const PortfolioManager = {
    // Get all projects (LocalStorage takes precedence over default)
    getProjects() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                }
            }
        } catch (e) {
            console.error("Error reading projects from localStorage:", e);
        }
        return [...DEFAULT_PROJECTS];
    },

    // Save projects array
    saveProjects(projects) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
            return true;
        } catch (e) {
            console.error("Error saving projects to localStorage:", e);
            return false;
        }
    },

    // Reset to default original projects
    resetToDefaults() {
        localStorage.removeItem(STORAGE_KEY);
        return [...DEFAULT_PROJECTS];
    },

    // Sanitize URLs and encode them to satisfy CodeQL static analysis
    sanitizeUrl(url) {
        if (!url) return '#';
        const trimmed = String(url).trim();
        if (trimmed === '#' || trimmed === '') return '#';

        // Safe data:image base64
        if (/^data:image\/(png|jpeg|jpg|webp);base64,[A-Za-z0-9+/=]+$/i.test(trimmed)) {
            return trimmed;
        }

        // Only allow safe protocols and relative paths
        if (/^(https?:\/\/|\/|\.\/|images\/|mailto:)/i.test(trimmed)) {
            try {
                return encodeURI(decodeURI(trimmed));
            } catch {
                return encodeURI(trimmed);
            }
        }
        return '#';
    },

    // Create safe DOM element (avoids innerHTML / XSS / CodeQL warnings)
    createProjectCardElement(project) {
        const box = document.createElement('div');
        box.className = 'portfolio-box';
        if (project.id) box.dataset.id = project.id;

        // Project Title
        const title = document.createElement('h4');
        title.className = 'project-name';
        title.textContent = project.title || 'Portfolio Project';
        box.appendChild(title);

        // Image Wrapper
        const imgWrapper = document.createElement('div');
        imgWrapper.className = 'project-image-wrapper';

        const img = document.createElement('img');
        const safeImg = this.sanitizeUrl(project.image || 'images/portfolio.png');
        img.src = encodeURI(safeImg);
        img.alt = project.title || 'Project Preview';
        img.onerror = () => { img.src = 'images/portfolio.png'; };
        imgWrapper.appendChild(img);

        // Hover Overlay
        const layer = document.createElement('div');
        layer.className = 'portfolio-layer';
        const desc = document.createElement('p');
        desc.textContent = project.description || '';
        layer.appendChild(desc);
        imgWrapper.appendChild(layer);
        box.appendChild(imgWrapper);

        // Buttons
        const btnContainer = document.createElement('div');
        btnContainer.className = 'project-buttons';

        (project.links || []).forEach(link => {
            const a = document.createElement('a');
            const safeUrl = this.sanitizeUrl(link.url);
            const isDisabled = link.disabled || safeUrl === '#';

            a.href = encodeURI(safeUrl);
            a.className = 'project-btn' + (isDisabled ? ' disabled' : '');
            if (!isDisabled) {
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
            }
            a.setAttribute('aria-label', link.label || 'Project Link');

            const icon = document.createElement('i');
            icon.className = link.icon || 'bx bx-link';
            a.appendChild(icon);
            a.appendChild(document.createTextNode(' ' + (link.label || 'Link')));
            btnContainer.appendChild(a);
        });

        box.appendChild(btnContainer);
        return box;
    },

    // Generate single portfolio-box HTML (for static export code)
    renderProjectCardHTML(project) {
        const safeImage = this.sanitizeUrl(project.image || 'images/portfolio.png');
        const linksHTML = (project.links || []).map(link => {
            const safeUrl = this.sanitizeUrl(link.url);
            const isDisabled = link.disabled || safeUrl === '#';
            const disabledClass = isDisabled ? ' disabled' : '';
            const targetAttr = isDisabled ? '' : ' target="_blank" rel="noopener noreferrer"';
            const iconClass = this.escapeHTML(link.icon || 'bx bx-link');
            const labelText = this.escapeHTML(link.label || 'Link');
            return `
                <a href="${safeUrl}"${targetAttr} class="project-btn${disabledClass}" aria-label="${labelText}">
                    <i class='${iconClass}'></i> ${labelText}
                </a>
            `;
        }).join('');

        return `
            <div class="portfolio-box" data-id="${this.escapeHTML(project.id || '')}">
                <h4 class="project-name">${this.escapeHTML(project.title || '')}</h4>
                <div class="project-image-wrapper">
                    <img src="${safeImage}" alt="${this.escapeHTML(project.title || '')}" onerror="this.src='images/portfolio.png'">
                    <div class="portfolio-layer">
                        <p>${this.escapeHTML(project.description || '')}</p>
                    </div>
                </div>
                <div class="project-buttons">
                    ${linksHTML}
                </div>
            </div>
        `.trim();
    },

    // Helper to safely escape HTML
    escapeHTML(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    },

    // Render all projects into container safely using DOM nodes
    renderToContainer(containerElement) {
        if (!containerElement) return;
        const projects = this.getProjects();
        containerElement.replaceChildren(...projects.map(p => this.createProjectCardElement(p)));
    }
};

// Expose globally
if (typeof window !== 'undefined') {
    window.DEFAULT_PROJECTS = DEFAULT_PROJECTS;
    window.PortfolioManager = PortfolioManager;
}
