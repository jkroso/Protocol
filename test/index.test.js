var should = require('chai').should()
  , expect = require('chai').expect
  , protocol = require('../src/index')

describe('Protocol', function () {
	var defaults = {
		first: function () {return this.value[0]},
		rest: function () {return this.value.slice(1)}
	}
	var Sequence = protocol(defaults)
	function StringWrapper (value) {this.value = value}
	function ArrayWrapper (value) {this.value = value}

	describe('.implement(type, implementation)', function () {
		it('should return itself', function () {
			Sequence
				.implement(String, StringWrapper)
				.implement(Array, ArrayWrapper)
				.should.equal(Sequence)
		})
		it('should not allow two implementations for the same type', function () {
			(function () {
				Sequence.implement(String, StringWrapper)
			}).should.throw(Error, /implemented/)
		})
		it('should extend the implementation with any missing methods', function () {
			StringWrapper.prototype.first.should.equal(defaults.first)
			ArrayWrapper.prototype.first.should.equal(defaults.first)
			StringWrapper.prototype.rest.should.equal(defaults.rest)
			ArrayWrapper.prototype.rest.should.equal(defaults.rest)
		})
		it('should create a wrapper if one is not provided', function () {
			function H() {}
			Sequence.implement(H, {random:function () {return this.value}})
			Sequence(new H).random.should.be.a('function')
		})
	})
	
	describe('for basic types', function () {
		it('should create the correct implementation', function () {
			Sequence('').should.be.an.instanceOf(StringWrapper)
			Sequence([]).should.be.an.instanceOf(ArrayWrapper)
		})
		it('should be able to invoke the default implementations', function () {
			expect(Sequence('abcd').first()).to.equal('a')
			expect(Sequence('abcd').rest()).to.equal('bcd')
			expect(Sequence([1, 2, 3, 4]).first()).to.equal(1)
			expect(Sequence([1, 2, 3, 4]).rest()).to.eql([2, 3, 4])
		})
	})
	
	describe('.extend()', function () {
		var Sequence = protocol({
			first: function () {return this.value[0]},
			rest: function () {return this.value.slice(1)}
		})
		function StringWrapper (value) {this.value = value}
		function ArrayWrapper (value) {this.value = value}
		Sequence.implement(String, StringWrapper)
		Sequence.implement(Array, ArrayWrapper)

		Sequence.extend({
			reverse: function () {
				var res = []
				  , len = this.value.length
				  , i = len
				while (i) {
					res[len - i] = this.value[--i]
				}
				return new this.constructor(res)
			}
		})
		Sequence.extend(String, {
			reverse: function () {
				var rev = ''
				  , str = this.value
				  , i = str.length
				while (i--) {
					rev += str[i]
				}
				return new this.constructor(rev)
			}
		})
		it('should allow extension of specific types', function () {
			expect(Sequence('abc').reverse().value).to.equal('cba')
		})
		it('should add default methods', function () {
			ArrayWrapper.prototype.reverse.should.be.a('function')
			Sequence(['a', 'b', 'c']).reverse().value.should.deep.equal(['c', 'b', 'a'])
		})
	})

	describe('Custom types', function () {
		function Human () {}
		function Dog () {}

		var Talker = protocol({
				speak: function () {return 'blurg'}
			})
		Talker
			.implement(Human, { speak: function () { return 'hello' }})
			.implement(Dog, { speak: function () { return 'woof' }})

		it('should invoke the proper implementation', function () {
			var human = new Human
			Talker(human).speak().should.equal('hello')
			var dog = new Dog
			Talker(dog).speak().should.equal('woof')
		})
	})

	describe('for inherited types', function () {
		function User () {}

		function Guest () {}
		Guest.prototype = Object.create(User.prototype, {constructor:{value:Guest}})

		function Admin () {}
		Admin.prototype = Object.create(User.prototype, {constructor:{value:Admin}})

		var Actor = protocol({access: function () {return 'denied'}})
			.implement(User, {access: function () { return 'denied' }})
			.implement(Admin, {access: function () { return 'accepted'}})


		it('should inherit an implementation', function () {
			Actor(new Guest).access().should.equal('denied')
		})

		it('Should be able to shadow an implementation', function () {
			Actor(new Admin).access().should.equal('accepted')
		})
	})
})