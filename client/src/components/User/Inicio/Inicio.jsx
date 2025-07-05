import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Insignia from '/sanJuan.png';
import { Search, BookOpenCheck } from 'lucide-react';

const API_BASE = 'https://birecam.onrender.com';

const Inicio = () => {
  const [libros, setLibros] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [libroSeleccionado, setLibroSeleccionado] = useState(null);
  const [pendientes, setPendientes] = useState([]);

  useEffect(() => {
    const obtenerLibros = async () => {
      try {
        const res = await axios.get(`${API_BASE}/stock/grouped`);
        console.log(res.data);
        setLibros(res.data);
      } catch (error) {
        console.error('Error al obtener libros:', error);
      }
    };
    obtenerLibros();
  }, []);

  useEffect(() => {
  const usuario = JSON.parse(localStorage.getItem('user'));
  if (!usuario?.dni) return;

  const obtenerPendientes = async () => {
    try {
      const res = await axios.get(`${API_BASE}/loan/pendiente/${usuario.dni}`);
      setPendientes(res.data);
    } catch (error) {
      console.error('Error al obtener libros pendientes:', error);
    }
  };

  obtenerPendientes();
}, []);

  const librosFiltrados = libros.filter((libro) => {
    const texto = `${libro.titulo} ${libro.autor_completo} ${libro.descripcion}`.toLowerCase();
    return texto.includes(busqueda.toLowerCase());
  });

  const handleReservarClick = (libro) => {
    setLibroSeleccionado(libro);
    setModalVisible(true);
  };

  const confirmarReserva = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    const diasPrestamo = parseInt(localStorage.getItem('diasPrestamo')) || 1;
    const librosMaximos = parseInt(localStorage.getItem('librosMaximos')) || 1;

    // Validar máximo de préstamos pendientes
    if (pendientes.length >= librosMaximos) {
      alert(`Ya tienes ${librosMaximos} préstamo(s) activo(s). No puedes reservar más libros.`);
      return;
    }

    const fechaHoy = new Date();
    const fechaDevolucion = new Date(fechaHoy);
    fechaDevolucion.setDate(fechaHoy.getDate() + diasPrestamo);
    await axios.post(`${API_BASE}/loan/request`, {
      dni: user?.dni,
      codigo_libro: libroSeleccionado.codigo_libro,
      fecha_devolucion: fechaDevolucion.toISOString().split('T')[0],
      tipo_destino: 'aula',
      observaciones: `uso estándar por ${diasPrestamo} día(s)`
    });

    alert('Reserva registrada correctamente');
    setModalVisible(false);
  } catch (error) {
    console.error('Error al reservar:', error);
    alert('No se pudo completar la reserva');
  }
};

  return (
    <div className="pt-16 h-screen overflow-hidden flex w-full">
      {/* Panel izquierdo */}
      <div className="w-1/4 bg-gray-100 p-4 border-r border-gray-300 flex flex-col items-center">
        <img src={Insignia} alt="Insignia" className="md:w-32 lg:w-40 w-auto h-auto mb-4 pt-5" />
        <div className="text-center">
          <p className="text-2xl font-semibold">Horario de atención</p>
          <p className="text-lg">de 8am - 4pm</p>
        </div>
        <div className="mt-6 w-full">
  <h3 className="text-lg font-semibold text-gray-700 mb-2 text-center">Por entregar</h3>
  {pendientes.length > 0 ? (
    <ul className="text-sm space-y-2 px-2 max-h-72 overflow-y-auto">
      {pendientes.map((p) => (
        <li
          key={p.id_prestamo}
          className={`border p-2 rounded shadow-sm ${
            p.estado === 'retrasado' ? 'bg-red-100 border-red-400' : 'bg-yellow-100 border-yellow-400'
          }`}
        >
          <p className="font-medium">{p.libro}</p>
          <p className="text-xs">
            {p.estado === 'retrasado'
              ? `Atrasado por ${Math.abs(p.dias_restantes)} día(s)`
              : `Faltan ${p.dias_restantes} día(s)`}
          </p>
        </li>
      ))}
    </ul>
  ) : (
    <p className="text-sm text-gray-500 text-center">No tienes libros por entregar</p>
  )}
</div>
      </div>

      {/* Panel derecho */}
      <div className="flex-1 pl-5 pt-10 pr-5 overflow-auto">
        <h2 className="text-2xl font-bold text-yellow-600 mb-4">Buscar libros</h2>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por título, autor o palabras clave..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 p-2 border border-yellow-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-300"
          />
        </div>

        <table className="w-full text-left border border-gray-300 rounded-lg overflow-hidden">
          <thead className="bg-yellow-400 text-white">
            <tr>
              <th className="p-2">Título</th>
              <th className="p-2">Autor</th>
              <th className="p-2">Descripción</th>
              <th className="p-2 text-center">Disponibles</th>
              <th className="p-2 text-center">Reservar</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {librosFiltrados.length > 0 ? (
              librosFiltrados.map((libro) => (
                <tr key={libro.codigo_libro} className="border-t hover:bg-yellow-50">
                  <td className="p-2">{libro.titulo}</td>
                  <td className="p-2">{libro.autor_completo}</td>
                  <td className="p-2 text-sm text-gray-700">{libro.descripcion}</td>
                  <td className="p-2 text-center">
                    <span className={`font-bold ${libro.disponibles > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {libro.total_disponibles}
                    </span>
                  </td>
                  <td className="p-2 text-center">
                    <button
                      onClick={() => handleReservarClick(libro)}
                      className="bg-yellow-400 hover:bg-yellow-500 text-white py-1 px-3 rounded-lg text-sm disabled:opacity-50"
                      disabled={libro.disponibles === 0}
                    >
                      <BookOpenCheck className="inline-block mr-1" size={16} />
                      Reservar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  No se encontraron libros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de confirmación */}
      {modalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Confirmar reserva</h2>
            <p className="mb-4">
              ¿Deseas reservar <strong>{libroSeleccionado.titulo}</strong> de <strong>{libroSeleccionado.autor_nombre} {libroSeleccionado.autor_apellido}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModalVisible(false)}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarReserva}
                className="px-4 py-2 rounded bg-yellow-500 text-white hover:bg-yellow-600"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inicio;
