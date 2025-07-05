import { query } from '../config/db.js';
import bcrypt from 'bcrypt';

const estructuraUsuario = (user) => {
    const {
        dni, nombres, apellidos, tipo_usuario, genero, correo, telefono,
        grado,seccion,
        area,condicion,
        institucion_origen
    }= user;

    let datos_especificos = {};
    if (tipo_usuario === 'alumno') {
        datos_especificos = { grado, seccion };
    } else if (tipo_usuario === 'empleado') {
        datos_especificos = { area, condicion };
    } else if (tipo_usuario === 'foraneo') {
        datos_especificos = { institucion_origen };
    };
    return {
        dni, nombres, apellidos, tipo_usuario,
        genero, correo, telefono,
        datos_especificos
    };
};

 export const registerUser = async (req, res) => {
    const data = req.body;

    const { dni, nombres, apellidos, tipo_usuario, genero, correo, telefono, password } = data;

    if (!dni || !nombres || !apellidos || !tipo_usuario || !genero || !correo || !telefono || !password) {
        return res.status(400).json({ error: 'Faltan campos obligatorios del usuario' });
    };

    if (password.length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    if (tipo_usuario === 'alumno') {
        if (!data.grado || !data.seccion) {
            return res.status(400).json({ error: 'Faltan grado o sección para alumno' });
        }
    } else if (tipo_usuario === 'empleado') {
        if (!data.area || !data.condicion) {
            return res.status(400).json({ error: 'Faltan área o condición para empleado' });
        }
    } else if (tipo_usuario === 'foraneo') {
        if (!data.institucion_origen) {
            return res.status(400).json({ error: 'Falta institución de origen para foráneo' });
        }
    } else {
        return res.status(400).json({ error: 'Tipo de usuario no válido' });
    }

    try {

        const existingUser = await query('SELECT dni FROM usuarios WHERE dni = $1', [dni]);
        if (existingUser.rowCount > 0) {
            return res.status(400).json({ error: 'El DNI ya está registrado' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        await query(
            `INSERT INTO public.usuarios( dni, nombres, apellidos, tipo_usuario, genero, correo, telefono, password_hash) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [dni, nombres, apellidos, tipo_usuario, genero, correo, telefono, hashedPassword]
        );

        if (tipo_usuario === 'alumno') {
            const { grado, seccion } = data;
            await query(
                `INSERT INTO alumnos (dni, grado, seccion) VALUES ($1, $2, $3)`,
                [dni, grado, seccion]
            );
        } else if (tipo_usuario === 'empleado') {
            const { area, condicion } = data;
            await query(
                `INSERT INTO empleados (dni, area, condicion) VALUES ($1, $2, $3)`,
                [dni, area, condicion]
            );
        } else if (tipo_usuario === 'foraneo') {
            const { institucion_origen } = data;
            await query(
                `INSERT INTO foraneos (dni, institucion_origen) VALUES ($1, $2)`,
                [dni, institucion_origen]
            );
        }

        const { rows } = await query(`
            SELECT u.*, a.grado, a.seccion, e.area, e.condicion, f.institucion_origen
            FROM usuarios u
            LEFT JOIN alumnos a ON u.dni = a.dni
            LEFT JOIN empleados e ON u.dni = e.dni
            LEFT JOIN foraneos f ON u.dni = f.dni
            WHERE u.dni = $1`, [dni]
        );

        const datosCompletos = estructuraUsuario(rows[0]);
        return res.json(datosCompletos);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error al crear el usuario' });
    }
};


export const getUser = async (req, res) => {
    try {
        const result = await query (
            `SELECT u.*, a.grado, a.seccion,
                   e.area, e.condicion,
                   f.institucion_origen
            FROM usuarios u
            LEFT JOIN alumnos a ON u.dni = a.dni
            LEFT JOIN empleados e ON u.dni = e.dni
            LEFT JOIN foraneos f ON u.dni = f.dni`
        );

        const usuarios = result.rows.map(estructuraUsuario);
        res.json(usuarios);
    } catch(error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener usuarios' });
    };
};

export const getUserByDni = async (req, res) => {
    const {dni} = req.params;
    try {
        const result = await query(
            `SELECT u.*, a.grado, a.seccion,
                   e.area, e.condicion,
                   f.institucion_origen
            FROM usuarios u
            LEFT JOIN alumnos a ON u.dni = a.dni
            LEFT JOIN empleados e ON u.dni = e.dni
            LEFT JOIN foraneos f ON u.dni = f.dni
            WHERE u.dni = $1`, [dni]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({message: 'Usuario no encontrado'});
        };

        const usuario = estructuraUsuario(result.rows[0]);
        res.json(usuario);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener usuario' });
    }
};

export const deleteUser = async (req, res) => {
    const {dni} = req.params;

    try {
        const userResult = await query(
            `SELECT tipo_usuario FROM usuarios WHERE dni = $1`, [dni]
        );

        if (userResult.rowCount === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const tipo_usuario = userResult.rows[0].tipo_usuario;

        if (tipo_usuario === `alumno`){
            await query('DELETE FROM alumnos WHERE dni = $1', [dni]);
        } else if (tipo_usuario === 'empleado') {
            await query('DELETE FROM empleados WHERE dni = $1', [dni]);
        } else if (tipo_usuario === 'foraneo') {
            await query('DELETE FROM foraneos WHERE dni = $1', [dni]);
        }

        await query('DELETE FROM usuarios WHERE dni = $1', [dni]);
            return res.status(200).json({ message: 'Usuario eliminado correctamente' });
    }catch (error) {
        return res.status(500).json({ error: 'Error interno al eliminar usuario' });
    }
};

export const updateUser = async (req, res) => {
    const {dni} = req.params;
    const data = req.body;

    try {
        const userCheck = await query('SELECT tipo_usuario FROM usuarios WHERE dni = $1', [dni]);

        if (userCheck.rowCount === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const tipo_usuario= userCheck.rows[0].tipo_usuario;

        await query(
            `UPDATE usuarios 
             SET nombres = $1, apellidos = $2, genero = $3, correo = $4, telefono = $5
             WHERE dni = $6`,
            [data.nombres, data.apellidos, data.genero, data.correo, data.telefono, dni]
        );

        if(tipo_usuario ==='alumno') {
            const { grado, seccion } = data;
            await query(
                `UPDATE alumnos 
                 SET grado = $1, seccion = $2 
                 WHERE dni = $3`,
                [grado, seccion, dni]
            );
        } else if (tipo_usuario === 'empleado') {
            const { area, condicion } = data;
            await query(
                `UPDATE empleados 
                 SET area = $1, condicion = $2 
                 WHERE dni = $3`,
                [area, condicion, dni]
            );
        } else if (tipo_usuario === 'foraneo') {
            const { institucion_origen } = data;
            await query(
                `UPDATE foraneos 
                 SET institucion_origen = $1 
                 WHERE dni = $2`,
                [institucion_origen, dni]
            );
        }

        return res.status(200).json({ message: 'Usuario actualizado correctamente' });
    } catch (error) {
        console.error('Error actualizando usuario:', error);
        return res.status(500).json({ error: 'Error interno al actualizar usuario' });
    }
};

export const searchUsers = async (req, res) => {
    const { nombre } = req.query;

    if (!nombre) {
        return res.status(400).json({ error: 'Se requiere un nombre o apellido para buscar.' });
    }

    try {
        const result = await query(`
            SELECT u.*, a.grado, a.seccion,
                   e.area, e.condicion,
                   f.institucion_origen
            FROM usuarios u
            LEFT JOIN alumnos a ON u.dni = a.dni
            LEFT JOIN empleados e ON u.dni = e.dni
            LEFT JOIN foraneos f ON u.dni = f.dni
            WHERE u.nombres ILIKE $1 OR u.apellidos ILIKE $1
        `, [`%${nombre}%`]);

        const usuarios = result.rows.map(estructuraUsuario);
        res.json(usuarios);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al buscar usuarios' });
    }
};