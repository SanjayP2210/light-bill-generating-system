import { Navbar, Nav } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";

const NavigationBar = () => {
  return (
    <Navbar bg="dark" data-bs-theme="dark" expand="lg">
      <Navbar.Brand href="/">Bill System</Navbar.Brand>
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
