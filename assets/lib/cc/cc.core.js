;
var cc = {};

(function () {
    if (typeof module !== 'undefined') {
        module.exports = cc;
    }
})();


(function (cc) {

    cc.global = (function () { return this; })();

    var each = cc.each = function (obj, proc) {
        for (var k in obj) {
            if (proc.call(null, k, obj[k]) === false) {
                break;
            }
        }
    };

    var arrayEach = cc.arrayEach = function (arr, proc) {
        for (var i = 0; i < arr.length; ++i) {
            if (proc.call(null, arr[i], i) === false) {
                break;
            }
        }
    };

    var jsTypeOf = function (obj) {
        var typeStr = Object.prototype.toString.call(obj);
        return /\[object (.*)]/.exec(typeStr)[1].toLowerCase();
    };

    arrayEach([
        'Object',
        'String',
        'Function',
        'Array',
        'Number',
        'Date'
    ], function (typeName) {
        cc['is' + typeName] = function (obj) {
            return jsTypeOf(obj) === typeName.toLowerCase();
        };
    });

    var isNullOrUndefined = cc.isNullOrUndefined = function (v) {
        return v === null || v === undefined;
    };

    cc.typeOf = function (obj) {
        if (obj &&
            obj.$meta$ &&
            obj.$meta$.class &&
            cc.isFunction(obj.$meta$.class.name)) {
            return obj.$meta$.class.name();
        } else {
            return jsTypeOf(obj);
        }
    };

    var extendsOf = cc.extendsOf = function (cls, superCls) {
        while (cls) {
            if (cls === superCls) {
                return true;
            }
            cls = cls.$meta$.superclass;
        }
        return false;
    };

    cc.instanceOf = function (inst, cls) {
        if (isNullOrUndefined(inst)) {
            return false;
        }
        if (cc.isFunction(cls)) {
            return inst.constructor === cls || inst instanceof cls;
        }
        var c = inst.$meta$ && inst.$meta$.class;
        return extendsOf(c, cls);
    };


    var pluralSetterDecorator = function (setter) {
        return function (a) {
            var self = this;
            each(a, function (k, v) {
                setter.call(self, k, v);
            });
            return self;
        };
    };

    var multipleSetterDecorator = function (setter) {
        var pluralSet = setter.overloadPluralSetter();
        return function (a, val) {
            var self = this;
            if (cc.isString(a)) {
                setter.call(self, a, val);
            } else {
                pluralSet.call(self, a);
            }
            return self;
        };
    };


    Function.prototype.decorate = function (decrator) {
        return decrator(this);
    };

    Function.prototype.overloadPluralSetter = function () {
        return this.decorate(pluralSetterDecorator);
    };

    Function.prototype.overloadSetter = function () {
        return this.decorate(multipleSetterDecorator);
    };

    Function.prototype.implement = function (k, v) {
        this.prototype[k] = v;
    }.overloadSetter();

    Function.prototype.implementWithoutOverride = function (k, v) {
        if (!(k in this.prototype)) {
            this.prototype[k] = v;
        }
    }.overloadSetter();

    Function.implement({

        extend: function (k, v) {
            this[k] = v;
        }.overloadSetter(),

        new: function () {
            var args = Array.from(arguments);
            args.unshift(null);
            return new (this.bind.apply(this, args))();
        }

    });


    Function.extend({

        noop: function () {},

        returnValue: function (value) {
            return function () {
                return value;
            };
        },

        returnTrue: function () {
            return true;
        },

        returnFalse: function () {
            return false;
        },

        compare: function (a, b) {
            if (a < b) return -1;
            if (a > b) return 1;
            return 0;
        },

        id: function (x) { return x; }

    });


    Object.extend({

        clone: function (obj) {
            var cln = {};
            cc.each(obj, function (k, v) {
                cln[k] = v;
            });
            return cln;
        }

    });


    Array.implement({
        each: function (proc) {
            arrayEach(this, proc);
            return this;
        },
        partition: function (predicate) {
            var pass = [], fail = [];
            this.each(function (v) {
                (predicate(v) ? pass : fail).push(v);
            });
            return [pass, fail];
        },
        append: function (array) {
            this.push.apply(this, array);
            return this;
        }
    });


    Array.extend({
        from: function (v) {
            var l = v.length;
            if (!cc.isNumber(l)) {
                return [v];
            }
            var ret = [];
            for (var i = 0; i < l; ++i) {
                ret.push(v[i]);
            }
            return ret;
        }
    });


    Number.extend({
        from: function (v) {
            return parseFloat(v);
        }
    });


    String.implement({
        startsWith: function (prefix) {
            return this.indexOf(prefix) === 0;
        },
        format: function (ctx) {
            var s = this;
            cc.each(ctx, function (k, v) {
                var reg = new RegExp('{' + k + '}', 'g');
                s = s.replace(reg, v);
            });
            return s;
        }
    });

    var dateFormat = function(format) {
        if (isNaN(this.getDay())) { //Invalid Date
            return "";
        }
        var o = {
            "M+": this.getMonth() + 1, //month
            "d+": this.getDate(), //day
            "h+": this.getHours() % 12, //hour
            "H+": this.getHours(), //hour
            "AP": this.getHours() > 12 ? 'PM' : 'AM', //AM/PM
            "m+": this.getMinutes(), //minute
            "s+": this.getSeconds(), //second
            "q+": Math.floor((this.getMonth() + 3) / 3), //quarter
            "S": this.getMilliseconds() //millisecond
        };
        if (/(y+)/.test(format)) {
            format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        for (var k in o) {
            if (new RegExp("(" + k + ")").test(format)) {
                format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
            }
        }
        return format;
    };
    // var _dateToString = Date.prototype.toString;
    Date.implement({
        toString: function (format) {
            if (!format) {
                format = 'yyyy-MM-dd HH:mm:ss';
            }
            return dateFormat.call(this, format);
        }
    });


    return cc;

})(cc);

// file: core/utils.js
(function (cc) {

// TODO: Just for test, don't use it!
cc.evil = function (ctx, src) {
    return (function () {
        if (cc.isNullOrUndefined(ctx)) {
            return eval(src);
        } else {
            with (ctx) {
                return eval(src);
            }
        }
    }).call(null);
};

cc.eval = function (src, ctx) {
    var args = [], values = [];
    cc.each(ctx, function (k, v) {
        args.push(k);
        values.push(v);
    });
    args.push('return eval("' + src.replace(/"/g, '\\"') + '")');
    return Function.apply(null, args).apply(null, values);
};

cc.interval = function (proc, ms) {
    (function loop() {
        setTimeout(function () {
            proc();
            loop();
        }, ms);
    })();
};

cc.template = function (src) {

};

})(cc);

// file: class/class.js
(function (cc) {

var setff = function (obj, values, transform, predicate) {
    if (cc.isFunction(values)) {
        values = values.call(obj, obj);
    }
    (function (name, value) {
        if (predicate(name, value)) {
            obj[name] = transform(name, value);
        }
    }.overloadPluralSetter())(values);
};

var wrapAndSetWithPredicate = function (obj, values, predicate) {
    setff(obj, values, function (name, value) {
        if (cc.isFunction(value)) {
            return value.bind(obj);
        } else {
            return value;
        }
    }, predicate);
};

var wrapAndSet = function (obj, values) {
    wrapAndSetWithPredicate(obj, values, Function.returnTrue);
};

var wrapAndSetWithoutOverride = function (obj, values) {
    wrapAndSetWithPredicate(obj, values, function (name) {
        return !obj.hasOwnProperty(name);
    });
};

var allocObject = function () {
    var self = {};
    self.extend = function (k, v) {
        self[k] = v;
    }.overloadSetter();
    return self;
};

var BasicObject = cc.Object = cc.BasicObject = allocObject();

var Class = cc.Class = allocObject();

var initClass = function (self, superclass, methods, classname) {
    self.super && self.super.initialize();
    var mkObj = (function () {
        if (superclass) {
            return function () {
                var proto = superclass.$meta$.alloc();
                var obj = Object.create(proto);
                obj.super = proto;
                return obj;
            };
        } else {
            return allocObject;
        }
    })();
    self.$meta$ = {
        class: Class,
        alloc: function () {
            var obj = mkObj();
            obj.$meta$ = { class: self };
            wrapAndSet(obj, methods);
            return obj;
        },
        superclass: superclass
    };
    var implementf = function (mthds, setMethods) {
        var allocOld = self.$meta$.alloc;
        self.$meta$.alloc = function () {
            var obj = allocOld();
            setMethods(obj, mthds);
            return obj;
        };
        return self;
    };
    self.extend({
        new: function () {
            var obj = self.$meta$.alloc();
            if (obj.hasOwnProperty('initialize') && cc.isFunction(obj.initialize)) {
                obj.initialize.apply(obj, arguments);
            }
            return obj;
        },
        name: Function.returnValue(classname || 'ccObject'),
        Extends: function (mthds, name) {
            var cls = Class.$meta$.alloc();
            initClass(cls, self, mthds, name);
            return cls;
        },
        implement: function (mthds) {
            return implementf(mthds, wrapAndSet);
        },
        implementWithoutOverride: function (mthds) {
            return implementf(mthds, wrapAndSetWithoutOverride);
        }
    });
};

initClass(BasicObject, null, {
    initialize: Function.noop
}, 'BasicObject');

initClass(Class, BasicObject, null, 'Class');

Class.implement(function (cls) {
    return {
        initialize: function (methods, classname) {
            initClass(cls, BasicObject, methods, classname);
        },
        Include: function (Mixin) {
            Mixin.mixin(cls);
            return cls;
        }
    };
});

})(cc);

// file: class/mixin.js
(function (cc) {

cc.Mixin = cc.Class.new(function (self) {
    var doMixin;
    return {
        initialize: function (methods) {
            doMixin = function (cls) {
                cls.implementWithoutOverride(methods);
            };
        },
        mixin: function (cls) {
            doMixin(cls);
            return self;
        },
        Include: function (Mxn) {
            var doMixinOld = doMixin;
            doMixin = function (cls) {
                doMixinOld(cls);
                Mxn.mixin(cls);
            };
            return self;
        }
    };
}, 'Mixin');

})(cc);

// file: class/events.js
(function (cc) {

cc.Events = cc.Mixin.new(function (self) {

    var registry;

    var reset = function () {
        registry = {};
    };

    var DELIM = '.';

    var splitType = function (type, returns) {
        var delimIdx = type.indexOf(DELIM);
        var name = delimIdx < 0 ? type : type.substring(0, delimIdx);
        return returns(name, type);
    };

    var hasExtraNamespace = function (name, namespace) {
        return name !== namespace;
    };

    var mkMatch = function (namespace) {
        if (namespace) {
            return function (str) {
                if (namespace.startsWith(str)) {
                    var c = namespace[str.length];
                    return !c || c === DELIM;
                } else {
                    return false;
                }
            };
        } else {
            return Function.returnTrue;
        }
    };

    var match = function (matcher, str) {
        return matcher(str);
    };

    reset();

    return {

        on: function (type, method) {
            if (type) {
                splitType(type, function (name, namespace) {
                    var handler = {
                        method: method,
                        nsmatcher: mkMatch(namespace)
                    };
                    if (registry.hasOwnProperty(name)) {
                        registry[name].push(handler);
                    } else {
                        registry[name] = [handler];
                    }
                });
            }
            return self;
        },

        off: function (type) {
            if (type) {
                splitType(type, function (name, namespace) {
                    if (registry.hasOwnProperty(name)) {
                        if (hasExtraNamespace(name, namespace)) {
                            registry[name] = registry[name].filter(function (handler) {
                                return !match(handler.nsmatcher, namespace);
                            });
                            if (registry[name] === []) delete registry[name];
                        } else {
                            delete registry[name];
                        }
                    }
                });
            } else {
                reset();
            }
            return self;
        },

        trigger: function (type, args) {
            splitType(type, function (name, namespace) {
                if (registry.hasOwnProperty(name)) {
                    registry[name].each(function (handler) {
                        if (match(handler.nsmatcher, namespace)) {
                            handler.method.apply(self, args);
                        }
                    });
                }
            });
            return self;
        }

    };

});


cc.Dispatcher = cc.Class.new(null, 'Dispatcher').Include(cc.Events);

})(cc);

// file: class/attributes.js
(function (cc) {

cc.Attributes = cc.Mixin.new(function (self) {

    var attributes = {};

    var mkChangeEvents = (function () {
        var silenceEvents = {
            saveOldValue: Function.noop,
            saveAndTriggerChange: Function.noop,
            triggerChanges: Function.noop
        };
        var noSilenceEvents = (function () {
            var changes;
            var previous;
            return {
                saveOldValue: function (key) {
                    previous = attributes[key];
                },
                saveAndTriggerChange: function (key, value, extra) {
                    if (previous !== value) {
                        changes[key] = value;
                        self.trigger('change:' + key, [previous, value, extra]);
                    }
                },
                triggerChanges: function (extra) {
                    if (Object.keys(changes).length > 0) {
                        self.trigger('changes', [changes, extra]);
                    }
                },
                reset: function () {
                    changes = {};
                    return this;
                }
            };
        })();
        return function (silence) {
            return silence ? silenceEvents : noSilenceEvents.reset();
        };
    })();

    return {

        get: function (key) {
            return attributes[key];
        },

        set: function (k, v, options) {
            if (!cc.isString(k)) {
                options = v;
                v = undefined;
            }
            options = options || {};
            var extra = options['extra'];

            var changeEvents = mkChangeEvents(options.silence);

            (function (key, value) {
                changeEvents.saveOldValue(key);
                attributes[key] = value;
                changeEvents.saveAndTriggerChange(key, value, extra);
            }.overloadSetter())(k, v);

            changeEvents.triggerChanges(extra);
        },

        toJSON: function () {
            return Object.clone(attributes);
        }

    };

}).Include(cc.Events);

var counter = (function () {
    var i = 0;
    return function () {
        ++i;
        return i;
    };
})();
cc.Model = cc.Class.new(function (self) {
    var id = 'm-' + counter();
    return {
        initialize: function (attrs) {
            self.set(
                cc.isObject(attrs) ? attrs : { value: attrs },
                { silence: true });
        },
        id: function () {
            return id;
        }
    };
}, 'Model').Include(cc.Attributes);

})(cc);

// file: class/collection.js
(function (cc) {

cc.Collection = cc.Class.new(function (self) {

    var array = [];
    var ElemClass;

    return {

        initialize: function (klass) {
            if (cc.isNullOrUndefined(klass)) {
                ElemClass = cc.Model;
            } else if (cc.extendsOf(klass, cc.Model)) {
                ElemClass = klass;
            } else {
                throw 'Need cc.Model but get ' + klass.toString();
            }
        },

        add: function () {
            var ms = Array.from(arguments).map(function (m) {
                if (!cc.instanceOf(m, ElemClass)) {
                    m = ElemClass.new(m);
                }
                return m;
            });
            array.append(ms);
            self.trigger('add', [ms]);
            return self;
        },

        addRange: function (ms) {
            self.add.apply(self, ms);
            return self;
        },

        removeIf: function (predicate) {
            (function (pass, fail) {
                array = fail;
                self.trigger('remove', [pass]);
            }).apply(null, array.partition(predicate));
        },

        remove: function (id) {
            if (cc.instanceOf(id, ElemClass)) {
                id = id.id();
            }
            self.removeIf(function (m) {
                return m.id() === id;
            });
        },

        removeAt: function (i) {
            if (i < array.length) {
                var val = array[i];
                array.splice(i, 1);
                self.trigger('remove', [[val]]);
            }
        },

        empty: function () {
            var bak = array;
            array = [];
            self.trigger('remove', [bak]);
        },

        size: function () {
            return array.length;
        },

        count: function (predicate) {
            if (predicate) {
                return array.filter(predicate).length;
            } else {
                return array.length;
            }
        },

        at: function (i) {
            return array[i];
        },

        find: function (predicate) {
            return array.filter(predicate);
        },

        last: function () {
            return array[array.length - 1];
        },

        each: function (proc) {
            array.each(proc);
            return self;
        },

        sort: function (compareFunction) {
            array.sort(compareFunction);
            self.trigger('shuffle', []);
            return self;
        },

        toJSON: function () {
            return array.map(function (m) {
                return m.toJSON();
            });
        }

    };

}, 'Collection').Include(cc.Events);

})(cc);
