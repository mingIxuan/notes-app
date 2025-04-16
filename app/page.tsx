import { getSession } from "@/lib/auth"
import LoginForm from "@/components/login-form"
import NotesApp from "@/components/notes-app"

export default async function Home() {
  const session = await getSession()

  if (!session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <LoginForm />
      </div>
    )
  }

  return <NotesApp userId={session.id} username={session.username} />
}
