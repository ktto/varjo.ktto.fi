const noop = function () {}

export default function http (method, url, data, cb=noop) {
  const req = new XMLHttpRequest()

  req.open(method, url, true)
  req.setRequestHeader('Content-Type', 'application/json')
  req.responseType = 'json'
  req.onload = () => {
    if (req.status === 200) {
      cb(null, req.response)
    } else {
      cb(`${req.status}: ${req.statusText}`, null)
    }
  }
  req.send(JSON.stringify(data))
}

http.get  = (url, cb) => http('GET', url, null, cb)
http.post = (url, data, cb) => http('POST', url, data, cb)

