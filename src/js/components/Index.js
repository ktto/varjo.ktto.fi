import React from 'react'
import R     from 'ramda'

import {urlify} from '../util'

export default ({courses}) => (
  <section className="courses wrapper">
    <ul>
      {R.map(renderCourse, courses)}
    </ul>
  </section>
)

function renderCourse (course) {
  return (
    <li key={course.title} className="courses__course">
      <h3 className="courses__course-title">
        <a href={urlify(course.title)}>{course.title}</a>
      </h3>
      <subtitle className="courses__course-shortTitles">
        {course.shortTitles.join(', ')}
      </subtitle>
    </li>
  )
}
