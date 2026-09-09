import bgImage from '../assets/auth-background.jpg'
import './auth.css'

export default function AuthLayout({ children }) {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <img src={bgImage} alt="" className="auth-card-image" />
        <div className="auth-form-panel">
          <div className="auth-card-inner">{children}</div>
        </div>
      </div>
    </div>
  )
}
