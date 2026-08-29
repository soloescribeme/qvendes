import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const ciudad = searchParams.get('ciudad') || '';
    const condicion = searchParams.get('condicion') || '';
    const precioMin = searchParams.get('precio_min');
    const precioMax = searchParams.get('precio_max');
    const vendedorId = searchParams.get('vendedor_id');

    // 1. INICIALIZAR Y VERIFICAR TABLA DE ANUNCIOS
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS anuncios (
          id SERIAL PRIMARY KEY,
          vendedor_id INT NOT NULL,
          titulo VARCHAR(255) NOT NULL,
          precio NUMERIC(10, 2) NOT NULL,
          condicion VARCHAR(50) DEFAULT 'nuevo',
          categoria VARCHAR(100) DEFAULT 'general',
          ciudad VARCHAR(100) DEFAULT 'Loja',
          descripcion TEXT,
          foto1 TEXT,
          foto2 TEXT,
          foto3 TEXT,
          foto4 TEXT,
          metodos_pago TEXT,
          metodos_envio TEXT,
          es_top BOOLEAN DEFAULT false,
          es_patrocinado BOOLEAN DEFAULT false,
          palabras_clave TEXT,
          franja_horaria_inicio VARCHAR(10),
          franja_horaria_fin VARCHAR(10),
          fecha_vencimiento TIMESTAMP,
          estado VARCHAR(50) DEFAULT 'activo',
          creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
    } catch {
      // Ignorar si existe
    }

    // 2. CONSULTAR ANUNCIOS CON JOIN DE VENDEDOR
    const todosAnuncios = await sql`
      SELECT 
        a.id,
        a.vendedor_id,
        a.titulo,
        a.precio::float AS precio,
        a.condicion,
        a.categoria,
        a.ciudad,
        a.descripcion,
        a.foto1,
        a.foto2,
        a.foto3,
        a.foto4,
        a.metodos_pago,
        a.metodos_envio,
        a.es_top,
        a.es_patrocinado,
        a.estado,
        a.creado_en,
        COALESCE(p.nombre, 'Vendedor Certificado') AS vendedor_nombre,
        p.celular AS vendedor_celular,
        p.email AS vendedor_email,
        COALESCE(p.es_verificado, false) AS vendedor_verificado
      FROM anuncios a
      LEFT JOIN perfiles p ON a.vendedor_id = p.id
      WHERE a.estado = 'activo'
      ORDER BY a.id DESC
    `;

    // 3. APLICAR FILTROS
    let filtrados = todosAnuncios;

    if (q.trim()) {
      const term = q.toLowerCase().trim();
      filtrados = filtrados.filter(a => 
        a.titulo.toLowerCase().includes(term) || 
        (a.descripcion && a.descripcion.toLowerCase().includes(term)) ||
        (a.categoria && a.categoria.toLowerCase().includes(term))
      );
    }

    if (ciudad.trim()) {
      filtrados = filtrados.filter(a => a.ciudad.toLowerCase() === ciudad.toLowerCase().trim());
    }

    if (condicion.trim()) {
      filtrados = filtrados.filter(a => a.condicion.toLowerCase() === condicion.toLowerCase().trim());
    }

    if (precioMin) {
      const min = parseFloat(precioMin);
      if (!isNaN(min)) filtrados = filtrados.filter(a => a.precio >= min);
    }

    if (precioMax) {
      const max = parseFloat(precioMax);
      if (!isNaN(max)) filtrados = filtrados.filter(a => a.precio <= max);
    }

    if (vendedorId) {
      filtrados = filtrados.filter(a => String(a.vendedor_id) === String(vendedorId));
    }

    // 4. SEPARAR ANUNCIOS TOP Y ANUNCIOS REGULARES CON ORDEN ALEATORIO RÁNDOM
    const topAds = filtrados.filter(a => a.es_top || a.es_patrocinado);
    const regulares = filtrados.filter(a => !a.es_top && !a.es_patrocinado);

    const regularesRandom = [...regulares];
    for (let i = regularesRandom.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [regularesRandom[i], regularesRandom[j]] = [regularesRandom[j], regularesRandom[i]];
    }

    return NextResponse.json({
      top: topAds,
      feed: regularesRandom,
      total: filtrados.length
    });
  } catch (error) {
    console.error('Error al consultar anuncios en Qvendes:', error);
    return NextResponse.json({ top: [], feed: [], total: 0 }, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { vendedor_id, vendedor_email, titulo, precio, condicion, categoria, ciudad, descripcion, foto1, foto2, foto3, foto4, metodos_pago, metodos_envio } = body;

    let vId = parseInt(String(vendedor_id));

    if ((isNaN(vId) || vId <= 0) && vendedor_email) {
      const uEmail = await sql`SELECT id FROM perfiles WHERE LOWER(email) = ${vendedor_email.trim().toLowerCase()}`;
      if (uEmail.length > 0) vId = uEmail[0].id;
    }

    if (isNaN(vId) || vId <= 0) {
      const uUltimo = await sql`SELECT id FROM perfiles ORDER BY id DESC LIMIT 1`;
      if (uUltimo.length > 0) vId = uUltimo[0].id;
    }

    if (isNaN(vId) || vId <= 0) {
      const autoVendedor = await sql`
        INSERT INTO perfiles (email, nombre, ciudad)
        VALUES ('vendedor@qvendes.app', 'Vendedor Qvendes', 'Loja')
        ON CONFLICT (email) DO UPDATE SET nombre = EXCLUDED.nombre
        RETURNING id
      `;
      vId = autoVendedor[0].id;
    }

    if (!titulo || !precio) {
      return NextResponse.json({ error: 'El título y el precio son obligatorios.' }, { status: 400 });
    }

    // 1. INICIALIZAR TABLA DE ANUNCIOS EN NEON DB IF NOT EXISTS
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS anuncios (
          id SERIAL PRIMARY KEY,
          vendedor_id INT NOT NULL,
          titulo VARCHAR(255) NOT NULL,
          precio NUMERIC(10, 2) NOT NULL,
          condicion VARCHAR(50) DEFAULT 'nuevo',
          categoria VARCHAR(100) DEFAULT 'general',
          ciudad VARCHAR(100) DEFAULT 'Loja',
          descripcion TEXT,
          foto1 TEXT,
          foto2 TEXT,
          foto3 TEXT,
          foto4 TEXT,
          metodos_pago TEXT,
          metodos_envio TEXT,
          es_top BOOLEAN DEFAULT false,
          es_patrocinado BOOLEAN DEFAULT false,
          palabras_clave TEXT,
          franja_horaria_inicio VARCHAR(10),
          franja_horaria_fin VARCHAR(10),
          fecha_vencimiento TIMESTAMP,
          estado VARCHAR(50) DEFAULT 'activo',
          creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
    } catch {}

    const insertado = await sql`
      INSERT INTO anuncios (
        vendedor_id, titulo, precio, condicion, categoria, ciudad, descripcion,
        foto1, foto2, foto3, foto4, metodos_pago, metodos_envio
      ) VALUES (
        ${vId}, ${titulo}, ${parseFloat(precio)}, ${condicion || 'nuevo'},
        ${categoria || 'general'}, ${ciudad || 'Loja'}, ${descripcion || ''},
        ${foto1 || null}, ${foto2 || null}, ${foto3 || null}, ${foto4 || null},
        ${metodos_pago || 'Efectivo / Transferencia'}, ${metodos_envio || 'Acuerdo personal'}
      )
      RETURNING id
    `;

    return NextResponse.json({ success: true, id: insertado[0].id });
  } catch (error) {
    console.error('Error al publicar anuncio en Qvendes:', error);
    const mensajeDetallado = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Error del servidor: ${mensajeDetallado}` }, { status: 500 });
  }
}
