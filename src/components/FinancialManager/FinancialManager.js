import React, { useState, useEffect } from 'react';
import { Container, Nav, Navbar, Offcanvas, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';

function FinancialManager() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showSidebar, setShowSidebar] = useState(false); // Sidebar hidden on mobile by default
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 991);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(3); // Example: 3 unread notifications

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

  // Handle window resize to detect mobile view
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 991;
      setIsMobile(mobile);
      setShowSidebar(mobile ? false : true); // Hide on mobile, show on desktop
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderTooltip = (props, message) => (
    <Tooltip id="button-tooltip" {...props}>
      {message}
    </Tooltip>
  );

  return (
    <div className={`d-flex ${darkMode ? 'dark-mode' : ''}`}>
      {/* Sidebar: Offcanvas for Mobile, Fixed for Desktop */}
      {isMobile ? (
        <>
          <Offcanvas
            show={showSidebar}
            onHide={() => setShowSidebar(false)}
            placement="start"
            className="financial-sidebar"
            style={{ width: '100%', zIndex: 1050 }}
          >
            <Offcanvas.Header closeButton className="p-3 border-bottom border-light">
              <Offcanvas.Title className="d-flex align-items-center">
                <img
                  src="https://via.placeholder.com/40"
                  alt="User Avatar"
                  className="rounded-circle me-2 sidebar-avatar"
                />
                <div>
                  <h5 className="mb-0 text-white fw-bold">Welcome, Ginye</h5>
                  <small className="text-light">Admin</small>
                </div>
              </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body className="p-0">
              <Nav className="flex-column py-3">
                <Nav.Link
                  as={Link}
                  to="/financial-manager/dashboard"
                  className={`d-flex align-items-center py-3 px-4 text-white ${
                    location.pathname === '/financial-manager/dashboard' ? 'active' : ''
                  }`}
                  onClick={() => setShowSidebar(false)}
                >
                  <i className="bi bi-speedometer2 me-3 fs-5"></i>
                  <span>Dashboard</span>
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/financial-manager/budgets"
                  className={`d-flex align-items-center py-3 px-4 text-white ${
                    location.pathname === '/financial-manager/budgets' ? 'active' : ''
                  }`}
                  onClick={() => setShowSidebar(false)}
                >
                  <i className="bi bi-wallet2 me-3 fs-5"></i>
                  <span>Budgets</span>
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/financial-manager/transactions"
                  className={`d-flex align-items-center py-3 px-4 text-white ${
                    location.pathname === '/financial-manager/transactions' ? 'active' : ''
                  }`}
                  onClick={() => setShowSidebar(false)}
                >
                  <i className="bi bi-arrow-left-right me-3 fs-5"></i>
                  <span>Transactions</span>
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/financial-manager/documents"
                  className={`d-flex align-items-center py-3 px-4 text-white position-relative ${
                    location.pathname === '/financial-manager/documents' ? 'active' : ''
                  }`}
                  onClick={() => setShowSidebar(false)}
                >
                  <i className="bi bi-folder me-3 fs-5"></i>
                  <span>Documents</span>
                  {notifications > 0 && (
                    <span className="badge bg-danger rounded-pill position-absolute top-2 end-2">
                      {notifications}
                    </span>
                  )}
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/financial-manager/invoices"
                  className={`d-flex align-items-center py-3 px-4 text-white ${
                    location.pathname === '/financial-manager/invoices' ? 'active' : ''
                  }`}
                  onClick={() => setShowSidebar(false)}
                >
                  <i className="bi bi-receipt me-3 fs-5"></i>
                  <span>Invoices</span>
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/financial-manager/profile"
                  className={`d-flex align-items-center py-3 px-4 text-white ${
                    location.pathname === '/financial-manager/profile' ? 'active' : ''
                  }`}
                  onClick={() => setShowSidebar(false)}
                >
                  <i className="bi bi-person me-3 fs-5"></i>
                  <span>Profile</span>
                </Nav.Link>
                <Nav.Link
                  onClick={handleLogout}
                  className="d-flex align-items-center py-3 px-4 text-white"
                >
                  <i className="bi bi-box-arrow-right me-3 fs-5"></i>
                  <span>Logout</span>
                </Nav.Link>
              </Nav>
              <div className="sidebar-footer p-3 border-top border-light">
                <div
                  className="d-flex align-items-center py-2 px-4 text-white cursor-pointer"
                  onClick={toggleDarkMode}
                >
                  <i className={`bi ${darkMode ? 'bi-sun' : 'bi-moon'} me-3 fs-5`}></i>
                  <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </div>
              </div>
            </Offcanvas.Body>
          </Offcanvas>
        </>
      ) : (
        <div
          className={`sidebar-wrapper ${showSidebar ? 'show' : 'hide'}`}
          style={{ zIndex: 1050 }}
        >
          <div className="financial-sidebar">
            <div className="sidebar-header p-3 border-bottom border-light text-center">
              <div className="d-flex align-items-center justify-content-center">
                <img
                  src="https://via.placeholder.com/40"
                  alt="User Avatar"
                  className="rounded-circle me-2 sidebar-avatar"
                />
                <div>
                  <h5 className="mb-0 text-white fw-bold">Welcome, Ginye</h5>
                  <small className="text-light">Admin</small>
                </div>
              </div>
            </div>
            <Nav className="flex-column py-3">
              <OverlayTrigger
                placement="right"
                delay={{ show: 250, hide: 400 }}
                overlay={(props) => renderTooltip(props, 'View your dashboard')}
              >
                <Nav.Link
                  as={Link}
                  to="/financial-manager/dashboard"
                  className={`d-flex align-items-center py-3 px-4 text-white ${
                    location.pathname === '/financial-manager/dashboard' ? 'active' : ''
                  }`}
                >
                  <i className="bi bi-speedometer2 me-3 fs-5"></i>
                  <span>Dashboard</span>
                </Nav.Link>
              </OverlayTrigger>
              <OverlayTrigger
                placement="right"
                delay={{ show: 250, hide: 400 }}
                overlay={(props) => renderTooltip(props, 'Manage your budgets')}
              >
                <Nav.Link
                  as={Link}
                  to="/financial-manager/budgets"
                  className={`d-flex align-items-center py-3 px-4 text-white ${
                    location.pathname === '/financial-manager/budgets' ? 'active' : ''
                  }`}
                >
                  <i className="bi bi-wallet2 me-3 fs-5"></i>
                  <span>Budgets</span>
                </Nav.Link>
              </OverlayTrigger>
              <OverlayTrigger
                placement="right"
                delay={{ show: 250, hide: 400 }}
                overlay={(props) => renderTooltip(props, 'Track your transactions')}
              >
                <Nav.Link
                  as={Link}
                  to="/financial-manager/transactions"
                  className={`d-flex align-items-center py-3 px-4 text-white ${
                    location.pathname === '/financial-manager/transactions' ? 'active' : ''
                  }`}
                >
                  <i className="bi bi-arrow-left-right me-3 fs-5"></i>
                  <span>Transactions</span>
                </Nav.Link>
              </OverlayTrigger>
              <OverlayTrigger
                placement="right"
                delay={{ show: 250, hide: 400 }}
                overlay={(props) => renderTooltip(props, 'Access your documents')}
              >
                <Nav.Link
                  as={Link}
                  to="/financial-manager/documents"
                  className={`d-flex align-items-center py-3 px-4 text-white position-relative ${
                    location.pathname === '/financial-manager/documents' ? 'active' : ''
                  }`}
                >
                  <i className="bi bi-folder me-3 fs-5"></i>
                  <span>Documents</span>
                  {notifications > 0 && (
                    <span className="badge bg-danger rounded-pill position-absolute top-2 end-2">
                      {notifications}
                    </span>
                  )}
                </Nav.Link>
              </OverlayTrigger>
              <OverlayTrigger
                placement="right"
                delay={{ show: 250, hide: 400 }}
                overlay={(props) => renderTooltip(props, 'View and create invoices')}
              >
                <Nav.Link
                  as={Link}
                  to="/financial-manager/invoices"
                  className={`d-flex align-items-center py-3 px-4 text-white ${
                    location.pathname === '/financial-manager/invoices' ? 'active' : ''
                  }`}
                >
                  <i className="bi bi-receipt me-3 fs-5"></i>
                  <span>Invoices</span>
                </Nav.Link>
              </OverlayTrigger>
              <OverlayTrigger
                placement="right"
                delay={{ show: 250, hide: 400 }}
                overlay={(props) => renderTooltip(props, 'View your profile')}
              >
                <Nav.Link
                  as={Link}
                  to="/financial-manager/profile"
                  className={`d-flex align-items-center py-3 px-4 text-white ${
                    location.pathname === '/financial-manager/profile' ? 'active' : ''
                  }`}
                >
                  <i className="bi bi-person me-3 fs-5"></i>
                  <span>Profile</span>
                </Nav.Link>
              </OverlayTrigger>
              <OverlayTrigger
                placement="right"
                delay={{ show: 250, hide: 400 }}
                overlay={(props) => renderTooltip(props, 'Sign out of your account')}
              >
                <Nav.Link
                  onClick={handleLogout}
                  className="d-flex align-items-center py-3 px-4 text-white"
                >
                  <i className="bi bi-box-arrow-right me-3 fs-5"></i>
                  <span>Logout</span>
                </Nav.Link>
              </OverlayTrigger>
            </Nav>
            <div className="sidebar-footer p-3 border-top border-light">
              <div
                className="d-flex align-items-center py-2 px-4 text-white cursor-pointer"
                onClick={toggleDarkMode}
              >
                <i className={`bi ${darkMode ? 'bi-sun' : 'bi-moon'} me-3 fs-5`}></i>
                <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="btn btn-primary rounded-circle shadow sidebar-toggle"
        style={{
          position: 'fixed',
          top: '15px',
          left: '15px',
          zIndex: 1060,
          width: '44px',
          height: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <i className={`bi ${showSidebar ? 'bi-x' : 'bi-list'}`}></i>
      </button>

      {/* Main Content */}
      <div
        className="flex-grow-1 main-content"
        style={{
          marginLeft: showSidebar && !isMobile ? '250px' : '0',
          transition: 'margin-left 0.3s ease',
          zIndex: 1000,
        }}
      >
        <Container fluid className="p-3">
          <Outlet />
        </Container>
      </div>
    </div>
  );
}

export default FinancialManager;