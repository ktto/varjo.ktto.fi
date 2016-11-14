import React         from 'react'
import R             from 'ramda'
import {RouterMixin} from 'react-mini-router'

import {courseMatchesFilter, courseMatchesUrl} from '../util'

import Header from './Header'
import Index  from './Index'
import Course from './Course'

export default React.createClass({
  mixins: [RouterMixin],
  routes: {
    '/': 'index',
    '/:title': 'course'
  },

  index () {
    const {filter, courses} = this.props
    return <Index courses={R.filter(courseMatchesFilter(filter), courses)}/>
  },

  course (title) {
    const {editing} = this.props
    return <Course {...R.find(courseMatchesUrl(title), this.props.courses)}
                   editing={editing}/>
  },

  render () {
    const {title} = this.props

    return (
      <section>
        <Header title={title}/>
        <div className="wrapper content">
          {this.renderCurrentRoute()}
        </div>
      </section>
    )
  }
})


