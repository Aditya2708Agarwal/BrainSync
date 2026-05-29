const mongoose = require('mongoose')

const { Schema, Types } = mongoose

const activitySchema = new Schema(
  {
    roomId: { type: Types.ObjectId, ref: 'Room', required: true, index: true },
    userId: { type: Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    type: {
      type: String,
      enum: ['join', 'leave', 'session_start', 'session_end', 'room_created'],
      required: true,
    },
    meta: { type: Object, default: {} },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Activity', activitySchema)