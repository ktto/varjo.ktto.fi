import Promise from 'bluebird'

export default function http (method, url, data, sendJson = true) {
  return new Promise((resolve, reject) => {
    const req = new XMLHttpRequest()

    req.open(method, url, true)
    if (sendJson) req.setRequestHeader('Content-Type', 'application/json')
    req.responseType = 'json'
    req.onload = () => req.status === 200
      ? resolve(req.response)
      : reject(`${req.status}: ${req.statusText}`)
    req.send(sendJson ? JSON.stringify(data) : data)
  })
}

http.get    = (url)       => http('GET', url, null)
http.post   = (url, data) => http('POST', url, data)
http.upload = (url, data) => http('POST', url, data, false)

