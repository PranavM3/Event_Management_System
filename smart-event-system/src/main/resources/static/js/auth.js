// Authentication utilities
const AUTH = {
    getToken: () => localStorage.getItem('jwtToken'),
    
    getUserInfo: () => {
        const userInfo = localStorage.getItem('userInfo');
        return userInfo ? JSON.parse(userInfo) : null;
    },
    
    isLoggedIn: () => !!AUTH.getToken(),
    
    logout: () => {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('userInfo');
        window.location.href = '/login.html';
    },
    
    requireAuth: () => {
        if (!AUTH.isLoggedIn()) {
            window.location.href = '/login.html';
            return false;
        }
        return true;
    },
    
    hasRole: (role) => {
        const userInfo = AUTH.getUserInfo();
        return userInfo && userInfo.roles && userInfo.roles.includes(role);
    },
    
    getHeaders: () => ({
        'Authorization': `Bearer ${AUTH.getToken()}`,
        'Content-Type': 'application/json'
    })
};

// API utilities
const API = {
    baseUrl: 'http://localhost:8080/api',
    
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            ...options,
            headers: {
                ...AUTH.getHeaders(),
                ...options.headers
            }
        };
        
        try {
            const response = await fetch(url, config);
            
            if (response.status === 401) {
                AUTH.logout();
                throw new Error('Unauthorized');
            }
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Request failed');
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },
    
    get: (endpoint) => API.request(endpoint, { method: 'GET' }),
    
    post: (endpoint, data) => API.request(endpoint, {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    
    put: (endpoint, data) => API.request(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),
    
    delete: (endpoint) => API.request(endpoint, { method: 'DELETE' }),
    
    patch: (endpoint, data) => API.request(endpoint, {
        method: 'PATCH',
        body: JSON.stringify(data)
    })
};

// UI utilities
const UI = {
    showMessage: (message, type = 'success') => {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.textContent = message;
        alertDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            background: ${type === 'success' ? '#d4edda' : '#f8d7da'};
            color: ${type === 'success' ? '#155724' : '#721c24'};
            border: 1px solid ${type === 'success' ? '#c3e6cb' : '#f5c6cb'};
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
            alertDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => alertDiv.remove(), 300);
        }, 3000);
    },
    
    showLoading: (show = true) => {
        let loader = document.getElementById('global-loader');
        if (show) {
            if (!loader) {
                loader = document.createElement('div');
                loader.id = 'global-loader';
                loader.innerHTML = '<div class="spinner"></div>';
                loader.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 9999;
                `;
                document.body.appendChild(loader);
            }
        } else {
            if (loader) loader.remove();
        }
    },
    
    formatDate: (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    formatDateInput: (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
    }
};

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    .spinner {
        border: 4px solid #f3f3f3;
        border-top: 4px solid #667eea;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        animation: spin 1s linear infinite;
    }
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);
