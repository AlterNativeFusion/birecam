import { query } from '../config/db.js';

export const requestLoan = async (req, res) => {
  const {
    dni,
    codigo_libro,
    fecha_devolucion,
    tipo_destino,
    observaciones = null,
    id_admin = null
  } = req.body;

  const fechaHoy = new Date();
  const fechaDevolucionDate = new Date(fecha_devolucion);
  fechaHoy.setHours(0, 0, 0, 0);
  fechaDevolucionDate.setHours(0, 0, 0, 0);

  if (fechaDevolucionDate < fechaHoy) {
    return res.status(400).json({ message: 'La fecha de devolución no puede ser anterior a hoy.' });
  }

  try {
    const inventario = await query(
      `SELECT id_inventario FROM inventario 
       WHERE codigo_libro = $1 AND disponibilidad = true 
       LIMIT 1`,
      [codigo_libro]
    );

    if (inventario.length === 0) {
      return res.status(400).json({ message: 'No hay copias disponibles para préstamo.' });
    }

    const id_inventario = inventario[0].id_inventario;

    const prestamo = await query(
      `INSERT INTO prestamos 
       (dni_usuario, fecha_prestamo, fecha_devolucion, tipo_destino, observaciones, estado, id_admin)
       VALUES ($1, CURRENT_DATE, $2, $3, $4, 'pendiente', $5)
       RETURNING id_prestamo`,
      [dni, fecha_devolucion, tipo_destino, observaciones, id_admin]
    );

    const id_prestamo = prestamo[0].id_prestamo;

    await query(
      `INSERT INTO detalle_prestamo 
       (id_prestamo, id_inventario, devuelto, fecha_entrega)
       VALUES ($1, $2, false, NULL)`,
      [id_prestamo, id_inventario]
    );

    await query(
      `UPDATE inventario 
       SET disponibilidad = false 
       WHERE id_inventario = $1`,
      [id_inventario]
    );

    res.status(200).json({
      message: 'Solicitud de préstamo registrada correctamente.',
      prestamo: {
        id_prestamo,
        estado: 'pendiente'
      }
    });

  } catch (error) {
    console.error('Error al registrar préstamo:', error);
    res.status(500).json({ message: 'Error al solicitar préstamo.' });
  }
};

export const returnLoan = async (req, res) => {
  const { id_prestamo } = req.body;

  try {
    const detalle = await query(
      `SELECT dp.id_detalle, dp.id_inventario, p.fecha_devolucion
       FROM detalle_prestamo dp
       JOIN prestamos p ON dp.id_prestamo = p.id_prestamo
       WHERE dp.id_prestamo = $1 AND dp.devuelto = false`,
      [id_prestamo]
    );

    if (detalle.length === 0) {
      return res.status(400).json({ message: 'No hay préstamos pendientes para devolver con ese ID.' });
    }

    const { id_detalle, id_inventario, fecha_devolucion } = detalle[0];
    const fecha_entrega = new Date();
    const fechaLimite = new Date(fecha_devolucion);
    const esTardio = fecha_entrega > fechaLimite;

    await query(
      `UPDATE detalle_prestamo
       SET devuelto = true,
           fecha_entrega = CURRENT_DATE,
           entrega_tardia = $1
       WHERE id_detalle = $2`,
      [esTardio, id_detalle]
    );

    await query(
      `UPDATE inventario SET disponibilidad = true WHERE id_inventario = $1`,
      [id_inventario]
    );

    res.status(200).json({
      message: 'Devolución registrada correctamente.',
      entrega_tardia: esTardio,
      detalle: esTardio ? 'El libro fue devuelto fuera de plazo.' : 'El libro fue devuelto a tiempo.'
    });

  } catch (error) {
    console.error('Error al procesar la devolución:', error);
    res.status(500).json({ message: 'Error al procesar la devolución.' });
  }
};

