import { NextResponse } from "next/server"
import { jwtVerify } from "jose"
import connectDB from "@/lib/mongodb"
import Quiz from "@/models/Quiz"

// Récupérer un quiz spécifique
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get("cookie")?.split("token=")[1]?.split(";")[0]

    if (!token) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "quizspot_jwt_secret_key_2024")
    const { payload } = await jwtVerify(token, secret)
    const userId = payload.userId

    await connectDB()
    const { id } = await Promise.resolve(params)
    const quiz = await Quiz.findOne({ _id: id, userId })

    if (!quiz) {
      return NextResponse.json({ error: "Quiz non trouvé" }, { status: 404 })
    }

    return NextResponse.json(quiz)
  } catch (error) {
    console.error("Error fetching quiz:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération du quiz" },
      { status: 500 }
    )
  }
}

// Supprimer un quiz
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get("cookie")?.split("token=")[1]?.split(";")[0]

    if (!token) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "quizspot_jwt_secret_key_2024")
    const { payload } = await jwtVerify(token, secret)
    const userId = payload.userId

    await connectDB()
    const { id } = await Promise.resolve(params)
    const quiz = await Quiz.findOneAndDelete({ _id: id, userId })

    if (!quiz) {
      return NextResponse.json({ error: "Quiz non trouvé" }, { status: 404 })
    }

    return NextResponse.json({ message: "Quiz supprimé avec succès" })
  } catch (error) {
    console.error("Error deleting quiz:", error)
    return NextResponse.json(
      { error: "Erreur lors de la suppression du quiz" },
      { status: 500 }
    )
  }
} 