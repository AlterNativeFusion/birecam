import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UsuarioFormulario from './UsuarioFormulario';
import { UserPlus, Edit2, Trash2 } from 'lucide-react';

function Usuarios() {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalEliminarVisible, setModalEliminarVisible] = useState(false);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);

  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);

  const [filtroDNI, setFiltroDNI] = useState('');
  const [filtroNombres, setFiltroNombres] = useState('');
  const [filtroApellidos, setFiltroApellidos] = useState('');

  const API_BASE = 'https://birecam.onrender.com';

  const cargarUsuarios = async () => {
    setCargando(true);
    try {
      const res = await axios.get(`${API_BASE}/users`);
      setUsuarios(res.data);
    } catch (error) {
      console.error('Error al cargar usuarios', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const abrirModal = () => {
    setUsuarioEditando(null);
    setModalVisible(true);
  };

  const cerrarModal = () => setModalVisible(false);

  const usuarioRegistrado = () => {
    cerrarModal();
    cargarUsuarios();
  };

  const manejarEditar = (usuario) => {
    setUsuarioEditando(usuario);
    setModalVisible(true);
  };

  const abrirModalEliminar = (dni) => {
    setUsuarioAEliminar(dni);
    setModalEliminarVisible(true);
  };

  const cerrarModalEliminar = () => {
    setUsuarioAEliminar(null);
    setModalEliminarVisible(false);
  };

  const confirmarEliminar = async () => {
    try {
      await axios.delete(`${API_BASE}/users/${usuarioAEliminar}`);
      cargarUsuarios();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
    } finally {
      cerrarModalEliminar();
    }
  };

   return (
    <div className="pt-16 h-screen bg-gray-50 p-8 overflow-hidden">
      <div className="max-w-7xl mx-auto bg-white rounded shadow-lg p-6">

        {/* Botón registrar arriba, con icono y color suave */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800">Usuarios</h1>
        {/* Filtros */}
        <div className="flex flex-wrap justify-between items-end gap-4">
          <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Filtrar por DNI"
            className="border border-slate-300 p-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            value={filtroDNI}
            onChange={(e) => setFiltroDNI(e.target.value)}
          />
          <input
            type="text"
            placeholder="Filtrar por nombres"
            className="border border-slate-300 p-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            value={filtroNombres}
            onChange={(e) => setFiltroNombres(e.target.value)}
          />
          <input
            type="text"
            placeholder="Filtrar por apellidos"
            className="border border-slate-300 p-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            value={filtroApellidos}
            onChange={(e) => setFiltroApellidos(e.target.value)}
          />
        </div>
        <button
          onClick={abrirModal}
          className="inline-flex items-center gap-2 px-5 py-3 bg-slate-600 text-white rounded shadow hover:bg-slate-700 transition"
        >
          <UserPlus size={20} />
          Registrar Usuario
        </button>
        </div>
         </div>

        {/* Tabla */}
        {cargando ? (
          <p className="text-center text-slate-600">Cargando usuarios...</p>
        ) : usuarios.length === 0 ? (
          <p className="text-center text-slate-600">No hay usuarios registrados.</p>
        ) : (
         <div className="overflow-y-auto rounded border border-slate-200 flex-grow">
  <table className="w-full border-collapse text-slate-700">
    <thead className="sticky top-0 bg-yellow-300 text-slate-900 font-semibold z-10">
      <tr>
        <th className="py-3 px-5 border border-yellow-400">DNI</th>
        <th className="py-3 px-5 border border-yellow-400">Nombres</th>
        <th className="py-3 px-5 border border-yellow-400">Apellidos</th>
        <th className="py-3 px-5 border border-yellow-400">Tipo</th>
        <th className="py-3 px-5 border border-yellow-400">Correo</th>
        <th className="py-3 px-5 border border-yellow-400">Acciones</th>
      </tr>
    </thead>
    <tbody>
      {usuarios
        .filter(
          (u) =>
            u.dni.includes(filtroDNI) &&
            u.nombres.toLowerCase().includes(filtroNombres.toLowerCase()) &&
            u.apellidos.toLowerCase().includes(filtroApellidos.toLowerCase())
        )
        .map((u) => (
          <tr
            key={u.dni}
            className="hover:bg-yellow-50 transition-colors duration-200"
          >
            <td className="border border-yellow-200 px-5 py-3">{u.dni}</td>
            <td className="border border-yellow-200 px-5 py-3">{u.nombres}</td>
            <td className="border border-yellow-200 px-5 py-3">{u.apellidos}</td>
            <td className="border border-yellow-200 px-5 py-3">{u.tipo_usuario}</td>
            <td className="border border-yellow-200 px-5 py-3">{u.correo}</td>
            <td className="border border-yellow-200 px-5 py-3 space-x-2 flex">
              <button
                onClick={() => manejarEditar(u)}
                className="flex items-center gap-1 bg-yellow-400 text-slate-900 px-3 py-1 rounded shadow hover:bg-yellow-500 transition"
                title="Modificar Usuario"
              >
                <Edit2 size={16} />
                Modificar
              </button>
              <button
                onClick={() => abrirModalEliminar(u.dni)}
                className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded shadow hover:bg-red-700 transition"
                title="Eliminar Usuario"
              >
                <Trash2 size={16} />
                Eliminar
              </button>
            </td>
          </tr>
        ))}
    </tbody>
  </table>
</div>
        )}

      </div>

      {/* Modal formulario */}
      {modalVisible && (
        <UsuarioFormulario
          onClose={cerrarModal}
          onUsuarioRegistrado={usuarioRegistrado}
          usuarioParaEditar={usuarioEditando}
        />
      )}

      {/* Modal de confirmación para eliminar */}
      {modalEliminarVisible && (
        <div className="fixed inset-0 backdrop-blur-md bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full text-center">
            <p className="mb-6 text-lg font-semibold text-gray-800">
              ¿Estás seguro de eliminar este usuario?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmarEliminar}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2 rounded-lg transition"
              >
                Confirmar
              </button>
              <button
                onClick={cerrarModalEliminar}
                className="bg-gray-300 hover:bg-gray-400 px-5 py-2 rounded-lg transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Usuarios;
