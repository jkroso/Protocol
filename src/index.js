
module.exports = Protocol

// dependency
var getProto = Object.getPrototypeOf

/**
 * Create a new kind of abstraction
 *
 *   var Enumerable = protocol('Enumerable', {
 *     first: function(){return this._[0]},
 *     each: function(fn){
 *       for (var i = 0; i < this._.length; i++) {
 *         fn(this._[i])
 *       }
 *       return this
 *     }
 *   })
 *  
 * @param {Object} ui The default set of methods each implementation will recieve 
 * @return {Function} [description]
 */

function Protocol (name, ui) {
  var types = []
    , imps = []

  var protocol = eval(
    '(function '+name+'(value){\n' +
    '  var Wrapper = get(value.constructor)\n' +
    '  if (Wrapper) return new Wrapper(value)\n' +
    '})'
  )

  protocol.interface = ui || (ui = {})

  /**
   * Get the implementation of a certain type if it has one
   *
   *   enumerable.get(Array) -> [Function ArrayWrapper]
   *
   * @param {Function} type e.g. Array
   * @return {Function}
   */
  
  protocol.get = get
  function get (type) {
    var len = types.length
    do {
      for (var i = 0; i < len; i++) {
        if (types[i] === type) return imps[i]
      }
      type = getProto(type.prototype)
      if (!type) break
    } while (type = type.constructor)
  }

  /**
   * Add an implementation for `type` to the protocol
   *
   * Custom constructor. Its prototype will be extended with any
   * methods of the protocol you haven't defined
   * 
   *   enumerable.implement(String, function(value){
   *     this._ = value
   *   })
   *
   * Default constructor with custom methods. Any methods in the protocol
   * that you don't define will get the default implementation
   * 
   *   enumerable.implement(String, {
   *     first: function(){return this._[0]}
   *   })
   *
   * Fully default implementation
   *
   *   enumerable.implement(String)
   *
   * @param {Function} type e.g. Array, Object, String
   * @param {Function|Object|null} [factory]
   * @return {Self}
   */

  protocol.implement = function (type, factory) {
    if (types.indexOf(type) >= 0) {
      throw new Error(name+' already implemented for '+type.name)
    }

    if (typeof factory !== 'function') {
      var proto = factory
      // create a constructor
      factory = eval(
        '(function '+name+'_$_'+type.name+'(val){\n' +
        '  this._ = val || []\n' +
        '})'
      )

      // handle method definitions
      if (typeof proto === 'object') {
        merge(factory.prototype, proto)
      }
    }

    // add default methods
    softMerge(factory.prototype, ui)

    // store
    types.push(type)
    imps.push(factory)

    return this
  }

  /**
   * Add methods to the protocols interface
   *
   *   enumerable.extend({
   *     toArray: function(){
   *       return Array.apply(null, this.value)
   *     }
   *   })
   *
   * @param {Function} [type] if you want to implement methods for a specific type
   * @param {Object} add
   * @return {Self}
   */
  
  protocol.extend = function (type, add) {
    if (typeof type === 'function') {
      var i = types.indexOf(type)
      if (i < 0) throw new Error(type.name+' not implemented')
      merge(imps[i].prototype, add)
      return this
    }

    add = type
    // TODO:replace existing defaults
    merge(ui, add)

    // extend existing implementations
    for (var i = 0, len = imps.length; i < len; i++) {
      softMerge(imps[i].prototype, add)
    }

    return this
  }

  return protocol
}

function softMerge (a, b) {
  for (var prop in b) {
    if (!a.hasOwnProperty(prop)) {
      a[prop] = b[prop]
    }
  }
}

function merge (a, b) {
  for (var prop in b) a[prop] = b[prop]
}
