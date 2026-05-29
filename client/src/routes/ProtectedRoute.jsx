import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { getCurrentUser } from '../services/auth.js'

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token')
  const [isValid, setIsValid] = useState(null)

  useEffect(() => {
    if (!token) {
      setIsValid(false)
      return
    }

    getCurrentUser(token)
      .then(() => setIsValid(true))
      .catch(() => {
        localStorage.removeItem('token')
        setIsValid(false)
      })
  }, [token])

  if (isValid === null) {
    return <div className="p-6 text-sm text-muted-foreground">Checking session...</div>
  }

  if (!isValid) return <Navigate to="/" replace />
  return children
}
