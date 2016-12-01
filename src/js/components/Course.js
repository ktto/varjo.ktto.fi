import React  from 'react'
import marked from 'marked'

import Loading      from './Loading'
import http         from '../http'
import {urlify}     from '../util'
import {setContent} from '../megablob/actions'

export default React.createClass({

  getInitialState () {
    return {
      editing: false,
      content: this.props.content
    }
  },

  componentDidMount () {
    if (this.props.content === undefined) {
      const path = urlify(this.props.title)
      http.get(`/api${path}`)
        .then(content => setContent({path, content}))
        .catch(error  => console.log(error))
    }
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
      .then(content => setContent({path, content}))
      .catch(error => console.log(error))
  },

  renderContent () {
    const {content} = this.props
    const {editing} = this.state
    return editing
      ? <textarea onChange={this.edit} defaultValue={content}/>
      : <section dangerouslySetInnerHTML={{__html: marked(content)}}/>
  },

  render () {
    const {title}            = this.props
    const {content, editing} = this.state
    return (
      <article>
        <h3>{title}</h3>
        <button onClick={this.toggleEdit}>{editing ? 'Peruuta' : 'Muokkaa'}</button>
        <button onClick={this.save}>Tallenna</button>
        <Loading loading={content === undefined} content={this.renderContent}/>
      </article>
    )
  }
})

