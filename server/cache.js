import Promise from 'bluebird'

const routes = {}

export function cache (isLoggedIn, route, getData) {
  return Promise.resolve(
    isLoggedIn
      ? getData()
      : routes[route]
        ? routes[route]
        : getData().then(data => routes[route] = data)
  )
}

export function resetCache (route, getData = Promise.resolve) {
  [route, route.substr(4), '/'].forEach(route => routes[route] = null)
  return getData().then(data => routes[route] = data)
}
