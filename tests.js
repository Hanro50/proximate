const http = require('http')
const { httpProxy } = require('.')

http.createServer().listen(8080).on('connection', (client) => {
    console.log("Proxying ",client.address())
    httpProxy(client, "eu.httpbin.org", 80)
})
console.log("[test]: Started server. Ready for testing!")