import Promise from 'bluebird'

const routes = {}

export function cache (route, getData) {
  return Promise.resolve(
    routes[route]
      ? routes[route]
      : getData().then(data => routes[route] = data)
  )
}

export function bustCache (route, getData) {
  return getData().then(data => routes[route] = data)
}
