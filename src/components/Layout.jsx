import { Outlet } from 'react-router-dom'
import Nav from './Nav'
import EasterEggTrigger from './EasterEggTrigger'

export default function Layout() {
  return (
    <div className="layout">
      <div className="bg-layer" aria-hidden="true" />
      <Nav />
      <main className="main">
        <Outlet />
      </main>
      <EasterEggTrigger />
    </div>
  )
}
