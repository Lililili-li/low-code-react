import React, { useEffect, useMemo } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router'
import { useUserStore } from '@/store/user'

const AuthGuard: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const accessToken = useUserStore((state) => state.user.access_token)

  const hasToken = useMemo(() => {
    if (accessToken) return true
    if (typeof window === 'undefined') return false
    const user = JSON.parse(localStorage.getItem('user-storage') || '{}')
    return Boolean(user?.access_token)
  }, [accessToken])

  useEffect(() => {
    if (!hasToken && location.pathname !== '/login') {
      navigate('/login', { replace: true, state: { from: location } })
    }
  }, [hasToken, location, navigate])

  if (!hasToken && location.pathname !== '/login') {
    return null
  }

  return <Outlet />
}

export default AuthGuard