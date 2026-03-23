import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'visitors.json');

interface VisitorData {
  devices: string[];
  daily: Record<string, number>;
}

async function readData(): Promise<VisitorData> {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { devices: [], daily: {} };
  }
}

async function writeData(data: VisitorData) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// 방문 기록
export async function POST(request: Request) {
  try {
    const { deviceId } = await request.json();
    if (!deviceId || typeof deviceId !== 'string') {
      return Response.json({ error: 'deviceId required' }, { status: 400 });
    }

    const data = await readData();
    const today = new Date().toISOString().slice(0, 10);

    const isNewDevice = !data.devices.includes(deviceId);
    if (isNewDevice) {
      data.devices.push(deviceId);
    }

    data.daily[today] = (data.daily[today] || 0) + 1;

    // 최근 90일만 보관
    const keys = Object.keys(data.daily).sort();
    if (keys.length > 90) {
      for (const key of keys.slice(0, keys.length - 90)) {
        delete data.daily[key];
      }
    }

    await writeData(data);

    return Response.json({ isNewDevice, totalDevices: data.devices.length });
  } catch {
    return Response.json({ error: 'server error' }, { status: 500 });
  }
}

// 통계 조회
export async function GET() {
  try {
    const data = await readData();

    const totalVisits = Object.values(data.daily).reduce((s, v) => s + v, 0);
    const totalDevices = data.devices.length;

    return Response.json({
      daily: data.daily,
      totalVisits,
      totalDevices,
    });
  } catch {
    return Response.json({ error: 'server error' }, { status: 500 });
  }
}
