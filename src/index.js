
import EventEmitter from 'eventemitter3'

export default class Preloader extends EventEmitter {
    constructor( opts ) {

    }

    /**
     * Adds a url to the queue to be loaded
     */
    load( url ) {

    }

    /**
     * Flushes the queue, useful for implementing load stages
     * i.e. call load a bunch of times for stage 1, hit up flush onComplete
     * and call load a bunch more times for the next loading stage
     */
    flush() {

    }
}
