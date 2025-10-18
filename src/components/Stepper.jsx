import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';

const Stepper = ({ show, onHide, steps, title }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Function to handle closing the modal and resetting the step
  const handleClose = () => {
    setCurrentStep(0); // Reset to the first step
    onHide(); // Call the original onHide function
  };

  const isLastStep = currentStep === steps.length - 1;

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{title || 'Step-by-Step Process'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="stepper-container">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <div className="step-item-container">
                <div
                  className={`step-item ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
                >
                  {index + 1}
                </div>
                <div className="step-title">{step.title}</div>
              </div>
              {index < steps.length - 1 && <div className="step-connector"></div>}
            </React.Fragment>
          ))}
        </div>
        
        {/* Content area with sliding animation */}
        <div className="stepper-content-wrapper">
          <div
            className="stepper-content-inner"
            style={{ transform: `translateX(-${currentStep * 100}%)` }}
          >
            {steps.map((step, index) => (
              <div className="stepper-content-pane" key={index}>
                {step.content}
              </div>
            ))}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleBack} disabled={currentStep === 0}>
          Back
        </Button>
        <Button variant="primary" onClick={isLastStep ? handleClose : handleNext}>
          {isLastStep ? 'Finish' : 'Next'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default Stepper;
