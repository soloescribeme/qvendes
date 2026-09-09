import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const rawUrl = process.env.DATABASE_URL || 'DEFAULT_LOCAL';
    // Extraer solo la parte del host para diagnostico seguro
    let hostSeguro = 'Desconocido';
    try {
      const match = rawUrl.match(/@([^/]+)\/([^?]+)/);
      if (match) {
        hostSeguro = `${match[1]} (DB: ${match[2]})`;
      }
    } catch {}

    // 1. Verificar tablas
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

    const countPerfiles = await sql`SELECT count(*)::int AS total FROM perfiles`;
    const countAnuncios = await sql`SELECT count(*)::int AS total FROM anuncios`;

    const ultimosPerfiles = await sql`SELECT id, email, nombre, creado_en FROM perfiles ORDER BY id DESC LIMIT 5`;
    const ultimosAnuncios = await sql`SELECT id, titulo, precio, vendedor_id, estado, creado_en FROM anuncios ORDER BY id DESC LIMIT 5`;

    return NextResponse.json({
      dbHost: hostSeguro,
      perfilesTotal: countPerfiles[0]?.total || 0,
      anunciosTotal: countAnuncios[0]?.total || 0,
      ultimosPerfiles,
      ultimosAnuncios
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
