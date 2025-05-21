import { NextResponse } from "next/server"
import { jwtVerify } from "jose"
import connectDB from "@/lib/mongodb"
import Quiz from "@/models/Quiz"

// Récupérer tous les quizzes d'un utilisateur
export async function GET(request: Request) {
  console.log("GET quizzes route called")
  
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

      // Récupérer les quizzes de l'utilisateur
      try {
        console.log("Fetching quizzes for user:", userId)
        const quizzes = await Quiz.find({ userId }).sort({ createdAt: -1 })
        console.log(`Found ${quizzes.length} quizzes`)
        return NextResponse.json(quizzes)
      } catch (findError) {
        console.error("Error finding quizzes:", findError)
        return NextResponse.json(
          { error: "Erreur lors de la récupération des quizzes" },
          { status: 500 }
        )
      }
    } catch (jwtError) {
      console.error("JWT verification error:", jwtError)
      return NextResponse.json({ error: "Token invalide" }, { status: 401 })
    }
  } catch (error) {
    console.error("Unexpected error in GET quizzes route:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des quizzes" },
      { status: 500 }
    )
  }
}

// Créer un nouveau quiz
export async function POST(request: Request) {
  console.log("POST quiz route called")
  
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

      // Récupérer les données du corps de la requête
      let body
      try {
        body = await request.json()
        console.log("Request body parsed")
      } catch (parseError) {
        console.error("JSON parsing error:", parseError)
        return NextResponse.json(
          { error: "Format de requête invalide" },
          { status: 400 }
        )
      }

      const { title, description, tracks } = body

      // Validation des données
      if (!title) {
        console.log("Missing title in request")
        return NextResponse.json(
          { error: "Le titre est requis" },
          { status: 400 }
        )
      }

      if (!tracks || !Array.isArray(tracks) || tracks.length === 0) {
        console.log("Missing or invalid tracks in request")
        return NextResponse.json(
          { error: "Au moins une piste est requise" },
          { status: 400 }
        )
      }

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

      // Créer le quiz
      try {
        console.log("Creating new quiz:", { title, tracks: tracks.length })
        const quiz = await Quiz.create({
          title,
          description: description || "",
          tracks,
          userId,
          createdAt: new Date(),
        })
        
        console.log("Quiz created successfully with ID:", quiz._id)
        return NextResponse.json(quiz)
      } catch (createError) {
        console.error("Error creating quiz:", createError)
        return NextResponse.json(
          { error: "Erreur lors de la création du quiz" },
          { status: 500 }
        )
      }
    } catch (jwtError) {
      console.error("JWT verification error:", jwtError)
      return NextResponse.json({ error: "Token invalide" }, { status: 401 })
    }
  } catch (error) {
    console.error("Unexpected error in POST quiz route:", error)
    return NextResponse.json(
      { error: "Erreur lors de la création du quiz" },
      { status: 500 }
    )
  }
} 