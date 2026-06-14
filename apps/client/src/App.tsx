import { useCallback, useEffect, useState } from 'react'
import { ChatPage } from './ChatPage'
import { HomePage } from './HomePage'

export function App() {
  const [path, setPath] = useState(() => window.location.pathname)

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const navigate = useCallback((nextPath: string) => {
    if (window.location.pathname === nextPath) {
      return
    }

    window.history.pushState({}, '', nextPath)
    setPath(nextPath)
  }, [])

  if (path === '/chat') {
    return <ChatPage />
  }

  return <HomePage onStartChat={() => navigate('/chat')} />
}
