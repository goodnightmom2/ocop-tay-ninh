import type { IncomingMessage, ServerResponse } from 'http';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  try {
    const cloudRes = await fetch(
      'https://countapi.mileshilliard.com/api/v1/hit/ocop_tayninh_hocsinh_2026'
    );
    if (cloudRes.ok) {
      const data = (await cloudRes.json()) as { value?: number };
      const seq = data.value || 1;
      const code = `HS11-${String(seq).padStart(3, '0')}`;
      res.statusCode = 200;
      res.end(JSON.stringify({ sequence: seq, studentCode: code }));
      return;
    }
  } catch {
    // fallback
  }

  // Backup fallback
  try {
    const backupRes = await fetch(
      'https://abacus.jasoncameron.dev/hit/ocop_tayninh_2026/hocsinh'
    );
    if (backupRes.ok) {
      const data = (await backupRes.json()) as { value?: number };
      const seq = data.value || 1;
      const code = `HS11-${String(seq).padStart(3, '0')}`;
      res.statusCode = 200;
      res.end(JSON.stringify({ sequence: seq, studentCode: code }));
      return;
    }
  } catch {
    // fallback
  }

  const fallbackSeq = 1;
  const fallbackCode = `HS11-${String(fallbackSeq).padStart(3, '0')}`;
  res.statusCode = 200;
  res.end(JSON.stringify({ sequence: fallbackSeq, studentCode: fallbackCode }));
}
