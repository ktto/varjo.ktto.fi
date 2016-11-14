import React  from 'react'

import http         from '../http'
import {urlify}     from '../util'
import {setContent} from '../megablob/actions'

export default React.createClass({

  componentDidMount () {
    const {content, title} = this.props

    if (!content) {
      const path = urlify(title)
      http.get(
        `/api/${path}`,
        (err, content) => setContent({path, content})
      )
    }
  },


  render () {
    const {title, content} = this.props
    return (
      <article>
        <h3>{title}</h3>
        <p>{content}</p>
      </article>
    )
  }
})
