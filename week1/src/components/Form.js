// import React, { useState } from 'react';
import React, {useState} from "react";

import { useNavigate } from 'react-router-dom';

const countries = {
  India: ['Delhi', 'Mumbai', 'Chennai'],
  Germany: ['Berlin', 'Munich', 'Hamburg'],
  Australia: ['Sydney', 'Melbourne', 'Brisbane']
};

function Form() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', username: '', email: '', password: '',
    phoneCode: '+91', phoneNumber: '', country: '', city: '',
    pan: '', aadhar: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First Name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last Name is required';
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = 'Valid Email is required';
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!formData.phoneNumber.match(/^\d{10}$/)) newErrors.phoneNumber = 'Phone number must be 10 digits';
    if (!formData.country) newErrors.country = 'Country is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.pan.match(/^[A-Z]{5}[0-9]{4}[A-Z]$/)) newErrors.pan = 'Invalid PAN Number';
    if (!formData.aadhar.match(/^\d{12}$/)) newErrors.aadhar = 'Aadhar must be 12 digits';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) navigate('/success', { state: formData });
  };

  return (
    <div className="form-container">
      <h2>User Registration</h2>
      <form onSubmit={handleSubmit}>
        {['firstName', 'lastName', 'username', 'email'].map(field => (
          <div key={field}>
            <label>{field.replace(/([A-Z])/g, ' $1')}</label>
            <input type="text" name={field} value={formData[field]} onChange={handleChange} />
            {errors[field] && <span className="error">{errors[field]}</span>}
          </div>
        ))}

        <div>
          <label>Password</label>
          <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} />
          <button type="button" onClick={() => setShowPassword(prev => !prev)}>
            {showPassword ? 'Hide' : 'Show'}
          </button>
          {errors.password && <span className="error">{errors.password}</span>}
        </div>

        <div>
          <label>Phone Number</label>
          <input type="text" name="phoneCode" value={formData.phoneCode} onChange={handleChange} style={{ width: '60px' }} />
          <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />
          {errors.phoneNumber && <span className="error">{errors.phoneNumber}</span>}
        </div>

        <div>
          <label>Country</label>
          <select name="country" value={formData.country} onChange={handleChange}>
            <option value="">Select Country</option>
            {Object.keys(countries).map(c => <option key={c}>{c}</option>)}
          </select>
          {errors.country && <span className="error">{errors.country}</span>}
        </div>

        <div>
          <label>City</label>
          <select name="city" value={formData.city} onChange={handleChange}>
            <option value="">Select City</option>
            {formData.country && countries[formData.country].map(city => <option key={city}>{city}</option>)}
          </select>
          {errors.city && <span className="error">{errors.city}</span>}
        </div>

        <div>
          <label>PAN Number</label>
          <input type="text" name="pan" value={formData.pan} onChange={handleChange} />
          {errors.pan && <span className="error">{errors.pan}</span>}
        </div>

        <div>
          <label>Aadhar Number</label>
          <input type="text" name="aadhar" value={formData.aadhar} onChange={handleChange} />
          {errors.aadhar && <span className="error">{errors.aadhar}</span>}
        </div>

        <button type="submit" disabled={!validate()}>Submit</button>
      </form>
    </div>
  );
}

export default Form;
