
import tape from 'tape'

import Preloader from '../lib'
import { EVENTS } from '../lib'

import MockLoader from './__mock/mockLoader'


tape( 'Load should throw if no end point is supplied', t => {
  t.plan( 2 )

  let preloader = new Preloader()
  preloader.register( new MockLoader() )

  t.throws( () => {
    preloader.load( '' )
  })
  t.throws( () => {
    // No url parameter passed to load
    preloader.load({
      foo: 'foo'
    })
  })
})

tape( 'Load should throw if no loaders are registered', t => {
  t.plan( 1 )

  let preloader = new Preloader()

  t.throws( () => {
    preloader.load( 'mock.jpg' )
  })
})

tape( 'Load should throw if no loaders are associated with the end point', t => {
  t.plan( 1 )

  let preloader = new Preloader()
  preloader.register( new MockLoader() )

  t.throws( () => {
    preloader.load( 'mock.json' )
  })
})
