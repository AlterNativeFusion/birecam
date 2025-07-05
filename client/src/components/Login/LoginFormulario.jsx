import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router';
import fondo from '../../assets/imagenLogin.png'; 

const LoginFormulario = () => {
  const [dni, setDni] = useState('');
  const [tipo, setTipo] = useState('user');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const API_BASE = 'https://birecam.onrender.com/login';

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(API_BASE, { dni, tipo, password });
      const { rol } = res.data;
      localStorage.setItem('user', JSON.stringify(res.data));

      if (tipo === 'user') {
  if (['alumno', 'empleado', 'foraneo'].includes(rol)) {
    localStorage.setItem('user', JSON.stringify(res.data)); 
    navigate('/user/');
  } else {
    alert('Tipo de usuario no válido');
  }
} else if (tipo === 'admin') {
    if (rol === 'admin') {
      localStorage.setItem('admin', JSON.stringify({
        id_admin: res.data.id,
        nombre: res.data.nombre
      }));
      localStorage.setItem('adminId', res.data.id);
      navigate('/admin');
    } else {
      alert('No tiene permisos de administrador');
    }
  }
    } catch (error) {
      alert('DNI/ID o contraseña inválida');
      console.error(error);
    }
  };


  return (
    <div className="flex h-screen">
      {/* Imagen de fondo a la izquierda */}
      <div className="w-3/5 hidden md:block">
        <img
          src={fondo}
          alt="Fondo de biblioteca"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Formulario a la derecha */}
      <div className="w-full md:w-2/5 flex items-center justify-center bg-yellow-50 border-l-4 border-yellow-400 p-6">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8 space-y-5"
        >
          <h2 className="text-2xl font-bold text-yellow-600 text-center">Biblioteca Escolar</h2>

          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value="user">Usuario</option>
            <option value="admin">Administrador</option>
          </select>

          <input
            type="text"
            placeholder={tipo === 'user' ? 'Ingrese DNI' : 'Ingrese ID de Admin'}
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />

          <button
            type="submit"
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            Ingresar
          </button>

          <p className="text-center text-sm text-gray-500 cursor-default">
            ¿Olvidó su contraseña?
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginFormulario;
