import express          from 'express'
import parser           from 'body-parser'
import fetch            from 'node-fetch'
import Promise          from 'bluebird'
import * as L           from 'partial.lenses'
import React            from 'react'
import {renderToString} from 'react-dom/server'
import {resolve}        from 'path'

import files from './files'
import App   from '../src/js/components/App'
import {contentIn, courseMatchesUrl} from '../src/js/util'

module.exports = function createServer () {

  const app = express()
  const api = express()


  app.disable('x-powered-by')
  app.use('/public', express.static(resolve(`${__dirname}/../public`)))
  api.use(parser.json())
  app.use('/api', api)


  api.get('/courses', handleRoute(files.getCourses))
  api.get('/:course', handleRoute(files.getCourse))
  api.get('/:course/history', handleRoute(files.getCourseHistory))
  api.get('/:course/:commit', handleRoute(files.getCourseAt))

  api.post('/:course', handleRoute(files.setCourse))

  app.get('/favicon.ico', files.favicon)
  app.get('*', (req, res) => {
    const {path}  = req
    Promise.props({
      courses: files.getCourses({path: '/api/courses'}),
      content: path === '/' ? Promise.resolve() : fetchData(req)
    }).then(data => {
      const courses = L.set(contentIn(path), data.content, data.courses)
      const state   = {courses, filter: '', path, editing: false, history: true}
      const html    = renderToString(<App {...state}/>)
      res.send(renderHTML(html, state))
    })
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

function handleRoute (getData) {
  return (req, res) => getData(req)
    .then(data   => res.json(data))
    .catch(error => res.status(500).json({error}))
}

function fetchData (req) {
  return fetch(`${req.protocol}://${req.headers.host}/api${req.path}`)
    .then(res => res.json())
}

