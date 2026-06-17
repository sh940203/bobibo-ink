'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Pricing, Category, Size } from '@/lib/types'
import { CATEGORIES, CATEGORY_LABELS, SIZES, SIZE_LABELS } from '@/lib/types'

type Attachment = { file: File; url: string; isImage: boolean }

const STYLE_OPTIONS: { value: string; label: string }[] = [
  ...CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABELS[c] })),
  { value: 'other', label: '其他（請於描述說明）' },
]

const BODY_PARTS = ['手臂', '前臂', '手腕', '手指', '腳踝', '小腿', '大腿', '背部', '肋骨', '鎖骨', '其他']

export default function InquiryForm({ pricing }: { pricing: Pricing[] }) {
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [style, setStyle] = useState('')
  const [parts, setParts] = useState<string[]>([])
  const [size, setSize] = useState<Size | ''>('')
  const [desc, setDesc] = useState('')
  const [time, setTime] = useState('')
  const [ageOk, setAgeOk] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 釋放預覽用的 object URL，避免記憶體洩漏
  useEffect(() => {
    return () => attachments.forEach((a) => URL.revokeObjectURL(a.url))
  }, [attachments])

  const addFiles = (fileList: FileList | null) => {
    if (!fileList) return
    const next: Attachment[] = Array.from(fileList).map((file) => ({
      file,
      url: URL.createObjectURL(file),
      isImage: file.type.startsWith('image/'),
    }))
    setAttachments((prev) => [...prev, ...next])
  }

  const removeAttachment = (idx: number) => {
    setAttachments((prev) => {
      URL.revokeObjectURL(prev[idx].url)
      return prev.filter((_, i) => i !== idx)
    })
  }

  // 即時估價
  const estimate = useMemo(() => {
    if (!style || !size || style === 'other') return null
    return pricing.find((p) => p.style === (style as Category) && p.size === size)?.price_range ?? null
  }, [style, size, pricing])

  const togglePart = (p: string) =>
    setParts((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]))

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !contact.trim() || !style) {
      setError('請填寫姓名、聯絡方式與刺青風格')
      return
    }
    if (!ageOk) {
      setError('請確認您已滿 18 歲')
      return
    }
    setError('')
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <section id="inquiry" className="bg-paper text-ink py-28 md:py-36 px-6">
        <div className="max-w-xl mx-auto text-center">
          <p className="font-display italic text-3xl md:text-4xl text-sage mb-6">
            ✦ 已收到你的詢問！
          </p>
          <p className="font-body font-light leading-relaxed text-ink/75 mb-8">
            感謝你的來信，我會盡快與你聯繫討論細節。
            <br />
            為了更快回覆，也歡迎直接透過 Instagram 私訊我 👇
          </p>
          <a
            href="https://www.instagram.com/bobibo_ink"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-fill font-body !border-ink !text-ink"
          >
            @bobibo_ink →
          </a>
        </div>
      </section>
    )
  }

  return (
    <section id="inquiry" className="bg-paper text-ink py-24 md:py-32 px-6">
      <div className="max-w-2xl mx-auto">
        <p className="reveal font-body text-xs tracking-[0.3em] uppercase text-warm-gray mb-4 text-center">
          ✦ Inquiry
        </p>
        <h2 className="reveal reveal-delay-1 font-display italic text-4xl md:text-5xl text-center mb-3">
          預約詢價
        </h2>
        <p className="reveal reveal-delay-1 font-body font-light text-sm text-warm-gray text-center mb-12">
          目前暫時以女性顧客預約為主，送出後我會與你聯繫。
        </p>

        <form onSubmit={onSubmit} className="space-y-7">
          {/* 姓名 */}
          <Field label="姓名" required>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="inp"
              placeholder="你的稱呼"
            />
          </Field>

          {/* 聯絡方式 */}
          <Field label="聯絡方式（IG / 手機 / Email）" required>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="inp"
              placeholder="@your_ig 或手機 / Email"
            />
          </Field>

          {/* 風格 */}
          <Field label="刺青風格" required>
            <select value={style} onChange={(e) => setStyle(e.target.value)} className="inp">
              <option value="">請選擇</option>
              {STYLE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>

          {/* 部位 多選 */}
          <Field label="刺青部位（可複選）">
            <div className="flex flex-wrap gap-2">
              {BODY_PARTS.map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => togglePart(p)}
                  className={`tag-btn px-4 py-1.5 rounded-full border text-sm transition-colors ${
                    parts.includes(p)
                      ? 'bg-sage border-sage text-white'
                      : 'border-ink/20 text-ink/70 hover:border-sage'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </Field>

          {/* 尺寸 單選 */}
          <Field label="尺寸大小">
            <div className="flex flex-wrap gap-2">
              {SIZES.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setSize(s)}
                  title={SIZE_LABELS[s]}
                  className={`tag-btn px-5 py-1.5 rounded-full border text-sm transition-colors ${
                    size === s
                      ? 'bg-sage border-sage text-white'
                      : 'border-ink/20 text-ink/70 hover:border-sage'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            {size && (
              <p className="font-body text-xs text-warm-gray mt-2">{SIZE_LABELS[size]}</p>
            )}
          </Field>

          {/* 即時估價 */}
          {estimate && (
            <div className="bg-white border border-ink/10 rounded-lg px-6 py-5 text-center">
              <p className="font-body text-xs tracking-widest uppercase text-warm-gray mb-1">
                預估費用範圍
              </p>
              <p className="font-display italic text-3xl text-sage">
                {estimate === '面議' ? '面議' : `NT$ ${estimate}`}
              </p>
              <p className="font-body text-xs text-warm-gray mt-2">
                實際費用依圖案複雜度調整
              </p>
            </div>
          )}

          {/* 描述 */}
          <Field label="圖案描述 / 參考圖說明">
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={4}
              className="inp resize-y"
              placeholder="想刺的內容、風格、參考圖等"
            />

            {/* 參考圖 / 檔案上傳 */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                addFiles(e.dataTransfer.files)
              }}
              className="mt-3 cursor-pointer rounded-lg border border-dashed border-ink/25 hover:border-sage transition-colors px-5 py-6 text-center"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                multiple
                className="hidden"
                onChange={(e) => {
                  addFiles(e.target.files)
                  e.target.value = ''
                }}
              />
              <p className="font-body text-sm text-ink/70">＋ 點擊或拖曳上傳參考圖 / 檔案</p>
              <p className="font-body text-xs text-warm-gray mt-1">
                可上傳多張圖片或 PDF，協助我更了解你的需求
              </p>
            </div>

            {/* 已選檔案預覽 */}
            {attachments.length > 0 && (
              <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-3">
                {attachments.map((a, i) => (
                  <div
                    key={i}
                    className="relative group aspect-square rounded-lg overflow-hidden border border-ink/10 bg-white"
                  >
                    {a.isImage ? (
                      // 純預覽用本機 object URL，使用原生 img 即可
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.url} alt={a.file.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center">
                        <span className="text-2xl">📄</span>
                        <span className="font-body text-[10px] text-ink/60 mt-1 line-clamp-2 break-all">
                          {a.file.name}
                        </span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeAttachment(i)
                      }}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-ink/80 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="移除"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Field>

          {/* 希望時間 */}
          <Field label="希望時間">
            <input
              type="text"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="inp"
              placeholder="例如：平日下午、週末"
            />
          </Field>

          {/* 年齡確認 */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={ageOk}
              onChange={(e) => setAgeOk(e.target.checked)}
              className="w-4 h-4 accent-sage"
            />
            <span className="font-body text-sm text-ink/80">我已滿 18 歲 *</span>
          </label>

          {error && <p className="font-body text-sm text-red-600">{error}</p>}

          <button type="submit" className="btn-fill font-body !border-ink !text-ink w-full justify-center py-3">
            送出詢問 →
          </button>
        </form>
      </div>

      <style>{`
        .inp {
          width: 100%;
          background: #fff;
          border: 1px solid rgba(17,17,16,0.15);
          border-radius: 0.5rem;
          padding: 0.7rem 0.9rem;
          font-family: var(--font-inter), sans-serif;
          font-weight: 300;
          font-size: 0.95rem;
          color: var(--ink);
          transition: border-color 0.25s;
        }
        .inp:focus { outline: none; border-color: var(--sage); }
      `}</style>
    </section>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="reveal">
      <label className="block font-body text-sm text-ink/80 mb-2">
        {label}
        {required && <span className="text-sage"> *</span>}
      </label>
      {children}
    </div>
  )
}
