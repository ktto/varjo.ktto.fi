import Promise from 'bluebird'

const routes = {}

export function cache (route, getData) {
  return Promise.resolve(
    routes[route]
      ? routes[route]
      : getData().then(data => routes[route] = data)
  )
}

export function resetCache (route, getData) {
  [route, route.substr(4), '/'].forEach(route => routes[route] = null)
  return getData().then(data => routes[route] = data)
}
