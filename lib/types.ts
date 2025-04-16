export interface User {
  id: string
  username: string
  password: string
}

export interface Note {
  id: string
  userId: string
  title: string
  content: string
  color: string
  time: number
}

export interface Session {
  id: string
  username: string
}

export interface LoginData {
  username: string
  password: string
}

export interface NoteData {
  id?: string
  title: string
  content: string
  color: string
}
