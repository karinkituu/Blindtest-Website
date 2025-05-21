import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import connectDB from "@/lib/mongodb"
import mongoose from "mongoose"
import Quiz from "@/models/Quiz"

// Configuration de l'API Gemini
const genAI = new GoogleGenerativeAI("AIzaSyBZwNhRya7NxAq88qt7Cq4O57BKej8nd68")
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

// Secret JWT
const JWT_SECRET = process.env.JWT_SECRET || "quizspot_jwt_secret_key_2024"

// Format attendu pour le quiz généré
interface GeneratedQuiz {
  title: string;
  description: string;
  tracks: {
    artist: string;
    title: string;
  }[];
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification avec JWT
    const token = request.cookies.get("token")?.value;
    
    if (!token) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }
    
    // Vérifier le token JWT
    let userId: string;
    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      userId = payload.userId as string;
      console.log("Token JWT vérifié, userId:", userId);
    } catch (error) {
      console.error("Token JWT invalide:", error);
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer la demande de l'utilisateur
    const { prompt } = await request.json()
    
    if (!prompt) {
      return NextResponse.json({ error: "Prompt requis" }, { status: 400 })
    }

    // Construire le prompt pour l'IA
    const systemPrompt = `
      Tu es un expert en musique qui va créer un quiz musical basé sur les demandes de l'utilisateur.
      Crée un quiz avec 10 chansons qui correspondent à la description suivante: "${prompt}".
      
      Pour chaque chanson, indique l'artiste et le titre de la chanson.
      
      IMPORTANT:
      - Le titre du quiz doit être court (max 30 caractères) et précis
      - La description doit être brève (max 100 caractères) et informative
      - Assure-toi que chaque chanson est unique (pas de doublons)
      - Ne répète PAS le même artiste plusieurs fois
      - Diversifie les choix pour rendre le quiz intéressant
      
      Réponds uniquement avec un objet JSON valide au format suivant:
      {
        "title": "Titre court et concis du quiz",
        "description": "Description brève et claire du quiz",
        "tracks": [
          { "artist": "Nom de l'artiste 1", "title": "Titre de la chanson 1" },
          { "artist": "Nom de l'artiste 2", "title": "Titre de la chanson 2" },
          ... (10 chansons au total)
        ]
      }
      
      N'inclue aucun texte supplémentaire dans ta réponse, uniquement l'objet JSON.
    `

    // Appel à l'API Gemini
    const result = await model.generateContent(systemPrompt.trim())
    const response = result.response
    const responseText = response.text()
    
    // Extraire et parser le JSON
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    
    if (!jsonMatch) {
      console.error("Format de réponse invalide:", responseText)
      return NextResponse.json({ error: "Erreur lors de la génération du quiz" }, { status: 500 })
    }
    
    const jsonResponse = JSON.parse(jsonMatch[0]) as GeneratedQuiz
    
    // Vérifier et éliminer les doublons dans les pistes générées
    const uniqueTracks = [];
    const seenKeys = new Set();
    
    for (const track of jsonResponse.tracks) {
      const key = `${track.artist.toLowerCase()}-${track.title.toLowerCase()}`;
      
      // Si cette combinaison artiste-titre n'a pas encore été vue, l'ajouter
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        uniqueTracks.push(track);
      } else {
        console.log(`Doublon détecté et éliminé: ${track.artist} - ${track.title}`);
      }
    }
    
    // Remplacer les pistes par les pistes uniques
    jsonResponse.tracks = uniqueTracks;
    
    // Connexion à la base de données
    await connectDB()
    
    // Vérifier si un quiz avec le même titre existe déjà
    const existingQuiz = await Quiz.findOne({ 
      title: { $regex: new RegExp(jsonResponse.title, 'i') },
      userId: userId
    });
    
    if (existingQuiz) {
      // Modifier légèrement le titre pour éviter les doublons
      const timestamp = new Date().toISOString().slice(11, 19).replace(/:/g, 'h');
      jsonResponse.title = `${jsonResponse.title} (${timestamp})`;
      console.log(`Quiz avec titre similaire trouvé. Nouveau titre: ${jsonResponse.title}`);
    }
    
    // Transformer les pistes en format attendu par l'application
    const transformedTracks = await Promise.all(jsonResponse.tracks.map(async (track, index) => {
      // Rechercher l'information de la piste via l'API Deezer
      try {
        const searchQuery = `${track.artist} ${track.title}`.trim()
        const deezerResponse = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(searchQuery)}&limit=1`)
        const deezerData = await deezerResponse.json()
        
        if (deezerData.data && deezerData.data.length > 0) {
          const deezerTrack = deezerData.data[0]
          return {
            id: `generated-${index}`,
            deezerId: deezerTrack.id.toString(),
            title: deezerTrack.title,
            artist: deezerTrack.artist.name,
            album: deezerTrack.album.title,
            image: deezerTrack.album.cover_medium,
            preview: deezerTrack.preview
          }
        }
      } catch (error) {
        console.error(`Erreur lors de la recherche Deezer pour ${track.artist} - ${track.title}:`, error)
      }
      
      // Fallback si aucune correspondance n'est trouvée
      return {
        id: `generated-${index}`,
        title: track.title,
        artist: track.artist,
        album: "",
        image: "",
        preview: ""
      }
    }))
    
    // Créer le quiz dans la base de données en utilisant le modèle Quiz
    try {
      console.log("Tentative de création du quiz avec userId:", userId);
      console.log("Type de userId:", typeof userId);
      
      // Si userId est une chaîne, convertir en ObjectId pour MongoDB
      const userIdObj = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
      console.log("userId après conversion:", userIdObj);
      
      const quiz = await Quiz.create({
        title: jsonResponse.title,
        description: jsonResponse.description,
        tracks: transformedTracks,
        userId: userIdObj,
        createdAt: new Date()
      });
      
      console.log("Quiz créé avec succès, ID:", quiz._id);
      
      // Retourner l'ID du quiz créé
      return NextResponse.json({ quizId: quiz._id.toString() })
    } catch (error) {
      console.error("Erreur lors de la création du quiz dans la base de données:", error)
      return NextResponse.json({ error: "Erreur lors de la création du quiz" }, { status: 500 })
    }
    
  } catch (error) {
    console.error("Erreur lors de la génération du quiz:", error)
    return NextResponse.json({ error: "Erreur lors de la génération du quiz" }, { status: 500 })
  }
} 