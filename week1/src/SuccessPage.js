import React from 'react';
// import { useLocation, useNavigate   } from 'react-router-dom';
import {useLocation, useNavigate } from 'react-router-dom';


const SuccessPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) return <p>No data submitted. Please fill the form.</p>;

  return (
    <div className="form-container">
      <h2>Submission Successful!</h2>
      <ul>
        {Object.entries(state).map(([key, val]) =>
          key === 'showPassword' ? null : (
            <li key={key}><strong>{key}:</strong> {val}</li>
          )
        )}
      </ul>
      <button onClick={() => navigate('/')}>Go Back</button>
    </div>
  );
};

export default SuccessPage;
