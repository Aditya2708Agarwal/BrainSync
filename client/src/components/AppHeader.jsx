import { Link } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BrandLogo } from './BrandLogo.jsx'

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
        <BrandLogo />

        <nav className="flex items-center gap-2">
          <Link
            to="/login"
            className="hidden rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            Login
          </Link>
          <Link to="/signup">
            <Button className="gap-2">
              <LogIn className="h-4 w-4" />
              Get started
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  )
}
