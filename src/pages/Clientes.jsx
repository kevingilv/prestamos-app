import React, { useEffect, useState } from "react";
import { Button, Table, Modal, Form, Row, Col } from "react-bootstrap";
import { UserOutlined, PhoneOutlined, CreditCardOutlined, BankOutlined, EyeOutlined, SaveOutlined, PlusOutlined, EditOutlined } from "@ant-design/icons"; 
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { formatCardNumber, formatPhoneNumber, allowOnlyLetters, allowOnlyNumbers, toCamelCase } from "../utils/helpers";
import FloatingActionButton from '../components/FloatingActionButton'; 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import the CSS for react-toastify

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentClient, setCurrentClient] = useState(null); // To hold the client data being viewed/edited
  const [isEditing, setIsEditing] = useState(false); // To control edit mode
  const [isFormChanged, setIsFormChanged] = useState(false); // To track if any changes were made
  const [initialFormData, setInitialFormData] = useState({}); // To store original data for comparison

  // Default form structure for new clients
  const defaultFormState = {
    nombres: "",
    apPaterno: "",
    apMaterno: "",
    telefono: "",
    numTarjetaCuenta: "",
    banco: "",
  };

  const [form, setForm] = useState(defaultFormState);

  useEffect(() => {
    const q = query(collection(db, "clientes"), orderBy("nombres"));
    const unsub = onSnapshot(q, (snap) => {
      setClientes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentClient) { // Adding a new client
      await addDoc(collection(db, "clientes"), { ...form, fechaRegistro: new Date().toISOString() });
      toast.success("Cliente agregado exitosamente!"); // Success toast for adding
      cleanModalState();
    } else if (isEditing && isFormChanged) { // Editing an existing client
      const clientRef = doc(db, "clientes", currentClient.id);
      await updateDoc(clientRef, form); // Update only the fields in the form state
      toast.success("Cliente actualizado exitosamente!"); // Success toast for updating
      cleanModalState();
    }
  };

  const cleanModalState = () => {
    setShowModal(false);
    setCurrentClient(null);
    setIsEditing(false);
    setIsFormChanged(false);
    setInitialFormData({});
    setForm(defaultFormState); // Reset form to default
  };

  /*
  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este cliente?")) return;
    await deleteDoc(doc(db, "clientes", id));
  };
  */

  const handleViewClient = (client) => {
    setCurrentClient(client);
    setForm({ ...client }); 
    setInitialFormData({ ...client }); 
    setIsEditing(false);
    setIsFormChanged(false); 
    setShowModal(true);
  };

  const handleNewClient = () => {
    setCurrentClient(null); 
    setForm(defaultFormState);
    setInitialFormData({});
    setIsEditing(true); 
    setIsFormChanged(false); 
    setShowModal(true);
  };

  const handleEditToggle = (e) => {
    setIsEditing(e.target.checked);
    if (e.target.checked) {
      setIsFormChanged(true); // If we start editing, consider it changed
    } else {
      // If unchecking edit, revert form to original data and reset changed status
      setForm({ ...initialFormData });
      setIsFormChanged(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setForm(prevForm => {
      const updatedForm = { ...prevForm, [name]: newValue };
      const changed = Object.keys(initialFormData).some(key => {
        return JSON.stringify(updatedForm) !== JSON.stringify(initialFormData);
      });
      setIsFormChanged(changed);
      return updatedForm;
    });
  };

  const handlePhoneBlur = () => {
    const formattedPhone = formatPhoneNumber(form.telefono);
    setForm({ ...form, telefono: formattedPhone });
    // Check for change after formatting
    if (formattedPhone !== initialFormData.telefono) {
      setIsFormChanged(true);
    }
  };

  const handleCardBlur = () => {
    const formattedCard = formatCardNumber(form.numTarjetaCuenta);
    setForm({ ...form, numTarjetaCuenta: formattedCard });
    // Check for change after formatting
    if (formattedCard !== initialFormData.numTarjetaCuenta) {
      setIsFormChanged(true);
    }
  };

  const handleNameBlur = (fieldName) => {
    const camelCasedValue = toCamelCase(form[fieldName]);
    setForm({ ...form, [fieldName]: camelCasedValue });
    // Check for change after formatting
    if (camelCasedValue !== initialFormData[fieldName]) {
      setIsFormChanged(true);
    }
  };

  const isSaveButtonDisabled = !isEditing || !isFormChanged;

  return (
    
    <div>
      <div className="d-flex justify-content-between mb-3 align-items-center">
        <h4 className="d-flex align-items-center">
          <UserOutlined style={{ marginRight: '8px', fontSize: '1em' }} /> 
          Clientes
        </h4>
      </div>

      <div className="table-responsive-container">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Nombre(s)</th>
              <th>Apellidos</th>
              <th>Teléfono</th>
              <th>Tarjeta/Cuenta</th>
              <th>Banco</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
          {clientes.map(c => (
            <tr key={c.id}>
              <td>{c.nombres}</td>
              <td>{c.apPaterno} {c.apMaterno}</td>
              <td>{formatPhoneNumber(c.telefono)}</td>
              <td>{formatCardNumber(c.numTarjetaCuenta)}</td>
              <td>{c.banco}</td>
              <td>
                <Button variant="secondary" size="sm" onClick={() => handleViewClient(c)} className="me-2">
                  <EyeOutlined /> Ver
                </Button>
                {/* <Button variant="danger" size="sm" onClick={() => handleDelete(c.id)}>
                  Eliminar
                </Button> */}
              </td>
            </tr>
          ))}
        </tbody>
        </Table>
      </div>

      <FloatingActionButton onClick={handleNewClient} icon={<PlusOutlined />} />

      <Modal show={showModal} onHide={cleanModalState} size="md">
        <Form onSubmit={handleSave}>
          <Modal.Header closeButton>
            <Modal.Title>
              {currentClient ? (isEditing ? "Editar Cliente" : "Ver Cliente") : "Nuevo Cliente"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label className="form-label-icon"><UserOutlined /> Nombres</Form.Label>
                  <Form.Control
                    name="nombres"
                    value={form.nombres}
                    onKeyDown={allowOnlyLetters}
                    onBlur={() => handleNameBlur('nombres')}
                    onChange={handleInputChange}
                    required
                    readOnly={!isEditing}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label className="form-label-icon"> Apellido Paterno</Form.Label>
                  <Form.Control
                    name="apPaterno"
                    value={form.apPaterno}
                    onKeyDown={allowOnlyLetters}
                    onBlur={() => handleNameBlur('apPaterno')}
                    onChange={handleInputChange}
                    required
                    readOnly={!isEditing}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label className="form-label-icon"> Apellido Materno</Form.Label>
                  <Form.Control
                    name="apMaterno"
                    value={form.apMaterno}
                    onKeyDown={allowOnlyLetters}
                    onBlur={() => handleNameBlur('apMaterno')}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                  />
                </Form.Group>
              </Col>
            </Row>

            <hr className="hr" />

            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label className="form-label-icon"><PhoneOutlined /> Teléfono</Form.Label>
                  <Form.Control
                    type="tel"
                    name="telefono"
                    value={form.telefono}
                    onKeyDown={allowOnlyNumbers}
                    onChange={handleInputChange}
                    onBlur={handlePhoneBlur}
                    required
                    readOnly={!isEditing}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label className="form-label-icon"><CreditCardOutlined /> Tarjeta/Cuenta</Form.Label>
                  <Form.Control
                    type="tel"
                    name="numTarjetaCuenta"
                    value={form.numTarjetaCuenta}
                    onKeyDown={allowOnlyNumbers}
                    onChange={handleInputChange}
                    onBlur={handleCardBlur}
                    required
                    readOnly={!isEditing}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label className="form-label-icon"><BankOutlined /> Banco</Form.Label>
                  <Form.Control
                    name="banco"
                    value={form.banco}
                    onKeyDown={allowOnlyLetters}
                    onBlur={() => handleNameBlur('banco')}
                    onChange={handleInputChange}
                    required
                    readOnly={!isEditing}
                  />
                </Form.Group>
              </Col>
            </Row>

            {currentClient && ( // Only show edit toggle if viewing an existing client
             
              <div className="d-flex">
                <Form.Check
                  type="checkbox"
                  label="¿Editar datos del cliente?"
                  checked={isEditing}
                  onChange={handleEditToggle}
                />
                <EditOutlined />
              </div>
                  
          
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={cleanModalState}>
              {isEditing ? "Cancelar" : "Cerrar"}
            </Button>
            <Button variant="primary" type="submit" disabled={isSaveButtonDisabled}>
              <SaveOutlined /> Guardar
            </Button>
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
