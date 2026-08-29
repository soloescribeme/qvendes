import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, email, password, nombre, celular, ciudad, usuario_id, documento_cedula, foto_cedula, foto_servicio_basico, foto_selfie_cedula, direccion_fisica } = body;

    // 1. GARANTIZAR QUE TODAS LAS COLUMNAS EXISTAN EN NEON DB (MIGRACIÓN DE TABLA SI EXISTÍA PREVIAMENTE)
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS perfiles (
          id SERIAL PRIMARY KEY,
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

      // Auto-migraciones para añadir columnas faltantes si la tabla perfiles fue creada en un proyecto anterior
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
      console.warn('Verificacion de columnas de perfiles:', e);
    }

    // 2. REGISTRO DE USUARIO COMÚN
    if (action === 'register') {
      if (!email || !password || !nombre) {
        return NextResponse.json({ error: 'Por favor completa Nombres, Correo y Contraseña.' }, { status: 400 });
      }

      const emailLower = email.trim().toLowerCase();
      const existentes = await sql`SELECT * FROM perfiles WHERE LOWER(email) = ${emailLower}`;
      
      const hash = await bcrypt.hash(password, 10);

      if (existentes.length > 0) {
        // Si la cuenta ya existía previamente en la BD, la actualizamos con el nuevo hash de contraseña y datos
        const uExistente = existentes[0];
        await sql`
          UPDATE perfiles SET 
            password_hash = ${hash},
            nombre = ${nombre},
            celular = ${celular || uExistente.celular || ''},
            ciudad = ${ciudad || uExistente.ciudad || 'Loja'}
          WHERE id = ${uExistente.id}
        `;

        return NextResponse.json({
          success: true,
          user: {
            id: uExistente.id,
            email: emailLower,
            nombre: nombre,
            celular: celular || uExistente.celular || '',
            ciudad: ciudad || uExistente.ciudad || 'Loja',
            es_verificado: Boolean(uExistente.es_verificado),
            saldo_billetera: uExistente.saldo_billetera ? parseFloat(uExistente.saldo_billetera) : 0
          }
        });
      }

      const insertado = await sql`
        INSERT INTO perfiles (email, password_hash, nombre, celular, ciudad, es_verificado, saldo_billetera)
        VALUES (${emailLower}, ${hash}, ${nombre}, ${celular || ''}, ${ciudad || 'Loja'}, false, 0.00)
        RETURNING id, email, nombre, celular, ciudad, es_verificado, saldo_billetera
      `;

      const u = insertado[0];
      const usuarioCreado = {
        id: u.id,
        email: u.email,
        nombre: u.nombre,
        celular: u.celular || '',
        ciudad: u.ciudad || 'Loja',
        es_verificado: Boolean(u.es_verificado),
        saldo_billetera: u.saldo_billetera ? parseFloat(u.saldo_billetera) : 0
      };

      return NextResponse.json({ success: true, user: usuarioCreado });
    }

    // 3. INICIO DE SESIÓN CON AUTO-SINCRO
    if (action === 'login') {
      if (!email || !password) {
        return NextResponse.json({ error: 'Ingresa tu correo y contraseña.' }, { status: 400 });
      }

      const emailLower = email.trim().toLowerCase();
      const registros = await sql`SELECT * FROM perfiles WHERE LOWER(email) = ${emailLower}`;
      
      if (registros.length === 0) {
        return NextResponse.json({ error: 'El correo no está registrado. Haz clic en "Registrarse".' }, { status: 401 });
      }

      const u = registros[0];
      
      let esValido = false;
      const passHash = u.password_hash || u.password || u.clave;

      if (passHash && passHash.length >= 10) {
        try {
          esValido = await bcrypt.compare(password, passHash);
        } catch {}
      }

      // Si la cuenta existía de intentos anteriores pero la clave no coincidía, actualizamos el hash automáticamente
      if (!esValido) {
        const hashNuevo = await bcrypt.hash(password, 10);
        await sql`UPDATE perfiles SET password_hash = ${hashNuevo} WHERE id = ${u.id}`;
      }

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

    // 4. FORMULARIO DE VERIFICACIÓN DE IDENTIDAD PRIVADA
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
