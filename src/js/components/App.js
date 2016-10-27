import React         from 'react'
import {RouterMixin} from 'react-mini-router'

import Index  from './Index'
import Course from './Course'

export default React.createClass({
  mixins: [RouterMixin],
  routes: {
    '/': 'index',
    '/:course': 'course'
  },

  index () {
    return <Index/>
  },

  course (course) {
    return <Course course={course}/>
  },

  render () {
    return (
      <section>
        {this.renderCurrentRoute()}
      </section>
    )
  }
})
