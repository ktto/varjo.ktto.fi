import React  from 'react'
import marked from 'marked'

import Loading                  from './Loading'
import http                     from '../http'
import {urlify}                 from '../util'
import {setContent, setEditing} from '../megablob/actions'

export default React.createClass({

  getInitialState () {
    return {
      content: this.props.content
    }
  },

  componentDidMount () {
    if (!this.props.content) {
      const path = urlify(this.props.title)
      http.get(`/api${path}`)
        .then(content => setContent({path, content}))
        .catch(error  => console.log(error))
    }
  },

  componentWillUnmount () {
    setEditing(false)
  },

  componentWillReceiveProps ({content}) {
    this.setState({content})
  },

  toggleEdit () {
    setEditing(!this.props.editing)
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
    const {editing, content} = this.props
    return editing
      ? <textarea onChange={this.edit} defaultValue={content}/>
      : <section dangerouslySetInnerHTML={{__html: marked(content)}}/>
  },

  render () {
    const {title}   = this.props
    const {content} = this.state
    return (
      <article>
        <h3>{title}</h3>
        <button onClick={this.toggleEdit}>Edit</button>
        <button onClick={this.save}>Save</button>
        <Loading loading={content === undefined} content={this.renderContent}/>
      </article>
    )
  }
})

