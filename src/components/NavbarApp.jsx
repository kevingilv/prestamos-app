import React, { useState } from "react";
import { Navbar, Container, Nav, Button } from "react-bootstrap";
import { Link, NavLink, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function NavbarApp() {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false); // State to manage navbar collapse

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleNavClick = () => {
    setExpanded(false); // Close the navbar when a link is clicked
  };

  return (
    <>{
      <Navbar  className="navbar-style" bg="light" expand="lg" expanded={expanded} onToggle={() => setExpanded(!expanded)}>
        <Container fluid>
          <Navbar.Brand className="nav-barnd-style" as={Link} to="/">Control Préstamos</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" onClick={() => setExpanded(!expanded)} />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={NavLink} to="/clientes" onClick={handleNavClick}>Clientes</Nav.Link>
              <Nav.Link as={NavLink} to="/prestamos" onClick={handleNavClick}>Préstamos</Nav.Link>
              <Nav.Link as={NavLink} to="/pagos" onClick={handleNavClick}>Relación de Pagos</Nav.Link>
            </Nav>
            <div className="d-flex align-items-center">
              <div className="me-3">{currentUser?.email}</div>
              <Button variant="outline-secondary" size="sm" onClick={handleLogout}>Salir</Button>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      
      /*<div className="content-container">
        <Container>
          <Outlet />
        </Container>
      </div>*/
    }
    </>
  );
}
