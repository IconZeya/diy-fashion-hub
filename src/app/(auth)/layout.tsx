import Link from 'next/link'
import { Scissors } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-background to-muted/20">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center space-y-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Scissors className="size-5" />
            </div>
            <span className="text-2xl font-bold">DIY Fashion Hub</span>
          </Link>
        </div>
        {children}
      </div>
    </div>
  )
}
