import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Edit2, Trash2 } from 'lucide-react';
import InventarioFormulario from './InventarioFormulario'; 

function Inventario() {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalEliminarVisible, setModalEliminarVisible] = useState(false);
  const [itemAEliminar, setItemAEliminar] = useState(null);

  const [inventario, setInventario] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [itemEditando, setItemEditando] = useState(null);

  const [filtroTitulo, setFiltroTitulo] = useState('');
  const [filtroAutor, setFiltroAutor] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroCodigoLibro, setFiltroCodigoLibro] = useState('');

  const [tabActivo, setTabActivo] = useState('inventario');

  const API_BASE = 'http://localhost:3000/stock'; 

  const cargarInventario = async () => {
    setCargando(true);
    try {
      const res = await axios.get(`${API_BASE}/inventory`);
      setInventario(res.data);
    } catch (error) {
      console.error('Error al cargar inventario', error);
    } finally {
      setCargando(false);
    }
  };

const agrupadoFiltrado = Object.values(
  inventario
    .filter(
      (i) =>
        i.titulo.toLowerCase().includes(filtroTitulo.toLowerCase()) &&
        `${i.autor_completo}`.toLowerCase().includes(filtroAutor.toLowerCase())
    )
    .reduce((acc, item) => {
      const key = `${item.titulo}-${item.autor_completo}-${item.editorial}`;
      if (!acc[key]) {
        acc[key] = {
          titulo: item.titulo,
          autor: item.autor_completo,
          editorial: item.editorial,
          total: 0,
          disponibles: 0,
          primerItem: item
        };
      }
      acc[key].total += 1;
      if (item.disponibilidad) {
        acc[key].disponibles += 1;
      }
      return acc;
    }, {})
);


  useEffect(() => {
    cargarInventario();
  }, []);

  const abrirModal = () => {
    setItemEditando(null);
    setModalVisible(true);
  };

  const cerrarModal = () => setModalVisible(false);

  const itemRegistrado = () => {
    cerrarModal();
    cargarInventario();
  };

  const manejarEditar = (item) => {
    setItemEditando(item);
    setModalVisible(true);
  };

  const abrirModalEliminar = (id) => {
    setItemAEliminar(id);
    setModalEliminarVisible(true);
  };

  const cerrarModalEliminar = () => {
    setItemAEliminar(null);
    setModalEliminarVisible(false);
  };

  const confirmarEliminar = async () => {
    try {
      await axios.put(`${API_BASE}/inventory/${itemAEliminar}`);
      cargarInventario();
    } catch (error) {
      console.error('Error al eliminar item:', error);
    } finally {
      cerrarModalEliminar();
    }
  };
  
