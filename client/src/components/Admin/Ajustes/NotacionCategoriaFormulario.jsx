import React from 'react';

const NotacionCategoriaFormulario = ({ onClose, onRegistrar, categoriaForm, setCategoriaForm, error }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validar solo números para codigo_categoria
    if (name === 'codigo_categoria' && /[^0-9]/.test(value)) return;

    // Convertir a mayúscula si es descripcion_categoria
    setCategoriaForm({
      ...categoriaForm,
      [name]: name === 'descripcion_categoria' ? value.toUpperCase() : value,
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
          Registrar Notación de Categoría
        </h2>

        {error && <div className="text-red-600 mb-4 text-center font-medium">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Código de la Categoría */}
          <div>
            <label htmlFor="codigo_categoria" className="block text-sm font-medium text-gray-700 mb-1">Código de Categoría</label>
            <input
              id="codigo_categoria"
              type="text"
              name="codigo_categoria"
              value={categoriaForm.codigo_categoria}
              onChange={handleChange}
              placeholder="Solo números"
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              required
            />
          </div>

          {/* Descripción de la Categoría */}
          <div>
            <label htmlFor="descripcion_categoria" className="block text-sm font-medium text-gray-700 mb-1">Descripción Categoría</label>
            <input
              id="descripcion_categoria"
              type="text"
              name="descripcion_categoria"
              value={categoriaForm.descripcion_categoria}
              onChange={handleChange}
              placeholder="Ej: CIENCIAS"
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              required
            />
          </div>

          {/* ID de la Notación */}
          <div>
            <label htmlFor="id_notacion_categoria" className="block text-sm font-medium text-gray-700 mb-1">ID Notación Categoría</label>
            <input
              id="id_notacion_categoria"
              type="text"
              name="id_notacion_categoria"
              value={categoriaForm.id_notacion_categoria}
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

export default NotacionCategoriaFormulario;
