import React, { useEffect, useState } from "react";
import { Button, Table, Modal, Form } from "react-bootstrap";
import { db } from "../services/firebase";
import { collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";

function addDaysISO(startISO, days) {
  const dt = new Date(startISO);
  dt.setDate(dt.getDate() + days);
  return dt.toISOString().slice(0,10);
}

export default function Prestamos() {
  const [clientes, setClientes] = useState([]);
  const [prestamos, setPrestamos] = useState([]);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({
    clienteId: "",
    montoPrestado: 0,
    pagosTotales: 1,
    montoPorPago: 0,
    fechaInicio: new Date().toISOString().slice(0,10)
  });

  useEffect(() => {
    const q1 = query(collection(db, "clientes"), orderBy("nombre"));
    const unsub1 = onSnapshot(q1, snap => setClientes(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const q2 = query(collection(db, "prestamos"), orderBy("fechaInicio", "desc"));
    const unsub2 = onSnapshot(q2, snap => setPrestamos(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => { unsub1(); unsub2(); };
  }, []);

  const handleAddPrestamo = async (e) => {
    e.preventDefault();
    // find client name
    const cliente = clientes.find(c => c.id === form.clienteId);
    const clientNombre = cliente ? cliente.nombre : "";
    const total = Number(form.montoPorPago) * Number(form.pagosTotales);

    // create loan
    const prestamosCol = collection(db, "prestamos");
    const loanRef = await addDoc(prestamosCol, {
      clienteId: form.clienteId,
      clienteNombre: clientNombre,
      montoPrestado: Number(form.montoPrestado),
      pagosTotales: Number(form.pagosTotales),
      montoPorPago: Number(form.montoPorPago),
      total,
      fechaInicio: form.fechaInicio,
      pagosRealizados: 0,
      activo: true
    });

    // create payments for each quincena (15 días)
    const pagosCol = collection(db, "pagos");
    const promises = [];
    for (let i = 1; i <= Number(form.pagosTotales); i++) {
      const fechaPago = addDaysISO(form.fechaInicio, (i - 1) * 15);
      promises.push(addDoc(pagosCol, {
        prestamoId: loanRef.id,
        clienteId: form.clienteId,
        clienteNombre: clientNombre,
        numeroPago: i,
        fechaPago,
        monto: Number(form.montoPorPago),
        pagado: false
      }));
    }
    await Promise.all(promises);

    // reset
    setForm({
      clienteId: "",
      montoPrestado: 0,
      pagosTotales: 1,
      montoPorPago: 0,
      fechaInicio: new Date().toISOString().slice(0,10)
    });
    setShow(false);
  };

  return (
    <div>
      <div className="d-flex justify-content-between mb-3">
        <h4>Préstamos</h4>
        <Button onClick={() => setShow(true)}>Nuevo préstamo</Button>
      </div>

      <div className="table-responsive-container">
        <Table striped>
          <thead><tr><th>Cliente</th><th>Monto</th><th>Pagos</th><th>Por pago</th><th>Inicio</th><th>Estado</th></tr></thead>
          <tbody>
          {prestamos.map(p => (
            <tr key={p.id}>
              <td>{p.clienteNombre}</td>
              <td>{p.montoPrestado}</td>
              <td>{p.pagosRealizados} / {p.pagosTotales}</td>
              <td>{p.montoPorPago}</td>
              <td>{p.fechaInicio}</td>
              <td>{p.activo ? "Activo" : "Cerrado"}</td>
            </tr>
          ))}
        </tbody>
        </Table>
      </div>

      <Modal show={show} onHide={() => setShow(false)}>
        <Form onSubmit={handleAddPrestamo}>
          <Modal.Header closeButton><Modal.Title>Nuevo préstamo</Modal.Title></Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-2">
              <Form.Label>Cliente</Form.Label>
              <Form.Select required value={form.clienteId} onChange={e => setForm({...form, clienteId: e.target.value})}>
                <option value="">-- seleccionar --</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Monto prestado (principal)</Form.Label>
              <Form.Control type="number" required value={form.montoPrestado} onChange={e => setForm({...form, montoPrestado: e.target.value})} />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Pagos totales</Form.Label>
              <Form.Control type="number" min="1" required value={form.pagosTotales} onChange={e => setForm({...form, pagosTotales: e.target.value})} />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Monto por pago</Form.Label>
              <Form.Control type="number" required value={form.montoPorPago} onChange={e => setForm({...form, montoPorPago: e.target.value})} />
              <Form.Text className="text-muted">Si hay interés, pon aquí el importe real de cada quincena (ej. 100).</Form.Text>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Fecha inicio</Form.Label>
              <Form.Control type="date" required value={form.fechaInicio} onChange={e => setForm({...form, fechaInicio: e.target.value})} />
            </Form.Group>

          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShow(false)}>Cancelar</Button>
            <Button type="submit">Crear préstamo (genera pagos)</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
