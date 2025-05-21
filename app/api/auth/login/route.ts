import { NextResponse } from "next/server"
import { SignJWT } from "jose"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"

export async function POST(req: Request) {
  try {
    console.log("Login route called")
    
    // Connecter à la base de données
    try {
      await connectDB()
      console.log("Connected to MongoDB")
    } catch (dbError) {
      console.error("Database connection error:", dbError)
      return NextResponse.json(
        { error: "Erreur de connexion à la base de données" },
        { status: 500 }
      )
    }

    // Récupérer les données du corps de la requête
    let body
    try {
      body = await req.json()
      console.log("Request body parsed")
    } catch (parseError) {
      console.error("JSON parsing error:", parseError)
      return NextResponse.json(
        { error: "Format de requête invalide" },
        { status: 400 }
      )
    }

    const { email, password } = body

    // Vérifier que l'email et le mot de passe sont fournis
    if (!email || !password) {
      console.log("Missing email or password")
      return NextResponse.json(
        { error: "Email et mot de passe requis" },
        { status: 400 }
      )
    }

    // Rechercher l'utilisateur
    let user
    try {
      user = await User.findOne({ email })
      console.log("User search completed", user ? "User found" : "User not found")
    } catch (findError) {
      console.error("Error finding user:", findError)
      return NextResponse.json(
        { error: "Erreur lors de la recherche de l'utilisateur" },
        { status: 500 }
      )
    }

    if (!user) {
      return NextResponse.json(
        { error: "Email ou mot de passe incorrect" },
        { status: 401 }
      )
    }

    // Vérifier le mot de passe
    let isPasswordValid
    try {
      isPasswordValid = await bcrypt.compare(password, user.password)
      console.log("Password validation:", isPasswordValid ? "Valid" : "Invalid")
    } catch (bcryptError) {
      console.error("Bcrypt error:", bcryptError)
      return NextResponse.json(
        { error: "Erreur lors de la validation du mot de passe" },
        { status: 500 }
      )
    }

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Email ou mot de passe incorrect" },
        { status: 401 }
      )
    }

    // Créer un token JWT
    let token
    try {
      // Convertir l'ID en string pour éviter les erreurs de sérialisation
      const userId = user._id.toString()
      console.log("Creating JWT token for user ID:", userId)
      
      const JWT_SECRET = process.env.JWT_SECRET || "quizspot_jwt_secret_key_2024"
      console.log("Using JWT secret length:", JWT_SECRET.length)
      
      const secret = new TextEncoder().encode(JWT_SECRET)
      
      token = await new SignJWT({ userId })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(secret)
      
      console.log("JWT token created successfully")
    } catch (jwtError) {
      console.error("JWT signing error:", jwtError)
      return NextResponse.json(
        { error: "Erreur lors de la génération du token" },
        { status: 500 }
      )
    }

    // Créer la réponse
    const response = NextResponse.json(
      { message: "Connexion réussie", user: { id: user._id, name: user.name } },
      { status: 200 }
    )

    // Définir le cookie
    try {
      // En production, assurez-vous que secure est true
      const isProduction = process.env.NODE_ENV === "production"
      
      response.cookies.set({
        name: "token",
        value: token,
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 jours
      })
      
      console.log("Cookie set successfully")
    } catch (cookieError) {
      console.error("Error setting cookie:", cookieError)
      return NextResponse.json(
        { error: "Erreur lors de la définition du cookie" },
        { status: 500 }
      )
    }

    return response
  } catch (error) {
    console.error("Unexpected error in login route:", error)
    return NextResponse.json(
      { error: "Une erreur inattendue s'est produite" },
      { status: 500 }
    )
  }
} 