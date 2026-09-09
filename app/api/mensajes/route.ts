import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

async function asegurarTablasMensajes() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS mensajes_internos (
        id SERIAL PRIMARY KEY,
        anuncio_id INT NOT NULL,
        emisor_id VARCHAR(255) NOT NULL,
        receptor_id VARCHAR(255) NOT NULL,
        mensaje TEXT NOT NULL,
        leido BOOLEAN DEFAULT false,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Alterar columnas emisor_id y receptor_id a VARCHAR(255) si eran INT
    await sql`ALTER TABLE mensajes_internos ALTER COLUMN emisor_id TYPE VARCHAR(255) USING emisor_id::text`;
    await sql`ALTER TABLE mensajes_internos ALTER COLUMN receptor_id TYPE VARCHAR(255) USING receptor_id::text`;
  } catch (e) {
    console.warn('Auto-migracion de mensajes:', e);
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const usuarioId = searchParams.get('usuario_id');
    const anuncioId = searchParams.get('anuncio_id');
    const otroUsuarioId = searchParams.get('conversacion_con');

    if (!usuarioId) {
      return NextResponse.json([]);
    }

    await asegurarTablasMensajes();

    const uStrId = String(usuarioId);

    // 1. SI SE SOLICITA EL HILO DE UN CHAT ESPECÍFICO
    if (anuncioId || otroUsuarioId) {
      const msgs = await sql`
        SELECT 
          m.id,
          m.anuncio_id,
          m.emisor_id,
          m.receptor_id,
          m.mensaje,
          m.leido,
          m.creado_en,
          COALESCE(e.nombre, 'Usuario') AS emisor_nombre,
          COALESCE(r.nombre, 'Usuario') AS receptor_nombre,
          a.titulo AS anuncio_titulo,
          a.foto1 AS anuncio_foto
        FROM mensajes_internos m
        LEFT JOIN perfiles e ON m.emisor_id::text = e.id::text
        LEFT JOIN perfiles r ON m.receptor_id::text = r.id::text
        LEFT JOIN anuncios a ON m.anuncio_id = a.id
        WHERE (m.emisor_id::text = ${uStrId} OR m.receptor_id::text = ${uStrId})
          ${anuncioId ? sql`AND m.anuncio_id = ${parseInt(anuncioId)}` : sql``}
          ${otroUsuarioId ? sql`AND (m.emisor_id::text = ${String(otroUsuarioId)} OR m.receptor_id::text = ${String(otroUsuarioId)})` : sql``}
        ORDER BY m.creado_en ASC
      `;
      return NextResponse.json(msgs);
    }

    // 2. BUZÓN GENERAL DE CONVERSACIONES AGRUPADAS
    const todasConversaciones = await sql`
      SELECT 
        m.id,
        m.anuncio_id,
        m.emisor_id,
        m.receptor_id,
        m.mensaje,
        m.leido,
        m.creado_en,
        COALESCE(e.nombre, 'Usuario') AS emisor_nombre,
        COALESCE(r.nombre, 'Usuario') AS receptor_nombre,
        a.titulo AS anuncio_titulo,
        a.foto1 AS anuncio_foto
      FROM mensajes_internos m
      LEFT JOIN perfiles e ON m.emisor_id::text = e.id::text
      LEFT JOIN perfiles r ON m.receptor_id::text = r.id::text
      LEFT JOIN anuncios a ON m.anuncio_id = a.id
      WHERE m.emisor_id::text = ${uStrId} OR m.receptor_id::text = ${uStrId}
      ORDER BY m.creado_en DESC
    `;

    return NextResponse.json(todasConversaciones);
  } catch (error) {
    console.error('Error al obtener mensajes internos:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { anuncio_id, emisor_id, receptor_id, mensaje } = body;

    if (!anuncio_id || !emisor_id || !receptor_id || !mensaje) {
      return NextResponse.json({ error: 'Faltan datos obligatorios para el mensaje.' }, { status: 400 });
    }

    await asegurarTablasMensajes();

    const insertado = await sql`
      INSERT INTO mensajes_internos (anuncio_id, emisor_id, receptor_id, mensaje)
      VALUES (${parseInt(anuncio_id)}, ${String(emisor_id)}, ${String(receptor_id)}, ${String(mensaje).trim()})
      RETURNING id, creado_en
    `;

    return NextResponse.json({ success: true, id: insertado[0].id });
  } catch (error) {
    console.error('Error al enviar mensaje interno:', error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Error al enviar mensaje: ${msg}` }, { status: 500 });
  }
}

