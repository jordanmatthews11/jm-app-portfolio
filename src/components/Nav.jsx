import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/portfolio', label: 'Portfolio & Tools' },
  { to: '/admin', label: 'Admin' },
]

export default function Nav() {
  const { signOut } = useAuth()
  return (
    <nav className="nav">
      <NavLink to="/" className="nav-logo">
        JM
      </NavLink>
      <ul className="nav-links">
        {navItems.map(({ to, label }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              end={to === '/'}
            >
              {label}
            </NavLink>
          </li>
        ))}
        <li>
          <button type="button" className="nav-link share-trigger" onClick={signOut}>
            Sign out
          </button>
        </li>
      </ul>
    </nav>
  )
}
