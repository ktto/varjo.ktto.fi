import express          from 'express'
import parser           from 'body-parser'
import React            from 'react'
import {renderToString} from 'react-dom/server'
import {resolve}        from 'path'

import App   from '../src/js/components/App'
import files from './files'

module.exports = function createServer () {

  const app = express()
  const api = express()


  app.disable('x-powered-by')
  app.use('/public', express.static(resolve(`${__dirname}/../public`)))
  api.use(parser.json())
  app.use('/api', api)


  api.get('/courses', (req, res) => {
    files.getCourses()
      .then(data   => res.json(data))
      .catch(error => res.status(500).json({error}))
  })

  api.get('/:course/history', (req, res) => {
    files.getCourseHistory(req.params.course, req.query.commit)
      .then(content => res.json({content}))
      .catch(error  => res.status(500).json({error}))
  })

  api.get('/:course/:commit', (req, res) => {
    files.getCourseAt(req.params)
      .then(content => res.json({content}))
      .catch(error  => res.status(500).json({error}))
  })

  app.get('*', (req, res) => {
    const {path} = req
    const state  = {path, history: true}
    const html   = renderToString(<App {...state}/>)
    res.send(renderHTML(html, state))
  })

  return app
}

function renderHTML (appHTML, appState) {
return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no">
    <link href='https://fonts.googleapis.com/css?family=Cambay:400,700' rel='stylesheet' type='text/css'>
    <link rel="stylesheet" type="text/css" href="/public/css/all.min.css">
    <title>ktto | varjo-opinto-opas</title>
  </head>
  <body>
    <main id="app">${appHTML}</main>
    <script>window.INITIAL_STATE = ${JSON.stringify(appState)}</script>
    <script src="/public/js/all.min.js"></script>
  </body>
</html>`
}
