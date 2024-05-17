const express = require('express')
const morgan = require('morgan')
const cors = require('cors');
const app = express()
let notes = require('./src/data/notes')

app.use(express.json())
app.use(cors())
app.use(morgan((tokens, req, res) => {
  const body = req.body
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens['content-length'], '-',
    tokens['response-time'](req, res), 'ms',
    JSON.stringify(body)
  ].join(' ')
}))

app.get('/', (req, res) => {
  res.send(`<h1>Welcome to Notes App</h1>`)
})

app.get('/api/notes', (req, res) => {
  const query = req.query.content
  if (notes) {
    let filteredNotes = query
      ? notes.filter(note => note.content.toLowerCase().includes(query.toLowerCase()))
      : notes
    res.status(200)
    res.json(filteredNotes)
  } else {
    res.status(400).end('No data')
  }
})

app.get('/api/notes/:id', (req, res) => {
  const id = Number(req.params.id)
  const note = notes.find(note => note.id === id)
  if (note) {
    res.status(200)
    res.json(note)
  } else {
    res.status(404).end('Not found')
  }
})

app.delete('/api/notes/:id', (req, res) => {
  const id = Number(req.params.id)
  notes = notes.filter(note => note.id !== id)
  res.status(404).end()
})

const generateId = () => {
  const maxId = notes.length > 0
    ? Math.max(...notes.map(n => n.id))
    : 0

  return maxId + 1
}

app.post('/api/notes', (req, res) => {
  const body = req.body
  console.log(body)

  if (!body.content) {
    return res.status(400).json({
      error: 'content is missing'
    })
  }

  const note = {
    content: body.content,
    important: Boolean(body.important) || false,
    id: generateId()
  }

  notes = notes.concat(note)

  res.status(200)
  res.json(notes)
})

const port = 3001

app.listen(port, () => {
  console.log(`Server is running on ${port}`)
})