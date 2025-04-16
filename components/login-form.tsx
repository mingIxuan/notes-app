"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { login, register } from "@/lib/auth-actions"

export default function LoginForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!username || !password) {
      setError("Por favor, ingresa nombre de usuario y contraseña")
      return
    }

    try {
      if (isLogin) {
        await login({ username, password })
      } else {
        await register({ username, password })
      }
      // La redirección se maneja en la acción del servidor
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error en la autenticación")
    }
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-primary">
          <i className="fas fa-sticky-note mr-2"></i>NotePro
        </CardTitle>
        <h4 className="text-xl mt-2">{isLogin ? "Iniciar Sesión" : "Registrarse"}</h4>
      </CardHeader>
      <CardContent>
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">
              <i className="fas fa-user mr-2"></i>Nombre de usuario:
            </Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingresa tu nombre de usuario"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">
              <i className="fas fa-lock mr-2"></i>Contraseña:
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              required
            />
          </div>
          <Button type="submit" className="w-full">
            <i className={`fas ${isLogin ? "fa-sign-in-alt" : "fa-user-plus"} mr-2`}></i>
            {isLogin ? "Iniciar Sesión" : "Registrarse"}
          </Button>
        </form>
        <div className="text-center mt-4">
          <button onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline font-medium">
            {isLogin ? "¿No tienes una cuenta? Regístrate" : "¿Ya tienes una cuenta? Inicia sesión"}
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
