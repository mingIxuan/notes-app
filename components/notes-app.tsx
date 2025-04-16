"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { logout } from "@/lib/auth-actions"
import { createNote, updateNote, deleteNote, getNotes } from "@/lib/note-actions"
import type { Note } from "@/lib/types"

const DEFAULT_COLOR = "#4fc3f7"

export default function NotesApp({ userId, username }: { userId: string; username: string }) {
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLOR)
  const [newNote, setNewNote] = useState({ title: "", content: "" })
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    loadNotes()
    loadLastUsedColor()
  }, [])

  useEffect(() => {
    if (editingNote) {
      setSelectedColor(editingNote.color || DEFAULT_COLOR)
    } else {
      loadLastUsedColor()
    }
  }, [editingNote])

  const loadNotes = async () => {
    try {
      const fetchedNotes = await getNotes()
      setNotes(fetchedNotes)
    } catch (error) {
      console.error("Error loading notes:", error)
    }
  }

  const loadLastUsedColor = () => {
    const savedColor = localStorage.getItem(`${userId}_last_color`)
    if (savedColor) {
      setSelectedColor(savedColor)
    }
  }

  const onColorChanged = () => {
    localStorage.setItem(`${userId}_last_color`, selectedColor)

    if (editingNote) {
      const updatedNote = { ...editingNote, color: selectedColor }
      setEditingNote(updatedNote)
    }
  }

  const focusTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  const handleSaveNote = async () => {
    if (!newNote.title.trim()) {
      alert("¡Por favor ingresa un título para la nota!")
      return
    }

    if (!newNote.content.trim()) {
      alert("¡Por favor escribe contenido para la nota!")
      return
    }

    try {
      const savedNote = await createNote({
        title: newNote.title.trim(),
        content: newNote.content.trim(),
        color: selectedColor,
      })

      setNotes([savedNote, ...notes])
      setNewNote({ title: "", content: "" })
      focusTextarea()
    } catch (error) {
      console.error("Error saving note:", error)
      alert("Error al guardar la nota. Inténtalo de nuevo.")
    }
  }

  const handleEditNote = (note: Note) => {
    setEditingNote(note)
  }

  const handleSaveEditingNote = async () => {
    if (!editingNote) return

    if (!editingNote.title.trim()) {
      alert("¡Por favor ingresa un título para la nota!")
      return
    }

    if (!editingNote.content.trim()) {
      alert("¡Por favor escribe contenido para la nota!")
      return
    }

    try {
      const updatedNote = await updateNote({
        id: editingNote.id,
        title: editingNote.title.trim(),
        content: editingNote.content.trim(),
        color: selectedColor,
      })

      setNotes(notes.map((note) => (note.id === updatedNote.id ? updatedNote : note)))
      setEditingNote(null)
    } catch (error) {
      console.error("Error updating note:", error)
      alert("Error al actualizar la nota. Inténtalo de nuevo.")
    }
  }

  const handleDeleteNote = async (note: Note) => {
    if (!confirm("¿Realmente deseas eliminar esta nota?")) return

    try {
      await deleteNote(note.id)
      setNotes(notes.filter((n) => n.id !== note.id))
    } catch (error) {
      console.error("Error deleting note:", error)
      alert("Error al eliminar la nota. Inténtalo de nuevo.")
    }
  }

  const handleCancelEdit = () => {
    setEditingNote(null)
    focusTextarea()
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("es-ES", {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    })
  }

  return (
    <div className="min-h-screen">
      <nav className="navbar py-3 mb-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <a className="navbar-brand text-xl" href="#">
            <i className="fas fa-sticky-note mr-2"></i>NotePro
          </a>
          <div className="user-info">
            <div className="user-avatar">{username.charAt(0).toUpperCase()}</div>
            <span className="mr-3">{username}</span>
            <form action={logout}>
              <Button variant="outline" size="sm" className="text-white border-white hover:bg-white/20">
                <i className="fas fa-sign-out-alt mr-1"></i>Salir
              </Button>
            </form>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="form-container">
              <div className="color-picker-container mb-4">
                <label htmlFor="color" className="color-picker-label">
                  <i className="fas fa-palette mr-2"></i>
                  <span>{!editingNote ? "Color para nuevas notas:" : "Color para esta nota:"}</span>
                </label>
                <input
                  id="color"
                  type="color"
                  value={selectedColor}
                  onChange={(e) => {
                    setSelectedColor(e.target.value)
                    onColorChanged()
                  }}
                />
              </div>

              {!editingNote ? (
                <div className="note-form-wrapper">
                  <div className="note-form-scrollable">
                    <h3 className="text-xl font-semibold mb-4 pb-2 border-b-2 border-accent-color">
                      <i className="fas fa-plus-circle mr-2"></i>Nueva Nota
                    </h3>
                    <div className="mb-4">
                      <label htmlFor="noteTitle" className="block mb-2">
                        <i className="fas fa-heading mr-2"></i>Título:
                      </label>
                      <Input
                        id="noteTitle"
                        value={newNote.title}
                        onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                        placeholder="Título de la nota"
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="note" className="block mb-2">
                        <i className="fas fa-align-left mr-2"></i>Contenido:
                      </label>
                      <Textarea
                        id="note"
                        ref={textareaRef}
                        value={newNote.content}
                        onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                        placeholder="Escribe aquí..."
                        className="content-textarea"
                        rows={8}
                      />
                    </div>
                  </div>
                  <div className="note-form-actions">
                    <Button onClick={handleSaveNote} className="bg-success-color hover:bg-success-color/90">
                      <i className="fas fa-save mr-2"></i>Guardar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="note-form-wrapper">
                  <div className="note-form-scrollable">
                    <h3 className="text-xl font-semibold mb-4 pb-2 border-b-2 border-accent-color">
                      <i className="fas fa-edit mr-2"></i>Editar Nota
                    </h3>
                    <div className="mb-4">
                      <label htmlFor="editNoteTitle" className="block mb-2">
                        <i className="fas fa-heading mr-2"></i>Título:
                      </label>
                      <Input
                        id="editNoteTitle"
                        value={editingNote.title}
                        onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                        placeholder="Título de la nota"
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="editNote" className="block mb-2">
                        <i className="fas fa-align-left mr-2"></i>Contenido:
                      </label>
                      <Textarea
                        id="editNote"
                        value={editingNote.content}
                        onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                        placeholder="Escribe aquí..."
                        className="content-textarea"
                        rows={8}
                        style={{ borderLeft: `5px solid ${selectedColor}` }}
                      />
                    </div>
                    <div className="color-indicator">
                      <span>Color actual:</span>
                      <div className="color-preview" style={{ backgroundColor: selectedColor }}></div>
                    </div>
                  </div>
                  <div className="note-form-actions">
                    <Button onClick={handleSaveEditingNote} className="bg-success-color hover:bg-success-color/90 mr-2">
                      <i className="fas fa-save mr-2"></i>Guardar
                    </Button>
                    <Button
                      onClick={handleCancelEdit}
                      className="bg-warning-color hover:bg-warning-color/90 text-dark-color"
                    >
                      <i className="fas fa-times mr-2"></i>Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-7 order-1 lg:order-2">
            <h3 className="text-xl font-semibold mb-4 pb-2 border-b-2 border-accent-color" hidden={notes.length === 0}>
              <i className="fas fa-sticky-note mr-2"></i>Mis Notas
            </h3>

            {notes.length === 0 && (
              <div className="empty-notes">
                <i className="fas fa-sticky-note"></i>
                <h4 className="text-lg font-medium mt-3">No tienes notas</h4>
                <p>Crea tu primera nota usando el formulario de la izquierda.</p>
              </div>
            )}

            <div className="notes-container">
              {notes.map((note) => (
                <div key={note.id} className="note-card" style={{ backgroundColor: note.color || "#4fc3f7" }}>
                  <div className="note-title">{note.title || "Sin título"}</div>
                  <div className="note-content">{note.content}</div>
                  <div className="note-time">
                    <i className="far fa-clock mr-1"></i>
                    {formatDate(note.time)}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEditNote(note)}
                      size="sm"
                      className="bg-warning-color hover:bg-warning-color/90 text-dark-color"
                    >
                      <i className="fas fa-edit mr-1"></i>Editar
                    </Button>
                    <Button
                      onClick={() => handleDeleteNote(note)}
                      size="sm"
                      className="bg-danger-color hover:bg-danger-color/90"
                    >
                      <i className="fas fa-trash-alt mr-1"></i>Eliminar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
