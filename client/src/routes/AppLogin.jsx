import React from 'react';
import { Routes, Route } from 'react-router';
import Login from '../components/Login/LoginFormulario.jsx';

function AppLogin() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
    </Routes>
  );
}

export default AppLogin;