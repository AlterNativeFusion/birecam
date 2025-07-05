import React from 'react';
import { Routes, Route } from 'react-router';
import Navbar from '../components/User/Navbar.jsx';
import Inicio from '../components/User/Inicio/Inicio.jsx';
import Historial from '../components/User/Historial/Historial.jsx';

function AppUser() {
  return (
      <>
        <Navbar />
        <Routes>
          <Route path="/" element={<Inicio/>} />
          <Route path="history" element={<Historial/>} />
        </Routes>
      </>
  );
}

export default AppUser;