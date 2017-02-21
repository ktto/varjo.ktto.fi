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
    '/404': 'notFound',
    '/:title': 'course'
  },

  index () {
    const {filter, courses, admin} = this.props
    return <Index courses={R.filter(courseMatchesFilter(filter), courses)}
                  admin={admin}/>
  },

  course (title) {
    const {courses, admin} = this.props
    return <Course {...R.find(courseMatchesUrl(title), courses)}
                   admin={admin}/>
  },

  notFound (path) {
    return <div>Sivua ei löytynyt</div>
  },

  render () {
    return (
      <section>
        <Header filter={this.props.filter} showFilter={this.state.path === '/'}/>
        <div className="wrapper content">
          {this.renderCurrentRoute()}
        </div>
      </section>
    )
  }
})


