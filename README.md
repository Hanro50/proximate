# proximate
<div><a href="https://github.com/Hanro50/proximate/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/proximate" alt="MIT license"/></a>
<a href="https://www.npmjs.com/package/proximate"><img src="https://img.shields.io/npm/v/proximate" alt="Version Number"/></a>
<a href="https://github.com/Hanro50/proximate/"><img src="https://img.shields.io/github/stars/hanro50/proximate" alt="Github Stars"/></a></div>
 A simple object based low level proxy lib for nodejs

# Support
<div>
<a href="https://discord.gg/3hM8H7nQMA">
<img src="https://img.shields.io/discord/861839919655944213?logo=discord"
alt="chat on Discord"></a>
</div>
At the moment you can get support via Discord (link above).

# Basic usage 
## Headings 
#1 Port of server<br>
#2 The domain or IP we should forward this request to <br>
#3 The network port this request should be forwarded on

```js
const { httpProxy } = require('.')
const http = require('http')

http.createServer().listen(/*<#1>*/ 8080 ).on('connection', (client) => {
    console.log("Proxying ",client.address())
    httpProxy(client,/*<#2>*/ "eu.httpbin.org" ,/*<#3>*/ 80  )
})
```

# Advance usage 
You are going to want to extend the `base` class. 
```ts
export declare class base {
    /**The underlying proxy function. Returns a function that can be used to kill the connection
     * @param socket The connection that should be forwarded
     * @param handler The function for handling resolving the hostname and port that should be proxied to.
     * Given here as a function to allow for dynamic allocation
    */
    proxy(socket: Duplex | TLSSocket, handler: (host: string) => {
        prxy: string;
        port: number;
    }): Promise<() => void>;
    /**Used to upgrade connections. Mainly for HTTPS to HTTPS communication
     * @param socket The outgoing socket that is used to forward messages from the client
    */
    protected upgrade(socket: Socket): Socket | TLSSocket;
    /**Modifies the underlying header of a sent request
     * @param header The raw header. It is given in this format to keep things speedy.
     * Do note that removing the white spaces around the header is not recommended in the slightest degree.
    */
    protected modHeader(header: string): string;
}
```
Furthermore, after extending the base class you are going to want to override the upgrade and modHeader functions.

## Function: `modHeader(header: string): string` 
The modHeader function allows you to modify the raw header of a proxied request. Do note that adding whitespaces at the end of a request can cause it to fail. 

## Function: `upgrade(socket: Socket): Socket | TLSSocket` 
This function can be overwritten if you are trying to do HTTPS to HTTPS communication/proxying or need to change something about the proxied port. 

# WIP
The lib is still seeing development. Hope onto the discord to suggest changes. 