return (
<div className="pt-16 h-screen bg-gray-50 p-8 overflow-hidden">
  <div className="max-w-7xl mx-auto bg-white rounded shadow-lg p-6">   
   <div className="mb-6">
      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-4" aria-label="Tabs">
          <button
            className={`px-4 py-2 font-medium text-md ${
              tabActivo === 'inventario'
                ? 'text-yellow-600 border-b-2 border-yellow-500'
                : 'text-gray-500 hover:text-yellow-600'
            }`}
            onClick={() => setTabActivo('inventario')}
          >
            Inventario
          </button>
          <button
            className={`px-4 font-medium ${
              tabActivo === 'libros'
                ? 'text-yellow-600 border-b-2 border-yellow-500'
                : 'text-gray-500 hover:text-yellow-600'
            }`}
            onClick={() => setTabActivo('libros')}
          >
            Libros
          </button>
        </nav>
      </div>

      {tabActivo === 'inventario' && (
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800">Inventario</h1>
          <div className="flex flex-wrap justify-between items-end gap-4">
            <div className="flex flex-wrap gap-4">
              <input
                type="text"
                placeholder="Filtrar por título"
                className="border border-slate-300 p-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                value={filtroTitulo}
                onChange={(e) => setFiltroTitulo(e.target.value)}
              />
              <input
                type="text"
                placeholder="Filtrar por autor"
                className="border border-slate-300 p-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                value={filtroAutor}
                onChange={(e) => setFiltroAutor(e.target.value)}
              />
              <input
                type="text"
                placeholder="Filtrar por categoria"
                className="border border-slate-300 p-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
              />
              <input
                type="text"
                placeholder="Filtrar por Codigo"
                className="border border-slate-300 p-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                value={filtroCodigoLibro}
                onChange={(e) => setFiltroCodigoLibro(e.target.value)}
              />
            </div>
            <button
              onClick={abrirModal}
              className="inline-flex items-center gap-2 px-5 py-3 bg-slate-600 text-white rounded shadow hover:bg-slate-700 transition"
            >
              <PlusCircle size={20} />
              Registrar Libro
            </button>
          </div>
        </div>
      )}

      {/* Tabla Inventario */}
      {tabActivo === 'inventario' && (
        cargando ? (
          <p className="text-center text-slate-600">Cargando inventario...</p>
        ) : inventario.length === 0 ? (
          <p className="text-center text-slate-600">No hay registros en inventario.</p>
        ) : (
          <div className="overflow-y-auto max-h-[450px] rounded border border-slate-200 flex-grow">
            <table className="w-full border-collapse text-slate-700">
              <thead className="sticky top-0 bg-yellow-300 text-slate-900 font-semibold z-10">
                <tr>
                  <th className="py-3 px-5 border border-yellow-400">Título</th>
                  <th className="py-3 px-5 border border-yellow-400">Autor</th>
                  <th className="py-3 px-5 border border-yellow-400">Categoría</th> 
                  <th className="py-3 px-5 border border-yellow-400">Código del libro</th>
                  <th className="py-3 px-5 border border-yellow-400">Condición</th>
                  <th className="py-3 px-5 border border-yellow-400">Observaciones</th>
                  <th className="py-3 px-5 border border-yellow-400">Disponibilidad</th>
                  <th className="py-3 px-5 border border-yellow-400">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {inventario
                  .filter(
                    (i) =>
                      i.titulo.toLowerCase().includes(filtroTitulo.toLowerCase()) &&
                      `${i.autor_completo}`.toLowerCase().includes(filtroAutor.toLowerCase()) && 
                      i.categoria.toLowerCase().includes(filtroCategoria.toLowerCase()) &&
                      i.codigo_libro.toLowerCase().includes(filtroCodigoLibro.toLowerCase())
                  )
                  .map((i) => (
                    <tr key={i.id_inventario} className="hover:bg-yellow-50 transition-colors duration-200">
         
                      <td className="border border-yellow-200 px-5 py-3">{i.titulo}</td>
                      <td className="border border-yellow-200 px-5 py-3">{i.autor_completo}</td>
                      <td className="border border-yellow-200 px-5 py-3">{i.categoria}</td>           
                      <td className="border border-yellow-200 px-5 py-3">{i.codigo_libro}</td>       
                      <td className="border border-yellow-200 px-5 py-3">{i.condicion_general}</td>
                      <td className="border border-yellow-200 px-5 py-3">{i.observaciones}</td>
                      <td className="border border-yellow-200 px-5 py-3">
                        {i.disponibilidad ? 'Disponible' : 'No disponible'}
                      </td>
                      <td className="border border-yellow-200 px-5 py-3 space-x-2 flex">
                        <button
                          onClick={() => manejarEditar(i)}
                          className="flex items-center gap-1 bg-yellow-400 text-slate-900 px-3 py-1 rounded shadow hover:bg-yellow-500 transition"
                          title="Modificar Inventario"
                        >
                          <Edit2 size={16} />
                          Modificar
                        </button>
                        <button
                          onClick={() => abrirModalEliminar(i.id_inventario)}
                          className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded shadow hover:bg-red-700 transition"
                          title="Eliminar Inventario"
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
        )
      )}

      {/* Tabla Libros (agrupada) */}
      {tabActivo === 'libros' && (
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800">Libros</h1>
          <div className="flex flex-wrap gap-4 mt-4 mb-6">
            <input
              type="text"
              placeholder="Filtrar por título"
              className="border border-slate-300 p-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={filtroTitulo}
              onChange={(e) => setFiltroTitulo(e.target.value)}
            />
            <input
              type="text"
              placeholder="Filtrar por autor"
              className="border border-slate-300 p-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={filtroAutor}
              onChange={(e) => setFiltroAutor(e.target.value)}
            />
          </div>

          <div className="overflow-y-auto max-h-[450px] rounded border border-slate-200">
            <table className="w-full border-collapse text-slate-700">
              <thead className="sticky top-0 bg-yellow-300 text-slate-900 font-semibold z-10">
                <tr>
                  <th className="py-3 px-5 border border-yellow-400">Título</th>
                  <th className="py-3 px-5 border border-yellow-400">Autor</th>
                  <th className="py-3 px-5 border border-yellow-400">Editorial</th>
                  <th className="py-3 px-5 border border-yellow-400">Total Libros</th>
                  <th className="py-3 px-5 border border-yellow-400">Disponibles</th>
                </tr>
              </thead>
              <tbody>
                {agrupadoFiltrado.map((item, index) => (
                  <tr key={index} className="hover:bg-yellow-50 transition-colors duration-200">
                    <td className="border border-yellow-200 px-5 py-3">{item.titulo}</td>
                    <td className="border border-yellow-200 px-5 py-3">{item.autor}</td>
                    <td className="border border-yellow-200 px-5 py-3">{item.editorial}</td>
                    <td className="border border-yellow-200 px-5 py-3">{item.total}</td>
                    <td className="border border-yellow-200 px-5 py-3">Libros disponibles: {item.disponibles}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>

    {/* Modal Formulario */}
    {modalVisible && (
      <InventarioFormulario
        onClose={cerrarModal}
        onInventarioGuardado={itemRegistrado}
        inventarioParaEditar={itemEditando}
      />
    )}

    {/* Modal Eliminar */}
    {modalEliminarVisible && (
      <div className="fixed inset-0 backdrop-blur-md bg-opacity-30 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full text-center">
          <p className="mb-6 text-lg font-semibold text-gray-800">
            ¿Estás seguro de eliminar este registro de inventario?
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
  </div>
);


}

export default Inventario;
