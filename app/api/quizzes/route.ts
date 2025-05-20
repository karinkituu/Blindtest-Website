import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import connectDB from "@/lib/mongodb"
import Quiz from "@/models/Quiz"

const JWT_SECRET = process.env.JWT_SECRET || "votre_secret_jwt_super_securise"

// Récupérer les quiz de l'utilisateur
export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 401 }
      )
    }

    // Vérifier le token
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string }

    await connectDB()

    // Récupérer les quiz de l'utilisateur
    const quizzes = await Quiz.find({ userId: payload.userId })
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json(quizzes)
  } catch (error) {
    console.error("Erreur lors de la récupération des quiz:", error)
    return NextResponse.json(
      { message: "Une erreur est survenue" },
      { status: 500 }
    )
  }
}

// Créer un nouveau quiz
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 401 }
      )
    }

    // Vérifier le token
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string }

    const { title, description, tracks } = await req.json()

    if (!title || !tracks || tracks.length === 0) {
      return NextResponse.json(
        { message: "Titre et pistes requis" },
        { status: 400 }
      )
    }

    await connectDB()

    // Créer le nouveau quiz
    const quiz = await Quiz.create({
      title,
      description,
      tracks,
      userId: payload.userId,
    })

    return NextResponse.json(quiz, { status: 201 })
  } catch (error) {
    console.error("Erreur lors de la création du quiz:", error)
    return NextResponse.json(
      { message: "Une erreur est survenue" },
      { status: 500 }
    )
  }
} 