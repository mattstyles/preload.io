
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

tape( 'Load can be called with an object', t => {
    t.plan( 1 )

    let preloader = new Preloader()
    preloader.register( new MockLoader() )
    preloader.load({
        url: 'mock.jpg'
    })

    preloader.on( EVENTS.LOAD, event => {
        t.pass( 'Load event fired' )
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

tape( 'Load events can be gathered from the resultant response map on load complete', t => {
    t.plan( 1 )

    let preloader = new Preloader()
    preloader.register( new MockLoader() )
    let id = preloader.load( 'mock.jpg' )

    preloader.on( EVENTS.COMPLETE, res => {
        t.ok( res.get( id ), 'Found id in response map' )
    })
})

tape( 'Waiting and manually calling run can be used async/await', async t => {
    t.plan( 3 )

    let preloader = new Preloader()
    preloader.register( new MockLoader() )
    let id = preloader.load({
        url: 'mock.jpg',
        wait: true
    })

    t.notEqual( preloader.isRunning, true )

    let responses = await preloader.run()

    t.pass( 'Run returned a promise' )
    t.equal( responses.size, 1 )
})

tape( 'Multiple load events should all be triggered on the next tick to allow the queue to build', t => {
    t.plan( 3 )

    // Tracks running—on start event gets switched to true
    let isRunning = false

    let preloader = new Preloader()
    preloader.register( new MockLoader() )

    preloader.on( EVENTS.START, event => {
        isRunning = true
    })

    let files = [ 'mock', 'fake', 'dummy', 'foo', 'bar' ]
    files
        .map( name => name + '.jpg' )
        .forEach( preloader.load )

    t.notOk( isRunning, 'current tick: not yet runnning' )

    setTimeout( () => {
        t.ok( isRunning, 'next tick: is now running' )
    }, 1 )

    preloader.on( EVENTS.COMPLETE, responses => {
        t.equal( responses.size, 5 )
    })
})
