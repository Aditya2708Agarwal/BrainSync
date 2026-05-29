const mongoose = require('mongoose')

const { Schema, Types } = mongoose

const messageSchema = new Schema(
  {
    roomId: { type: Types.ObjectId, ref: 'Room', required: true, index: true },
    userId: { type: Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    text: { type: String, required: true },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Message', messageSchema)