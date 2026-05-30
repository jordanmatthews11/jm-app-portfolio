import { Outlet } from 'react-router-dom'
import Nav from './Nav'
import EasterEggTrigger from './EasterEggTrigger'
import BlockDudeTrigger from './BlockDudeTrigger'
import Footer from './Footer'

export default function Layout() {
  return (
    <div className="layout">
      <div className="bg-layer" aria-hidden="true" />
      <Nav />
      <main className="main">
        <Outlet />
      </main>
      <Footer />
      <BlockDudeTrigger />
      <EasterEggTrigger />
    </div>
  )
}
