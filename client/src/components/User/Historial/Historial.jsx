import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = 'https://birecam.onrender.com';

const Historial = () => {
  const [historial, setHistorial] = useState([]);
  const [filtroTitulo, setFiltroTitulo] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  const usuario = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        const res = await axios.get(`${API_BASE}/loan/history/${usuario.dni}`);
        setHistorial(res.data);
      } catch (err) {
        console.error('Error al obtener historial:', err);
      }
    };
    fetchHistorial();
  }, [usuario.dni]);

  const getColorEstado = (estado) => {
    switch (estado) {
      case 'devuelto':
        return 'text-green-600 bg-green-100';
      case 'retrasado':
        return 'text-red-600 bg-red-100';
      case 'en curso':
        return 'text-blue-600 bg-blue-100';
      case 'cancelado':
        return 'text-gray-600 bg-gray-200';
      default:
        return 'text-slate-600 bg-slate-100';
    }
  };

  const prestamosFiltrados = historial.filter((item) =>
    item.titulo.toLowerCase().includes(filtroTitulo.toLowerCase()) &&
    item.estado_actual.toLowerCase().includes(filtroEstado.toLowerCase())
  );

  return (
    <div className="pt-16 h-screen bg-gray-50 p-8 overflow-hidden">
      <div className="max-w-6xl mx-auto bg-white rounded shadow-lg p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800">Historial de Préstamos</h1>
          <div className="flex flex-wrap gap-4 mt-4">
            <input
              type="text"
              placeholder="Filtrar por título"
              className="border border-slate-300 p-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={filtroTitulo}
              onChange={(e) => setFiltroTitulo(e.target.value)}
            />
            <input
              type="text"
              placeholder="Filtrar por estado"
              className="border border-slate-300 p-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-y-auto rounded border border-slate-200">
          <table className="w-full border-collapse text-slate-700">
            <thead className="sticky top-0 bg-yellow-300 text-slate-900 font-semibold z-10">
              <tr>
                <th className="py-3 px-5 border border-yellow-400">Título</th>
                <th className="py-3 px-5 border border-yellow-400">Fecha préstamo</th>
                <th className="py-3 px-5 border border-yellow-400">Fecha devolución</th>
                <th className="py-3 px-5 border border-yellow-400">Fecha entrega</th>
                <th className="py-3 px-5 border border-yellow-400">Estado</th>
              </tr>
            </thead>
            <tbody>
              {prestamosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-slate-600">
                    No hay registros de préstamos.
                  </td>
                </tr>
              ) : (
                prestamosFiltrados.map((p, index) => (
                  <tr
                    key={index}
                    className="hover:bg-yellow-50 transition-colors duration-200"
                  >
                    <td className="border border-yellow-200 px-5 py-3">{p.titulo}</td>
                    <td className="border border-yellow-200 px-5 py-3">{p.fecha_prestamo?.split('T')[0]}</td>
                    <td className="border border-yellow-200 px-5 py-3">{p.fecha_devolucion?.split('T')[0]}</td>
                    <td className="border border-yellow-200 px-5 py-3">
                      {p.fecha_entrega ? p.fecha_entrega.split('T')[0] : (
    <span className="italic text-gray-500">No entregado</span>
  )}
                    </td>
                    <td className="border border-yellow-200 px-5 py-3">
                      <span
                        className={`px-3 py-1 rounded-full font-medium text-sm ${getColorEstado(
                          p.estado_actual
                        )}`}
                      >
                        {p.estado_actual}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Historial;
