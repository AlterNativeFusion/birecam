import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'https://birecam.onrender.com/stock';

function InventarioFormulario({ onClose, onInventarioGuardado, inventarioParaEditar }) {
  const [titulo, setTitulo] = useState('');
  const [autorNombre, setAutorNombre] = useState('');
  const [autorApellido, setAutorApellido] = useState('');
  const [editorial, setEditorial] = useState('');
  const [procedencia, setProcedencia] = useState('donado');
  const [condicionGeneral, setCondicionGeneral] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [cantidadTotal, setCantidadTotal] = useState(1);
  const [descripcion, setDescripcion] = useState('');
  const [precioNuevo, setPrecioNuevo] = useState('');
  const [valorUnitario, setValorUnitario] = useState('');
  const [coeficienteDeprecacion, setCoeficienteDeprecacion] = useState('');
  const [idNotacionesCategoria, setIdNotacionesCategoria] = useState('');
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const response = await axios.get(`${API_BASE}/category`);
        setCategorias(response.data);
      } catch (error) {
        console.error('Error al cargar categorías:', error);
      }
    };

    cargarCategorias();
  }, []);

  useEffect(() => {
  if (inventarioParaEditar && categorias.length > 0) {
    const nombres = inventarioParaEditar.autor_completo?.split(' ') || [];
    const apellido = nombres.pop() || '';
    const nombre = nombres.join(' ') || '';
    const categoriaEncontrada = categorias.find(
      cat => cat.descripcion_categoria === inventarioParaEditar.categoria
    );

    console.log("Datos recibidos para editar:", inventarioParaEditar);

    setTitulo(inventarioParaEditar.titulo || '');
    setAutorNombre(nombre);
    setAutorApellido(apellido);
    setEditorial(inventarioParaEditar.editorial || '');
    setProcedencia(inventarioParaEditar.procedencia || 'Donado');
    setCondicionGeneral(inventarioParaEditar.condicion_general || '');
    setObservaciones(inventarioParaEditar.observaciones || '');
    setCantidadTotal(inventarioParaEditar.cantidad_total || 1);
    setDescripcion(inventarioParaEditar.descripcion || '');
    setPrecioNuevo(inventarioParaEditar.precio_nuevo || '');
    setValorUnitario(inventarioParaEditar.valor_unitario || '');
    setCoeficienteDeprecacion(inventarioParaEditar.coeficiente_deprecacion || '');

    if (categoriaEncontrada) {
      setIdNotacionesCategoria(categoriaEncontrada.id_notacion_categoria);
    } else {
      console.warn("Categoría no encontrada:", inventarioParaEditar.categoria);
      setIdNotacionesCategoria('');
    }
  }
}, [inventarioParaEditar, categorias]);


const manejarSubmit = async (e) => {
  e.preventDefault();

  if (!titulo.trim() || !autorApellido.trim() || !condicionGeneral || !idNotacionesCategoria) {
    alert('Por favor completa todos los campos obligatorios.');
    return;
  }

  const datosInventario = {
    titulo,
    procedencia,
    autor_nombre: autorNombre,
    autor_apellido: autorApellido,
    editorial,
    condicion_general: condicionGeneral,
    observaciones,
    cantidad_total: Number(cantidadTotal),
    descripcion,
    precio_nuevo: Number(precioNuevo),
    valor_unitario: Number(valorUnitario),
    coeficiente_deprecacion: Number(coeficienteDeprecacion),
    id_notaciones_categoria: Number(idNotacionesCategoria),
  };

  console.log("Datos que se enviarán al backend:", datosInventario);

  try {
  let response;

  if (inventarioParaEditar && inventarioParaEditar.id_inventario) {
    response = await axios.put(
      `${API_BASE}/${inventarioParaEditar.id_inventario}`,
      datosInventario
    );
    console.log('Inventario actualizado:', response.data);
  } else {
    response = await axios.post(`${API_BASE}`, datosInventario);
    console.log('Inventario registrado:', response.data);
  }

  onInventarioGuardado(response?.data || null);
  onClose();
} catch (error) {
  console.error('Error al guardar inventario:', error);
  alert('Ocurrió un error al guardar el inventario.');
}
};



  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <form
        onSubmit={manejarSubmit}
        className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 mx-4 overflow-y-auto max-h-[90vh]"
      >
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">
          {inventarioParaEditar ? 'Editar Inventario' : 'Registrar Inventario'}
        </h2>

        <div className="space-y-4">
          {/* Título */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">Título</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
            />
          </div>

          {/* Autor */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block font-medium text-gray-700 mb-1">Nombre del autor</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={autorNombre}
                onChange={(e) => setAutorNombre(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block font-medium text-gray-700 mb-1">Apellido del autor</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={autorApellido}
                onChange={(e) => setAutorApellido(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Editorial */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">Editorial</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={editorial}
              onChange={(e) => setEditorial(e.target.value)}
            />
          </div>

          {/* Procedencia */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">Procedencia</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={procedencia}
              onChange={(e) => setProcedencia(e.target.value)}
              required
            >
              <option value="donado">Donado</option>
              <option value="comprado">Comprado</option>
            </select>
          </div>

          {/* Condición general */}
          <div>
            <label className="block font-medium text-gray-700 mb-2">Condición General</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Bueno', value: 'bueno' },
                { label: 'Regular', value: 'regular' },
                { label: 'Dañado', value: 'malo' }
              ].map(({ label, value }) => (
                <label key={label} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="condicion"
                    value={value}
                    checked={condicionGeneral === value}
                    onChange={() => setCondicionGeneral(value)}
                    className="form-radio text-yellow-500"
                  />
                  <span className="text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">Observaciones</label>
            <textarea
              rows={3}
              className="w-full border rounded px-3 py-2 resize-none"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
            />
          </div>

          {/* Cantidad Total */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">Cantidad Total</label>
            <input
              type="number"
              min={1}
              className="w-24 border rounded px-3 py-2"
              value={cantidadTotal}
              onChange={(e) => setCantidadTotal(e.target.value)}
              required
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">Descripción</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>

          {/* Precio Nuevo y Valor Unitario */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block font-medium text-gray-700 mb-1">Precio Nuevo</label>
              <input
                type="number"
                className="w-full border rounded px-3 py-2"
                value={precioNuevo}
                onChange={(e) => setPrecioNuevo(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block font-medium text-gray-700 mb-1">Valor Unitario</label>
              <input
                type="number"
                className="w-full border rounded px-3 py-2"
                value={valorUnitario}
                onChange={(e) => setValorUnitario(e.target.value)}
              />
            </div>
          </div>

          {/* Coeficiente de depreciación */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">Coeficiente de Depreciación</label>
            <input
              type="number"
              className="w-full border rounded px-3 py-2"
              value={coeficienteDeprecacion}
              onChange={(e) => setCoeficienteDeprecacion(e.target.value)}
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">Categoría</label>
            <select
              name="id_notaciones_categoria"
              value={idNotacionesCategoria}
              onChange={(e) => setIdNotacionesCategoria(e.target.value)}
              required
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Seleccione una categoría</option>
              {categorias.map((cat) => (
                <option key={cat.id_notacion_categoria} value={cat.id_notacion_categoria}>
                  {cat.descripcion_categoria}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Botones */}
        <div className="mt-6 flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded bg-gray-300 hover:bg-gray-400 transition font-semibold"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded bg-yellow-400 hover:bg-yellow-500 transition font-semibold text-gray-900"
          >
            {inventarioParaEditar ? 'Guardar Cambios' : 'Registrar'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default InventarioFormulario;
