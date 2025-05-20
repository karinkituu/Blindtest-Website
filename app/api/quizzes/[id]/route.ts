import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import connectDB from "@/lib/mongodb"
import Quiz from "@/models/Quiz"

const JWT_SECRET = process.env.JWT_SECRET || "votre_secret_jwt_super_securise"

// Récupérer un quiz spécifique
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    // Récupérer le quiz
    const quiz = await Quiz.findOne({
      _id: params.id,
      userId: payload.userId,
    }).lean()

    if (!quiz) {
      return NextResponse.json(
        { message: "Quiz non trouvé" },
        { status: 404 }
      )
    }

    return NextResponse.json(quiz)
  } catch (error) {
    console.error("Erreur lors de la récupération du quiz:", error)
    return NextResponse.json(
      { message: "Une erreur est survenue" },
      { status: 500 }
    )
  }
}

// Supprimer un quiz
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    // Supprimer le quiz
    const quiz = await Quiz.findOneAndDelete({
      _id: params.id,
      userId: payload.userId,
    })

    if (!quiz) {
      return NextResponse.json(
        { message: "Quiz non trouvé" },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: "Quiz supprimé avec succès" })
  } catch (error) {
    console.error("Erreur lors de la suppression du quiz:", error)
    return NextResponse.json(
      { message: "Une erreur est survenue" },
      { status: 500 }
    )
  }
} 