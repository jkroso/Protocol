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

function createProtocol (ui) {
	var types = []
	  , imps = []

	var dispatcher = function (value) {
		var type = value
		do {
			if ((type = type.constructor) == null) return
			for ( var i = 0, len = types.length; i < len; i++ ) {
				if (types[i] === type) return new imps[i](value)
			}
		} while (type = Object.getPrototypeOf(type.prototype))
	}

/**
 * Add an implementation for type to the protocol
 *
 *   enumerable.register(String, function(value){
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
			factory = function Anon (value) {this.value = value}
			if (typeof proto === 'object') merge(factory.prototype, proto)
		}
		var proto = factory.prototype
		  , methods = Object.keys(ui)
		  , i = methods.length
		while (i--) {
			if (typeof proto[methods[i]] !== 'function') {
				proto[methods[i]] = ui[methods[i]]
			}
		}
		types.push(type)
		imps.push(factory)
		return this
	}
/**
 * Add methods to the protocols interface
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
	while (i--) {
		a[keys[i]] = b[keys[i]]
	}
}

module.exports = createProtocol