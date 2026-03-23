const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

async function redis(command: string[]) {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return null;
  const res = await fetch(`${UPSTASH_URL}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
    body: JSON.stringify(command),
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.result;
}

async function redisPipeline(commands: string[][]) {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return null;
  const res = await fetch(`${UPSTASH_URL}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
    body: JSON.stringify(commands),
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.map((r: { result: unknown }) => r.result);
}

// 방문 기록
export async function POST(request: Request) {
  try {
    const { deviceId } = await request.json();
    if (!deviceId || typeof deviceId !== 'string') {
      return Response.json({ error: 'deviceId required' }, { status: 400 });
    }

    const today = new Date().toISOString().slice(0, 10);

    // SADD: 새 기기면 1 리턴, 이미 있으면 0
    // HINCRBY: 오늘 방문수 +1
    const results = await redisPipeline([
      ['SADD', 'visitors:devices', deviceId],
      ['HINCRBY', 'visitors:daily', today, '1'],
      ['SCARD', 'visitors:devices'],
    ]);

    if (!results) {
      return Response.json({ error: 'Redis not configured' }, { status: 500 });
    }

    const isNewDevice = results[0] === 1;
    const totalDevices = results[2];

    return Response.json({ isNewDevice, totalDevices });
  } catch (err) {
    console.error('[visitors] POST error:', err);
    return Response.json({ error: 'server error' }, { status: 500 });
  }
}

// 통계 조회
export async function GET() {
  try {
    const results = await redisPipeline([
      ['HGETALL', 'visitors:daily'],
      ['SCARD', 'visitors:devices'],
    ]);

    if (!results) {
      return Response.json({ error: 'Redis not configured' }, { status: 500 });
    }

    // HGETALL returns flat array: [key1, val1, key2, val2, ...]
    const flatDaily = results[0] as string[] || [];
    const daily: Record<string, number> = {};
    for (let i = 0; i < flatDaily.length; i += 2) {
      daily[flatDaily[i]] = parseInt(flatDaily[i + 1], 10);
    }

    const totalVisits = Object.values(daily).reduce((s, v) => s + v, 0);
    const totalDevices = results[1] as number;

    return Response.json({ daily, totalVisits, totalDevices });
  } catch (err) {
    console.error('[visitors] GET error:', err);
    return Response.json({ error: 'server error' }, { status: 500 });
  }
}
