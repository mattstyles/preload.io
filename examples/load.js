
import Preloader from '../lib'
import { EVENTS } from '../lib'
import EventEmitter from 'eventemitter3'

let wait = async function( delay ) {
    return {
        then: cb => setTimeout( cb, delay )
    }
}

let fakeLoader = {
    name: 'fake',
    match: /jpg$/,
    load: async ( ctx, opts ) => {
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
    url: 'hello.jpg',
    loader: 'fake'
})


console.log( ' -- Match on url extension' )
preloader.load({
    url: 'hello.jpg'
})


console.log( ' -- Match on url extension' )
preloader.load( 'example.jpg' )


preloader.on( EVENTS.LOAD, event => {
    console.log( 'load', event )
})

preloader.on( EVENTS.COMPLETE, res => {
    console.log( '<-- Load events complete' )
    console.log( res )
})
