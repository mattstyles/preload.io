
import tape from 'tape'

import Preloader from '../lib'
import { EVENTS } from '../lib'

import MockLoader from './__mock/mockLoader'

tape( 'Registering a loader should add it to the loaders map', t => {
    t.plan( 2 )

    let preloader = new Preloader()
    preloader.register( new MockLoader() )

    t.equal( preloader.loaders.size, 1 )
    t.ok( preloader.loaders.has( 'mock' ), 'mock loader registered' )
})
