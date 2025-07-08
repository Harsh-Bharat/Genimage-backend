
import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },

  password: {
    type: String,
    required: true
  },

  creditLeft: {
    type: Number,
    default: 5
    
  }
})

const Usermodel = mongoose.model('User', userSchema)

export default Usermodel;
