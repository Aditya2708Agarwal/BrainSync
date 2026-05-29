const mongoose = require('mongoose')

const { Schema, Types } = mongoose

const roomSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    isPrivate: { type: Boolean, default: false },
    ownerId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    members: [{ type: Types.ObjectId, ref: 'User', index: true }],
    inviteCode: { type: String, required: true, unique: true },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Room', roomSchema)