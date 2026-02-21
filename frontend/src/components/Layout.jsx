import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

const isMobile = () => window.innerWidth < 768

export default function Layout() {
    const [collapsed, setCollapsed] = useState(isMobile())
    const location = useLocation()

    /* Auto-collapse on resize down */
    useEffect(() => {
        const onResize = () => { if (isMobile()) setCollapsed(true) }
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
    }, [])

    /* Close sidebar on route change (mobile) */
    useEffect(() => {
        if (isMobile()) setCollapsed(true)
    }, [location.pathname])

    return (
        <div className="app-layout">
            {!collapsed && <div className="sidebar-backdrop" onClick={() => setCollapsed(true)} />}
            <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
            <div className="main-area">
                <Header onMenuToggle={() => setCollapsed(c => !c)} />
                <div className="page-content">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}
