"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import type { LoginData, Session } from "@/lib/types"
import crypto from "crypto"

// Función para generar un hash de contraseña
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex")
}

// Función para iniciar sesión
export async function login(data: LoginData) {
  const { username, password } = data

  // Buscar usuario por nombre de usuario
  const user = await db.get("SELECT id, username, password FROM users WHERE username = ?", [username])

  if (!user) {
    throw new Error("Usuario o contraseña incorrectos")
  }

  // Verificar contraseña
  const hashedPassword = hashPassword(password)
  if (user.password !== hashedPassword) {
    throw new Error("Usuario o contraseña incorrectos")
  }

  // Crear sesión
  const session: Session = {
    id: user.id,
    username: user.username,
  }

  // Guardar sesión en cookie
  cookies().set({
    name: "session",
    value: JSON.stringify(session),
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 semana
  })

  redirect("/")
}

// Función para registrar un nuevo usuario
export async function register(data: LoginData) {
  const { username, password } = data

  // Verificar si el usuario ya existe
  const existingUser = await db.get("SELECT id FROM users WHERE username = ?", [username])

  if (existingUser) {
    throw new Error("El nombre de usuario ya existe")
  }

  // Generar ID único
  const userId = `user_${crypto.randomUUID()}`

  // Guardar usuario en la base de datos
  await db.run("INSERT INTO users (id, username, password) VALUES (?, ?, ?)", [
    userId,
    username,
    hashPassword(password),
  ])

  // Crear sesión
  const session: Session = {
    id: userId,
    username,
  }

  // Guardar sesión en cookie
  cookies().set({
    name: "session",
    value: JSON.stringify(session),
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 semana
  })

  redirect("/")
}

// Función para cerrar sesión
export async function logout() {
  cookies().delete("session")
  redirect("/")
}
