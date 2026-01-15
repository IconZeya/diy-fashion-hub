import { Metadata } from 'next'
import { PinForm } from '@/components/pins'

export const metadata: Metadata = {
  title: 'Create Pin | DIY Fashion Hub',
  description: 'Share your DIY fashion project with the community',
}

export default function CreatePage() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create a Pin</h1>
        <p className="mt-1 text-muted-foreground">
          Share your DIY fashion project with the community
        </p>
      </div>

      <PinForm />
    </div>
  )
}
