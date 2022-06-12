import { createConnection, Socket } from "net";
import { Duplex } from "stream";
import { TLSSocket } from "tls";
/**
 * A simple proxy function. Simply forwards the request to the destination set by the prxy and port parameters
 * @param socket The connection that should be forwarded
 * @param prxy The hostname of the server it should be forwarded to 
 * @param port The port on which the connection should be forwarded
 */
export function httpProxy(socket: Duplex | TLSSocket, prxy: string, port: number) {
    return new base().proxy(socket, () => { return { prxy, port } })
}

export class base {
    /**The underlying proxy function. Returns a function that can be used to kill the connection 
     * @param socket The connection that should be forwarded
     * @param handler The function for handling resolving the hostname and port that should be proxied to. 
     * Given here as a function to allow for dynamic allocation
    */
    proxy(socket: Duplex | TLSSocket, handler: (host: string) => { prxy: string, port: number }): Promise<() => void> {
        return new Promise(res => {
            socket.once('data', (raw) => {
                let data = raw.toString() as string;
                if (!data.split("\n")[0].includes('HTTP')) {
                    console.log('Data of rejected header->', data)
                    socket.end();
                    socket.destroy();
                    res(() => { })
                    return;
                }

                const hostname = data
                    .split('Host: ')[1]?.split('\r\n')[0].split(":")[0];
                data = `${this.modHeader(data.trim())}\n\n`;
                const result = handler(hostname)

                let proxy = this.upgrade(createConnection({ host: result.prxy, port: result.port }, () => {
                    function end() {
                        proxy.end();
                        socket.end();    /**Used to upgrade connections. Mainly for HTTPS to HTTPS communication*/
                        res(end)
                    }
                    if (socket.destroyed) { console.error("Client already dead!"); end() };
                    socket.on('end', () => end());
                    proxy.on('end', () => end());

                    socket.on('error', (err) => {
                        console.log('CLIENT TO PROXY ERROR');
                        console.log(err);
                        end();

                    });
                    proxy.on('error', (err) => {
                        console.log('PROXY TO SERVER ERROR');
                        console.log(err);
                        end();
                    });
                    proxy.write(data);
                    proxy.pipe(socket);
                    socket.pipe(proxy);

                }));
            });
        });
    }
    /**Used to upgrade connections. Mainly for HTTPS to HTTPS communication
     * @param socket The outgoing socket that is used to forward messages from the client
    */
    protected upgrade(socket: Socket): Socket | TLSSocket {
        return socket;
    }
    /**Modifies the underlying header of a sent request
     * @param header The raw header. It is given in this format to keep things speedy. 
    */
    protected modHeader(header: string) {
        return header;
    }
}