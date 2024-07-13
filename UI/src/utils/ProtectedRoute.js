import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element: Component, ...rest }) => {
  const isAuthenticated = !!JSON.parse(localStorage.getItem("currentUser"));

  return isAuthenticated ? <Component {...rest} /> : <Navigate to="/login" />;
};
 
export default ProtectedRoute;
