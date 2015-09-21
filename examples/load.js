
import Preloader from '../lib'


let fakeLoader = {
    name: 'fake',
    match: /jpg$/,
    load: ( ctx, opts ) => {
        console.log( 'fakeLoader', this, opts )
    }
}

let preloader = new Preloader()
preloader.register( fakeLoader )

console.log( ' -- Specify loader' )
preloader.load({
    url: 'hello.jpg',
    loader: 'fake'
})


console.log( ' -- Match on url extension' )
preloader.load({
    url: 'hello.jpg'
})


console.log( ' -- Match on url extension' )
preloader.load( 'example.jpg' )
