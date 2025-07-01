import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { message: 'This is a mocked error from the API.' },
    { status: 500 },
  );
}
