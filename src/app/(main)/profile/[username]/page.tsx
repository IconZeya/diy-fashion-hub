'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

import { ProfileHeader } from '@/components/profile/profile-header'
import { ProfileTabs } from '@/components/profile/profile-tabs'
import { ProfileSkeleton } from '@/components/shared/loading-skeleton'
import { EmptyState } from '@/components/shared/empty-state'
import { User } from 'lucide-react'
import { useProfile } from '@/hooks/use-profile'
import type { PinWithUser, Board, DIYRequestWithUser } from '@/types'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export default function ProfilePage() {
  const params = useParams()
  const username = params.username as string

  const {
    profile,
    isLoading: isProfileLoading,
    isFollowing,
    isOwnProfile,
    fetchProfile,
    toggleFollow,
  } = useProfile(username)

  const [pins, setPins] = useState<PinWithUser[]>([])
  const [savedPins, setSavedPins] = useState<PinWithUser[]>([])
  const [boards, setBoards] = useState<Board[]>([])
  const [requests, setRequests] = useState<DIYRequestWithUser[]>([])
  const [isLoadingContent, setIsLoadingContent] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  useEffect(() => {
    async function fetchContent() {
      if (!profile) return

      setIsLoadingContent(true)

      try {
        // Fetch user's created pins
        const pinsParams = new URLSearchParams()
        pinsParams.append('select', '*, user:profiles!pins_user_id_fkey(*)')
        pinsParams.append('user_id', `eq.${profile.id}`)
        pinsParams.append('order', 'created_at.desc')

        const pinsResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/pins?${pinsParams.toString()}`,
          {
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
              'Accept': 'application/json',
            },
          }
        )

        if (pinsResponse.ok) {
          const pinsData = await pinsResponse.json()
          setPins(pinsData as PinWithUser[])
        }

        // Fetch user's boards
        const boardsParams = new URLSearchParams()
        boardsParams.append('select', '*')
        boardsParams.append('user_id', `eq.${profile.id}`)
        boardsParams.append('order', 'created_at.desc')

        // Only show public boards for other users
        if (!isOwnProfile) {
          boardsParams.append('is_private', 'eq.false')
        }

        const boardsResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/boards?${boardsParams.toString()}`,
          {
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
              'Accept': 'application/json',
            },
          }
        )

        let boardsData: Board[] = []
        if (boardsResponse.ok) {
          boardsData = await boardsResponse.json()
          setBoards(boardsData)
        }

        // Fetch saved pins (from all boards)
        if (isOwnProfile && boardsData.length > 0) {
          const boardIds = boardsData.map((b) => b.id)
          const savedParams = new URLSearchParams()
          savedParams.append('select', 'pin:pins(*, user:profiles!pins_user_id_fkey(*))')
          savedParams.append('board_id', `in.(${boardIds.join(',')})`)
          savedParams.append('order', 'saved_at.desc')

          const savedResponse = await fetch(
            `${SUPABASE_URL}/rest/v1/saved_pins?${savedParams.toString()}`,
            {
              headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Accept': 'application/json',
              },
            }
          )

          if (savedResponse.ok) {
            const savedData = await savedResponse.json()
            const uniquePins = new Map()
            savedData.forEach((item: { pin: PinWithUser }) => {
              if (item.pin && !uniquePins.has(item.pin.id)) {
                uniquePins.set(item.pin.id, item.pin)
              }
            })
            setSavedPins(Array.from(uniquePins.values()) as PinWithUser[])
          }
        }

        // Fetch user's DIY requests
        const requestsParams = new URLSearchParams()
        requestsParams.append('select', '*, user:profiles!diy_requests_user_id_fkey(*)')
        requestsParams.append('user_id', `eq.${profile.id}`)
        requestsParams.append('order', 'created_at.desc')

        const requestsResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/diy_requests?${requestsParams.toString()}`,
          {
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
              'Accept': 'application/json',
            },
          }
        )

        if (requestsResponse.ok) {
          const requestsData = await requestsResponse.json()
          setRequests(requestsData as DIYRequestWithUser[])
        }
      } catch (error) {
        console.error('Error fetching content:', error)
      } finally {
        setIsLoadingContent(false)
      }
    }

    fetchContent()
  }, [profile, isOwnProfile])

  if (isProfileLoading) {
    return <ProfileSkeleton />
  }

  if (!profile) {
    return (
      <EmptyState
        icon={User}
        title="User not found"
        description="This user doesn't exist or has been deleted"
      />
    )
  }

  return (
    <div className="space-y-8">
      <ProfileHeader
        profile={profile}
        isOwnProfile={isOwnProfile}
        isFollowing={isFollowing}
        onFollowToggle={toggleFollow}
      />

      <ProfileTabs
        pins={pins}
        savedPins={savedPins}
        boards={boards}
        requests={requests}
        isLoading={isLoadingContent}
        isOwnProfile={isOwnProfile}
      />
    </div>
  )
}
