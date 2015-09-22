
import tape from 'tape'

import Preloader from '../lib'
import { EVENTS } from '../lib'


tape( 'Queue and response set should be empty on instantiation', t => {
    t.plan( 2 )

    let preloader = new Preloader()

    t.equal( preloader.queue.size, 0 )
    t.equal( preloader.responses.size, 0 )
})
