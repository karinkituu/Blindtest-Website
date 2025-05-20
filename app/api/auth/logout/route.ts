import { NextResponse } from "next/server"

export async function POST() {
  const response = NextResponse.json(
    { message: "Déconnexion réussie" },
    { status: 200 }
  )

  // Supprimer le cookie d'authentification
  response.cookies.set({
    name: "token",
    value: "",
    expires: new Date(0),
    path: "/",
  })

  return response
} 