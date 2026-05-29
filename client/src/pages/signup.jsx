import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link } from 'react-router-dom'
import { BrandLogo } from '../components/BrandLogo.jsx'
import { DashboardShell } from '../components/dashboard/DashboardShell.jsx'
import { registerUser } from '../services/auth.js'
import { useNavigate } from 'react-router-dom'

export default function Signup() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')

    if (!formData.name.trim()) {
      setErrorMessage('Full name is required')
      return
    }

    if (!formData.email.trim()) {
      setErrorMessage('Email is required')
      return
    }

    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match')
      return
    }

    setIsLoading(true)

    try {
      const data = await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      })

      localStorage.setItem('token', data.token)
      navigate('/dashboard')
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardShell>
      <div className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <BrandLogo className="mb-6 justify-center" />
          <Card>
            <CardHeader>
              <CardTitle>Create an account</CardTitle>
              <CardDescription>Enter your details to sign up</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full name</Label>
                    <Input name="name" id="name" type="text" required value={formData.name} onChange={handleChange} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input name="email" id="email" type="email" placeholder="m@example.com" required value={formData.email} onChange={handleChange} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      name="password"
                      id="password"
                      type="password"
                      required
                      minLength={6}
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <p className="text-xs text-muted-foreground">
                      Password must be at least 6 characters long.
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirm password</Label>
                    <Input name="confirmPassword" id="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleChange} />
                  </div>
                  <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
                    Please make sure:
                    <ul className="mt-2 list-disc space-y-1 pl-4">
                      <li>Your full name is entered</li>
                      <li>Your email is valid</li>
                      <li>Your password has at least 6 characters</li>
                      <li>Your password and confirm password match</li>
                    </ul>
                  </div>
                  <Button type="submit" className="w-full">{isLoading ? 'Signing up...' : 'Sign up'}</Button>
                  {errorMessage ? <p className="text-sm text-red-500">{errorMessage}</p> : null}
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex-col gap-2">
              <div className="text-sm">
                Already have an account? <Link to="/login" className="text-primary hover:underline">Log in</Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </DashboardShell>
  )
}
