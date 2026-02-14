import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Nav() {
  const { signOut } = useAuth()
  return (
    <nav className="nav">
      <NavLink to="/" className="nav-logo">
        JM
      </NavLink>
      <ul className="nav-links">
        <li>
          <NavLink
            to="/admin"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            Admin
          </NavLink>
        </li>
        <li>
          <button type="button" className="nav-link share-trigger" onClick={signOut}>
            Sign out
          </button>
        </li>
      </ul>
    </nav>
  )
}
