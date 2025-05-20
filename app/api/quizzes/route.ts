import { NextResponse } from "next/server"
import { jwtVerify } from "jose"
import connectDB from "@/lib/mongodb"
import Quiz from "@/models/Quiz"

export async function GET(request: Request) {
  try {
    const token = request.headers.get("cookie")?.split("token=")[1]?.split(";")[0]

    if (!token) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "quizspot_jwt_secret_key_2024")
    const { payload } = await jwtVerify(token, secret)
    const userId = payload.userId

    await connectDB()
    const quizzes = await Quiz.find({ userId }).sort({ createdAt: -1 })

    return NextResponse.json(quizzes)
  } catch (error) {
    console.error("Error fetching quizzes:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des quiz" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get("cookie")?.split("token=")[1]?.split(";")[0]

    if (!token) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "quizspot_jwt_secret_key_2024")
    const { payload } = await jwtVerify(token, secret)
    const userId = payload.userId

    const { title, description, tracks } = await request.json()

    if (!title || !tracks || tracks.length === 0) {
      return NextResponse.json(
        { error: "Titre et chansons requis" },
        { status: 400 }
      )
    }

    await connectDB()
    const quiz = await Quiz.create({
      title,
      description,
      tracks,
      userId,
    })

    return NextResponse.json(quiz)
  } catch (error) {
    console.error("Error creating quiz:", error)
    return NextResponse.json(
      { error: "Erreur lors de la création du quiz" },
      { status: 500 }
    )
  }
} 