import React from 'react';
import { Spinner } from 'react-bootstrap';
import './Loading.css';

const Loading = ({ spinning }) => {
  if (!spinning) {
    return null;
  }

  return (
    <div className="loading-overlay">
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  );
};

export default Loading;
