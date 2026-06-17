import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { SESSION_COOKIE, verifySessionToken } from './auth'

/** 在 API route 內檢查是否已登入 */
export async function isAuthed(): Promise<boolean> {
  const token = cookies().get(SESSION_COOKIE)?.value
  return verifySessionToken(token)
}

/** 未登入則回傳 401，否則回傳 null */
export async function guard(): Promise<NextResponse | null> {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  return null
}
