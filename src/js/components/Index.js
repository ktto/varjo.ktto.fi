import React from 'react'
import R     from 'ramda'

import http                         from '../http'
import {urlify}                     from '../util'
import {receiveCourses, setCourses} from '../megablob/actions'

const cleanState = {
  editing: false,
  title: '',
  shortTitles: '',
  subject: ''
}

export default React.createClass({

  getInitialState () {
    return cleanState
  },

  toggleEdit () {
    this.setState({editing: !this.state.editing})
  },

  addCourse () {
    const {title, shortTitles, subject} = this.state
    const course = {
      title: title.trim(),
      shortTitles: R.map(s => s.trim(), shortTitles.split(',')),
      subject,
      material: []
    }

    if (course.title && course.subject) {
      this.setState(cleanState, () => {
        http.post('/api/courses', {course})
          .then(receiveCourses)
      })
    }
  },

  del (name) {
    return e => {
      http.del(`/api${urlify(name)}`)
        .then(setCourses)
    }
  },

  renderAddCourse () {
    return (
      <div className="add-course__fields">
        <input placeholder="Kurssin nimi"
               onChange={e => this.setState({title: e.target.value})}/>
        <input placeholder="Kurssin lyhenteet pilkulla erotettuna"
               onChange={e => this.setState({shortTitles: e.target.value})}/>
        <select onChange={e => this.setState({subject: e.target.value})}>
          <option selected={true} disabled={true}>Valitse aine</option>
          {R.pipe(
            R.map(R.prop('subject')),
            R.uniq,
            R.map(s => <option key={s}>{s}</option>)
          )(this.props.courses)}
        </select>
      </div>
    )
  },


  renderSubject (subject) {
    return [this.renderTitle(subject[0]), R.map(this.renderCourse, subject)]
  },

  renderTitle (course) {
    return (
      <li key={course.subject} className="courses__subject">
        <h2 className="courses__subject-title">{course.subject}</h2>
      </li>
    )
  },

  renderCourse (course) {
    const {admin} = this.props

    return (
      <li key={course.title} className="courses__course">
        <span className="courses__course-title">
          <a href={urlify(course.title)}>{course.title}</a>
        </span>
        <subtitle className="courses__course-shortTitles">
          {course.shortTitles.join(', ')}
        </subtitle>
        {admin && (
          <span className="delete" onClick={this.del(course.title)}>
            poista
          </span>
        )}
      </li>
    )
  },

  render () {
    const {courses, admin} = this.props
    const {editing}       = this.state

    return (
      <secton>
        <ul className="courses">
          {courses.length ? (
            R.pipe(
              R.compose(R.values, R.groupBy(R.prop('subject'))),
              R.sortBy(subjectWeight),
              R.map(this.renderSubject),
              R.flatten
            )(courses)
          ) : <li>Nyt ei kyllä löytynyt mitään :(</li>
          }
        </ul>
        {admin && (
          <div className="add-course">
            {editing && this.renderAddCourse()}
            <button onClick={this.toggleEdit}>
              {editing ? 'Peruuta' : 'Lisää kurssi'}
            </button>
            {editing && <button onClick={this.addCourse}>Tallenna</button>}
          </div>
        )}
      </secton>
    )
  }
})

function subjectWeight (subject) {
  switch (R.head(subject).subject) {
    case 'taloustiede': return 0
    case 'matematiikka': return 1
    case 'tilastotiede': return 2
    default: return 3
  }
}
