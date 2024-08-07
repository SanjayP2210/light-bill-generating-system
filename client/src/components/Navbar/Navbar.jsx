import { useEffect } from "react";
import { Navbar, Nav } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";

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

  return (
    <Navbar
      bg="dark"
      data-bs-theme="dark"
      expand="lg"
      style={{ padding: "10px 20px" }}
    >
      <Navbar.Brand>
        <Nav.Link>Bill System</Nav.Link>
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          <LinkContainer to="/">
            <Nav.Link>Home</Nav.Link>
          </LinkContainer>
          <LinkContainer to="/customer">
            <Nav.Link>Customers</Nav.Link>
          </LinkContainer>
          <LinkContainer to="/lite-bill">
            <Nav.Link>Bill</Nav.Link>
          </LinkContainer>
          <LinkContainer to="/upload-bill-from-excel">
            <Nav.Link>Upload Data From Excel</Nav.Link>
          </LinkContainer>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default NavigationBar;
