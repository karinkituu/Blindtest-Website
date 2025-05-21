import { NextResponse } from "next/server"
import { jwtVerify } from "jose"
import connectDB from "@/lib/mongodb"
import Quiz from "@/models/Quiz"

// Récupérer un quiz spécifique
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log("GET quiz route called with ID:", params.id)
  
  try {
    // Extraire le token du cookie
    const token = request.headers.get("cookie")?.split("token=")[1]?.split(";")[0]
    console.log("Token present:", !!token)

    if (!token) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Vérifier le token
    try {
      const JWT_SECRET = process.env.JWT_SECRET || "quizspot_jwt_secret_key_2024"
      console.log("Using JWT secret length:", JWT_SECRET.length)
      
      const secret = new TextEncoder().encode(JWT_SECRET)
      const { payload } = await jwtVerify(token, secret)
      const userId = payload.userId
      console.log("Token verified, user ID:", userId)

      // Se connecter à MongoDB
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

      // Récupérer le quiz
      try {
        console.log("Fetching quiz with ID:", params.id, "for user:", userId)
        const quiz = await Quiz.findOne({ _id: params.id, userId })
        
        if (!quiz) {
          console.log("Quiz not found")
          return NextResponse.json({ error: "Quiz non trouvé" }, { status: 404 })
        }
        
        console.log("Quiz found successfully")
        return NextResponse.json(quiz)
      } catch (findError) {
        console.error("Error finding quiz:", findError)
        return NextResponse.json(
          { error: "Erreur lors de la récupération du quiz" },
          { status: 500 }
        )
      }
    } catch (jwtError) {
      console.error("JWT verification error:", jwtError)
      return NextResponse.json({ error: "Token invalide" }, { status: 401 })
    }
  } catch (error) {
    console.error("Unexpected error in GET quiz route:", error)
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
  console.log("DELETE quiz route called with ID:", params.id)
  
  try {
    // Extraire le token du cookie
    const token = request.headers.get("cookie")?.split("token=")[1]?.split(";")[0]
    console.log("Token present:", !!token)

    if (!token) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Vérifier le token
    try {
      const JWT_SECRET = process.env.JWT_SECRET || "quizspot_jwt_secret_key_2024"
      const secret = new TextEncoder().encode(JWT_SECRET)
      const { payload } = await jwtVerify(token, secret)
      const userId = payload.userId
      console.log("Token verified, user ID:", userId)

      // Se connecter à MongoDB
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

      // Supprimer le quiz
      try {
        console.log("Deleting quiz with ID:", params.id, "for user:", userId)
        const quiz = await Quiz.findOneAndDelete({ _id: params.id, userId })
        
        if (!quiz) {
          console.log("Quiz not found for deletion")
          return NextResponse.json({ error: "Quiz non trouvé" }, { status: 404 })
        }
        
        console.log("Quiz deleted successfully")
        return NextResponse.json({ message: "Quiz supprimé avec succès" })
      } catch (deleteError) {
        console.error("Error deleting quiz:", deleteError)
        return NextResponse.json(
          { error: "Erreur lors de la suppression du quiz" },
          { status: 500 }
        )
      }
    } catch (jwtError) {
      console.error("JWT verification error:", jwtError)
      return NextResponse.json({ error: "Token invalide" }, { status: 401 })
    }
  } catch (error) {
    console.error("Unexpected error in DELETE quiz route:", error)
    return NextResponse.json(
      { error: "Erreur lors de la suppression du quiz" },
      { status: 500 }
    )
  }
} 