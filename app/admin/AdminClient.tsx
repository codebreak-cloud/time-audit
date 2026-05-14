'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  isAdmin: boolean
  createdAt: string
  lastActive: string | null
}

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function AdminClient({ users: initial }: { users: User[] }) {
  const router = useRouter()
  const [users, setUsers] = useState(initial)
  const [pwFields, setPwFields] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [msg, setMsg] = useState<{ id: string; text: string; ok: boolean } | null>(null)

  const flash = (id: string, text: string, ok: boolean) => {
    setMsg({ id, text, ok })
    setTimeout(() => setMsg(null), 3000)
  }

  const patch = async (id: string, body: object) => {
    setBusy(id)
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    setBusy(null)
    return res
  }

  const toggleAdmin = async (user: User) => {
    const res = await patch(user.id, { isAdmin: !user.isAdmin })
    if (res.ok) {
      setUsers(u => u.map(x => x.id === user.id ? { ...x, isAdmin: !x.isAdmin } : x))
    }
  }

  const resetPassword = async (id: string) => {
    const password = pwFields[id]?.trim()
    if (!password) return
    const res = await patch(id, { password })
    const data = await res.json()
    if (res.ok) {
      setPwFields(f => ({ ...f, [id]: '' }))
      flash(id, 'Password updated', true)
    } else {
      flash(id, data.error ?? 'Failed', false)
    }
  }

  const deleteUser = async (id: string, email: string) => {
    if (!confirm(`Delete ${email}? This cannot be undone.`)) return
    setBusy(id)
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    setBusy(null)
    if (res.ok) {
      setUsers(u => u.filter(x => x.id !== id))
      router.refresh()
    }
  }

  const input: React.CSSProperties = {
    padding: '8px 10px',
    border: '2px solid var(--aa-purple-ink)',
    background: 'var(--aa-off-white)',
    fontFamily: 'var(--font-body)', fontSize: 13,
    color: 'var(--aa-purple-ink)',
    borderRadius: 0, outline: 'none',
    width: 180, boxSizing: 'border-box',
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)', fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--aa-purple-ink)' }}>
            {['Email', 'Signed up', 'Last active', 'Admin', 'Reset password', ''].map(h => (
              <th key={h} style={{
                padding: '10px 14px', textAlign: 'left',
                fontFamily: 'var(--font-mono)', fontSize: 10,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: 'var(--aa-purple)', fontWeight: 600,
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} style={{ borderBottom: '1px solid var(--aa-purple-line)' }}>
              <td style={{ padding: '12px 14px', color: 'var(--aa-purple-ink)', fontWeight: 500 }}>
                {user.email}
              </td>
              <td style={{ padding: '12px 14px', color: 'var(--aa-grey-700)' }}>
                {fmtDate(user.createdAt)}
              </td>
              <td style={{ padding: '12px 14px', color: 'var(--aa-grey-700)' }}>
                {fmtDate(user.lastActive)}
              </td>
              <td style={{ padding: '12px 14px' }}>
                <button
                  onClick={() => toggleAdmin(user)}
                  disabled={busy === user.id}
                  style={{
                    padding: '4px 10px',
                    border: '2px solid var(--aa-purple-ink)',
                    background: user.isAdmin ? 'var(--aa-purple)' : 'transparent',
                    color: user.isAdmin ? '#fff' : 'var(--aa-purple-ink)',
                    fontFamily: 'var(--font-mono)', fontSize: 11,
                    fontWeight: 700, cursor: 'pointer', letterSpacing: '0.06em',
                  }}
                >
                  {user.isAdmin ? 'ADMIN' : 'USER'}
                </button>
              </td>
              <td style={{ padding: '12px 14px' }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <input
                    type="password"
                    placeholder="New password"
                    value={pwFields[user.id] ?? ''}
                    onChange={e => setPwFields(f => ({ ...f, [user.id]: e.target.value }))}
                    style={input}
                  />
                  <button
                    className="ta-btn ta-btn--ghost ta-btn--sm"
                    onClick={() => resetPassword(user.id)}
                    disabled={busy === user.id || !pwFields[user.id]}
                  >
                    Set
                  </button>
                  {msg?.id === user.id && (
                    <span style={{ fontSize: 12, color: msg.ok ? 'var(--aa-purple)' : 'var(--aa-red)', fontWeight: 600 }}>
                      {msg.text}
                    </span>
                  )}
                </div>
              </td>
              <td style={{ padding: '12px 14px' }}>
                <button
                  onClick={() => deleteUser(user.id, user.email)}
                  disabled={busy === user.id}
                  style={{
                    padding: '4px 10px',
                    border: '2px solid var(--aa-red)',
                    background: 'transparent',
                    color: 'var(--aa-red)',
                    fontFamily: 'var(--font-mono)', fontSize: 11,
                    fontWeight: 700, cursor: 'pointer', letterSpacing: '0.06em',
                  }}
                >
                  DELETE
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 && (
        <div style={{ padding: 32, fontFamily: 'var(--font-body)', color: 'var(--aa-grey-500)' }}>
          No users yet.
        </div>
      )}
    </div>
  )
}
