import R      from 'ramda'
import * as L from 'partial.lenses'


export function courseMatching (path) {
  return L.find(course => urlify(course.title) === path)
}

export function contentIn (path) {
  return L.compose(
    courseMatching(path),
    L.prop('content'),
    L.valueOr('')
  )
}

export function materialIn (path, {title}) {
  return L.compose(
    courseMatching(path),
    L.prop('material'),
    L.required([]),
    L.find(R.whereEq({title}))
  )
}

export function courseMatchesFilter (filter) {
  const needle  = filter.toLowerCase()
  const matches = haystack => haystack.toLowerCase().indexOf(needle) > -1
  return course => (
    matches(course.title)
    || matches(course.subject)
    || R.any(matches, course.shortTitles)
  )
}

export function courseMatchesUrl (url) {
  return course => normalize(course.title) === url
}

export function urlify (string) {
  return `/${normalize(string)}`
}

export function normalize (string) {
  let   str  = kebabCase(string)
  const from = 'ãàáäâẽèéëêìíïîõòóöôùúüûñç·/_,:;'
  const to   = 'aaaaaeeeeeiiiiooooouuuunc------'
  // ugly mutation
  R.addIndex(R.forEach)(
    (c, i) => str = str.replace(new RegExp(c, 'g'), to.charAt(i)),
    from
  )
  return str
}

function kebabCase (string) {
  return string.toLowerCase().trim().replace(/\s+/g, '-')
}
