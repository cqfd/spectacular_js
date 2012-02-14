describe("How does property lookup work in Javascript?", function() {
  it("first, check to see if the property is an own property", function() {
    var obj = {};
    obj.foo = "foo";
    expect(obj.hasOwnProperty("foo")).toBe(true);
    expect(obj["foo"]).toBe("foo");
  });

  it("if not, and __proto__ is null, give up and return undefined", function() {
    var obj = {};
    obj.__proto__ = null;
    expect(obj["foo"]).toBe(undefined);
  });

  it("if not, and __proto__ is not null, look for the property in __proto__", function() {
    var obj = {};
    var proto = {};
    proto.foo = "foo";
    obj.__proto__ = proto;
    expect(obj.hasOwnProperty("foo")).toBe(false);
    expect(obj.__proto__.hasOwnProperty("foo")).toBe(true);
    expect(obj.foo).toBe("foo");
  });

  it("and so on, up the prototype chain", function() {
    var obj = {};

    var a = {};
    a.alligator = "alligator";

    var b = {};
    b.bicycle = "bicycle";

    var c = {};
    c.cat = "cat";

    obj.__proto__ = a;
    a.__proto__ = b;
    b.__proto__ = c;

    expect(obj.alligator).toBe(a.alligator);
    expect(obj.bicycle).toBe(b.bicycle);
    expect(a.bicycle).toBe(b.bicycle);
    expect(obj.cat).toBe(c.cat);
    expect(a.cat).toBe(c.cat);
    expect(b.cat).toBe(c.cat);
  });
});

describe("How do Javascript's for..in loops relate to properties?", function() {
  it("an object's own properties will show up", function() {
    var obj = {};
    obj.foo = "foo";
    obj.bar = "bar";
    for (var prop in obj) {
      expect(obj.hasOwnProperty(prop)).toBe(true);
    }
  });

  it("as will an object's prototypal properties", function() {
    var obj = {};
    var proto = {};
    obj.__proto__ = proto;
    proto.foo = "foo";
    proto.bar = "bar";
    for (var prop in obj) {
      expect(obj.hasOwnProperty(prop)).toBe(false);
    }
  });

  it("although the own properties take precedence over prototypal properties", function() {
    var obj = {};
    var proto = {};
    obj.__proto__ = proto;

    obj.foo = "foo";
    proto.foo = "bar";
    for (var prop in obj) {
      expect(obj.hasOwnProperty(prop)).toBe(true);
      expect(obj[prop]).toBe("foo");
    }
  });
});

describe("What do constructor functions do?", function() {
  describe("when used in conjuction with 'new'", function() {
    var Foo;
    beforeEach(function() {
      Foo = function() {
        this.foo = "foo";
      };
    });
    it("they implicitly return an object", function() {
      var f = new Foo;
      expect(f).toBeTruthy(); // even though Foo doesn't return anything
    });

    it("any properties you hang on 'this' inside the function will be own properties", function() {
      var f = new Foo;
      expect(f.hasOwnProperty('foo')).toBe(true);
    });

    it("the object's __proto__ property will point to the constructor's prototype property", function() {
      var f = new Foo;
      expect(f.__proto__).toBe(Foo.prototype);
    });

    it("which means that constructor functions manufacture objects that all share the same __proto__", function() {
      var f1 = new Foo;
      var f2 = new Foo;
      expect(f1).not.toBe(f2);
      expect(f1.__proto__).toBe(f2.__proto__);
    });

    it("which means that properties of the constructor's prototype are shared by all instances", function() {
      var f1 = new Foo;
      var f2 = new Foo;
      Foo.prototype.bar = {someKey: "someVal"};
      expect(f1.bar).toBe(f2.bar); // they are identical!
    });

    it("the __proto__ of the constructor's prototype is simply the default __proto__, Object.prototype", function() {
      var obj = {};
      expect(Foo.prototype.__proto__).toBe(obj.__proto__);
      expect(Foo.prototype.__proto__).toBe(Object.prototype);
    });
  });

  describe("when NOT used in conjunction with 'new'", function() {
    it("bad things will happen, because 'this' inside the constructor will default to the window!", function() {
      var Foo = function() {
        this.foo = "foo";
      };
      var f = Foo(); // no new!
      expect(f).toBe(undefined); // because Foo doesn't return anything
      expect(foo).toBe("foo"); // because foo is now a property of the global object!
    });
  });
});

