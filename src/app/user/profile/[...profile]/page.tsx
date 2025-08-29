import { UserProfile } from '@clerk/nextjs'

export default function ProfilePage() {
    return (
        <main className="flex flex-col items-center justify-center min-h-screen p-2">
            <UserProfile/>
        </main>
    )
}