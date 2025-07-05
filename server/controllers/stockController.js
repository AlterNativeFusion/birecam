import { query } from '../config/db.js';

export const registerBook = async (req, res) => {
    try {
        const {
            titulo,
            procedencia,
            autor_nombre,
            autor_apellido,
            editorial,
            condicion_general,
            observaciones,
            cantidad_total,
            id_notaciones_categoria,
            descripcion,
            precio_nuevo,
            valor_unitario,
            coeficiente_deprecacion
        } = req.body;

        const fecha_ingreso = new Date().toISOString();
        const apellido_lower = autor_apellido.toLowerCase();

        let notacionAutor = null;

        for (let len = 5; len >= 2; len--) {
            const fragmento = apellido_lower.slice(0, len);
            const result = await query(
                `SELECT * FROM notaciones_autor WHERE LOWER(iniciales_apellido) = $1 LIMIT 1`,
                [fragmento]
            );

            if (result.rows.length > 0) {
                notacionAutor = result.rows[0];
                break;
            }
        }

        if (!notacionAutor) {
            return res.status(400).json({ error: 'No se encontró una notación para el apellido del autor' });
        }

        const id_notaciones_autor = notacionAutor.id_notacion_autor;
        const codigo_autor = notacionAutor.codigo_autor;

        const notacionCategoriaResult = await query(
            `SELECT * FROM notaciones_categoria WHERE id_notacion_categoria = $1`,
            [id_notaciones_categoria]
        );

        if (notacionCategoriaResult.rows.length === 0) {
            return res.status(400).json({ error: 'Categoría no válida' });
        }

        const codigo_categoria = notacionCategoriaResult.rows[0].codigo_categoria;
        const primera_letra_apellido = autor_apellido.charAt(0).toUpperCase();
        const codigo_libro = `${codigo_categoria}${primera_letra_apellido}${codigo_autor}`;

        const libroExistenteResult = await query(
            `SELECT * FROM libros WHERE codigo_libro = $1`,
            [codigo_libro]
        );

        if (libroExistenteResult.rows.length === 0) {
            await query(
                `INSERT INTO libros (codigo_libro, id_notaciones_autor, id_notaciones_categoria, titulo, autor_apellido, autor_nombre, descripcion)
                VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [
                    codigo_libro,
                    id_notaciones_autor,
                    id_notaciones_categoria,
                    titulo,
                    autor_apellido,
                    autor_nombre,
                    descripcion
                ]
            );
        }

        for (let i = 0; i < cantidad_total; i++) {
            const disponibilidad = true;
            await query(
                `INSERT INTO inventario (
                    codigo_libro, fecha_ingreso, procedencia,
                    editorial, condicion_general, observaciones,
                    precio_nuevo, valor_unitario, coeficiente_deprecacion, disponibilidad
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                [
                    codigo_libro,
                    fecha_ingreso,
                    procedencia,
                    editorial,
                    condicion_general,
                    observaciones,
                    precio_nuevo,
                    valor_unitario,
                    coeficiente_deprecacion,
                    disponibilidad
                ]
            );
        }

        return res.status(201).json({ mensaje: 'Libro registrado correctamente', codigo_libro });

    } catch (error) {
        console.error('Error registrando libro:', error.message, error.stack);
        return res.status(500).json({ error: 'Error al registrar el libro' });
    }
};

export const getBook = async (req, res) => {
     try {
        const result = await query (
            `SELECT codigo_libro, titulo, (autor_nombre ||' '|| autor_apellido) AS autor, descripcion FROM libros`
        );
        res.json(result.rows);

    } catch(error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener libros' });
    };
};

export const getBookById = async (req, res) => {
  const { codigo_libro } = req.params;
  try {
    const result = await query(
      `SELECT codigo_libro, titulo, (autor_nombre || ' ' || autor_apellido) AS autor, descripcion
       FROM libros
       WHERE codigo_libro = $1`,
      [codigo_libro]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Libro no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener el libro' });
  }
};

export const getGroupedBooks = async (req, res) => {
  try {
    const result = await query(
      `SELECT 
        l.codigo_libro,
        l.titulo,
        (l.autor_nombre || ' ' || l.autor_apellido) AS autor_completo,
        l.descripcion,
        COUNT(*) AS total_disponibles
      FROM inventario i
      JOIN libros l ON i.codigo_libro = l.codigo_libro
      WHERE i.disponibilidad = true AND i.activo = true
      GROUP BY l.codigo_libro, l.titulo, l.autor_nombre, l.autor_apellido, l.descripcion
      ORDER BY l.titulo ASC;`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener libros agrupados:', error);
    res.status(500).json({ message: 'Error al obtener libros agrupados' });
  }
};


export const getStock = async (req, res) => {
  try {
    const result = await query(
      `SELECT 
        i.id_inventario,
        i.fecha_ingreso,
        l.titulo,
        (l.autor_nombre || ' ' || l.autor_apellido) AS autor_completo,
        l.codigo_libro,
        nc.descripcion_categoria AS categoria,
        i.editorial,
        i.procedencia,
        i.condicion_general,
        i.observaciones,
        i.disponibilidad,
        i.valor_unitario,
        i.precio_nuevo,
        i.coeficiente_deprecacion
      FROM inventario i
      JOIN libros l ON i.codigo_libro = l.codigo_libro
      JOIN notaciones_categoria nc ON l.id_notaciones_categoria = nc.id_notacion_categoria
      WHERE i.activo = true
      ORDER BY i.fecha_ingreso DESC;`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener libros' });
  }
};


export const filterStock = async (req, res) => {
  try {
    const { codigo_libro, autor, fecha, titulo, categoria } = req.query;

    let query = 
      `SELECT 
      i.id_inventario,
      i.fecha_ingreso,
      l.titulo,
      (l.autor_nombre || ' ' || l.autor_apellido) as autor,
      l.codigo_libro,
      nc.descripcion_categoria AS categoria,
      i.editorial,
      i.procedencia,
      i.condicion_general,
      i.observaciones,
      i.valor_unitario,
      i.coeficiente_deprecacion,
      i.precio_nuevo,
      i.disponibilidad
      FROM inventario i
      JOIN libros l ON i.codigo_libro = l.codigo_libro
      JOIN notaciones_categoria nc ON l.id_notaciones_categoria = nc.id_notacion_categoria
      WHERE 1=1
    `;

    const values = [];

    if (codigo_libro) {
      values.push(`%${codigo_libro}%`);
      query += ` AND l.codigo_libro ILIKE $${values.length}`;
    }

    if (autor) {
      values.push(`%${autor}%`);
      query += ` AND unaccent(lower(l.autor_nombre || ' ' || l.autor_apellido)) ILIKE unaccent(lower($${values.length}))`;
    }

    if (fecha) {
      values.push(fecha);
      query += ` AND DATE(i.fecha_ingreso) = $${values.length}`;
    }

    if (titulo) {
      values.push(`%${titulo}%`);
      query += ` AND l.titulo ILIKE $${values.length}`;
    }

    if (categoria) {
      values.push(`%${categoria}%`);
      query += ` AND nc.descripcion_categoria ILIKE $${values.length}`;
    }

    query += ` ORDER BY i.fecha_ingreso DESC`;

    const result = await query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al filtrar inventario:', error);
    res.status(500).json({ error: 'Error al filtrar inventario' });
  }
};

export const deleteStock = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Se requiere el ID del inventario a eliminar' });
    }

    const result = await query(
      `UPDATE inventario SET activo = false,  disponibilidad = false WHERE id_inventario = $1 RETURNING *`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Inventario no encontrado' });
    }

    return res.status(200).json({
      mensaje: 'Inventario dado de baja correctamente',
      actualizado: result.rows[0],
    });
  } catch (error) {
    console.error('Error al dar de baja el inventario:', error);
    return res.status(500).json({ error: 'Error al dar de baja inventario' });
  }
};

export const updateStock = async (req, res) => {
  try {
    const { id_inventario } = req.params;
    const {
      procedencia,
      editorial,
      condicion_general,
      observaciones,
      precio_nuevo,
      valor_unitario,
      coeficiente_deprecacion,
      disponibilidad,
      titulo,
      autor_nombre,
      autor_apellido,
      id_notaciones_categoria,
      descripcion,
      actualizarTodos
    } = req.body;

    const currentRows = await query(
      'SELECT * FROM inventario WHERE id_inventario = $1',
      [id_inventario]
    );
    if (currentRows.length === 0) {
      return res.status(404).json({ error: 'Inventario no encontrado' });
    }

    const current = currentRows[0];
    const newData = {
      procedencia: procedencia ?? current.procedencia,
      editorial: editorial ?? current.editorial,
      condicion_general: condicion_general ?? current.condicion_general,
      observaciones: observaciones ?? current.observaciones,
      precio_nuevo: precio_nuevo ?? current.precio_nuevo,
      valor_unitario: valor_unitario ?? current.valor_unitario,
      coeficiente_deprecacion: coeficiente_deprecacion ?? current.coeficiente_deprecacion,
      disponibilidad: disponibilidad ?? current.disponibilidad,
      titulo: titulo ?? null,
      autor_nombre: autor_nombre ?? null,
      autor_apellido: autor_apellido ?? null,
      descripcion: descripcion ?? null
    };

    let nuevoCodigoLibro = current.codigo_libro;

    if (titulo && autor_apellido) {
      const apellido_lower = autor_apellido.toLowerCase();
      let notacionAutor = null;

      for (let len = 5; len >= 2; len--) {
        const fragmento = apellido_lower.slice(0, len);
        const rows = await query(
          'SELECT * FROM notaciones_autor WHERE LOWER(iniciales_apellido) = $1 LIMIT 1',
          [fragmento]
        );
        if (rows.length > 0) {
          notacionAutor = rows[0];
          break;
        }
      }

      if (!notacionAutor) {
        return res.status(400).json({ error: 'No se encontró notación para el apellido del autor' });
      }

      const libroRows = await query(
        'SELECT * FROM libros WHERE codigo_libro = $1',
        [current.codigo_libro]
      );
      if (libroRows.length === 0) {
        return res.status(400).json({ error: 'No se encontró libro con ese código' });
      }

      const categoriaId = id_notaciones_categoria || libroRows[0].id_notaciones_categoria;

      const categoriaRows = await query(
        'SELECT * FROM notaciones_categoria WHERE id_notacion_categoria = $1',
        [categoriaId]
      );
      const notacionCategoria = categoriaRows[0];

      const primera_letra = autor_apellido.charAt(0).toUpperCase();
      nuevoCodigoLibro = `${notacionCategoria.codigo_categoria}${primera_letra}${notacionAutor.codigo_autor}`;

      const existe = await query(
        'SELECT 1 FROM libros WHERE codigo_libro = $1',
        [nuevoCodigoLibro]
      );

      if (existe.length === 0) {
        await query(
          `INSERT INTO libros 
          (codigo_libro, id_notaciones_autor, id_notaciones_categoria, titulo, autor_apellido, autor_nombre, descripcion)
          VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            nuevoCodigoLibro,
            notacionAutor.id_notacion_autor,
            notacionCategoria.id_notacion_categoria,
            newData.titulo,
            newData.autor_apellido,
            newData.autor_nombre,
            newData.descripcion
          ]
        );
      } else {
        await query(
          `UPDATE libros SET 
          titulo = $1, autor_apellido = $2, autor_nombre = $3, 
          id_notaciones_autor = $4, id_notaciones_categoria = $5,
          descripcion = $6
          WHERE codigo_libro = $7`,
          [
            newData.titulo,
            newData.autor_apellido,
            newData.autor_nombre,
            notacionAutor.id_notacion_autor,
            notacionCategoria.id_notacion_categoria,
            newData.descripcion,
            nuevoCodigoLibro
          ]
        );
      }
    }
    const updateQuery = `
      UPDATE inventario SET
        procedencia = $1,
        editorial = $2,
        condicion_general = $3,
        observaciones = $4,
        precio_nuevo = $5,
        valor_unitario = $6,
        coeficiente_deprecacion = $7,
        disponibilidad = $8,
        codigo_libro = $9
      ${actualizarTodos ? 'WHERE codigo_libro = $10' : 'WHERE id_inventario = $10'}
    `;
    await query(updateQuery, [
      newData.procedencia,
      newData.editorial,
      newData.condicion_general,
      newData.observaciones,
      newData.precio_nuevo,
      newData.valor_unitario,
      newData.coeficiente_deprecacion,
      newData.disponibilidad,
      nuevoCodigoLibro,
      actualizarTodos ? current.codigo_libro : id_inventario
    ]);

    res.json({
      mensaje: actualizarTodos
        ? 'Todos los inventarios con ese código fueron actualizados correctamente'
        : 'Inventario actualizado correctamente',
      codigo_libro: nuevoCodigoLibro
    });

  } catch (error) {
    console.error('Error en updateStock:', error);
    res.status(500).json({ error: 'Error actualizando el inventario' });
  }
};

export const getCategory = async (req, res) => {
  try {
    const result = await query(
      `SELECT id_notacion_categoria, descripcion_categoria FROM notaciones_categoria ORDER BY descripcion_categoria`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
};