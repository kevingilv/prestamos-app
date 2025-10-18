import React, { useState } from 'react';
import { Button, Container, Form, Row, Col} from 'react-bootstrap';
import { PhoneOutlined, CreditCardOutlined } from '@ant-design/icons';
import Stepper from '../components/Stepper';

// Define the content for each step
const Step1Content = () => (
  <div>
    <h4>Buscar cliente</h4>
    <Form>
      < Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Control type="text" placeholder="Escribe para buscar..." />
        </Form.Group>
        <Row className="mb-1">
            <Col> 
                <PhoneOutlined style={{marginRight: "10px"}} />
                <Form.Text className="text-muted">Teléfono:  </Form.Text>
            </Col>
        </Row>
        <Row className="mb-1">
             <Col>
                <CreditCardOutlined style={{marginRight: "10px"}} />
                <Form.Text className="text-muted">Tarjeta: </Form.Text>
            </Col>
        </Row>
    </Form>
  </div>
);

const Step2Content = () => (
  <div>
    <h4>Configura el préstamo</h4>
    <p>Lorem ipsu dolor sit amet.</p>
    <Form.Check 
        type="switch"
        id="custom-switch"
        label="¿Individual?"
      />
  </div>
);

const Step3Content = () => (
    <>
    <h4>Confirmation</h4>
    <div className="text-center">
        <p>John Doe Martinez Lopez $5,000 a 16 pagos quincenales de $600 cada uno a partir del 31 de Octubre de 2025.</p>
    </div>
  </>
);

const StepperExample = () => {
  const [showStepper, setShowStepper] = useState(false);

  const steps = [
    { title: 'Datos', content: <Step1Content /> },
    { title: 'Préstamo', content: <Step2Content /> },
    { title: 'Confirmación', content: <Step3Content /> }
  ];

  return (
    <Container className="mt-5">
      <h2>Stepper Component Example</h2>
      <p>Click the button below to open the stepper modal.</p>
      <Button onClick={() => setShowStepper(true)}>
        Open Stepper
      </Button>

      <Stepper
        show={showStepper}
        onHide={() => setShowStepper(false)}
        steps={steps}
        title="Onboarding Process"
      />
    </Container>
  );
};

export default StepperExample;
