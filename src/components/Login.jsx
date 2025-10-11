import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Container, Form, Button, Card } from "react-bootstrap";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await login(email, password);
      navigate("/");
    } catch (error) {
      setErr("No se pudo iniciar sesión: " + error.message);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
      <Card style={{ width: 420 }}>
        <Card.Body>
          <h3 className="mb-3">Iniciar sesión</h3>
          {err && <div className="alert alert-danger">{err}</div>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-2">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" required value={email} onChange={e => setEmail(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control type="password" required value={password} onChange={e => setPassword(e.target.value)} />
            </Form.Group>
            <Button type="submit">Entrar</Button>{" "}
            <Link to="/register" className="btn btn-link">Crear cuenta</Link>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
