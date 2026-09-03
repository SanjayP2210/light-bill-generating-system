import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Button, Container, Dropdown, Navbar, Offcanvas } from "react-bootstrap";
import "./Navbar.css";
import {
  IconFileSpreadsheet,
  IconFileText,
  IconHome,
  IconLogout,
  IconShieldCog,
  IconUser,
  IconUsers,
  IconMenu2,
  IconMoon,
  IconSettings,
  IconListDetails,
} from "@tabler/icons-react";
import Logo from "../../assets/images/logo5.png";
import { useAuth } from "../../context/AuthContext";
import SidebarBottom from "./SidebarBottom";
import LanguageSwitcher from "../Translator/LanguageSwitcher";
import { initGoogleTranslate } from "../Translator/googleTranslate";

const baseNavItems = [
  { to: "/", label: "Home", icon: IconHome, end: true },
  { to: "/customer", label: "Customers", icon: IconUsers },
  { to: "/lite-bill", label: "Bills", icon: IconFileText },
  { to: "/upload-bill-from-excel", label: "Upload Excel", icon: IconFileSpreadsheet },
  { to: "/masters", label: "Masters", icon: IconListDetails },
];

const getInitials = (name) => {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
};

const apiOrigin = (import.meta.env.VITE_APP_API_URL || "").replace(/\/api\/?$/, "");

const NavigationBar = () => {
  const [expanded, setExpanded] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const closeNav = () => setExpanded(false);

  useEffect(() => {
    if (isAuthenticated) initGoogleTranslate();
  }, [isAuthenticated]);

  const navItems = isAdmin
    ? [...baseNavItems, { to: "/users", label: "Users", icon: IconShieldCog }]
    : baseNavItems;

  const handleLogout = async () => {
    closeNav();
    await logout();
    navigate("/login", { replace: true });
  };

  const avatarSrc = user?.avatar ? `${apiOrigin}${user.avatar}` : null;

  const userAvatar = (
    <span className="avatar-circle">
      {avatarSrc ? <img src={avatarSrc} alt="" /> : getInitials(user?.name)}
    </span>
  );

  if (!isAuthenticated) return null;

  return (
    <>
      <Navbar
        expand="lg"
        expanded={expanded}
        onToggle={setExpanded}
        className="app-navbar"
        sticky="top"
      >
        <Container fluid className="app-navbar-container">
          <Navbar.Brand
            as={Link}
            to={isAuthenticated ? "/" : "/login"}
            className="app-navbar-brand"
            onClick={closeNav}
          >
            <span className="app-navbar-logo-wrap">
              <img src={Logo} alt="Logo" className="app-navbar-logo" />
            </span>
            <span className="app-navbar-title">Bill Generating System</span>
          </Navbar.Brand>

          {isAuthenticated && (
            <div className="app-navbar-left-extra d-none d-lg-flex">
              <LanguageSwitcher variant="topbar" />
              <button
                className="topbar-settings-link"
                type="button"
                onClick={() => navigate("/profile")}
              >
                <IconSettings size={19} stroke={1.8} />
                <span>Settings</span>
              </button>
              <Link to="/profile" className="topbar-profile-link" onClick={closeNav}>
                {userAvatar}
                <span className="topbar-profile-text">
                  <strong>{user?.name || "User"}</strong>
                  <small>{isAdmin ? "Administrator" : "Account"}</small>
                </span>
              </Link>
            </div>
          )}

          {isAuthenticated ? (
            <>
              <div id="google_translate_element" aria-hidden="true"></div>

              {/* <nav className="app-top-nav d-none d-lg-flex">
                {navItems.map(({ to, label, icon: Icon, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      `app-top-nav-link${isActive ? " active" : ""}`
                    }
                  >
                    <Icon size={18} stroke={1.9} />
                    <span>{label}</span>
                  </NavLink>
                ))}
              </nav> */}

              {/* <div className="app-navbar-right d-none d-lg-flex">
                <button className="theme-icon-btn" type="button" aria-label="Theme">
                  <IconMoon size={19} stroke={1.8} />
                </button>
                <Dropdown align="end">
                  <Dropdown.Toggle
                    as="button"
                    className="user-menu-toggle"
                    id="user-menu-toggle"
                  >
                    {userAvatar}
                    <span className="user-menu-name">{user?.name}</span>
                    <span className="user-menu-chevron">⌄</span>
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="user-dropdown">
                    <Dropdown.Item as={Link} to="/profile" onClick={closeNav}>
                      <IconUser size={17} stroke={1.8} className="me-2" />
                      Profile
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout}>
                      <IconLogout size={17} stroke={1.8} className="me-2" />
                      Logout
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div> */}

              <div className="app-navbar-mobile-actions d-lg-none">
                <Navbar.Toggle
                  aria-label="Open navigation menu"
                  aria-controls="main-nav-offcanvas"
                >
                  <IconMenu2 size={24} stroke={1.9} />
                </Navbar.Toggle>
                <Link to="/profile" className="mobile-avatar" onClick={closeNav}>
                  {userAvatar}
                </Link>
              </div>

              <Navbar.Offcanvas
                id="main-nav-offcanvas"
                aria-labelledby="main-nav-offcanvas-label"
                placement="end"
                className="app-navbar-offcanvas d-lg-none"
              >
                <Offcanvas.Header closeButton>
                  <Offcanvas.Title id="main-nav-offcanvas-label">
                    <img src={Logo} alt="Logo" className="app-navbar-logo" />
                    <span>Bill Generating System</span>
                  </Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                  <nav className="app-navbar-nav">
                    {navItems.map(({ to, label, icon: Icon, end }) => (
                      <NavLink
                        key={to}
                        to={to}
                        end={end}
                        onClick={closeNav}
                        className={({ isActive }) =>
                          `app-nav-link${isActive ? " active" : ""}`
                        }
                      >
                        <Icon size={20} stroke={1.75} />
                        <span>{label}</span>
                      </NavLink>
                    ))}
                  </nav>

                  <LanguageSwitcher variant="mobile" />

                  <div className="app-navbar-mobile-user">
                    <Link to="/profile" className="user-menu-toggle" onClick={closeNav}>
                      {userAvatar}
                      <span className="user-menu-name">{user?.name}</span>
                    </Link>
                    <Button variant="outline-danger" size="sm" onClick={handleLogout}>
                      <IconLogout size={16} stroke={1.75} className="me-2" />
                      Logout
                    </Button>
                  </div>
                </Offcanvas.Body>
              </Navbar.Offcanvas>
            </>
          ) : (
            <></>
            // <div className="app-navbar-guest-actions">
            //   <Button as={Link} to="/login" variant="outline-light" size="sm">
            //     Login
            //   </Button>
            //   <Button as={Link} to="/register" variant="light" size="sm">
            //     Register
            //   </Button>
            // </div>
          )}
        </Container>
      </Navbar>

      {isAuthenticated && (
        <aside className="app-sidebar" aria-label="Main navigation">
          <div className="sidebar-nav">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `sidebar-nav-link${isActive ? " active" : ""}`
                }
              >
                <span className="sidebar-icon"><Icon size={21} stroke={1.8} /></span>
                <span>{label}</span>
              </NavLink>
            ))}
          </div>

          <div className="sidebar-bottom">
             <SidebarBottom />
          </div>
        </aside>
      )}
    </>
  );
};

export default NavigationBar;
