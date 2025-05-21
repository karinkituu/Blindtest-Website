import mongoose from "mongoose"

// Définition des types pour la connexion
interface Connection {
  isConnected?: number
}

// Variable globale pour stocker l'état de connexion
const connection: Connection = {}

/**
 * Connecte à la base de données MongoDB
 * Si une connexion existe déjà, la réutilise
 * Sinon, crée une nouvelle connexion
 */
async function connectDB() {
  // Si déjà connecté, réutiliser la connexion existante
  if (connection.isConnected) {
    console.log("✅ MongoDB: Réutilisation de la connexion existante")
    return
  }

  // Vérifier que l'URI MongoDB est défini
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error("🔴 MongoDB: La variable d'environnement MONGODB_URI n'est pas définie")
  }

  try {
    console.log("⏳ MongoDB: Tentative de connexion...")
    
    // Options de connexion
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as mongoose.ConnectOptions

    // Connexion à MongoDB
    const db = await mongoose.connect(uri, options)
    
    // Stocker l'état de connexion
    connection.isConnected = db.connections[0].readyState
    
    console.log(`✅ MongoDB: Connecté avec succès (état: ${connection.isConnected})`)
  } catch (error) {
    console.error("🔴 MongoDB: Erreur de connexion", error)
    throw error
  }
}

// Événements de connexion MongoDB pour débogage
mongoose.connection.on("connected", () => {
  console.log("📊 MongoDB: Événement connected déclenché")
})

mongoose.connection.on("disconnected", () => {
  console.log("📊 MongoDB: Événement disconnected déclenché")
})

mongoose.connection.on("error", (err) => {
  console.error("📊 MongoDB: Événement error déclenché", err)
})

process.on("SIGINT", async () => {
  await mongoose.connection.close()
  console.log("📊 MongoDB: Connexion fermée (SIGINT)")
  process.exit(0)
})

export default connectDB 