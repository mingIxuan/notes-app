import { cookies } from "next/headers"
import { db } from "@/lib/db"
import type { Session } from "@/lib/types"

// Función para obtener la sesión actual
export async function getSession(): Promise<Session | null> {
  const sessionCookie = cookies().get("session")

  if (!sessionCookie?.value) {
    return null
  }

  try {
    const sessionData = JSON.parse(sessionCookie.value) as Session

    // Verificar que el usuario existe
    const user = await db.get("SELECT id FROM users WHERE id = ?", [sessionData.id])

    if (!user) {
      return null
    }

    return sessionData
  } catch (error) {
    console.error("Error parsing session:", error)
    return null
  }
}