describe("Let's implement our own version of property lookup", function() {
  beforeEach(function() {
    Object.prototype.lookup = function(name) {
      if (this.hasOwnProperty(name)) {
        return this[name];
      } else if (this.__proto__) {
        return this.__proto__.lookup(name);
      } else {
        return undefined;
      }
    };
  });

  afterEach(function() {
    delete Object.prototype.lookup;
  });

  it("you can lookup own properties", function() {
    var obj = {};
    obj.foo = "foo";
    expect(obj.lookup("foo")).toBe("foo");
  });

  it("you can lookup __proto__ properties", function() {
    var obj = {};
    obj.__proto__.foo = "foo";
    expect(obj.lookup("foo")).toBe("foo");
    delete obj.__proto__.foo
  });

  it("you can lookup properties defined in a constructor function", function() {
    var Foo = function() {
      this.foo = "foo";
    };
    var f = new Foo;
    expect(f.lookup('foo')).toBe("foo");
  });

  it("you can lookup properties defined on a constructor's prototype property", function() {
    var Foo = function(){};
    var f = new Foo;
    Foo.prototype.foo = "foo";
    expect(f.lookup('foo')).toBe("foo");
  });
});

describe("_.extend", function() {
  describe("What does it do?", function() {
    it("it extends one object with the properties of another object", function() {
      var a = {};
      var b = {};
      b.foo = "foo";
      _.extend(a, b);
      expect(a.foo).toBe(b.foo);
    });

    it("the extended object acquires the own properties of the extending object", function() {
      var a = {};
      var b = {};
      b.foo = "foo";
      _.extend(a, b);
      expect(a.hasOwnProperty("foo")).toBe(true);
    });

    it("the extending object's properties take priority!", function() {
      var a = {};
      a.foo = "foo";
      var b = {};
      b.foo = "bar";
      _.extend(a, b);
      expect(a.foo).toBe("bar");
    });

    it("the extending object's prototypal properties become own properties of the extended object", function() {
      var a = {};
      var b = {};
      var c = {};
      c.cat = "cat";
      var d = {};
      d.dolphin = "dolphin";

      b.__proto__ = c;
      c.__proto__ = d;

      _.extend(a, b);
      expect(a.hasOwnProperty("cat")).toBe(true);
      expect(a.hasOwnProperty("dolphin")).toBe(true);
      console.log(a);
    });

    it("in such a way that the extending object's own properties take precedence over its prototypal properties", function() {
      var a = {};
      var b = {};
      var c = {};
      b.bar = "bar";
      b.__proto__ = c;
      c.bar = "foo";
      _.extend(a, b);
      expect(a.bar).toBe("bar");
    });

    it("the extended object's prototype chain is left unaffected", function() {
      var a = {};
      var originalProto = a.__proto__;
      var b = {};
      var c = {};
      b.__proto__ = c;
      _.extend(a, b);
      expect(a.__proto__).toBe(originalProto);
    });
  });
});

describe("How does function context work in Javascript?", function() {
  it("if a function is called with an explicit reciever, 'this' is set to be the reciever", function() {
    var a = {};
    var b = {};
    var f = function() {
      return this;
    };
    a.f = f;
    b.f = f;
    expect(a.f()).toBe(a);
    expect(b.f()).toBe(b);
    expect(a.f()).not.toBe(b);
  });

  it("otherwise, 'this' defaults to the global object", function() {
    var f = function() {
      return this;
    };
    expect(f()).toBe(window);
  });

  it("you can use Function.prototype.call to manually set a function's context", function() {
    var a = {};
    var b = {};
    var f = function() {
      return this;
    };
    expect(f.call(a)).toBe(a);
    expect(f.call(b)).toBe(b);
    expect(f.call(null)).toBe(window);
  });

  it("you can also use Function.prototype.apply to manually set a function's context", function() {
    var a = {};
    var b = {};
    var f = function() {
      return this;
    };
    expect(f.apply(a)).toBe(a);
    expect(f.apply(b)).toBe(b);
    expect(f.apply(null)).toBe(window);
  });
});

describe("How does Underscore's bind function work?", function() {
});
