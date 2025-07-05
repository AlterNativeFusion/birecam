import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'https://birecam.onrender.com';

const PrestamoFormulario = ({ onClose, onSuccess }) => {
  const [prestamoData, setPrestamoData] = useState({
    dni: '',
    codigo_libro: '',
    fecha_devolucion: '',
    tipo_destino: '',
  });

  const [nombreUsuario, setNombreUsuario] = useState('');
  const [libros, setLibros] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  

  useEffect(() => {
    const obtenerUsuarioPorDni = async () => {
      if (prestamoData.dni.length === 8) {
        try {
          const res = await axios.get(`${API_BASE}/users/${prestamoData.dni}`);
          const { nombres, apellidos } = res.data;
          console.log("Respuesta del backend:", res.data);
          setNombreUsuario(`${nombres} ${apellidos}`);
        } catch (error) {
          console.error('Usuario no encontrado:', error);
          setNombreUsuario('No encontrado');
        }
      } else {
        setNombreUsuario('');
      }
    };

    obtenerUsuarioPorDni();
  }, [prestamoData.dni]);

  useEffect(() => {
    const fetchLibros = async () => {
      try {
        const res = await axios.get(`${API_BASE}/stock/grouped`);
        setLibros(res.data);
      } catch (error) {
        console.error('Error cargando libros:', error);
      }
    };
    fetchLibros();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/loan/request`, prestamoData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error al registrar préstamo:', error);
      alert('No se pudo registrar el préstamo.');
    }
  };

  const handleSeleccionLibro = (libro) => {
    setPrestamoData({ ...prestamoData, codigo_libro: libro.codigo_libro });
  };

  const librosFiltrados = libros.filter(
    (libro) =>
      libro.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      libro.codigo_libro.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow mb-6">
      <h2 className="text-lg font-semibold mb-4">Nuevo Préstamo</h2>

      {/* DNI */}
      <div className="mb-4">
        <label className="block text-sm font-medium">DNI del usuario:</label>
        <input
          type="text"
          value={prestamoData.dni}
          onChange={(e) => setPrestamoData({ ...prestamoData, dni: e.target.value })}
          className="w-full border border-gray-300 rounded px-3 py-2"
          required
        />
      </div>

      {/* Nombre de usuario */}
      {prestamoData.dni.length === 8 && (
        <div className="mb-4">
          <label className="block text-sm font-medium">Nombre del usuario:</label>
          <input
            type="text"
            value={nombreUsuario}
            readOnly
            className="w-full border border-gray-200 bg-gray-100 text-gray-700 rounded px-3 py-2"
          />
        </div>
      )}

      {/* Buscar libro */}
      <div className="mb-4">
        <label className="block text-sm font-medium">Buscar libro (título o código):</label>
        <input
          type="text"
          placeholder="Buscar..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>

      {/* Lista de libros */}
      <div className="mb-4 max-h-48 overflow-y-auto border rounded">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-2 py-1">Código</th>
              <th className="px-2 py-1">Título</th>
              <th className="px-2 py-1">Autor</th>
              <th className="px-2 py-1">Disponibles</th>
              <th className="px-2 py-1">Seleccionar</th>
            </tr>
          </thead>
          <tbody>
            {librosFiltrados.map((libro) => (
              <tr key={libro.codigo_libro} className="border-t hover:bg-gray-50">
                <td className="px-2 py-1">{libro.codigo_libro}</td>
                <td className="px-2 py-1">{libro.titulo}</td>
                <td className="px-2 py-1">{libro.autor_completo}</td>
                <td className="px-2 py-1">{libro.total_disponibles}</td>
                <td className="px-2 py-1">
                  <button
                    type="button"
                    onClick={() => handleSeleccionLibro(libro)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Elegir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Libro seleccionado */}
      {prestamoData.codigo_libro && (
        <div className="mb-4 text-sm text-green-700">
          Libro seleccionado: <strong>{prestamoData.codigo_libro}</strong>
        </div>
      )}

      {/* Fecha devolución */}
      <div className="mb-4">
        <label className="block text-sm font-medium">Fecha de devolución:</label>
        <input
          type="date"
          value={prestamoData.fecha_devolucion}
          onChange={(e) => setPrestamoData({ ...prestamoData, fecha_devolucion: e.target.value })}
          className="w-full border border-gray-300 rounded px-3 py-2"
          required
        />
      </div>

      {/* Tipo destino */}
      <div className="mb-4">
        <label className="block text-sm font-medium">Tipo de destino:</label>
        <select
          value={prestamoData.tipo_destino}
          onChange={(e) => setPrestamoData({ ...prestamoData, tipo_destino: e.target.value })}
          className="w-full border border-gray-300 rounded px-3 py-2"
          required
        >
          <option value="">Seleccione</option>
          <option value="aula">Aula</option>
          <option value="domicilio">Domicilio</option>
        </select>
      </div>

      {/* Botones */}
      <div className="flex gap-4">
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Registrar
        </button>
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
};

export default PrestamoFormulario;
