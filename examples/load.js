import 'babel-polyfill'

import Preloader from '../lib'
const EVENTS = Preloader.EVENTS

let wait = function( delay ) {
  return {
    then: cb => setTimeout(cb, delay)
  }
}

let fakeLoader = {
  name: 'fake',
  match: /jpg$/,
  load: async( ctx, opts ) => {
    console.log( 'fakeLoader', ctx, opts )
    await wait( 500 + Math.random() * 500 )
    ctx.emit( 'load', {
      id: opts.id,
      res: {
        foo: 'foo',
        bar: 'bar'
      }
    })

    opts.foo = 'foobarbaz'
  }
}

let preloader = new Preloader()
preloader.register( fakeLoader )

console.log( ' -- Specify loader' )
preloader.load({
  resource: 'hello.jpg',
  loader: 'fake'
})


console.log( ' -- Match on resource extension via object param' )
preloader.load({
  resource: 'hello.jpg'
})


console.log( ' -- Match on resource extension' )
preloader.load( 'example.jpg' )


preloader.on( EVENTS.LOAD, event => {
  console.log( 'load', event )
})

preloader.on( EVENTS.COMPLETE, res => {
  console.log( '<-- Load events complete' )
  console.log( res )
})
