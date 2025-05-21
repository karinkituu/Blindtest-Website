import mongoose from 'mongoose'

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  tracks: [{
    id: String,
    title: String,
    artist: String,
    album: String,
    image: String,
    preview: String,
    deezerId: String,
  }],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.Quiz || mongoose.model('Quiz', quizSchema) 