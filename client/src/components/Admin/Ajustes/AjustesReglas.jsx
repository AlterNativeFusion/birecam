import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FormularioAdministrador from './AdministradorFormulario'; 
import NotacionAutorFormulario from './NotacionAutorFormulario';
import NotacionCategoriaFormulario from './NotacionCategoriaFormulario';

const API_BASE = 'http://localhost:3000';

const AjustesReglas = () => {
  const [tabActiva, setTabActiva] = useState('autor');
  const [diasPrestamo, setDiasPrestamo] = useState(() => {
    return parseInt(localStorage.getItem('diasPrestamo')) || 1;
  });
  const [librosMaximos, setLibrosMaximos] = useState(() => {
    return parseInt(localStorage.getItem('librosMaximos')) || 1;
  });
  const [notacionesAutor, setNotacionesAutor] = useState([]);
  const [notacionesCategoria, setNotacionesCategoria] = useState([]);

  const [mostrarFormularioAdmin, setMostrarFormularioAdmin] = useState(false);
  const [adminForm, setAdminForm] = useState({
    nombre: '',
    apellido: '',
    password: '',
  });
  const [errorAdmin, setErrorAdmin] = useState('');

  const [mostrarFormularioNotacion, setMostrarFormularioNotacion] = useState(false);
  const [notacionForm, setNotacionForm] = useState({
    iniciales_apellido: '',
    codigo_autor: '',
    id_notacion_autor: '',
  });
  const [errorNotacion, setErrorNotacion] = useState('');

  const [mostrarFormularioCategoria, setMostrarFormularioCategoria] = useState(false);
  const [categoriaForm, setCategoriaForm] = useState({
    codigo_categoria: '',
    descripcion_categoria: '',
    id_notacion_categoria: '',
  });
  const [errorCategoria, setErrorCategoria] = useState('');

  const handleRegistrarAdmin = async () => {
  const { nombre, apellido, password } = adminForm;

  if (password.length < 6) {
    setErrorAdmin('La contraseña debe tener al menos 6 caracteres');
    return;
  }

  try {
    await axios.post(`${API_BASE}/config/regadmin`, {
      nombre,
      apellido,
      password
    });

      alert('Administrador registrado con éxito');
      setMostrarFormularioAdmin(false);
      setAdminForm({ nombre: '', apellido: '', password: '' });
      setErrorAdmin('');
    } catch (error) {
      console.error(error);
      setErrorAdmin(error.response?.data?.error || 'Error al registrar administrador');
    }
  };

  
  const handleRegistrarNotacionAutor = async () => {
    const { iniciales_apellido, codigo_autor, id_notacion_autor } = notacionForm;

    if (!iniciales_apellido || !codigo_autor || !id_notacion_autor) {
      setErrorNotacion('Todos los campos son obligatorios');
      return;
    }

    try {
      await axios.post(`${API_BASE}/config/regnotacionautor`, {
        iniciales_apellido,
        codigo_autor,
        id_notacion_autor,
      });

      alert('Notación de autor registrada con éxito');
      setMostrarFormularioNotacion(false);
      setNotacionForm({ iniciales_apellido: '', codigo_autor: '', id_notacion_autor: '' });
      setErrorNotacion('');
    } catch (error) {
      console.error(error);
      setErrorNotacion(error.response?.data?.error || 'Error al registrar notación');
    }
  };

  const handleRegistrarNotacionCategoria = async () => {
    const { codigo_categoria, descripcion_categoria, id_notacion_categoria } = categoriaForm;

    if (!codigo_categoria || !descripcion_categoria || !id_notacion_categoria) {
      setErrorCategoria('Todos los campos son obligatorios');
      return;
    }

    try {
      await axios.post(`${API_BASE}/config/regnotacioncategoria`, {
        codigo_categoria: codigo_categoria.toUpperCase(),
        descripcion_categoria,
        id_notacion_categoria,
      });

      alert('Notación de categoría registrada con éxito');
      setMostrarFormularioCategoria(false);
      setCategoriaForm({ codigo_categoria: '', descripcion_categoria: '', id_notacion_categoria: '' });
      setErrorCategoria('');
    } catch (error) {
      console.error(error);
      setErrorCategoria(error.response?.data?.error || 'Error al registrar notación');
    }
  };  

  const fetchNotaciones = async () => {
  try {
    const autorRes = await axios.get(`${API_BASE}/config/notacionesautor`);
    const catRes = await axios.get(`${API_BASE}/config/notacionescategoria`);
    setNotacionesAutor(autorRes.data);
    setNotacionesCategoria(catRes.data);
  } catch (error) {
    console.error('Error al obtener notaciones:', error);
  }
};

useEffect(() => {
  fetchNotaciones();
}, []);

const handleEliminarAutor = async (id) => {
  if (!window.confirm('¿Estás seguro de eliminar esta notación de autor?')) return;

  try {
    await axios.delete(`${API_BASE}/config/notacionesautor/${id}`);
    alert('Notación de autor eliminada');
    fetchNotaciones(); 
  } catch (error) {
    console.error('Error al eliminar notación autor:', error);
    alert('No se pudo eliminar la notación');
  }
};

const handleEditarAutor = async (item) => {
  const nuevoCodigo = prompt('Nuevo código de autor:', item.codigo_autor);
  const nuevasIniciales = prompt('Nuevas iniciales:', item.iniciales_apellido);
  if (!nuevoCodigo || !nuevasIniciales) return;

  try {
    await axios.put(`${API_BASE}/config/notacionesautor/${item.id_notacion_autor}`, {
      codigo_autor: nuevoCodigo,
      iniciales_apellido: nuevasIniciales,
    });
    alert('Notación de autor actualizada');
    fetchNotaciones();
  } catch (error) {
    console.error('Error al actualizar notación autor:', error);
    alert('No se pudo actualizar la notación');
  }
};


const handleEliminarCategoria = async (id) => {
  if (!window.confirm('¿Estás seguro de eliminar esta notación de categoría?')) return;

  try {
    await axios.delete(`${API_BASE}/config/notacionescategoria/${id}`);
    alert('Notación de categoría eliminada');
    fetchNotaciones();
  } catch (error) {
    console.error('Error al eliminar notación categoría:', error);
    alert('No se pudo eliminar la notación');
  }
};


const handleEditarCategoria = async (item) => {
  const nuevoCodigo = prompt('Nuevo código de categoría:', item.codigo_categoria);
  const nuevaDescripcion = prompt('Nueva descripción:', item.descripcion_categoria);
  if (!nuevoCodigo || !nuevaDescripcion) return;

  try {
    await axios.put(`${API_BASE}/config/notacionescategoria/${item.id_notacion_categoria}`, {
      codigo_categoria: nuevoCodigo,
      descripcion_categoria: nuevaDescripcion,
    });
    alert('Notación de categoría actualizada');
    fetchNotaciones();
  } catch (error) {
    console.error('Error al actualizar notación categoría:', error);
    alert('No se pudo actualizar la notación');
  }
};

  return (
    <>
      <div className="pt-22 min-h-screen bg-gray-50 px-6 py-10">
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-8 space-y-6">
          {/* Título + Botón */}
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-slate-800">Configuración del Sistema</h1>
            <button
              onClick={() => setMostrarFormularioAdmin(true)}
              className="inline-flex items-center gap-2 px-5 py-3 bg-slate-600 text-white rounded shadow hover:bg-slate-700 transition"
            >
              Registrar nuevo administrador
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 border-b pb-2">
            <button
              className={`px-4 py-2 rounded-t ${tabActiva === 'autor' ? 'bg-yellow-400 text-white font-bold' : 'bg-gray-200'}`}
              onClick={() => setTabActiva('autor')}
            >
              Notaciones de Autor
            </button>
            <button
              className={`px-4 py-2 rounded-t ${tabActiva === 'categoria' ? 'bg-yellow-400 text-white font-bold' : 'bg-gray-200'}`}
              onClick={() => setTabActiva('categoria')}
            >
              Notaciones de Categoría
            </button>
            <button
              className={`px-4 py-2 rounded-t ${tabActiva === 'reglas' ? 'bg-yellow-400 text-white font-bold' : 'bg-gray-200'}`}
              onClick={() => setTabActiva('reglas')}
            >
              Reglas de Préstamo
            </button>
          </div>

          {/* Contenido según pestaña */}
          {tabActiva === 'autor' && (
           <section>
              <div className="flex justify-end mb-3">
                <button
                  onClick={() => setMostrarFormularioNotacion(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                  Agregar Notación Autor
                </button>
              </div>

              <table className="w-full table-auto border border-gray-300 rounded">
                <thead className="bg-gray-200 text-gray-700 font-semibold">
                  <tr>
                    <th className="px-4 py-2 border">Iniciales del Apellido</th>
                    <th className="px-4 py-2 border">Código del Autor</th>
                    <th className="px-4 py-2 border">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {notacionesAutor.map((item, idx) => (
                    <tr key={idx} className="text-center">
                      <td className="px-4 py-2 border">{item.iniciales_apellido}</td>
                      <td className="px-4 py-2 border">{item.codigo_autor}</td>
                      <td className="px-4 py-2 border">
                        <button
                          onClick={() => handleEditarAutor(item)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded mr-2"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleEliminarAutor(item.id_notacion_autor)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {tabActiva === 'categoria' && (
            <section>
              <div className="flex justify-end mb-3">
                <button
                  onClick={() => setMostrarFormularioCategoria(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                  Agregar Notación Categoría
                </button>
              </div>

              <table className="w-full table-auto border border-gray-300 rounded">
                <thead className="bg-gray-200 text-gray-700 font-semibold">
                  <tr>
                    <th className="px-4 py-2 border">Código de Categoría</th>
                    <th className="px-4 py-2 border">Descripción</th>
                    <th className="px-4 py-2 border">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {notacionesCategoria.map((item, idx) => (
                    <tr key={idx} className="text-center">
                      <td className="px-4 py-2 border">{item.codigo_categoria}</td>
                      <td className="px-4 py-2 border">{item.descripcion_categoria}</td>
                      <td className="px-4 py-2 border">
                        <button
                          onClick={() => handleEditarCategoria(item)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded mr-2"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleEliminarCategoria(item.id_notacion_categoria)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {tabActiva === 'reglas' && (
            <section className="space-y-4">
              <label className="block">
                <span className="text-slate-700 font-medium">Días de préstamo:</span>
                <input
                  type="number"
                  min={1}
                  className="mt-1 w-32 border border-gray-300 rounded px-3 py-1"
                  value={diasPrestamo}
                  onChange={(e) => setDiasPrestamo(e.target.value)}
                />
              </label>

              <label className="block">
                <span className="text-slate-700 font-medium">Máximo de libros prestados:</span>
                <input
                  type="number"
                  min={1}
                  className="mt-1 w-32 border border-gray-300 rounded px-3 py-1"
                  value={librosMaximos}
                  onChange={(e) => setLibrosMaximos(e.target.value)}
                />
              </label>

              <button
                onClick={() => {
                  localStorage.setItem('diasPrestamo', diasPrestamo);
                  localStorage.setItem('librosMaximos', librosMaximos);
                  alert('Parámetros de préstamo guardados correctamente.');
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Guardar parámetros
              </button>

              <div className="text-sm text-gray-600">
                Actualmente: {diasPrestamo} día(s) y {librosMaximos} libro(s) permitidos.
              </div>
            </section>
          )}
          
        </div>
      </div>

      {/* MODALES */}
      {mostrarFormularioAdmin && (
        <FormularioAdministrador
          onClose={() => setMostrarFormularioAdmin(false)}
          onRegistrar={handleRegistrarAdmin}
          adminForm={adminForm}
          setAdminForm={setAdminForm}
          error={errorAdmin}
        />
      )}

      {mostrarFormularioNotacion && (
        <NotacionAutorFormulario
          onClose={() => setMostrarFormularioNotacion(false)}
          onRegistrar={handleRegistrarNotacionAutor}
          notacionForm={notacionForm}
          setNotacionForm={setNotacionForm}
          error={errorNotacion}
        />
      )}

      {mostrarFormularioCategoria && (
        <NotacionCategoriaFormulario
          onClose={() => setMostrarFormularioCategoria(false)}
          onRegistrar={handleRegistrarNotacionCategoria}
          categoriaForm={categoriaForm}
          setCategoriaForm={setCategoriaForm}
          error={errorCategoria}
        />
      )}
    </>
  );
};

export default AjustesReglas;
