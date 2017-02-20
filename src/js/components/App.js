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
    const {filter, courses, admin} = this.props
    return <Index courses={R.filter(courseMatchesFilter(filter), courses)}
                  admin={admin}/>
  },

  course (title) {
    return <Course {...R.find(courseMatchesUrl(title), this.props.courses)}/>
  },

  render () {
    return (
      <section>
        <Header showFilter={this.state.path === '/'}/>
        <div className="wrapper content">
          {this.renderCurrentRoute()}
        </div>
      </section>
    )
  }
})


