import React, { useEffect, useState } from "react";
import { Button, Table, Modal, Form } from "react-bootstrap";
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { db } from "../services/firebase";

function formatCardNumber(cardNumber = "") {
  // Ensure the input is a string, remove non-digits, and then insert a space every 4 digits.
  return String(cardNumber).replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
}

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [show, setShow] = useState(false);
  //const [form, setForm] = useState({ nombre: "", telefono: "", tarjeta: "" });

  //TODO: Enviar estructura a un archivo JSON
  const [form, setForm] = useState({
    "nombres": "",
    "apPaterno": "",
    "apMaterno": "",
    "telefono": "",
    "numTarjetaCuenta": "",
    "banco": "",
    "prestamos": [{
      "fechaGeneracion": "",
      "fechaPrimerPago": "",
      "montoSolicitado": 0,
      "quincenas": 0,
      "pagoQuincenal": 0,
      "totalPagar": 0,
      "saldoPendiente": 0,
      "esIndividual": false,
      "finalizado": false,
      "pagos": [{
          "numPago": 0,
          "fechaPago": "",
          "pagado": false
      }]
    }]
  });


  useEffect(() => {
    const q = query(collection(db, "clientes"), orderBy("nombres"));
    const unsub = onSnapshot(q, (snap) => {
      setClientes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "clientes"), { ...form, fechaRegistro: new Date().toISOString() });
    //setForm({ nombres: "", telefono: "", tarjeta: "" });
    setForm({
    "nombres": "",
    "apPaterno": "",
    "apMaterno": "",
    "telefono": "",
    "numTarjetaCuenta": "",
    "banco": "",
    "prestamos": [{
      "fechaGeneracion": "",
      "fechaPrimerPago": "",
      "montoSolicitado": 0,
      "quincenas": 0,
      "pagoQuincenal": 0,
      "totalPagar": 0,
      "saldoPendiente": 0,
      "esIndividual": false,
      "finalizado": false,
      "pagos": [{
          "numPago": 0,
          "fechaPago": "",
          "pagado": false
      }]
    }]
  });
    setShow(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Eliminar cliente?")) return;
    await deleteDoc(doc(db, "clientes", id));
  };

  return (
    <div>
      <div className="d-flex justify-content-between mb-3">
        <h4>Clientes</h4>
        <Button onClick={() => setShow(true)}>Nuevo cliente</Button>
      </div>

      <div className="table-responsive-container">
        <Table striped>
          <thead>
            <tr>
              <th>Nombre(s)</th><th>Apellidos</th><th>Teléfono</th><th>Tarjeta/Cuenta</th><th>Banco</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
          {clientes.map(c => (
            <tr key={c.id}>
              <td>{c.nombres}</td>
              <td>{c.apPaterno} {c.apMaterno}</td>
              <td>{c.telefono}</td>
              <td>{formatCardNumber(c.numTarjetaCuenta)}</td>
              <td>{c.banco}</td>
              <td><Button variant="danger" size="sm" onClick={() => handleDelete(c.id)}>Eliminar</Button></td>
            </tr>
          ))}
        </tbody>
        </Table>
      </div>

      <Modal show={show} onHide={() => setShow(false)}>
        <Form onSubmit={handleAdd}>
          <Modal.Header closeButton><Modal.Title>Nuevo cliente</Modal.Title></Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-2">
              <Form.Label>Nombres</Form.Label>
              <Form.Control value={form.nombres} onChange={e => setForm({...form, nombres: e.target.value})} required />
            </Form.Group>
             <Form.Group className="mb-2">
              <Form.Label>Apellido Paterno</Form.Label>
              <Form.Control value={form.apPaterno} onChange={e => setForm({...form, apPaterno: e.target.value})} required />
            </Form.Group>
             <Form.Group className="mb-2">
              <Form.Label>Apellido Materno</Form.Label>
              <Form.Control value={form.apMaterno} onChange={e => setForm({...form, apMaterno: e.target.value})}/>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Tarjeta/Cuenta</Form.Label>
              <Form.Control value={form.numTarjetaCuenta} onChange={e => setForm({...form, numTarjetaCuenta: e.target.value})} />
            </Form.Group>
              <Form.Group className="mb-2">
              <Form.Label>Banco</Form.Label>
              <Form.Control value={form.banco} onChange={e => setForm({...form, banco: e.target.value})} />
            </Form.Group>

          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShow(false)}>Cancelar</Button>
            <Button type="submit">Guardar</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
