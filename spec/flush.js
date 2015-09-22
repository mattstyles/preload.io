
import tape from 'tape'

import Preloader from '../lib'
import { EVENTS } from '../lib'

import MockLoader from './__mock/mockLoader'

tape( 'Flushing should empty the queues', t => {
    t.plan( 3 )

    let preloader = new Preloader()
    preloader.register( new MockLoader() )
    preloader.load({
        url: 'mock.jpg',
        loader: 'mock',
        wait: true
    })

    t.equal( preloader.queue.size, 1 )

    preloader.flush()

    t.equal( preloader.queue.size, 0 )
    t.equal( preloader.responses.size, 0 )
})

tape( 'Flushing onComplete should empty the response queue', t => {
    t.plan( 2 )

    let preloader = new Preloader()
    preloader.register( new MockLoader() )
    preloader.load({
        url: 'mock.jpg',
        loader: 'mock'
    })

    t.equal( preloader.queue.size, 1 )
    t.equal( preloader.responses.size, 0 )

    preloader.on( EVENTS.COMPLETE, responses => {
        t.equal( responses.size )

        preloader.flush()

        t.equal( preloader.queue.size, 0 )
        t.equal( preloader.responses.size, 0 )
    })

})
