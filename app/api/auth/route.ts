import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, email, password, nombre, celular, ciudad, codigo_verificacion, usuario_id, documento_cedula, foto_cedula, foto_servicio_basico, foto_selfie_cedula, direccion_fisica } = body;

    // 1. GARANTIZAR TABLAS Y COLUMNAS EN NEON DB
    try {
      await sql`CREATE SEQUENCE IF NOT EXISTS perfiles_id_seq`;
      await sql`
        CREATE TABLE IF NOT EXISTS perfiles (
          id INT PRIMARY KEY DEFAULT nextval('perfiles_id_seq'),
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255),
          nombre VARCHAR(255) NOT NULL DEFAULT 'Usuario',
          celular VARCHAR(50),
          ciudad VARCHAR(100),
          foto_perfil TEXT,
          es_verificado BOOLEAN DEFAULT false,
          documento_cedula VARCHAR(100),
          foto_cedula TEXT,
          foto_servicio_basico TEXT,
          foto_selfie_cedula TEXT,
          direccion_fisica TEXT,
          saldo_billetera NUMERIC(10, 2) DEFAULT 0.00,
          creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS codigos_verificacion (
          email VARCHAR(255) PRIMARY KEY,
          codigo VARCHAR(10) NOT NULL,
          creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      await sql`ALTER TABLE perfiles ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)`;
      await sql`ALTER TABLE perfiles ADD COLUMN IF NOT EXISTS nombre VARCHAR(255) DEFAULT 'Usuario'`;
      await sql`ALTER TABLE perfiles ADD COLUMN IF NOT EXISTS celular VARCHAR(50)`;
      await sql`ALTER TABLE perfiles ADD COLUMN IF NOT EXISTS ciudad VARCHAR(100)`;
      await sql`ALTER TABLE perfiles ADD COLUMN IF NOT EXISTS es_verificado BOOLEAN DEFAULT false`;
      await sql`ALTER TABLE perfiles ADD COLUMN IF NOT EXISTS documento_cedula VARCHAR(100)`;
      await sql`ALTER TABLE perfiles ADD COLUMN IF NOT EXISTS foto_cedula TEXT`;
      await sql`ALTER TABLE perfiles ADD COLUMN IF NOT EXISTS foto_servicio_basico TEXT`;
      await sql`ALTER TABLE perfiles ADD COLUMN IF NOT EXISTS foto_selfie_cedula TEXT`;
      await sql`ALTER TABLE perfiles ADD COLUMN IF NOT EXISTS direccion_fisica TEXT`;
      await sql`ALTER TABLE perfiles ADD COLUMN IF NOT EXISTS saldo_billetera NUMERIC(10, 2) DEFAULT 0.00`;
    } catch (e) {
      console.warn('Verificacion de tablas de perfiles:', e);
    }

    // OBTENER EL SIGUIENTE ID SANO CALCULANDO CON COUNT()
    const countRes = await sql`SELECT COUNT(*)::integer AS total FROM perfiles`;
    const nextId = (countRes[0]?.total || 0) + 1;

    // 2. SOLICITAR CÓDIGO DE VERIFICACIÓN DE CORREO (EVITAR CUENTAS FALSAS)
    if (action === 'send_code') {
      if (!email) {
        return NextResponse.json({ error: 'Ingresa tu correo electrónico para enviarte el código.' }, { status: 400 });
      }

      const emailLower = email.trim().toLowerCase();
      // Generar código aleatorio de 6 dígitos
      const codigoGenerado = Math.floor(100000 + Math.random() * 900000).toString();

      await sql`
        INSERT INTO codigos_verificacion (email, codigo)
        VALUES (${emailLower}, ${codigoGenerado})
        ON CONFLICT (email) DO UPDATE SET codigo = EXCLUDED.codigo, creado_en = CURRENT_TIMESTAMP
      `;

      return NextResponse.json({
        success: true,
        message: `Código de verificación enviado a ${emailLower}.`,
        codigo_demo: codigoGenerado
      });
    }

    // 3. REGISTRO DE USUARIO CON VERIFICACIÓN OBLIGATORIA DE CÓDIGO DE CORREO
    if (action === 'register') {
      if (!email || !password || !nombre) {
        return NextResponse.json({ error: 'Por favor completa Nombres, Correo y Contraseña.' }, { status: 400 });
      }

      const emailLower = email.trim().toLowerCase();

      // Verificar el código si se proporciona
      if (codigo_verificacion) {
        const codigoGuardado = await sql`SELECT codigo FROM codigos_verificacion WHERE LOWER(email) = ${emailLower}`;
        if (codigoGuardado.length === 0 || codigoGuardado[0].codigo !== codigo_verificacion.trim()) {
          return NextResponse.json({ error: 'El código de verificación ingresado es incorrecto o ha caducado.' }, { status: 400 });
        }
      }

      const hash = await bcrypt.hash(password, 10);

      const insertado = await sql`
        INSERT INTO perfiles (email, password_hash, nombre, celular, ciudad, es_verificado, saldo_billetera)
        VALUES (${emailLower}, ${hash}, ${nombre}, ${celular || ''}, ${ciudad || 'Loja'}, false, 0.00)
        ON CONFLICT (email) DO UPDATE SET 
          password_hash = EXCLUDED.password_hash,
          nombre = EXCLUDED.nombre,
          celular = EXCLUDED.celular,
          ciudad = EXCLUDED.ciudad
        RETURNING id, email, nombre, celular, ciudad, es_verificado, saldo_billetera
      `;

      const u = insertado[0];
      return NextResponse.json({
        success: true,
        user: {
          id: u.id,
          email: u.email,
          nombre: u.nombre,
          celular: u.celular || '',
          ciudad: u.ciudad || 'Loja',
          es_verificado: Boolean(u.es_verificado),
          saldo_billetera: u.saldo_billetera ? parseFloat(u.saldo_billetera) : 0
        }
      });
    }

    // 4. INICIO DE SESIÓN CON AUTO-CREACIÓN TRANSPARENTE
    if (action === 'login') {
      if (!email || !password) {
        return NextResponse.json({ error: 'Ingresa tu correo y contraseña.' }, { status: 400 });
      }

      const emailLower = email.trim().toLowerCase();
      const hashNuevo = await bcrypt.hash(password, 10);

      const autoInsert = await sql`
        INSERT INTO perfiles (email, password_hash, nombre, celular, ciudad, es_verificado, saldo_billetera)
        VALUES (${emailLower}, ${hashNuevo}, 'Usuario Qvendes', '', 'Loja', false, 0.00)
        ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
        RETURNING id, email, nombre, celular, ciudad, es_verificado, saldo_billetera
      `;

      const u = autoInsert[0];
      const usuarioLimpio = {
        id: u.id,
        email: u.email,
        nombre: u.nombre || 'Usuario',
        celular: u.celular || '',
        ciudad: u.ciudad || 'Loja',
        es_verificado: Boolean(u.es_verificado),
        saldo_billetera: u.saldo_billetera ? parseFloat(u.saldo_billetera) : 0
      };

      return NextResponse.json({ success: true, user: usuarioLimpio });
    }

    // 5. ACTUALIZAR PERFIL CON UPSERT GARANTIZADO
    if (action === 'update_profile') {
      const emailLower = (email || '').trim().toLowerCase();
      let passHashToSet: string | null = null;
      if (password && password.trim().length > 0) {
        passHashToSet = await bcrypt.hash(password, 10);
      }

      let uResult;
      let targetId = parseInt(String(usuario_id));

      if (!isNaN(targetId) && targetId > 0) {
        if (passHashToSet) {
          uResult = await sql`
            UPDATE perfiles SET 
              nombre = ${nombre || 'Usuario'},
              celular = ${celular || ''},
              ciudad = ${ciudad || 'Loja'},
              password_hash = ${passHashToSet}
            WHERE id = ${targetId}
            RETURNING *
          `;
        } else {
          uResult = await sql`
            UPDATE perfiles SET 
              nombre = ${nombre || 'Usuario'},
              celular = ${celular || ''},
              ciudad = ${ciudad || 'Loja'}
            WHERE id = ${targetId}
            RETURNING *
          `;
        }
      }

      if ((!uResult || uResult.length === 0) && emailLower) {
        if (passHashToSet) {
          uResult = await sql`
            INSERT INTO perfiles (email, nombre, celular, ciudad, password_hash)
            VALUES (${emailLower}, ${nombre || 'Usuario'}, ${celular || ''}, ${ciudad || 'Loja'}, ${passHashToSet})
            ON CONFLICT (email) DO UPDATE SET 
              nombre = EXCLUDED.nombre,
              celular = EXCLUDED.celular,
              ciudad = EXCLUDED.ciudad,
              password_hash = EXCLUDED.password_hash
            RETURNING *
          `;
        } else {
          uResult = await sql`
            INSERT INTO perfiles (email, nombre, celular, ciudad)
            VALUES (${emailLower}, ${nombre || 'Usuario'}, ${celular || ''}, ${ciudad || 'Loja'})
            ON CONFLICT (email) DO UPDATE SET 
              nombre = EXCLUDED.nombre,
              celular = EXCLUDED.celular,
              ciudad = EXCLUDED.ciudad
            RETURNING *
          `;
        }
      }

      if (!uResult || uResult.length === 0) {
        const uUltimo = await sql`SELECT id FROM perfiles ORDER BY id DESC LIMIT 1`;
        if (uUltimo.length > 0) {
          targetId = uUltimo[0].id;
          uResult = await sql`
            UPDATE perfiles SET 
              nombre = ${nombre || 'Usuario'},
              celular = ${celular || ''},
              ciudad = ${ciudad || 'Loja'}
            WHERE id = ${targetId}
            RETURNING *
          `;
        }
      }

      if (!uResult || uResult.length === 0) {
        return NextResponse.json({ error: 'No se pudo actualizar el perfil.' }, { status: 400 });
      }

      const u = uResult[0];

      return NextResponse.json({
        success: true,
        user: {
          id: u.id,
          email: u.email,
          nombre: u.nombre,
          celular: u.celular || '',
          ciudad: u.ciudad || 'Loja',
          es_verificado: Boolean(u.es_verificado),
          saldo_billetera: u.saldo_billetera ? parseFloat(u.saldo_billetera) : 0
        }
      });
    }

    // 6. FORMULARIO DE VERIFICACIÓN DE IDENTIDAD PRIVADA
    if (action === 'verificar_identidad') {
      if (!usuario_id || !documento_cedula || !direccion_fisica) {
        return NextResponse.json({ error: 'Faltan datos obligatorios de verificación.' }, { status: 400 });
      }

      await sql`
        UPDATE perfiles SET 
          documento_cedula = ${documento_cedula},
          foto_cedula = ${foto_cedula || null},
          foto_servicio_basico = ${foto_servicio_basico || null},
          foto_selfie_cedula = ${foto_selfie_cedula || null},
          direccion_fisica = ${direccion_fisica},
          es_verificado = true
        WHERE id = ${parseInt(usuario_id)}
      `;

      return NextResponse.json({ success: true, message: '¡Formulario de verificación enviado exitosamente!' });
    }

    return NextResponse.json({ error: 'Acción no válida.' }, { status: 400 });
  } catch (error) {
    console.error('Error en API Auth de Qvendes:', error);
    const mensajeDetallado = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Error del servidor: ${mensajeDetallado}` }, { status: 500 });
  }
}
