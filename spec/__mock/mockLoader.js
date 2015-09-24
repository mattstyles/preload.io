
import 'babel/polyfill'

let wait = function( delay ) {
    return {
        then: cb => setTimeout( cb, delay )
    }
}

class MockLoader {
    constructor() {
        this.name = 'mock'
        this.match = /jpg$/
    }

    load = async ( ctx, opts ) => {
        await wait( 100 )
        ctx.emit( 'load', {
            id: opts.id,
            res: {
                foo: 'foo',
                bar: 'bar'
            }
        })
    }

}

export default MockLoader
