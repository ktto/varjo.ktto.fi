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

const getCourses = req => cache(req.user, req.path, () => {
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
  ]).then(() => {
    commitAndPush(`Add ${course}`)
    return req.body.course
  })
})

const getCourse = req => cache(req.user, req.path, () => {
  return read(`${req.params.course}.md`)
})

const setCourse = req => resetCache(req.path, () => {
  const name    = req.params.course
  const content = req.body.content
  return write(`${name}.md`, content)
    .then(() => {
      commitAndPush(`Edit ${name} [len: ${content.length}]`)
      return req.body.content
    })
})

const deleteCourse = req => resetCache(req.path, () => {
  const name = req.params.course
  return read(`${name}.json`)
    .then(JSON.parse)
    .then(({material}) => {
      const files = material
        .map(({filename}) => `${DATA_DIR}/files/${filename}`)
        .concat(['json', 'md'].map(ext => `${DATA_DIR}/${name}.${ext}`))
        .join(' ')
      return execAsync(`rm ${files}`)
    }).then(() => {
      commitAndPush(`Delete ${name}`)
      resetCache('/api/courses')
      resetCache(`/api/${name}`)
      return getCourses({path: '/api/courses'})
    })
})

const setMaterial = req => {
  const name = req.params.course
  const file = `${name}.json`
  return read(file)
    .then(JSON.parse)
    .then(json => {
      const {material} = json
      const {filename} = req.file
      const {title}    = req.body
      const uploaded   = {title, filename}
      const data       = R.merge(json, {material: material.concat(uploaded)})
      return write(file, JSON.stringify(data, null, 2))
        .then(() => {
          commitAndPush(`Add ${filename}`)
          resetCache('/api/courses')
          resetCache(`/api/${name}`)
          return uploaded
        })
    })
}

const deleteMaterial = req => resetCache(req.path, () => {
  const {filename} = req.params
  const course     = `${R.init(filename.split('-')).join('-')}.json`
  return read(course)
    .then(JSON.parse)
    .then(json => {
      const material = json.material.filter(m => m.filename !== filename)
      const data     = R.merge(json, {material})
      return write(course, JSON.stringify(data, null, 2))
        .then(() => execAsync(`rm ${DATA_DIR}/files/${filename}`))
        .then(() => {
          commitAndPush(`Delete ${filename}`)
          resetCache('/api/courses')
          resetCache(`/api/${course}`)
          return getCourses({path: '/api/courses'})
        })
    })
})

const getCourseHistory = req => cache(req.user, req.path, () => {
  return execAsync(`git log -- data/${req.params.course}.md`)
    .then(R.pipe(
      R.split('\n'),
      R.filter(line => line.startsWith('commit') || line.startsWith('Date')),
      R.map(R.compose(R.join(' '), R.tail, R.split(/\s+/))),
      R.splitEvery(2),
      R.map(([commit, date]) => ({commit, date}))
    ))
})

const getCourseAt = req => cache(req.user, req.path, () => {
  const {course, commit} = req.params
  return execAsync(`git show ${commit}:data/${course}.md`)
})

const commitAndPush = (msg) => process.env.NODE_ENV === 'production'
  ? execAsync(`git commit -am "${msg || '[update course data]'}" && git push backup master`)
      .catch(err => console.error(err))
  : console.log('Committing only in production')

const renderHTML = req => cache(req.user, req.path, () => {
  return Bluebird.props({
    courses: getCourses({path: '/api/courses'}),
    content: req.path === '/' ? Bluebird.resolve() : fetchData(req)
  }).then(data => {
    const courses = L.set(contentIn(req.path), data.content, data.courses)
    const state   = {courses, filter: '', admin: !!req.user, path: req.path, history: true}
    const html    = renderToString(<App {...state}/>)
    return renderApp(html, state)
  })
})


export default {
  getCourses,
  setCourses,
  getCourse,
  setCourse,
  deleteCourse,
  setMaterial,
  deleteMaterial,
  getCourseHistory,
  getCourseAt,
  renderHTML
}

function read (path) {
  return fs.readFileAsync(`${DATA_DIR}/${path}`, 'utf8')
}

function write (path, content) {
  return fs.writeFileAsync(`${DATA_DIR}/${path}`, content, 'utf8')
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
