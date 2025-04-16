"use server"

import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"
import type { Note, NoteData } from "@/lib/types"
import { revalidatePath } from "next/cache"
import crypto from "crypto"

// Función para crear una nueva nota
export async function createNote(data: NoteData): Promise<Note> {
  const session = await getSession()

  if (!session) {
    throw new Error("No estás autenticado")
  }

  const noteId = `note_${crypto.randomUUID()}`
  const timestamp = Date.now()

  await db.run("INSERT INTO notes (id, userId, title, content, color, time) VALUES (?, ?, ?, ?, ?, ?)", [
    noteId,
    session.id,
    data.title,
    data.content,
    data.color,
    timestamp,
  ])

  const newNote: Note = {
    id: noteId,
    userId: session.id,
    title: data.title,
    content: data.content,
    color: data.color,
    time: timestamp,
  }

  revalidatePath("/")
  return newNote
}

// Función para actualizar una nota existente
export async function updateNote(data: NoteData): Promise<Note> {
  const session = await getSession()

  if (!session) {
    throw new Error("No estás autenticado")
  }

  if (!data.id) {
    throw new Error("ID de nota no proporcionado")
  }

  // Verificar que la nota pertenece al usuario
  const note = await db.get("SELECT id FROM notes WHERE id = ? AND userId = ?", [data.id, session.id])

  if (!note) {
    throw new Error("Nota no encontrada o no tienes permiso para editarla")
  }

  const timestamp = Date.now()

  await db.run("UPDATE notes SET title = ?, content = ?, color = ?, time = ? WHERE id = ?", [
    data.title,
    data.content,
    data.color,
    timestamp,
    data.id,
  ])

  const updatedNote: Note = {
    id: data.id,
    userId: session.id,
    title: data.title,
    content: data.content,
    color: data.color,
    time: timestamp,
  }

  revalidatePath("/")
  return updatedNote
}

// Función para eliminar una nota
export async function deleteNote(noteId: string): Promise<void> {
  const session = await getSession()

  if (!session) {
    throw new Error("No estás autenticado")
  }

  // Verificar que la nota pertenece al usuario
  const note = await db.get("SELECT id FROM notes WHERE id = ? AND userId = ?", [noteId, session.id])

  if (!note) {
    throw new Error("Nota no encontrada o no tienes permiso para eliminarla")
  }

  await db.run("DELETE FROM notes WHERE id = ?", [noteId])

  revalidatePath("/")
}

// Función para obtener todas las notas del usuario
export async function getNotes(): Promise<Note[]> {
  const session = await getSession()

  if (!session) {
    throw new Error("No estás autenticado")
  }

  const notes = await db.all(
    "SELECT id, userId, title, content, color, time FROM notes WHERE userId = ? ORDER BY time DESC",
    [session.id],
  )

  return notes as Note[]
}
