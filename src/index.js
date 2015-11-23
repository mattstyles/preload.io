import EventEmitter from 'eventemitter3'
import uuid from 'uuid'

/**
 * Events hash
 */
export const EVENTS = {
  LOAD: 'load',
  LOAD_ERROR: 'load:error',

  START: 'preload:start',
  COMPLETE: 'preload:complete',
  FLUSH: 'preload:flush'
}


/**
 * Preloader manager instance
 * Manages module loaders and emits events
 * @class
 */
export default class Preloader extends EventEmitter {
  static EVENTS = {
    LOAD: 'load',
    LOAD_ERROR: 'load:error',

    START: 'preload:start',
    COMPLETE: 'preload:complete',
    FLUSH: 'preload:flush'
  }

  /**
   * @constructs
   */
  constructor( opts ) {
    super()

    this.queue = new Set()
    this.loaders = new Map()
    this.responses = new Map()

    this.isRunning = false
  }

  /**
   * Register loader modules ( the stuff that actually does the loading)
   */
  register( loader ) {
    this.loaders.set( loader.name, loader )
  }

  /**
   * Routes load requests through the relevant loader instance
   * @param resource <String || Object> end point to load or options hash
   *   @param resource <String> end point
   *   @param silent <Boolean> if true then no events are emitted for this resource
   *   @param wait <Boolean> wont automatically call run, although other loads might
   *   @param loader <String> named loader to use to load the resource
   *   @param id <String> custom id to use for load event
   */
  load = ( resource ) => {
    if ( !resource ) {
      throw new Error( 'load requires an end point' )
    }

    if ( !this.loaders.size ) {
      throw new Error( 'no loaders associated with preload.io' )
    }

    let opts = {
      resource: resource,
      wait: false,
      loader: null,
      id: null
    }

    if ( typeof resource === 'object' ) {
      if ( !resource.resource ) {
        throw new Error( 'load requires an end point' )
      }

      opts = Object.assign( opts, resource)
    }

    let id = opts.id || uuid.v1()
    let loader = this.loaders.get( opts.loader || this.getLoaderName( opts.resource ) )

    if ( !loader ) {
      throw new Error( 'No loader associated with resource ' + opts.resource )
    }

    let loadEvent = Object.assign( opts, {
      id: id,
      loader: loader
    })

    // Adds the loader function to the queue
    this.queue.add( loadEvent )

    if ( !opts.wait ) {
      this.run( )
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
    this.responses.clear()
    this.emit( EVENTS.FLUSH )
  }

  /**
   * Processes the load queue.
   */
  run = () => {
    if ( this.isRunning ) {
      return
    }

    this.isRunning = true

    // Set up load event listeners
    this.on( EVENTS.LOAD, this.onLoad )
    this.on( EVENTS.LOAD_ERROR, this.onLoad )

    setTimeout( () => {
      this.emit( EVENTS.START )
      this.queue.forEach( event => event.loader.load( this, event ) )
    }, 0 )

    /**
     * Return a promise to allow thenable or async/await
     */
    return new Promise( ( resolve, reject ) => {
      // Resolved with all the responses
      this.once( EVENTS.COMPLETE, res => {
        // @TODO check for response errors and reject
        resolve( res )
      })
    })
  }

  /**
   * Tries to match filename extension with the loader required to load it
   */
  getLoaderName( resource ) {
    let it = this.loaders.values( )
    let loader = null

    while ( loader = it.next().value ) {
      if ( loader.match.test( resource ) ) {
        return loader.name
      }
    }

    return null
  }

  /**
   * Collects up load events
   */
  onLoad = ( event ) => {
    this.responses.set( event.id, event )

    if ( this.responses.size >= this.queue.size ) {
      // Delay to make sure all load events have been collected by listeners
      setTimeout( this.onComplete, 0 )
    }
  }

  /**
   * Fired when all load events are finished, regardless of whether they failed
   */
  onComplete = ( res ) => {
    this.off( EVENTS.LOAD, this.onLoad )
    this.off( EVENTS.LOAD_ERROR, this.onLoad )
    this.emit( EVENTS.COMPLETE, this.responses )

    this.isRunning = false
  }
}
