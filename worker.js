export default {                                                  // export default in Module Workers syntax
  fetch: (req, env) => env.database.get(                          // on fetch, get the database Durable Object stub
    env.database.idFromName(                                      // with the Durable Object instance id
      req.headers.get('CF-Connecting-IP')                         // coming from the client's IP address
    )
  ).fetch(req)                                                    // proxy the request to the Durable Object instance
}
  
export class Database {                                           // export the Durable Object Class
  constructor(state, env) {                                       // get state and environment from the args on the constructor
    this.state = state                                            // set instance state 
    this.env = env                                                // set instance environment 
    this.state.proxy.fetch = (...args) => fetch(args)             // add a fetch proxy so we can also make outbound calls
  }

  async fetch(req) {                                              // on fetch inside the Durable Object instance
    const {origin, pathname, query, hash} = new URL(req.url)      // destructure the URL
    const [object, method, ...args] = pathname.split('/')         // destructure the method and args from the pathname
    const data = await this.state[object][method](args)           // dynamically invoke the method with the args
    return new Response(                                          // create a new Response
      JSON.stringify(data, null, 2)                               // stringify the data to JSON
      , { headers: { 'content-type': 'application/json' })        // with the appropriate content type
  }
}
