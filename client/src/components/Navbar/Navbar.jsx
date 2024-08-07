import { useEffect } from "react";
import { Navbar, Nav } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import Logo from "../../assets/images/logo5.png";

const NavigationBar = () => {
  const navigate = useNavigate();
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

  return (
    <Navbar
      bg="dark"
      data-bs-theme="dark"
      expand="lg"
      style={{ padding: "10px 20px" }}
    >
      <Navbar.Brand>
        <img
          src={Logo}
          onClick={(e) => {
            e.preventDefault();
            navigate("/");
          }}
          style={{ width: "50px", height: "50px", cursor: "pointer" }}
        />
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="justify-content-end flex-grow-1 pe-3 me-auto">
            <NavLink to="/"  className="nav-link">
              Home
            </NavLink>
            <NavLink to="/customer" className="nav-link">
              {" "}
              Customers{" "}
            </NavLink>
            <NavLink to="/lite-bill" className="nav-link">Bill</NavLink>
            <NavLink to="/upload-bill-from-excel" className="nav-link">
              Upload Data
            </NavLink>
          
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default NavigationBar;
