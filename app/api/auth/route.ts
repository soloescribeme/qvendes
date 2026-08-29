import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, email, password, nombre, celular, ciudad, usuario_id, documento_cedula, foto_cedula, foto_servicio_basico, foto_selfie_cedula, direccion_fisica } = body;

    // 1. INICIALIZAR TABLAS EN NEON DB SI NO EXISTEN
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS perfiles (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          nombre VARCHAR(255) NOT NULL,
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
    } catch (e) {
      console.warn('Tabla perfiles ya existente o error de creacion:', e);
    }

    // 2. REGISTRO DE USUARIO COMÚN (Nombres, Ciudad, Teléfono, Correo, Password)
    if (action === 'register') {
      if (!email || !password || !nombre) {
        return NextResponse.json({ error: 'Por favor completa Nombres, Correo y Contraseña.' }, { status: 400 });
      }

      const emailLower = email.trim().toLowerCase();
      const existentes = await sql`SELECT id FROM perfiles WHERE LOWER(email) = ${emailLower}`;
      if (existentes.length > 0) {
        return NextResponse.json({ error: 'El correo electrónico ya está registrado.' }, { status: 400 });
      }

      const hash = await bcrypt.hash(password, 10);
      const insertado = await sql`
        INSERT INTO perfiles (email, password_hash, nombre, celular, ciudad)
        VALUES (${emailLower}, ${hash}, ${nombre}, ${celular || ''}, ${ciudad || 'Loja'})
        RETURNING id, email, nombre, celular, ciudad, es_verificado, saldo_billetera
      `;

      return NextResponse.json({ success: true, user: insertado[0] });
    }

    // 3. INICIO DE SESIÓN
    if (action === 'login') {
      if (!email || !password) {
        return NextResponse.json({ error: 'Ingresa tu correo y contraseña.' }, { status: 400 });
      }

      const emailLower = email.trim().toLowerCase();
      const registros = await sql`SELECT * FROM perfiles WHERE LOWER(email) = ${emailLower}`;
      if (registros.length === 0) {
        return NextResponse.json({ error: 'Credenciales incorrectas o usuario no registrado.' }, { status: 401 });
      }

      const u = registros[0];
      const esValido = await bcrypt.compare(password, u.password_hash);
      if (!esValido) {
        return NextResponse.json({ error: 'Contraseña incorrecta.' }, { status: 401 });
      }

      const usuarioLimpio = {
        id: u.id,
        email: u.email,
        nombre: u.nombre,
        celular: u.celular,
        ciudad: u.ciudad,
        es_verificado: u.es_verificado,
        saldo_billetera: u.saldo_billetera
      };

      return NextResponse.json({ success: true, user: usuarioLimpio });
    }

    // 4. FORMULARIO DE VERIFICACIÓN DE IDENTIDAD (100% PRIVADO RESERVADO DE LA PLATAFORMA)
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

      return NextResponse.json({ success: true, message: '¡Formulario de verificación enviado exitosamente! Insignia asignada.' });
    }

    return NextResponse.json({ error: 'Acción no válida.' }, { status: 400 });
  } catch (error) {
    console.error('Error en API Auth de Qvendes:', error);
    return NextResponse.json({ error: 'Error al procesar la solicitud en el servidor.' }, { status: 500 });
  }
}
