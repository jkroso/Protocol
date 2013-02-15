# Protocol

An object orientated take on protocols

## Getting Started

In the browser

`component install jkroso/protocol`

In Node.js 

`npm install jkroso/protocol`

## API

```javascript
var Protocol = require('protocol')
```
  - [Protocol()](#protocol)
  - [protocol.get](#protocolget)
  - [protocol.implement()](#protocolimplementtypefunctionfactoryfunctionobjectnull)
  - [protocol.extend()](#protocolextendtypefunctionaddobject)

## Protocol()

  Create a new kind of abstraction
  
```js
var Enumerable = protocol('Enumerable', {
  first: function(){return this._[0]},
  each: function(fn){
    for (var i = 0; i < this._.length; i++) {
      fn(this._[i])
    }
    return this
  }
})
```

## protocol.get

  Get the implementation of a certain type if it has one
  
```js
enumerable.get(Array) -> [Function ArrayWrapper]
```

## protocol.implement(type:Function, [factory]:Function|Object|null)

  Add an implementation for `type` to the protocol
  
  Custom constructor. Its prototype will be extended with any
  methods of the protocol you haven't defined
  
```js
enumerable.implement(String, function(value){
  this._ = value
})
```

  
  Default constructor with custom methods. Any methods in the protocol
  that you don't define will get the default implementation
  
```js
enumerable.implement(String, {
  first: function(){return this._[0]}
})
```

  
  Fully default implementation
  
```js
enumerable.implement(String)
```

## protocol.extend([type]:Function, add:Object)

  Add methods to the protocols interface
  
```js
enumerable.extend({
  toArray: function(){
    return Array.apply(null, this.value)
  }
})
```


## Release History
_(Nothing yet)_

## License
Copyright (c) 2012 Jakeb Rosoman

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
