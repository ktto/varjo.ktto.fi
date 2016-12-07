import R      from 'ramda'
import * as L from 'partial.lenses'


export const contentIn  = createLens('content')

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
  return kebabCase(string.normalize('NFKD').replace(/[\u0300-\u036F]/g, ''))
}

function kebabCase (string) {
  return string.toLowerCase().replace(/\s+/g, '-')
}

function createLens (prop) {
  return path => L.compose(
    L.find(course => urlify(course.title) === path),
    L.prop(prop),
    L.valueOr('')
  )
}
