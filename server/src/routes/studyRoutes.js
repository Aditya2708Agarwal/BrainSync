const express = require('express')
const crypto = require('crypto')
const { Room, Session, Message, Activity } = require('../models')
const { authRequired } = require('../auth')

const router = express.Router()

function makeInviteCode() {
  return crypto.randomBytes(5).toString('hex')
}

function serializeRoom(room, memberCount) {
  return {
    id: room._id.toString(),
    name: room.name,
    description: room.description,
    isPrivate: room.isPrivate,
    ownerId: room.ownerId.toString(),
    memberCount: memberCount ?? (room.members ? room.members.length : 0),
    inviteCode: room.inviteCode,
    createdAt: room.createdAt,
  }
}

function serializeMessage(message) {
  return {
    id: message._id.toString(),
    roomId: message.roomId.toString(),
    userId: message.userId.toString(),
    userName: message.userName,
    text: message.text,
    createdAt: message.createdAt,
  }
}

function serializeActivity(activity) {
  return {
    id: activity._id.toString(),
    roomId: activity.roomId.toString(),
    type: activity.type,
    userName: activity.userName,
    meta: activity.meta,
    createdAt: activity.createdAt,
  }
}

function emitRoomActivity(req, roomId, activity) {
  const io = req.app.get('io')

  if (io) {
    io.to(roomId.toString()).emit('room:activity', serializeActivity(activity))
  }
}

function emitRoomStats(req, roomId, memberCount) {
  const io = req.app.get('io')

  if (io) {
    io.to(roomId.toString()).emit('room:stats', {
      roomId: roomId.toString(),
      memberCount,
    })
  }
}

async function ensureRoomMembership(room, user) {
  const memberIds = (room.members || []).map((member) => member.toString())
  const isMember = memberIds.includes(user.id)

  if (isMember) {
    return { room, isMember: true }
  }

  if (room.isPrivate) {
    return { room, isMember: false }
  }

  await Room.updateOne({ _id: room._id }, { $addToSet: { members: user.id } })
  room.members = [...memberIds, user.id]

  await Activity.create({
    roomId: room._id,
    userId: user.id,
    userName: user.name,
    type: 'join',
  })

  return { room, isMember: true }
}

router.get('/rooms', authRequired, async (req, res) => {
  const rooms = await Room.find({ members: req.user.id }).sort({ updatedAt: -1 }).lean()
  res.json({ rooms: rooms.map((room) => serializeRoom(room)) })
})

router.post('/rooms', authRequired, async (req, res) => {
  const { name, description, isPrivate } = req.body || {}

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'name is required' })
  }

  const room = await Room.create({
    name: name.trim(),
    description: description || '',
    isPrivate: Boolean(isPrivate),
    ownerId: req.user.id,
    members: [req.user.id],
    inviteCode: makeInviteCode(),
  })

  await Activity.create({
    roomId: room._id,
    userId: req.user.id,
    userName: req.user.name,
    type: 'room_created',
  })

  res.json({ room: serializeRoom(room, 1) })
})

router.post('/rooms/join', authRequired, async (req, res) => {
  const inviteCode = typeof req.body?.inviteCode === 'string' ? req.body.inviteCode.trim() : ''

  if (!inviteCode) {
    return res.status(400).json({ error: 'inviteCode is required' })
  }

  const room = await Room.findOne({ inviteCode }).lean()

  if (!room) {
    return res.status(404).json({ error: 'Room not found' })
  }

  const memberIds = (room.members || []).map((member) => member.toString())
  const isMember = memberIds.includes(req.user.id)

  if (!isMember) {
    await Room.updateOne({ _id: room._id }, { $addToSet: { members: req.user.id } })

    const activity = await Activity.create({
      roomId: room._id,
      userId: req.user.id,
      userName: req.user.name,
      type: 'join',
    })

    emitRoomActivity(req, room._id, activity)
  }

  const updatedMemberCount = isMember ? memberIds.length : memberIds.length + 1

  emitRoomStats(req, room._id, updatedMemberCount)

  res.json({
    room: serializeRoom(room, updatedMemberCount),
    joined: !isMember,
  })
})

