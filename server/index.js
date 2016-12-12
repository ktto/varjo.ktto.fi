import express          from 'express'
import parser           from 'body-parser'
import multer           from 'multer'
import {resolve}        from 'path'
import {extension}      from 'mime-types'

import api from './api'

module.exports = function createServer () {
  const app    = express()
  const files  = multer({storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, resolve(__dirname, '..', 'data', 'files'))
    },
    filename: (req, file, cb) => {
      cb(null, `${req.params.course}-${Date.now()}.${extension(file.mimetype)}`)
    }
  })})

  app.disable('x-powered-by')
  app.use('/public', express.static(resolve(__dirname, '..', 'public')))
  app.use('/api', parser.json())

  app.get('/favicon.ico', (req, res) => {
    res.sendFile(resolve(__dirname, '..', 'public', 'ktto.png'))
  })
  app.get('/files/:filename', (req, res) => {
    res.sendFile(resolve(__dirname, '..', 'data', 'files', req.params.filename))
  })

  app.get('/api/courses', sendJSON(api.getCourses))
  app.get('/api/:course', sendJSON(api.getCourse))
  //app.get('/api/:course/history', sendJSON(api.getCourseHistory))
  //app.get('/api/:course/:commit', sendJSON(api.getCourseAt))
  app.post('/api/courses', sendJSON(api.setCourses))
  app.post('/api/:course', sendJSON(api.setCourse))

  app.post('/upload/:course', files.single('file'), sendJSON(api.setMaterial))

  app.get('*', (req, res) => api.renderHTML(req).then(html => res.send(html)))

  return app
}

function sendJSON (apiFn) {
  return (req, res) => apiFn(req)
    .then(data   => res.json(data))
    .catch(error => res.status(500).json({error}))
}

