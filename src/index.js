module.exports = Protocol

var getProto = Object.getPrototypeOf

/**
 * Create a new kind of abstraction
 *
 *   var Enumerable = createProtocol({
 *     first: function(){return this.value[0]},
 *     each: function(fn){
 *       for (var i = 0; i < this.value.length; i++) {
 *         fn(this.value[i])
 *       }
 *       return this
 *     }
 *   })
 *  
 * @param {Object} ui The default set of methods each implementation will recieve 
 * @return {Function} [description]
 */

function Protocol (ui) {
	var types = []
	  , imps = []

	ui || (ui = {})

	function dispatcher (value) {
		var Wrapper = get(value.constructor)
		if (Wrapper) return new Wrapper(value) 
	}
	/**
	 * Get the implementation of a certain type if it has one
	 *
	 *   enumerable.get(Array) -> [Function ArrayWrapper]
	 *
	 * @param {Constructor} type
	 * @return {Constructor} the function used to generate wrappers for the type passed
	 */
	dispatcher.get = get
	function get (type) {
		do {
			var i = types.length
			while (i--) 
				if (types[i] === type) return imps[i]
		} while ((type = getProto(type.prototype)) && (type = type.constructor))
	}

	/**
	 * Add an implementation for type to the protocol
	 *
	 *   enumerable.implement(String, function(value){
	 *     this.value = value
	 *   })
	 *
	 * @param {Constructor} type the constructor of the type you are adding to the protocol
	 * @param {Constructor} factory The type that will implement the interface
	 * @return {Self}
	 */

	dispatcher.implement = function (type, factory) {
		if (types.indexOf(type) >= 0) {
			throw new Error('Protocol already implemented for '+(type.name || type))
		}
		if (typeof factory !== 'function') {
			var proto = factory
			factory = function Wrapper (value) {this.value = value}
			if (typeof proto === 'object') merge(factory.prototype, proto)
		}
		var proto = factory.prototype
		  , methods = Object.keys(ui)
		  , i = methods.length
		
		while (i--) {
			if (!proto.hasOwnProperty(methods[i])) {
				proto[methods[i]] = ui[methods[i]]
			}
		}

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
	 * @param {Constructor} type If you only want to extend the interface of a certain type
	 * @param {Object} add an object containing the methods to add
	 * @return {Self}
	 */
	dispatcher.extend = function (type, add) {
		if (add == null) {
			merge(ui, type)
			var i = types.length
			while (i--) {
				this.extend(types[i], type)
			}
		}
		else {
			var i = types.indexOf(type)
			if (i < 0) 
				throw new Error('No implmentation is defined for '+ (type.name || type))
			merge(imps[i].prototype, add)
		}
		return this
	}

	return dispatcher
}

function merge (a, b) {
	var keys = Object.keys(b)
	  , i = keys.length
	while (i--)
		a[keys[i]] = b[keys[i]]
}
