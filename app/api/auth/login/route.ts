import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { SignJWT } from "jose"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"

const JWT_SECRET = process.env.JWT_SECRET
const secret = new TextEncoder().encode(JWT_SECRET)

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    // Validation des données
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email et mot de passe requis" },
        { status: 400 }
      )
    }

    await connectDB()

    // Rechercher l'utilisateur
    const user = await User.findOne({ email })

    if (!user) {
      return NextResponse.json(
        { message: "Email ou mot de passe incorrect" },
        { status: 401 }
      )
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Email ou mot de passe incorrect" },
        { status: 401 }
      )
    }

    // Générer le token JWT avec jose
    const token = await new SignJWT({ userId: user._id.toString() })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secret)

    console.log("Token généré:", token)

    // Créer la réponse
    const response = NextResponse.json({
      _id: user._id,
      email: user.email,
      name: user.name,
      message: "Connexion réussie"
    })

    // Définir le cookie dans la réponse
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

    console.log("Cookie défini:", response.cookies.get("token"))

    return response
  } catch (error) {
    console.error("Erreur lors de la connexion:", error)
    return NextResponse.json(
      { message: "Une erreur est survenue lors de la connexion" },
      { status: 500 }
    )
  }
} 