router.get('/rooms/:id', authRequired, async (req, res) => {
  const room = await Room.findById(req.params.id).populate('members', 'name').lean()

  if (!room) {
    return res.status(404).json({ error: 'Room not found' })
  }

  const memberIds = (room.members || []).map((member) => member._id.toString())
  const isMember = memberIds.includes(req.user.id)
  const inviteCode = req.query.invite

  if (!isMember) {
    if (room.isPrivate && room.inviteCode !== inviteCode) {
      return res.status(403).json({ error: 'Invite required' })
    }

    await Room.updateOne({ _id: room._id }, { $addToSet: { members: req.user.id } })
    const activity = await Activity.create({
      roomId: room._id,
      userId: req.user.id,
      userName: req.user.name,
      type: 'join',
    })

    emitRoomActivity(req, room._id, activity)

    room.members.push({ _id: req.user.id, name: req.user.name })
  }

  res.json({
    room: {
      ...serializeRoom(room, room.members.length),
      members: room.members.map((member) => ({
        id: member._id.toString(),
        name: member.name,
      })),
    },
  })
})

router.post('/rooms/:id/sessions/start', authRequired, async (req, res) => {
  const room = await Room.findById(req.params.id).lean()

  if (!room) {
    return res.status(404).json({ error: 'Room not found' })
  }

  const session = await Session.create({
    roomId: room._id,
    userId: req.user.id,
    startedAt: new Date(),
  })

  const activity = await Activity.create({
    roomId: room._id,
    userId: req.user.id,
    userName: req.user.name,
    type: 'session_start',
  })

  emitRoomActivity(req, room._id, activity)

  res.json({
    session: {
      id: session._id.toString(),
      startedAt: session.startedAt,
    },
  })
})

router.post('/sessions/:id/end', authRequired, async (req, res) => {
  const session = await Session.findById(req.params.id)

  if (!session) {
    return res.status(404).json({ error: 'Session not found' })
  }

  if (session.userId.toString() !== req.user.id) {
    return res.status(403).json({ error: 'Not your session' })
  }

  if (session.endedAt) {
    return res.json({ session })
  }

  session.endedAt = new Date()
  session.durationMs = session.endedAt.getTime() - session.startedAt.getTime()
  await session.save()

  const activity = await Activity.create({
    roomId: session.roomId,
    userId: req.user.id,
    userName: req.user.name,
    type: 'session_end',
    meta: { durationMs: session.durationMs },
  })

  emitRoomActivity(req, session.roomId, activity)

  res.json({ session })
})

router.get('/rooms/:id/messages', authRequired, async (req, res) => {
  const room = await Room.findById(req.params.id).lean()

  if (!room) {
    return res.status(404).json({ error: 'Room not found' })
  }

  const messages = await Message.find({ roomId: req.params.id })
    .sort({ createdAt: 1 })
    .limit(200)
    .lean()

  res.json({ messages: messages.map(serializeMessage) })
})

router.post('/rooms/:id/messages', authRequired, async (req, res) => {
  const room = await Room.findById(req.params.id).lean()

  if (!room) {
    return res.status(404).json({ error: 'Room not found' })
  }

  const text = typeof req.body?.text === 'string' ? req.body.text.trim() : ''

  if (!text) {
    return res.status(400).json({ error: 'text is required' })
  }

  const memberIds = (room.members || []).map((member) => member.toString())
  const isMember = memberIds.includes(req.user.id)

  if (!isMember && room.isPrivate) {
    return res.status(403).json({ error: 'Not a member of this room' })
  }

  const message = await Message.create({
    roomId: room._id,
    userId: req.user.id,
    userName: req.user.name,
    text,
  })

  res.status(201).json({ message: serializeMessage(message) })
})

router.get('/rooms/:id/activity', authRequired, async (req, res) => {
  const room = await Room.findById(req.params.id).lean()

  if (!room) {
    return res.status(404).json({ error: 'Room not found' })
  }

  const activity = await Activity.find({ roomId: req.params.id })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean()

  res.json({ activity: activity.map(serializeActivity) })
})

router.get('/me/stats', authRequired, async (req, res) => {
  const sessions = await Session.find({
    userId: req.user.id,
    endedAt: { $ne: null },
  }).lean()

  const totalSessions = sessions.length
  const totalMs = sessions.reduce((sum, session) => sum + (session.durationMs || 0), 0)

  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  const todayMs = sessions
    .filter((session) => session.endedAt && new Date(session.endedAt) >= startOfToday)
    .reduce((sum, session) => sum + (session.durationMs || 0), 0)

  const dayKeys = new Set(
    sessions.map((session) => {
      const date = new Date(session.endedAt)
      return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
    }),
  )

  let streak = 0
  const cursor = new Date()
  cursor.setHours(0, 0, 0, 0)

  while (dayKeys.has(`${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getDate()}`)) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  res.json({
    stats: {
      totalSessions,
      totalMinutes: Math.round(totalMs / 60000),
      todayMinutes: Math.round(todayMs / 60000),
      streakDays: streak,
    },
  })
})

module.exports = router
