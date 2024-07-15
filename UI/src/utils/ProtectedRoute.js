import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element: Component, ...rest }) => {
  const isAuthenticated = document.cookie.split(';').some((cookie) => cookie.trim().startsWith('accessToken='));

  return isAuthenticated ? <Component {...rest} /> : <Navigate to="/login" />;
};
 
export default ProtectedRoute;
