import React from "react";
import { Navbar, Container, Nav, Button } from "react-bootstrap";
import { Link, NavLink, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function NavbarApp() {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <>{
      <Navbar bg="light" expand="lg">
        <Container fluid>
          <Navbar.Brand as={Link} to="/">Control Préstamos</Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse>
            <Nav className="me-auto">
              <Nav.Link as={NavLink} to="/clientes">Clientes</Nav.Link>
              <Nav.Link as={NavLink} to="/prestamos">Préstamos</Nav.Link>
              <Nav.Link as={NavLink} to="/pagos">Relación de Pagos</Nav.Link>
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
