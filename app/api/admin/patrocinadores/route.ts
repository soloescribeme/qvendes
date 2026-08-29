import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS patrocinadores_admin (
          id SERIAL PRIMARY KEY,
          cliente_nombre VARCHAR(255) NOT NULL,
          cliente_email VARCHAR(255),
          num_comprobante VARCHAR(100),
          monto NUMERIC(10, 2) DEFAULT 0.00,
          palabras_clave TEXT NOT NULL,
          titulo VARCHAR(255) NOT NULL,
          descripcion TEXT,
          foto1 TEXT,
          url_destino TEXT,
          periodo_tipo VARCHAR(20) DEFAULT 'dias',
          periodo_valor INT DEFAULT 7,
          franja_inicio VARCHAR(10) DEFAULT '00:00',
          franja_fin VARCHAR(10) DEFAULT '23:59',
          fecha_vencimiento TIMESTAMP,
          estado VARCHAR(50) DEFAULT 'vigente',
          creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
    } catch {
      // Ignorar si existe
    }

    const patrocinadores = await sql`
      SELECT 
        id,
        cliente_nombre,
        cliente_email,
        num_comprobante,
        monto::float AS monto,
        palabras_clave,
        titulo,
        descripcion,
        foto1,
        url_destino,
        periodo_tipo,
        periodo_valor,
        franja_inicio,
        franja_fin,
        fecha_vencimiento,
        estado,
        creado_en
      FROM patrocinadores_admin
      ORDER BY creado_en DESC
    `;

    // Actualizar estados automáticamente si expiró la fecha de vencimiento
    const ahora = new Date();
    const actualizados = patrocinadores.map(p => {
      let est = p.estado;
      if (p.fecha_vencimiento && new Date(p.fecha_vencimiento) < ahora && est === 'vigente') {
        est = 'caducado';
      }
      return {
        ...p,
        estado: est
      };
    });

    return NextResponse.json(actualizados);
  } catch (error) {
    console.error('Error al consultar patrocinadores:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cliente_nombre, cliente_email, num_comprobante, monto, palabras_clave, titulo, descripcion, foto1, url_destino, periodo_tipo, periodo_valor, franja_inicio, franja_fin } = body;

    if (!cliente_nombre || !palabras_clave || !titulo) {
      return NextResponse.json({ error: 'Faltan datos obligatorios para el patrocinador.' }, { status: 400 });
    }

    // Calcular fecha de vencimiento según horas o días
    const ahora = new Date();
    const val = parseInt(periodo_valor || 1);
    if (periodo_tipo === 'horas') {
      ahora.setHours(ahora.getHours() + val);
    } else {
      ahora.setDate(ahora.getDate() + val);
    }

    const insertado = await sql`
      INSERT INTO patrocinadores_admin (
        cliente_nombre, cliente_email, num_comprobante, monto, palabras_clave, titulo, descripcion,
        foto1, url_destino, periodo_tipo, periodo_valor, franja_inicio, franja_fin, fecha_vencimiento, estado
      ) VALUES (
        ${cliente_nombre}, ${cliente_email || null}, ${num_comprobante || null}, ${monto ? parseFloat(monto) : 0},
        ${palabras_clave}, ${titulo}, ${descripcion || ''}, ${foto1 || null}, ${url_destino || '#'},
        ${periodo_tipo || 'dias'}, ${val}, ${franja_inicio || '08:00'}, ${franja_fin || '20:00'},
        ${ahora.toISOString()}, 'vigente'
      )
      RETURNING id
    `;

    return NextResponse.json({ success: true, id: insertado[0].id });
  } catch (error) {
    console.error('Error al registrar patrocinador:', error);
    return NextResponse.json({ error: 'Error al registrar el anuncio patrocinado.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, estado } = body;

    if (!id || !estado) {
      return NextResponse.json({ error: 'Id y estado requeridos.' }, { status: 400 });
    }

    await sql`
      UPDATE patrocinadores_admin SET estado = ${estado} WHERE id = ${parseInt(id)}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al actualizar estado del patrocinador:', error);
    return NextResponse.json({ error: 'Error al actualizar.' }, { status: 500 });
  }
}
