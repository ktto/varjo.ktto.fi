import express     from 'express'
import session     from 'express-session'
import passport    from 'passport'
import parser      from 'body-parser'
import multer      from 'multer'
import {resolve}   from 'path'
import {extension} from 'mime-types'

import auth from './auth'
import api  from './api'

module.exports = function createServer (config) {
  const app    = express()
  const login  = auth(passport, config)
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
  app.use(session({secret: config.secret, resave: false, saveUninitialized: false}))
  app.use(passport.initialize())
  app.use(passport.session())

  app.get('/favicon.ico', (req, res) => {
    res.sendFile(resolve(__dirname, '..', 'public', 'ktto.png'))
  })
  app.get('/files/:filename', (req, res) => {
    res.sendFile(resolve(__dirname, '..', 'data', 'files', req.params.filename))
  })

  app.get('/api/courses', sendJSON(api.getCourses))
  app.get('/api/:course', sendJSON(api.getCourse))
  app.get('/api/:course/history', sendJSON(api.getCourseHistory))
  app.get('/api/:course/:commit', sendJSON(api.getCourseAt))

  app.post('/api/courses', login, sendJSON(api.setCourses))
  app.post('/api/:course', sendJSON(api.setCourse))
  app.post('/upload/:course', files.single('file'), sendJSON(api.setMaterial))

  app.delete('/api/:course', login, sendJSON(api.deleteCourse))
  app.delete('/upload/:filename', login, sendJSON(api.deleteMaterial))


  app.get('/login', login, (req, res) => {
    res.redirect('/')
  })
  app.get('/logout', (req, res) => {
    req.logout()
    req.session.destroy()
    res.redirect('/')
  })

  app.get('*', (req, res) => api.renderHTML(req).then(html => res.send(html)))

  return {
    start: () => app.listen(
      config.port,
      () => console.log(`server listening at ${config.port}`)
    )
  }
}

function sendJSON (apiFn) {
  return (req, res) => apiFn(req)
    .then(data   => res.json(data))
    .catch(error => res.status(500).json({error}))
}
