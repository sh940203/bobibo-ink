/**
 * 簡易 Admin session：以 HMAC-SHA256 簽署一個含過期時間的 token，
 * 存於 HTTP-only cookie。使用 Web Crypto，可同時在 Edge middleware 與
 * Node API route 中執行。
 */

export const SESSION_COOKIE = 'admin-session'
const SESSION_DAYS = 7
export const SESSION_MAX_AGE = SESSION_DAYS * 24 * 60 * 60 // 秒

function getSecret(): string {
  const s = process.env.ADMIN_SESSION_SECRET
  if (!s) throw new Error('ADMIN_SESSION_SECRET 環境變數未設定')
  return s
}

function toBase64Url(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
  let str = ''
  arr.forEach((b) => {
    str += String.fromCharCode(b)
  })
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function hmac(message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message))
  return toBase64Url(sig)
}

/** 產生新的 session token */
export async function createSessionToken(): Promise<string> {
  const payload = `${Date.now() + SESSION_MAX_AGE * 1000}`
  const sig = await hmac(payload)
  return `${payload}.${sig}`
}

/** 驗證 session token 是否有效且未過期 */
export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false
  const [payload, sig] = token.split('.')
  if (!payload || !sig) return false

  // 使用 Web Crypto verify（常數時間比對，防止 timing attack）
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  )
  let sigBytes: Uint8Array
  try {
    // base64url → Uint8Array
    const b64 = sig.replace(/-/g, '+').replace(/_/g, '/')
    const bin = atob(b64)
    sigBytes = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) sigBytes[i] = bin.charCodeAt(i)
  } catch {
    return false
  }
  const valid = await crypto.subtle.verify('HMAC', key, sigBytes.buffer as ArrayBuffer, new TextEncoder().encode(payload))
  if (!valid) return false

  const exp = Number(payload)
  if (!Number.isFinite(exp) || Date.now() > exp) return false
  return true
}
