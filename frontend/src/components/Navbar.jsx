import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Calendar, LayoutDashboard, Users, ClipboardList,
  MessageSquare, LogOut, Menu, X, ChevronDown, Settings, User, Shield
} from 'lucide-react';

const navLinks = {
  user: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/events', label: 'Events', icon: Calendar },
    { to: '/my-registrations', label: 'My Registrations', icon: ClipboardList },
    { to: '/my-feedbacks', label: 'My Feedbacks', icon: MessageSquare },
  ],
  organizer: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/events', label: 'Events', icon: Calendar },
    { to: '/my-events', label: 'My Events', icon: Settings },
    { to: '/my-registrations', label: 'Registrations', icon: ClipboardList },
  ],
  admin: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/events', label: 'Events', icon: Calendar },
    { to: '/my-events', label: 'Manage Events', icon: Settings },
    { to: '/my-registrations', label: 'Registrations', icon: Users },
    { to: '/my-feedbacks', label: 'Feedbacks', icon: MessageSquare },
    { to: '/admin', label: 'Admin Panel', icon: Shield },
  ],
};

export default function Navbar() {
  const { user, logout, isAdmin, isOrganizer } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const getLinks = () => {
    if (isAdmin()) return navLinks.admin;
    if (isOrganizer()) return navLinks.organizer;
    return navLinks.user;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const links = getLinks();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/dashboard" className="navbar-logo">
          <div className="logo-icon">
            <Calendar size={20} />
          </div>
          <span className="logo-text">EventSphere</span>
        </Link>

        {/* Desktop Links */}
        <div className="navbar-links">
          {links.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`nav-link ${location.pathname === to ? 'active' : ''}`}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </div>

        {/* User Menu */}
        <div className="navbar-user">
          <div className="user-menu-trigger" onClick={() => setUserMenuOpen(!userMenuOpen)}>
            <div className="user-avatar">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="user-info-mini">
              <span className="user-name-mini">{user?.firstName} {user?.lastName}</span>
              <span className="user-role-badge">
                {isAdmin() ? 'Admin' : isOrganizer() ? 'Organizer' : 'User'}
              </span>
            </div>
            <ChevronDown size={16} className={`chevron ${userMenuOpen ? 'rotated' : ''}`} />
          </div>

          {userMenuOpen && (
            <div className="user-dropdown">
              <div className="dropdown-header">
                <span>{user?.email}</span>
              </div>
              <button className="dropdown-item logout" onClick={handleLogout}>
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="mobile-menu">
          {links.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`mobile-link ${location.pathname === to ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
          <button className="mobile-link logout" onClick={handleLogout}>
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      )}
    </nav>
  );
}
