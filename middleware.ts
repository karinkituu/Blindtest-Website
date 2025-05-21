import { NextResponse, NextRequest } from "next/server"
import { jwtVerify } from "jose"

// Routes qui nécessitent une authentification
const protectedRoutes = ["/quizzes", "/create", "/play"]

// Routes d'authentification
const authRoutes = ["/login", "/signup"]

// Secret JWT
const JWT_SECRET = process.env.JWT_SECRET || "quizspot_jwt_secret_key_2024"

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  console.log("Middleware - Pathname:", path)
  
  try {
    // 1. Vérifier si l'utilisateur a un token
    const token = request.cookies.get("token")?.value
    console.log("Middleware - Token présent:", !!token)
    
    // Pour le débogage uniquement, ne pas laisser en production
    if (token) {
      console.log("Middleware - Token:", token)
    }

    // 2. Si c'est une route d'authentification (login/signup)
    if (authRoutes.some(route => path.startsWith(route))) {
      // Si l'utilisateur est connecté, rediriger vers /quizzes
      if (token) {
        try {
          const secret = new TextEncoder().encode(JWT_SECRET)
          const { payload } = await jwtVerify(token, secret)
          console.log("Middleware - Token valide pour route auth, userId:", payload.userId)
          
          // L'utilisateur est connecté, rediriger vers /quizzes
          return NextResponse.redirect(new URL("/quizzes", request.url))
        } catch (error) {
          console.error("Middleware - Token invalide sur route auth:", error)
          
          // Le token est invalide, supprimer le cookie et continuer
          const response = NextResponse.next()
          response.cookies.delete("token")
          return response
        }
      }
      
      // L'utilisateur n'est pas connecté, laisser accéder à login/signup
      return NextResponse.next()
    }
    
    // 3. Si c'est une route protégée
    if (protectedRoutes.some(route => path.startsWith(route))) {
      // Si l'utilisateur n'est pas connecté, rediriger vers /login
      if (!token) {
        console.log("Middleware - Pas de token sur route protégée, redirection vers login")
        return NextResponse.redirect(new URL("/login", request.url))
      }
      
      try {
        const secret = new TextEncoder().encode(JWT_SECRET)
        const { payload } = await jwtVerify(token, secret)
        console.log("Middleware - Token valide pour route protégée, userId:", payload.userId)
        
        // L'utilisateur est connecté, laisser passer
        // Bonus: renouveler le token si nécessaire
        const response = NextResponse.next()
        return response
      } catch (error) {
        console.error("Middleware - Token invalide sur route protégée:", error)
        
        // Le token est invalide, supprimer le cookie et rediriger vers /login
        const response = NextResponse.redirect(new URL("/login", request.url))
        response.cookies.delete("token")
        return response
      }
    }
    
    // 4. Pour toutes les autres routes, laisser passer
    return NextResponse.next()
  } catch (error) {
    console.error("Middleware - Erreur inattendue:", error)
    
    // En cas d'erreur inattendue, rediriger vers la page d'accueil
    // On pourrait aussi rediriger vers une page d'erreur
    return NextResponse.redirect(new URL("/", request.url))
  }
}

// Ne pas appliquer le middleware aux chemins suivants
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * 1. /api routes
     * 2. /_next/static (static files)
     * 3. /_next/image (image optimization files)
     * 4. /favicon.ico (favicon file)
     * 5. /icons (PWA icons)
     * 6. /manifest.json (PWA manifest)
     */
    '/((?!api/|_next/static|_next/image|favicon.ico|icons/|manifest.json).*)',
  ],
} 