import { Metadata } from 'next'
import { EditProfileForm } from '@/components/profile'

export const metadata: Metadata = {
  title: 'Edit Profile | DIY Fashion Hub',
  description: 'Update your profile information',
}

export default function EditProfilePage() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Profile</h1>
        <p className="mt-1 text-muted-foreground">
          Update your profile information
        </p>
      </div>

      <EditProfileForm />
    </div>
  )
}
