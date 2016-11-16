import express          from 'express'
import parser           from 'body-parser'
import {resolve}        from 'path'

import api from './api'

module.exports = function createServer () {
  const app = express()

  app.disable('x-powered-by')
  app.use('/public', express.static(resolve(`${__dirname}/../public`)))
  app.use(parser.json())

  app.get('/favicon.ico', (req, res) => {
    res.sendFile(resolve(__dirname, '..', 'public', 'ktto.png'))
  })

  app.get('/api/courses', sendJSON(api.getCourses))
  app.get('/api/:course', sendJSON(api.getCourse))
  app.get('/api/:course/history', sendJSON(api.getCourseHistory))
  app.get('/api/:course/:commit', sendJSON(api.getCourseAt))

  app.post('/api/:course', sendJSON(api.setCourse))

  app.get('*', (req, res) => {
    api.renderHTML(req)
      .then(html => res.send(html))
  })

  return app
}

function sendJSON (apiFn) {
  return (req, res) => apiFn(req)
    .then(data   => res.json(data))
    .catch(error => res.status(500).json({error}))
}

