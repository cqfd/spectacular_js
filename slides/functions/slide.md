!SLIDE
# functions

!SLIDE
## functions are first-class

!SLIDE
## you can
* assign them to variables
* store them in data structures
* pass them as arguments to other functions
* return them from other functions

!SLIDE
    @@@ javascript
    var f = function() {
        return 'hi!';
    };


!SLIDE
    @@@ javascript
    var obj = {};
    obj.func = f;

    var xs = [1, "foo"];
    xs.push(f);

!SLIDE
    @@@ javascript
    function doItTwice(func) {
        func();
        func();
    }

    doItTwice(f);

!SLIDE
    @@@ javascript
    function greeterFactory(name) {
        return function() {
            return "hi " + name + "!";
        };
    }

    var hiVenmo = greeterFactory("venmo");

    hiVenmo();

!SLIDE
## functions are lexically-scoped

!SLIDE
## functions have dynamic context
