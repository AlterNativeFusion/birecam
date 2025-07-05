import bcrypt from 'bcrypt';
import { query } from '../config/db.js';

export const registerAdmin = async (req, res) => {
  const { nombre, apellido, password } = req.body;

  if (!nombre || !apellido || !password) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await query(
      'INSERT INTO administradores (nombre, apellido, password_hash) VALUES ($1, $2, $3) RETURNING id_admin',
      [nombre, apellido, hashedPassword]
    );

    res.status(201).json({ message: 'Administrador registrado', id: result.rows[0].id_admin });
  } catch (error) {
    console.error('Error al registrar admin:', error);
    res.status(500).json({ error: 'Error al registrar el administrador' });
  }
};


export const registerNotacionAutor = async (req, res) => {
  const { id_notacion_autor, iniciales_apellido, codigo_autor } = req.body;

  if (!id_notacion_autor || !iniciales_apellido || !codigo_autor) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  try {
    const existe = await query(
      'SELECT 1 FROM notaciones_autor WHERE id_notacion_autor = $1',
      [id_notacion_autor]
    );
    if (existe.rows.length > 0) {
      return res.status(409).json({ error: 'El ID ya está registrado.' });
    }

    await query(
      'INSERT INTO notaciones_autor (id_notacion_autor, iniciales_apellido, codigo_autor) VALUES ($1, $2, $3)',
      [id_notacion_autor, iniciales_apellido.toUpperCase(), codigo_autor]
    );

    res.status(201).json({ mensaje: 'Notación de autor registrada exitosamente.' });
  } catch (error) {
    console.error('Error al registrar notación de autor:', error.message);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

export const registerNotacionCategoria = async (req, res) => {
  const { codigo_categoria, descripcion_categoria, id_notacion_categoria } = req.body;

  if (!codigo_categoria || !descripcion_categoria || !id_notacion_categoria) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const existe = await query(
      'SELECT * FROM notaciones_categoria WHERE id_notacion_categoria = $1',
      [id_notacion_categoria]
    );

    if (existe.rows.length > 0) {
      return res.status(409).json({ error: 'El ID ya está registrado' });
    }

    await query(
      'INSERT INTO notaciones_categoria (codigo_categoria, descripcion_categoria, id_notacion_categoria) VALUES ($1, $2, $3)',
      [codigo_categoria.toUpperCase(), descripcion_categoria, id_notacion_categoria]
    );

    res.status(201).json({ message: 'Notación de categoría registrada con éxito' });
  } catch (error) {
    console.error('Error al registrar notación de categoría:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getNotacionesAutor = async (req, res) => {
  try {
    const result = await query('SELECT * FROM notaciones_autor');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener notaciones de autor' });
  }
};

export const getNotacionesCategoria = async (req, res) => {
  try {
    const result = await query('SELECT * FROM notaciones_categoria');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener notaciones de categoría' });
  }
};

export const updateNotacionAutor = async (req, res) => {
  const { id } = req.params;
  const { iniciales_apellido, codigo_autor } = req.body;

  try {
    const result = await query(
      `UPDATE notaciones_autor 
       SET iniciales_apellido = $1, codigo_autor = $2
       WHERE id_notacion_autor = $3
       RETURNING *`,
      [iniciales_apellido, codigo_autor, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Notación de autor no encontrada' });
    }

    res.status(200).json({ message: 'Notación actualizada', data: result.rows[0] });
  } catch (error) {
    console.error('Error al actualizar notación autor:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

export const deleteNotacionAutor = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await query(
      'DELETE FROM notaciones_autor WHERE id_notacion_autor = $1 RETURNING *',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Notación de autor no encontrada' });
    }

    res.status(200).json({ message: 'Notación de autor eliminada' });
  } catch (error) {
    console.error('Error al eliminar notación autor:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

export const updateNotacionCategoria = async (req, res) => {
  const { id } = req.params;
  const { codigo_categoria, descripcion_categoria } = req.body;

  try {
    const result = await query(
      `UPDATE notaciones_categoria 
       SET codigo_categoria = $1, descripcion_categoria = $2
       WHERE id_notacion_categoria = $3
       RETURNING *`,
      [codigo_categoria, descripcion_categoria, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Notación de categoría no encontrada' });
    }

    res.status(200).json({ message: 'Notación actualizada', data: result.rows[0] });
  } catch (error) {
    console.error('Error al actualizar notación categoría:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

export const deleteNotacionCategoria = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await query(
      'DELETE FROM notaciones_categoria WHERE id_notacion_categoria = $1 RETURNING *',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Notación de categoría no encontrada' });
    }

    res.status(200).json({ message: 'Notación de categoría eliminada' });
  } catch (error) {
    console.error('Error al eliminar notación categoría:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};
