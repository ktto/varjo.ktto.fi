/* global ga*/
import React  from 'react'
import R      from 'ramda'
import marked from 'marked'

import Loading                               from './Loading'
import Upload                                from './Upload'
import http                                  from '../http'
import {urlify}                              from '../util'
import {setContent, addMaterial, setCourses} from '../megablob/actions'

export default React.createClass({

  getInitialState () {
    return {
      editing: false,
      material: this.props.material,
      content: this.props.content,
      loading: this.props.content === undefined,
      history: null,
      progress: null
    }
  },

  componentDidMount () {
    if (this.props.content === undefined) {
      const path = urlify(this.props.title)
      http.get(`/api${path}`)
        .then(data => {
          // Fucking ridicilous, IE
          const content = typeof data === 'string'
            ? JSON.parse(data).content
            : data.content
          this.setState(
            {loading: false},
            () => setContent({path, content})
          )
        }).catch(error => console.log(error))
    }
    ga('send', 'pageview')
  },

  componentWillReceiveProps ({content}) {
    this.setState({content})
  },

  toggleEdit () {
    this.setState({editing: !this.state.editing})
  },

  edit (e) {
    this.setState({content: e.target.value})
  },

  progressBar (e) {
    const loaded = e.loaded / e.total
    this.setState({progress: loaded === 1 ? null : (loaded * 100).toFixed(2)})
  },

  getHistory () {
    http.get(`/api${urlify(this.props.title)}/history`)
      .then(history => this.setState({history}))
  },

  getCommit (commit) {
    return () => {
      http.get(`/api${urlify(this.props.title)}/${commit}`)
        .then(content => this.setState(content))
    }
  },

  del (filename) {
    return e => {
      http.del(`/upload/${filename}`)
        .then(setCourses)
    }
  },

  save () {
    const path = urlify(this.props.title)
    http.post(`/api${path}`, {content: this.state.content})
      .then(content => this.setState(
        {editing: false},
        () => setContent({path, content})
      )).catch(error => console.log(error))
  },

  saveFile (data) {
    const path = urlify(this.props.title)
    http.upload(`/upload${path}`, data, this.progressBar)
      .then(material => addMaterial({path, material}))
      .catch(error => console.log(error))
  },

  renderContent () {
    const {editing, content} = this.state
    return editing
      ? <textarea onChange={this.edit} value={content}/>
      : content
        ? <section dangerouslySetInnerHTML={{__html: marked(content)}}/>
        : <section>Auta lisäämällä tänne kurssivinkkejä!</section>
  },

  renderMaterial () {
    const {material, admin}   = this.props
    const {editing, progress} = this.state

    return (
      <div>
        {material && (
          <ul className="materials">
            {material.map(m => (
              <li key={m.filename} className="materials__material">
                <a href={`/files/${m.filename}`}>{m.title}</a>
                {admin && (
                  <span className="delete" onClick={this.del(m.filename)}>
                    poista
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
        {editing && <Upload upload={this.saveFile}/>}
        {progress && <div>{progress} %</div>}
      </div>
    )
  },

  renderHistory () {
    const {history} = this.state
    return (
      <section>
        <button onClick={this.getHistory}>Muokkaushistoria</button>
        {history && (
          <ul className="course-history">
            {R.map(({commit, date}) => (
              <li key={commit}
                  className="course-history__item"
                  onClick={this.getCommit(commit)}>
                {parseDate(date)}
              </li>
            ), history)
            }
          </ul>
        )}
      </section>
    )
  },

  render () {
    const {title}                     = this.props
    const {content, editing, loading} = this.state

    return (
      <article>
        <h2>{title}</h2>
        {this.renderMaterial()}
        {editing && helpText()}
        <Loading loading={loading} content={this.renderContent}/>
        {editing && this.renderHistory()}
        <button onClick={this.toggleEdit}>{editing ? 'Peruuta' : 'Muokkaa'}</button>
        {editing && <button onClick={this.save}>Tallenna</button>}
      </article>
    )
  }
})

function helpText () {
  return (
    <p>
      Kirjoita
      {' '}
      <a href="https://daringfireball.net/projects/markdown/syntax">
        markdown
      </a>
      ia.
    </p>
  )
}

function parseDate (dateString) {
  const [date, time] = new Date(dateString).toISOString().split('T')
  return `${date} ${R.head(time.split('.'))}`
}
