import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FormPage from './FormPage';
import SuccessPage from './SuccessPage';

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<FormPage />} />
      <Route path="/success" element={<SuccessPage />} />
    </Routes>
  </Router>
);

export default App;
