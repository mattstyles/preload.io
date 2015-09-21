
import EventEmitter from 'eventemitter3'
import uuid from 'uuid'

/**
 * Preloader manager instance
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

        this.isRunning = false
    }

    /**
     * Register loader modules (the stuff that actually does the loading)
     */
    register( loader ) {
        this.loaders.set( loader.name, loader )
    }

    /**
     * Routes load requests through the relevant loader instance
     * @param url <String || Object> end point to load or options hash
     *   @param url <String> end point
     *   @param silent <Boolean> if true then no events are emitted for this resource
     *   @param wait <Boolean> wont automatically call run, although other loads might
     *   @param loader <String> named loader to use to load the resource
     *   @param id <String> custom id to use for load event
     */
    load( url ) {
        if ( !url ) {
            throw new Error( 'load requires an end point' )
        }

        if ( !this.loaders.size ) {
            throw new Error( 'no loaders associated with preload.io' )
        }

        let opts = {
            url: url,
            silent: false,
            wait: false,
            loader: null,
            id: null
        }

        if ( typeof url === 'object' ) {
            if ( !url.url ) {
                throw new Error( 'load requires an end point' )
            }

            opts = Object.assign( opts, url )
        }

        let id = opts.id || uuid.v1()
        let loader = this.loaders.get( opts.loader || this.getLoaderName( opts.url ) )

        let loadOpts = Object.assign( opts, {
            id: id,
            loader: loader
        })

        // Adds the loader function to the queue
        this.queue.add( () => {
            loader.load( this, loadOpts )
        })

        if ( !opts.wait ) {
            this.run()
        }

        return id
    }

    /**
     * Flushes the queue and any state, useful for implementing load stages
     * i.e. call load a bunch of times for stage 1, hit up flush onComplete
     * and call load a bunch more times for the next loading stage.
     * Flush will not cancel or clear any initiated load events, just clears
     * the current queue.
     */
    flush() {
        this.queue.clear()
    }

    /**
     * Processes the load queue
     */
    run = () => {
        if ( this.isRunning ) {
            return
        }

        this.isRunning = true

        process.nextTick( () => {
            this.queue.forEach( fn => fn())

            console.log( this.queue )
        })
    }

    /**
     * Tries to match filename extension with the loader required to load it
     */
    getLoaderName( url ) {
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
