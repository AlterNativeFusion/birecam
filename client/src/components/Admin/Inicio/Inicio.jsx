import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Insignia from '/sanJuan.png';
import { BookCheck, Clock4 } from 'lucide-react';
import PrestamoFormulario from './PrestamoFormulario';

const API_BASE = 'https://birecam.onrender.com';

const Inicio = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [filtroHistorial, setFiltroHistorial] = useState("atrasados");
  const [busqueda, setBusqueda] = useState("");
  const [busquedaPendientes, setBusquedaPendientes] = useState("");
  const [vistaActiva, setVistaActiva] = useState("solicitudes");
  const [showPrestamoFormulario, setShowPrestamoFormulario] = useState(false);

  useEffect(() => {
    fetchSolicitudes();
    fetchHistorial();

    const interval = setInterval(() => {
      fetchSolicitudes();
      fetchHistorial();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchSolicitudes = async () => {
    try {
      const res = await axios.get(`${API_BASE}/loan`);
      setSolicitudes(res.data);
    } catch (error) {
      console.error('Error al obtener solicitudes:', error);
    }
  };

  const fetchHistorial = async () => {
    try {
      const res = await axios.get(`${API_BASE}/loan/history`);
      setHistorial(res.data);
    } catch (error) {
      console.error('Error al obtener historial:', error);
    }
  };
  
const handleAceptar = async (id) => {
  try {
    const adminId = localStorage.getItem('adminId');
    if (!adminId) {
      alert('Error: No se ha identificado al administrador.');
      return;
    }

    await axios.post(`${API_BASE}/loan/update`, {
      id_prestamo: id,
      nuevo_estado: 'aceptado',
      id_admin: parseInt(adminId)
    });

    fetchSolicitudes();
    fetchHistorial();
  } catch (error) {
    console.error('Error al aceptar solicitud:', error);
  }
};

  const handleRechazar = async (id) => {
    try {
      await axios.post(`${API_BASE}/loan/update`, {
        id_prestamo: id,
        nuevo_estado: 'rechazado'
      });
      fetchSolicitudes();
      fetchHistorial();
    } catch (error) {
      console.error('Error al rechazar solicitud:', error);
    }
  };

  const handleDevolver = async (id) => {
    try {
      await axios.post(`${API_BASE}/loan/return`, {
        id_prestamo: id
      });
      fetchSolicitudes();
      fetchHistorial();
    } catch (error) {
      console.error('Error al marcar como devuelto:', error);
    }
  };

  const pendientes = solicitudes
  .filter((s) => s.estado_interno === 'pendiente')
  .filter((s) => {
    const term = busquedaPendientes.trim().toLowerCase();
    return (
      s.usuario?.toLowerCase().includes(term) ||
      s.libro_pedido?.toLowerCase().includes(term)
    );
  });

  const devolucionesPendientes = historial.filter(
    (s) => s.estado_interno === 'aceptado' && !s.devuelto
  );

  const filtradasHistorial = historial
    .map((s) => ({
      ...s,
      fechaDevolucionDate: new Date(s.fecha_devolucion),
      usuarioLower: s.usuario?.toLowerCase() || '',
      libroLower: s.libro_pedido?.toLowerCase() || '',
    }))
    .filter((s) => {
      const hoy = new Date();
      const estado = s.estado_interno?.trim().toLowerCase();

      if (filtroHistorial === "atrasados") {
        return estado === "aceptado" && s.fechaDevolucionDate < hoy;
      } else if (filtroHistorial === "aceptados") {
        return estado === "aceptado";
      }
      return false;
    })
    .filter((s) => {
      const term = busqueda.trim().toLowerCase();
      return s.usuarioLower.includes(term) || s.libroLower.includes(term);
    })
    .sort((a, b) => a.fechaDevolucionDate - b.fechaDevolucionDate);

  return (
    <div className="pt-16 h-screen overflow-hidden flex w-full">
      {/* Panel izquierdo */}
      <div className="w-1/4 bg-gray-100 p-4 border-r border-gray-300 flex flex-col items-center">
        <img src={Insignia} alt="Insignia" className="md:w-32 lg:w-40 w-auto h-auto mb-4 pt-5" />
        <div className="text-center">
          <p className="text-2xl font-semibold">Horario de atención</p>
          <p className="text-lg">de 8am - 4pm</p>
        </div>

        <h2 className="text-lg font-bold mt-6 mb-2">Historial de Solicitudes</h2>

        <div className="flex space-x-2 mb-2">
          {["atrasados", "aceptados"].map((tipo) => (
            <button
              key={tipo}
              onClick={() => setFiltroHistorial(tipo)}
              className={`text-xs px-3 py-1 rounded-full transition-all ${
                filtroHistorial === tipo
                  ? "bg-orange-500 text-white"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
            >
              {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Buscar por usuario o libro"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="text-sm w-full px-2 py-1 mb-2 border border-gray-300 rounded"
        />

        <div className="w-full h-[350px] overflow-y-auto space-y-3 px-1">
          {filtradasHistorial.length === 0 ? (
            <p className="text-sm text-gray-400 text-center mt-4">No hay solicitudes.</p>
          ) : (
            filtradasHistorial.map((item) => (
              <div
                key={item.id_prestamo}
                className="bg-white border border-gray-300 rounded-lg shadow-sm p-3 text-sm"
              >
                <p className="font-semibold">{item.usuario}</p>
                <p>📖 {item.libro_pedido}</p>
                <p>📅 Entrega: {item.fechaDevolucionDate.toLocaleDateString("es-PE")}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Contenido derecho */}
<div className="flex-1 pl-5 pt-10 overflow-auto pr-5">
  <div className="flex gap-4 mb-6">
    <button
      onClick={() => setVistaActiva("solicitudes")}
      className={`px-4 py-2 rounded ${
        vistaActiva === "solicitudes"
          ? "bg-yellow-300 text-slate-900 font-semibold shadow-md"
          : "bg-yellow-100 hover:bg-yellow-200 text-slate-800"
      }`}
    >
      Solicitudes de Préstamo
    </button>
    <button
      onClick={() => setVistaActiva("devoluciones")}
      className={`px-4 py-2 rounded ${
        vistaActiva === "devoluciones"
          ? "bg-yellow-300 text-slate-900 font-semibold shadow-md"
          : "bg-yellow-100 hover:bg-yellow-200 text-slate-800"
      }`}
    >
      Gestión de Devoluciones
    </button>
  </div>

  {vistaActiva === "solicitudes" && (
    <>
      {!showPrestamoFormulario && (
        <button
          onClick={() => setShowPrestamoFormulario(true)}
          className="inline-flex items-center gap-2 px-5 py-2 bg-slate-600 text-white rounded shadow hover:bg-slate-700 transition"
        >
          Registrar Préstamo
        </button>
      )}

      {/* Formulario de préstamo */}
      {showPrestamoFormulario && (
        <PrestamoFormulario
          onClose={() => setShowPrestamoFormulario(false)}
          onSuccess={() => {
            fetchSolicitudes(); 
            fetchHistorial();   
          }}
        />
      )}

      <h1 className="text-3xl font-semibold mt-3 mb-6 text-gray-800">📚 Solicitudes de Préstamo Pendientes</h1>

      <h2 className="mb-4 text-lg font-semibold text-gray-700">
        Total de solicitudes pendientes: {pendientes.length}
      </h2>

      <input
        type="text"
        placeholder="Buscar por usuario o libro"
        value={busquedaPendientes}
        onChange={(e) => setBusquedaPendientes(e.target.value)}
        className="mb-6 px-4 py-2 border rounded w-1/2"
      />

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
          <thead className="bg-yellow-300 text-slate-900 text-sm uppercase font-semibold">
            <tr>
              <th className="px-5 py-3 text-left">Usuario</th>
              <th className="px-5 py-3 text-left">Libro</th>
              <th className="px-5 py-3 text-left">Fecha Préstamo</th>
              <th className="px-5 py-3 text-left">Fecha Devolución</th>
              <th className="px-5 py-3 text-left">Destino</th>
              <th className="px-5 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-sm divide-y divide-gray-200">
            {pendientes.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-400">
                  No hay solicitudes pendientes.
                </td>
              </tr>
            ) : (
              pendientes.map((solicitud) => (
                <tr key={solicitud.id_prestamo} className="hover:bg-gray-50 transition-all">
                  <td className="px-5 py-4 font-medium">{solicitud.usuario}</td>
                  <td className="px-5 py-4 flex items-center gap-2">
                    <BookCheck className="w-4 h-4 text-blue-500" />
                    {solicitud.libro_pedido}
                  </td>
                  <td className="px-5 py-4">
                    {new Date(solicitud.fecha_prestamo).toLocaleDateString('es-PE', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-5 py-4">
                    {new Date(solicitud.fecha_devolucion).toLocaleDateString('es-PE', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-5 py-4 capitalize">{solicitud.tipo_destino}</td>
                  <td className="px-5 py-4 flex gap-2">
                    <button
                      onClick={() => handleAceptar(solicitud.id_prestamo)}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm shadow-md transition"
                    >
                      Aceptar
                    </button>
                    <button
                      onClick={() => handleRechazar(solicitud.id_prestamo)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm shadow-md transition"
                    >
                      Rechazar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  )}

  {vistaActiva === "devoluciones" && (
    <>
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">📚 Gestión de Devoluciones</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
          <thead className="bg-yellow-300 text-slate-900 text-sm uppercase font-semibold">
            <tr>
              <th className="px-5 py-3 text-left">Usuario</th>
              <th className="px-5 py-3 text-left">Libro</th>
              <th className="px-5 py-3 text-left">Fecha Devolución</th>
              <th className="px-5 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-sm divide-y divide-gray-200">
            {devolucionesPendientes.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-6 text-gray-400">
                  No hay devoluciones pendientes 📭
                </td>
              </tr>
            ) : (
              devolucionesPendientes.map((item) => (
                <tr key={item.id_prestamo} className="hover:bg-gray-50 transition-all">
                  <td className="px-5 py-4 font-medium">{item.usuario}</td>
                  <td className="px-5 py-4 flex items-center gap-2">
                    <BookCheck className="w-4 h-4 text-blue-500" />
                    <span>{item.libro_pedido}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Clock4 className="w-4 h-4 text-orange-500" />
                      <span>
                        {new Date(item.fecha_devolucion).toLocaleDateString('es-PE', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => handleDevolver(item.id_prestamo)}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm shadow-md transition"
                    >
                      Marcar como devuelto
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  )}
</div>

    </div>
  );
};

export default Inicio;