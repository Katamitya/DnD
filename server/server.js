const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const cors = require('cors')
const { v4: uuidv4 } = require('uuid')

const app = express()
const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})

app.use(cors())
app.use(express.json())

// In-memory storage (в реальном проекте используйте базу данных)
const sessions = new Map()
const characters = new Map()

// API Routes
app.get('/api/sessions', (req, res) => {
  const sessionsList = Array.from(sessions.values())
  res.json(sessionsList)
})

app.post('/api/sessions', (req, res) => {
  const { name, masterId } = req.body
  const sessionId = uuidv4()
  
  const newSession = {
    id: sessionId,
    name,
    masterId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    settings: {
      gridSize: 15,
      cellSize: 40
    },
    characters: []
  }
  
  sessions.set(sessionId, newSession)
  
  // Уведомляем всех клиентов о новой сессии
  io.emit('sessionCreated', newSession)
  
  res.json(newSession)
})

app.get('/api/sessions/:id', (req, res) => {
  const session = sessions.get(req.params.id)
  if (!session) {
    return res.status(404).json({ error: 'Session not found' })
  }
  res.json(session)
})

app.put('/api/sessions/:id', (req, res) => {
  const session = sessions.get(req.params.id)
  if (!session) {
    return res.status(404).json({ error: 'Session not found' })
  }
  
  const updatedSession = {
    ...session,
    ...req.body,
    updatedAt: new Date().toISOString()
  }
  
  sessions.set(req.params.id, updatedSession)
  
  // Уведомляем всех клиентов об обновлении сессии
  io.emit('sessionUpdated', updatedSession)
  
  res.json(updatedSession)
})

app.post('/api/sessions/:id/characters', (req, res) => {
  const session = sessions.get(req.params.id)
  if (!session) {
    return res.status(404).json({ error: 'Session not found' })
  }
  
  const character = {
    id: uuidv4(),
    ...req.body,
    createdAt: new Date().toISOString()
  }
  
  characters.set(character.id, character)
  session.characters.push(character)
  session.updatedAt = new Date().toISOString()
  
  sessions.set(req.params.id, session)
  
  // Уведомляем всех клиентов о новом персонаже
  io.emit('characterAdded', { sessionId: req.params.id, character })
  
  res.json(character)
})

app.put('/api/characters/:id', (req, res) => {
  const character = characters.get(req.params.id)
  if (!character) {
    return res.status(404).json({ error: 'Character not found' })
  }
  
  const updatedCharacter = {
    ...character,
    ...req.body,
    updatedAt: new Date().toISOString()
  }
  
  characters.set(req.params.id, updatedCharacter)
  
  // Уведомляем всех клиентов об обновлении персонажа
  io.emit('characterUpdated', updatedCharacter)
  
  res.json(updatedCharacter)
})

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id)
  
  socket.on('joinSession', (sessionId) => {
    socket.join(sessionId)
    console.log(`User ${socket.id} joined session ${sessionId}`)
  })
  
  socket.on('leaveSession', (sessionId) => {
    socket.leave(sessionId)
    console.log(`User ${socket.id} left session ${sessionId}`)
  })
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
})

const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log(`🚀 DnD Sync Server running on port ${PORT}`)
  console.log(`📡 WebSocket server ready for connections`)
})
