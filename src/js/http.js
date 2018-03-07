import Promise from 'bluebird'

export default function http (method, url, data, sendJson = true, uploadHandler) {
  return new Promise((resolve, reject) => {
    const req = new XMLHttpRequest()

    req.open(method, url, true)
    if (sendJson) req.setRequestHeader('Content-Type', 'application/json')
    if (uploadHandler) req.upload.addEventListener('progress', uploadHandler)
    req.responseType = 'json'
    req.onload = () => req.status === 200
      ? resolve(req.response)
      : reject(new Error(`${req.status}: ${req.statusText} --- ${req.response.error}`))
    req.send(sendJson ? JSON.stringify(data) : data)
  })
}

http.get    = (url)                => http('GET', url, null)
http.post   = (url, data)          => http('POST', url, data)
http.del    = (url, data)          => http('DELETE', url, null, false)
http.upload = (url, data, handler) => http('POST', url, data, false, handler)

