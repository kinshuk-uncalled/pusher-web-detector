import { NextResponse } from 'next/server';
import * as os from 'os';

export async function GET() {
  return NextResponse.json({
    platform: os.platform(),
    release: os.release(),
    version: os.version(),
  });
}
