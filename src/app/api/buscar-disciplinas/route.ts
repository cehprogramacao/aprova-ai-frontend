import { NextRequest, NextResponse } from 'next/server';

const SEARCH_SERVICE_URL = process.env.SEARCH_SERVICE_URL || 'http://localhost:3003';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const res = await fetch(`${SEARCH_SERVICE_URL}/buscar-disciplinas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(20000), // 20s timeout
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Serviço de busca indisponível' }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    if (err.name === 'TimeoutError') {
      return NextResponse.json({ error: 'Busca demorou demais. Tente novamente.' }, { status: 504 });
    }
    return NextResponse.json(
      { error: 'Serviço de busca offline. Verifique se o search-service está rodando (porta 3003).' },
      { status: 503 }
    );
  }
}
