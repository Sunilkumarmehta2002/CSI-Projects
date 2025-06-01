import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
import { useNavigate  } from 'react-router-dom';

import './index.css';
const initialState = {
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  password: '',
  showPassword: false,
  phoneCode: '',
  phoneNumber: '',
  country: '',
  city: '',
  pan: '',
  aadhar: '',
};

const FormPage = () => {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [cities, setCities] = useState([]);
  const navigate = useNavigate();

  const countries = {
    India: ['Delhi', 'Mumbai', 'Bangalore'],
    USA: ['New York', 'San Francisco', 'Chicago'],
    UK: ['London', 'Manchester', 'Bristol']
  };

  useEffect(() => {
    if (formData.country) {
      setCities(countries[formData.country]);
      setFormData(prev => ({ ...prev, city: '' }));
    }
  }, [formData.country]);

  const validate = () => {
    let errs = {};
    if (!formData.firstName.trim()) errs.firstName = 'First name is required';
    if (!formData.lastName.trim()) errs.lastName = 'Last name is required';
    if (!formData.username.trim()) errs.username = 'Username is required';
    if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Valid email required';
    if (formData.password.length < 6) errs.password = 'Password must be 6+ characters';
    if (!formData.phoneCode) errs.phoneCode = 'Country code required';
    if (!/^\d{10}$/.test(formData.phoneNumber)) errs.phoneNumber = '10-digit number required';
    if (!formData.country) errs.country = 'Country is required';
    if (!formData.city) errs.city = 'City is required';
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan)) errs.pan = 'Invalid PAN';
    if (!/^\d{12}$/.test(formData.aadhar)) errs.aadhar = 'Aadhar must be 12 digits';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (validate()) {
      navigate('/success', { state: formData });
    }
  };

  return (
    <div className="form-container">
      <h2>User Registration</h2>
      <form onSubmit={handleSubmit} noValidate>
        {[
          ['firstName', 'First Name'],
          ['lastName', 'Last Name'],
          ['username', 'Username'],
          ['email', 'E-mail']
        ].map(([field, label]) => (
          <div key={field}>
            <label>{label}</label>
            <input
              name={field}
              value={formData[field]}
              onChange={handleChange}
              type={field === 'email' ? 'email' : 'text'}
            />
            <span className="error">{errors[field]}</span>
          </div>
        ))}

        <div className="password-container">
          <label>Password</label>
          <input
            type={formData.showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
          <label>
            <input
              type="checkbox"
              name="showPassword"
              checked={formData.showPassword}
              onChange={handleChange}
            />
            Show Password
          </label>
          <span className="error">{errors.password}</span>
        </div>

        <div className="phone-group">
          <div>
            <label>Country Code</label>
            <input
              name="phoneCode"
              value={formData.phoneCode}
              onChange={handleChange}
              placeholder="+91"
            />
            <span className="error">{errors.phoneCode}</span>
          </div>
          <div>
            <label>Phone Number</label>
            <input
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="1234567890"
            />
            <span className="error">{errors.phoneNumber}</span>
          </div>
        </div>

        <label>Country</label>
        <select name="country" value={formData.country} onChange={handleChange}>
          <option value="">Select Country</option>
          {Object.keys(countries).map(country => (
            <option key={country} value={country}>{country}</option>
          ))}
        </select>
        <span className="error">{errors.country}</span>

        <label>City</label>
        <select name="city" value={formData.city} onChange={handleChange}>
          <option value="">Select City</option>
          {cities.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
        <span className="error">{errors.city}</span>

        <label>PAN Number</label>
        <input name="pan" value={formData.pan} onChange={handleChange} placeholder="ABCDE1234F" />
        <span className="error">{errors.pan}</span>

        <label>Aadhar Number</label>
        <input name="aadhar" value={formData.aadhar} onChange={handleChange} placeholder="12 digits" />
        <span className="error">{errors.aadhar}</span>
<button
  type="submit"
  disabled={Object.keys(errors).length !== 0 || Object.values(formData).some(val => val === '')}
>
  Submit
</button>


      </form>
    </div>
  );
};

export default FormPage;
