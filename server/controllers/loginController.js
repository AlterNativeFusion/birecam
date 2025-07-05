import { query } from '../config/db.js';
import bcrypt from 'bcrypt';

export const loginUsuario = async (req, res) => {
  const { dni, tipo, password } = req.body;

  try {
    if (tipo === 'admin') {
      const result = await query(
        'SELECT * FROM administradores WHERE id_admin = $1',
        [dni]
      );

      const rows = getRows(result);

      if (rows.length === 0) {
        return res.status(404).json({ message: 'Administrador no encontrado' });
      }

      const admin = rows[0];

      const passwordValida = await bcrypt.compare(password, admin.password_hash);
      if (!passwordValida) {
        return res.status(401).json({ message: 'Contraseña incorrecta' });
      }

      return res.json({
        id: admin.id_admin,
        nombre: admin.nombre,
        apellido: admin.apellido,
        rol: 'admin'
      });
    }

    // Usuario común
    const result = await query(
      'SELECT * FROM usuarios WHERE dni = $1',
      [dni]
    );

    const rows = getRows(result);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const usuario = rows[0];

    const passwordValida = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValida) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    return res.json({
      dni: usuario.dni,
      nombre: usuario.nombres,
      apellido: usuario.apellidos,
      rol: usuario.tipo_usuario 
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};
