import React, { useEffect, useState } from "react";
import { Button, Table, Modal, Form, ListGroup } from "react-bootstrap";
import { UserOutlined, DollarCircleOutlined, ScheduleOutlined, PlusOutlined, CreditCardOutlined, NotificationOutlined } from "@ant-design/icons";
import { db } from "../services/firebase";
import { collection, addDoc, onSnapshot, query, orderBy, writeBatch, doc } from "firebase/firestore";
import { formatCardNumber } from "../utils/helpers";
import { generarFechasPagos } from "../functions/pagos";
import FloatingActionButton from '../components/FloatingActionButton';
import { ToastContainer, toast } from 'react-toastify';
import { PAYMENT_TABLE } from "../data/paymentTable";
//import { CALENDAR } from "../data/calendar";
import Loading from '../components/Loading';


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
}


export default function Prestamos() {
  const [clientes, setClientes] = useState([]);
  const [prestamos, setPrestamos] = useState([]);
  const [show, setShow] = useState(false);
  const [clienteInput, setClienteInput] = useState("");
  const [sugerencias, setSugerencias] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [form, setForm] = useState(defaultLoanFormState);
  const [plazos, setPlazos] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRowClick = (loan) => {
    setSelectedLoan(loan);
    setShowDetailsModal(true);
  };

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

    
  async function crearPagosPrestamo(loanRef, montoPorPago, cantidadPagos, fechaSolicitud) {
    const batch = writeBatch(db);
    const pagosCollectionRef = collection(db, "prestamos", loanRef.id, "pagos");
    
    const fechasPagos = generarFechasPagos(fechaSolicitud, cantidadPagos);

    /*for (const pago of fechasPagos) {
        await addDoc(collection(db, "prestamos", loanRef.id, "pagos"), {
          ...pago,
          monto: montoPorPago,
          fechaCreacion: new Date().toISOString(),
        });
      }
    }*/
    
    fechasPagos.forEach((fechaPago) => {
      const pagoDocRef = doc(pagosCollectionRef); // genera ID automático
      batch.set(pagoDocRef, {
        numPago: fechaPago.numPago,
        fechaPago: fechaPago.fechaPago,
        //numPago: index + 1,
        //fechaPago
        monto: Number(montoPorPago), // validar si es necesario
        pagado: fechaPago.pagado || false,
        //fechaCreacion: new Date().toISOString()
        });
    });

    await batch.commit();
    console.log(`✅ ${cantidadPagos} pagos generados correctamente`);
  }



  const handleAddPrestamo = async (e) => {
    e.preventDefault();
    setLoading(true);
    // find client name
    const cliente = clientes.find(c => c.id === form.clienteId);
    const nombreCompleto = cliente ?
       cliente.nombres + ' ' + cliente.apPaterno + ' ' + cliente.apMaterno : ""; 

    //1. crear el prestamo
    const loanRef = await addDoc(collection(db, "prestamos"), {
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
      finalizado: false
    });

    //2. crear los pagos del prestamo
    await crearPagosPrestamo(loanRef, form.plazo.monto, form.plazo.pagos, new Date());

    
    // reset
    setForm(defaultLoanFormState);
    setClienteInput("");
    setShow(false);
    setLoading(false);
  
    toast.success('Préstamo creado con éxito');
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
    const selected = PAYMENT_TABLE.find(p => p.prestamo === Number(monto));
    setForm({ ...form, prestamo: selected.prestamo});
    setPlazos(selected.plazos);
  }

  const selectPlazo = (plazo) => {
    const selected = plazos.find(p => p.pagos === Number(plazo));
    setForm({ ...form, plazo: selected });
  };

  return (
    <div>
      <Loading spinning={loading} />
      <div className="d-flex justify-content-between mb-3 align-items-center"> {/* Added align-items-center */}
          <h4 className="d-flex align-items-center"> {/* Added d-flex and align-items-center */}
            <CreditCardOutlined style={{ marginRight: '8px', fontSize: '1em' }} />
            Préstamos
          </h4>
        </div>
      

      <div className="table-responsive-container">
        <Table striped bordered className="prestamos-table">
          <thead><tr><th>Cliente</th><th>Monto</th><th>Pagos</th><th>Pago Quicenal</th><th>Primer Pago</th><th>Fecha Generación</th><th>Estado</th><th>Notificar</th></tr></thead>
          <tbody>
          {prestamos.map(p => (
            <tr 
              key={p.id} 
              onClick={() => handleRowClick(p)} 
            >
              <td>{p.nombreCompleto}</td>
              <td>${p.prestamo}</td>
              <td>{p.plazo.pagos} </td>
              <td>${p.plazo.monto}</td>
              <td>{p.fechaPrimerPago}</td>
              <td>{p.fechaGeneracion}</td>
              <td>{p.finalizado ? 
                <span className="badge text-bg-secondary">Cerrado</span> :
                <span className="badge text-bg-success">Activo</span>}
              </td>
              <td><Button variant="outline-primary" size="sm" disabled><NotificationOutlined /></Button></td>
            </tr>
          ))}
        </tbody>
        </Table>
      </div>

      {/* Floating Action Button for adding new loan */}
      <FloatingActionButton onClick={() => setShow(true)} icon={<PlusOutlined />} />

      {/* Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Detalles del Préstamo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedLoan && (
            <ListGroup variant="flush">
              <ListGroup.Item><strong>Cliente:</strong> {selectedLoan.nombreCompleto}</ListGroup.Item>
              <ListGroup.Item><strong>Monto del Préstamo:</strong> ${selectedLoan.prestamo}</ListGroup.Item>
              <ListGroup.Item><strong>Plazo:</strong> {selectedLoan.plazo.pagos} pagos de ${selectedLoan.plazo.monto}</ListGroup.Item>
              <ListGroup.Item><strong>Total a Pagar:</strong> ${selectedLoan.totalPagar}</ListGroup.Item>
              <ListGroup.Item><strong>Saldo Pendiente:</strong> ${selectedLoan.saldoPendiente}</ListGroup.Item>
              <ListGroup.Item><strong>Fecha de Generación:</strong> {selectedLoan.fechaGeneracion}</ListGroup.Item>
              <ListGroup.Item><strong>Primer Pago:</strong> {selectedLoan.fechaPrimerPago || 'No definido'}</ListGroup.Item>
              <ListGroup.Item><strong>Estado:</strong> {selectedLoan.finalizado ? 'Cerrado' : 'Activo'}</ListGroup.Item>
            </ListGroup>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

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
                  {PAYMENT_TABLE.map(p => (
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
