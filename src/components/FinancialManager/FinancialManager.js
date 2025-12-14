import React, { useState, useEffect } from 'react';
import { Container, Nav, Navbar, Badge, Dropdown } from 'react-bootstrap';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaWallet,
  FaExchangeAlt,
  FaFolder,
  FaFileInvoiceDollar,
  FaUser,
  FaSignOutAlt,
  FaMoon,
  FaSun,
  FaBars,
  FaTimes,
  FaBell,
  FaSearch,
  FaCog,
  FaChevronDown
} from 'react-icons/fa';
import './FinancialManager.css';

function FinancialManager() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showSidebar, setShowSidebar] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 991);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  const toggleSidebar = () => setShowSidebar(!showSidebar);
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('dark-mode', !darkMode);
  };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 991;
      setIsMobile(mobile);
      setShowSidebar(!mobile);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    {
      path: '/financial-manager/dashboard',
      icon: FaTachometerAlt,
      label: 'Dashboard',
      badge: null,
      tooltip: 'View your dashboard'
    },
    {
      path: '/financial-manager/budgets',
      icon: FaWallet,
      label: 'Budgets',
      badge: null,
      tooltip: 'Manage your budgets'
    },
    {
      path: '/financial-manager/transactions',
      icon: FaExchangeAlt,
      label: 'Transactions',
      badge: null,
      tooltip: 'Track your transactions'
    },
  
    {
      path: '/financial-manager/invoices',
      icon: FaFileInvoiceDollar,
      label: 'Invoices',
      badge: null,
      tooltip: 'View and create invoices'
    },
 
  ];

  return (
    <div className={`fm-layout ${darkMode ? 'dark-mode' : ''}`}>
      {/* Modern Sidebar */}
      <aside className={`fm-sidebar ${showSidebar ? 'show' : 'hide'} ${isMobile ? 'mobile' : ''}`}>
        {/* Sidebar Header */}
        <div className="fm-sidebar-header">
          <div className="fm-logo-section">
            <div className="fm-logo-icon">
              <FaWallet />
            </div>
            <div className="fm-logo-text">
              <h4>FinanceHub</h4>
              <span className="fm-logo-subtitle">Pro Edition</span>
            </div>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="fm-user-section">
          <div className="fm-user-avatar-wrapper">
            <img
              src="https://ui-avatars.com/api/?name=Ginye&background=667eea&color=fff&size=80"
              alt="User Avatar"
              className="fm-user-avatar"
            />
            <div className="fm-user-status"></div>
          </div>
          <div className="fm-user-info">
            <h5 className="fm-user-name">Welcome, Ginye</h5>
            <Badge bg="primary" className="fm-user-role">Admin</Badge>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="fm-nav">
          <div className="fm-nav-section">
            <span className="fm-nav-label">MAIN MENU</span>
            <ul className="fm-nav-list">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <li key={item.path} className="fm-nav-item">
                    <Link
                      to={item.path}
                      className={`fm-nav-link ${isActive ? 'active' : ''}`}
                      onClick={() => isMobile && setShowSidebar(false)}
                      title={item.tooltip}
                    >
                      <div className="fm-nav-icon">
                        <Icon />
                      </div>
                      <span className="fm-nav-text">{item.label}</span>
                      {item.badge && item.badge > 0 && (
                        <Badge bg="danger" pill className="fm-nav-badge">
                          {item.badge}
                        </Badge>
                      )}
                      {isActive && <div className="fm-nav-indicator" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>


        </nav>


      </aside>

      {/* Overlay for Mobile */}
      {isMobile && showSidebar && (
        <div 
          className="fm-overlay" 
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Main Content Area */}
      <div className={`fm-main ${showSidebar && !isMobile ? 'sidebar-open' : ''}`}>
        {/* Top Navigation Bar */}
        <header className="fm-topbar">
          <div className="fm-topbar-left">
            <button
              onClick={toggleSidebar}
              className="fm-menu-toggle"
              aria-label="Toggle sidebar"
            >
              {showSidebar ? <FaTimes /> : <FaBars />}
            </button>

            <div className="fm-search-box">
              <FaSearch className="fm-search-icon" />
              <input
                type="text"
                placeholder="Search transactions, invoices..."
                className="fm-search-input"
              />
            </div>
          </div>

          <div className="fm-topbar-right">
            {/* Notifications Dropdown */}
            <Dropdown className="fm-notification-dropdown">
              <Dropdown.Toggle 
                variant="link" 
                className="fm-icon-button"
                id="notifications-dropdown"
              >
                <FaBell />
                {notifications > 0 && (
                  <span className="fm-notification-count">{notifications}</span>
                )}
              </Dropdown.Toggle>

              <Dropdown.Menu align="end" className="fm-dropdown-menu">
                <div className="fm-dropdown-header">
                  <h6>Notifications</h6>
                  <Badge bg="primary">{notifications} New</Badge>
                </div>
                <Dropdown.Divider />
                <Dropdown.Item className="fm-notification-item">
                  <div className="fm-notification-content">
                    <strong>New Invoice Created</strong>
                    <p>Invoice #1234 has been generated</p>
                    <small>2 hours ago</small>
                  </div>
                </Dropdown.Item>
                <Dropdown.Item className="fm-notification-item">
                  <div className="fm-notification-content">
                    <strong>Budget Alert</strong>
                    <p>Marketing budget at 85%</p>
                    <small>5 hours ago</small>
                  </div>
                </Dropdown.Item>
                <Dropdown.Item className="fm-notification-item">
                  <div className="fm-notification-content">
                    <strong>Transaction Complete</strong>
                    <p>Payment received: $2,500</p>
                    <small>1 day ago</small>
                  </div>
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item className="text-center fm-view-all">
                  View All Notifications
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            {/* Settings Icon */}
            <button className="fm-icon-button" title="Settings">
              <FaCog />
            </button>

            {/* User Dropdown */}
            <Dropdown className="fm-user-dropdown">
              <Dropdown.Toggle 
                variant="link" 
                className="fm-user-toggle"
                id="user-dropdown"
              >
                <img
                  src="https://ui-avatars.com/api/?name=Ginye&background=667eea&color=fff&size=40"
                  alt="User"
                  className="fm-topbar-avatar"
                />
                <span className="fm-user-dropdown-name">Ginye</span>
                <FaChevronDown className="fm-chevron" />
              </Dropdown.Toggle>

              <Dropdown.Menu align="end" className="fm-dropdown-menu">
                <Dropdown.Item as={Link} to="/financial-manager/profile">
                  <FaUser className="me-2" />
                  My Profile
                </Dropdown.Item>
                <Dropdown.Item onClick={toggleDarkMode}>
                  {darkMode ? <FaSun className="me-2" /> : <FaMoon className="me-2" />}
                  {darkMode ? 'Light Mode' : 'Dark Mode'}
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout} className="text-danger">
                  <FaSignOutAlt className="me-2" />
                  Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </header>

        {/* Page Content */}
        <main className="fm-content">
          <Container fluid className="fm-container">
            <Outlet />
          </Container>
        </main>

        {/* Footer */}
        <footer className="fm-footer">
          <div className="fm-footer-content">
            <span>© 2024 FinanceHub. All rights reserved.</span>
            <div className="fm-footer-links">
              <a href="#privacy">Privacy</a>
              <a href="#terms">Terms</a>
              <a href="#support">Support</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default FinancialManager;