export const updateLoanEstado = async (req, res) => {
  const { id_prestamo, nuevo_estado, id_admin } = req.body;

  if (!['aceptado', 'rechazado'].includes(nuevo_estado)) {
    return res.status(400).json({ message: 'Estado inválido.' });
  }

  try {
    let result;

    if (nuevo_estado === 'aceptado') {
      if (!id_admin) {
        return res.status(400).json({ message: 'Se requiere el id_admin para aceptar un préstamo.' });
      }

      result = await query(
        `UPDATE prestamos
         SET estado = $1, id_admin = $2
         WHERE id_prestamo = $3
         RETURNING *`,
        [nuevo_estado, id_admin, id_prestamo]
      );

    } else {
      result = await query(
        `UPDATE prestamos
         SET estado = $1
         WHERE id_prestamo = $2
         RETURNING *`,
        [nuevo_estado, id_prestamo]
      );
    }

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Préstamo no encontrado.' });
    }

    res.status(200).json({
      message: `Estado actualizado a ${nuevo_estado}.`,
      prestamo: result.rows[0]
    });

  } catch (error) {
    console.error('Error al actualizar el estado del préstamo:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

export const getLoansPendientes = async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        p.id_prestamo,
        (u.nombres || ' ' || u.apellidos) AS usuario,
        p.fecha_prestamo,
        p.fecha_devolucion,
        p.estado,
        p.tipo_destino,
        dp.devuelto,
        dp.fecha_entrega,
        l.titulo AS libro_pedido,
        CASE 
          WHEN dp.devuelto = false AND CURRENT_DATE > p.fecha_devolucion THEN 'retrasado'
          WHEN p.estado = 'pendiente' THEN 'pendiente'
          ELSE 'otro'
        END AS estado_interno
      FROM prestamos p
      JOIN usuarios u ON u.dni = p.dni_usuario
      JOIN detalle_prestamo dp ON dp.id_prestamo = p.id_prestamo
      JOIN inventario i ON i.id_inventario = dp.id_inventario
      JOIN libros l ON l.codigo_libro = i.codigo_libro
      WHERE (dp.devuelto = false AND CURRENT_DATE > p.fecha_devolucion) 
         OR p.estado = 'pendiente'
      ORDER BY p.fecha_devolucion ASC
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener préstamos retrasados o pendientes:', error);
    res.status(500).json({ message: 'Error al obtener préstamos filtrados' });
  }
};
export const getUserLoanHistory = async (req, res) => {
  const { dni } = req.params;

  try {
    const result = await query(
      `SELECT 
        p.id_prestamo,
        l.titulo,
        p.fecha_prestamo,
        p.fecha_devolucion,
        dp.fecha_entrega,
        p.estado,
        dp.devuelto,
        CASE 
          WHEN p.estado = 'cancelado' THEN 'cancelado'
          WHEN dp.devuelto = true THEN 'devuelto'
          WHEN dp.devuelto = false AND CURRENT_DATE > p.fecha_devolucion THEN 'retrasado'
          WHEN dp.devuelto = false AND CURRENT_DATE <= p.fecha_devolucion THEN 'en curso'
          ELSE 'pendiente'
        END AS estado_actual
      FROM prestamos p
      LEFT JOIN detalle_prestamo dp ON p.id_prestamo = dp.id_prestamo
      LEFT JOIN inventario i ON dp.id_inventario = i.id_inventario
      LEFT JOIN libros l ON i.codigo_libro = l.codigo_libro
      WHERE p.dni_usuario = $1
      ORDER BY p.fecha_prestamo DESC`,
      [dni]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener historial de préstamos:', error);
    res.status(500).json({ message: 'Error al obtener historial' });
  }
};

export const cancelUserLoanRequest = async (req, res) => {
  const { id_prestamo } = req.params;

  try {
    const prestamo = await query(
      `SELECT estado FROM prestamos WHERE id_prestamo = $1`,
      [id_prestamo]
    );

    if (prestamo.rows.length === 0) {
      return res.status(404).json({ message: 'Préstamo no encontrado' });
    }

    if (prestamo.rows[0].estado !== 'pendiente') {
      return res.status(400).json({ message: 'No se puede cancelar un préstamo que no está pendiente' });
    }

    await query(`DELETE FROM detalle_prestamo WHERE id_prestamo = $1`, [id_prestamo]);

    await query(`DELETE FROM prestamos WHERE id_prestamo = $1`, [id_prestamo]);

    res.status(200).json({ message: 'Solicitud de préstamo cancelada correctamente' });
  } catch (error) {
    console.error('Error al cancelar préstamo:', error);
    res.status(500).json({ message: 'Error al cancelar préstamo' });
  }
};

export const getRecentAndDelayedLoans = async (req, res) => {
  const { filtro } = req.query; 

  let filtroSQL = '';
  const today = new Date().toISOString().split('T')[0]; 

  if (filtro === 'retrasados') {
    filtroSQL = `AND dp.devuelto = false AND p.fecha_devolucion < CURRENT_DATE`;
  } else if (filtro === 'pendientes') {
    filtroSQL = `AND p.estado = 'pendiente'`;
  }

  try {
    const result = await query(
      `SELECT 
         p.id_prestamo,
         (u.nombres || ' ' || u.apellidos) AS usuario,
         l.titulo AS libro_pedido,
         p.fecha_prestamo,
         p.fecha_devolucion,
         dp.devuelto,
         dp.fecha_entrega,
         p.estado
       FROM prestamos p
       JOIN usuarios u ON u.dni = p.dni_usuario
       JOIN detalle_prestamo dp ON dp.id_prestamo = p.id_prestamo
       JOIN inventario i ON i.id_inventario = dp.id_inventario
       JOIN libros l ON l.codigo_libro = i.codigo_libro
       WHERE 1=1 ${filtroSQL}
       ORDER BY p.fecha_prestamo DESC`
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener préstamos recientes/retrasados:', error);
    res.status(500).json({ message: 'Error al obtener préstamos filtrados' });
  }
};

export const getLoanHistorial = async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        p.id_prestamo,
        (u.nombres || ' ' || u.apellidos) AS usuario,
        p.fecha_prestamo,
        p.fecha_devolucion,
        p.estado,
        p.tipo_destino,
        dp.devuelto,
        dp.fecha_entrega,
        l.titulo AS libro_pedido,
        CASE 
          WHEN dp.devuelto = false AND CURRENT_DATE > p.fecha_devolucion THEN 'retrasado'
          WHEN p.estado = 'pendiente' THEN 'pendiente'
          WHEN p.estado = 'aceptado' THEN 'aceptado'
          ELSE 'otro'
        END AS estado_interno
      FROM prestamos p
      JOIN usuarios u ON u.dni = p.dni_usuario
      JOIN detalle_prestamo dp ON dp.id_prestamo = p.id_prestamo
      JOIN inventario i ON i.id_inventario = dp.id_inventario
      JOIN libros l ON l.codigo_libro = i.codigo_libro
      WHERE p.estado IN ('pendiente', 'aceptado')
      ORDER BY p.fecha_devolucion ASC
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener historial de préstamos:', error);
    res.status(500).json({ message: 'Error al obtener historial' });
  }
};

  
export const getLoanReport = async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        p.id_prestamo,
        p.dni_usuario AS dni,
        (u.nombres || ' ' || u.apellidos) AS usuario,
        p.fecha_prestamo,
        p.fecha_devolucion,
        p.estado,
        p.tipo_destino,
        dp.devuelto,
        dp.fecha_entrega,
        l.titulo AS libro,
        c.descripcion_categoria AS categoria,
        u.genero,
        CASE 
          WHEN dp.devuelto = false AND CURRENT_DATE > p.fecha_devolucion THEN 'retrasado'
          WHEN p.estado = 'pendiente' THEN 'pendiente'
          WHEN p.estado = 'aceptado' THEN 'aceptado'
          ELSE 'otro'
        END AS estado_interno
      FROM prestamos p
      JOIN usuarios u ON u.dni = p.dni_usuario
      JOIN detalle_prestamo dp ON dp.id_prestamo = p.id_prestamo
      JOIN inventario i ON i.id_inventario = dp.id_inventario
      JOIN libros l ON l.codigo_libro = i.codigo_libro
      JOIN notaciones_categoria c ON c.id_notacion_categoria = l.id_notaciones_categoria
      ORDER BY p.fecha_devolucion ASC;
    `);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener reporte de préstamos:', error);
    res.status(500).json({ message: 'Error al obtener el reporte de préstamos' });
  }
};

export const getLoansPendientesPorUsuario = async (req, res) => {
  const { dni } = req.params;

  try {
    const result = await query(`
      SELECT 
        p.id_prestamo,
        l.titulo AS libro,
        p.fecha_devolucion,
        dp.devuelto,
        CASE 
          WHEN dp.devuelto = false AND CURRENT_DATE > p.fecha_devolucion THEN 'retrasado'
          WHEN dp.devuelto = false AND CURRENT_DATE <= p.fecha_devolucion THEN 'pendiente'
          ELSE 'otro'
        END AS estado,
        (p.fecha_devolucion - CURRENT_DATE) AS dias_restantes
      FROM prestamos p
      JOIN detalle_prestamo dp ON dp.id_prestamo = p.id_prestamo
      JOIN inventario i ON i.id_inventario = dp.id_inventario
      JOIN libros l ON l.codigo_libro = i.codigo_libro
      WHERE p.dni_usuario = $1
        AND dp.devuelto = false
        AND p.estado IN ('pendiente', 'aceptado')
      ORDER BY p.fecha_devolucion ASC
    `, [dni]);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener préstamos pendientes por usuario:', error);
    res.status(500).json({ message: 'Error al obtener préstamos pendientes por usuario' });
  }
};
