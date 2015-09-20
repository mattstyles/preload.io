
import EventEmitter from 'eventemitter3'
import uuid from 'uuid'

/**
 * Preloader base instance
 * Manages module loaders and emits events
 * @class
 */
export default class Preloader extends EventEmitter {
    /**
     * @constructs
     */
    constructor( opts ) {
        super()

        this.queue = new Set()
        this.loaders = new Map()
    }

    /**
     * Register loader modules (the stuff that actually does the loading)
     */
    register( loader ) {
        this.loaders.set( loader.name, loader )
    }

    /**
     * Adds a url to the queue to be loaded
     * @param url <String || Object> end point to load or options hash
     *   @param url <String> end point
     *   @param silent <Boolean> if true then no events are emitted for this resource
     *   @param loader <String> named loader to use to load the resource
     */
    load( url ) {
        if ( !url ) {
            throw new Error( 'load requires an end point' )
        }

        let id = uuid.v1()

        let opts = {
            url: url,
            silent: false,
            loader: null,
            id: id
        }
        if ( typeof url === 'object' ) {
            if ( !url.url ) {
                throw new Error( 'load requires an end point' )
            }

            opts = Object.assign( opts, url )
        }

        let loader = this.loaders.get( opts.loader || this.getLoader( opts.url ) )

        this.queue.add( function() {
            loader.load( opts.url )
        })

        this.run()

        return id
    }

    /**
     * Flushes the queue and any state, useful for implementing load stages
     * i.e. call load a bunch of times for stage 1, hit up flush onComplete
     * and call load a bunch more times for the next loading stage
     */
    flush() {

    }

    /**
     * Processes the load queue
     */
    run = () => {


        process.nextTick( () => {
            this.queue.forEach( value => {
                console.log( value )
            })

            console.log( this.queue )

            return function() {}
        })
    }

    /**
     * Tries to match filename extension with the loader required to load it
     */
    getLoader( url ) {
        let it = this.loaders.values()
        let loader = null

        while( loader = it.next().value ) {
            if ( loader.match.test( url ) ) {
                return loader.name
            }
        }

        return null
    }
}
