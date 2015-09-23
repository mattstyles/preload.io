
import tape from 'tape'

import Preloader from '../lib'
import { EVENTS } from '../lib'

import MockLoader from './__mock/mockLoader'

tape( 'Queue and response set should be empty on instantiation', t => {
    t.plan( 2 )

    let preloader = new Preloader()

    t.equal( preloader.queue.size, 0 )
    t.equal( preloader.responses.size, 0 )
})

tape( 'Load event should trigger an onLoad event with some data', t => {
    t.plan( 2 )

    let preloader = new Preloader()
    preloader.register( new MockLoader() )
    preloader.load( 'mock.jpg' )

    preloader.on( EVENTS.LOAD, event => {
        t.pass( 'Load event fired' )
        t.notEqual( typeof event.res, 'undefined' )
    })
})

tape( 'Load event should contain an id returned by the load function', t => {
    t.plan( 1 )

    let preloader = new Preloader()
    preloader.register( new MockLoader() )
    let id = preloader.load( 'mock.jpg' )

    preloader.on( EVENTS.LOAD, event => {
        t.equal( event.id, id )
    })
})
