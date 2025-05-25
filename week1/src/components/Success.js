import React from 'react';
import { useLocation } from 'react-router-dom';

function Success() {
  const { state } = useLocation();

  return (
    <div className="form-container">
      <h2>Submission Successful!</h2>
      <h3>User Details</h3>
      <ul>
        {Object.entries(state).map(([key, val]) => (
          <li key={key}><strong>{key.replace(/([A-Z])/g, ' $1')}:</strong> {val}</li>
        ))}
      </ul>
    </div>
  );
}

export default Success;