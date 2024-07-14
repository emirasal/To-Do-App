import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import './LoginPage.css';
import newRequest from '../../utils/newRequest';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await newRequest.post('/auth/login', { email, password });
      localStorage.setItem('currentUser', JSON.stringify(res.data));
      navigate('/');
    } catch (err) {
      setErrMsg(err.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-box">
        <img src="logo.png" alt="Logo" className="logo" />
        <h1>Sign In</h1>
        <form onSubmit={handleSubmit}>
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
              Sign In
            </button>
          </p>
        </form>
        <p style={{ color: 'white' }}>
          Don't have an account? <span className="register-link" onClick={() => navigate('/register')}>Create Account</span>
        </p>

      </div>
      <footer>Built by Emir Asal © 2024</footer>
    </div>
  );
};

export default LoginPage;
