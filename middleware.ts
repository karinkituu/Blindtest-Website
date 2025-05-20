import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const JWT_SECRET = process.env.JWT_SECRET
const secret = new TextEncoder().encode(JWT_SECRET)

// Routes protégées qui nécessitent une authentification
const protectedRoutes = ["/quizzes", "/create", "/play"]

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value
  const { pathname } = request.nextUrl

  console.log("Middleware - Pathname:", pathname)
  console.log("Middleware - Token présent:", !!token)
  if (token) {
    console.log("Middleware - Token:", token)
  }

  // Vérifier si la route actuelle nécessite une authentification
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  // Si l'utilisateur est connecté et essaie d'accéder aux pages de connexion/inscription,
  // le rediriger vers la page des quiz
  if (token && (pathname === "/login" || pathname === "/signup")) {
    try {
      const { payload } = await jwtVerify(token, secret)
      console.log("Middleware - Token valide, userId:", payload.userId)
      return NextResponse.redirect(new URL("/quizzes", request.url))
    } catch (error) {
      console.log("Middleware - Token invalide, erreur:", error)
      // Si le token est invalide, supprimer le cookie et continuer
      const response = NextResponse.next()
      response.cookies.delete("token")
      return response
    }
  }

  // Si la route est protégée et qu'il n'y a pas de token, rediriger vers la page de connexion
  if (isProtectedRoute && !token) {
    console.log("Middleware - Route protégée sans token, redirection vers /login")
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Si la route est protégée et qu'il y a un token, vérifier sa validité
  if (isProtectedRoute && token) {
    try {
      const { payload } = await jwtVerify(token, secret)
      console.log("Middleware - Token valide pour route protégée, userId:", payload.userId)
      
      // Créer une nouvelle réponse pour continuer
      const response = NextResponse.next()
      
      // Renouveler le cookie pour maintenir la session
      response.cookies.set({
        name: "token",
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 jours
        path: "/",
        domain: process.env.NODE_ENV === "production" ? undefined : "localhost"
      })
      
      return response
    } catch (error) {
      console.log("Middleware - Token invalide pour route protégée, erreur:", error)
      // Si le token est invalide, supprimer le cookie et rediriger vers la page de connexion
      const response = NextResponse.redirect(new URL("/login", request.url))
      response.cookies.delete("token")
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
} 