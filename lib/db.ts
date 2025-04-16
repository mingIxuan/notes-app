import sqlite3 from "sqlite3"
import { open } from "sqlite"
import path from "path"
import fs from "fs"

// Asegurarse de que el directorio de la base de datos existe
const dbDir = path.join(process.cwd(), "data")
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

const dbPath = path.join(dbDir, "notes.db")

// Inicializar la base de datos
async function initializeDb() {
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  })

  // Crear tablas si no existen
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      color TEXT NOT NULL,
      time INTEGER NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id)
    );
  `)

  return db
}

// Singleton para la conexión a la base de datos
let dbInstance: any = null

export const db = {
  async get(...args: any[]) {
    if (!dbInstance) {
      dbInstance = await initializeDb()
    }
    return dbInstance.get(...args)
  },

  async all(...args: any[]) {
    if (!dbInstance) {
      dbInstance = await initializeDb()
    }
    return dbInstance.all(...args)
  },

  async run(...args: any[]) {
    if (!dbInstance) {
      dbInstance = await initializeDb()
    }
    return dbInstance.run(...args)
  },

  async exec(...args: any[]) {
    if (!dbInstance) {
      dbInstance = await initializeDb()
    }
    return dbInstance.exec(...args)
  },
}
