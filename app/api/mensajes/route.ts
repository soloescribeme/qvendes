import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const usuarioId = searchParams.get('usuario_id');
    const anuncioId = searchParams.get('anuncio_id');

    if (!usuarioId) {
      return NextResponse.json([]);
    }

    try {
      await sql`
        CREATE TABLE IF NOT EXISTS mensajes_internos (
          id SERIAL PRIMARY KEY,
          anuncio_id INT NOT NULL,
          emisor_id INT NOT NULL,
          receptor_id INT NOT NULL,
          mensaje TEXT NOT NULL,
          leido BOOLEAN DEFAULT false,
          creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
    } catch {
      // Ignorar si existe
    }

    let query;
    if (anuncioId) {
      query = await sql`
        SELECT 
          m.id,
          m.anuncio_id,
          m.emisor_id,
          m.receptor_id,
          m.mensaje,
          m.leido,
          m.creado_en,
          e.nombre AS emisor_nombre,
          r.nombre AS receptor_nombre
        FROM mensajes_internos m
        LEFT JOIN perfiles e ON m.emisor_id = e.id
        LEFT JOIN perfiles r ON m.receptor_id = r.id
        WHERE m.anuncio_id = ${parseInt(anuncioId)}
          AND (m.emisor_id = ${parseInt(usuarioId)} OR m.receptor_id = ${parseInt(usuarioId)})
        ORDER BY m.creado_en ASC
      `;
    } else {
      query = await sql`
        SELECT 
          m.id,
          m.anuncio_id,
          m.emisor_id,
          m.receptor_id,
          m.mensaje,
          m.leido,
          m.creado_en,
          e.nombre AS emisor_nombre,
          r.nombre AS receptor_nombre
        FROM mensajes_internos m
        LEFT JOIN perfiles e ON m.emisor_id = e.id
        LEFT JOIN perfiles r ON m.receptor_id = r.id
        WHERE m.emisor_id = ${parseInt(usuarioId)} OR m.receptor_id = ${parseInt(usuarioId)}
        ORDER BY m.creado_en DESC
      `;
    }

    return NextResponse.json(query);
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

    const insertado = await sql`
      INSERT INTO mensajes_internos (anuncio_id, emisor_id, receptor_id, mensaje)
      VALUES (${parseInt(anuncio_id)}, ${parseInt(emisor_id)}, ${parseInt(receptor_id)}, ${mensaje})
      RETURNING id, creado_en
    `;

    return NextResponse.json({ success: true, id: insertado[0].id });
  } catch (error) {
    console.error('Error al enviar mensaje interno:', error);
    return NextResponse.json({ error: 'Error al enviar el mensaje.' }, { status: 500 });
  }
}
