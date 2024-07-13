import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './views/LoginPage/LoginPage';
import RegisterPage from './views/RegisterPage/RegisterPage';
import MainPage from './views/MainPage/MainPage';
import ProtectedRoute from './utils/ProtectedRoute';

const App = () => {
  const currentUser = localStorage.getItem('currentUser');

  return (
    <Router>
      <Routes>
        <Route path="/login" element={currentUser ? <Navigate to="/" /> : <LoginPage />} />
        <Route path="/register" element={currentUser ? <Navigate to="/" /> : <RegisterPage />} />
        <Route path="/" element={<ProtectedRoute element={MainPage} />} />
      </Routes>
    </Router>
  );
};

export default App;
