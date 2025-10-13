import React, { useEffect, useState } from "react";
import { Button, Table, Modal, Form, ListGroup } from "react-bootstrap";
import { UserOutlined, DollarCircleOutlined, ScheduleOutlined } from "@ant-design/icons";
import { db } from "../services/firebase";
import { collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import { formatCardNumber } from "../utils/helpers";

function addDaysISO(startISO, days) {
  const dt = new Date(startISO);
  dt.setDate(dt.getDate() + days);
  return dt.toISOString().slice(0,10);
}



export default function Prestamos() {
  const [clientes, setClientes] = useState([]);
  const [prestamos, setPrestamos] = useState([]);
  const [show, setShow] = useState(false);
  const [clienteInput, setClienteInput] = useState("");
  const [sugerencias, setSugerencias] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [form, setForm] = useState({
    clienteId: "",
    montoPrestado: 0,
    pagosTotales: 1,
    montoPorPago: 0,
    fechaInicio: new Date().toISOString().slice(0,10),
    numTarjetaCuenta: ''
  });

  /*
  function test(){
      console.log('clientes',clientes);
      console.log('prestamos',prestamos);
  }*/

  useEffect(() => {
    const q1 = query(collection(db, "clientes"), orderBy("nombres", "asc"));
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
      fechaInicio: new Date().toISOString().slice(0,10),
      numTarjetaCuenta: ''
    });
    setClienteInput("");
    setShow(false);
  };

  const handleClienteInputChange = (e) => {
    const value = e.target.value;
    setClienteInput(value);

    if (value.length > 0) {
      const filteredClientes = clientes.filter(c =>
        `${c.nombres} ${c.apPaterno} ${c.apMaterno}`.toLowerCase().includes(value.toLowerCase())
      );
      setSugerencias(filteredClientes);
      setMostrarSugerencias(true);
    } else {
      setSugerencias([]);
      setMostrarSugerencias(false);
      setForm({ ...form, clienteId: '', numTarjetaCuenta: '' });
    }
  };

  const handleSugerenciaClick = (cliente) => {
    setClienteInput(`${cliente.nombres} ${cliente.apPaterno} ${cliente.apMaterno}`);
    setForm({ ...form, clienteId: cliente.id, numTarjetaCuenta: cliente.numTarjetaCuenta });
    setSugerencias([]);
    setMostrarSugerencias(false);
  };

  return (
    <div>
      <div className="d-flex justify-content-between mb-3">
        <h4>Préstamos</h4>
        <Button onClick={() => setShow(true)}>Nuevo préstamo</Button>
        {/*<Button onClick={test}>Test</Button>*/}
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
              <Form.Label className="form-label-icon">
                <UserOutlined /> Cliente
              </Form.Label>
              <Form.Control
                type="text"
                required
                value={clienteInput}
                onChange={handleClienteInputChange}
                onBlur={() => setTimeout(() => setMostrarSugerencias(false), 150)}
                placeholder="Escribe para buscar cliente..."
              />
              {mostrarSugerencias && sugerencias.length > 0 && (
                <ListGroup className="position-absolute" style={{ zIndex: 1000 }}>
                  {sugerencias.map(c => (
                    <ListGroup.Item key={c.id} action onClick={() => handleSugerenciaClick(c)}>
                      {c.nombres} {c.apPaterno} {c.apMaterno}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
               <Form.Text className="text-muted">Tarjeta: {formatCardNumber(form.numTarjetaCuenta)} </Form.Text>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="form-label-icon">
                <DollarCircleOutlined /> Monto
              </Form.Label>
              <Form.Control type="number" required value={form.montoPrestado} onChange={e => setForm({...form, montoPrestado: e.target.value})} />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="form-label-icon">
                <ScheduleOutlined /> Pagos
              </Form.Label>
              <Form.Control type="number" min="1" required value={form.pagosTotales} onChange={e => setForm({...form, pagosTotales: e.target.value})} />
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
