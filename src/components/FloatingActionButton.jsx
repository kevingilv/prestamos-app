import React from 'react';
import { Button } from 'react-bootstrap';

export default function FloatingActionButton({ onClick, icon }) {
  return (
    <Button
      variant="primary"
      className="fab-button"
      onClick={onClick}
      aria-label="Floating Action Button"
    >
      {icon}
    </Button>
  );
}
