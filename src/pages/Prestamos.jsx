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
/*const paymentTable = [
    {
      prestamo: 1000,
      plazos: [
      { pagos: 6, monto: 233,},
      { pagos: 8, monto: 182,},
      { pagos: 10, monto: 153,},
      { pagos: 12, monto: 133,},
      { pagos: 14, monto: 119,},
      { pagos: 16, monto: 100}]
    },
    {
      prestamo: 1500,
      plazos: [
      { pagos: 6,  monto: 350,},
      { pagos: 8, monto: 273,},
      { pagos: 10, monto: 228,},
      { pagos: 12, monto: 195,},
      { pagos: 14, monto: 176,},
      { pagos: 16, monto: 157}]
    },
    
  ];*/

const PAYMENT_TABLE = [
    {
        prestamo: 1000,
        plazos: [
            { pagos: 6, monto: 233 },
            { pagos: 8, monto: 182 },
            { pagos: 10, monto: 153 },
            { pagos: 12, monto: 133 },
            { pagos: 14, monto: 119 },
            { pagos: 16, monto: 100 },
        ]
    },
    {
        prestamo: 1500,
        plazos: [
            { pagos: 6, monto: 350 },
            { pagos: 8, monto: 273 },
            { pagos: 10, monto: 228 },
            { pagos: 12, monto: 195 },
            { pagos: 14, monto: 176 },
            { pagos: 16, monto: 157 },
        ]
    },
    {
        prestamo: 2000,
        plazos: [
            { pagos: 6, monto: 464 },
            { pagos: 8, monto: 360 },
            { pagos: 10, monto: 299 },
            { pagos: 12, monto: 257 },
            { pagos: 14, monto: 231 },
            { pagos: 16, monto: 205 },
        ]
    },
    {
        prestamo: 2500,
        plazos: [
            { pagos: 6, monto: 577 },
            { pagos: 8, monto: 448 },
            { pagos: 10, monto: 373 },
            { pagos: 12, monto: 319 },
            { pagos: 14, monto: 286 },
            { pagos: 16, monto: 254 },
        ]
    },
    {
        prestamo: 3000,
        plazos: [
            { pagos: 6, monto: 690 },
            { pagos: 8, monto: 535 },
            { pagos: 10, monto: 445 },
            { pagos: 12, monto: 380 },
            { pagos: 14, monto: 341 },
            { pagos: 16, monto: 303 },
        ]
    },
    {
        prestamo: 3500,
        plazos: [
            { pagos: 6, monto: 804 },
            { pagos: 8, monto: 623 },
            { pagos: 10, monto: 518 },
            { pagos: 12, monto: 442 },
            { pagos: 14, monto: 396 },
            { pagos: 16, monto: 352 },
        ]
    },
    {
        prestamo: 4000,
        plazos: [
            { pagos: 6, monto: 915 },
            { pagos: 8, monto: 710 },
            { pagos: 10, monto: 590 },
            { pagos: 12, monto: 504 },
            { pagos: 14, monto: 451 },
            { pagos: 16, monto: 399 },
        ]
    },
    {
        prestamo: 4500,
        plazos: [
            { pagos: 8, monto: 798 },
            { pagos: 10, monto: 663 },
            { pagos: 12, monto: 565 },
            { pagos: 14, monto: 506 },
            { pagos: 16, monto: 449 },
        ]
    },
    {
        prestamo: 5000,
        plazos: [
            { pagos: 8, monto: 885 },
            { pagos: 10, monto: 735 },
            { pagos: 12, monto: 627 },
            { pagos: 14, monto: 561 },
            { pagos: 16, monto: 498 },
        ]
    },
    {
        prestamo: 5500,
        plazos: [
            { pagos: 8, monto: 973 },
            { pagos: 10, monto: 808 },
            { pagos: 12, monto: 689 },
            { pagos: 14, monto: 616 },
            { pagos: 16, monto: 547 },
        ]
    },
    {
        prestamo: 6000,
        plazos: [
            { pagos: 8, monto: 1060 },
            { pagos: 10, monto: 880 },
            { pagos: 12, monto: 750 },
            { pagos: 14, monto: 672 },
            { pagos: 16, monto: 595 },
        ]
    },
    {
        prestamo: 6500,
        plazos: [
            { pagos: 10, monto: 953 },
            { pagos: 12, monto: 812 },
            { pagos: 14, monto: 727 },
            { pagos: 16, monto: 644 },
            { pagos: 18, monto: 583 },
        ]
    },
    {
        prestamo: 7000,
        plazos: [
            { pagos: 10, monto: 1025 },
            { pagos: 12, monto: 874 },
            { pagos: 14, monto: 782 },
            { pagos: 16, monto: 693 },
            { pagos: 18, monto: 627 },
        ]
    },
    {
        prestamo: 7500,
        plazos: [
            { pagos: 10, monto: 1098 },
            { pagos: 12, monto: 935 },
            { pagos: 14, monto: 837 },
            { pagos: 16, monto: 742 },
            { pagos: 18, monto: 672 },
        ]
    },
    {
        prestamo: 8000,
        plazos: [
            { pagos: 10, monto: 1170 },
            { pagos: 12, monto: 997 },
            { pagos: 14, monto: 892 },
            { pagos: 16, monto: 790 },
            { pagos: 18, monto: 716 },
        ]
    }
];

