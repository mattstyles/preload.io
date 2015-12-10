# preload.io

> Asset preloader

[![Sauce Test Status](https://saucelabs.com/buildstatus/mattstyles)](https://saucelabs.com/u/mattstyles)

```shell
npm install --save preload.io
```

## Getting Started

`Preload.io` will collect and report on load events, allowing you to use the load stream to trigger your UI or any other events that occur. Out of the box `preload.io` does not contain much functionality and certainly won’t be able to load anything—that is the job of module loaders.

To get started you should also create or install a module loader, such as `preload.io-image` and then register that module with the preloader

```shell
npm i -S preload.io
npm i -S preload.io-image
```

```js
import Preloader from 'preload.io'
import ImageLoader from 'preload.io-image'

const preloader = new Preloader()
preloader.register( new ImageLoader() )
```

Each specific loader will get a kick from `preload.io` via the `load` method, which means all you should be interested in is triggering load events and listening for their completions. `Preload.io` also exports the events hash it uses to report on load events.

```js
import { EVENTS } from 'preload.io'

preloader.load( 'image.jpg' )

preloader.on( EVENTS.LOAD, event => {
  // Stuff from each load event ends up here
})

preloader.on( EVENTS.COMPLETE, res => {
  // All the responses from load events end up here
})
```

## Waiting before preloading

`Preload.io` will wait until the next tick before starting to load any resources (also triggering an `EVENTS.START` event), although if you need more flexibility over when to start loading resources then the `wait` flag can be passed to the load function

```js
preloader.load({
  resource: 'image.png',
  wait: true
})

// Some time later you’ll need to manually run the preload queue
preloader.run()
```

Note that any load events without the `wait` flag will cause the `run()` function to execute and load all events currently queued.

## Manually specifying the loader

Each loader module should implement a `match regex` that gives `preload.io` clues about which loader to use for each end point, but sometimes that just isn’t good enough, or your end points have funky names that don’t match the regex, in these cases you can manually specify the loader by name. To find a loader name either check its documentation or instantiate the object and use the `name` key.

```js
const preloader = new Preloader()
const imageloader = new ImageLoader()

preloader.register( imageloader )

preloader.load({
  resource: '/dailyImage',
  loader: imageloader.name
})
```

## Responding to specific load events

Sometimes you’ll want to set up a queue of load events but respond to a specific event within that queue, although you don’t much care about the order of events you are interested in a specific one. To deal with this case `preload.io` assigns a unique id to each load event, which is reported back in the load and load-error events.

```js
const id = preloader.load( 'splash-image.jpg' )

preloader.on( EVENTS.LOAD, event => {
  if ( event.id === id ) {
    goUseThatSplashImage( event.res )
  }
})
```

The contents of the load event is determined by the module loader so check the documentation for each loader although by convention they should return an `id` to let you handle specific events.

## Grabbing resource once loading has completed

A handle to all the resources is returned as a map during the `complete` event. Load event id's form the keys with the response as the value.

```js
preloader.load({
  id: 'splash',
  resource: 'splash-image.jpg'
})

preloader.on( EVENTS.COMPLETE, resources => {
  doSomeSplashing( resources.get( 'splash' ).res )
})
```

## Passing options through preloader to the individual loaders

Preloader will pass any options through to individual loaders, you can think of these as default or global options. Options passed to individual loaders will have higher precedence.

```js
const preloader = new Preloader({
  mode: 'no-cors'
})

// assert( options.mode === 'no-cors' )
```

```js
const preloader = new Preloader()
preloader.load({
  resource: 'image.jpg',
  options: {
    mode: 'cors'
  }
})

// assert( options.mode === 'cors' )

## Contributions

Contributions are very welcome, in lieu of a formal styleguide please try to follow the conventions set out in the codebase and when in doubt about functionality open an issue first to discuss.

Please add tests for any new functionality or update tests for fixes/amends.

To run the tests use

```sh
npm test
```

Which will instruct you to open your browser at port 8080 to get a report.

## Install

```
npm install --save preload.io
```

## License

[ISC](https://github.com/mattstyles/preload.io/blob/master/LICENSE)
