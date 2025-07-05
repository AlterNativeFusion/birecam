import React from 'react';

const AdministradorFormulario = ({ onClose, onRegistrar, adminForm, setAdminForm, error }) => {
  const handleChange = (e) => {
    setAdminForm({ ...adminForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onRegistrar();
  };

  return (
    <div className="fixed inset-0 backdrop-blur bg-opacity-40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-8">
        <h2 className="text-3xl font-semibold mb-6 text-gray-800 text-center">
          Registrar Administrador
        </h2>

        {error && <div className="text-red-600 mb-4 text-center font-medium">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Nombres */}
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">Nombres</label>
            <input
              id="nombre"
              type="text"
              name="nombre"
              value={adminForm.nombre}
              onChange={handleChange}
              placeholder="Ingrese nombres"
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              required
            />
          </div>

          {/* Apellidos */}
          <div>
            <label htmlFor="apellido" className="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
            <input
              id="apellido"
              type="text"
              name="apellido"
              value={adminForm.apellidos}
              onChange={handleChange}
              placeholder="Ingrese apellidos"
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              required
            />
          </div>

          {/* Contraseña */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              id="password"
              type="password"
              name="password"
              value={adminForm.password}
              onChange={handleChange}
              placeholder="Ingrese contraseña"
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              required
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-3 border-t border-gray-200 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700"
            >
              Registrar Administrador
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdministradorFormulario;
