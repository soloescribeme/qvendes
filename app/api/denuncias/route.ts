import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { anuncio_id, denunciante_id, motivo, detalle } = body;

    if (!anuncio_id || !motivo) {
      return NextResponse.json({ error: 'Faltan datos para procesar la denuncia.' }, { status: 400 });
    }

    try {
      await sql`
        CREATE TABLE IF NOT EXISTS denuncias (
          id SERIAL PRIMARY KEY,
          anuncio_id INT NOT NULL,
          denunciante_id INT,
          motivo VARCHAR(100) NOT NULL,
          detalle TEXT,
          estado VARCHAR(50) DEFAULT 'pendiente',
          creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
    } catch {
      // Ignorar si existe
    }

    await sql`
      INSERT INTO denuncias (anuncio_id, denunciante_id, motivo, detalle)
      VALUES (${parseInt(anuncio_id)}, ${denunciante_id ? parseInt(denunciante_id) : null}, ${motivo}, ${detalle || ''})
    `;

    return NextResponse.json({ success: true, message: 'La denuncia ha sido recibida por la administración para su revisión.' });
  } catch (error) {
    console.error('Error al registrar denuncia:', error);
    return NextResponse.json({ error: 'Error al enviar la denuncia.' }, { status: 500 });
  }
}
