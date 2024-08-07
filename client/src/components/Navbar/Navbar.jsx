import { useEffect, useState } from "react";
import { Navbar, Nav } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";

const NavigationBar = () => {

  useEffect(() => {
     document.querySelectorAll(".nav-link").forEach((link) => {
       link.addEventListener("click", () => {
         // Get the navbar element
         const navbarButton = document.getElementsByClassName("navbar-toggler");
         const navbar = document.getElementById("basic-navbar-nav");
         // Collapse the navbar
         if (navbarButton && navbarButton?.length > 0 && navbar.classList.contains("show")) {
          //  navbar.click();
           navbarButton?.[0]?.click();
         }
       });
     });
  }, [])

   const location = useLocation();
  const navigate= useNavigate()
   const isActive = (path) => {
     return location.pathname === path ? "active" : "";
   };
  const [activeLink, setActiveLink] = useState("/");

  const handleLinkClick = (path) => {
    setActiveLink(path);
  };

  return (
    <Navbar
      bg="dark"
      data-bs-theme="dark"
      expand="lg"
      style={{ padding: "10px 20px" }}
    >
      <Navbar.Brand>
        <LinkContainer
          to="javascipt:void(0)"
          onClick={(e) => {
            e.preventDefault();
            navigate("/");
          }}
        >
          <Nav.Link className={isActive("/")}>Bill System</Nav.Link>
        </LinkContainer>
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          <LinkContainer to="/" className={activeLink === "/" ? "active" : ""}>
            <Nav.Link onClick={() => handleLinkClick("/")}>Home</Nav.Link>
          </LinkContainer>
          <LinkContainer
            to="/customer"
            className={activeLink === "/customer" ? "active" : ""}
          >
            <Nav.Link onClick={() => handleLinkClick("/customer")}>
              Customers
            </Nav.Link>
          </LinkContainer>
          <LinkContainer
            to="/lite-bill"
            className={activeLink === "/lite-bill" ? "active" : ""}
          >
            <Nav.Link
              onClick={() => handleLinkClick("/lite-bill")}
            >
              Bill
            </Nav.Link>
          </LinkContainer>
          <LinkContainer
            to="/upload-bill-from-excel"
            className={activeLink === "/upload-bill-from-excel" ? "active" : ""}
          >
            <Nav.Link
              onClick={() => handleLinkClick("/about")}
              className={isActive("/upload-bill-from-excel")}
            >
              Upload Data From Excel
            </Nav.Link>
          </LinkContainer>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default NavigationBar;
