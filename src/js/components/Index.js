import React from 'react'
import R     from 'ramda'

import {urlify} from '../util'

export default ({courses}) => {
  const subjects = R.compose(R.values, R.groupBy(R.prop('subject')))(courses)

  return (
    <ul className="courses">
      {R.pipe(
        R.map(subject => [
          renderTitle(subject[0]),
          R.map(renderCourse, subject)
        ]),
        R.flatten
      )(subjects)}
    </ul>
  )
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
