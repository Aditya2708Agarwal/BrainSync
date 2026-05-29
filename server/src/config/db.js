const mongoose = require('mongoose')

let dbConnected = false

function isDbConnected() {
  return dbConnected
}

async function connectDB() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not defined')
  }

  try {
    await mongoose.connect(process.env.MONGO_URI)
    dbConnected = true
    console.log('MongoDB connected')
    return true
  } catch (error) {
    dbConnected = false
    console.warn(`MongoDB connection failed for Atlas: ${error.message}`)
    console.warn('MongoDB is unavailable. Auth routes will return 503 until the database connects.')
    return false
  }
}

module.exports = connectDB
module.exports.isDbConnected = isDbConnected
