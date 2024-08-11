import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";
import {
  IconDownload,
  IconFile,
  IconHome,
  IconUser,
} from "@tabler/icons-react";
import { Nav, Navbar, OverlayTrigger, Tooltip } from "react-bootstrap";
import Logo from "../../assets/images/logo5.png";
import TooltipComponent from "../Common/Tooltip/TooltipComponent.jsx";

const NavigationBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const light = document.querySelector(".nav__light");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        // Get the navbar element
        const navbarButton = document.getElementsByClassName("navbar-toggler");
        const navbar = document.getElementById("basic-navbar-nav");
        // Collapse the navbar
        if (
          navbarButton &&
          navbarButton?.length > 0 &&
          navbar.classList.contains("show")
        ) {
          //  navbar.click();
          navbarButton?.[0]?.click();
        }
      });
    });
  }, []);

  const getActiveClassName = (url, id) => {
    const activeClass = url === location.pathname ? "active" : "";
    if (activeClass === "active" && light) {
      const linkWidth = windowWidth >= 400 ? 100 : 75;
      light.style.marginLeft = `${linkWidth * parseInt(id)}px`;
    }
    return activeClass;
  };

  return (
    //  <Navbar bg="dark" expand="lg" style={{ padding: "10px 20px" }}>
    //   <Navbar.Brand>
    //     <img
    //       src={Logo}
    //       onClick={(e) => {
    //         e.preventDefault();
    //         // navigate("/");
    //       }}
    //       style={{ width: "50px", height: "50px", cursor: "pointer" }}
    //       alt="Logo"
    //     />
    //   </Navbar.Brand>
    //   <Navbar.Toggle aria-controls="basic-navbar-nav" />
    //   <Navbar.Collapse id="basic-navbar-nav">
    //     <Nav className="navbar-container justify-content-end flex-grow-1 pe-3 me-auto">
    //       <NavLink to="/" className="nav-link">
    //         <IconHome />
    //       </NavLink>
    //       <NavLink to="/customer" className="nav-link">
    //         <IconUser />
    //       </NavLink>
    //       <NavLink to="/lite-bill" className="nav-link">
    //         <IconFile />
    //       </NavLink>
    //       <NavLink to="/upload-bill-from-excel" className="nav-link">
    //         <IconDownload />
    //       </NavLink>
    //     </Nav>
    //   </Navbar.Collapse>
    // </Navbar>
    <div className="navbar">
      <div className="nav-logo">
        <img
          src={Logo}
          onClick={(e) => {
            e.preventDefault();
            navigate("/");
          }}
          style={{ width: "50px", height: "50px", cursor: "pointer" }}
          alt="Logo"
        />
      </div>
      <div className="navbar-container">
        <nav className="nav">
          <ul className="nav__links">
            <li
              className={`nav__link ${getActiveClassName("/", 0)}`}
              id="nav-link-1"
            >
              <NavLink to="/" className="nav-link">
                <TooltipComponent
                  tooltipText={<strong>Home</strong>}
                  placement={"bottom"}
                >
                  <IconHome />
                </TooltipComponent>
              </NavLink>
            </li>
            <li
              className={`nav__link ${getActiveClassName("/customer", 1)}`}
              id="nav-link-2"
            >
              <NavLink to="/customer" className="nav-link">
                <TooltipComponent
                  tooltipText={<strong>Customer</strong>}
                  placement={"bottom"}
                >
                  <IconUser />
                </TooltipComponent>
              </NavLink>
            </li>
            <li
              className={`nav__link ${getActiveClassName("/lite-bill", 2)}`}
              id="nav-link-3"
            >
              <NavLink to="/lite-bill" className="nav-link">
                <TooltipComponent
                  tooltipText={<strong>Bill</strong>}
                  placement={"bottom"}
                >
                  <IconFile />
                </TooltipComponent>
              </NavLink>
            </li>
            <li
              className={`nav__link ${getActiveClassName(
                "/upload-bill-from-excel",
                3
              )}`}
              id="nav-link-4"
            >
              <NavLink
                to="/upload-bill-from-excel"
                className="nav-link"
                id="nav-link-4"
              >
                <TooltipComponent
                  tooltipText={<strong>Upload Excel</strong>}
                  placement={"bottom"}
                >
                  <IconDownload />
                </TooltipComponent>
              </NavLink>
            </li>
            <div className="nav__light"></div>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default NavigationBar;
