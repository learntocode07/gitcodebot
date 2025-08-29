import { SearchUsers } from './SearchUsers'
import { clerkClient } from '@clerk/nextjs/server'

export default async function AdminDashboard(params: {
  searchParams: Promise<{ search?: string }>
}) {
  return (
    <>
      <p>This is the protected admin dashboard restricted to users with the `admin` role.</p>
    </>
  )
}