const CALENDAR = [
    {
        nombreMes: "Enero",
        numeroMes: 1,
        cortes: [
            {
                corte: "2025-01-08",
                pago: "2025-01-15"
            },
            {
                corte: "2025-01-23",
                pago: "2025-01-31"
            }
        ]
    },
    {
        nombreMes: "Febrero",
        numeroMes: 2,
        cortes: [
            {
                corte: "2025-02-07",
                pago: "2025-02-15"
            },
            {
                corte: "2025-02-21",
                pago: "2025-02-28"
            }
        ]
    },
    {
        nombreMes: "Marzo",
        numeroMes: 3,
        cortes: [
            {
                corte: "2025-03-07",
                pago: "2025-03-15"
            },
            {
                corte: "2025-03-21",
                pago: "2025-03-31"
            }
        ]
    },
    {
        nombreMes: "Abril",
        numeroMes: 4,
        cortes: [
            {
                corte: "2025-04-08",
                pago: "2025-04-15"
            },
            {
                corte: "2025-04-24",
                pago: "2025-04-30"
            }
        ]
    },
    {
        nombreMes: "Mayo",
        numeroMes: 5,
        cortes: [
            {
                corte: "2025-05-08",
                pago: "2025-05-15"
            },
            {
                corte: "2025-05-23",
                pago: "2025-05-31"
            }
        ]
    },
    {
        nombreMes: "Junio",
        numeroMes: 6,
        cortes: [
            {
                corte: "2025-06-06",
                pago: "2025-06-15"
            },
            {
                corte: "2025-06-24",
                pago: "2025-06-30"
            }
        ]
    },
    {
        nombreMes: "Julio",
        numeroMes: 7,
        cortes: [
            {
                corte: "2025-07-08",
                pago: "2025-07-15"
            },
            {
                corte: "2025-07-23",
                pago: "2025-07-31"
            }
        ]
    },
    {
        nombreMes: "Agosto",
        numeroMes: 8,
        cortes: [
            {
                corte: "2025-08-09",
                pago: "2025-08-15"
            },
            {
                corte: "2025-08-22",
                pago: "2025-08-31"
            }
        ]
    },
    {
        nombreMes: "Septiembre",
        numeroMes: 9,
        cortes: [
            {
                corte: "2025-09-09",
                pago: "2025-09-15"
            },
            {
                corte: "2025-09-23",
                pago: "2025-09-30"
            }
        ]
    },
    {
        nombreMes: "Octubre",
        numeroMes: 10,
        cortes: [
            {
                corte: "2025-10-08",
                pago: "2025-10-15"
            },
            {
                corte: "2025-10-24",
                pago: "2025-10-31"
            }
        ]
    },
    {
        nombreMes: "Noviembre",
        numeroMes: 11,
        cortes: [
            {
                corte: "2025-11-07",
                pago: "2025-11-15"
            },
            {
                corte: "2025-11-21",
                pago: "2025-11-30"
            }
        ]
    },
    {
        nombreMes: "Diciembre",
        numeroMes: 12,
        cortes: [
            {
                corte: "2025-12-09",
                pago: "2025-12-15"
            },
            {
                corte: "2025-12-23",
                pago: "2025-12-31"
            }
        ]
    }
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
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);

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

    console.log('loanRef', loanRef.id);

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
              <td>{p.prestamo}</td>
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
