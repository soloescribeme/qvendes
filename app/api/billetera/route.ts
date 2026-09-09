import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, usuario_id, anuncio_id, tipo_promocion, dias } = body;

    const uStrId = usuario_id ? String(usuario_id) : '';
    const numDias = parseInt(String(dias || 1));
    const aId = parseInt(String(anuncio_id));

    if (!uStrId) {
      return NextResponse.json({ error: 'Debes iniciar sesión.' }, { status: 400 });
    }

    // 1. CONSULTAR SALDO DE BILLETERA
    const userRes = await sql`
      SELECT id, email, saldo_billetera FROM perfiles WHERE id::text = ${uStrId}
    `;

    if (userRes.length === 0) {
      return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 });
    }

    const saldoActual = parseFloat(userRes[0].saldo_billetera || '0.00');

    // 2. COMPRAR PROMOCIÓN TOP ($1.00/día) O PREMIUM ($1.50/día)
    if (action === 'comprar_promocion') {
      if (isNaN(aId) || aId <= 0) {
        return NextResponse.json({ error: 'Selecciona un anuncio válido.' }, { status: 400 });
      }

      const costoPorDia = tipo_promocion === 'premium' ? 1.50 : 1.00;
      const costoTotal = costoPorDia * numDias;

      if (saldoActual < costoTotal) {
        return NextResponse.json({
          error: `Saldo insuficiente ($${saldoActual.toFixed(2)}). El costo por ${numDias} día(s) es de $${costoTotal.toFixed(2)}. Por favor realiza una recarga.`
        }, { status: 400 });
      }

      const nuevoSaldo = saldoActual - costoTotal;

      // Actualizar saldo de perfiles
      await sql`
        UPDATE perfiles SET saldo_billetera = ${nuevoSaldo} WHERE id::text = ${uStrId}
      `;

      // Activar promocion en anuncio
      if (tipo_promocion === 'premium') {
        await sql`
          UPDATE anuncios SET es_premium = true, es_top = true WHERE id = ${aId}
        `;
      } else {
        await sql`
          UPDATE anuncios SET es_top = true WHERE id = ${aId}
        `;
      }

      return NextResponse.json({
        success: true,
        nuevoSaldo,
        mensaje: `¡Promoción ${tipo_promocion.toUpperCase()} activada exitosamente por ${numDias} día(s)!`
      });
    }

    return NextResponse.json({ success: true, saldo: saldoActual });
  } catch (error) {
    console.error('Error en API billetera:', error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Error de servidor: ${msg}` }, { status: 500 });
  }
}
