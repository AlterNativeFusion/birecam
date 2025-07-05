import React from 'react';
import { Routes, Route } from 'react-router';
import Navbar from '../components/Admin/Navbar.jsx';
import Inicio from '../components/Admin/Inicio/Inicio.jsx';
import Usuarios from '../components/Admin/Usuario/Usuarios.jsx';
import Inventario from '../components/Admin/Inventario/Inventario.jsx';
import ReporteUsuarios from '../components/Admin/Reportes/ReporteUsuarios.jsx';
import ReportePrestamos from '../components/Admin/Reportes/ReportePrestamos.jsx';
import AjustesReglas from '../components/Admin/Ajustes/AjustesReglas.jsx';


function AppAdmin() {
  return (
      <>
        <Navbar />
        <Routes>
          <Route path="/" element={<Inicio/>} />
          <Route path="/users" element={<Usuarios/>} />
          <Route path="/stock" element={<Inventario/>} />
          <Route path="/report/users" element={<ReporteUsuarios/>} />
          <Route path="/report/loan" element={<ReportePrestamos/>} />
          <Route path="/config" element={<AjustesReglas/>} />
        </Routes>
      </>
  );
}

export default AppAdmin;