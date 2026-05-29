const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const dotenv = require('dotenv')
const http = require('http')
const { Server } = require('socket.io')
const jwt = require('jsonwebtoken')

const connectDB = require('./src/config/db')
const authRoutes = require('./src/routes/authRoutes')
const studyRoutes = require('./src/routes/studyRoutes')
const { User, Room, Message, Activity } = require('./src/models')
const dns = require('dns')

dotenv.config()

dns.setServers(['1.1.1.1', '8.8.8.8'])

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  },
})

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  }),
)
app.use(express.json())
app.use(cookieParser())
app.set('io', io)

app.get('/api/health', (req, res) => {
  res.json({ ok: true })
})

app.use('/api/auth', authRoutes)
app.use('/api', studyRoutes)

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
    meta: activity.meta || null,
    createdAt: activity.createdAt,
  }
}

async function getSocketUser(token) {
  const decoded = jwt.verify(token, process.env.JWT_SECRET)
  const user = await User.findById(decoded.id).select('name email')

  if (!user) {
    return null
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
  }
}

io.on('connection', async (socket) => {
  try {
    const token = socket.handshake.auth?.token

    if (!token) {
      socket.disconnect(true)
      return
    }

    const user = await getSocketUser(token)

    if (!user) {
      socket.disconnect(true)
      return
    }

    socket.data.user = user
  } catch (error) {
    socket.disconnect(true)
    return
  }

  socket.on('disconnect', () => {})

  socket.on('room:join', async ({ roomId }, ack) => {
    try {
      const room = await Room.findById(roomId).lean()

      if (!room) {
        return ack?.({ error: 'Room not found' })
      }

      const memberIds = (room.members || []).map((member) => member.toString())
      const isMember = memberIds.includes(socket.data.user.id)

      if (!isMember) {
        if (room.isPrivate) {
          return ack?.({ error: 'Invite required' })
        }

        await Room.updateOne({ _id: room._id }, { $addToSet: { members: socket.data.user.id } })

        const activity = await Activity.create({
          roomId: room._id,
          userId: socket.data.user.id,
          userName: socket.data.user.name,
          type: 'join',
        })

        io.to(roomId).emit('room:activity', serializeActivity(activity))
      }

      socket.join(roomId)
      const updatedMemberCount = isMember ? (room.members || []).length : (room.members || []).length + 1
      io.to(roomId).emit('room:stats', {
        roomId: room._id.toString(),
        memberCount: updatedMemberCount,
      })

      return ack?.({ ok: true, memberCount: updatedMemberCount })
    } catch (error) {
      return ack?.({ error: 'Could not join room' })
    }
  })

  socket.on('room:leave', async ({ roomId }, ack) => {
    socket.leave(roomId)

    try {
      const room = await Room.findById(roomId).lean()

      if (room) {
        const activity = await Activity.create({
          roomId: room._id,
          userId: socket.data.user.id,
          userName: socket.data.user.name,
          type: 'leave',
        })

        io.to(roomId).emit('room:activity', serializeActivity(activity))
      }

      ack?.({ ok: true })
    } catch (error) {
      ack?.({ ok: true })
    }
  })

  socket.on('chat:send', async ({ roomId, text }, ack) => {
    try {
      const messageText = typeof text === 'string' ? text.trim() : ''

      if (!roomId || !messageText) {
        return ack?.({ error: 'roomId and text are required' })
      }

      const room = await Room.findById(roomId).lean()

      if (!room) {
        return ack?.({ error: 'Room not found' })
      }

      const memberIds = (room.members || []).map((member) => member.toString())
      const isMember = memberIds.includes(socket.data.user.id)

      if (!isMember && room.isPrivate) {
        return ack?.({ error: 'Invite required' })
      }

      if (!isMember) {
        await Room.updateOne({ _id: room._id }, { $addToSet: { members: socket.data.user.id } })

        await Activity.create({
          roomId: room._id,
          userId: socket.data.user.id,
          userName: socket.data.user.name,
          type: 'join',
        })
      }

      const message = await Message.create({
        roomId: room._id,
        userId: socket.data.user.id,
        userName: socket.data.user.name,
        text: messageText,
      })

      const payload = serializeMessage(message)
      io.to(roomId).emit('chat:message', payload)
      return ack?.({ ok: true, message: payload })
    } catch (error) {
      return ack?.({ error: 'Could not send message' })
    }
  })
})

const PORT = process.env.PORT || 5000

async function startServer() {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })

  await connectDB()
}

startServer().catch((error) => {
  console.error('Failed to start server:', error)
  process.exit(1)
})
