import React from 'react'
import R     from 'ramda'

import {urlify} from '../util'

export default ({courses}) => (
  <ul className="courses">
    {R.pipe(
      R.compose(R.values, R.groupBy(R.prop('subject'))),
      R.map(renderSubject),
      R.flatten
    )(courses)}
  </ul>
)

function renderSubject (subject) {
  return [renderTitle(subject[0]), R.map(renderCourse, subject)]
}

function renderTitle (course) {
  return (
    <li key={course.subject} className="courses__subject">
      <h2>{course.subject}</h2>
    </li>
  )
}

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
