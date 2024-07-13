import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../LoginPage/LoginPage.css'; // Ensure to move the CSS content to this file or use a CSS-in-JS solution

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8000/api/auth/register', { email, password });
      navigate('/login');
      console.log(res);
      alert("Successfully Registered");
    } catch (err) {
      setErrMsg(err.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-box">
        <img src="logo.png" alt="Logo" className="logo" />
        <h1>Register</h1>
        <form onSubmit={handleRegister}>
          <p>
            <input
              type="text"
              placeholder="E-mail address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </p>
          <p>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </p>
          {errMsg && <p className="error">{errMsg}</p>}
          <p>
            <button type="submit" className="signin-button">
              Register
            </button>
          </p>
        </form>
        <p style={{ color: 'white' }}>
          Already have an account? <span className="login-link" onClick={() => navigate('/login')}>Sign In</span>
        </p>
      </div>
      <footer>Built by Emir Asal © 2024</footer>
    </div>
  );
};

export default RegisterPage;
