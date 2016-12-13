/* global ga*/
import React  from 'react'
import marked from 'marked'

import Loading                   from './Loading'
import Upload                    from './Upload'
import http                      from '../http'
import {urlify}                  from '../util'
import {setContent, setMaterial} from '../megablob/actions'

export default React.createClass({

  getInitialState () {
    return {
      editing: false,
      material: this.props.material,
      content: this.props.content,
      loading: !this.props.content || !this.props.content.length
    }
  },

  componentDidMount () {
    if (this.props.content === undefined) {
      const path = urlify(this.props.title)
      http.get(`/api${path}`)
        .then(({content}) => this.setState(
          {loading: false},
          () => setContent({path, content})
        )).catch(error => console.log(error))
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
    http.upload(`/upload${path}`, data)
      .then(material => setMaterial({path, material}))
      .catch(error => console.log(error))
  },

  renderContent () {
    const {editing, content} = this.state
    return editing
      ? <textarea onChange={this.edit} defaultValue={content}/>
      : content
        ? <section dangerouslySetInnerHTML={{__html: marked(content)}}/>
        : <section>Auta lisäämällä tänne kurssivinkkejä!</section>
  },

  renderMaterial () {
    const {material} = this.props
    const {editing}  = this.state

    return (
      <div>
        {material && (
          <ul className="materials">
            {material.map(m => (
              <li key={m.filename} className="materials__material">
                <a href={`/files/${m.filename}`}>{m.title}</a>
              </li>
            ))}
          </ul>
        )}
        {editing && <Upload upload={this.saveFile}/>}
      </div>
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
