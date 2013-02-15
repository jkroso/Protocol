
var should = require('chai').should()
  , protocol = require('../src')

/*!
 * An interface
 */

var defaults = {
  first: function () {return this._[0]},
  rest: function () {return this._.slice(1)}
}

var Sequence
beforeEach(function () {
  Sequence = protocol('Sequence', defaults)
})

describe('protocol(name, interface)', function () {
  it('should return a constructor', function () {
    Sequence.should.be.an.instanceOf(Function)
  })

  it('should have the correct name', function () {
    Sequence.name.should.equal('Sequence')
  })
})

describe('protocol.implement(type, implementation)', function () {
  it('should return itself', function () {
    Sequence
      .implement(String)
      .implement(Array)
      .should.equal(Sequence)
  })

  it('should not allow two implementations for the same type', function () {
    (function () {
      Sequence.implement(String)
      Sequence.implement(String)
    }).should.throw(Error, /implemented/)
  })
  
  it('should create a default wrapper', function () {
    Sequence.implement(String)
    var string = Sequence.get(String)
    string.prototype.first.should.equal(defaults.first)
    string.prototype.rest.should.equal(defaults.rest)
  })

  it('should extend the implementation with any missing methods', function () {
    function Wrap (v) {this._=v}
    function first () {}
    Wrap.prototype.first = first
    Sequence.implement(String, Wrap)

    Wrap.prototype.first.should.equal(first)
    Wrap.prototype.rest.should.equal(defaults.rest)
  })
})

describe('protocol.get(type)', function () {
  it('should return the constructor function mapped to that type', function () {
    function Wrap() {}
    Sequence.implement(String, Wrap)

    Sequence.get(String).should.equal(Wrap)
  })
})

describe('for basic types', function () {
  var Arr
  var Str
  beforeEach(function () {
    Sequence.implement(String).implement(Array)
    Str = Sequence.get(String)
    Arr = Sequence.get(Array)
  })

  it('should create the correct implementation', function () {
    Sequence('').should.be.an.instanceOf(Str)
    Sequence([]).should.be.an.instanceOf(Arr)
  })

  it('should be able to invoke the default implementations', function () {
    Sequence('abcd').first().should.equal('a')
    Sequence('abcd').rest().should.equal('bcd')
    Sequence([1, 2, 3, 4]).first().should.equal(1)
    Sequence([1, 2, 3, 4]).rest().should.eql([2, 3, 4])
  })
})

describe('protocol.extend()', function () {
  beforeEach(function () {
    Sequence.implement(String)
    Sequence.implement(Array)

    Sequence.extend({
      reverse: function () {
        var res = []
          , len = this._.length
          , i = len
        while (i) {
          res[len - i] = this._[--i]
        }
        
        this._ = res
        return this
      }
    })
    
    Sequence.extend(String, {
      reverse: function () {
        var rev = ''
          , str = this._
          , i = str.length
        while (i--) {
          rev += str[i]
        }
        
        this._ = rev
        return this
      }
    })
  })

  it('should allow extension of specific types', function () {
    Sequence('abc').reverse()._.should.equal('cba')
  })

  it('should add default methods', function () {
    Sequence(['a', 'b', 'c']).reverse()._.should.deep.equal(['c', 'b', 'a'])
  })
})

describe('Custom types', function () {
  function Human () {}
  function Dog () {}

  var Talker = protocol('Talker', {
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

  var Actor = protocol('Actor', {access: function () {return 'denied'}})
    .implement(User, {access: function () { return 'denied' }})
    .implement(Admin, {access: function () { return 'accepted'}})


  it('should inherit an implementation', function () {
    Actor(new Guest).access().should.equal('denied')
  })

  it('Should be able to shadow an implementation', function () {
    Actor(new Admin).access().should.equal('accepted')
  })
})
