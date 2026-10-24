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

    // Generate single portfolio-box HTML
    renderProjectCardHTML(project) {
        const linksHTML = (project.links || []).map(link => {
            const isDisabled = link.disabled || link.url === '#' || !link.url;
            const disabledClass = isDisabled ? ' disabled' : '';
            const targetAttr = isDisabled ? '' : ' target="_blank" rel="noopener noreferrer"';
            const iconClass = link.icon || 'bx bx-link';
            return `
                <a href="${link.url || '#'}"${targetAttr} class="project-btn${disabledClass}" aria-label="${link.label}">
                    <i class='${iconClass}'></i> ${link.label}
                </a>
            `;
        }).join('');

        const imageSrc = project.image || 'images/portfolio.png';

        return `
            <div class="portfolio-box" data-id="${project.id}">
                <h4 class="project-name">${this.escapeHTML(project.title)}</h4>
                <div class="project-image-wrapper">
                    <img src="${imageSrc}" alt="${this.escapeHTML(project.title)}" onerror="this.src='images/portfolio.png'">
                    <div class="portfolio-layer">
                        <p>${this.escapeHTML(project.description)}</p>
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
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    },

    // Render all projects into container
    renderToContainer(containerElement) {
        if (!containerElement) return;
        const projects = this.getProjects();
        const html = projects.map(p => this.renderProjectCardHTML(p)).join('\n\n');
        containerElement.innerHTML = html;
    }
};

// Expose globally
if (typeof window !== 'undefined') {
    window.DEFAULT_PROJECTS = DEFAULT_PROJECTS;
    window.PortfolioManager = PortfolioManager;
}
