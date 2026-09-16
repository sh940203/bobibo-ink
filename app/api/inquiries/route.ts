import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { guard } from '@/lib/admin-guard'

export const runtime = 'edge'

const STYLE_LABELS: Record<string, string> = {
  pet: '寵物肖像', anime: '動漫人物', linework: '線條文字', custom: '客製小圖', other: '其他',
}

// HTML 跳脫，防止使用者輸入注入 Email 內容
function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// 簡易 IP 速率限制：每個 IP 每分鐘最多 5 次
const ipHits = new Map<string, number[]>()
function rateLimit(ip: string): boolean {
  const now = Date.now()
  const window = 60_000
  const max = 5
  const times = (ipHits.get(ip) ?? []).filter(t => now - t < window)
  if (times.length >= max) return false
  ipHits.set(ip, [...times, now])
  return true
}

// 公開：客戶送出詢問
export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: '請求過於頻繁，請稍後再試' }, { status: 429 })
  }

  const { name, contact, style, parts, size, description, preferred_time } = await req.json()
  if (!name?.trim() || !contact?.trim()) {
    return NextResponse.json({ error: '請填寫姓名與聯絡方式' }, { status: 400 })
  }
  if (name.trim().length > 50) {
    return NextResponse.json({ error: '姓名過長' }, { status: 400 })
  }
  if (contact.trim().length > 100) {
    return NextResponse.json({ error: '聯絡方式過長' }, { status: 400 })
  }
  if (description && description.length > 2000) {
    return NextResponse.json({ error: '描述文字過長（上限 2000 字）' }, { status: 400 })
  }
  if (Array.isArray(parts) && parts.length > 20) {
    return NextResponse.json({ error: '部位選項異常' }, { status: 400 })
  }
  await db.execute({
    sql: `INSERT INTO inquiries (name, contact, style, parts, size, description, preferred_time)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [
      name.trim(),
      contact.trim(),
      style || null,
      parts?.length ? JSON.stringify(parts) : null,
      size || null,
      description || null,
      preferred_time || null,
    ],
  })

  // Telegram 通知
  const tgToken = process.env.TELEGRAM_BOT_TOKEN
  const tgChat  = process.env.TELEGRAM_CHAT_ID
  if (tgToken && tgChat) {
    try {
      const partsList = Array.isArray(parts) && parts.length ? parts.join('、') : ''
      const lines = [
        `✦ 新詢問：${name.trim()}`,
        `聯絡：${contact.trim()}`,
        style ? `風格：${STYLE_LABELS[style] ?? style}` : '',
        partsList ? `部位：${partsList}` : '',
        size ? `尺寸：${size}` : '',
        preferred_time ? `時間：${preferred_time}` : '',
        description ? `\n描述：${description}` : '',
        `\n👉 https://bobibo-ink.vercel.app/admin/inquiries`,
      ].filter(Boolean).join('\n')
      await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: tgChat, text: lines }),
      })
    } catch { /* 靜默失敗 */ }
  }

  // 發送 Email 通知（Brevo，非阻塞）
  const brevoKey = process.env.BREVO_API_KEY
  if (brevoKey) {
    try {
      const partsList = Array.isArray(parts) ? parts.join('、') : ''
      await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'api-key': brevoKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: { name: 'bobibo ink 詢問通知', email: 'tsaiyichun1020@gmail.com' },
          to: [
            { email: 'huhu940203@gmail.com' },
            { email: 'tsaiyichun1020@gmail.com' },
          ],
          subject: `✦ 新詢問：${name.trim()}`,
          htmlContent: `
            <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#111">
              <h2 style="font-size:20px;margin-bottom:4px">新預約詢問</h2>
              <p style="color:#888;font-size:13px;margin-top:0">${new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })}</p>
              <table style="width:100%;border-collapse:collapse;margin-top:16px;font-size:14px">
                <tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#666;width:90px">姓名</td><td style="padding:8px 0;border-bottom:1px solid #eee"><strong>${esc(name.trim())}</strong></td></tr>
                <tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#666">聯絡方式</td><td style="padding:8px 0;border-bottom:1px solid #eee">${esc(contact.trim())}</td></tr>
                ${style ? `<tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#666">風格</td><td style="padding:8px 0;border-bottom:1px solid #eee">${esc(STYLE_LABELS[style] ?? style)}</td></tr>` : ''}
                ${partsList ? `<tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#666">部位</td><td style="padding:8px 0;border-bottom:1px solid #eee">${esc(partsList)}</td></tr>` : ''}
                ${size ? `<tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#666">尺寸</td><td style="padding:8px 0;border-bottom:1px solid #eee">${esc(size)}</td></tr>` : ''}
                ${preferred_time ? `<tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#666">希望時間</td><td style="padding:8px 0;border-bottom:1px solid #eee">${esc(preferred_time)}</td></tr>` : ''}
                ${description ? `<tr><td style="padding:8px 0;color:#666;vertical-align:top">描述</td><td style="padding:8px 0;white-space:pre-wrap">${esc(description)}</td></tr>` : ''}
              </table>
              <div style="margin-top:24px">
                <a href="https://bobibo-ink.vercel.app/admin/inquiries" style="background:#111;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:14px">查看後台詢問記錄 →</a>
              </div>
            </div>
          `,
        }),
      })
    } catch {
      // 靜默失敗
    }
  }

  return NextResponse.json({ ok: true })
}

// Admin：列出所有詢問
export async function GET() {
  const denied = await guard()
  if (denied) return denied
  const r = await db.execute('SELECT * FROM inquiries ORDER BY created_at DESC')
  return NextResponse.json(r.rows)
}
