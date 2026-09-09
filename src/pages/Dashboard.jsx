import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div style={{ minHeight: '100vh', padding: '48px 24px', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <h1 style={{ color: '#0b2a5c', marginBottom: 8 }}>Hoş geldin, {user?.name}!</h1>
        <p style={{ color: '#5b6472', marginBottom: 32 }}>{user?.email}</p>
        <button
          type="button"
          onClick={handleLogout}
          style={{
            padding: '12px 20px',
            border: 'none',
            borderRadius: 10,
            background: '#0b2a5c',
            color: '#fff',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Çıkış Yap
        </button>
      </div>
    </div>
  )
}
