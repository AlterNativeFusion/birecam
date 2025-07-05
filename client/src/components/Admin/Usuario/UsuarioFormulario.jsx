import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  BadgeCheck, User, Users, Contact, Mail, Phone, GraduationCap,
  School, Building2, ScanLine, UserRound
} from 'lucide-react';

function UsuarioFormulario({ onClose, onUsuarioRegistrado, usuarioParaEditar }) {
  const [formulario, setFormulario] = useState({
    dni: '',
    nombres: '',
    apellidos: '',
    tipo_usuario: '',
    genero: '',
    correo: '',
    telefono: '',
    grado: '',
    seccion: '',
    area: '',
    condicion: '',
    institucion_origen: '',
    password: ''
  });


  const canceladoRef = useRef(false);
  const [mostrarResumen, setMostrarResumen] = useState(false);
  const [error, setError] = useState('');
  const dniRef = useRef(null);

  const API_BASE = 'http://localhost:3000/users';

  useEffect(() => {
  if (usuarioParaEditar) {
    setFormulario(usuarioParaEditar);
  }
}, [usuarioParaEditar]);

  useEffect(() => {
    dniRef.current?.focus();
  }, []);

  const handleDniChange = async (e) => {
  const value = e.target.value;
  if (/^\d{0,8}$/.test(value)) {
    setFormulario((prev) => ({ ...prev, dni: value }));

    if (value.length === 8 && !usuarioParaEditar) {
  try {
    await axios.get(`${API_BASE}/${value}`);
    setError('El DNI ya está registrado, ingrese otro.');
  } catch (error) {
    if (error.response && error.response.status === 404) {
      setError('');
        } else {
          setError('Error al validar DNI. Intenta más tarde.');
        }
      }
    } else {
      setError('');
    }
  }
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormulario({ ...formulario, [name]: value });
  };

  const handleTipoUsuarioChange = (value) => {
    setFormulario((prev) => ({
      ...prev,
      tipo_usuario: prev.tipo_usuario === value ? '' : value,
      grado: '',
      seccion: '',
      area: '',
      condicion: '',
      institucion_origen: ''
    }));
  };

  const validarFormulario = () => {
    const { dni, correo, telefono } = formulario;
    if (dni.length !== 8) return 'El DNI debe tener exactamente 8 dígitos';
    if (!usuarioParaEditar && formulario.password.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
    if (!/^\d{9}$/.test(telefono)) return 'El teléfono debe tener 9 dígitos';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) return 'El correo electrónico no es válido';
    return '';
  };

  const handleVerResumen = (e) => {
    e.preventDefault();
    const validacion = validarFormulario();
    if (validacion) {
      setError(validacion);
      return;
    }
    setError('');
    setMostrarResumen(true);
  };

  const handleSubmit = async () => {
   try {
     if (usuarioParaEditar) {
       await axios.put(`${API_BASE}/${usuarioParaEditar.dni}`, formulario);
     } else {
       await axios.post(`${API_BASE}/register`, formulario);
     }
     onUsuarioRegistrado();
     onClose(); 
   } catch (error) {
     console.error('Error al guardar usuario', error.response?.data || error.message);
     setError('Error al guardar usuario. Intenta de nuevo.');
     setMostrarResumen(false);
   }
 };


  const renderResumenItem = (icon, label, value) => (
  <div className="flex items-center space-x-3 text-gray-800">
    {icon}
    <span className="font-medium">{label}:</span>
    <span>{value || '—'}</span>
  </div>
);

  return (
    <div className="fixed inset-0 backdrop-blur bg-opacity-40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-8">
        <h2 className="text-3xl font-semibold mb-6 text-gray-800 text-center">
          {mostrarResumen ? 'Resumen del Usuario' : 'Registrar Usuario'}
        </h2>

        {error && <div className="text-red-600 mb-4 text-center font-medium">{error}</div>}

        {!mostrarResumen ? (
          <form onSubmit={handleVerResumen} className="space-y-4">
            {/* DNI */}
            <div>
              <label htmlFor="dni" className="block text-sm font-medium text-gray-700 mb-1">DNI</label>
              <input
                id="dni"
                type="text"
                name="dni"
                placeholder="Ingrese DNI"
                value={formulario.dni}
                onBlur={handleDniChange}
                onChange={handleDniChange}
                ref={dniRef}
                disabled={!!usuarioParaEditar}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                required
              />
            </div>

            {/* Nombres */}
            <div>
              <label htmlFor="nombres" className="block text-sm font-medium text-gray-700 mb-1">Nombres</label>
              <input
                id="nombres"
                type="text"
                name="nombres"
                placeholder="Ingrese nombres"
                value={formulario.nombres}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                required
              />
            </div>

            {/* Apellidos */}
            <div>
              <label htmlFor="apellidos" className="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
              <input
                id="apellidos"
                type="text"
                name="apellidos"
                placeholder="Ingrese apellidos"
                value={formulario.apellidos}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                required
              />
            </div>

            {/* Contraseña */}
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              value={formulario.password}
              onChange={handleChange}
              required={!usuarioParaEditar}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />

            {/* Tipo de usuario */}
            <fieldset className="space-y-2">
              <legend className="text-sm font-semibold text-gray-700">Tipo de usuario</legend>
              <div className="flex gap-6">
                {['alumno', 'foraneo', 'empleado'].map((tipo) => (
                  <label key={tipo} className="flex items-center cursor-pointer space-x-2">
                    <input
                      type="radio"
                      name="tipo_usuario"
                      checked={formulario.tipo_usuario === tipo}
                      onChange={() => handleTipoUsuarioChange(tipo)}
                      className="w-5 h-5 text-blue-600 border-gray-300"
                    />
                    <span className="capitalize text-gray-700 font-medium">{tipo}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {/* Campos Condicionales */}
            {formulario.tipo_usuario === 'alumno' && (
              <div className="grid grid-cols-2 gap-4">
                <input name="grado" placeholder="Grado" value={formulario.grado} onChange={handleChange} required className="border rounded-md px-4 py-2" />
                <input name="seccion" placeholder="Sección" value={formulario.seccion} onChange={handleChange} required className="border rounded-md px-4 py-2" />
              </div>
            )}

            {formulario.tipo_usuario === 'empleado' && (
              <div className="grid grid-cols-2 gap-4">
                <input name="area" placeholder="Área" value={formulario.area} onChange={handleChange} required className="border rounded-md px-4 py-2" />
                <input name="condicion" placeholder="Condición" value={formulario.condicion} onChange={handleChange} required className="border rounded-md px-4 py-2" />
              </div>
            )}

            {formulario.tipo_usuario === 'foraneo' && (
              <div>
                <input name="institucion_origen" placeholder="Institución de Origen" value={formulario.institucion_origen} onChange={handleChange} required className="border rounded-md px-4 py-2 w-full" />
              </div>
            )}

            {/* Género */}
            <select name="genero" value={formulario.genero} onChange={handleChange} required className="w-full border rounded-md px-4 py-2 bg-white">
              <option value="">Seleccione género</option>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
            </select>

            {/* Correo */}
            <input
              type="email"
              name="correo"
              placeholder="Correo electrónico"
              value={formulario.correo}
              onChange={handleChange}
              className="w-full border rounded-md px-4 py-2"
              required
            />

            {/* Teléfono */}
            <input
              type="text"
              name="telefono"
              placeholder="Teléfono (9 dígitos)"
              value={formulario.telefono}
              onChange={handleChange}
              className="w-full border rounded-md px-4 py-2"
              required
            />

            {/* Botones */}
            <div className="flex justify-end space-x-3 pt-3 border-t border-gray-200">
              <button type="button" 
              onClick={() => {
                canceladoRef.current = true;
                onClose();
              }}
              className="px-6 py-2 border rounded-md text-gray-700 hover:bg-gray-100">Cancelar</button>
              <button type="submit" className="px-6 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700">
                {usuarioParaEditar ? 'Actualizar Usuario' : 'Registrar Usuario'}
              </button>
            </div>
          </form>
        ) : (
         <div className="space-y-3 text-sm">
            {renderResumenItem(<ScanLine className="w-4 h-4 text-blue-600" />, 'DNI', formulario.dni)}
            {renderResumenItem(<User className="w-4 h-4 text-blue-600" />, 'Nombres', formulario.nombres)}
            {renderResumenItem(<Users className="w-4 h-4 text-blue-600" />, 'Apellidos', formulario.apellidos)}
            {renderResumenItem(<BadgeCheck className="w-4 h-4 text-blue-600" />, 'Tipo de Usuario', formulario.tipo_usuario)}

            {formulario.tipo_usuario === 'alumno' && (
                <>
                {renderResumenItem(<GraduationCap className="w-4 h-4 text-blue-600" />, 'Grado', formulario.grado)}
                {renderResumenItem(<Contact className="w-4 h-4 text-blue-600" />, 'Sección', formulario.seccion)}
                </>
            )}

            {formulario.tipo_usuario === 'empleado' && (
                <>
                {renderResumenItem(<Building2 className="w-4 h-4 text-blue-600" />, 'Área', formulario.area)}
                {renderResumenItem(<BadgeCheck className="w-4 h-4 text-blue-600" />, 'Condición', formulario.condicion)}
                </>
            )}

            {formulario.tipo_usuario === 'foraneo' &&
                renderResumenItem(<School className="w-4 h-4 text-blue-600" />, 'Institución de Origen', formulario.institucion_origen)}

            {renderResumenItem(<UserRound className="w-4 h-4 text-blue-600" />, 'Género', formulario.genero)}
            {renderResumenItem(<Mail className="w-4 h-4 text-blue-600" />, 'Correo', formulario.correo)}
            {renderResumenItem(<Phone className="w-4 h-4 text-blue-600" />, 'Teléfono', formulario.telefono)}

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button onClick={() => setMostrarResumen(false)} className="px-6 py-2 border rounded-md text-gray-700 hover:bg-gray-100">Volver</button>
                <button onClick={handleSubmit} className="px-6 py-2 rounded-md bg-green-600 text-white font-semibold hover:bg-green-700">Confirmar Registro</button>
            </div>
            </div>
        )}
      </div>
    </div>
  );
}

export default UsuarioFormulario;
