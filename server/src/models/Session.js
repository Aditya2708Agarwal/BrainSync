const mongoose = require('mongoose')

const { Schema, Types } = mongoose

const sessionSchema = new Schema(
  {
    roomId: { type: Types.ObjectId, ref: 'Room', required: true, index: true },
    userId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    startedAt: { type: Date, required: true },
    endedAt: { type: Date, default: null },
    durationMs: { type: Number, default: 0 },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Session', sessionSchema)