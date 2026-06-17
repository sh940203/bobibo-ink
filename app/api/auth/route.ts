import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { SESSION_COOKIE, SESSION_MAX_AGE, createSessionToken } from '@/lib/auth'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({}))
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: '密碼錯誤' }, { status: 401 })
  }
  const token = await createSessionToken()
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  })
  return NextResponse.json({ ok: true })
}

export async function DELETE() {
  cookies().delete(SESSION_COOKIE)
  return NextResponse.json({ ok: true })
}
