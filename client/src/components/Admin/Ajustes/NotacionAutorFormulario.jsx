import React from 'react';

const NotacionAutorFormulario = ({ onClose, onRegistrar, notacionForm, setNotacionForm, error }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validar solo números para codigo_autor
    if (name === 'codigo_autor' && /[^0-9]/.test(value)) return;

    // Convertir a mayúscula si es iniciales_apellido
    setNotacionForm({
      ...notacionForm,
      [name]: name === 'iniciales_apellido' ? value.toUpperCase() : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onRegistrar();
  };

  return (
    <div className="fixed inset-0 backdrop-blur bg-opacity-40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-8">
        <h2 className="text-3xl font-semibold mb-6 text-gray-800 text-center">
          Registrar Notación de Autor
        </h2>

        {error && <div className="text-red-600 mb-4 text-center font-medium">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Iniciales del Apellido */}
          <div>
            <label htmlFor="iniciales_apellido" className="block text-sm font-medium text-gray-700 mb-1">Iniciales del Apellido</label>
            <input
              id="iniciales_apellido"
              type="text"
              name="iniciales_apellido"
              value={notacionForm.iniciales_apellido}
              onChange={handleChange}
              placeholder="Ej: G"
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              required
            />
          </div>

          {/* Código del Autor  */}
          <div>
            <label htmlFor="codigo_autor" className="block text-sm font-medium text-gray-700 mb-1">Código del Autor</label>
            <input
              id="codigo_autor"
              type="text"
              name="codigo_autor"
              value={notacionForm.codigo_autor}
              onChange={handleChange}
              placeholder="Solo números"
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              required
            />
          </div>

          {/* ID de la Notación */}
          <div>
            <label htmlFor="id_notacion_autor" className="block text-sm font-medium text-gray-700 mb-1">ID Notación Autor</label>
            <input
              id="id_notacion_autor"
              type="text"
              name="id_notacion_autor"
              value={notacionForm.id_notacion_autor}
              onChange={handleChange}
              placeholder="Número en secuencia"
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
              Registrar Notación
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NotacionAutorFormulario;
