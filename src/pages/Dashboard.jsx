import React from "react";
import NavbarApp from "../components/NavbarApp";
import { Container } from "react-bootstrap";
import { Outlet } from "react-router-dom";

export default function Dashboard() {
  return (
    <>
      <NavbarApp />
      <Container className="content-container">
        <Outlet />
      </Container>
    </>
  );
}
