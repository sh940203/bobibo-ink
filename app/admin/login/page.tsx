'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { api } from '@/lib/api-client'

export default function LoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api('/api/auth', { method: 'POST', body: JSON.stringify({ password }) })
      router.push('/admin/artworks')
      router.refresh()
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink text-cream flex items-center justify-center px-6">
      <form onSubmit={submit} className="w-full max-w-sm">
        <p className="font-body font-semibold text-2xl tracking-tight text-center mb-1">彈塗魚 後台</p>
        <p className="font-body text-sm text-cream/50 text-center mb-8">請輸入管理密碼</p>
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="密碼"
          className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-cream placeholder:text-cream/30 focus:outline-none focus:border-cream/50"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-4 bg-cream text-ink rounded-lg py-3 font-body text-sm disabled:opacity-50"
        >
          {loading ? '登入中…' : '登入'}
        </button>
      </form>
    </div>
  )
}
