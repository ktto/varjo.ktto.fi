import Bluebird         from 'bluebird'
import R                from 'ramda'
import * as L           from 'partial.lenses'
import fetch            from 'node-fetch'
import React            from 'react'
import {renderToString} from 'react-dom/server'
import {resolve}        from 'path'

import App                    from '../src/js/components/App'
import {cache, resetCache}    from './cache'
import {contentIn, normalize} from '../src/js/util'

const fs          = Bluebird.promisifyAll(require('fs'))
const {execAsync} = Bluebird.promisifyAll(require('child_process'))

const DATA_DIR = resolve(__dirname, '..', 'data')

const getCourses = req => cache(req.path, () => {
  return fs.readdirAsync(DATA_DIR)
    .filter(f => f.endsWith('.json'))
    .map(read)
    .map(JSON.parse)
})

const setCourses = req => resetCache(req.path, () => {
  const {course} = req.body
  const title    = normalize(course.title)
  return Bluebird.all([
    write(`${title}.json`, JSON.stringify(course, null, 2)),
    write(`${title}.md`, '')
  ]).then(() => req.body.course)
})

const getCourse = req => cache(req.path, () => {
  return read(`${req.params.course}.md`)
})

const setCourse = req => resetCache(req.path, () => {
  return write(`${req.params.course}.md`, req.body.content)
    .then(() => req.body.content)
})

const setMaterial = req => resetCache(req.path, () => {
  const file = `${req.params.course}.json`
  return read(file)
    .then(JSON.parse)
    .then(json => {
      const {material} = json
      const {filename} = req.file
      const {title}    = req.body
      const uploaded   = {title, filename}
      const data       = R.merge(json, {material: material.concat(uploaded)})
      return write(file, JSON.stringify(data, null, 2))
        .then(() => uploaded)
    })
})

const getCourseHistory = req => cache(req.path, () => {
  return execAsync(`git log -- ${getFilename(req.params.course)}`)
    .then(R.pipe(
      R.split('\n'),
      R.filter(line => line.startsWith('commit') || line.startsWith('Date')),
      R.map(R.compose(R.join(' '), R.tail, R.split(/\s+/))),
      R.splitEvery(2),
      R.map(([commit, date]) => ({commit, date}))
    ))
})

const getCourseAt = req => cache(req.path, () => {
  return execAsync(`git show ${req.query.commit}:${getFilename(req.params.course)}`)
})

const commitAndPush = () => execAsync(
  'git commit -am "[update course data]" && git push'
)

const renderHTML = req => cache(req.path, () => {
  return Bluebird.props({
    courses: getCourses({path: '/api/courses'}),
    content: req.path === '/' ? Bluebird.resolve() : fetchData(req)
  }).then(data => {
    const courses = L.set(contentIn(req.path), data.content, data.courses)
    const state   = {courses, filter: '', path: req.path, history: true}
    const html    = renderToString(<App {...state}/>)
    return renderApp(html, state)
  })
})


export default {
  getCourses,
  setCourses,
  getCourse,
  setCourse,
  setMaterial,
  getCourseHistory,
  getCourseAt,
  commitAndPush,
  renderHTML
}

function read (path) {
  return fs.readFileAsync(`${DATA_DIR}/${path}`, 'utf8')
}

function write (path, content) {
  return fs.writeFileAsync(`${DATA_DIR}/${path}`, content, 'utf8')
}

function getFilename (course) {
  return  `${DATA_DIR}/${normalize(course)}.md`
}

function renderApp (appHTML, appState) {
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

function fetchData (req) {
  return fetch(`${req.protocol}://${req.headers.host}/api${req.path}`)
    .then(res => res.json())
}

