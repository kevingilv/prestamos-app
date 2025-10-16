import React, { useEffect, useState } from "react";
import { Button, Table, Modal, Form, ListGroup } from "react-bootstrap";
import { UserOutlined, DollarCircleOutlined, ScheduleOutlined, PlusOutlined, CreditCardOutlined, NotificationOutlined } from "@ant-design/icons";
import { db } from "../services/firebase";
import { collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import { formatCardNumber } from "../utils/helpers";
import FloatingActionButton from '../components/FloatingActionButton'; 
import { ToastContainer, toast } from 'react-toastify';

/*
prestamos: [{
      clienteId: "",
      fechaGeneracion: "",
      fechaPrimerPago: "",
      prestamo: 0,
      numTarjetaCuenta: '',
      plazo: {
        pagos: 0, 
        monto: 0    
      },
      totalPagar: 0,
      saldoPendiente: 0,
      esIndividual: false,
      finalizado: false,
      pagos: [{
          numPago: 0,
          fechaPago: "",
          pagado: false
      }]
    }]


*/

const defaultLoanFormState = {
    clienteId: "",
    nombreCompleto: "",
    fechaGeneracion: new Date().toISOString().split('T')[0],
    fechaPrimerPago: "",
    prestamo: 0,
    numTarjetaCuenta: '',
    plazo: {
      pagos: 0, 
      monto: 0    
    },
    totalPagar: 0,
    saldoPendiente: 0,
    esIndividual: false,
    finalizado: false,
    pagos: [{
        numPago: 0,
        fechaPago: "",
        pagado: false
    }]
};
/*  TODO: paymentTable
    - Completar toda la tabla de montos y plazos
    - Meter este json en un archivo aparte y exportarlo
*/
const paymentTable = [
    {
      prestamo: 1000,
      plazos: [
      {
        pagos: 6,
        monto: 233,
      },
      {
        pagos: 8,
        monto: 182,
      },
      { 
        pagos: 10,
        monto: 153,
      },
      { 
        pagos: 12,
        monto: 133,
      },
      { 
        pagos: 14,
        monto: 119,
      },
      { 
        pagos: 16,
        monto: 100
      }]
    },
    {
      prestamo: 1500,
      plazos: [
      {
        pagos: 6, 
        monto: 350,
      },
      {
        pagos: 8,
        monto: 273,
      },
      { 
        pagos: 10,
        monto: 228,
      },
      { 
        pagos: 12,
        monto: 195,
      },
      { 
        pagos: 14,
        monto: 176,
      },
      { 
        pagos: 16,
        monto: 157
      }]
    },
  
  ];

export default function Prestamos() {
  const [clientes, setClientes] = useState([]);
  const [prestamos, setPrestamos] = useState([]);
  const [show, setShow] = useState(false);
  const [clienteInput, setClienteInput] = useState("");
  const [sugerencias, setSugerencias] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [form, setForm] = useState(defaultLoanFormState);
  const [plazos, setPlazos] = useState([]);

  /*
  function test(){
      console.log('clientes',clientes);
      console.log('prestamos',prestamos);
  }*/

  useEffect(() => {
    const q1 = query(collection(db, "clientes"), orderBy("nombres", "asc"));
    const unsub1 = onSnapshot(q1, snap => setClientes(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const q2 = query(collection(db, "prestamos"), orderBy("fechaGeneracion", "desc"));
    const unsub2 = onSnapshot(q2, snap => setPrestamos(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

    return () => { unsub1(); unsub2(); };
  }, []);

  const handleAddPrestamo = async (e) => {
    e.preventDefault();
    // find client name
    const cliente = clientes.find(c => c.id === form.clienteId);
    const nombreCompleto = cliente ?
       cliente.nombres + ' ' + cliente.apPaterno + ' ' + cliente.apMaterno 
       : ""; 
    //const total = Number(form.montoPorPago) * Number(form.pagosTotales);



    // create loan
    const prestamosCol = collection(db, "prestamos");
    /*const loanRef = await addDoc(prestamosCol, {
      clienteId: form.clienteId,
      clienteNombre: clientNombre,
      prestamo: Number(form.prestamo),
      pagosTotales: Number(form.pagosTotales),
      montoPorPago: Number(form.montoPorPago),
      total,
      fechaPrimerPago: form.fechaPrimerPago,
      pagosRealizados: 0,
      activo: true
    });*/

    const loanRef = await addDoc(prestamosCol, {
      clienteId: form.clienteId,
      nombreCompleto,
      fechaGeneracion: new Date().toISOString().split('T')[0],
      fechaPrimerPago: '',
      prestamo: Number(form.prestamo),
      numTarjetaCuenta: form.numTarjetaCuenta,
      plazo: form.plazo,
      totalPagar: form.plazo.pagos * form.plazo.monto,
      saldoPendiente: (form.plazo.pagos * form.plazo.monto) - form.plazo.monto,
      esIndividual: false,
      finalizado: false,
      pagos: [{
          numPago: 0,
          fechaPago: "",
          pagado: false
      }]
    });

    /*
      TODO: 
        👻 Validar si es mejor crear los pagos dentro de otra colección al igual que el prestamo 
        🧡 Meter esta logica dentro de una Cloud Function ?
    */

    // create payments for each quincena (15 días)
    /*const pagosCol = collection(db, "pagos");
    const promises = [];
    for (let i = 1; i <= Number(form.pagosTotales); i++) {
      const fechaPago = addDaysISO(form.fechaPrimerPago, (i - 1) * 15);
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
    await Promise.all(promises);*/

    toast.success('Préstamo creado con éxito');

    // reset
    setForm(defaultLoanFormState);
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

  const selectMonto = (monto) => {
    const selected = paymentTable.find(p => p.prestamo === Number(monto));
    setForm({ ...form, prestamo: selected.prestamo});
    setPlazos(selected.plazos);
  }

  const selectPlazo = (plazo) => {
    const selected = plazos.find(p => p.pagos === Number(plazo));
    setForm({ ...form, plazo: selected });
  };

  return (
    <div>
      <div className="d-flex justify-content-between mb-3 align-items-center"> {/* Added align-items-center */}
          <h4 className="d-flex align-items-center"> {/* Added d-flex and align-items-center */}
            <CreditCardOutlined style={{ marginRight: '8px', fontSize: '1em' }} />
            Préstamos
          </h4>
        </div>
      

      <div className="table-responsive-container">
        <Table striped>
          <thead><tr><th>Cliente</th><th>Monto</th><th>Pagos</th><th>Pago Quicenal</th><th>Primer Pago</th><th>Fecha Generación</th><th>Estado</th><th>Notificar</th></tr></thead>
          <tbody>
          {prestamos.map(p => (
            <tr key={p.id}>
              <td>{p.nombreCompleto}</td>
              <td>{p.prestamo}</td>
              <td>{p.plazo.pagos} </td>
              <td>${p.plazo.monto}</td>
              <td>{p.fechaPrimerPago}</td>
              <td>{p.fechaGeneracion}</td>
              <td>{p.finalizado ? 
                <span class="badge text-bg-secondary">Cerrado</span> :
                <span class="badge text-bg-success">Activo</span>}
              </td>
              <td><Button variant="outline-primary" size="sm" disabled><NotificationOutlined /></Button></td>
            </tr>
          ))}
        </tbody>
        </Table>
      </div>

      {/* Floating Action Button for adding new loan */}
      <FloatingActionButton onClick={() => setShow(true)} icon={<PlusOutlined />} />

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
              <DollarCircleOutlined /> Monto
              <select class="form-select" aria-label="Monto"  onChange={e => selectMonto(e.target.value)} >
                <option selected>Seleccionar...</option>
                  {paymentTable.map(p => (
                  <option key={p.prestamo} value={p.prestamo}>{p.prestamo}</option>
                ))}
              </select>
            </Form.Group>

            <Form.Group className="mb-2">
              <ScheduleOutlined /> Pagos
              <select class="form-select" aria-label="Pagos" onChange={e => selectPlazo(e.target.value)} >
                <option selected>Seleccionar...</option>
                {plazos.map(plazo => (
                  <option key={plazo.pagos} value={plazo.pagos}>{plazo.pagos} pagos de ${plazo.monto} </option>
                ))}
              </select>
            </Form.Group>
            {/*<Form.Group className="mb-2">
              <Form.Label className="form-label-icon">
                <DollarCircleOutlined /> Monto
              </Form.Label>
              <Form.Control type="number" required value={form.prestamo} onChange={e => setForm({...form, prestamo: e.target.value})} />
            </Form.Group>*/}
            {/*<Form.Group className="mb-2">
              <Form.Label className="form-label-icon">
                <ScheduleOutlined /> Pagos
              </Form.Label>
              <Form.Control type="number" min="1" required value={form.pagosTotales} onChange={e => setForm({...form, pagosTotales: e.target.value})} />
            </Form.Group>*/}

          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShow(false)}>Cancelar</Button>
            <Button type="submit">Guardar</Button>
          </Modal.Footer>
        </Form>
      </Modal>
       <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        />
    </div>
  );
}
