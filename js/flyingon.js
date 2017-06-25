/*
* flyingon javascript library v0.0.1.0
* https://github.com/freeoasoft/flyingon
*
* Copyright 2014, yaozhengyang
* licensed under the LGPL Version 3 licenses
*/



//启用严格模式
'use strict';



//定义全局变量
var flyingon;


//基础api扩展
(function(fn) {
  
    
    if (typeof require === 'function' && typeof module === 'object' && module) //兼容cmd
    {
        fn(module.exports = flyingon = {});
    }
    else if (typeof define === 'function' && define.amd) //兼容amd
    {  
        flyingon = {};

        define(function (require, exports, module) {

            fn(module.exports = flyingon);
        });
    }
    else //普通浏览环境
    {
        fn(flyingon = window.flyingon || (window.flyingon = {}));  
    }


})(function (flyingon) {
    
    
    //版本号
    flyingon.version = '1.0.1';



    //空函数
    function fn() {};
        
        
    //以指定原型创建对象
    flyingon.create = Object.create || function (prototype) {

        if (prototype)
        {
            fn.prototype = prototype;
            return new fn();
        }

        return {};
    };


    //复制源对象成员至目标对象
    flyingon.extend = function extend(target, source, deep) {

        var index = arguments.length - 1,
            item;
            
        target = target || {};
        
        if (arguments[index] === true)
        {
            deep = true;
            index--;
        }

        while (index > 0 && (item = arguments[index--]))
        {
            if (deep)
            {
                for (var name in item)
                {
                    var value = item[name];
                    
                    if (value && typeof value === 'object')
                    {
                        target[name] = extend(target[name], value, true);
                    }
                    else
                    {
                        target[name] = value;
                    }
                }
            }
            else
            {
                for (var name in item)
                {
                    target[name] = item[name];
                }
            }
        }

        return target;
    };
        

    //循环处理
    flyingon.each = function (values, fn, context) {

        if (values)
        {
            if (typeof values === 'string')
            {
                values = values.match(/\w+/g);
            }

            for (var i = 0, l = values.length; i < l; i++)
            {
                fn.call(context || flyingon, values[i], i);
            }
        }
    };


    //编码对象
    flyingon.encode = function encode(data) {

        if (!data)
        {
            return '';
        }

        var list = [],
            fn = encodeURIComponent,
            value,
            any;

        for (var name in data)
        {
            value = data[name];
            name = fn(name);

            if (value === null)
            {
                list.push(name, '=null', '&');
                continue;
            }

            switch (typeof value)
            {
                case 'undefined':
                    list.push(name, '=&');
                    break;

                case 'boolean':
                case 'number':
                    list.push(name, '=', value, '&');
                    break;

                case 'string':
                case 'function':
                    list.push(name, '=', fn(value), '&');
                    break;

                default:
                    if (value instanceof Array)
                    {
                        for (var i = 0, l = value.length; i < l; i++)
                        {
                            if ((any = value[i]) === void 0)
                            {
                                list.push(name, '=&');
                            }
                            else
                            {
                                list.push(name, '=', fn(any), '&'); //数组不支持嵌套
                            }
                        }
                    }
                    else
                    {
                        list.push(name, '=', encode(value), '&');
                    }
                    break;
            }
        }

        list.pop();
        return list.join('');
    };
    
    

});

  

//模块,类,属性及事件
(function (flyingon) {
    

    
    var create = flyingon.create,
        
        extend = flyingon.extend,

        components = flyingon.components || (flyingon.components = create(null)), //已注册所有组件类型集合
    
        anonymous = 1,
        
        modules = create(null), //模块集合

        module_stack = [], //模块栈

        module_current; //当前模块
    

    
    //模块名
    flyingon.moduleName = 'flyingon';


    //设置默认模块
    modules.flyingon = flyingon;



    //使用指定模块
    flyingon.use = function (name) {
        
        switch (typeof name)
        {
            case 'string':
                return parse_module(name);

            case 'object':
                return name || flyingon;
        }
        
        return flyingon; 
    };


    //定义或切换模块
    flyingon.defineModule = function (name, callback) {

        var item, fn;

        //生成模块
        switch (typeof name)
        {
            case 'string':
                item = parse_module(name);
                break;
                
            case 'function':
                item = flyingon;
                callback = name;
                break;

            case 'object':
                item = name || flyingon;
                
            default:
                item = flyingon;
                break;
        }

        //处理回调
        if (typeof callback === 'function')
        {
            //如果正在动态加载脚本或还有依赖的js没有加载完成则先注册 否则立即执行
            if (!(fn = flyingon.require) || 
                !(fn = fn.callback) || 
                !fn(load_module, [item, callback]))
            {
                load_module(item, callback);
            }
        }
        else
        {
            module_stack.push(module_current = item);
        }

        return item;
    };

    
    //结束当前模块
    flyingon.endModule = function () {
        
        var stack = module_stack;
        
        stack.pop();
        return module_current = stack[stack.length - 1] || flyingon;
    };

  
    //解析模块
    function parse_module(name) {
            
        var keys = modules,
            list, 
            item,
            any;

        if (item = keys[name])
        {
            return item;
        }

        if (list = name.match(/\w+/g))
        {
            item = module_stack[module_stack.length - 1] || keys;

            for (var i = 0, l = list.length; i < l; i++)
            {
                if (any = item[name = list[i]])
                {
                    item = any;
                }
                else
                {
                    any = (any = item.moduleName) ? any + '.' + name : name;
                    item = keys[any] = item[name] = create(null);
                    item.moduleName = any;
                }
            }

            return item;
        }

        throw 'module name can use only letters and numbers!';
    };


    //执行模块函数
    function load_module(target, callback) {

        try
        {
            //记录当前模块
            module_stack.push(module_current = target);
            callback.call(target, target, flyingon);
        }
        finally
        {
            flyingon.endModule();
        }
    };

    

    //混入源对象成员成目标对象
    flyingon.mixin = function (target, source) {

        var item;

        if (source && target)
        {
            for (var i = 1, l = arguments.length; i < l; i++)
            {
                if (item = arguments[i])
                {
                    mixin(target, item.prototype || item);
                }
            }
        }
    };



    //定义功能片段方法(内部方法,不推荐用户使用)
    flyingon.fragment = function (fn, property) {
                
        var prototype = create(null);
        
        property && (prototype.defineProperty = defineProperty);
        
        fn.call(prototype);
        
        fn = function (target) {

            mixin(target, prototype);
        };
      
        fn.prototype = prototype;

        //类型标记
        prototype[fn.xtype = 'anonymous-type-' + anonymous++] = true;
        return fn;
    };
    
           

    //执行对象属性观测
    flyingon.__do_watch = function (target, name, value, oldValue) {

        var keys = target.__watch_keys,
            e = { target: target, name: name, newValue: value, oldValue: oldValue },
            any;

        for (var i = 0, l = keys.length; i < l; i++)
        {
            if ((any = keys[i++]) != null)
            {
                if (any === name)
                {
                    keys[i].call(target, e);
                }
            }
            else
            {
                keys[i].call(target, e);
            }
        }
    };




    //定义类方法
    //name:             类名称,省略即创建匿名类型(匿名类型不支持自动反序列化)
    //superclass:       父类
    //fn:               类代码, 函数, 参数(base:父类原型, self:当前类原型)
    //property:         是否支持属性, 默认支持, 可以从非属性类继承生成非属性类, 不能从属性类继承生成非属性类
    flyingon.defineClass = function (name, superclass, fn, property) {


        var Class, base, prototype, module, xtype, any;

        
        //处理参数
        if (typeof name !== 'string') //不传name则创建匿名类
        {
            property = fn;
            fn = superclass;
            superclass = name;
            name = null;
        }
        else if (!/^[A-Z]\w*$/.test(name))
        {
            throw 'class name can use only letters and numbers and begin with a upper letter!';
        }

        if (typeof fn !== 'function')
        {
            if (typeof superclass === 'function')
            {
                property = fn;
                fn = superclass;
                superclass = Object;
            }
            else
            {
                throw 'class fn must be a function!';
            }
        }
        else if (!superclass || typeof superclass !== 'function') //处理父类
        {
            superclass = Object;
        }
        
        
        //创建原型
        prototype = create(base = superclass.prototype || Object.prototype);

        //设置base属性
        prototype.base = base;


        //父类不是flyingon类
        any = !base.__flyingon_class;

        //如果未指定property则看父类是否flyingon类
        if (property == null)
        {
            property = any;
        }

        
        //如果指定要生成属性或父类支持属性则处理属性相关功能
        if (property || base.__defaults)
        {
            //生成默认值集合
            prototype.__defaults = create(base.__defaults || null);

            //生成属性集合
            prototype.__properties = create(base.__properties || null);
            
            //父类不是flyingon类则生成属性相关方法
            if (any)
            {
                prototype.defineProperty = defineProperty;
                prototype.get = get;
                prototype.set = set;
                prototype.sets = sets;
                prototype.defaultValue = defaultValue;
                prototype.properties = properties;
                prototype.getOwnPropertyNames = getOwnPropertyNames;
                prototype.watch = watch;
                prototype.unwatch = unwatch;
            }
        }
        
            
        //父类不是flyingon类则生成事件相关方法
        if (any)
        {
            prototype.__flyingon_class = true;

            prototype.on = on;
            prototype.once = once;
            prototype.suspend = suspend;
            prototype.resume = resume;
            prototype.off = off;
            prototype.trigger = trigger;
            prototype.clone = clone;
            prototype.is = is;
            prototype.toString = toString;
            prototype.dispose = dispose;
        }
        
    
        //获取当前模块
        module = module_current || flyingon;

        //xtype
        xtype = name ? module.moduleName + '-' + name : 'anonymous-type-' + anonymous++;
        
        //类型标记
        prototype[xtype] = true;


        //记录原构造函数
        any = base.constructor;

        //执行扩展
        fn.call(prototype, base, prototype);

        //检测是否有自定义构造函数
        if ((Class = prototype.constructor) && Class !== any)
        {
            prototype.__constructor_base = Class; //自定义函数标记
        }
        else if (base.__constructor_base)
        {
            Class = function () {

                this.__constructor_base.apply(this, arguments);
            };
        }
        else
        {
            Class = function () {};
        }


        //获取当前类型
        prototype.Class = prototype.constructor = Class;

        
        //初始化静态成员
        if ((any = prototype.statics) && any !== base.statics)
        {
            for (var key in any)
            {
                Class[key] = any[key];
            }
        }

     
        //注册类型(匿名类不注册)
        if (name)
        {
            //类名
            Class.typeName = name;

            //输出及注册类
            module[name] = components[xtype] = Class;
        }
        

        //类全名
        Class.xtype = xtype;
        
        //类原型
        Class.prototype = prototype;

        //所属模块
        Class.module = module;

        //父类
        Class.superclass = superclass;

        //设置组件别名
        Class.register = register;


        //初始化类
        if (any = prototype.__class_init)
        {
            any.call(prototype, Class, base, prototype);
        }
        

        //返回当前类型
        return Class;
    };
    

    //检测当前对象是否指定类型
    function is(type) {

        return type && (this instanceof type || ((type = type.xtype) && this[type]));
    };


    //默认toString方法
    function toString() {

        return '[object ' + this.xtype + ']';
    };
    

    //定义属性及set_XXX方法
    function defineProperty(name, defaultValue, attributes) {

        var any;

        if (!/^[a-z][\w$]*$/.test(name))
        {
            throw 'property name "' + name + '" is not legal!';
        }

        if (attributes)
        {
            attributes.name = name;
        }
        else
        {
            attributes = { name: name };
        }
     
        //处理默认值
        if (typeof defaultValue === 'function')
        {
            attributes.fn = defaultValue;
            attributes.defaultValue = defaultValue = null;
        }
        else
        {
            attributes.defaultValue = defaultValue;
        }
      
        (this.__defaults || (this.__defaults = create(null)))[name] = defaultValue;
        (this.__properties|| (this.__properties = create(null)))[name] = attributes;
        
        //根据默认值生成数据类型
        if (!(any = attributes.dataType))
        {
            any = attributes.dataType = typeof defaultValue;
        }
        
        //如未直接设置函数则创建按需加载属性以提升初始化性能
        this[name] = attributes.fn || property_fn.call(this, name, any, attributes.check, attributes.set);
        
        //扩展至选择器
        if (any = this.__selector_extend)
        {
            (any.prototype || any)[name] = selector_extend(name);
        }
    };
    

    function property_fn(key, dataType, check, set) {

        return function (value) {

            var storage = this.__storage,
                name = key,
                any = (storage || this.__defaults)[name];

            if (value === void 0)
            {
                return any;
            }

            //基本类型转换(根据默认值的类型自动转换)
            switch (dataType)
            {
                case 'boolean':
                    value = !!value && value !== 'false';
                    break;

                case 'integer':
                    value = value | 0;
                    break;

                case 'number':
                    value = +value || 0;
                    break;

                case 'string':
                    value = '' + value;
                    break;

                case 'date':
                    value ? value instanceof Date || (value = new Date(value)) : (value = null);
                    break;
            }

            if (check)
            {
                value = check.call(this, value)
            }

            if (any !== value)
            {
                if (this.__watch_keys && flyingon.__do_watch(this, name, value, any) === false)
                {
                    return this;
                }

                (storage || (this.__storage = create(this.__defaults)))[name] = value;

                if (set)
                {
                    set.call(this, value);
                }

                if ((any = this.__bind_keys) && (name = any[name]))
                {
                    this.pushBack(name, value);
                }
            }

            return this;
        };
    };


    //扩展至选择器
    function selector_extend(name) {
      
        return function (value) {
              
            var index = 0,
                key = name,
                item,
                fn;

            if (value === void 0)
            {
                while (item = this[index++])
                {
                    if (fn = item[key])
                    {
                        return fn.call(item);
                    }
                }
            }

            while (item = this[index++])
            {
                if (fn = item[key])
                {
                    fn.apply(item, arguments);
                }
            }
            
            return this;
        };
    };
        
            
    //获取指定名称的属性值
    function get(name) {
      
        var any;

        if ((any = (this.__storage || this.__defaults)[name]) !== void 0)
        {
            return any;
        }

        if (any = this.__custom_get)
        {
            return any.call(this, name);
        }
    };
    
    
    //设置指定名称的属性值
    function set(name, value) {
        
        var fn;

        if (this.__properties[name])
        {
            this[name](value);
        }
        else if (fn = this.__custom_set)
        {
            fn.call(this, name, value);
        }
        else
        {
            (this.__storage || (this.__storage = create(this.__defaults)))[name] = value;
        }
        
        return this;
    };


    //批量设置属性值
    function sets(values) {
        
        if (values)
        {
            var properties = this.__properties,
                fn;

            for (var name in values)
            {
                if (properties[name])
                {
                    this[name](values[name]);
                }
                else if (fn = this.__custom_set)
                {
                    fn.call(this, name, values[name]);
                }
                else
                {
                    (this.__storage || (this.__storage = create(this.__defaults)))[name] = values[name];
                }
            }
        }

        return this;
    };
    

    //获取或设置属性默认值
    function defaultValue(name, value) {

        var defaults = this.__defaults;

        if (value === void 0)
        {
            return defaults[name];
        }

        defaults[name] = value;
        defaults = this.__properties;
        
        (defaults[name] = flyingon.extend({}, defaults[name])).defaultValue = value;
                
        return this;
    };


    //获取属性值集合
    function properties(deep, filter) {

        var keys = this.__properties,
            items = [],
            item;
        
        if (typeof deep === 'function')
        {
            filter = deep;
        }
        
        deep = deep === false ? this.base.__properties : null;
            
        for (var name in keys)
        {
            if ((item = keys[name]) && 
                (!deep || deep[name] !== item) && 
                (!filter || filter(item)))
            {
                items.push(item);
            }
        }

        return items;
    };


    //观测属性变更
    function watch(name, fn) {

        var any;

        if (!fn)
        {
            fn = name;
            name = null;
        }
        
        if (typeof fn === 'function')
        {
            if (any = this.__watch_keys)
            {
                any.push(name, fn);
            }
            else
            {
                this.__watch_keys = [name, fn];
            }
        }
    };


    //取消属性变更观测
    function unwatch(name, fn) {

        var list, index;

        if (!fn)
        {
            fn = name;
            name = null;
        }

        if (fn && (list = this.__watch_keys))
        {
            index = list.length - 1;

            while (index >= 0)
            {
                if (list[index--] === fn && list[index--] === name)
                {
                    list.splice(index - 2, 2);
                }
            }

            if (!list.length)
            {
                delete this.__watch_keys;
            }
        }
    };

    
    
    //绑定事件处理 注:type不带on
    function on(type, fn, tag) {

        if (type && typeof fn === 'function')
        {
            var events = this.__events || (this.__events = create(null));

            if (tag && tag > 0)
            {
                fn.tag = tag;
            }
            
            (events[type] || (events[type] = [])).push(fn);
        }

        return this;
    };

    
    //只执行一次绑定的事件
    function once(type, fn, tag) {

        var self = this;

        function callback() {

            fn.apply(self, arguments);
            self.off(type, callback);
        };

        return this.on(type, callback, tag);
    };

    
    //暂停事件处理
    function suspend(type) {

        var events = this.__events;

        if (events = events && events[type])
        {
            events.unshift(suspend_fn);
        }

        return this;
    };

    
    //继续事件处理
    function resume(type) {

        var events = this.__events;

        if ((events = events && events[type]) && events[0] === suspend_fn)
        {
            events.shift();
        }

        return this;
    };

    
    //挂起方法
    function suspend_fn(e) {

        e.cancelBubble = true;
    };

    
    //移除事件处理
    function off(type, fn) {

        var events = this.__events,
            items;

        if (events)
        {
            if (!fn && type > 0) //注销指定tag的事件
            {
                for (var type in events)
                {
                    items = events[type];

                    for (var i = items.length - 1; i >= 0; i--)
                    {
                        if (items[i].tag === type)
                        {
                            items.splice(i, 1);
                        }
                    }

                    if (!items.length)
                    {
                        items[type] = null;
                    }
                }
            }
            else if (type)
            {
                if (fn)
                {
                    if (items = events[type])
                    {
                        for (var i = items.length - 1; i >= 0; i--)
                        {
                            if (items[i] === fn)
                            {
                                items.splice(i, 1);
                            }
                        }

                        if (!items.length)
                        {
                            events[type] = null;
                        }
                    }
                }
                else if (events[type])
                {
                    events[type] = null;
                }
            }
            else
            {
                for (var type in events)
                {
                    this.off(type);
                }

                this.__events = null;
            }
        }

        return this;
    };

    
    //分发事件
    function trigger(e) {

        var type = e.type || (e = new flyingon.Event(e)).type,
            index = 1,
            start,
            target,
            events,
            length,
            fn;

        e.target = this;
        
        //初始化自定义参数
        while (start = arguments[index++])
        {
            e[start] = arguments[index++];
        }

        start = target = flyingon;
        
        do
        {
            if ((events = target.__events) && (events = events[type]) && (length = events.length))
            {
                index = 0;
                
                do
                {
                    if ((fn = events[index++]) && !fn.disabled)
                    {
                        if (fn.call(target, e) === false)
                        {
                            e.defaultPrevented = true;
                        }

                        if (e.cancelBubble)
                        {
                            return !e.defaultPrevented;
                        }
                    }
                }
                while (index < length);
            }
            
            if (start !== target)
            {
                target = (fn = target.eventBubble) && target[fn];
            }
            else if (start !== this)
            {
                target = this;
            }
            else
            {
                break;
            }
        }
        while (target);

        return !e.defaultPrevented;
    };


    //获取自身属性值集合(不包含默认值)
    function getOwnPropertyNames() {
        
        var storage = this.__storage,
            defaults,
            any;

        if (storage)
        {
            if (any = Object.getOwnPropertyNames)
            {
                return any(storage);
            }

            defaults = this.__defaults;
            any = [];

            for (var name in storage)
            {
                if (storage[name] !== defaults[name])
                {
                    any.push(name);
                }
            }

            return any;
        }

        return [];
    };


    //以当前对象的参照复制生成新对象
    function clone() {

        var target = new this.Class(),
            storage = this.__storage,
            names,
            name;

        if (storage)
        {
            target.__storage = create(this.__defaults);
            names = this.getOwnPropertyNames();

            for (var i = 0, l = names.length; i < l; i++)
            {
                target[name = names[i]](stroage[name], false);
            }
        }

        return target;
    };
    

    //销毁对象
    function dispose() {

        if (this.__events)
        {
            this.off();
        }

        return this;
    };
    

    //混入
    function mixin(target, source) {
        
        for (var name in source)
        {
            switch (name)
            {
                case '__defaults': //默认值
                case '__properties': //属性集
                    extend(target[name] || (target[name] = create(null)), source[name]);
                    break;

                case 'constructor':
                case 'Class':
                case 'base':
                    break;

                default:
                    target[name] = source[name];
                    break;
            }
        }
    };
        

    //设置组件别名
    function register(name, force) {
    
        if (name)
        {
            if (!force && components[name])
            {
                throw 'component "' + name + '" has exist';
            }

            return components[this.nickName = name] = this;
        }

        return this;
    };
     

    
    //输出全局事件方法
    flyingon.on = on;
    flyingon.off = off;
    flyingon.once = once;
    flyingon.suspend = suspend;
    flyingon.resume = resume;
    flyingon.trigger = trigger;
    
    

})(flyingon);



//事件基类
flyingon.Event = flyingon.defineClass(function () {

    
    
    this.constructor = function (type) {

        this.type = type;
    };
    
    
    
    //事件类型
    this.type = null;


    //触发事件目标对象
    this.target = null;


    //是否取消冒泡
    this.cancelBubble = false;

    
    //是否阻止默认动作
    this.defaultPrevented = false;


    //阻止事件冒泡
    this.stopPropagation = function () {

        this.cancelBubble = true;
        
        if (arguments[0] !== false && this.original_event)
        {
            this.original_event.stopPropagation();
        }
    };


    //禁止默认事件
    this.preventDefault = function () {

        this.defaultPrevented = true;
        
        if (arguments[0] !== false && this.original_event)
        {
            this.original_event.preventDefault();
        }
    };


    //阻止事件冒泡及禁止默认事件
    this.stopImmediatePropagation = function () {

        this.cancelBubble = this.defaultPrevented = true;
        
        if (arguments[0] !== false && this.original_event)
        {
            this.original_event.stopImmediatePropagation();
        }
    };

    
    
}, false);





//html编码函数
flyingon.html_encode = (function () {
    
    var create = flyingon.create,
        storage = create(null),
        map = create(null);

    map['&'] = '&amp;';
    map['<'] = '&lt;';
    map['>'] = '&gt;';
    map['\''] = '&apos;';
    map['"'] = '&quot;';

    function encode(text, cache) {

        var any;

        if (text && typeof text !== 'string' && (any = +text) !== any)
        {
            if (cache && (any = storage[text]))
            {
                return any;
            }

            any = map;

            any = text.replace(/([&<>'"])/g, function (_, key) {

                return any[key];
            });

            return cache ? (storage[text] = any) : any;
        }

        return '' + text;
    };

    return encode;

})();



flyingon.parseJSON = typeof JSON !== 'undefined' 

    ? function (text) {

        return JSON.parse(text);
    }

    : function (text) {

        if (typeof text === 'string')
        {
            if (/[a-zA-Z_$]/.test(text.replace(/"(?:\\"|[^"])*?"|null|true|false|\d+[Ee][-+]?\d+/g, '')))
            {
                throw 'json parse error!';
            }

            return new Function('return ' + text)();
        }

        return text;
    };




//异步处理类
flyingon.Async = flyingon.defineClass(function () {


    
    //延时
    this.sleep = function (time, done, fail) {
        
        if (done !== false || fail !== false)
        {
            var fn = function (value) {

                var as = new flyingon.Async();

                setTimeout(function () {

                    as.resolve(value);
                    as = null;

                }, time | 0);

                return as;
            };
            
            done = done !== false ? 1 : 0;
            
            if (fail !== false)
            {
                done += 2;
            }

            return registry(this, false, fn, done);
        }
                            
        return this;
    };
    
       
    //注册成功执行函数或异步通知
    this.done = function (asyn, fn) {

        return registry(this, asyn, fn, 1);
    };


    //注册执行失败函数或异步通知
    this.fail = function (asyn, fn) {

        return registry(this, asyn, fn, 2);
    };
    
    
    //注册执行完毕函数或异步通知
    this.complete = function (asyn, fn) {
        
        return registry(this, asyn, fn, 3);
    };


    //注册回调函数
    function registry(self, asyn, fn, state) {

        if (!fn)
        {
            fn = asyn;
            asyn = false;
        }
        
        if (fn)
        {
            var list = self.__list || (self.__list = []);

            list.push([asyn, fn, state, 0]);

            if (self.__state)
            {
                check_done(self);
            }
        }
        
        return self;
    };
    
    
    //成功执行通知
    this.resolve = function (value) {

        return complete(this, 1, value);
    };


    //失败执行通知
    this.reject = function (error, bubble) {
        
        this.bubble = bubble; //是否向上冒泡
        return complete(this, 2, void 0, error);
    };
    
        
    function complete(self, state, value, error) {
        
        var list = self.__list;
        
        self.__state = state;
        self.__value = value;
        self.__error = error;
        
        check_done(self);

        return self;
    };
        

    //检测是否完结
    function check_done(self) {
      
        var list = self.__list,
            index = 0,
            item,
            as;

        if (list)
        {
            while (item = list[index++])
            {
                //同步阻塞则退出
                if (!item[0] && (index > 1 || item[3]))
                {
                    return;
                }
                
                //异步等待且正在等待异步返回则继续处理下一条
                if (item[3])
                {
                    continue;
                }
                
                //执行
                if (typeof (as = item[1]) === 'function')
                {
                    try
                    {
                        switch (item[2])
                        {
                            case 1:
                                as = self.__state === 1 && as.call(self, self.__value);
                                break;
                                
                            case 2:
                                as = self.__state === 2 && as.call(self, self.__error);
                                break;
                                
                            case 3:
                                as = as.call(self, self.__value, self.__error);
                                break;
                        }
                    }
                    catch (e) //执行出错先移除当前项然后继续错误处理
                    {
                        self.__state = 2;
                        self.__error = e;
                        
                        //清除出错前的所有项
                        list.splice(0, index);
                        index = 0;
                        
                        continue;
                    }
                }
                
                //如果执行结果是异步
                if (as && as['flyingon.Async'] && !as.__state)
                {
                    //标记正在等待异步返回
                    item[3] = 1;
                    (as.__back_list || (as.__back_list = [])).push(list, item, self);
                }
                else
                {
                    list.splice(--index, 1);
                }
            }
            
            if (list.length > 0)
            {
                return;
            }
            
            index = 0;
        }
        
        //回溯检测
        if (list = self.__back_list)
        {
            while (item = list[index++])
            {
                item.splice(item.indexOf(list[index++]), 1);
                item = list[index++];
                
                //如果失败且未停止冒泡则向上传递错误信息
                if (self.__error && self.bubble)
                {
                    item.__state = 2;
                    item.__error = self.__error;
                }
                
                check_done(item);
            }
            
            list.length = 0;
            self.__back_list = null;
        }
    };
    

    
    //注册执行进度函数
    this.progress = function (fn) {

        if (typeof fn === 'function')
        {
            (this.__progress || (this.__progress = [])).push(fn);
        }
        
        return this;
    };


    //执行进度通知
    this.notify = function (value) {

        var list = this.__progress;
        
        if (list)
        {
            for (var i = 0, l = list.length; i < l; i++)
            {
                list[i].call(this, value);
            }
        }
        
        return this;
    };
    
    
});

    

//异步延时处理
flyingon.delay = function (delay, fn) {

    var as = new flyingon.Async();

    setTimeout(function () {

        if (typeof fn === 'function')
        {
            fn.call(as);
            fn = null;
        }
        else
        {
            as.resolve();
        }

        as = null;

    }, delay | 0);

    return as;
};




//扩展数组方法
(function () {



    this.indexOf || (this.indexOf = function (item, index) {

        if ((index |= 0) < 0)
        {
            return -1;
        }

        var length = this.length;

        while (index < length)
        {
            if (this[index] === item)
            {
                return index;
            }

            index++;
        }

        return -1;
    });


    this.lastIndexOf || (this.lastIndexOf = function (item, index) {

        if ((index |= 0) > 0)
        {
            return -1;
        }

        if (!index)
        {
            if (arguments.length > 1)
            {
                return -1;
            }

            index = -1;
        }

        index += this.length;

        while (index >= 0)
        {
            if (this[index] === item)
            {
                return index;
            }

            index--;
        }

        return -1;
    });


    this.forEach || (this.forEach = function (fn) {

        var context = arguments[1];

        for (var i = 0, l = this.length; i < l; i++)
        {
            fn.call(context, this[i], i, this);
        }
    });


    this.map || (this.map = function (fn) {

        var context = arguments[1],
            length = this.length,
            list = new Array(length);

        for (var i = 0; i < length; i++)
        {
            list[i] = fn.call(context, this[i], i, this);
        }

        return list;
    });


    this.filter || (this.filter = function (fn) {

        var context = arguments[1],
            list = [];

        for (var i = 0, l = this.length; i < l; i++)
        {
            if (fn.call(context, this[i], i, this))
            {
                list.push(this[i]);
            }
        }

        return list;
    });


    this.some || (this.some = function (fn) {

        var context = arguments[1];

        for (var i = 0, l = this.length; i < l; i++)
        {
            if (fn.call(context, this[i], i, this))
            {
                return true;
            }
        }

        return false;
    });


    this.every || (this.every = function (fn) {

        var context = arguments[1];

        for (var i = 0, l = this.length; i < l; i++)
        {
            if (!fn.call(context, this[i], i, this))
            {
                return false;
            }
        }

        return true;
    });


    this.reduce || (this.reduce = function (fn) {

        var value = arguments[1],
            index = 0, 
            length = this.length;

        if (value === void 0)
        {
            value = this[0];
            index = 1;
        }
        
        while (index < length)
        {
            value = fn(value, this[index], index++, this);
        }

        return value;
    });


    this.reduceRight || (this.reduceRight = function (fn) {

        var value = arguments[1],
            index = this.length - 1;

        if (value === void 0)
        {
            value = this[index--];
        }
        
        while (index >= 0)
        {
            value = fn(value, this[index], index--, this);
        }

        return value;
    });
  


}).call(Array.prototype);




Function.prototype.bind || (Function.prototype.bind = function (context) {

    var fn = this;

    if (arguments.length > 1)
    {
        var list = [].slice.call(arguments, 1),
            push = list.push;

        return function () {

            var data = list.slice(0);

            if (arguments.length > 0)
            {
                push.apply(data, arguments);
            }

            return fn.apply(context || this, data);
        };
    }

    return function () {

        return fn.apply(context || this, arguments);
    };
});




//序列化组件片段
flyingon.__serialize_fragment = flyingon.fragment(function () {
    
    
    
       
    //设置不序列化type属性
    this.deserialize_type = true;
    
    
    
    //序列化方法
    this.serialize = function (writer) {

        var any;
        
        if ((any = this.Class) && (any = any.nickName || any.xtype))
        {
            writer.writeProperty('xtype', any);
        }
        
        if (any = this.__storage)
        {
            writer.writeProperties(any, this.getOwnPropertyNames(), this.__bind_keys);
        }

        if ((any = this.__style_list) && (any = any.text))
        {
            writer.writeProperty('style', any);
        }
    };
    
        
    //反序列化方法
    this.deserialize = function (reader, values) {

        var bind = this.addBind,
            value,
            any;
        
        for (var name in values)
        {
            value = values[name];
            
            if (bind && typeof value === 'string' && (any = value.match(/^\{\{(\w+)\}\}$/)))
            {
                bind.call(this, name, any[1]);
            }
            else if (any = this['deserialize_' + name])
            {
                if (any !== true)
                {
                    any.call(this, reader, value);
                }
            }
            else
            {
                this.set(name, value, false);
            }
        }
    };



});



//读序列化类
flyingon.SerializeReader = flyingon.defineClass(function () {

    

    var components = flyingon.components;
    
    var Array = window.Array;
    
    

    this.deserialize = function (data) {

        if (data)
        {
            if (typeof data === 'string')
            {
                data = JSON.parse(data);
            }

            if (typeof data === 'object')
            {
                data = data instanceof Array ? this.readArray(data) : this.readObject(data);
                this.all = this.callback = null;
            }
        }

        return data;
    };


    this.read = function (data) {

        if (data && typeof data === 'object')
        {
            return data instanceof Array ? this.readArray(data) : this.readObject(data);
        }

        return data;
    };


    this.readArray = function (data) {

        if (data)
        {
            var array = [];

            for (var i = 0, l = data.length; i < l; i++)
            {
                array.push(this.read(data[i]));
            }

            return array;
        }

        return null;
    };


    this.readObject = function (data, type) {

        if (data)
        {
            var target, id;

            if (type)
            {
                if ((target = new type()).deserialize)
                {
                    target.deserialize(this, data);
                    
                    if (id = data.id)
                    {
                        read_reference.call(this, target, id);
                    }
                }
                else
                {
                    this.readProperties(target, data); 
                }
            }
            else if ((type = data.xtype) && (type = components[type]))
            {
                (target = new type()).deserialize(this, data);
                
                if (id = data.id)
                {
                    read_reference.call(this, target, id);
                }
            }
            else
            {
                this.readProperties(target = {}, data); 
            }
            
            return target;
        }

        return null;
    };
    
    
    function read_reference(target, id) {
        
        var list = this.callback;
        
        (this.all || (this.all = {}))[id] = target;

        if (list && (list = list[id]))
        {
            for (var i = 0, l = list.length; i < l; i++)
            {
                list[i](target);
            }

            list[id] = target = null;
        }
    };

    
    this.readProperties = function (target, data) {
      
        for (var name in data)
        {
            target[name] = this.read(data[name]);
        }
    };
    
    
    this.readReference = function (name, callback) {
      
        var all = this.all,
            any;
        
        if (all && (any = all[name]))
        {
            callback(any);
        }
        else if (any = this.callback)
        {
            (any[name] || (any[name] = [])).push(callback);
        }
        else
        {
            (this.callback = {})[name] = [callback];
        }
    };
      
    
    this.__class_init = function (Class) {
    
        var reader = Class.instance = new Class();

        Class.deserialize = function (values) {

            return reader.deserialize(values);
        };
    };
    

}, false);



//写序列化类
flyingon.SerializeWriter = flyingon.defineClass(function () {


    
    var Array = window.Array;
    
    var id = 1;
    
    
    
    this.serialize = function (value) {

        if (value && typeof value === 'object')
        {
            var data = this.data = [];
            
            if (value instanceof Array)
            {
                this.writeArray(value);
            }
            else
            {
                this.writeObject(value);
            }

            data.pop();
            
            return data.join('');
        }
        
        return '' + value;
    };


    this.write = function (value) {

        if (value != null)
        {
            switch (typeof value)
            {
                case 'boolean':
                    this.data.push(value ? true : false, ',');
                    break;

                case 'number':
                    this.data.push(+value || 0, ',');
                    break;

                case 'string':
                    this.data.push('"', value.replace(/"/g, '\\"'), '"', ',');
                    break;
                    
                case 'function':
                    this.data.push('"', ('' + value).replace(/"/g, '\\"'), '"', ',');
                    break;

                default:
                    if (value instanceof Array)
                    {
                        this.writeArray(value);
                    }
                    else
                    {
                        this.writeObject(value);
                    }
                    break;
            }
        }
        else
        {
            this.data.push(null, ',');
        }
    };


    this.writeArray = function (value) {

        var data = this.data,
            length;
        
        if (value != null)
        {
            if ((length = value.length) > 0)
            {
                data.push('[');
                
                for (var i = 0; i < length; i++)
                {
                    this.write(value[i]);
                }
                
                data.pop();
                data.push(']', ',');
            }
            else
            {
                data.push('[]', ',');
            }
        }
        else
        {
            data.push(null, ',');
        }
    };


    this.writeObject = function (value) {

        var data = this.data;
        
        if (value != null)
        {
            data.push('{');

            if (value.serialize)
            {
                value.serialize(this);
            }
            else
            {
                for (var name in value)
                {
                    data.push('"', name, '":');
                    this.write(value[name]);
                }
            }

            data.push(data.pop() === ',' ? '}' : '{}', ',');
        }
        else
        {
            data.push(null, ',');
        }
    };


    this.writeProperties = function (storage, names, bind) {

        var data = this.data,
            name,
            any;
        
        for (var i = 0, l = names.length; i < l; i++)
        {
            name = names[i];
            
            if (bind && (any = bind[name]))
            {
                data.push('"', name, '":"{{', any.replace(/"/g, '\\"'),'}}"', ',');
            }
            else
            {
                data.push('"', name, '":');
                this.write(storage[name]);
            }
        }
    };
    
    
    this.writeProperty = function (name, value) {
      
        if (name)
        {
            this.data.push('"', name, '":');
            this.write(value);
        }
    };
    
    
    this.writeReference = function (name, value) {
        
        if (name && value)
        {
            var id = value.id;
            
            if (id && typeof id === 'function')
            {
                id = id();
            }
            
            this.data.push('"', name, '":', id || ('__auto_id_' + id++));
        }
    };

    
        
    this.__class_init = function (Class) {
    
        var writer = Class.instance = new Class();

        Class.serialize = function (value) {

            return writer.serialize(value);
        };
    };
    

}, false);




//行集合类
flyingon.RowCollection = flyingon.defineClass(function () {
    

    //记录数
    this.length = 0;


    //获取指定行索引的数据行
    this.at = function (index) {
        
        return this[index] || null;
    };
    
    
    //查找数据行
    this.find = function (filter) {
    
        var list = new flyingon.RowCollection(),
            index = 0,
            length = this.length,
            row;
        
        for (var i = 0; i < length; i++)
        {
            if ((row = this[i]) && (!filter || filter(row)))
            {
                list[index++] = row;
            }
        }
        
        list.length = index;
        return list;
    };
    
        
    //查找所有下级行
    this.findAll = function (filter) {

        var list = arguments[1] || new flyingon.RowCollection(),
            row;
        
        for (var i = 0, l = this.length; i < l; i++)
        {
            if ((row = this[i]) && (!filter || filter(row)))
            {
                list[list.length++] = row;
            }
            
            if (row.length > 0)
            {
                row.findAll(filter, list);
            }
        }
        
        return list;
    };
    
            
    this.toJSON = function (changed, names) {
        
        var writer = ['['],
            row,
            data,
            tag,
            any;
        
        if (changed && names)
        {
            if (typeof names === 'string')
            {
                names = names.match(/\w+/g);
            }
            
            names = names && names.length > 0 ? new RegExp('^(' + names.join('|') + ')$', 'i') : null;
        }
        
        for (var i = 0, l = this.length; i < l; i++)
        {
            if ((row = this[i]) && (data = row.data))
            {
                if (tag)
                {
                    writer.push(',');
                }
                else
                {
                    tag = true;
                }
                
                if (changed && (any = row.originalData))
                {
                    write_change(writer, data, any, names, this.tables);
                }
                else
                {
                    write_object(writer, data);
                }
            }
        }
        
        writer.push(']');
        
        return writer.join('');
    };
    
    
    function write_object(writer, data) {
        
        var tag;
        
        writer.push('{');
        
        for (var name in data)
        {
            if (tag)
            {
                writer.push(',');
            }
            else
            {
                tag = true;
            }
            
            writer.push('"', name, '":');
            write_value(writer, data[name]);
        }
        
        writer.push('}');
    };
    
    
    function write_array(writer, data) {
        
        writer.push('[');
        
        for (var i = 0, l = data.length; i < l; i++)
        {
            if (i > 0)
            {
                writer.push(',');
            }

            write_value(writer, data[i]);
        }
        
        writer.push(']');
    };
    
    
    function write_value(writer, value) {
    
        if (value == null)
        {
            writer.push('null');
            return;
        }

        switch (typeof value)
        {
            case 'string':
                writer.push('"', value.replace(/"/g, '\\"'), '"');
                break;

            case 'object':
                if (value instanceof Array)
                {
                    write_array(writer, value);
                }
                else
                {
                    write_object(writer, value);
                }
                break;

            default:
                writer.push(value);
                break;
        }
    };
    
    
    function write_change(writer, data, originalData, names, tables) {
        
        var value, oldValue;
        
        writer.push('{');
        
        for (var name in data)
        {
            value = data[name];
            oldValue = originalData[name];
            
            if (value !== oldValue || names && names.test(name))
            {
                if (value == null)
                {
                    writer.push('"', name, '":null', ',');
                    continue;
                }
                
                switch (typeof value)
                {
                    case 'string':
                        writer.push('"', name, '":"', value.replace(/"/g, '\\"'), '"', ',');
                        break;

                    case 'object':
                        if (tables && (oldValue = tables[name]))
                        {
                            oldValue = oldValue.toJSON(true);
                            
                            if (oldValue.length > 2)
                            {
                                writer.push('"', name, '":', oldValue, ',');
                            }
                        }
                        else 
                        {
                            writer.push('"', name, '":');
                            
                            if (value instanceof Array)
                            {
                                write_array(writer, value);
                            }
                            else
                            {
                                write_object(writer, value);
                            }
                            
                            writer.push(',');
                        }
                        break;

                    default:
                        writer.push('"', name, '":', value, ',');
                        break;
                }
            }
        }
        
        writer.push(writer.pop() === ',' ? '}' : '{}');
    };
    
    
}, false);



//数据集功能片段
flyingon.__dataset_fragment = flyingon.fragment(function () {
    
    
    
    //删除或增加数据方法
    var splice = [].splice;
    
    
    
    //复制行集合类
    flyingon.extend(this, flyingon.RowCollection.prototype);
    
    
    //加载数据
    this.load = function (list, primaryKey) {
        
        var dataset = this.dataset;
        
        (dataset || this).__load_data(dataset ? this : null, list, primaryKey);        
        return this;
    };
    
    
    //加载树型数据
    this.loadTreeList = function (list, primaryKey, childrenName) {
        
        var dataset = this.dataset;
        
        (dataset || this).__load_data(dataset ? this : null, list, primaryKey, childrenName || 'children');        
        return this;
    };
    
        
    //添加数据行
    this.append = function (row) {
        
        return this.insert(-1, row);
    };
    
    
    //插入数据行
    this.insert = function (index, row) {
        
        if (row && row['flyingon.DataRow'])
        {
            var dataset = this.dataset,
                parent;
                
            if (dataset)
            {
                parent = this;
            }
            else
            {
                dataset = this;
            }
            
            if ((index |= 0) < 0 || index > this.length)
            {
                index = this.length;
            }
            
            if (dataset.trigger('row-adding', 'parent', parent, 'row', row, 'index', index) !== false)
            {
                splice.call(this, index, 0, row);
                
                row.dataset = dataset;
                row.state = 'added';
                
                if (parent)
                {
                    row.parent = parent;
                }
                
                dataset.__changed_rows.push(row);
                dataset.trigger('row-added', 'parent', parent, 'row', row, 'index', index);
            }
        }
        
        return this;
    };
    
    
    //移除指定索引的数据行
    this.removeAt = function (index) {
        
        var row = this[index],
            dataset = this.dataset,
            parent;
                
        if (dataset)
        {
            parent = this;
        }
        else
        {
            dataset = this;
        }
        
        if (row && dataset.trigger('row-removing', 'parent', parent, 'row', row) !== false)
        {
            splice.call(this, index, 1);
            dataset.trigger('row-removed', 'parent', parent, 'row', row);
            
            if (row.state !== 'unchanged')
            {
                row.rejectChange();
            }
            
            row.dataset = row.parent = null;
            
            if (row.uniqueId === dataset.__current_id && (row = this[index] || this[--index]))
            {
                dataset.currentRow(row);
            }
        }
        
        return this;
    };
    
    
    //清除数据行
    this.clear = function () {
        
        var dataset = this.dataset,
            length = this.length,
            row;
        
        if (length > 0)
        {
            for (var i = 0; i < length; i++)
            {
                if (row = this[i])
                {
                    if (row.state !== 'unchanged')
                    {
                        row.rejectChange();
                    }
                    
                    row.dataset = row.parent = null;
                }
            }
            
            splice.call(this, 0, length);
            
            (dataset || this).trigger('clear', 'parent', dataset ? this : null);
        }
        
        return this;
    };
    
    
    //删除指定属性
    this.removeProperty = function (name) {
     
        if (name)
        {
            var row, data;
        
            for (var i = this.length - 1; i >= 0; i--)
            {
                if ((row = this[i]) && (data = row.data))
                {
                    delete data[name];
                    
                    if (data = row.originalData)
                    {
                        delete data[name];
                    }
                    
                    if (row.length > 0)
                    {
                        row.removeProperty(name);
                    }
                }
            }
        }
        
        return this;
    };
    
    
});



//数据行基类
flyingon.DataRow = flyingon.defineClass(flyingon.RowCollection, function () {
    
    

    //默认事件
    var default_event = new flyingon.Event();
    
    
    //删除或增加数据方法
    var splice = [].splice;
    
    

    //所属数据集
    this.dataset = null;
    
    //父级行
    this.parent = null;
    
    
    //id
    this.id = null;

    //唯一id
    this.uniqueId = 0;
    
    
    //当前数据
    this.data = null;
    
    
    //原始数据
    this.originalData = null;
    
        
    //数据行状态
    //unchanged     未变更状态
    //added         新增状态
    //changed       已修改状态
    this.state = 'unchanged';
                
    

    //是否dataset当前行
    this.isCurrent = function () {
        
        return this.uniqueId === this.dataset.__current_id;
    };
    
    
    
    //获取数据行在数据集中的索引
    this.index = function () {
        
        var list = this.parent || this.dataset,
            length;

        if (list && (length = list.length) > 0)
        {
            for (var i = 0; i < length; i++)
            {
                if (list[i] === this)
                {
                    return i;
                }
            }
        }

        return -1;        
    };
    
        
    //获取指定列的值
    this.get = function (name) {
        
        var data;
        
        if (data = name && this.data)
        {
            return data[name];                
        }
    };
    

    //获取指定列的原始值
    this.originalValue = function (name) {

        var data;
        
        if (name && (data = this.originalData || this.data))
        {
            return data[name];
        }
    };
    
    
    //设置指定列的值
    this.set = function (name, value, trigger) {
        
        var data, oldValue;
        
        //不允许设置值为undefined
        if (name && value !== void 0 && (data = this.data) && value !== (oldValue = data[name]))
        {
            var dataset = this.dataset, 
                e, 
                key, 
                any;
            
            if (trigger !== false)
            {
                e = default_event;
                e.type = 'value-changing';
                e.row = this;
                e.name = name;
                e.value = value;
                e.oldValue = oldValue;
                
                if (e && dataset.trigger(e) === false)
                {
                    return this;
                }
                
                if ((any = e.value) !== value && any !== void 0)
                {
                    value = any;
                }
            }
            
            if (this.state === 'unchanged')
            {
                any = {};

                for (key in data)
                {
                    any[key] = data[key];
                }

                this.originalData = data;
                this.data = data = any;
                this.state = 'changed';

                dataset.__changed_rows.push(this);
            }

            data[name] = value;

            if (e)
            {
                e.type = 'value-changed';
                dataset.trigger(e);
            }
            
            //触发变更动作
            dataset.dispatch('change', this, name);
        }
        
        return this;
    };
    
    
    //回滚指定值
    this.rollback = function (name) {
        
        var data = name && this.originalData;
        
        if (data)
        {
            this.data[name] = data[name];
        }
    };
    
    
    
    //从所属行集中移除当前行
    this.remove = function () {
        
        var parent = this.parent || this.dataset;
        
        if (parent)
        {
            parent.removeAt(this.index());
        }
        
        return this;
    };
    
    
    
    //接收修改
    this.acceptChange = function () {
        
        var dataset = this.dataset;
        
        if (dataset && this.state !== 'unchanged')
        {
            var rows = dataset.__changed_rows;

            for (var i = rows.length - 1; i >= 0; i--)
            {
                if (rows[i] === this)
                {
                    this.originalData = null;
                    this.state = 'unchanged';
                    
                    rows.splice(i, 1);
                    return this;
                }
            }
        }
        
        return this;
    };
    
    
    //拒绝修改
    this.rejectChange = function () {

        var dataset = this.dataset;
        
        if (dataset && this.state !== 'unchanged')
        {
            var rows = dataset.__changed_rows,
                data;

            for (var i = rows.length - 1; i >= 0; i--)
            {
                if (rows[i] === this)
                {
                    if (data = this.originalData)
                    {
                        this.data = data;
                        this.originalData = null;
                        this.state = 'unchanged';
                    }
                    else
                    {
                        splice.call(this.parent || dataset, this.index(), 1);
                    }
                    
                    rows.splice(i, 1);
                    return this;
                }
            }
        }
        
        return this;
    };
    

    
    //引入数据集合片段
    flyingon.__dataset_fragment(this);
    

    
    //获取树级别
    this.level = function () {
     
        var level = 0,
            parent = this;
        
        while (parent = parent.parent)
        {
            level++;
        }
        
        return level;
    };
    
    
    //统计所有子节点的数量
    this.count = function () {
        
        var length = this.length,
            count = length;
        
        if (length > 0)
        {
            for (var i = 0; i < length; i++)
            {
                var row = this[i];
                
                if (row.length > 0)
                {
                    count += row.count();
                }
            }
        }
        
        return count;
    };
    
    
        
});



//数据集
flyingon.DataSet = flyingon.defineClass(flyingon.RowCollection, function () {
    
    
    
    this.constructor = function () {
       
        //id生成器
        this.__new_id = 1;
        
        //uniqueId集合
        this.__keys1 = flyingon.create(null);
        
        //id集合
        this.__keys2 = flyingon.create(null);
        
        //变更的数据行集合
        this.__changed_rows = [];
    };
    
    
    
    //数据行类
    this.rowType = flyingon.DataRow;
    
    
            
    //引入可序列化片段
    flyingon.__serialize_fragment(this);
    
    
    //引入数据集合片段
    flyingon.__dataset_fragment(this);
    
    
        
    //从二维关系表加载树型数据
    this.loadTreeFromList = function (list, primaryKey, parentKey) {
        
        return this.__load_data(null, list, primaryKey || 'id', parentKey || 'parentId');
    };
    
    
    //加载数据内部方法
    this.__load_data = function (parent, list, primaryKey, parentKey, childrenName) {

        if (list && list.length > 0)
        {
            this.__new_id = load_data(this, 
                parent, 
                list, 
                primaryKey, 
                parentKey, 
                childrenName, 
                this.__new_id++);
            
            this.trigger('load', 'parent', parent);
        }
        
        return this;
    };
    
    
    function load_data(dataset, parent, list, primaryKey, parentKey, childrenName, uniqueId) {
      
        var target = parent || dataset,
            rowType = target.rowType || dataset.rowType,
            keys1 = dataset.__keys1,
            keys2 = dataset.__keys2,
            index = target.length,
            length = list.length,
            data,
            row,
            id;
            
        for (var i = 0; i < length; i++)
        {
            row = new rowType();
            row.dataset = dataset;
            
            if (parent)
            {
                row.parent = parent;
            }
            
            row.data = data = list[i] || {};
            
            keys1[row.uniqueId = uniqueId++] = row;
            
            if (primaryKey)
            {
                keys2[row.id = data[primaryKey]] = row;
            }
                        
            if (!parentKey)
            {
                target[index++] = row;
                
                if (childrenName && (data = data[childrenName]) && data.length > 0)
                {
                    uniqueId = load_data(dataset, row, data, primaryKey, null, childrenName, uniqueId)
                }
            }
        }

        if (parentKey)
        {
            for (var i = 0; i < length; i++)
            {
                data = list[i];
                row = keys2[data[primaryKey]];
                
                if (parent = keys2[data[parentKey]])
                {
                    row.parent = parent;
                    parent[parent.length++] = row;
                }
                else
                {
                    dataset[index++] = row;
                }
            }
        }

        target.length = index;
        
        return uniqueId;
    };
    

    //创建新数据行
    this.createRow = function (data, primaryKey) {
        
        var row = new this.rowType();
        
        row.dataset = this;
        row.data = data = data || {};
        
        this.__keys1[row.uniqueId = this.__new_id++] = row;
        
        if (primaryKey)
        {
            this.__keys2[row.id = data[primaryKey]] = row;
        }
        
        this.trigger('row-create', 'row', row);
        
        return row;
    };
    
    
    //获取或设置当前行
    this.currentRow = function (row) {
        
        var keys = this.__keys1,
            id = this.__current_id,
            oldValue = id && keys[id] || null;
        
        if (row === void 0)
        {
            return oldValue;
        }
        
        if (oldValue !== row)
        {
            if (this.trigger('current-changing', 'value', row, 'oldValue', oldValue) === false)
            {
                this.__current_id = id;
                return this;
            }
            
            this.__current_id = row && row.uniqueId;
            this.trigger('current-changed', 'value', row, 'oldValue', oldValue);
            
            //触发行移动动作
            this.dispatch('move', row);
        }
        
        return this;
    };
    
    
    //移动到第一行
    this.first = function () {
        
        var row;
        
        if (row = this.at(0))
        {
            this.currentRow(row);
        }

        return this;
    };
    
    
    //移动到上一行
    this.previous = function () {
        
        var row = this.currentRow(),
            index = row && row.index() - 1 || 0;
        
        if (row = this.at(index))
        {
            this.currentRow(row);
        }

        return this;
    };
    
    
    //移动到下一行
    this.next = function () {
        
        var row = this.currentRow(),
            index = row && row.index() + 1 || 0;
        
        if (row = this.at(index))
        {
            this.currentRow(row);
        }

        return this;
    };
    
    
    //移动到最后一行
    this.last = function () {
        
        var row;
        
        if (row = this.at(this.length - 1))
        {
            this.currentRow(row);
        }

        return this;
    };
    
    
    //移动到指定索引的行
    this.moveTo = function (index) {
        
        var row;
        
        if (row = this.at(index))
        {
            this.currentRow(row);
        }

        return this;
    };
    
    
    
    //通过id查找数据行
    this.id = function (id) {
        
        return this.__keys2(id) || null;
    };
    
    
    //通过唯一id查找数据行
    this.uniqueId = function (id) {
        
        return this.__keys1[id] || null;
    };
    
        
    
    //获取变更的数据行
    this.getChanges = function (state) {
    
        var list = new flyingon.RowCollection(),
            rows = this.__changed_rows,
            length = rows.length;
        
        if (length > 0)
        {
            if (state && typeof state === 'string')
            {
                var index = 0,
                    row;

                for (var i = 0; i < length; i++)
                {
                    if ((row = rows[i]) && state.indexOf(row.state) >= 0)
                    {
                        list[index++] = row;
                    }
                }

                list.length = index;
            }
            else
            {
                rows.push.apply(list, rows);
            }
        }
        
        return list;
    };
    
    
    //接收所有修改
    this.acceptChanges = function () {
        
        var rows = this.__changed_rows,
            length = rows.length,
            row;
        
        if (length > 0)
        {
            for (var i = 0; i < length; i++)
            {
                if (row = rows[i])
                {
                    row.originalData = null;
                    row.state = 'unchanged';
                }
            }
            
            rows.length = 0;
        }
        
        return this;
    };
    
    
    //拒绝所有修改
    this.rejectChanges = function () {
        
        var rows = this.__changed_rows,
            length = rows.length,
            row,
            data;
        
        if (length > 0)
        {
            for (var i = length - 1; i >= 0; i--)
            {
                if (row = rows[i])
                {
                    if (data = row.originalData)
                    {
                        row.data = data;
                        row.originalData = null;
                        row.state = 'unchanged';
                    }
                    else
                    {
                        rows.splice.call(row.parent || this, row.index(), 1);
                        row.dataset = row.parent = null;
                    }
                }
            }
            
            rows.length = 0;
            
            //触发重新绑定动作
            this.dispatch('bind');
        }
        
        return this;
    };
    
    
    
    //订阅或取消订阅变更动作
    this.subscribe = function (control, cancel) {
        
        if (control && control.ondatareceive)
        {
            var list = this.__action_list,
                index;
            
            if (list)
            {
                index = list.indexOf(control);
                
                if (cancel)
                {
                    if (index >= 0)
                    {
                        list.splice(index, 1);
                    }
                }
                else if (index < 0)
                {
                    list.push(control);
                }
            }
            else if (!cancel)
            {
                (this.__action_list = []).push(control);
            }
        }

        return this;
    };
    
    
    //派发变更动作
    this.dispatch = function (type, row, name) {
        
        var list, control, action, flag;
        
        if (type && (list = this.__action_list))
        {
            for (var i = 0, l = list.length; i < l; i++)
            {
                //如果绑定的是当前行
                if ((control = list[i]).subscribeCurrent)
                {
                    //指定行并且不是当前行
                    if (flag || flag === void 0 && (flag = !!row && row.uniqueId !== this.__current_id))
                    {
                        continue;
                    }
                }

                control.ondatareceive(this, action || (action = {
                
                    type: type,
                    row: row || this.currentRow(),
                    name: name || null
                }));
            }
        }

        return this;
    };
    
    
    //绑定数据源
    this.bind = function () {
        
        var row;
        
        if (!this.__current_id && (row = this[0]))
        {
            this.__current_id = row && row.uniqueId;
        }
        
        this.dispatch('bind');
        return this;
    };


    //添加或移除表达式
    this.expression = function (name, get, set) {

        var keys;

        if (name && typeof name === 'string')
        {
            if (typeof get === 'function')
            {
                if (typeof set !== 'function')
                {
                    set = null;
                }

                keys = this.__expression_keys || (this.__expression_keys = flyingon.create(null));
                keys[name] = [get, set];
            }
            else if (keys = this.__expression_keys)
            {
                delete keys[name];
            }
        }

        return this;
    };


    //获取绑定值
    this.getBindingValue = function (name, action) {

        var any = this.__expression_keys;

        if (any && (any = any[name]))
        {
            return any[0].call(this, action.row);
        }

        return (any = action.row.data) && any[name];
    };


    //设置绑定值
    this.setBindingValue = function (name, value, row) {

        var any = this.__expression_keys;

        if (any && (any = any[name]))
        {
            if (any = any[1])
            {
                any.call(this, value, row || this.currentRow());
            }
        }
        else
        {
            (row || this.currentRow()).set(name, value);
        }

        return this;
    };

    
        
}, true);




//可绑定对象片段
flyingon.__bindable_fragment = flyingon.fragment(function () {
    
    

    //数据集
    this.defineProperty('dataset', null, {
        
        fn: function (value) {

            var oldValue = this.__dataset || null;

            if (value === void 0)
            {
                return oldValue;
            }

            if (oldValue === value)
            {
                return this;
            }

            if (this.__watch_list && flyingon.__do_watch(this, name, value) === false)
            {
                return this;
            }

            this.__dataset = value;

            if (oldValue) 
            {
                oldValue.subscribe(this, true);
            }

            if (value) 
            {
                value.subscribe(this);
            }

            return this;
        }
    });
    
    
    //添加属性绑定
    //text: 以"{{"开始及以"}}"结束的字符串
    this.addBind = function (name, fieldName) {
        
        if (name && fieldName)
        {
            (this.__bind_keys || (this.__bind_keys = {}))[name] = fieldName;
        }
        
        return this;
    };
    
    
    //移除属性绑定
    this.removeBind = function (name) {
        
        var bind = this.__bind_keys;
        
        if (bind)
        {
            delete bind[name];
        }
        
        return this;
    };

    
    //仅订阅数据集当前行变更动作
    this.subscribeCurrent = true;
    
    
    //接收数据集变更动作处理
    this.ondatareceive = function (dataset, action) {
        
        var keys, name, any;
        
        if (action && (keys = this.__bind_keys))
        {
            name = action.name;

            for (var key in keys)
            {
                if (!name || keys[key] === name)
                {
                    any = name || keys[key];

                    //禁止自身回推
                    keys[key] = '';

                    try
                    {
                        this.set(key, dataset.getBindingValue(any, action));
                    }
                    finally
                    {
                        //回退缓存
                        keys[key] = any;
                    }
                }
            }
        }
        
        return this;
    };
    
    
    //回推数据至数据集
    this.pushBack = function (name, value) {
        
        var target = this,
            dataset;
 
        do
        {
            if (dataset = target.__dataset)
            {
                dataset.setBindingValue(name, value);
                return this;
            }
        }
        while (target = target.parent);

        return this;
    };

    
    
}, true);





//全局动态执行js, 防止局部执行增加作用域而带来变量冲突的问题
flyingon.globalEval = function (text) {

    if (window.execScript)
    {
        //ie8不支持call, ie9的this必须是window否则会出错
        window.execScript(text);
    }
    else
    {
        window['eval'](text);
    }
};


//转换url为绝对路径
flyingon.absoluteUrl = (function () {

    var dom = document.createElement('a'),
        base = location.href.replace(/[?#][\s\S]*/, ''),
        regex;

    dom.href = '';

    if (!dom.href)
    {
        dom = document.createElement('div');
        regex = /"/g;
    }

    return function (url, path) {

        if (url)
        {
            if (regex)
            {
                dom.innerHTML = '<a href="' + url.replace(regex, '%22') + '"></a>';
                url = dom.firstChild.href;
            }
            else
            {
                dom.href = url;
                url = dom.href;
            }
        }
        else
        {
            url = base;
        }

        return path ? url.substring(0, url.lastIndexOf('/') + 1) : url;
    };

})();


//head兼容处理
document.head || (document.head = document.getElementsByTagName('head')[0]);


//创建脚本标签
flyingon.script = !-[1,] || document.documentMode === 9 ? (function () { //ie8不支持onload, ie9支持但是执行顺序无法保证

    var list = [],
        head = document.head;

    function change() {

        var dom, callback;

        while ((dom = list[0]) && dom.readyState === 'loaded')
        {
            list.shift();

            dom.onreadystatechange = null;
            
            //不使用appendChild防止低版本IE在标签未闭合时出错
            head.insertBefore(dom, head.lastChild || null);

            if (callback = list.shift())
            {
                callback.call(dom);
            }
        }
    };

    return function (src, callback) {

        var dom = document.createElement('script');

        list.push(dom, callback);

        dom.onreadystatechange = change;
        dom.src = src; //会立即发送请求,但只有添加进dom树才会执行

        return dom;
    };

})() : function (src, callback) {

    var dom = document.createElement('script');

    dom.onload = dom.onerror = function () {

        if (callback)
        {
            callback.call(this);
            callback = null;
        }
        
        dom = dom.onload = dom.onerror = null;
    };

    dom.async = false;
    dom.src = src;

    document.head.appendChild(dom);
    return dom;
};



//创建link标签
flyingon.link = function (href, type, rel) {

    var dom = document.createElement('link');

    dom.href = href;
    dom.type = type || 'text/css';
    dom.rel = rel || 'stylesheet';

    document.head.appendChild(dom);

    return dom;
};


//动态添加样式表
flyingon.style = function (cssText) {

    var dom = document.createElement('style');  

    dom.setAttribute('type', 'text/css');  

    if (dom.styleSheet) // IE  
    {
        dom.styleSheet.cssText = cssText;  
    }
    else // w3c  
    {
        dom.appendChild(document.createTextNode(cssText));  
    }

    document.head.appendChild(dom);
    return dom;
};


//dom事件扩展
(function (window, flyingon) {

    

    var fixed = window.Event && Event.prototype,
        on = 'addEventListener';


    
    //以下为通用事件扩展(IE8以下浏览器不支持addEventListener)
    //IE的attachEvent中this为window且执行顺序相反
    if (!window[on])
    {
        on = false;
    }
    else if (fixed && !fixed.__stopPropagation) //修复w3c标准事件不支持cancelBubble的问题
    {
        fixed.__preventDefault = fixed.preventDefault;
        fixed.__stopPropagation = fixed.stopPropagation;
        fixed.__stopImmediatePropagation = fixed.stopImmediatePropagation;
        
        fixed.preventDefault = preventDefault;
        fixed.stopPropagation = stopPropagation;
        fixed.stopImmediatePropagation = stopImmediatePropagation;
    }
    


    //触发dom事件
    function trigger(e) {

        var items = this.__events,
            fn;

        if (items = items && items[e.type])
        {
            if (!e.target)
            {
                e.target = e.srcElement;
                e.preventDefault = preventDefault;
                e.stopPropagation = stopPropagation;
                e.stopImmediatePropagation = stopImmediatePropagation;
            }

            for (var i = 0, l = items.length; i < l; i++)
            {
                if ((fn = items[i]) && !fn.disabled)
                {
                    if (fn.call(this, e) === false && e.returnValue !== false)
                    {
                        e.preventDefault();
                    }

                    if (e.cancelBubble)
                    {
                        break;
                    }
                }
            }
        }
    };
    
    
    //修复attachEvent的this指向不正确的问题
    function trigger_fixed(dom) {
        
        function fn(e) {
          
            trigger.call(fn.dom, e || window.event); 
        };
        
        fn.dom = dom;
        
        //防止IE内存泄露
        dom = null;
        
        return fn;
    };


    function preventDefault() {

        this.returnValue = false;
        this.__preventDefault && this.__preventDefault();
    };

    
    function stopPropagation() {

        this.cancelBubble = true;
        this.__stopPropagation && this.__stopPropagation();
    };

    
    function stopImmediatePropagation() {

        this.cancelBubble = true;
        this.returnValue = false;
        this.__stopImmediatePropagation && this.__stopImmediatePropagation();
    };
        
    
    //挂起函数
    function suspend(e) {
      
        e.stopPropagation(); //有些浏览器不会设置cancelBubble
    };
    

    //只执行一次绑定的事件
    flyingon.dom_once = function (dom, type, fn) {

        function callback() {

            fn.apply(this, arguments);
            flyingon.dom_off(dom, type, callback);
        };

        flyingon.dom_on(dom, type, callback);
    };


    //添加dom事件绑定
    flyingon.dom_on = function (dom, type, fn, capture) {

        if (dom && type && fn)
        {
            var events = dom.__events,
                items;

            if (events)
            {
                if (items = events[type])
                {
                    items.push(fn);
                    return this;
                }
            }
            else
            {
                events = dom.__events = {};
            }

            events[type] = [fn];

            if (on)
            {
                dom[on](type, trigger, capture);
            }
            else
            {
                dom.attachEvent('on' + type, events.trigger || (events.trigger = trigger_fixed(dom)));
            }
        }
    };

    
    //暂停dom事件处理
    flyingon.dom_suspend = function (dom, type) {
        
        var items = dom && dom.__events;

        if (items = items && items[type])
        {
            items.unshift(suspend);
        }
    };
    
    
    //继续dom事件处理
    flyingon.dom_resume = function (dom, type) {
        
        var items = dom && dom.__events;

        if ((items = items && items[type]) && items[0] === suspend)
        {
            items.shift();
        }
    };
    

    //移除dom事件绑定
    flyingon.dom_off = function (dom, type, fn) {

        var events = dom && dom.__events,
            items;

        if (items = events && events[type])
        {
            if (fn)
            {
                for (var i = items.length - 1; i >= 0; i--)
                {
                    if (items[i] === fn)
                    {
                        items.splice(i, 1);
                    }
                }

                if (items.length > 0)
                {
                    return;
                }
            }

            if (on)
            {
                dom.removeEventListener(type, trigger);
            }
            else
            {
                dom.detachEvent('on' + type, events.trigger);
            }

            delete events[type];

            for (type in events)
            {
                return;
            }

            if (fn = events.trigger)
            {
                events.trigger = fn.dom = null;
            }
            
            dom.__events = void 0;
        }
    };

    

})(window, flyingon);




//dom样式扩展
(function (document, flyingon) {
    
    


    var style1 = flyingon.create(null),

        style2 = flyingon.create(null),

        fixed = flyingon.create(null); //自定义css兼容处理

        


    (function check_css(style1, style2) {

        var style = document.documentElement.style,
            list1 = [],
            list2,
            list3,
            any;

        for (var name in style)
        {
            switch (name)
            {
                case 'cssFloat':
                case 'styleFloat':
                    list1.push('float');
                    break;

                case 'cssText':
                    break;

                default:
                    list1.push(name);
                    break;
            }
        }

        any = list1.join(',');

        if (name = any.match(/\b(webkit|ms|moz|o)[A-Z]/))
        {
            name = name[1];

            any = any.replace(new RegExp('\\b' + name + '(?=[A-Z])', 'g'), '-' + name);

            any = any.replace(/([A-Z])/g, function (_, name) {

                return '-' + name.toLowerCase();
            });

            list2 = any.split(',');
            list3 = any.replace(new RegExp('-' + name + '-', 'g'), '').split(',');
        }
        else
        {
            list2 = list3 = list1;
        }

        for (var i = 0, l = list1.length; i < l; i++)
        {
            any = list3[i];
            style1[any] = list1[i];
            style2[any] = list2[i];
        }

    })(style1, style2);



    //获取可用样式名
    //name: 要获取的样式名,按css连字符的写法,如:background-color
    flyingon.css_name = function (name, css) {

        return (css ? style2 : style1)[name] || '';
    };


    //获取css名字映射
    flyingon.css_map = function (css) {

        return css ? style2 : style1;
    };
    
    
    //设置css样式值
    //dom:      目标dom
    //name:     要设置样式名,按css连字符的写法,如:background-color
    //value:    样式值
    flyingon.css_value = function (dom, name, value) {

        var any;

        if (any = style1[name])
        {
            dom.style[any] = value;
        }
        else if (any = fixed[name])
        {
            any(value, dom);
        }
    };
    
    
    //注册样式兼容处理
    //name:     要处理的样式名
    //set:      转换样式值的方法
    flyingon.css_fixed = function (name, set) {

        if (name && set && !style1[name])
        {
            fixed[name] = set;
        }
    };


    //处理ie允许选中
    flyingon.css_fixed('user-select', (function () {

        function event_false() {

            return false;
        };

        return function (value, dom) {

            if (dom)
            {
                (dom === document.body ? document : dom).onselectstart = value === 'none' ? event_false : null;
            }
        };

    })());
    
    
    
})(document, flyingon);




//html文档树加载完毕
flyingon.ready = (function () {

    var list;

    function ready() {

        var any = list;

        if (any)
        {
            flyingon.dom_off(document, 'DOMContentLoaded', ready);
            flyingon.dom_off(window, 'load', ready);

            for (var i = 0; i < any.length; i++) //执行过程中可能会加入函数，故不能缓存length
            {
                any[i++].call(any[i]);
            }

            list = null;
        }
    };

    if (document.readyState !== 'complete')
    {
        list = [];

        flyingon.dom_on(document, 'DOMContentLoaded', ready);
        flyingon.dom_on(window, 'load', ready);
    }

    return function (fn, context) {

        if (typeof fn === 'function')
        {
            if (list)
            {
                list.push(fn, context);
            }
            else
            {
                fn.call(context);
            }
        }
    };

})();




//dom测试
flyingon.dom_test = (function () {

    var dom = document.createElement('div'),
        list;

    dom.id = 'flyingon-dom-test';
    dom.style.cssText = 'position:absolute;overflow:hidden;margin:0;border:0;padding:0;left:-10px;top:0;width:0;height:0;';

    if (document.body)
    {
        document.body.appendChild(dom);
    }
    else
    {
        list = [];

        flyingon.ready(function () {

            var index = 0,
                fn;

            list = null;
            document.body.appendChild(dom);

            while (fn = this[index++])
            {
                fn.call(this[index++], dom);
            }

        }, list);
    }
    
    return function (fn, context) {

        if (list)
        {
            list.push(fn, context);
        }
        else
        {
            fn.call(context, dom);
        }
    };

})();




//在dom元素内插入html片段
flyingon.dom_html = function (host, html, refChild) {
    
    if (host && html)
    {
        var after, any;

        if (refChild || (refChild = host.lastChild) && (after = 1))
        {
            if (any = refChild.insertAdjacentHTML)
            {
                any.call(refChild, after ? 'afterend' : 'beforebegin', html);
            }
            else
            {
                any = document.createRange();
                html = any.createContextualFragment(html);

                if (after)
                {
                    any.setStartAfter(refChild);
                    host.appendChild(html);
                }
                else
                {
                    any.setStartBefore(refChild);
                    host.insertBefore(html, refChild);
                }
            }
        }
        else
        {
            host.innerHTML = html;
        }
    }
};




//拖动基础方法
flyingon.dom_drag = function (context, event, begin, move, end, locked, delay) {

    var dom = event.dom || event.target,
        style = dom.style,
        on = flyingon.dom_on,
        off = flyingon.dom_off,
        x0 = dom.offsetLeft,
        y0 = dom.offsetTop,
        x1 = event.clientX,
        y1 = event.clientY,
        distanceX = 0,
        distanceY = 0;

    function start(e) {
        
        if (begin)
        {
            e.dom = dom;
            begin.call(context, e);
        }
        
        flyingon.dom_suspend(dom, 'click', true);
        flyingon.css_value(document.body, 'user-select', 'none');
        
        if (dom.setCapture)
        {
            dom.setCapture();
        }
        
        start = null;
    };
    
    function mousemove(e) {

        var x = e.clientX - x1,
            y = e.clientY - y1;

        if (!start || (x < -2 || x > 2 || y < -2 || y > 2) && start(e))
        {
            if (move)
            {
                e.dom = dom;
                e.distanceX = x;
                e.distanceY = y;
                
                move.call(context, e);
                
                x = e.distanceX;
                y = e.distanceY;
            }
            
            distanceX = x;
            distanceY = y;
            
            if (locked !== true)
            {
                if (locked !== 'x')
                {
                    style.left = (x0 + x) + 'px';
                }

                if (locked !== 'y')
                {
                    style.top = (y0 + y) + 'px';
                }
            }
            
            e.stopImmediatePropagation();
        }
    };

    function mouseup(e) {

        off(document, 'mousemove', mousemove);
        off(document, 'mouseup', mouseup);

        if (!start)
        {
            flyingon.css_value(document.body, 'user-select', '');
            
            if (dom.setCapture)
            {
                dom.releaseCapture();
            }

            setTimeout(resume, 0);
            
            if (end)
            {
                e.dom = dom;
                e.distanceX = distanceX;
                e.distanceY = distanceY;
                
                end.call(context, e);
            }
        }
    };
    
    function resume() {
      
        flyingon.dom_resume(dom, 'click', true);
    };
    
    if (delay === false)
    {
        start(event);
    }

    on(document, 'mousemove', mousemove);
    on(document, 'mouseup', mouseup);
    
    event.stopImmediatePropagation();
};




//对齐到指定的dom
//dom: 要对齐的dom元素
//rect: 停靠范围
//direction: 停靠方向 bottom:下面 top:上面 right:右边 left:左边
//align: 对齐 left|center|right|top|middle|bottom
//reverse: 空间不足时是否反转方向
flyingon.dom_align = function (dom, rect, direction, align, reverse) {

    var width = dom.offsetWidth,
        height = dom.offsetHeight,
        style = dom.style,
        x = document.body.scrollLeft,
        y = document.body.scrollTop,
        x1 = x + rect.left,
        y1 = y + rect.top,
        x2 = x + rect.right,
        y2 = y + rect.bottom;

    //检测是否需倒转方向
    if (reverse !== false)
    {
        dom = document.documentElement;

        x = window.innerWidth || dom.offsetWidth || 0,
        y = window.innerHeight || dom.offsetHeight || 0;

        switch (direction)
        {
            case 'left':
                if (x1 < width && x - x2 >= width)
                {
                    direction = 'right';
                }
                break;

            case 'top':
                if (y1 < height && y - y2 >= height)
                {
                    direction = 'bottom';
                }
                break;

            case 'right':
                if (x1 >= width && x < x2 + width)
                {
                    direction = 'left';
                }
                break;

            default: 
                if (y1 >= height && y < y2 + height)
                {
                    direction = 'top';
                }
                break;
        }
    }

    if (direction === 'left' || direction === 'right')
    {
        x = direction === 'left' ? x1 - width : x2;

        switch (align)
        {
            case 'middle':
                y = y1 + (y2 - y1 - height >> 1);
                break;

            case 'bottom':
                y = y2 - height;
                break;

            default:
                y = y1;
                break;
        }
    }
    else
    {
        switch (align)
        {
            case 'center':
                x = x1 - (x2 - x1 - width >> 1);
                break;

            case 'right':
                x = x2 - width;
                break;

            default:
                x = x1;
                break;
        }

        y = direction === 'top' ? y1 - height : y2;
    }
    
    style.left = x + 'px';
    style.top = y + 'px';

    return { left: x, top: y };
};




//显示或隐藏摭罩层
flyingon.dom_overlay = (function () {
    
    var list = [],
        overlay = document.createElement('div');

    overlay.className = 'flyingon-overlay';

    return function (dom, visible) {

        if (dom)
        {
            var any;

            if (visible === false)
            {
                if (list[list.length - 1] === dom)
                {
                    dom.flyingon_overlay = false;
                    list.pop();
                    
                    while (dom = list[list.length - 1])
                    {
                        overlay.style.zIndex = dom.style.zIndex;

                        if (any = dom.parentNode)
                        {
                            any.insertBefore(overlay, dom);
                            return;
                        }

                        dom.flyingon_overlay = false;
                        list.pop();
                    }
                    
                    if (any = overlay.parentNode)
                    {
                        any.removeChild(overlay);
                    }
                }
            }
            else if (any = dom.parentNode)
            {
                overlay.style.zIndex = dom.style.zIndex;
                any.insertBefore(overlay, dom);

                dom.flyingon_overlay = true;
                list.push(dom);
            }
        }
    };

})();




//单位换算
(function (flyingon) {


    var create = flyingon.create,
    
        unit = (flyingon.pixel_unit = pixel_unit).unit = create(null), //单位换算列表

        pixel_cache = (flyingon.pixel = pixel).cache = create(null),

        pixel_persent = create(null),

        sides_cache = (flyingon.pixel_sides = pixel_sides).cache = create(null),

        sides_persent = create(null); 
            
    
    //初始化默认值
    unit.em = unit.rem = 12;
    unit.ex = 6;
    unit.pc = 16;
    unit.px = 1;
    unit.pt = 4 / 3;
    
    unit.mm = (unit.cm = 96 / 2.54) / 10;
    unit['in'] = 96;
    

    //或者或设置象素转换单位
    function pixel_unit(name, value) {

        if (value === void 0)
        {
            return unit[name];
        }

        if (unit[name] !== value)
        {            
            var cache = pixel_cache;

            unit[name] = value;

            for (var key in cache)
            {
                if (key.indexOf(name) > 0)
                {
                    cache[key] = void 0;
                }
            }
        }
    };


    //转换css尺寸为像素值
    //注: em与rem相同, 且在初始化时有效
    function pixel(value, size) {

        var any = pixel_cache[value],
            unit;

        if (any !== void 0)
        {
            return any;
        }

        if (any = pixel_persent[value])
        {
            return any * size / 100 + 0.5 | 0;
        }

        if (any = value.match(/[+-]?\d+(.\d+)?|[\w%]+/g))
        {
            if (unit = any[1])
            {
                if (unit === '%')
                {
                    return (pixel_persent[value] = any[0]) * size / 100 + 0.5 | 0;
                }

                any = any[0] * (unit[unit.toLowerCase()] || 1) + 0.5 | 0;
            }
            else
            {
                any = +any[0] + 0.5 | 0;
            }
        }
        else
        {
            any = 0;
        }

        return pixel_cache[value] = any; 
    };
    
    
    //转换4边尺寸为像素值(margin, padding的百分比是以父容器的宽度为参照, border-width不支持百分比)
    function pixel_sides(value, width) {
        
        var any = sides_cache[value];
        
        if (any)
        {
            return any;
        }

        if (any = sides_persent[value])
        {
            return sides(value, any, width);
        }

        any = +value;

        if (any === any || !(any = value.match(/[+-]?[\w%.]+/g)))
        {
            return sides_cache[value] = {

                left: any |= 0, 
                top: any, 
                right: any, 
                bottom: any
            };
        }

        if (value.indexOf('%') < 0)
        {
            return sides_cache[value] = sides(any, width);
        }

        return sides(sides_persent[value] = any, width);
    };
    
        
    function sides(sides, width) {
        
        var value = {},
            fn = pixel;
        
        switch (sides.length)
        {
            case 1:
                value.left = value.top = value.right = value.bottom = fn(sides[0], width);
                break;

            case 2:
                value.left = value.right = fn(sides[1], width);
                value.top = value.bottom = fn(sides[0], width);
                break;

            case 3:
                value.left = value.right = fn(sides[1], width);
                value.top = fn(sides[0], width);
                value.bottom = fn(sides[2], width);
                break;

            default:
                value.left = fn(sides[3], width);
                value.top = fn(sides[0], width);
                value.right = fn(sides[1], width);
                value.bottom = fn(sides[2], width);
                break;
        }

        return value;
    };
    

})(flyingon);




//计算单位换算关系
flyingon.dom_test(function (div) {

    var unit = flyingon.pixel_unit.unit;

    //计算单位换算列表
    div.innerHTML = '<div style="position:absolute;left:-10000in;"></div>' +
        '<div style="position:absolute;overflow:scroll;left:-10000em;top:-10000ex;width:100px;height:100px;">' +
            '<div style="width:200px;height:200px;"></div>' + 
        '</div>';

    unit.px = 1;
    unit.pt = (unit.pc = (unit['in'] = -div.children[0].offsetLeft / 10000) / 6) / 12;
    unit.mm = (unit.cm = unit['in'] / 2.54) / 10;

    div = div.children[1];
    unit.em = unit.rem = -div.offsetLeft / 10000;
    unit.ex = -div.offsetTop / 10000;

    //竖直滚动条宽度
    flyingon.vscroll_width = div.offsetWidth - div.clientWidth;

    //水平滚动条高度
    flyingon.hscroll_height = div.offsetHeight - div.clientHeight;
});





//鼠标事件类型
flyingon.MouseEvent = flyingon.defineClass(flyingon.Event, function () {


    this.constructor = function (event) {

        //关联的原始事件
        this.original_event = event;

        //事件类型
        this.type = event.type;

        //是否按下ctrl键
        this.ctrlKey = event.ctrlKey;

        //是否按下shift键
        this.shiftKey = event.shiftKey;

        //是否按下alt键
        this.altKey = event.altKey;

        //是否按下meta键
        this.metaKey = event.metaKey;

        //事件触发时间
        //this.timeStamp = event.timeStamp;

        //鼠标按键处理
        //IE678 button: 1->4->2 W3C button: 0->1->2
        //本系统统一使用which 左中右 1->2->3
        if (!(this.which = event.which))
        {
            this.which = event.button & 1 ? 1 : (event.button & 2 ? 3 : 2);
        }
        
        //包含滚动距离的偏移位置
        //this.pageX = event.pageX;
        //this.pageY = event.pageY;

        //不包含滚动距离的偏移位置
        this.clientX = event.clientX;
        this.clientY = event.clientY;

        //相对屏幕左上角的偏移位置
        //this.screenX = event.screenX;
        //this.screenY = event.screenY;

    };

    
});




//键盘事件类型
flyingon.KeyEvent = flyingon.defineClass(flyingon.Event, function () {


    this.constructor = function (event) {

        //关联的原始dom事件
        this.original_event = event;

        //事件类型
        this.type = event.type;

        //是否按下ctrl键
        this.ctrlKey = event.ctrlKey;

        //是否按下shift键
        this.shiftKey = event.shiftKey;

        //是否按下alt键
        this.altKey = event.altKey;

        //是否按下meta键
        this.metaKey = event.metaKey;

        //事件触发时间
        //this.timeStamp = event.timeStamp;

        //键码
        this.which = event.which || event.charCode || event.keyCode;

    };

    
});




//控件渲染器
flyingon.Renderer = flyingon.defineClass(function () {
    
    

    var self = this;

    
    //margin border padding css样式缓存
    var sides_cache = flyingon.create(null);

    //css名称映射
    var css_map = flyingon.css_map(true);

    //style名称映射
    var style_map = flyingon.css_map();



    //设置text属性名
    this.__text_name = 'textContent' in document.head ? 'textContent' : 'innerText';

    
    //盒子模型是否不包含边框
    //this.__no_border = true;

    //盒子模型是否不包含内边距
    this.__no_padding = true;
    
    
    //默认边框宽度
    //this.__border_width = 0;
    
    //默认边框高度
    //this.__border_height = 0;
    
    //默认内边距宽度
    //this.__padding_width = 0;
    
    //默认内边距高度
    //this.__padding_height = 0;


        
    //绑定渲染器
    this.bind = function (control) {
    
        var target;

        for (var i = arguments.length - 1; i >= 0; i--)
        {
            if (target = arguments[i])
            {
                (target.prototype || target).renderer = this;
            }
        }
    };
    


    //检测盒子模型
    this.checkBoxModel = function (dom) {
            
        var style = dom.style,
            pixel = flyingon.pixel;

        style.width = style.height = '100px';
        style.padding = '2px';
        style.overflow = 'scroll'; //IE9下当box-sizing值为border-box且有滚动条时会缩小

        //宽和高是否不包含边框
        if (this.__no_border = dom.offsetWidth !== 100)
        {
            style.padding = '';
            style = dom.currentStyle || window.getComputedStyle(dom);

            //计算默认边框大小
            this.__border_width = pixel(style.borderLeftWidth) + pixel(style.borderRightWidth);
            this.__border_height = pixel(style.borderTopWidth) + pixel(style.borderBottomWidth);

            //计算默认内边距大小
            this.__padding_width = pixel(style.paddingLeft) + pixel(style.paddingRight);
            this.__padding_height = pixel(style.paddingTop) + pixel(style.paddingBottom);
        }
        else
        {
            this.__border_width = this.__border_height = this.__padding_width = this.__padding_height = 0;
            return true;
        }
    };


    //检测盒模型
    flyingon.dom_test(function (div) {
        
 
        div.innerHTML = '<div class="flyingon-control"><div>';

        this.checkBoxModel(div.children[0]);


    }, this);




    function css_sides(value) {

        return sides_cache[value] = value ? value.replace(/(\d+)(\s+|$)/g, '$1px$2') : '';
    };




    //渲染html
    this.render = function (writer, control, css) {

        writer.push('<div'),

        this.renderDefault(writer, control, css);

        writer.push('></div>');
    };



    //渲染控件默认样式及属性
    this.renderDefault = function (writer, control, cssLayout, className, cssText) {

        var encode = flyingon.html_encode,
            storage = control.__storage || control.__defaults,
            any;

        if (any = storage.id)
        {
            writer.push(' id="', encode(any), '"');
        }

        writer.push(' class="', control.fullClassName, 
            cssLayout ? ' flyingon-html' : ' flyingon-absolute',
            className ? ' ' + className : '',
            '" style="');

        if (cssText)
        {
            writer.push(cssText);
        }

        if (any = control.__style_list)
        {
            this.__render_style(writer, control, any, encode);
        }

        if (cssLayout)
        {
            this.__render_locate(writer, control);
        }

        if (!storage.visible)
        {
            writer.push('display:none;');
        }

        writer.push('"');

        if (any = control.__attribute_patch)
        {
            control.__attribute_patch = null;
            this.__render_attribute(writer, control, any, encode);
        }
    };



    this.__render_style = function (writer, control, values, encode) {

        var map = css_map,
            name,
            value, 
            any;

        for (var i = 0, l = values.length; i < l; i++)
        {
            name = values[i++];
            value = values[++i];
            i++;

            if (value === '')
            {
                continue;
            }

            switch (any = this[name])
            {
                case 1: //直接设置样式
                    writer.push(name, ':', encode(value), ';');
                    break;

                case 2: //需要检测前缀
                    writer.push(map[name], ':', encode(value), ';');
                    break;

                case 9: //特殊样式
                    (control.__style_patch || (control.__style_patch = {}))[name] = value;
                    break;

                default:
                    if (typeof any !== 'function')
                    {
                        if (any = map[name])
                        {
                            writer.push(any, ':', encode(value), ';');
                            self[name] = any === name ? 1 : 2; //直接设置样式标记为1,需要加前缀标记为2
                            break;
                        }

                        self[name] = 9; //标记为特殊样式
                    }
                    
                    if (!(any = contro.__style_patch))
                    {
                        any = control.__view_patch || (control.__view_patch = {});
                        any = any.__style_patch = contro.__style_patch = {};
                    }

                    any[name] = value;
                    break;
            }
        }
    };


    var locate_keys = ('left,1,left,top,1,top,'
        + 'minWidth,1,min-width,maxWidth,1,max-width,minHeight,1,min-height,maxHeight,1,max-height,'
        + 'margin,2,margin,border,2,border-width,padding,2,padding,'
        + 'width,3,width,height,3,height').split(',');

    this.__render_locate = function (writer, control) {

        var keys = locate_keys,
            values = control.__storage || control.__defaults,
            value,
            any;
        
        for (var i = 0; i < 33; i++)
        {
            if (value = values[keys[i++]])
            {
                switch (keys[i++])
                {
                    case '1':
                        writer.push(keys[i], ':', (any = +value) === any ? value + 'px' : value, ';');
                        break;

                    case '2':
                        writer.push(keys[i], ':', sides_cache[value] || css_sides(value), ';');
                        break;

                    case '3':
                        if (value === 'default' || value === 'auto')
                        {
                            writer.push(keys[i], ':auto;');
                        }
                        else
                        {
                            writer.push(keys[i], ':', value >= 0 ? value + 'px' : value, ';');
                        }
                        break;
                }
            }
            else
            {
                i++;
            }
        }
    };

    
    this.__render_attribute = function (writer, control, keys, encode) {

        var value, any;

        for (var name in keys)
        {
            //没有设置自定义函数则值添加属性值
            if (typeof this[name] !== 'function')
            {
                if (value || value === 0)
                {
                    writer.push(' ', name, '="', encode(value), '"');
                }
            }
            else //否则交给自定义函数处理
            {
                if (!(any = contro.__attribute_patch))
                {
                    any = control.__view_patch || (control.__view_patch = {});
                    any = any.__attribute_patch = contro.__attribute_patch = {};
                }

                any[name] = value;
            }
        }
    };




    //挂载视图
    this.mount = function (control, view) {

        var any;
        
        control.view = view;

        view.flyingon_id = control.uniqueId();
        //view.onscroll = flyingon.__dom_scroll;

        if (any = control.__view_patch)
        {
            control.__view_patch = null;
            this.__apply_patch(control, view, any);
        }

        //触发控件挂载过程
        if (any = control.onmount)
        {
            any.call(control, view);
        }
    };


    //取消视图挂载
    this.unmount = function (control) {

        var view = control.view,
            any;

        if (view)
        {
            //触发注销控件挂载过程
            if (any = control.onunmount)
            {
                any.call(control, view);
            }

            control.view = view.onscroll = null;

            if (any = view.parentNode)
            {
                any.removeChild(view);
            }
        }
    };



    //更新布局
    this.update = function (control, css) {

        var view = control.view,
            style,
            item1,
            item2,
            any;

        if (css)
        {
            any = control.parent;
            
            if (any)
            {
                item1 = any.offsetWidth - any.borderLeft - any.borderRight - any.paddingLeft - any.paddingRight;
                item2 = any.offsetHeight - any.borderTop - any.borderBottom - any.paddintTop - any.paddingBottom;
            }
            else
            {
                item1 = item2 = 0;
            }

            control.offsetLeft = control.offsetTop = 0;
            control.measure(item1, item2, item1, item2);
        }
        else
        {
            style = view.style;
            item1 = control.__locate_style;
            item2 = this.locate(control);

            if (item1)
            {
                for (var name in item2)
                {
                    any = item2[name];

                    if (any !== item1[name])
                    {
                        style[name] = any;
                    }
                }
            }
            else
            {
                for (var name in item2)
                {
                    style[name] = item2[name];
                }
            }
        }

        control.__update_dirty = 0;
    };


    //布局定位方式
    this.locate = function (control) {

        var style = control.__locate_style = {},
            x = control.offsetWidth,
            y = control.offsetHeight,
            any;

        //记录渲染的大小
        control.__size_tag = (y << 16) + x;

        //宽和高如果不包含边框则减去边框
        if (this.__no_border)
        {
            any = control.__location_values || control.__storage || control.__defaults;

            if (any.border)
            {
                x -= control.borderLeft + control.borderRight;
                y -= control.borderTop + control.borderBottom;
            }
            else
            {
                x -= this.__border_width;
                y -= this.__border_height;
            }

            //宽和高如果不包含内边距则减去内边距
            if (this.__no_padding)
            {
                if (any.padding)
                {
                    x -= control.paddingLeft + control.paddingRight;
                    y -= control.paddingTop + control.paddingBottom;
                }
                else
                {
                    x -= this.__padding_width;
                    y -= this.__padding_height;
                }
            }
        }

        style.width = x + 'px';
        style.height = y + 'px';

        style.left = (x = control.offsetLeft) + 'px';
        style.top = (y = control.offsetTop) + 'px';

        //记录渲染的位置
        control.__location_tag = (y << 16) + x;
        control.__update_dirty = 0;

        return style;
    };



    this.visible = function (control, view, value) {

        view.style.display = value ? '' : 'none';
    };


    this.text = function (control, view, value) {

        view[this.__text_name] = value && flyingon.html_encode(value) || '';
    };


    this.focus = function (control) {

        control.view.focus();
    };


    this.blur = function (control) {

        control.view.blur();
    };




    //需要处理视图补丁的控件集合
    var controls = [];

    //要销毁的视图集合
    var views = [];

    //延迟更新队列
    var update_list = [];
    
    //更新定时器
    var update_delay;
    
        
    //更新
    function update() {
        
        var list = update_list,
            index = 0,
            item,
            node;

        flyingon.__update_patch();
        
        while (item = list[index++])
        {
            item.__delay_update = false;

            if (item.__update_dirty > 1 && (node = item.view) && (node = node.parentNode))
            {
                item.__layout_top(node.clientWidth, node.clientHeight);
            }

            item.update();
        }
        
        list.length = update_delay = 0;
    };
    
    

    //延时更新
    flyingon.__delay_update = function (control) {
      
        var list = update_list;
        
        if (control)
        {
            if (!control.__delay_update)
            {
                control.__delay_update = true;
                list.push(control);

                update_delay || (update_delay = setTimeout(update, 0)); //定时刷新
            }
        }
        else
        {
            update();
        }
    };


    //更新所有挂起的dom补丁(在调用控件update前需要先更新补丁)
    flyingon.__update_patch = function () {

        var list = views,
            index = 0,
            item,
            view,
            any;

        while (item = list[index++])
        {
            if (view = item.parentNode)
            {
                view.removeChild(item);
                item.innerHTML = '';
            }
        }

        index = 0;
        list = controls;

        while (item = list[index++])
        {
            if ((any = item.__view_patch) && (view = item.view))
            {
                item.__view_patch = null;
                item.renderer.__apply_patch(item, view, any);
            }
        }

        controls.length = 0;
    };



    //设置属性值
    this.set = function (control, name, value) {

        var any = control.__view_patch;

        if (any)
        {
            any[name] = value;
        }
        else
        {
            (control.__view_patch = {})[name] = value;

            if (control.view)
            {
                controls.push(control);
                update_delay || (update_delay = setTimeout(update, 0)); //定时刷新
            }
        }
    };


    //应用dom补丁
    this.__apply_patch = function (control, view, values) {

        var style = view.style,
            fn,
            value,
            any;

        for (var name in values)
        {
            //已处理过则不再处理
            if ((value = values[name]) === null)
            {
                continue;
            }

            switch (fn = this[name])
            {
                case 1: //直接设置样式
                    style[name] = value;
                    break;

                case 2: //设置前缀样式
                    style[style_map[name]] = value;
                    break;

                case 3: //visible
                    style.display = value ? '' : 'none';
                    break;

                case 9: //特殊样式
                    flyingon.css_value(view, name, value);
                    break;

                default:
                    if (typeof fn === 'function')
                    {
                        fn.call(this, control, view, value, name);
                    }
                    break;
            }
        }
    };


    //样式补丁
    this.__style_patch = function (control, view, value) {

        var map = style_map,
            style = view.style,
            any;

        control.__style_patch = null;

        for (var name in value)
        {
            switch (any = this[name])
            {
                case 0: //不处理
                    break;

                case 1: //直接设置样式
                    style[name] = value[name];
                    break;

                case 2: //需要检测前缀
                    style[map[name]] = value[name];
                    break;

                case 9: //特殊样式
                    flyingon.css_value(view, name, value[name]);
                    break;

                default:
                    if (typeof any !== 'function')
                    {
                        if (any = map[name])
                        {
                            style[any] = value[name];
                            self[name] = any === name ? 1 : 2; //直接设置样式标记为1,需要加前缀标记为2
                        }
                        else
                        {
                            flyingon.css_value(view, name, value[name]);
                            self[name] = 9; //标记为特殊样式
                        }
                    }
                    else
                    {
                        any.call(this, control, view, value[name]);
                    }
                    break;
            }
        }
    };


    //直接使用css定时时的补丁
    this.__locate_patch = function (control, view, value) {

        var style = view.style,
            values = control.__locate_patch,
            value;

        control.__locate_patch = null;

        for (var name in values)
        {
            value = values[name];

            switch (name)
            {
                case 'left':
                case 'top':
                case 'minWidth':
                case 'maxWidth':
                case 'minHeight':
                case 'maxHeight':
                    style[name] = value > 0 || value < 0 ? value + 'px' : value;
                    break;

                case 'margin':
                case 'padding':
                    style[name] = sides_cache[value] || css_sides(value);
                    break;

                case 'border':
                    style.borderWidth = sides_cache[value] || css_sides(value);
                    break;

                case 'width':
                case 'height':
                    if (value === 'default' || value === 'auto')
                    {
                        style[name] = 'auto';
                    }
                    else
                    {
                        style[name] = value >= 0 ? value + 'px' : value;
                    }
                    break;
            }
        }
    };


    //属性补丁
    this.__attribute_patch = function (control, view, value) {

        var fn, any;

        control.__attribute_patch = null;

        for (var name in value)
        {
            if (typeof (fn = this[name]) !== 'function')
            {
                if ((any = value[name]) !== false)
                {
                    view.setAttribute(name, any);
                }
                else
                {
                    view.removeAttribute(name);
                }
            }
            else
            {
                fn.call(this, control, view, value[name]);
            }
        }
    };




    //销毁视图
    this.dispose = function (view) {

        views.push(view);
        update_delay || (update_delay = setTimeout(update, 0)); //定时刷新
    };




}, false);





/*


本系统选择器从按照左到右的顺序解析, 请注意相关性能


本系统支持的基础选择器如下(注:本系统不支持html标签选择器):

*                       通用控件选择器
.N                      class选择器
#N                      id选择器
N                       类型选择器


本系统支持的组合选择器如下:

A,B                     或者选择器
A B                     后代选择器
A>B                     子选择器
A+B                     毗邻选择器
A~B                     后续兄弟选择器
AB                      并且选择器


本系统支持的属性选择器如下:

[name]                  具有name属性的控件
[name=value]            name属性值等于value的控件
[name~=value]           name属性值有多个空格分隔,其中一个值等于value的控件
[name|=value]           name属性值有多个连字号分隔(hyphen-separated)的值,其中一个值以value开头的控件, 主要用于lang属性, 比如en,en-us,en-gb等等
[name^=value]           name属性值以value开头的控件
[name$=value]           name属性值以value结尾的控件
[name*=value]           name属性值包含value的控件


本系统支持的伪类控件如下:

:focus                  控件有焦点
:enabled                控件可用
:disabled               控件被禁用
:checked                控件已选中

:has(selector)          控件下属子控件包含选择器selector规定的控件
:not(selector)          控件下属子控件不包含选择器selector规定的控件

:empty                  控件不包含任何子控件

:only                   控件是父控件中的唯一子控件
:first                  控件是父控件中的第一个子控件
:last                   控件是父控件中的最后一个子控件
:odd                    控件在父控件中的索引号是单数, 索引从0开始
:even                   控件在父控件中的索引号是双数, 索引从0开始
:eq(n)                  控件在父控件中的索引号等于n, n<0表示倒序, 索引从0开始
:gt(n)                  控件在父控件中的索引号大于n, 索引从0开始
:lt(n)                  控件在父控件中的索引号小于n, 索引从0开始


本系统不支持css伪类及伪元素


*/



//解析选择器
(function () {
        
    
    
    //解析缓存
    var parse_cache = flyingon.create(null);
    
    

    //解析选择器
    function parse(tokens, index) {

        var Class = flyingon.Selector_node,
            relation = ' ',
            nodes, 
            node, 
            token;

        while (token = tokens[index++])
        {
            //switch代码在chrome下的效率没有IE9好,不知道什么原因,有可能是其操作非合法变量名的时候性能太差
            switch (token)
            {
                case '#':   //id选择器标记
                case '.':   //class选择器标记
                    node = new Class(relation, token, tokens[index++], node);
                    relation = '';
                    break;

                case '*':  //全部元素选择器标记
                    node = new Class(relation, '*', '*', node);
                    relation = '';
                    break;

                case ' ':  //后代选择器标记
                case '\t':
                    if (!relation) //忽略其它类型后的空格
                    {
                        relation = ' ';
                    }
                    break;

                case '>':  //子元素选择器标记
                case '+':  //毗邻元素选择器标记
                case '~':  //之后同级元素选择器标记
                    relation = token;
                    break;

                case ',':  //组合选择器标记
                    if (node)
                    {
                        nodes = nodes || new flyingon.Selector_nodes();
                        nodes[nodes.length++] = node.top;
                    }

                    node = null;
                    relation = ' ';
                    break;

                case '[': //属性 [name[?="value"]]
                    if (!node || relation) //未指定节点则默认添加*节点
                    {
                        node = new Class(relation, '*', '*', node);
                        relation = '';
                    }

                    index = parse_property(node, tokens, index);
                    break;

                case ':': //伪类
                    if (!node || relation) //未指定节点则默认添加*节点
                    {
                        node = new Class(relation, '*', '*', node);
                        relation = '';
                    }

                    token = new flyingon.Selector_pseudo(node, tokens[index++]);
                    
                    //处理参数
                    if (tokens[index] === '(')
                    {
                        index = parse_pseudo(token, tokens, ++index);
                    }
                    break;

                default: //类名 token = ""
                    node = new Class(relation, '', token.replace(/-/g, '.'), node);
                    relation = '';
                    break;
            }
        }
        
        if (nodes)
        {
            if (node)
            {
                nodes[nodes.length++] = node.top;
            }
            
            return nodes;
        }

        return node && node.top || node;
    };


    //解析属性
    function parse_property(node, tokens, index) {

        var target, token, any;

        while (token = tokens[index++])
        {
            switch (token)
            {
                case ']':
                    return index;

                case '*': // *= 包含属性值XX
                case '^': // ^= 属性值以XX开头
                case '$': // $= 属性值以XX结尾
                case '~': // ~= 匹配以空格分隔的其中一段值 如匹配en US中的en
                case '|': // |= 匹配以-分隔的其中一段值 如匹配en-US中的en
                    if (target)
                    {
                        target.relation = token;
                    }
                    break;

                case '=':
                    if (target)
                    {
                        target.relation += '=';
                    }
                    break;

                case ' ':
                case '\t':
                    break;

                default:
                    if (target)
                    {
                        switch (token)
                        {
                            case 'undefined':
                                token = undefined;
                                break;
                                
                            case 'null':
                                token = null;
                                break;
                                
                            case 'true':
                                token = true;
                                break;
                                
                            case 'false':
                                token = false;
                                break;
                                
                            default:
                                if ((any = token.charAt(0)) === '"' || any === "'")
                                {
                                    token = token.substring(1, token.length - 1);
                                }
                                else
                                {
                                    token = +token;
                                }
                                break;
                        }
                        
                        target.value = token;
                    }
                    else
                    {
                        target = new flyingon.Selector_property(node, token);
                    }
                    break;
            }
        }

        return index;
    };
    

    //解析伪类参数
    function parse_pseudo(target, tokens, index) {

        var start = index,
            flag = 1,
            any;
        
        while (flag && (any = tokens[index++]))
        {
            switch (any)
            {
                case '(':
                    flag++;
                    break;
                    
                case ')':
                    flag--;
                    break;
            }
        }
        
        any = tokens.slice(start, index - 1).join('');

        switch (target.name)
        {
            case 'eq':
            case 'gt':
            case 'lt':
                any |= 0;
                break;
        }
        
        target.value = any;
        return index;
    };
    
        
    //创建解析选择器方法
    flyingon.__parse_selector = function (selector, cache) {

        if (!selector || typeof selector !== 'string')
        {
            return null;
        }
        
        if (cache !== false && (cache = parse_cache[selector]))
        {
            return cache;
        }
        
        cache = selector.match(/"[^"]*"|'[^']*'|[\w-]+|[*.#\[\]:(), \t>+~=|^$]/g);
        return parse_cache[selector] = parse(cache, 0);
    };

    
})();



//选择器节点类
flyingon.Selector_node = flyingon.defineClass(function () {
    
    

    //id选择器缓存集合
    var id_query;

    //class选择器缓存集合
    var class_query;

    //类型选择器缓存集合
    var type_query;



    this.constructor = function (relation, type, name, node) {
       
        this.find = this[this.relation = relation];
        this.filter = this[this.type = type];
        this.name = name;
        
        if (node)
        {
            if (relation)
            {
                node.next = this;
            }
            else
            {
                node[node.length++] = this;
            }
            
            this.top = node.top || node;
        }
        else
        {
            this.top = this;
        }
    };
    
    
        
    //关系符
    this.relation = '';
    
    
    //节点类型
    this.type = '';
    
    
    //节点名称
    this.name = '';
    
    
    //子项数
    this.length = 0;
    
    
    //下一节点
    this.next = null;
    
    
    
    //选择节点
    this.select = function (controls) {
        
        var index, any;
        
        controls = this.find(controls);

        if (controls[0])
        {
            index = 0;

            while (any = this[index++])
            {
                controls = any.filter(controls);
            }

            if (controls[0] && (any = this.next))
            {
                controls = any.select(controls);
            }
        }

        return controls;
    };
    
    
    //检查控件是否符合选择器要求
    this.check = function (controls) {
    
        var index = 0,
            any;
        
        while (any = this[index++])
        {
            if (!(controls = any.filter(controls, [])).length)
            {
                return controls;
            }
        }

        return (any = this.next) ? any.find(controls) : controls;
    };
    
    
    
    this[''] = function (controls, cache) {

        var type = this.__type || (this.__type = flyingon.components[this.name]);

        if (type)
        {
            var exports = [],
                index = 0,
                length = 0,
                item;
            
            while (item = controls[index++])
            {
                if (item instanceof type)
                {
                    exports[length++] = item;
                }
            }
            
            return exports;
        }

        return controls;
    };
    
        
    this['*'] = function (controls, cache) {

        return controls;
    };
    
    
    this['.'] = function (controls, cache) {

        var name = this.name;;

        if (name)
        {
            var exports = [],
                index = 0,
                length = 0,
                item,
                any;
            
            while (item = controls[index++])
            {
                if ((any = item.__class_list) && any[name])
                {
                    exports[length++] = item;
                }
            }
            
            return exports;
        }

        return controls;
    };
    

    this['#'] = function (controls, cache) {

        var name = this.name;;

        if (name)
        {
            var exports = [],
                index = 0,
                length = 0,
                item,
                any;
            
            while (item = controls[index++])
            {
                if ((any = item.__storage) && any.id === name)
                {
                    exports[length++] = item;
                }
            }
            
            return exports;
        }

        return controls;
    };
    
    
    
    //后代选择器
    this[' '] = function (controls) {
        
        var cache = type_query,
            index = 0,
            exports,
            item,
            any;
        
        if (cache)
        {
            cache = (any = cache['*']) || (cache['*'] = {});
        }
        else
        {
            cache = (type_query = flyingon.__type_query_cache = {})['*'] = {};
        }

        if (controls.length > 1)
        {
            controls = remove_child(controls);
        }

        while (item = controls[index++])
        {
            any = item.__uniqueId || item.uniqueId();
            any = cache[any] || (cache[any] = (any = item.firstChild) ? all_children(any) : []);

            if (any.length > 0)
            {
                if (exports)
                {
                    any.push.apply(exports, any);
                }
                else
                {
                    exports = any;
                }
            }
        }

        if (exports && exports[0])
        {
            return this.filter(exports, 1);
        }
 
        return exports || [];
    };


    //获取指定控件的所有子控件
    function all_children(control) {

        var list = [],
            stack = [],
            index = 0,
            length = 0,
            next,
            any;

        do
        {
            list[length++] = control;
            next = control.nextSibling;

            if (any = control.firstChild)
            {
                control = any;
                
                if (next)
                {
                    stack[index++] = next;
                }
            }
            else
            {
                control = next || stack[--index];
            }
        }
        while (control);

        return list;
    };

    
    //移除子控件关系
    function remove_children(controls) {

        return controls;
    };

    
    //子控件选择器
    this['>'] = function (controls) {

        var index = 0,
            exports,
            item,
            any;

        while (item = controls[index++])
        {
            if (item.firstChild)
            {
                any = item.children();

                if (exports)
                {
                    any.push.apply(exports, any);
                }
                else
                {
                    exports = any;
                }
            }
        }

        return exports && exports[0] && this.filter(exports, 2) || [];
    };
    
    
    //毗邻控件选择器
    this['+'] = function (controls) {

        var exports = [],
            index = 0,
            length = 0,
            item;

        while (item = controls[index++])
        {
            if (item = item.nextSibling)
            {
                exports[length++] = item;
            }
        }
 
        return exports[0] ? this.filter(exports) : exports;
    };
    
    
    //后续兄弟控件选择器
    this['~'] = function (controls) {

        var exports = [],
            index = 0,
            length = 0,
            item;
        
        if (controls.length > 1)
        {
            controls = remove_next(controls);
        }

        while (item = controls[index++])
        {
            while (item = item.nextSibling)
            {
                exports[length++] = item;
            }
        }
 
        return exports[0] ? this.filter(exports) : exports;
    };


    //移除后述控件关系
    function remove_next(controls) {

        return controls;
    };
    

    //清除缓存
    function clear_cache(cache) {

        for (var type in cache)
        {
            var keys = cache[type];

            for (var id in keys)
            {
                keys[id] = null;
            }

            cache[type] = null;
        }
    };


    //清除id选择器缓存
    flyingon.__clear_id_query = function (id) {

        var keys = id_query,
            key,
            any;

        if (keys && (any = keys[id]))
        {
            for (key in any)
            {
                any[key] = null;
            }

            delete keys[key];

            for (key in keys)
            {
                return;
            }

            id_query = flyingon.__id_query_cache = null;
        }
    };
        

    //清除class选择器缓存
    flyingon.__clear_class_query = function (name) {

        var keys = class_query,
            key,
            any,
            index;
        
        if (keys && name)
        {
            if (typeof name === 'string')
            {
                if (any = keys[name])
                {
                    clear_cache(any);
                    delete keys[name];
                }
            }
            else if (name instanceof Array)
            {
                index = 0;

                while (key = name[index++])
                {
                    if (any = keys[key])
                    {
                        clear_cache(any);
                        delete keys[key];
                    }
                }
            }
            else
            {
                for (key in name)
                {
                    if (any = keys[key])
                    {
                        clear_cache(any);
                        delete keys[key];
                    }
                }
            }

            for (key in keys)
            {
                return;
            }

            class_query = flyingon.__clear_class_query = null;
        }
    };


    //清除类型选择器缓存
    flyingon.__clear_type_query = function (control) {

        var cache = type_query;

        for (var type in cache)
        {
            clear_cache(cache[type]);
            cache[type] = null;
        }

        type_query = flyingon.__type_query_cache = null;
    };

    
    
}, false);



//复合选择器节点类
flyingon.Selector_nodes = flyingon.defineClass(function () {
    
    
    
    this.type = ',';
    
    
    //子节点数量
    this.length = 0;
    
    
    //选择节点
    this.select = function (controls, exports) {
        
        var index = 1,
            list,
            item,
            id;
        
        if (item = this[0])
        {
            exports = item.select(controls, exports);

            while (item = this[index++])
            {
                list = item.select(controls, []);
                
                for (var i = 0, l = list.length; i < l; i++)
                {
                    if ((item = list[i]) && (id = -item.__uniqueId) &&!exports[id])
                    {
                        exports[id] = true;
                        exports.push(item);
                    }
                }
            }
        }

        return exports;
    };
    
    
    
}, false);



//选择器属性类
flyingon.Selector_property = flyingon.defineClass(function () {
    
    
    
    this.constructor = function (node, name) {
       
        this.name = name;
        node[node.length++] = this;
    };
    
    
    
    //节点类型
    this.type = '[]';
    
    
    //属性名称
    this.name = '';
    
    
    //关系符
    this.relation = '';
    
    
    //属性值
    this.value = '';



    this.filter = function (controls) {

        var name = this.name,
            fn;

        if (name && (fn = this[this.relation]))
        {
            var exports = [];

            fn.call(this, controls, name, exports, 0);
            return exports;
        }

        return controls;
    };
    
    
    
    this[''] = function (controls, name, exports, length) {
        
        var index = 0,
            item;

        while (item = controls[index++])
        {
            if (item[name] !== void 0)
            {
                exports[length++] = item;
            }
        }
    };
    
    
    this['='] = function (controls, name, exports, length) {
        
        var value = this.value,
            index = 0,
            item,
            any;

        while (item = controls[index++])
        {
            if ((any = item[name]) !== void 0)
            {
                if (typeof any === 'function')
                {
                    any = any.call(item);
                }

                if (any === value)
                {
                    exports[length++] = item;
                }
            }
        }
    };
    
    
    // *= 包含属性值XX (由属性解析)
    this['*='] = function (controls, name, exports, length) {
        
        var value = this.value,
            index = 0,
            item,
            any;

        while (item = controls[index++])
        {
            if ((any = item[name]) !== void 0)
            {
                if (typeof any === 'function')
                {
                    any = any.call(item);
                }

                any = '' + any;

                if (any.indexOf(value) >= 0)
                {
                    exports[length++] = item;
                }
            }
        }
    };
    
    
    // ^= 属性值以XX开头 (由属性解析)
    this['^='] = function (controls, name, exports, length) {
        
        var value = this.value,
            index = 0,
            item,
            any;

        while (item = controls[index++])
        {
            if ((any = item[name]) !== void 0)
            {
                if (typeof any === 'function')
                {
                    any = any.call(item);
                }

                any = '' + any;

                if (any.indexOf(value) === 0)
                {
                    exports[length++] = item;
                }
            }
        }
    };
    
    
    // $= 属性值以XX结尾 (由属性解析)
    this['$='] = function (controls, name, exports, length) {
        
        var value = this.value,
            count = value.length,
            index = 0,
            item,
            any;

        while (item = controls[index++])
        {
            if ((any = item[name]) !== void 0)
            {
                if (typeof any === 'function')
                {
                    any = any.call(item);
                }

                any = '' + any;

                if (any.lastIndexOf(value) === any.length - count)
                {
                    exports[length++] = item;
                }
            }
        }
    };
    
    
    // ~= 匹配以空格分隔的其中一段值 如匹配en US中的en (由属性解析)
    this['~='] = function (controls, name, exports, length) {
        
        var regex = this.regex || (this.regex = new RegExp('(?:^|\s+)' + this.value + '(?:\s+|$)')),
            index = 0,
            item,
            any;

        while (item = controls[index++])
        {
            if ((any = item[name]) !== void 0)
            {
                if (typeof any === 'function')
                {
                    any = any.call(item);
                }

                if (regex.text(any))
                {
                    exports[length++] = item;
                }
            }
        }
    };


    this['|='] = function (controls, name, exports, length) {
        
        var regex = this.regex || (this.regex = new RegExp('\b' + this.value + '\b')),
            index = 0,
            item,
            any;

        while (item = controls[index++])
        {
            if ((any = item[name]) !== void 0)
            {
                if (typeof any === 'function')
                {
                    any = any.call(item);
                }

                if (regex.text(any))
                {
                    exports[length++] = item;
                }
            }
        }
    };
        
    
}, false);



//选择器伪类类
flyingon.Selector_pseudo = flyingon.defineClass(function () {
    
    
    
    this.constructor = function (node, name) {
       
        this.name = name;
        node[node.length++] = this;
    };
    
    
    
    //节点类型
    this.type = ':';
    
    
    //伪类名称
    this.name = '';
    
    
    //伪类参数值
    this.value = 0;
    


    this.filter = function (controls) {

        var name = this.name,
            fn;

        if (name && (fn = this[name]))
        {
            var exports = [];

            fn.call(this, controls, exports, 0);
            return exports;
        }

        return controls;
    };
    

    this.active = function (controls, exports, length) {

    };
    
    
    this.disabled = function (controls, exports, length) {

        var index = 0,
            item;

        while (item = controls[index++])
        {
            if ((item.__storage || item.__defaults).disabled)
            {
                exports[length++] = item;
            }
        }
    };
    

    this.enabled = function (controls, exports, length) {

        var index = 0,
            item;

        while (item = controls[index++])
        {
            if (!(item.__storage || item.__defaults).disabled)
            {
                exports[length++] = item;
            }
        }
    };

    
    this.checked = function (controls, exports, length) {

        var index = 0,
            item;

        while (item = controls[index++])
        {
            if ((item.__storage || item.__defaults).checked)
            {
                exports[length++] = item;
            }
        }
    };

    
    
    this.has = function (controls, exports, length) {

        var selector = this.value;

        if (selector)
        {
            selector = flyingon.__parse_selector(selector);

            
        }

        return controls;
    };
    
    
    this.not = function (controls, exports, length) {

    };
    
    

    this.empty = function (controls, exports, length) {

        var index = 0,
            item;

        while (item = controls[index++])
        {
            if (!item.firstChild)
            {
                exports[length++] = item;
            }
        }
    };
    
    
    this.only = function (controls, exports, length) {
        
        var index = 0,
            item;

        while (item = controls[index++])
        {
            if (!item.previousSibling && !item.nextSibling)
            {
                exports[length++] = item;
            }
        }
    };

    
    this.first = function (controls, exports, length) {

        var index = 0,
            item;

        while (item = controls[index++])
        {
            if (!item.previousSibling)
            {
                exports[length++] = item;
            }
        }
    };

        
    this.last = function (controls, exports, length) {

        var index = 0,
            item;

        while (item = controls[index++])
        {
            if (!item.nextSibling)
            {
                exports[length++] = item;
            }
        }
    };

    
    this.odd = function (controls, exports, length) {
        
        var value = this.value,
            index = 0,
            item;

        while (item = controls[index++])
        {
            if (!(item.index() & 1))
            {
                exports[length++] = item;
            }
        }
    };
    
    
    this.even = function (controls, exports, length) {
        
        var value = this.value,
            index = 0,
            item;

        while (item = controls[index++])
        {
            if (item.index() & 1)
            {
                exports[length++] = item;
            }
        }
    };
    
        
    this.eq = function (controls, exports, length) {
        
        var value = this.value,
            index = 0,
            item;

        while (item = controls[index++])
        {
            if (item.index() === value)
            {
                exports[length++] = item;
            }
        }
    };
    
        
    this.gt = function (controls, exports, length) {

        var value = this.value,
            index = 0,
            item;

        while (item = controls[index++])
        {
            if (item.index() > value)
            {
                exports[length++] = item;
            }
        }
    };

    
    this.lt = function (controls, exports, length) {

        var value = this.value,
            index = 0,
            item;

        while (item = controls[index++])
        {
            if (item.index() < value)
            {
                exports[length++] = item;
            }
        }
    };

    
}, false);



//选择器查询类
flyingon.Query = flyingon.defineClass(function () {
    
    
    
    //选择器解析缓存
    var parse = flyingon.__parse_selector;
    
    
    
    this.constructor = function (selector, context) {
       
        var any;
        
        if (context && (any = parse(selector)) && (any = any.select(context)) && any[0])
        {
            any.push.apply(this, any);
        }
    };
    
    
    
    this.find = function (selector) {
        
        var target = new this.Class(selector, this);

        target.previous = this;
        return target;
    };


    //
    this.children = function (step, start, end) {

    };
    
    
    this.end = function () {
      
        return this.previous || this;
    };
    
        

    this.on = function (type, fn) {

        if (type && fn)
        {
            var index = 0,
                item;

            while (item = this[index++])
            {
                item.on(type, fn);
            }
        }
        
        return this;
    };
    
    
    this.once = function (type, fn) {

        if (type && fn)
        {
            var index = 0,
                item;

            while (item = this[index++])
            {
                item.once(type, fn);
            }
        }
        
        return this;
    };

    
    this.off = function (type, fn) {

        var index = 0,
            item;

        while (item = this[index++])
        {
            item.off(type, fn);
        }
        
        return this;
    };


    this.trigger = function (e) {

        if (e)
        {
            var index = 0,
                item;

            while (item = this[index++])
            {
                item.trigger.apply(item, arguments);
            }
        }
        
        return this;
    };

    

    this.hasClass = function (className) {

        var item;
        return className && (item = this[0]) ? item.hasClass(className) : false;
    };

    
    this.addClass = function (className) {

        if (className)
        {
            var index = 0,
                item;

            while (item = this[index++])
            {
                item.addClassName(className);
            }
        }
        
        return this;
    };

    
    this.removeClass = function (className) {

        if (className)
        {
            var index = 0,
                item;

            while (item = this[index++])
            {
                item.removeClass(className);
            }
        }
        
        return this;
    };

    
    this.toggleClass = function (className) {

        if (className)
        {
            var index = 0,
                item;

            while (item = this[index++])
            {
                item.toggleClass(className);
            }
        }
        
        return this;
    };


    
    
}, false);





//控件类
//IE7点击滚动条时修改className会造成滚动条无法拖动,需在改变className后设置focus获取焦点解决此问题
flyingon.defineClass('Control', function () {

    

    var id = 1;
    
    var self = this;


    var create = flyingon.create;
  
    //根据uniqueId组织的控件集合
    var controls = flyingon.__uniqueId_controls = create(null);


    var pixel = flyingon.pixel;

    var pixel_sides = flyingon.pixel_sides;


    //设置默认渲染器
    var renderer = this.renderer = flyingon.Renderer.prototype;


    
    //扩展至选择器
    this.__selector_extend = flyingon.Query;
    
                
    //向上冒泡对象名
    this.eventBubble = 'parent';
    
        
                
    //控件默认宽度(width === 'default'时的宽度)
    this.defaultWidth = 100;

    //控件默认高度(height === 'default'时的高度)
    this.defaultHeight = 25;
    

    //控件坐标
    this.offsetLeft = this.offsetTop = this.offsetWidth = this.offsetHeight = 0;

    //外边距
    this.marginLeft = this.marginTop = this.marginRight = this.marginBottom = 0;

    //边框宽度
    this.borderLeft = this.borderTop = this.borderRight = this.borderBottom = 0;

    //内边距
    this.paddingLeft = this.paddingTop = this.paddingRight = this.paddingBottom = 0;

    //滚动条位置
    this.scrollLeft = this.scrollTop = 0;

        
    
    this.__uniqueId = 0;
    
    //唯一id
    this.uniqueId = function () {
        
        return this.__uniqueId || (controls[id] = this, this.__uniqueId = id++);
    };
    

    //父控件
    this.parent = null;


    //上一兄弟节点控件
    this.previousSibling = null;


    //下一兄弟节点控件
    this.nextSibling = null;



    
    //读取自定义值
    this.__custom_get = function (name) {

        return (this.__storage || this.__defaults)[name];
    };


    //设置自定义值
    this.__custom_set = function (name, value) {

        var fn, any;

        if (name && name.charAt(0) === '-') //指令
        {
            if (any = name.indexOf(':'))
            {
                if (fn = this[name.substring(0, ++any)])
                {
                    fn.call(this, name.substring(any), value);
                }
            }
            else if (fn = this[name])
            {
                fn.call(this, value);
            }
        }
        else
        {
            (this.__storage || (this.__storage = create(this.__defaults)))[name] = value;
            (this.__attribute_patch || this.__new_patch('attribute'))[name] = value;
        }
    };
    

    //模型指令
    this['-model'] = function (vm, name) {

        this.on('change', function (e) {

            vm.$set(name, e.original_event.target.value);
        });
    };


    //获取焦点指令
    this['-focused'] = function (value) {

        if (value)
        {
            this.focus();
        }
        else
        {
            this.blur();
        }
    };


    
    
    //获取控件在父控件中的索引
    this.index = function () {
        
        if (this.parent)
        {
            var control = this,
                index = 0;

            while (control = control.previousSibling)
            {
                index++;
            }

            return index;
        }

        return -1;
    };
    
    
    //从父控件中移除
    this.remove = function (dispose) {
        
        var parent = this.parent;
        
        if (parent)
        {
            parent.removeChild(this, dispose);
        }
    };
    
        
    
    //引入可绑定功能片段
    flyingon.__bindable_fragment(this);
    
    
    
    //创建指定类型的补丁
    this.__new_patch = function (type) {

        var view = this.__view_patch,
            patch = this[type = '__' + type + '_patch'] = {};
        
        if (view)
        {
            view[type] = patch;
        }
        else
        {
            this.renderer.set(this, type, patch);
        }

        return patch;
    };

    

    //id
    this.defineProperty('id', '', {
     
        set: function (value, oldValue) {

            var any;

            if (any = flyingon.__id_query_cache)
            {
                if (oldValue && any[oldValue])
                {
                    flyingon.__clear_id_query(oldValue);
                }

                if (value && any[value])
                {
                    flyingon.__clear_id_query(value);
                }
            }

            if (this.view)
            {
                (this.__attribute_patch || this.__new_patch('attribute')).id = value;
            }
        }
    });


    
    //指定class名 与html一样
    this.defineProperty('className', '', {

        set: function (value) {

            this.fullClassName = value = value ? this.defaultClassName + ' ' + value : this.defaultClassName;

            if (this.view)
            {
                (this.__attribute_patch || this.__new_patch('attribute'))['class'] = value;
            }
        }
    });
    
    
    //是否包含指定class
    this.hasClass = function (name) {

        var keys;
        return name && (keys = this.__class_keys) && keys[name] || false;
    };


    //添加class
    this.addClass = function (name) {

        var list, keys, any;

        if (name && (list = name.match(/[\w-]+/g)))
        {
            if (keys = this.__class_keys)
            {
                any = list.length;

                while (any--)
                {
                    if (keys[name = list[any]])
                    {
                        list.splice(any, 1);
                    }
                    else
                    {
                        keys[name] = true;
                    }
                }
                
                if (list.length > 0)
                {
                    if (flyingon.__class_query_cache)
                    {
                        flyingon.__clear_class_query(list);
                    }

                    this.className(this.__storage.className + ' ' + list.join(' '));
                }
            }
            else
            {
                init_class(this, list);
            }
        }

        return this;
    };


    //移除class
    this.removeClass = function (name) {

        var list, keys, index;

        if (name && (list = name.match(/\w+/g)) && (keys = this.__class_keys))
        {
            index = list.length;

            while (index--)
            {
                if (keys[name = list[index]])
                {
                    keys[name] = false;
                }
                else
                {
                    list.splice(index, 1);
                }
            }
            
            if (list.length > 0)
            {
                sync_class(this, keys, list);
            }
        }

        return this;
    };


    //切换class 有则移除无则添加
    this.toggleClass = function (name) {

        var list, keys, index;

        if (name && (list = name.match(/\w+/g)))
        {
            if (keys = this.__class_keys)
            {
                index = list.length;

                while (index--)
                {
                    keys[name = list[index]] = !keys[name];
                }
                
                sync_class(this, keys, list);
            }
            else
            {
                init_class(this, list);
            }
        }

        return this;
    };


    //初始化class集合
    function init_class(self, list) {

        var keys = self.__class_keys = {},
            index = 0,
            any;

        while (any = list[index++])
        {
            keys[any] = true;
        }

        if (flyingon.__class_query_cache)
        {
            flyingon.__clear_class_query(list);
        }

        self.className(list.join(' '));
    };


    //同步class
    function sync_class(self, keys, list) {

        var any = [];

        for (var name in keys)
        {
            if (keys[name])
            {
                any.push(name);
            }
        }

        if (flyingon.__class_query_cache)
        {
            flyingon.__clear_class_query(list);
        }

        self.className(any.join(' '));
    };



    //class指令
    this['-class:'] = function (name, value) {

        if (value)
        {
            this.addClass(name);
        }
        else
        {
            this.removeClass(name);
        }
    };




    //是否可见
    this.defineProperty('visible', true, {
        
        group: 'layout',

        set: function (value) {

            if (this.view)
            {
                this.renderer.set(this, 'visible', value);
            }

            if (this.__update_dirty < 2)
            {
                this.invalidate();
            }
        }
    });
        


    //定义定位属性
    var define = function (name, defaultValue, css) {
        
        css = css || name;

        self.defineProperty(name, defaultValue, {
            
            group: 'layout',

            set: function (value) {

                if (this.__css_layout === true)
                {
                    (this.__locate_patch || this.__new_patch('locate'))[css] = value;
                }

                if (this.__update_dirty < 2)
                {
                    (this.parent || this).invalidate();
                }
            }
        });
    };
    

    //左边距
    define('left', '');

    //顶边距
    define('top', '');

    //宽度
    //default: 默认
    //auto: 自动
    //number: 指定象素
    //number + css单位
    define('width', 'default');

    //高度
    //default: 默认
    //auto: 自动
    //number: 指定象素
    //number + css单位
    define('height', 'default');


    //最小宽度
    define('minWidth', '', 'min-width');

    //最大宽度
    define('maxWidth', '', 'max-width');

    //最小高度
    define('minHeight', '', 'min-height');

    //最大高度
    define('maxHeight', '', 'max-height');


    //外边距
    define('margin', '');

    //边框宽度
    define('border', '', 'border-width');
    
    //内边距
    define('padding', '');



    define = function (name, defaultValue) {
        
        self.defineProperty(name, defaultValue, {
            
            group: 'layout',

            set: function (value) {

                if (this.__update_dirty < 2)
                {
                    this.invalidate();
                }
            }
        });
    };


    //控件横向对齐方式
    //left      左边对齐
    //center    横向居中对齐
    //right     右边对齐
    define('alignX', 'left');

    //控件纵向对齐方式
    //top       顶部对齐
    //middle    纵向居中对齐
    //bottom    底部对齐
    define('alignY', 'top');
    

    //控件停靠方式(此值仅在当前布局类型为停靠布局(dock)时有效)
    //left:     左停靠
    //top:      顶部停靠
    //right:    右停靠
    //bottom:   底部停靠
    //fill:     充满
    define('dock', 'left');



    //设置自定义样式
    this.defineProperty('style', '', {
        
        group: 'appearance',

        fn: function (name, value) {

            var style = this.__style_list,
                any = style && style.text || '';

            if (name === void 0)
            {
                return any;
            }

            name = '' + name;

            //单个设置样式
            if (value !== void 0)
            {
                this['-style:'](name, value);
            }
            else if (name.length < 36 && name.indexOf(':') < 0) //读指定名称的样式
            {
                return style && style[style.indexOf(name) + 2] || '';
            }
            else if (value = name.match(/\:|[^\s:;]+(\s+[^\s:;]+)?/g))
            {
                set_style.call(this, style, value);
            }

            if ((value = (style || this.__style_list).text) !== any)
            {
                if (this.__watch_keys && flyingon.__do_watch(this, name, value, any) === false)
                {
                    return this;
                }

                if ((any = this.__bind_keys) && (name = any[name]))
                {
                    this.pushBack(name, value);
                }
            }

            return this;
        }
    });

    
    //样式指令
    this['-style:'] = function (name, value) {

        var style = this.__style_list,
            index,
            any;

        if (!name || 
            style && (index = style.indexOf(name)) >= 0 && (any = style[index + 2]) === value ||
            this.__watch_keys && flyingon.__do_watch(this, name, value, any) === false)
        {
            return;
        }

        if (style)
        {
            if (index >= 0)
            {
                style[index + 2] = value;
            }
            else
            {
                style.push(name, ':', value, ';');
            }
        }
        else
        {
            style = this.__style_list = [name, ':', value, ';'];
        }

        if ((any = this.__bind_keys) && (any = any[name]))
        {
            this.pushBack(any, value);
        }

        if (this.view)
        {
            (this.__style_patch || this.__new_patch('style'))[name] = value;
         }
        
        style.text = style.join('');
    };


    //批量设置样式
    function set_style(style, list) {

        var watch = this.__watch_keys,
            bind = this.__bind_keys,
            view = this.view,
            patch = view && this.__style_patch,
            index = 0,
            length = list.length,
            first = !style,
            oldValue,
            name,
            value,
            any;

        style = style || (this.__style_list = []);

        while (index < length)
        {
            while ((name = list[index++]) === ':')
            {
            }

            if (!name)
            {
                continue;
            }

            //值为''表示清除原有样式
            if (list[index++] === ':')
            {
                value = list[index++] || '';
            }
            else
            {
                index--;
                value = '';
            }

            if (first || (any = list.indexOf(name)) < 0 || (oldValue = list[any + 2]) !== value)
            {
                if (watch && flyingon.__do_watch(this, name, value, oldValue || '') === false)
                {
                    continue;
                }

                if (first || any < 0)
                {
                    style.push(name, ':', value, ';');
                }
                else
                {
                    style[any + 2] = value;
                }

                if (bind && (any = bind[name]))
                {
                    this.pushBack(any, value);
                }

                if (view)
                {
                    (patch || (patch = this.__new_patch('style')))[name] = value;
                }
                else
                {
                    patch = true;
                }
            }
        }

        if (patch)
        {
            style.text = style.join('');
        }
    };




    //定义attribute属性
    define = function (name, defaultValue, attributes) {

        attributes = attributes || {};

        attributes.set = function (value) {

            (this.__attribute_patch || this.__new_patch('attribute'))[name] = value;
        };

        self.defineProperty(name, defaultValue, attributes);
    };


    flyingon.attributeProperty = define;
    
    
    //tab顺序
    define('tabIndex', -1);
    
    
    //是否禁用
    define('disabled', false);
    

    //是否只读
    define('readonly', false);


    //提示信息
    define('title', '');


    //快捷键
    define('accessKey', '');
    
    
    
    //是否可调整大小或调整大小的方式
    //none  不可调整
    //x     只能调整宽度
    //y     只能调整高度
    //all   宽度高度都可调整
    this.defineProperty('resizable', 'none');
    
    
    //是否可移动
    this.defineProperty('movable', false);
    
    
    //是否要放置移动或拖动
    this.defineProperty('droppable', false);


    //自定义标记键值
    this.defineProperty('key', '');


    //自定义标记
    this.defineProperty('tag', null);




    //获取定位属性值
    this.locationValue = function (name) {

        return (this.__location_values || this.__storage || this.__defaults)[name];
    };


    
    //初始化顶级控件布局
    this.__layout_top = function (width, height) {

        this.__location_values = null;
        this.left = this.top = 0;

        this.measure(width, height, width, height, height ? 3 : 1);
    };


    //测量控件大小
    //containerWidth    容器宽度
    //containerHeight   容器高度
    //availableWidth    可用宽度 
    //availableHeight   可用高度
    //defaultToFill     默认宽度或高度是否转成充满 0:不转 1:宽度转 2:高度转 3:宽高都转
    this.measure = function (containerWidth, containerHeight, availableWidth, availableHeight, defaultToFill) {
        
        var location = this.__location_values || this.__storage || this.__defaults,
            minWidth = location.minWidth,
            maxWidth = location.maxWidth,
            minHeight = location.minHeight,
            maxHeight = location.maxHeight,
            width = location.width,
            height = location.height,
            auto = 0,
            fn = pixel_sides,
            cache = fn.cache,
            any;

        any = cache[any = location.margin] || fn(any, containerWidth);

        this.marginLeft = any.left;
        this.marginTop = any.top;
        this.marginRight = any.right;
        this.marginBottom = any.bottom;

        any = cache[any = location.border] || fn(any, 0); //border不支持百分比

        this.borderLeft = any.left;
        this.borderTop = any.top;
        this.borderRight = any.right;
        this.borderBottom = any.bottom;

        any = cache[any = location.padding] || fn(any, containerWidth);

        this.paddingLeft = any.left;
        this.paddingTop = any.top;
        this.paddingRight = any.right;
        this.paddingBottom = any.bottom;

        fn = pixel;
        cache = fn.cache;

        minWidth = (any = +minWidth) === any ? any | 0 : cache[minWidth] || fn(minWidth, containerWidth);
        maxWidth = (any = +maxWidth) === any ? any | 0 : cache[minWidth] || fn(minWidth, containerWidth);

        minHeight = (any = +minHeight) === any ? any | 0 : cache[minWidth] || fn(minWidth, containerHeight);
        maxHeight = (any = +maxHeight) === any ? any | 0 : cache[minWidth] || fn(minWidth, containerHeight);

        //处理宽度
        switch (width)
        {
            case 'default':
                if (defaultToFill & 1)
                {
                    any = availableWidth >= 0 ? availableWidth : containerWidth;
                    width = any - this.marginLeft - this.marginRight;
                }
                else
                {
                    width = this.defaultWidth;
                }
                break;
                
            case 'auto':
                auto = 1;
                width = availableWidth || this.defaultWidth;
                break;

            default:
                width = (any = +width) === any ? any | 0 : cache[width] || fn(width, containerWidth);
                break;
        }

        if (any < 0)
        {
            width = 0;
        }

        //处理高度
        switch (height)
        {
            case 'default':
                if (defaultToFill & 2)
                {
                    any = availableHeight >= 0 ? availableHeight : containerHeight;
                    height = any - this.marginTop - this.marginBottom;
                }
                else
                {
                    height = this.defaultHeight;
                }
                break;
                
            case 'auto':
                auto |= 2;
                height = availableHeight || this.defaultHeight;
                break;

            default:
                height = (any = +height) === any ? any | 0 : cache[height] || fn(height, containerHeight);
                break;
        }

        if (height < 0)
        {
            height = 0;
        }

        this.__auto_size = auto; 
        
        //处理最小及最大宽度
        if (width < minWidth)
        {
            width = minWidth;
        }
        else if (maxWidth > 0 && width > maxWidth)
        {
            width = maxWidth;
        }
        
        //处理最小及最大高度
        if (height < minHeight)
        {
            height = minHeight;
        }
        else if (maxHeight > 0 && height > maxHeight)
        {
            height = maxHeight;
        }
        
        //设置大小
        this.offsetWidth = width;
        this.offsetHeight = height;
        
        //测量后处理
        if ((fn = this.onmeasure) && fn.call(this, auto) !== false)
        {
            //处理最小及最大宽度
            if (this.offsetWidth !== width)
            {
                if ((width = this.offsetWidth) < minWidth)
                {
                    this.offsetWidth = width = minWidth;
                }
                else if (maxWidth > 0 && width > maxWidth)
                {
                    this.offsetWidth = width = maxWidth;
                }
            }

            //处理最小及最大高度
            if (this.offsetHeight !== height)
            {
                if ((height = this.offsetHeight) < minHeight)
                {
                    this.offsetHeight = height = minHeight;
                }
                else if (maxHeight > 0 && height > maxHeight)
                {
                    this.offsetHeight = height = maxHeight;
                }
            }
        }

        //如果大小发生了变化则标记布局已变更
        if (this.__update_dirty < 2 && this.__size_tag !== (height << 16) + width)
        {
            this.__update_dirty = 2;
        }
    };
    
        
    //定位控件
    this.locate = function (x, y, alignWidth, alignHeight, container) {
        
        var width = this.offsetWidth,
            height = this.offsetHeight,
            any;

        if (alignWidth > 0 && (any = alignWidth - width))
        {
            switch ((this.__location_values || this.__storage || this.__defaults).alignX)
            {
                case 'center':
                    x += any >> 1;
                    break;

                case 'right':
                    x += any;
                    break;
                    
                default:
                    x += this.marginLeft;
                    break;
            }
        }
        else
        {
            x += this.marginLeft;
        }

        if (alignHeight > 0 && (any = alignHeight - height))
        {
            switch ((this.__location_values || this.__storage || this.__defaults).alignY)
            {
                case 'middle':
                    y += any >> 1;
                    break;

                case 'bottom':
                    y += any;
                    break;
                    
                default:
                    y += this.marginTop;
                    break;
            }
        }
        else
        {
            y += this.marginTop;
        }
        
        this.offsetLeft = x;
        this.offsetTop = y;
        
        if ((any = this.onlocate) && any.call(this) !== false)
        {
            x = this.offsetLeft;
            y = this.offsetTop;
        }

        //检测位置从上次渲染后是否发生变更
        this.__location_dirty = (any = this.__location_tag) && any !== (y << 16) + x;

        if (container)
        {
            container.arrangeX = (x += width + this.marginRight);
            container.arrangeY = (y += height + this.marginBottom);

            if (x > container.arrangeRight)
            {
                container.arrangeRight = x;
            }

            if (y > container.arrangeBottom)
            {
                container.arrangeBottom = y;
            }
        }
    };
    

    

    //是否可获取焦点
    this.canFocus = function () {

        return this.tabIndex >= 0;
    };


    this.focus = function () {

        this.renderer.focus(this);
    };


    this.blur = function () {

        this.renderer.blur(this);
    };
    
           

    //控件重绘状态
    //0: 不需要重绘
    //1: 子控件需要重绘
    //2: 当前控件需要重绘
    this.__update_dirty = 2;
    
        
    //使布局无效
    this.invalidate = function (content) {

        var any;

        this.__update_dirty = 2;

        if (any = this.parent)
        {
            if (!any.__update_dirty && (!content || this.__auto_size))
            {
                any.invalidate(true);
            }
        }
        else if (this.__top_control)
        {
            flyingon.__delay_update(this);
        }

        return this;
    };
    
            
    
    //更新视区
    this.update = function () {
        
        if (this.view && this.__update_dirty)
        {
            flyingon.__update_patch();
            this.renderer.update(this);
        }
        
        return this;
    };


    //刷新控件
    this.refresh = function () {

        if (this.view)
        {
            flyingon.__update_patch();
            this.renderer.update(this);
        }
    };

    
    
    //滚动事件处理
    this.__do_scroll = function (x, y) {
        
    };


    this.__do_change = function (value) {

        if (this.trigger('change', 'value', value) !== false)
        {
            this.text(value);
        }
    };


    
    
    //引入序列化片段
    flyingon.__serialize_fragment(this);
    
    

    var clone = this.clone;
    
    //以当前对象的参照复制生成新对象
    this.clone = function () {

        var target = clone.call(this),
            any;

        target.__dataset = this.__dataset;

        if (any = this.__class_list)
        {
            target.__class_list = flyingon.extend({}, any);
        }

        return target;
    };
    
    
    //销毁控件    
    this.dispose = function (recursion) {
    
        var storage = this.__storage,
            any;

        //触发销毁过程
        if (any = this.distroyed)
        {
            any.call(this);
        }
        
        if (any = this.view)
        {
            if (recursion !== true)
            {
                this.renderer.dispose(any);
            }

            this.view = this.view_body = null;
        }

        if (any = this.__dataset)
        {
            any.subscribe(this, true);
        }
        
        if (this.__events)
        {
            this.off();
        }

        if (storage)
        {
            //清除id选择器缓存
            if ((any = storage.id) && flyingon.__id_query_cache)
            {
                flyingon.__clear_id_query(storage.id);
            }

            //清除class选择器缓存
            if ((any = this.__class_list) && flyingon.__class_query_cache)
            {
                flyingon.__clear_class_query(any, true);
            }
        }

        if (any = this.__uniqueId)
        {
            delete controls[any];
        }
        
        this.parent = this.previousSibling = this.nextSibling = this.__loop_vm = null;

        return this;
    };
    
    
        
    //控件类初始化处理
    this.__class_init = function (Class, base) {
     
        var name = Class.xtype;
        
        if (name)
        {
            name = name.toLowerCase();
            
            if (base = base.defaultClassName)
            {
                 name = base + ' ' + name;
            }
            
            this.fullClassName = this.defaultClassName = name;
        }
    };

    


}).register('control');




//注释节点,主要作为插入标记用
flyingon.defineClass('Comment', flyingon.Control, function () {



    this.defaultValue('visible', false);


    this.defineProperty('text', '');



    this.visible = function () {

        return false;
    };



}).register('comment');




flyingon.defineClass('Label', flyingon.Control, function (base) {
   
        
        
    this.defineProperty('text', '', {
        
        set: function (value) {

            this.view && this.renderer.set(this, 'text', value);
        }
    });
    
    
    //测量自动大小
    this.onmeasure = function (auto, border) {
        
        if (auto)
        {
            this.renderer.measure_auto(this, auto, border);
        }
        else
        {
            return false;
        }
    };
    


}).register('label');




flyingon.defineClass('HtmlText', flyingon.Control, function (base) {


        
    this.defineProperty('html', '', {
        
        set: function (value) {

            this.view && this.renderer.set(this, 'html', value);
        }
    });
    

    
    //测量自动大小
    this.onmeasure = function (auto, border) {
        
        if (auto)
        {
            this.renderer.auto(this, auto, border);
        }
        else
        {
            return false;
        }
    };
    


}).register('htmltext');




flyingon.defineClass('Button', flyingon.Control, function (base) {
   
            

    //文本内容
    this.defineProperty('text', '', {
        
        set: function (value) {

            this.view && this.renderer.set(this, 'text', value);
        }
    });
    
    
    //文本内容是否html格式
    this.defineProperty('html', false);
    


}).register('button');




flyingon.defineClass('LinkButton', flyingon.Control, function (base) {
   
        
        
    this.defineProperty('text', '', {
        
        set: function (value) {

            this.view && this.renderer.set(this, 'text', value);
        }
    });
    
    

    this.defineProperty('href', 'javascript:void 0', {

        set: function (value) {

            this.view && this.renderer.set(this, 'href', value);
        }
    });
    


}).register('linkbutton');




flyingon.defineClass('TextBox', flyingon.Control, function (base) {
    


    this.defaultHeight = 25;
    
    

    this.defineProperty('value', '', {

        set: function (value) {

            this.view && this.renderer.set(this, 'text', value);
        }
    });


    this.defineProperty('format', '');


    this.defineProperty('text', '', {

        set: function (value) {

            this.view && this.renderer.set(this, 'text', value);
        }
    });
    
    

}).register('textbox');




flyingon.__container_fragment = flyingon.fragment(function () {




    //控件检测不通过提醒
    var check_error = 'control is not type of ';



    //允许添加的子控件类型
    this.childControlType = flyingon.Control;
    
    
    //第一个子控件
    this.firstChild = null;


    //最后一个子控件
    this.lastChild = null;


       
    
    //子控件集合
    this.children = function () {

        return this.__children || this.__init_children();
    };


    //获取指定索引的子项
    this.at = function (index) {

        var list = this.__children || this.__init_children();

        if ((index |= 0) < 0)
        {
            index += list.length;
        } 

        return list[index];
    };
        
    
    //初始化子控件集合
    this.__init_children = function () {

        var list = this.__children = [],
            item = this.firstChild;

        while (item)
        {
            list.push(item);
            item = item.nextSibling;
        }

        return list;
    };



    function check_array(self, controls, type) {

        var index = 0,
            item,
            any;

        while (item = controls[index++])
        {
            if (item instanceof type)
            {
                if (any = item.parent)
                {
                    any.removeChild(item, false);
                }

                item.parent = self;
            }
            else
            {
                throw check_error + type.xtype;
            }
        }
    };


    //插入多个控件
    function insert_array(controls, refChild) {

        var view = this.view,
            index = 0,
            last = refChild && refChild.previousSibling || null,
            item,
            any;

        if (!last)
        {
            this.firstChild = controls[0];
        }

        while (item = controls[index++])
        {
            if (view)
            {
                //添加增加视图补丁
                if (any = this.__insert_patch)
                {
                    if (item.view)
                    {
                        any.push(item);
                    }
                    else
                    {
                        any[0]++;
                    }
                }
                else
                {
                    this.__insert_patch = item.view ? [0, item] : [1];
                    this.renderer.set(this, '__insert_patch', true);
                }
            }

            item.previousSibling = last;

            last && (last.nextSibling = item);
            last = item;
        }

        if (refChild)
        {
            last.nextSibling = refChild;
            refChild.previousSibling = last;
        }
        else
        {
            this.lastChild = last;
        }
    };

        
    //添加子控件
    this.appendChild = function (controls) {

        return this.insertBefore(controls);
    };


    //在指定的位置插入子控件
    this.insertAt = function (controls, index) {

        return this.insertBefore(controls, this.at(index));
    };
    
    
    //在指定子控件前插入子控件
    this.insertBefore = function (controls, refChild) {

        var type = this.childControlType,
            control,
            any;

        if (controls instanceof Array)
        {
            if (controls.length > 1)
            {
                check_array(this, controls, type);
            }
            else
            {
                control = controls[0];
            }
        }
        else 
        {
            control = controls;
        }
        
        if (control)
        {
            if (control instanceof type)
            {
                if (any = control.parent)
                {
                    any.removeChild(control, false);
                }

                control.parent = this;
            }
            else
            {
                throw check_error + type.xtype;
            }
        }

        //清空子视图缓存集合
        this.__children = null;

        //清除选择器缓存
        if (flyingon.__query_cache)
        {
            flyingon.__query_clear(this);
        }

        if (refChild && refChild.parent !== this)
        {
            refChild = null;
        }

        if (control)
        {
            if (refChild) //处理组件关系
            {
                if (any = refChild.previousSibling)
                {
                    any.nextSibling = control;
                    control.previousSibling = any;
                }
                else
                {
                    this.firstChild = control;
                }

                refChild.previousSibling = control;
                control.nextSibling = refChild;
            }
            else 
            {
                if (any = this.lastChild)
                {
                    this.lastChild = any.nextSibling = control;
                    control.previousSibling = any;
                }
                else
                {
                    this.firstChild = this.lastChild = control;
                }
            }

            if (this.view)
            {
                //添加增加视图补丁
                if (any = this.__insert_patch)
                {
                    if (control.view)
                    {
                        any.push(control);
                    }
                    else
                    {
                        any[0]++;
                    }
                }
                else
                {
                    this.__insert_patch = control.view ? [0, control] : [1];
                    this.renderer.set(this, '__insert_patch', true);
                }
            }
        }
        else
        {
            insert_array.call(this, controls, refChild);
        }

        if (this.__update_dirty < 2)
        {
            this.invalidate(true);
        }

        return this;
    };


    //移除指定子控件
    this.removeChild = function (control, dispose) {

        var previous, next, any;

        if (control && control.parent === this)
        {
            //清除选择器缓存
            if (flyingon.__query_cache)
            {
                flyingon.__query_clear(this);
            }

            control.parent = null;

            previous = control.previousSibling || null;
            next = control.nextSibling || null;

            if (previous)
            {
                previous.nextSibling = next;
            }
            else
            {
                this.firstChild = next;
            }

            if (next)
            {
                next.previousSibling = previous;
            }
            else
            {
                this.lastChild = previous;
            }

            //清空子视图缓存集合
            this.__children = null;

            if (dispose !== false)
            {
                control.dispose();
            }
            else
            {
                control.previousSibling = next = control.nextSibling = null;

                //添加移除视图补丁
                if (control.view && this.view) 
                {
                    if (any = this.__remove_patch)
                    {
                        any.push(this);
                    }
                    else
                    {
                        this.__remove_patch = [this];
                        this.renderer.set(this, '__remove_patch', true);
                    }
                }
            }

            if (this.__update_dirty < 2)
            {
                this.invalidate(true);
            }
        }

        return this;
    };


    //移除指定位置的子控件
    this.removeAt = function (index, dispose) {

        var item = this.at(index);
        return item ? this.removeChild(item, dispose) : this;
    };


    //清除子控件
    this.clear = function (dispose) {
      
        var item = this.firstChild,
            any;
        
        if (item)
        {
            dispose = dispose !== false;

            //清除选择器缓存
            if (flyingon.__query_cache)
            {
                flyingon.__query_clear(this);
            }

            //不销毁时添加视图清除补丁, 第一个元素为0表示清除所有子项
            if (!dispose && this.view)
            {
                if (any = this.__remove_patch)
                {
                    any.length = 1;
                    any[0] = 0;
                }
                else
                {
                    this.__remove_patch = [0];
                    this.renderer.set(this, '__remove_patch', true);
                }

                //如果之前有插入的视图补丁则清除
                this.__insert_patch = null;
            }

            do
            {
                if (dispose)
                {
                    item.dispose();
                }
                else
                {
                    item.parent = item.previousSibling = item.nextSibling = null;
                }
            }
            while (item = item.nextSibling);

            this.firstChild = this.lastChild = null;

            //清空子视图缓存集合
            this.__children = null;

            if (this.__update_dirty < 2)
            {
                this.invalidate(true);
            }
        }
        
        return this;
    };

               


    //使用选择器查找子控件
    //注:不能超出当前控制器的查询范围
    this.find = function (selector) {

        return new flyingon.Query(selector, [this]);
    };


    
    //查找拖拉放置目标及位置
    this.findDropTarget = function (x, y) {
        
        var control = this.controlAt(x, y);

        if (control)
        {
            //
            
            return [this, control];
        }
        
        return [this, null];
    };
    
    
    
    //查找指定坐标的子控件
    this.controlAt = function (x, y) {
      
        return this;
    };
    
    

    //接收数据集变更动作处理
    this.ondatareceive = function (dataset, action) {
        
        var item = this.firstChild;
        
        this.base.ondatareceive.call(dataset, action);

        //向下派发
        while (item)
        {
            if (!item.__dataset)
            {
                item.ondatareceive(dataset, action);
            }

            item = item.nextSibling;
        }
        
        return this;
    };
    

    
    //是否需要排列
    this.__arrange_dirty = true;

    
    
    //使布局无效
    this.invalidate = function (content) {
        
        var target, any;

        this.__update_dirty = 2;
        this.__arrange_dirty = true;

        if (target = this.parent)
        {
            any = content && !this.$$auto ? 1 : 2;

            if (target.__update_dirty === any)
            {
                return this;
            }

            target.__update_dirty = any;
            any = target;

            while (target = any.parent)
            {
                if (!target.__update_dirty)
                {
                    target.__update_dirty = 1;
                }

                any = target;
            }
        }
        else
        {
            any = this;
        }

        if (any.__top_control)
        {
            flyingon.__delay_update(any);
        }

        return this;
    };



    //更新视区
    this.update = function () {
        
        if (this.view)
        {
            flyingon.__update_patch();

            switch (this.__update_dirty)
            {
                case 2:
                    this.renderer.update(this);
                    break;

                case 1:
                    this.__update_children();
                    break;
            }
        }
        
        return this;
    };


    this.__update_children = function () {

        var item = this.firstChild;

        while (item)
        {
            if (item.view)
            {
                switch (item.__update_dirty)
                {
                    case 2:
                        item.renderer.update(item);
                        break;

                    case 1:
                        item.__update_children();
                        break;
                }
            }

            item = item.nextSibling;
        }

        this.__update_dirty = 0;
    };
    


  
    
    this.deserialize_children = function (reader, values) {
      
        var last, item, index;

        values = this.__children = reader.readArray(values);

        if (values && (item = values[0]))
        {
            index = 1;
            this.firstChild = last = item;

            while (item = values[index++])
            {
                item.previousSibling = last;
                last = last.nextSibling = item;
            }

            this.lastChild = last;
        }
        else
        {
            this.firstChild = this.lastChild = null;
        }
    };




});




flyingon.defineClass('Panel', flyingon.Control, function (base) {



    
    //重写默认宽度
    this.defaultWidth = 400;
    
    //重写默认高度
    this.defaultHeight = 300;

        

    //排列区域
    this.arrangeLeft = this.arrangeTop = this.arrangeRight = this.arrangeBottom = this.arrangeWidth = this.arrangeHeight = 0;



    //重写默认为可放置移动或拖动对象
    this.defaultValue('droppable', true);



    //当前布局
    this.defineProperty('layout', null, {
     
        group: 'locate',
        query: true,
        set: function (value) {

            this.__layout = null;

            if (this.scrollLeft || this.scrollTop)
            {
                this.renderer.__reset_scroll(this);
            }
            
            this.invalidate();
        }
    });
    
    


    //引入容器功能片段
    flyingon.__container_fragment(this);


              

    //测量自动大小
    this.onmeasure = function (auto) {
        
        if (auto)
        {
            this.renderer.update(this);

            if (auto & 1)
            {
                this.offsetWidth = this.arrangeRight + this.borderLeft + this.borderRight;
            }
            
            if (auto & 2)
            {
                this.offsetHeight = this.arrangeBottom + this.borderTop + this.borderBottom;
            }
        }
        else
        {
            return false;
        }
    };
    
        
    
    //查找指定坐标的子控件
    this.controlAt = function (x, y) {
      
        if (!this.firstChild)
        {
            return this;
        }

        var layout = flyingon.getLayout(this),
            any;
    
        x += this.scrollLeft - this.borderLeft;
        y += this.scrollTop - this.borderTop;

        if (any = layout.__sublayouts)
        {
            return (any = layout.controlAt(any, x, y)) ? any.controlAt(x, y) : null;
        }

        return layout.controlAt(this.__children || this.__init_children(), x, y);
    };    


 
    this.serialize = function (writer) {
        
        base.serialize.call(this, writer);
        
        if (this.firstChild)
        {
            writer.writeProperty('children', this.children());
        }
        
        return this;
    };
    

    this.dispose = function (recursion) {

        var item = this.firstChild;
        
        if (item)
        {
            do
            {
                item.dispose(true);
            }
            while (item = item.nextSibling);

            this.firstChild = this.lastChild = this.__children = null;
        }

        return base.dispose.call(this) || this;
    };



}).register('panel');




flyingon.defineClass('ScrollPanel', flyingon.Panel, function (base) {


    //预渲染
    //none: 不启用
    //x:    水平方向预渲染
    //y:    竖直方向预渲染
    //xy:   水平及竖直方向同时预渲染
    this.defineProperty('prerender', 'xy');


    //计算可见控件集合
    this.__compute_visible = function () {

        var list = this.__visible_list,
            x = this.scrollLeft, 
            y = this.scrollTop,
            right = this.offsetWidth,
            bottom = this.offsetHeight,
            item = this.firstChild,
            view = true,
            any;

        any = this.prerender();
        right += x + (any.indexOf('x') >= 0 ? right : 0);
        bottom += y + (any.indexOf('y') >= 0 ? bottom : 0);

        if (list)
        {
            list.length = 0;
        }
        else
        {
            list = this.__visible_list = [];
        }

        while (item)
        {
            if (item.__visible_area =
                (any = item.offsetLeft) < right && any + item.offsetWidth > x && 
                (any = item.offsetTop) < bottom && any + item.offsetHeight > y)
            {
                if (view && !item.view)
                {
                    view = false; //标记有未渲染的子控件
                }

                list.push(item);
            }

            item = item.nextSibling;
        }

        list.unmount = !view;

        return list;
    };



    //处理滚动
    this.__do_scroll = function (x, y) {
    
        this.__compute_visible(x, y);
        this.renderer.scroll(this, x, y);
    };
    
        

}).register('scrollpanel');




flyingon.defineClass('Unkown', flyingon.Control, function (base) {


    this.tagName = '';



    
    //引入容器功能片段
    flyingon.__container_fragment(this);



    //测量自动大小
    this.onmeasure = function (auto, border) {
        
        if (auto)
        {
            this.renderer.measure_auto(this, auto, border);
        }
        else
        {
            return false;
        }
    };


    this.compute = function () {

        this.renderer.compute();
        return this;
    };


 
    this.serialize = function (writer) {
        
        base.serialize.call(this, writer);
        
        if (this.firstChild)
        {
            writer.writeProperty('children', this.children());
        }
        
        return this;
    };
    

    this.dispose = function (recursion) {

        var item = this.firstChild;
        
        if (item)
        {
            do
            {
                item.dispose(true);
            }
            while (item = item.nextSibling);

            this.firstChild = this.lastChild = this.__children = null;
        }

        return base.dispose.call(this) || this;
    };



});




flyingon.defineClass('Tab', flyingon.Control, function (base) {



}).register('tab');




flyingon.defineClass('TabPanel', flyingon.Panel, function (base) {


}).register('tabpanel');




flyingon.defineClass('Tree', flyingon.Control, function (base) {



}).register('tree');




/**
* 弹出层组件
* 
* 事件:
* open: 打开事件
* autoclosing: 鼠标点击弹出层外区域时自动关闭前事件(可取消)
* closing: 关闭前事件(可取消)
* closed: 关闭后事件
*/
flyingon.defineClass('PopupLayer', flyingon.Panel, function () {



    //设置为顶级控件
    this.__top_control = true;


    //弹出层是否已显示
    this.shown = false;

    
    this.defaultValue('border', 1);

    this.defaultValue('width', 'auto');

    this.defaultValue('height', 'auto');


    //鼠标移出弹出层时是否自动关闭
    this.defineProperty('closeLeave', false);


    //鼠标离弹出层越来越远时是否自动关闭
    this.defineProperty('closeAway', false);
    
    
    //停靠方向 bottom:下面 top:上面 right:右边 left:左边
    this.defineProperty('direction', 'bottom');
    
    
    //对齐 left|center|right|top|middle|bottom
    this.defineProperty('align', 'left');
    
    
    //空间不足时是否反转方向
    this.defineProperty('reverse', true);


    //关闭时是否自动销毁
    this.defineProperty('autoDispose', true);
    


    //打开弹出层
    this.show = function (reference, offset) {

        this.renderer.show(this, reference, offset, this.direction(), this.align(), this.reverse());
        this.shown = true;

        return this;
    };


    //在指定的位置打开弹出层
    this.showAt = function (left, top) {

        this.renderer.showAt(this, left, top);
        this.shown = true;

        return this;
    };



    //关闭弹出层(弹出多级窗口时只有最后一个可以成功关闭)
    //closeType: 关闭类型 ok, cancel, auto
    this.close = function (closeType) {

        closeType = closeType || 'ok';

        if (this.trigger('closing', 'closeType', closeType) === false)
        {
            return false;
        }

        this.view && this.renderer.close(this);
        this.trigger('closed', 'closeType', closeType);
        this.shown = false;

        if (this.autoDispose())
        {
            this.dispose();
        }

        return this;
    };
    


}).register('popuplayer');




flyingon.defineClass('Dialog', flyingon.Panel, function (base) {



    //设置为顶级控件
    this.__top_control = true;


    //窗口是否已显示
    this.shown = false;


    this.defaultValue('border', 1);

    this.defaultValue('padding', 2);

    this.defaultValue('movable', true);


    //头部高度        
    this.defineProperty('headerHeight', 0, {

        set: function (value) {

            this.renderer.set(this, 'headerHeight', value);
        }
    });


    //窗口图标        
    this.defineProperty('icon', '', {

        set: function (value) {

            this.renderer.set(this, 'icon', value);
        }
    });


    //窗口标题
    this.defineProperty('title', '', {

        set: function (value) {

            this.renderer.set(this, 'title', value);
        }
    });


    //是否显示关闭按钮
    this.defineProperty('closable', true, {

        set: function (value) {

            this.renderer.set(this, 'closable', value);
        }
    });


    //关闭时是否自动销毁
    this.defineProperty('autoDispose', true);



    //测量自动大小
    this.onmeasure = function (auto) {
        
        if (auto)
        {
            this.renderer.update(this);
            
            if (auto & 1)
            {
                this.offsetWidth = this.arrangeRight + this.borderLeft + this.borderRight;
            }
            
            if (auto & 2)
            {
                this.offsetHeight = this.headerHeight() + this.arrangeBottom + this.borderTop + this.borderBottom;
            }
        }
        else
        {
            return false;
        }
    };



    this.show = function (left, top) {
        
        this.renderer.show(this, left, top);
        return this;
    };


    this.showDialog = function (left, top) {
        
        this.renderer.show(this, left, top, true);
        return this;
    };

        
    this.close = function (closeType) {

        if (!closeType)
        {
            closeType = 'ok';
        }

        if (this.trigger('closing', 'closeType', closeType) !== false)
        {
            this.view && this.renderer.close(this);

            this.trigger('closed', 'closeType', closeType);
            this.shown = false;

            if (this.autoDispose())
            {
                this.dispose();
            }
        }

        return this;
    };



}).register('dialog');




flyingon.MessageBox = flyingon.defineClass(flyingon.Control, function (base) {


    //设置为顶级控件
    this.__top_control = true;


    this.defaultValue('border', 1);

    this.defaultValue('padding', 2);

    this.defaultValue('minWidth', 100);

    this.defaultValue('movable', true);



    //是否显示头部
    this.defineProperty('header', true);


    //窗口标题
    this.defineProperty('title', '');


    //窗口图标        
    this.defineProperty('icon', '');


    //是否显示关闭按钮
    this.defineProperty('closable', true);


    //消息框类型
    this.defineProperty('type', '');


    //文本内容
    this.defineProperty('text', '');

    
    //显示按钮
    this.defineProperty('buttons', '');



    this.show = function () {
        
        this.renderer.show(this);
        return this;
    };


    this.close = function (button) {

        this.view && this.renderer.close(this);
        this.trigger('closed', 'button', button);
        this.dispose();
        
        return this;
    };


});



flyingon.showMessage = function (options) {

    var control = new flyingon.MessageBox(),
        fn;

    if (options)
    {
        if (typeof options === 'string')
        {
            control.text(options);
        }
        else
        {
            for (var name in options)
            {
                if (name === 'closed')
                {
                    control.on('closed', options[name]);
                }
                else if (typeof (fn = control[name]) === 'function')
                {
                    fn.call(control, options[name]);
                }
            }
        }
    }

    control.show();

    return control;
};




//子布局
flyingon.Sublayout = flyingon.defineClass(flyingon.Control, function (base) {
       
    
        
    //子项占比
    this.defineProperty('scale', 0, {
     
        check: function (value) {

            return value > 0 ? value : 0;
        }
    });
    
    
    //布局
    this.defineProperty('layout', null, {
     
        set: function () {

            this.__layout = null;
        }
    });
    
    
    //指定默认大小
    this.defaultWidth = this.defaultHeight = 200;
    
        
    
    this.onmeasure = function (auto) {

        flyingon.arrange(this, this.__children, false, false, true);
        
        if (auto)
        {
            if (auto & 1)
            {
                this.offsetWidth = this.arrangeRight + this.borderLeft + this.borderRight;
            }
            
            if (auto & 2)
            {
                this.offsetHeight = this.arrangeBottom + this.borderTop + this.borderBottom;
            }
        }
        else
        {
            return false;
        }
    };
    
        
    this.onlocate = function () {
        
        var items = this.__children,
            x = this.offsetLeft,
            y = this.offsetTop,
            item;
        
        //处理定位偏移
        if (items && (x || y))
        {
            for (var i = items.length - 1; i >= 0; i--)
            {
                if (item = items[i])
                {
                    item.offsetLeft += x;
                    item.offsetTop += y;
                }
            }
        }
        
        return false;
    };


    this.controlAt = function (x, y) {

        var layout = this.__layout;
        return layout ? layout.controlAt(this.__children, x, y) : null;
    };
    
    
    //重载方法禁止绘制
    this.update = function () {};
    
    
});




//布局基类
flyingon.Layout = flyingon.defineClass(function () {

    

    //注册的布局列表
    var registry_list = flyingon.create(null); 
    
    //已定义的布局集合
    var layouts = flyingon.create(null); 

    
    
    //布局类型
    this.type = null;

    
    
    //自适应布局条件
    this.defineProperty('condition', null);
    
    
    //布局间隔宽度
    //length	规定以具体单位计的值 比如像素 厘米等
    //number%   控件客户区宽度的百分比
    this.defineProperty('spacingX', '2');

    //布局间隔高度
    //length	规定以具体单位计的值 比如像素 厘米等
    //number%   控件客户区高度的百分比
    this.defineProperty('spacingY', '2');


    //是否按照从右到左的顺序排列
    this.defineProperty('rtl', false);

   
    //子项定位属性值
    this.defineProperty('location', null, {

        set: function (value) {

            this.__location = typeof value === 'function' ? value : null;
        }
    });

    
    //分割子布局
    this.defineProperty('sublayouts', null, {
       
        set: function (value) {

            this.__sublayouts = !!value;
        }
    });
    
    
            
    //获取或切换而已或定义布局
    flyingon.layout = function (name, values) {
    
        if (name && values && typeof values !== 'function') //定义布局
        {
            layouts[name] = [values, null];
        }
        else
        {
            return flyingon.load.key('layout', name, values); //获取或设置当前布局
        }
    };
    
    
    
    //排列容器控件
    flyingon.arrange = function (container, items, hscroll, vscroll, sublayout) {
        
        var auto = container.__auto_size & 2, 
            any;

        //计算排列区域
        container.arrangeLeft = container.paddingLeft;
        container.arrangeTop = container.paddingTop;

        any = container.borderLeft + container.borderRight + container.paddingLeft + container.paddingRight;
        any = container.offsetWidth - any;

        container.arrangeWidth = any > 0 ? any : 0;

        //高度为auto时排列高度为0
        if (auto)
        {
            any = 0;
        }
        else
        {
            any = container.borderTop + container.borderBottom + container.paddingTop + container.paddingBottom;
            any = container.offsetHeight - any;
            
            if (any < 0)
            {
                any = 0;
            }
        }
        
        container.arrangeHeight = any;
        
        if (any = container.arrangeArea)
        {
            any.call(container);

            //高度为auto时保证排列高度为0
            if (auto)
            {
                container.arrangeHeight = 0;
            }
        }

        container.arrangeRight = container.arrangeLeft;
        container.arrangeBottom = container.arrangeTop;
        
        //排列子控件
        if (items && items.length > 0)
        {
            arrange(any = flyingon.getLayout(container), container, items, hscroll, vscroll, sublayout);
                    
            if (hscroll)
            {
                container.__hscroll = container.arrangeRight > container.arrangeLeft + container.arrangeWidth;
            }

            if (vscroll)
            {
                container.__vscroll = container.arrangeBottom > container.arrangeTop + container.arrangeHeight;
            }
            
            container.arrangeRight += container.paddingRight;
            container.arrangeBottom += container.paddingBottom;

            //非子布局 从左向左处理(注:子布局不需处理,由上层布局统一处理)
            if (!sublayout && (flyingon.rtl || any.rtl()))
            {
                arrange_rtl(container, items);
            }
        }
        else
        {
            container.__hscroll = container.__vscroll = false;
        }
    };
    
    
    //获取指定控件关联的布局实例
    flyingon.getLayout = function (container) {
        
        var layout = container.__layout,
            any;
        
        //获取当前布局对象
        if (!layout && typeof (any = container.layout) === 'function')
        {
            layout = container.__layout = find_layout(any.call(container));
        }
        
        //数组按自适应布局处理
        if (layout instanceof Array)
        {
            layout = check_adaption(layout, container.offsetWidth, container.offsetHeight);
        }
        
        return layout;
    };
    
                
    //查找布局实例
    function find_layout(key) {
      
        if (key)
        {
            if (typeof key === 'string')
            {
                if (key = layouts[key])
                {
                    return key[1] || (key[1] = deserialize_layout(key[0]));
                }
            }
            else
            {
                return deserialize_layout(key);
            }
        }
  
        return new registry_list.flow();
    };


    //检测自适应
    function check_adaption(layouts, width, height) {

        var layout, item, condition, value;

        for (var i = 0, l = layouts.length; i < l; i++)
        {
            if (item = layouts[i])
            {
                if (condition = item.condition)
                {
                    if ((value = condition.width) && (width < value[0] || width > value[1]))
                    {
                        continue;
                    }

                    if ((value = condition.height) && (height < value[0] || height > value[1]))
                    {
                        continue;
                    }

                    layout = item;
                    break;
                }
                else
                {
                    layout = item;
                }
            }
        }

        if (layout)
        {
            return layout.__layout || (layout.__layout = deserialize_layout(layout, false));
        }

        return new registry_list.flow();
    };
    
    
    //反序列化布局实例
    function deserialize_layout(data, adaption) {
        
        //数组为自适应布局
        if (adaption !== false && data instanceof Array)
        {
            return data;
        }

        var layout = new (registry_list[data && data.type] || registry_list.flow)();
        
        layout.deserialize(flyingon.SerializeReader.instance, data);
        return layout;
    };

    
    //内部排列方法
    function arrange(layout, container, items, hscroll, vscroll) {

        var sublayouts, location, item;
                            
        //处理子布局(注:子布局不支持镜象,由上层布局统一处理)
        if (sublayouts = layout.__sublayouts)
        {
            if (sublayouts === true)
            {
                sublayouts = layout.__sublayouts = init_sublayouts(layout.sublayouts());
            }
 
            //分配置子布局子项
            allot_sublayouts(sublayouts, items);
             
            //先排列子布局
            items = sublayouts;
        }
        
        if (location = layout.__location) //处理强制子项值
        { 
            for (var i = items.length - 1; i >= 0; i--)
            {
                item = items[i];
                location.prototype = item.__storage || item.__defaults;

                item.__location_values = new location(container, item, i);
            }

            location.prototype = null;
        }
        else //清空原有强制子项属性
        {
            for (var i = items.length - 1; i >= 0; i--)
            {
                item = items[i];
                item.__location_values = null;
            }
        }
        
        //排列
        if (hscroll || vscroll)
        {
            arrange_auto(layout, container, items, hscroll, vscroll);
        }
        else
        {
            layout.arrange(container, items);
        }
    };
    
    
    //初始化子布局
    function init_sublayouts(values) {
        
        var index = values.length;
        
        if (!index)
        {
            values = [values];
            index = 1;
        }
        
        var reader = flyingon.SerializeReader,
            layouts = new Array(values.length),
            fixed = 0,
            weight = 0,
            layout,
            scale,
            any;
        
        while (any = values[--index])
        {
            (layout = layouts[index] = new flyingon.Sublayout()).deserialize(reader, any);
            
            if (scale = layout.scale())
            {
                if (layout.fixed = any = scale | 0)
                {
                    fixed += any;
                }

                if (layout.weight = any = scale - any)
                {
                    weight += any;
                }
            }
            else
            {
                layout.fixed = 0;
                weight += (layout.weight = 1);
            }
        }
        
        layouts.fixed = fixed;
        layouts.weight = weight;
        
        return layouts;
    };
    
    
    //分配子布局子项
    function allot_sublayouts(layouts, items) {
        
        var margin = items.length - layouts.fixed, //余量
            weight = layouts.weight,
            index = 0;
        
        if (margin < 0)
        {
            margin = 0;
        }
        
        for (var i = 0, l = layouts.length; i < l; i++)
        {
            var layout = layouts[i],
                length = layout.fixed,
                scale = layout.weight,
                value;
            
            if (scale)
            {
                value = margin * scale / weight | 0;
                weight -= scale;
                
                length += value;
                margin -= value;
            }

            layout.__children = items.slice(index, index += length);
        }
    };
        

    //自动滚动条排列
    function arrange_auto(layout, container, items, hscroll, vscroll) {

        var x, y;

        //上次有水平滚动条先减去滚动条高度
        if (hscroll && container.hscroll)
        {
            if ((container.arrangeHeight -= flyingon.hscroll_height) < 0)
            {
                container.arrangeHeight = 0;
            }

            x = true;
        }

        //上次有竖直滚动条先减去滚动条宽度
        if (vscroll && container.vscroll)
        {
            if ((container.arrangeWidth -= flyingon.vscroll_width) < 0)
            {
                container.arrangeWidth = 0;
            }

            y = true;
        }

        //按上次状态排列
        layout.arrange(container, items, x ? false : hscroll, y ? false : vscroll);

        //按水平滚动条排列后但结果无水平滚动条
        if (x = x && container.arrangeRight <= container.arrangeLeft + container.arrangeWidth)
        {
            container.arrangeHeight += flyingon.hscroll_height;
        }

        //按竖直滚动条排列后但结果无竖直滚动条
        if (y = y && container.arrangeBottom <= container.arrangeTop + container.arrangeHeight)
        {
            container.arrangeWidth += flyingon.vscroll_width;
        }

        //出现上述情况则重排
        if (x || y)
        {
            layout.arrange(container, items);
        }
    };

        
    //从右到左排列
    function arrange_rtl(container, items) {

        var width = container.arrangeWidth,
            any = container.arrangeRight;
        
        if (width < any)
        {
            width = any;
        }
        
        for (var i = 0, l = items.length; i < l; i++)
        {
            if (any = items[i])
            {
                any.offsetLeft = width - any.offsetLeft - any.offsetWidth;
            }
        }
    };

    
    
    //排列布局
    this.arrange = function (container, items, hscroll, vscroll) {

    };
    
    
    //重排
    this.rearrange = function (container, items, hscroll, vscroll) {
 
        var flag = false;
        
        if (hscroll && (hscroll === 1 || container.arrangeRight > container.arrangeLeft + container.arrangeWidth))
        {
            if ((container.arrangeHeight -= flyingon.hscroll_height) < 0)
            {
                container.arrangeHeight = 0;
            }
            
            hscroll = false;
            flag = true;
        }
        
        if (vscroll && (vscroll === 1 || container.arrangeBottom > container.arrangeTop + container.arrangeHeight))
        {
            if ((container.arrangeWidth -= flyingon.vscroll_width) < 0)
            {
                container.arrangeWidth = 0;
            }
            
            vscroll = false;
            flag = true;
        }
        
        if (flag)
        {
            container.arrangeRight = container.arrangeLeft;
            container.arrangeBottom = container.arrangeTop;
            
            this.arrange(container, items, hscroll, vscroll, true);
            return true;
        }
    };
    
    
    
    //查找指定坐标的子控件
    this.controlAt = function (items, x, y) {
        
        var item, any;
        
        for (var i = 0, l = items.length; i < l; i++)
        {
            if ((item = items[i]) && 
                x >= (any = item.offsetLeft) && x <= any + item.offsetWidth &&
                y >= (any = item.offsetTop) && y <= any + item.offsetHeight)
            {
                return items[i];
            }
        }

        return null;
    };
    
       
    
    //引入序列化功能片段
    flyingon.__serialize_fragment(this);
    
    
    
    //设置不反序列化type属性
    this.deserialize_type = true;
    
            

    this.__class_init = function (Class, base) {

        if (base.__class_init)
        {
            var type = this.type;
            
            if (type)
            {
                registry_list[type] = Class;
                layouts[type] = [null, new Class()];
            }
            else
            {
                throw flyingon.errortext('flyingon', 'layout type').replace('{0}', Class.xtype);
            }
        }
    };
        

});



//单列布局类
flyingon.defineClass(flyingon.Layout, function (base) {


    this.type = 'line';
    
        
    //排列布局
    this.arrange = function (container, items, hscroll, vscroll) {

        var x = container.arrangeLeft,
            y = container.arrangeTop,
            width = container.arrangeWidth,
            height = container.arrangeHeight,
            right = x + width,
            spacingX = flyingon.pixel(this.spacingX(), width),
            control;
        
        //先按无滚动条的方式排列
        for (var i = 0, l = items.length; i < l; i++)
        {
            control = items[i];
            control.measure(width, height, right - x || -1, height, 2);
            control.locate(x, y, 0, height, container);

            if (hscroll && container.arrangeRight > right)
            {
                return this.rearrange(container, items, 1, false);
            }

            x = container.arrangeX + spacingX;
        }
    };
    
    
});



//纵向单列布局类
flyingon.defineClass(flyingon.Layout, function (base) {


    this.type = 'vertical-line';
    
        
    //排列布局
    this.arrange = function (container, items, hscroll, vscroll) {

        var x = container.arrangeLeft,
            y = container.arrangeTop,
            width = container.arrangeWidth,
            height = container.arrangeHeight,
            bottom = y + height,
            spacingY = flyingon.pixel(this.spacingY(), height),
            control;
        
        //先按无滚动条的方式排列
        for (var i = 0, l = items.length; i < l; i++)
        {
            control = items[i];
            control.measure(width, height, width, bottom - height || -1, 1);
            control.locate(x, y, width, 0, container);

            if (vscroll && container.arrangeBottom > bottom)
            {
                return this.rearrange(container, items, false, 1);
            }

            y = container.arrangeY + spacingY;
        }
    };
    
    
});



//流式布局类
flyingon.defineClass(flyingon.Layout, function (base) {


    this.type = 'flow';


    //行高
    this.defineProperty('lineHeight', '0', {
     
        dataType: 'integer',
        check: function (value) {

            return value > 0 ? value : 0;
        }
    });
    
    

    //排列布局
    this.arrange = function (container, items, hscroll, vscroll) {

        var x = container.arrangeLeft,
            y = container.arrangeTop,
            width = container.arrangeWidth,
            height = container.arrangeHeight,
            right = x + width,
            bottom = y + height,
            pixel = flyingon.pixel,
            spacingX = pixel(this.spacingX(), width),
            spacingY = pixel(this.spacingY(), height),
            lineHeight = pixel(this.lineHeight(), height),
            left = x,
            control;

        for (var i = 0, l = items.length; i < l; i++)
        {
            (control = items[i]).measure(width, height, right - x || -1, lineHeight || -1);

            //处理换行
            if (x > left && (x + control.offsetWidth + control.marginRight > right))
            {
                x = left;
                y = (lineHeight ? y + lineHeight : container.arrangeBottom) + spacingY;
            }

            control.locate(x, y, 0, lineHeight, container);

            //出现滚动条后重排
            if (vscroll && container.arrangeBottom > bottom)
            {
                return this.rearrange(container, items, false, 1);
            }

            x = container.arrangeX + spacingX;
        }
    };

    
});



//流式布局类
flyingon.defineClass(flyingon.Layout, function (base) {


    this.type = 'vertical-flow';


    //行宽
    this.defineProperty('lineWidth', '0', {
     
        dataType: 'integer',
        check: function (value) {

            return value > 0 ? value : 0;
        }
    });


    
    //排列布局
    this.arrange = function (container, items, hscroll, vscroll) {

        var x = container.arrangeLeft,
            y = container.arrangeTop,
            width = container.arrangeWidth,
            height = container.arrangeHeight,
            right = x + width,
            bottom = y + height,
            pixel = flyingon.pixel,
            spacingX = pixel(this.spacingX(), width),
            spacingY = pixel(this.spacingY(), height),
            lineWidth = pixel(this.lineWidth(), width),
            top = y,
            control;

        for (var i = 0, l = items.length; i < l; i++)
        {
            (control = items[i]).measure(width, height, lineWidth || -1, bottom - y || -1);

            //处理换行
            if (y > top && (y + control.offsetHeight + control.marginBottom > bottom))
            {
                x = (lineWidth ? x + lineWidth : container.arrangeRight) + spacingX;
                y = top;
            }

            control.locate(x, y, lineWidth, 0, container);

            //出现滚动条后重排
            if (hscroll && container.arrangeRight > right)
            {
                return this.rearrange(container, items, 1, false);
            }

            y = container.arrangeY + spacingY;
        }
    };

    
});



//停靠布局类
flyingon.defineClass(flyingon.Layout, function (base) {


    this.type = 'dock';
    
    
    //排列布局
    this.arrange = function (container, items, hscroll, vscroll) {

        var x = container.arrangeLeft,
            y = container.arrangeTop,
            width = container.arrangeWidth,
            height = container.arrangeHeight,
            right = x + width,
            bottom = y + height,
            arrangeWidth = width,
            arrangeHeight = height,
            pixel = flyingon.pixel,
            spacingX = pixel(this.spacingX(), width),
            spacingY = pixel(this.spacingY(), height),
            list,
            control;

        for (var i = 0, l = items.length; i < l; i++)
        {
            control = items[i];

            switch (control.locationValue('dock'))
            {
                case 'left':
                    control.measure(arrangeWidth, arrangeHeight, width, height, 2);
                    control.locate(x, y, 0, height, container);

                    if ((width = right - (x = container.arrangeX + spacingX)) < 0)
                    {
                        width = 0;
                    }
                    break;

                case 'top':
                    control.measure(arrangeWidth, arrangeHeight, width, height, 1);
                    control.locate(x, y, width, 0, container);

                    if ((height = bottom - (y = container.arrangeY + spacingY)) < 0)
                    {
                        height = 0;
                    }
                    break;

                case 'right':
                    control.measure(arrangeWidth, arrangeHeight, width, height, 2);
                    
                    right -= control.offsetWidth - control.marginLeft - control.marginRight;
                    control.locate(right, y, 0, height, container);

                    if ((width = (right -= spacingX) - x) < 0)
                    {
                        width = 0;
                    }
                    break;

                case 'bottom':
                    control.measure(arrangeWidth, arrangeHeight, width, height, 1);
                    
                    bottom -= control.offsetHeight - control.marginTop - control.marginBottom;
                    control.locate(x, bottom, width, 0, container);

                    if ((height = (bottom -= spacingY) - y) < 0)
                    {
                        height = 0;
                    }
                    break;

                default:
                    (list || (list = [])).push(control);
                    continue;
            }
        }
        
        //排列充满项
        if (list)
        {
            for (var i = 0, l = list.length; i < l; i++)
            {
                control.measure(arrangeWidth, arrangeHeight, width, height, 3);
                control.locate(x, y, width, height, container);
            }
        }
        
        //检查是否需要重排
        if (hscroll || vscroll)
        {
            this.rearrange(container, items, hscroll, vscroll);
        }
    };

    
});



//层叠布局类
flyingon.defineClass(flyingon.Layout, function (base) {


    this.type = 'cascade';
    
    
    //排列布局
    this.arrange = function (container, items, hscroll, vscroll) {

        var x = container.arrangeLeft,
            y = container.arrangeTop,
            width = container.arrangeWidth,
            height = container.arrangeHeight,
            control;

        for (var i = 0, l = items.length; i < l; i++)
        {
            control = items[i];
            control.measure(width, height);
            control.locate(x, y, width, height, container);
        }
        
        //检查是否需要重排
        if (hscroll || vscroll)
        {
            this.rearrange(container, items, hscroll, vscroll);
        }
    };
    
    
    //查找指定坐标的子控件
    this.controlAt = function (items, x, y) {
        
        return -1;
    };
    
    
});



//绝对定位布局类
flyingon.defineClass(flyingon.Layout, function (base) {


    this.type = 'absolute';
    
    
    //排列布局
    this.arrange = function (container, items, hscroll, vscroll) {

        var x = container.arrangeLeft,
            y = container.arrangeTop,
            width = container.arrangeWidth,
            height = container.arrangeHeight,
            right = x + width,
            bottom = y + height,
            fn = flyingon.pixel,
            control,
            location,
            left,
            top;

        for (var i = 0, l = items.length; i < l; i++)
        {
            control = items[i];
            location = control.__location_values || control.__storage || control.__defaults;

            left = x + fn(location.left, width);
            top = y + fn(location.top, height);

            control.measure(width, height, right - x, bottom - y);
            control.locate(left, top, 0, 0, container);
        }
    };
    
    
    //查找指定坐标的子控件
    this.controlAt = function (items, x, y) {
        
        return -1;
    };
    
    
});



//均分布局
flyingon.defineClass(flyingon.Layout, function (base) {
    
    
    this.type = 'uniform';
    
    
    //固定大小
    this.defineProperty('size', 20);
    
    
    
    //排列布局
    this.arrange = function (container, items, hscroll, vscroll) {

        var x = container.arrangeLeft,
            y = container.arrangeTop,
            width = container.arrangeWidth,
            height = container.arrangeHeight,
            length = items.length,
            size = this.size(),
            weight = length - 1,
            spacing = width - size * length,
            control,
            value;

        for (var i = 0; i < length; i++)
        {
            (control = items[i]).measure(width, height, size, height, 3);
            control.locate(x, y, 0, height, container);
            
            value = spacing / weight | 0;
            
            x += control.offsetWidth + value;
            
            spacing -= value;
            weight--;
        }
    };
    
    
    //查找指定坐标的子控件
    this.controlAt = function (items, x, y) {
        
        var item, any;
        
        for (var i = 0, l = items.length; i < l; i++)
        {
            if ((item = items[i]) && x >= (any = item.offsetLeft) && x <= any + item.offsetWidth)
            {
                return items[i];
            }
        }

        return null;
    };
    
    
});




//布局格
(function (layout) {
    
    
    
    //行列格式: row[column ...] ... row,column可选值: 
    //整数            固定行高或列宽 
    //数字+%          总宽度或高度的百分比 
    //数字+*          剩余空间的百分比, 数字表示权重, 省略时权重默认为100
    //数字+css单位    指定单位的行高或列宽
    //列可嵌套表或表组 表或表组可指定参数
    //参数集: <name1=value1 ...>   多个参数之间用逗号分隔
    //嵌套表: {<参数集> row[column ...] ...} 参数集可省略
    //示例(九宫格正中内嵌九宫格,留空为父表的一半): '*[* * *] *[* *{(50% 50%) L*[* * *]^3} *] *[* * *]'
    
    
    var parse_list = flyingon.create(null),
        
        regex_loop = /L([^L\^]+)\^(\d+)/g,
                
        regex_parse = /[*%.\w]+|[\[\]{}()!]/g;
    
    
    
    //解析布局
    layout.parse = function (text) {
        
        var items = parse_list[text],
            tokens;
        
        if (items)
        {
            return items.clone();
        }
        
        items = new Group();
        
        if (tokens = parse_loop(text || (text = '')).match(regex_parse))
        {
            items.parse(tokens, 0);
        }

        return parse_list[text] = items;
    };
        
    
    //解析循环
    function parse_loop(text) {
    
        var regex = regex_loop,
            loop;
        
        function fn(_, text, length) {
            
            var items = [];
            
            do
            {
                items.push(text);
            }
            while (--length > 0);
            
            loop = true;
            
            return items.join(' ');
        };
        
        do
        {
            loop = false;
            text = text.replace(regex, fn);
        }
        while (loop);
        
        return text;
    };
    
    
        
    //布局单元格
    var Cell = layout.Cell = flyingon.defineClass(function () {
        
                
        //值
        this.value = 0;
        
        //单位
        this.unit = '';
        
        //是否禁用
        this.disabled = false;
        
        //子组
        this.group = null;
        
        
        //开始坐标
        this.start = 0;
        
        //大小
        this.size = 0;
        
        
        
        //复制
        this.clone = function () {
          
            var cell = new Cell(),
                any;
            
            cell.value = this.value;
            cell.unit = this.unit;
            cell.size = this.size;
            cell.disabled = this.disabled;
            
            if (any = this.group)
            {
                cell.group = any.clone();
            }
                        
            return cell;
        };
        
        
    }, false);
    
    
    
    //布局组
    var Group = layout.Group = flyingon.defineClass(function () {
        

        var pixel = flyingon.pixel,
            parse = parseFloat;
        
        
        //子项数
        this.length = 0;
                
        //子项固定值总数
        this.fixed = 0;
                
        //子项权重总数
        this.weight = 0;
        
        //子项百分比集合
        this.persent = null;
                
        //参数集
        this.parameters = null;
        
        
        //开始位置
        this.start = 0;
        
        //大小
        this.size = 0;
        
        
        
        //解析
        this.parse = function (tokens, index) {

            var length = this.length,
                token,
                cell, 
                value;

            while (token = tokens[index++])
            {
                switch (token)
                {
                    case '[':
                    case '{':
                        if (!cell)
                        {
                            cell = this[length++] = new Cell();
                            cell.value = 100;
                            cell.weight = 100;

                            this.width += 100;
                        }

                        index = (cell.group = new Group()).parse(tokens, index);
                        break;

                    case ']':
                    case '}':
                        this.length = length;
                        return index;

                    case '(':
                        while ((token = tokens[index++]) !== ')')
                        {
                            if (token.indexOf('%') < 0)
                            {
                                token = pixel(token);
                            }

                            (this.parameters || (this.parameters = [])).push(token);
                        }
                        break;

                    case '!':
                        cell && (cell.disabled = true);
                        break;

                    default:
                        cell = this[length++] = new Cell();
                        
                        if (token === '*')
                        {
                            cell.value = 100;
                            cell.unit = '*';

                            this.weight += 100;
                        }
                        else if ((value = parse(token)) === value) //可转为有效数字
                        {
                            switch (cell.unit = token.replace(value, ''))
                            {
                                case '*':
                                    this.weight += value;
                                    break;

                                case '%':
                                    (this.percent || (this.persent = [])).push(this.value);
                                    break;

                                default:
                                    this.fixed += (value = cell.size = pixel(token));
                                    break;
                            }

                            cell.value = value;
                        }
                        break;
                }
            }

            this.length = length;
            return index;
        };
        
        
        //获取可用单元格总数
        this.count = function (index) {
            
            var count = 0,
                any;
            
            index |= 0;
            
            while (any = this[index++])
            {
                if (any.disabled)
                {
                    continue;
                }

                if (any = any.group)
                {
                    count += any.count();
                }
                else
                {
                    count++;
                }
            }
            
            return count;
        };
        
        
        //复制子项
        function copy_cell(start, end) {
            
            var length = this.length,
                cell;
            
            for (var i = start; i < end; i++)
            {
                if (cell = this[i])
                {
                    switch (cell.unit)
                    {
                        case '*':
                            this.weight += cell.value;
                            break;
                            
                        case '%':
                            this.persent.push(cell.value);
                            break;
                            
                        default:
                            this.fixed += cell.value;
                            break;
                    }
  
                    this[length++] = cell.clone();
                }
            }
            
            this.length = length;
        };
        
        
        //计算自动增长
        function auto_cell(auto, total) {
            
            var start, end, any;
            
            if (auto === false)
            {
                if (auto = this.__auto)
                {
                    [].splice.call(this, auto.length);
                        
                    this.fixed = auto.fixed;
                    this.weight = auto.weight;
                    
                    if (any = auto.persent)
                    {
                        this.persent.splice(any);
                    }
                }
            }
            else if (auto > 0 && (total -= this.count()) > 0)
            {
                if ((start = (end = this.length) - auto) < 0)
                {
                    start = 0;
                }
                
                if ((auto = this.count(start)) > 0)
                {
                    //记录原始auto值
                    this.__auto = {

                        length: end,
                        fixed: this.fixed,
                        weight: this.weight,
                        persent: (any = this.persent) && any.length
                    };
                    
                    auto = Math.ceil(total / auto);
                    
                    for (var i = 0; i < auto; i++)
                    {
                        copy_cell.call(this, start, end);
                    }

                    return this.length;
                }
            }
        };
        
        
        //测量
        this.measure = function (width, height, spacingX, spacingY, vertical, auto, items) {
            
            var keys = [width, height, spacingX, spacingY, vertical, auto, 0];
            
            if (auto > 0)
            {
                keys[6] = auto_cell.call(this, auto, items.length);
            }
            else if (this.__auto)
            {
                auto_cell.call(this, false);
            }
            
            //如果缓存了排列则跳过
            if (this.__keys !== (keys = keys.join(',')))
            {
                this.compute(width, height, spacingX, spacingY, vertical);                
                this.__keys = keys;
            }
        };
        
        
        //计算位置
        this.compute = function (width, height, spacingX, spacingY, vertical) {
            
            var list = this.parameters,
                weight = this.weight,
                start = 0,
                length = this.length,
                cell,
                size,
                spacing, 
                any;
            
            this.width = width;
            this.height = height;

            if (list)
            {
                if (any = list[0])
                {
                    spacingX = any > 0 ? any : pixel(any, spacingX);
                }

                if (any = list[1])
                {
                    spacingY = any > 0 ? any : pixel(any, spacingY);
                }
            }
            
            if (vertical = !vertical)
            {
                size = height;
                spacing = spacingY;
            }
            else
            {
                size = width;
                spacing = spacingX;
            }
            
            //计算百分比
            if (size > 0 && (list = this.persent))
            {
                list = list.slice(0);
                any = 0;
                
                for (var i = list.length - 1; i >= 0; i--)
                {
                    any += (list[i] = (size * list[i] / 100 + 0.5) | 0);
                }
                
                if ((size -= any) < 0)
                {
                    size = 0;
                }
                
                list.index = 0;
            }
            
            //减去固定尺寸
            if (size > 0 && (size -= this.fixed + spacing * (length - 1)) < 0)
            {
                size = 0;
            }
            
            //计算余量
            for (var i = 0; i < length; i++)
            {
                if (cell = this[i])
                {
                    switch (cell.unit)
                    {
                        case '*':
                            if (size > 0)
                            {
                                any = cell.value;
                                size -= (cell.size = any * size / weight | 0);
                                weight -= any;
                            }
                            else
                            {
                                cell.size = 0;
                            }
                            break;
                            
                        case '%':
                            cell.size = list[list.index++] || 0;
                            break;
                    }
                    
                    cell.start = start;
                    start += cell.size + spacing;
                    
                    //排列子项
                    if (any = cell.group)
                    {
                        if (vertical)
                        {
                            any.compute(width, cell.size, spacingX, spacingY, vertical);
                        }
                        else
                        {
                            any.compute(cell.size, height, spacingX, spacingY, vertical);
                        }
                    }
                }
            }
        };
            
        
        //复制
        this.clone = function () {
            
            var target = new this.Class(),
                length = this.length,
                any;
            
            target.length = length;
            target.fixed = this.fixed;
            target.weight = this.weight;
            target.parsent = (any = this.persent) && any.slice(0);
            target.parameters = this.parameters;
            
            if ((any = this.length) > 0)
            {
                for (var i = 0; i < any; i++)
                {
                    target[i] = this[i].clone(); 
                }
            }
            
            return target;
        };

        
    }, false);
    
    
    
})(flyingon.Layout);



//表格布局类
flyingon.defineClass(flyingon.Layout, function (base) {

    
    //模板解析
    var parse = flyingon.Layout.parse;
    
    
    
    this.type = 'table';

    
    //是否纵向布局
    this.defineProperty('vertical', false);
    
    
    //内容区域
    this.defineProperty('data', '*[* * *] *[* * *] *[* * *]', {
     
        set: function () {

            this.__data = null;
        }
    });

    
    //自动循环的记录数
    this.defineProperty('auto', 0);
    
    
    
    //排列布局
    this.arrange = function (container, items, hscroll, vscroll) {

        var data = this.__data || (this.__data = parse(this.data())),
            vertical = this.vertical(),
            width = container.arrangeWidth,
            height = container.arrangeHeight,
            pixel = flyingon.pixel,
            spacingX = pixel(this.spacingX(), width),
            spacingY = pixel(this.spacingY(), height);
            
        //测量
        data.measure(width, height, spacingX, spacingY, vertical, this.auto(), items);
                
        //排列
        (vertical ? arrange_vertical : arrange)(container, width, height, data, items, 0, container.arrangeLeft, container.arrangeTop);

        //检查是否需要重排
        if (hscroll || vscroll)
        {
            this.rearrange(container, items, hscroll, vscroll);
        }
    };
    
    
    function arrange(container, width, height, group, items, index, x, y) {
        
        var lineWidth = group.width,
            cell, 
            control, 
            any;
        
        for (var i = 0, l = group.length; i < l; i++)
        {
            if (cell = group[i]) 
            {
                if (!cell.disabled)
                {
                    if (any = cell.group)
                    {
                        index = arrange_vertical(container, width, height, any, items, index, x, y + cell.start);
                        
                        if (index < 0)
                        {
                            return -1;
                        }
                    }
                    else if (control = items[index++])
                    {
                        control.measure(width, height, lineWidth, any = cell.size, 3);
                        control.locate(x, y + cell.start, lineWidth, any, container);
                    }
                    else
                    {
                        return -1;
                    }
                }
            }
        }
        
        return index;
    };

        
    function arrange_vertical(container, width, height, group, items, index, x, y) {
        
        var lineHeight = group.height,
            cell, 
            control, 
            any;
        
        for (var i = 0, l = group.length; i < l; i++)
        {
            if (cell = group[i]) 
            {
                if (!cell.disabled)
                {
                    if (any = cell.group)
                    {
                        index = arrange(container, width, height, any, items, index, x + cell.start, y);
                        
                        if (index < 0)
                        {
                            return -1;
                        }
                    }
                    else if (control = items[index++])
                    {
                        control.measure(width, height, any = cell.size, lineHeight, 3);
                        control.locate(x + cell.start, y, any, lineHeight, container);
                    }
                    else
                    {
                        return -1;
                    }
                }
            }
        }
        
        return index;
    };
    
    
});




//视图模板类
flyingon.ViewTemplate = flyingon.defineClass(function () {




    this.constructor = function (template) {

        if (typeof template === 'string')
        {
            this.template = template;
        }
        else
        {
            this.ast = template;
        }
    };




    //解析html模板生成虚拟树
    this.parse = function () {

        var ast = this.ast,
            any;

        if (!ast && (any = this.template))
        {
            any = any.replace(/<!--[\s\S]*?-->/g, '');
            any = any.match(/[<>=/]|[\w-:@]+|"[^"]*"|'[^']*'/g);

            ast = parse(any, []);

            if (ast instanceof Array)
            {
                if (ast[1])
                {
                    throw 'template can only one root node!';
                }

                ast = ast[0];
            }

            if (ast)
            {
                if (ast['-loop'])
                {
                    throw 'template root nood can not use "-loop"!';
                }
            }
            else
            {
                throw 'template can not be empty!';
            }

            this.ast = ast;
        }

        return ast;
    };



    //分析模板生成模型结构
    this.analyse = function () {

        var vm = this.vm,
            any;

        if (vm === void 0 && (any = this.ast || this.parse()))
        {
            analyse_object(vm = {}, any);

            for (any in vm)
            {
                return this.vm = vm;
            }

            this.vm = null;
        }

        return vm;
    };



    //解析xml模板
    function parse(tokens, array) {

        var regex_node = /[^\w-]/,
            regex_name = /[^\w-:@]/,
            stack = [],
            flag, //属性分析阶段标记
            index = 0,
            item,
            name,
            token,
            any;

        while (token = tokens[index++])
        {
            switch (token)
            {
                case '<':
                    if (flag)
                    {
                        throw parse_error(token, item);
                    }

                    token = tokens[index++];

                    //下一个符号是关闭结点
                    if (token === '/')
                    {
                        if (!item || tokens[index] !== item.xtype || tokens[index + 1] !== '>')
                        {
                            throw '"' + token + tokens[index] + tokens[index + 1] + '" not a valid close tag!';
                        }

                        index++;
                        stack.pop();
                        item = stack[stack.length - 1];
                        break;
                    }

                    if (token.match(regex_node))
                    {
                        throw '"' + token + '" not a valid node name!';
                    }

                    any = { xtype: token };

                    //添加子项
                    if (item)
                    {
                        (item.children || (item.children = [])).push(any);
                    }
                    else
                    {
                        array.push(any);
                    }

                    stack.push(item = any);
                    flag = true; //标记处于属性分析阶段
                    break;

                case '/':
                    if (flag && tokens[index++] === '>')
                    {
                        flag = false; //标记属性分析阶段结束

                        if (name)
                        {
                            item[name] = true;
                            name = null;
                        }

                        stack.pop();
                        item = stack[stack.length - 1];
                    }
                    else
                    {
                        throw parse_error(token, item);
                    }
                    break;

                case '>':
                    if (flag)
                    {
                        flag = false; //标记属性分析阶段结束

                        if (name)
                        {
                            item[name] = true;
                            name = null;
                        }
                    }
                    break;

                case '=':
                    if (flag && name)
                    {
                        switch (token = tokens[index++])
                        {
                            case '<':
                            case '>':
                            case '/':
                            case '=':
                                throw parse_error(token, item);
                        }

                        any = token.charAt(0);
                        any = any === '"' || any === '\'' ? token.substring(1, token.length - 1) : token;

                        item[name] = any;
                        name = null;
                    }
                    else
                    {
                        throw parse_error(token, item);
                    }
                    break;

                default:
                    if (flag)
                    {
                        if (name)
                        {
                            item[name] = true;
                        }

                        if (token.match(regex_name))
                        {
                            throw '"<' + item.xtype + '...' + token + '" not a valid attribute name!';
                        }

                        if (token === 'class')
                        {
                            name = 'className';
                        }
                        else if (token.indexOf('-') > 0) //-开头的是指令,不进行驼峰处理
                        {
                            name =  token.replace(/-(\w)/g, camelize);
                        }
                        else
                        {
                            name = token;
                        }
                    }
                    else
                    {
                        throw '"' + token + '" has syntax error, text can only be a node property!';
                    }
                    break;
            }
        }

        return array;
    };


    function camelize(_, key) {

        return key.toUpperCase();
    };


    function parse_error(token, item) {

        return '"' + (item ? '<' + item[0] + '...' : '') + token + '" has syntax error!';
    };




    //分析生成的节点格式
    //[type, subtype, name, path, detail]
    //[0, 0, name, path, null]    无父级节点
    //[0, 1, name, path, null]    loop item变量(0可能会升级成1或者2)
    //[0, 2, name, null, null]    loop index变量
    //[0, 3, name, path, detail]  函数, detail为参数列表
    //[1, 0, name, path, detail]  对象节点, detail为属性列表
    //[1, 1, name, path, detail]  升级为对象节点的loop item变量, detail为属性列表
    //[2, 0, name, path, detail]  数组节点, detail是item变量
    //[2, 1, name, path, detail]  升级为数组节点的loop item变量, detail是item变量
    

    function analyse_object(node, ast) {

        var item, any;

        for (var name in ast)
        {
            switch (name)
            {
                case 'xtype':
                case 'children':
                case '-loop':
                    any = null;
                    break;

                default:
                    any = ast[name];
                    break;
            }

            if (any)
            {
                switch (name.charAt(0))
                {
                    case '-': //指令
                    case ':': //绑定
                        ast[name] = any.indexOf('(') > 0 ? analyse_function(node, any) : analyse_name(node, any, 0, 0);
                        break;

                    case '@': //事件
                        ast[name] = analyse_function(node, any);
                        break;
                }
            }
        }

        if (ast = ast.children)
        {
            any = 0;

            while (item = ast[any++])
            {
                (item['-loop'] ? analyse_loop : analyse_object)(node, item);
            }
        }
    };


    function analyse_loop(node, ast) {

        var keys = ast['-loop'].match(/[\w.-]+/g),
            loop,
            item,
            index,
            any;

        if (keys && (loop = keys[0]))
        {
            loop = analyse_name(node, loop, 2, 0);

            //第一个变量是item, 第二个变量是index
            //可以省略index, 但是不可以省略item
            if (item = keys[1])
            {
                check_loop(node, item);

                //在loop中记录item信息并添加进作用域
                any = loop[4] = node[loop.item = item] = [0, 1, item, null, null, 0];
                any.loop = loop;

                if (index = keys[2])
                {
                    check_loop(node, index);

                    //添加进作用域
                    node[loop.index = index] = loop[5] = [0, 2, index, null, null, 0];
                }
            }

            //在作用域范围内分析模板
            analyse_object(node, ast);

            if (item)
            {
                //标记超出作用域
                node[item] = 0;

                //如果item变量未使用则移除
                if (!any[0] && !any[5])
                {
                    loop.item = loop[4] = null;
                }

                if (index)
                {
                    //如果index变量未使用则移除
                    if (!node[index][5])
                    {
                        loop[5] = loop.index = null;
                    }

                    //标记超出作用域
                    node[index] = 0;
                }
            }
        }
        else
        {
            analyse_object(node, ast);
        }

        ast['-loop'] = loop;
    };


    function check_loop(node, name) {

        if (name.indexOf('.') >= 0)
        {
            throw 'loop "' + name + '" can not include "."!';
        }

        if (node[name])
        {
            throw 'loop "' + name + '" has be used!';
        }
    };


    function analyse_name(node, name, type, subtype) {

        var keys = name.match(/[\w-]+/g),
            list = null, //上级列表
            item;

        for (var i = 0, l = keys.length - 1; i < l; i++)
        {
            if (item = node[name = keys[i]])
            {
                switch (item[0])
                {
                    case 1: //对象
                        node = item[4];
                        break;

                    case 0: //数组item变量升级为对象,否则穿透抛出异常
                        item[0] = 1;
                        node = item[4] || (item[4] = {}); 
                        break;
                }
            }
            else if (item === 0)
            {
                throw '"' + name + '" is out of scope range!';
            }
            else
            {
                item = node[name] = [1, 0, name, list ? list.slice(0) : null, node = {}]; //创建新对象
            }

            if (list)
            {
                list.push(item);
            }
            else
            {
                list = [item];
            }
        }

        if (item = node[name = keys.pop()])
        {
            if (type)
            {
                if (item[0])
                {
                    throw '"' + name + '" has be used!';
                }

                item[0] = type;
            }
            else if (item[1])
            {
                item[5]++;
            }

            return item;
        }
        
        if (item === 0)
        {
            throw '"' + name + '" is out of scope range!';
        }

        return node[name] = [type, subtype, name, list, null];
    };


    function analyse_function(node, name) {

        var list = name.match(/[\w-.]+/g),
            args,
            item,
            index,
            any;

        if ((name = list[0]).indexOf('.') >= 0)
        {
            throw 'function "' + name + '" can not include "."!';
        }
        
        if ((item = node[name]) && item[1] !== 2)
        {
            throw 'function name "' + name + '" has be used!';
        }

        //函数支持重载,同一函数可传入不同的参数,所以每次分析都重新生成新节点
        item = node[name] = [0, 3, list[0], null, null];

        if (list[1])
        {
            args = [];
            index = 1;

            while (name = list[index++])
            {
                if (any = node[name])
                {
                    any[5]++; //标记变量被引用
                }
                else
                {
                    any = analyse_name(node, name, 0, 0);
                }

                args.push(any);
            }
            
            item[4] = args;
        }

        return item;
    };



});




(function (flyingon) {



    var components = flyingon.components;

    var unkown = flyingon.Unkown;

    var uniqueId_controls = flyingon.__uniqueId_controls;


    var array_base = Array.prototype;

    var array_like = flyingon.create(array_base);

    var slice = array_base.slice;

    var push = array_base.push;

    var splice = array_base.splice;


    //当前依赖参数
    //0: 控件id
    //1: 模板节点
    //2: 绑定名称
    var depend_target;

    var depend_cache = [0, null, null];




    //创建部件
    flyingon.widget = function (name, options) {

        if (!name && typeof name !== 'string')
        {
            throw 'widget name must input a string!';
        }

        var template = view_template('widget', options),
            defaults = options.defaults,
            vm,
            type,
            prototype;

        if (defaults !== false)
        {
            vm = template.analyse();
        }
        else
        {
            template.parse();
        }
        
        type = flyingon.defineClass(components[template.ast.xtype] || unkown, widget).register(name, options.force);

        (prototype = type.prototype).__options = {

            vm: vm,
            template: template.ast,
            defaults: defaults,
            init: options.init,
            created: options.created 
        };

        if (vm)
        {
            for (var name in vm)
            {
                if (vm[name])
                {
                    widget_property(prototype, name, defaults && defaults[name] || null);
                }
            }
        }

        return type;
    };


    function widget() {

        this.constructor = function () {

            var options = this.__options,
                vm = options.fn,
                control,
                any;

            if (vm === void 0)
            {
                options.fn = vm = (any = options.vm) && compile_object(any, '') || null;
            }

            if (vm)
            {
                this.vm = vm = new vm(null, options.defaults);

                if (any = options.init)
                {
                    any.call(vm, vm);
                }
            }

            control = create(vm, options.template, this);

            if (any = options.created)
            {
                any.call(control, vm);
            }
        };

    };



    function widget_property(self, name, defaultValue) {

        self.defineProperty(name, defaultValue || null, {

            set: function (value) {

                this.vm.$set(name, value);
            }
        });
    };



    //创建视图
    flyingon.view = function (options) {

        var template = view_template('view', options),
            defaults = options.defaults,
            vm,
            control,
            any;

        template.parse();

        if (defaults !== false && (vm = template.analyse()))
        {
            vm = new (compile_object(vm, ''))(null, defaults);

            if (any = options.init)
            {
                any.call(vm, vm);
            }
        }

        control = create(vm, template.ast);
        control.vm = vm;

        if (any = options.created)
        {
            any.call(control, vm);
        }

        if (any = options.host)
        {
            flyingon.mount(control, any, options.mounted);
        }

        return control;
    };


    //获取视图模板的方法
    flyingon.view.template = function (text) {

        var node;

        if (text.charAt(0) === '#' && (node = document.getElementById(text.substring(1))))
        {
            return node.innerHTML;
        }

        return text;
    };


    function view_template(name, options) {

        if (!options)
        {
            throw name + ' options must input a object!';
        }

        var template = options.template;

        if (!template)
        {
            throw name + ' options template not allow empty!';
        }

        if (typeof template === 'string')
        {
            template = flyingon.view.template(template);
        }

        return new flyingon.ViewTemplate(template);
    };




    //添加自定义观测
    function watch(name, fn) {

        if (typeof name === 'function')
        {
            fn = name;
            name = '*';
        }
        else if (typeof fn !== 'function')
        {
            throw 'watch must input a function!';
        }

        (this.__watches || (this.__watches = [])).push(name || '*', fn);
        return this;
    };


    //触发观测通知
    function notify(vm, name, value, oldValue) {

        var target = vm,
            list,
            event,
            index,
            key;

        do
        {
            if (list = target.__watches)
            {
                index = 0;

                while (key = list[index++])
                {
                    if (key === '*' || name === '*' || key === name)
                    {
                        list[index++].call(target, event || (event = {
                            
                            target: vm,
                            name: name,
                            newValue: value,
                            oldValue: oldValue
                        }));
                    }
                    else
                    {
                        index++;
                    }
                }
            }
        }
        while(target = target.__parent); //向上冒泡
    };




    //获取绑定值
    function bind_value(control, vm, scope, node) {

        var any;

        switch (node[1])
        {
            case 0: //property
                if (node[3])
                {
                    vm = bind_vm(control, vm, scope, node);
                }

                if (any = depend_target)
                {
                    property_track(vm, node[2], any);
                }

                return vm[node[2]];

            case 1: //loop item
                if (scope && (scope = scope[node[2]]))
                {
                    vm = scope.__loop_vm;

                    if (!node[0] && (any = depend_target))
                    {
                        item_track(vm, scope.__uniqueId, any);
                    }

                    return vm[scope.__loop_index];
                }

                return find_item(control, node[2]);

            case 2: //loop index
                if (scope)
                {
                    scope = scope[node[2]];

                    if (any = depend_target)
                    {
                        item_track(scope.__loop_vm, scope.__uniqueId, any);
                    }

                    return scope.__loop_index;
                }

                return find_index(control, node[2]);

            case 3: //function
                return bind_function(control, vm, scope, node);
        }
    };


    //获取绑定的视图模型
    function bind_vm(control, vm, scope, node) {

        var list = node[3],
            item = list[0],
            index = 1;

        if (item[1] === 1) //loop item
        {
            if (scope && (scope = scope[item[2]]))
            {
                vm = scope.__loop_vm[scope.__loop_index];
            }
            else
            {
                vm = find_item(control, item[2]);
            }
        }
        else
        {
            vm = (vm.__top || vm)[item[2]];
        }

        while (item = list[index++])
        {
            vm = vm[item[2]];
        }

        return vm;
    };


    //获取绑定的函数返回值
    function bind_function(control, vm, scope, node, event) {

        var list = node[4], 
            args = [], 
            index = 0, 
            item;

        //函数只能在顶级视图模型中
        vm = vm.__top || vm;
      
        if (list = node[4])
        {
            while (item = list[index++])
            {
                args.push(bind_value(control, vm, scope, item));
            }
        }

        args.push(control);
        event && args.push(event);

        return vm[node[2]].apply(vm, args);
    };


    //绑定事件
    function bind_event(vm, node) {

        return function (e) {

            bind_function(this, vm, null, node, e);
        };
    };


    //获取控件相关的item变量作用域
    function find_item(control, name) {

        var vm;

        do
        {
            if ((vm = control.__loop_vm) && vm.__item_name === name)
            {
                return vm[control.__loop_index];
            }
        }
        while (control = control.parent);
    };


    //索引绑定的循环索引号
    function find_index(control, name) {

        var vm;

        do
        {
            if ((vm = control.__loop_vm) && vm.__index_name === name)
            {
                return control.__loop_index;
            }
        }
        while (control = control.parent);

        return -1; //出错了
    };




    //添加对象属性变化依赖追踪
    function property_track(vm, name, depends) {

        var keys = vm.__depends;

        if (keys)
        {
            push.apply(keys[name] || (keys[name] = []), depends);
        }
    };


    //添加数组项值变化依赖追踪
    function item_track(vm, id, depends) {

        var keys;

        if (id && (keys = vm.__depends || (vm.__depends = {})))
        {
            push.apply(keys[id] || (keys[id] = []), depends);
        }
    };


    //更新指定绑定
    function update_bind(vm, scope, depends) {

        var controls = uniqueId_controls,
            index = 0,
            control,
            item;

        while (item = depends[index++])
        {
            if (control = controls[item])
            {
                control.set(depends[index++], bind_value(control, vm, scope, depends[index++]));
            }
            else
            {
                depends.splice(--index, 3);
            }
        }
    };




    //编译对象视图模型类
    function compile_object(node, name) {


        var self = Class.prototype;

        var keys1 = self.__keys1 = flyingon.create(null);
        var keys2 = self.__keys2 = flyingon.create(null);


        function Class(parent, value) {

            var keys = self.__keys2,
                fn;

            this.__top = (this.__parent = parent) ? parent.__top : this;
            this.__depends = flyingon.create(null);

            if (value && typeof value === 'object')
            {
                for (var name in value)
                {
                    this[name] = (fn = keys[name]) ? new fn(this, value[name]) : value[name];
                }
            }
            else
            {
                value = null;
            }

            for (var name in keys)
            {
                if (!value || !(name in value))
                {
                    this[name] = new keys[name](this);
                }
            }
        };


        self.$name = name;
        self.$watch = watch;
        self.$get = object_get;
        self.$set = object_set;
        self.$replace = object_replace;
        self.$update = object_update;
        self.$dispose = object_dispose;


        for (var name in node)
        {
            var item = node[name];

            if (item[1] > 0) //function || item || index
            {
                continue;
            }

            switch (keys1[name] = item[0])
            {
                case 1: //object
                    keys2[name] = compile_object(item[4], item[1]);
                    break;

                case 2: //loop
                    keys2[name] = compile_array(item);
                    break;
            }
        }


        return Class;
    };


    function object_get(name) {

        var value;

        if (value = depend_target)
        {
            property_track(this, name, value);
        }

        return this[name];
    };


    function object_set(name, value) {

        var any;

        switch (this.__keys1[name])
        {
            case 0:
                if ((any = this[name]) !== value)
                {
                    this[name] = value;
                    notify(this, name, value, any);

                    if ((any = this.__depends) && (any = any[name]))
                    {
                        update_bind(this, null, any);
                    }
                }
                break;

            case 1:
            case 2:
                if (any = this[name])
                {
                    any.$replace(value, false);
                    any.$update();
                }
                break;

            default:
                this[name] = value;
                break;
        }

        return this;
    };


    function object_replace(value, update) {

        var keys = this.__keys1,
            fn;

        //先清空原属性值
        for (var name in keys)
        {
            if (keys[name] === 0)
            {
                this[name] = void 0;
            }
        }

        keys = this.__keys2;

        if (value && typeof value === 'object')
        {
            for (var name in value)
            {
                if (keys[name])
                {
                    this[name].$replace(value[name], false);
                }
                else
                {
                    this[name] = value[name];
                }
            }
        }
        else
        {
            value = null;
        }

        for (var name in keys)
        {
            if (!value || !(name in value))
            {
                this[name].$replace(null);
            }
        }

        if (update !== false)
        {
            this.$update();
        }
    };


    function object_update() {

        var keys = this.__depends;

        if (keys)
        {
            for (var key in keys)
            {
                update_bind(this, null, keys[key]);
            }
        }

        keys = this.__keys2;

        for (var name in keys)
        {
            this[name].$update();
        }
    };

    
    function object_dispose() {

        var keys = this.__keys2;

        for (var name in keys)
        {
            this[name].$dispose();
        }

        this.__top = this.__parent = this.__depends = this.__watches = null;
    };


           

    //编译数组视图模型类
    function compile_array(node) {

        
        var self = Class.prototype = flyingon.create(array_like);


        function Class(parent, value) {

            var fn = this.__item_fn,
                length = value && value.length;

            this.__top = (this.__parent = parent).__top;
            
            if (length > 0)
            {
                this.__controls = new Array(length);

                if (fn)
                {
                    this.length = length;

                    for (var i = 0; i < length; i++)
                    {
                        this[i] = new fn(this, value[i]);
                    }
                }
                else
                {
                    push.apply(this, value);
                }
            }
            else
            {
                this.__controls = [];
            }
        };


        self.__item_name = node.item;
        self.__index_name = node.index;


        self.$name = node[2];
        self.$watch = watch;
        self.$get = array_get;
        self.$set = array_set;
        self.$replace = array_replace;
        self.$update = array_update;
        self.$dispose = array_dispose;
        

        if (node = node[4])
        {
            switch (node[0])
            {
                case 1: //数组项是一个对象
                    self.__item_fn = compile_object(node[4], node[2]);
                    break;

                case 2: //数组项是一个数组
                    self.__item_fn = compile_array(node[4]);
                    break;
            }
        }


        return Class;
    };


    function array_get(index) {

        var value;

        if ((value = depend_target) && this.__depends)
        {
            item_track(this, this.__controls[index], value);
        }

        return this[index];
    };


    function array_set(index, value) {

        var control, id, any;

        if (index >= 0)
        {
            if (index < this.length)
            {
                any = this[index];

                if (any && any.$replace)
                {
                    any.$replace(value, false);
                    this.$update();
                }
                else if (any !== value)
                {
                    this[index] = value;

                    if ((id = this.__controls[index]) && (control = uniqueId_controls[id]))
                    {
                        notify(this, id, value, any);

                        if ((any = this.__depends) && (any = any[id]))
                        {
                            update_bind(this, null, any);
                        }
                    }
                }
            }
        }
        else if (index === 'length')
        {
            this.splice(value);
        }

        return this;
    };


    function array_replace(value, update) {

        var length = (value && value.length) | 0,
            any;

        if (length <= 0)
        {
            this.splice(0);
            return this;
        }

        if ((any = this.length) > length)
        {
            this.splice(length);
            any = length;
        }

        if (any > 0)
        {
            if (this.__item_fn)
            {
                for (var i = 0; i < any; i++)
                {
                    this[i].$replace(value[i]);
                }
            }
            else
            {
                for (var i = 0; i < any; i++)
                {
                    if (this[i] !== value[i])
                    {
                        this[i] = value[i];
                    }
                }
            }
        }

        if (any < length)
        {
            this.push.apply(this, slice.call(value, any));
        }

        if (update !== false)
        {
            this.$update();
        }

        return this;
    };


    function array_update(deep) {

        var keys = this.__depends;

        if (keys)
        {
            for (var key in keys)
            {
                update_bind(this, null, keys[key]);
            }
        }

        if (deep !== false && this.__item_fn)
        {
            for (var i = 0, l = this.length; i < l; i++)
            {
                this[i].$update();
            }
        }
    };


    function array_dispose() {

        if (this.__item_fn)
        {
            for (var i = this.length - 1; i >= 0; i--)
            {
                this.$dispose();
            }
        }

        this.__top = this.__parent = this.__depends = this.__watches = 
        this.__controls = this.__template = this.__start = this.__end = null;

        return this;
    };


    //类数组方法扩展
    array_like.push = function (item) {

        var list = arguments,
            index = this.length,
            length = list.length,
            any;

        if (length > 0)
        {
            if (any = this.__item_fn)
            {
                list = append_check(this, list, 0, any);
            }

            this.__controls.push(length > 1 ? new Array(length) : null);

            any = push.apply(this, list);

            //插入节点
            append_loop(this, index, index + length); 

            return any;
        }

        return index;
    };


    array_like.pop = function () {
        
        var length = this.length;

        if (length > 0)
        {
            remove_control(this, length - 1);
            return array_base.pop.call(this);
        }
    };


    array_like.unshift = function (item) {

        var list = arguments,
            length = list.length;

        if (length > 0)
        {
            if (this.__item_fn)
            {
                list = append_check(this, list, 0, this.__item_fn);
            }

            this.__controls.unshift(length > 1 ? new Array(length) : null);

            array_base.unshift.apply(this, list);

            //插入节点
            append_loop(this, 0, length); 

            if (length < this.length)
            {
                adjust_index(this, length, length);
            }
        }

        return this.length;
    };


    array_like.shift = function () {
        
        var item;

        if (this.length > 0)
        {
            if (item = array_base.shift.call(this))
            {
                remove_control(this, 0);
            }

            if (this.length > 0)
            {
                adjust_index(this, 0, -1);
            }

            return item;
        }
    };


    array_like.splice = function (index, length) {

        var list = arguments,
            count = list.length - 2,
            any;

        if ((index |= 0) < 0 && (index += this.length) < 0)
        {
            index = 0;
        }

        if (count > 0)
        {
            if (any = this.__item_fn)
            {
                list = append_check(this, list, 2, any);
            }

            any = new Array(count + 2);
            any[0] = index;
            any[1] = length;
        }

        any = splice.apply(this.__controls, any || list);

        //移除控件
        if (any.length > 0)
        {
            remove_controls(this, any);
        }

        any = splice.apply(this, list);

        if (this.__item_fn && any[0])
        {
            for (var i = any.length - 1; i >= 0; i--)
            {
                any[i].$dispose();
            }
        }

        //插入节点
        if (count > 0)
        {
            append_loop(this, index, index += count); 
        }

        if (index < this.length)
        {
            adjust_index(this, index, count - any.length);
        }

        return any;
    };


    array_like.sort = function (fn) {

        var length = this.length;

        if (this.__depends && length > 1)
        {
            //如果有子循环则移动视图(解决嵌套数组更新的问题)
            if (this.__item_fn)
            {
                var controls = this.__controls;

                //先记录原控件id
                for (var i = length - 1; i >= 0; i--)
                {
                    this[i].__id = controls[i];
                }

                //排序
                controls.sort.call(this, fn);

                //再按照新的位置重编控件索引
                for (var i = length - 1; i >= 0; i--)
                {
                    controls[i] = this[i].__id;
                }

                adjust_sort(this, controls);
            }
            else //否则直接同步绑定
            {
                array_base.sort.call(this, fn);
                this.$update();
            }
        }
    };


    array_like.reverse = function () {
        
        if (this.length > 1)
        {
            var controls = this.__controls;

            controls.reverse.call(this);

            //如果有子循环则移动视图(解决嵌套数组更新的问题)
            if (this.__item_fn)
            {
                controls.reverse();
                adjust_sort(this, controls);
            }
            else //否则直接同步绑定
            {
                this.$update();
            }
        }
    };


    function append_check(vm, list, index, fn) {

        list = slice.call(list, 0);

        for (var i = index, l = list.length; i < l; i++)
        {
            list[i] = new fn(vm, list[i]);
        }

        return list;
    };


    function remove_control(vm, index) {
    
        var controls = vm.__controls,
            id = controls[index],
            control = uniqueId_controls[id],
            any;

        controls.splice(index, 1);

        if (any = vm.__depends)
        {
            delete any[id];
        }

        if (control && (any = vm.__start.parent))
        {
            any.removeChild(control);
        }
        
        if (vm.__item_fn)
        {
            vm[index].$dispose();
        }
    };


    function remove_controls(vm, list) {

        var keys = uniqueId_controls,
            depends = vm.__depends,
            parent = vm.__start.parent,
            control,
            id;

        for (var i = 0, l = list.length; i < l; i++)
        {
            if (depends[id = list[i]])
            {
                delete depends[id];
            }
            
            if (control = keys[id])
            {
                parent.removeChild(control);
            }
        }
    };


    function adjust_index(vm, start, offset) {

        var keys = uniqueId_controls,
            controls = vm.__controls,
            control;

        for (var i = start, l = controls.length; i < l; i++)
        {
            if (control = keys[controls[i]])
            {
                control.__loop_index += offset;
            }
        }

        if (vm.__index_name && vm.__depends)
        {
            vm.$update(false);
        }
    };


    function adjust_sort(vm, list) {

        var controls = uniqueId_controls,
            last = vm.__end,
            any;

        if (last)
        {
            for (var i = list.length - 1; i >= 0; i--)
            {
                if (any = controls[list[i]])
                {
                    any.__loop_index = i;
                    any.nextSibling = last;

                    last = last.previousSibling = any;
                }
            }

            any = last.previousSibling = vm.__start;
            any.nextSibling = last;

            if (any = any.parent)
            {
                any.renderer.set(any, '__view_order');
                any.invalidate(true);
            }

            if (vm.__depends)
            {
                vm.$update(false);
            }
        }
    };




    //根据编译后的视图模型创建控件
    function create(vm, template, control) {

        if (vm)
        {
            var scope = flyingon.create(null),
                any = template.xtype;

            control = control || new (components[any] || unkown)();
            control.tagName = any;

            bind_control(control, vm, scope, template);

            if (any = template.children)
            {
                create_children(control, vm, scope, any, components);
            }
        }
        else if (control)
        {
            control.deserialize(flyingon.SerializeReader.instance, template);
        }
        else
        {
            control = flyingon.SerializeReader.deserialize(template);
        }

        return control;
    };


    function create_control(vm, scope, template, components, type) {

        var control, any;

        any = template.xtype;

        control = new (type || components[any] || unkown)();
        control.tagName = any;

        bind_control(control, vm, scope, template);

        if (any = template.children)
        {
            create_children(control, vm, scope, any, components);
        }

        return control;
    };

    
    function bind_control(control, vm, scope, template, id) {

        var depend = depend_target = depend_cache,
            node,
            any;

        depend[0] = control.uniqueId();

        for (var name in template)
        {
            switch (name)
            {
                case 'xtype':
                case 'children':
                case '-loop':
                    break;

                case '-model': //模型指令特殊处理
                    if (any = control[name])
                    {
                        node = template[name];
                        any.call(control, node[3] ? bind_vm(control, vm, scope, node) : vm, node[2]); 
                    }
                    break;

                default:
                    node = template[name];

                    switch (name.charAt(0))
                    {
                        case ':': //绑定
                            depend[1] = name = name.substring(1);
                            depend[2] = node;
                            control.set(name, bind_value(control, vm, scope, node));
                            break;

                        case '-': //指令
                            depend[1] = name;
                            depend[2] = node;
                            control.set(name, bind_value(control, vm, scope, node));
                            break;

                        case '@': //事件
                            control.on(name.substring(1), bind_event(vm, node));
                            break;

                        default:
                            if (any = typeof node === 'string' && node.match(/^\{\{(\w+)\}\}$/))
                            {
                                control.addBind(name, any[1]);
                            }
                            else
                            {
                                control.set(name, node);
                            }
                            break;
                    }
            }
        }

        depend_target = null;
    };


    function create_children(parent, vm, scope, template, components) {

        var controls = [],
            node;

        for (var i = 0, l = template.length; i < l; i++)
        {
            if ((node = template[i]) && node['-loop'])
            {
                controls.push.apply(controls, create_loop(vm, scope, node, components));
            }
            else
            {
                controls.push(create_control(vm, scope, node, components));
            }
        }

        if (controls[0])
        {
            parent.appendChild(controls);
        }
    };


    function create_loop(vm, scope, template, components) {

        var control = new components.comment().text('loop-start'), //开始标记
            controls = [control], 
            item = template['-loop'],
            loop = item[2];
        
        vm = item[3] && bind_vm(control, vm, scope, item)[loop] || scope[loop] || vm[loop];
        vm.__start = control;
        vm.__template = template;

        loop_controls(controls, vm, 0, vm.length, scope, components);

        controls.push(control = vm.__end = new components.comment().text('loop-end')); //结束标记

        return controls;
    };


    function loop_controls(list, vm, start, end, scope, components) {

        var top = vm.__top,
            template = vm.__template,
            controls = vm.__controls,
            xtype = template.xtype,
            type = components[xtype] || unkown,
            node = template['-loop'],
            item = node.item,
            index = node.index,
            control,
            any;
        
        if (item || index)
        {
            while (start < end)
            {
                control = new type();
                control.tagName = xtype;

                //为后述查找缓存数据
                control.__loop_vm = vm;
                control.__loop_index = start;
                
                if (item)
                {
                    scope[item] = control;
                }

                if (index)
                {
                    scope[index] = control;
                }

                bind_control(control, top, scope, template);

                controls[start++] = control.__uniqueId;
                list.push(control);

                if (any = template.children)
                {
                    create_children(control, top, scope, any, components);
                }
            }

            item && (scope[item] = null);
            index && (scope[index] = null);
        }
        else
        {
            while (start++ < end)
            {
                list.push(control = create_control(top, scope, template, components, type));
            }
        }
    };


    function append_loop(vm, start, end) {

        var controls = [],
            control = vm.__end,
            scope = {},
            name,
            any;

        while (control = control.parent)
        {
            if (any = control.__item_vm)
            {
                if (name = any.item)
                {
                    scope[name] = control;
                }

                if (name = any.index)
                {
                    scope[name] = control;
                }
            }
        }

        loop_controls(controls, vm, start, end, scope, components);

        control = (end = vm.__controls[end]) && uniqueId_controls[end] || vm.__end;
        control.parent.insertBefore(controls, control);
    };




})(flyingon);




flyingon.defineClass(flyingon.Renderer, function (base) {



    this.bind(flyingon.Comment);

    

    this.render = function (writer, control) {

        var text = control.text();

        if (text)
        {
            text = flyingon.html_encode(text, false);
        }

        writer.push('<!--', text, '-->');
    };


    this.update = function () {
    };


});




flyingon.defineClass(flyingon.Renderer, function (base) {



    this.bind(flyingon.Label);

    

    this.render = function (writer, control, css) {

        var text = control.text();

        if (text)
        {
            text = flyingon.html_encode(text, false);
        }

        writer.push('<span');
        
        this.renderDefault(writer, control, css);
        
        writer.push('>', text, '</span>');
    };


    this.measure_auto = function (control, auto) {

        var view = control.view;

        if (auto & 1)
        {
            control.offsetWidth = view.offsetWidth;
        }

        if (auto & 2)
        {
            control.offsetHeight = view.offsetHeight;
        }
    };



});




flyingon.defineClass(flyingon.Renderer, function (base) {
    
    

    //绑定渲染器
    this.bind(flyingon.HtmlText);



    //渲染html
    this.render = function (writer, control, css) {

        writer.push('<div');
        
        this.renderDefault(writer, control, css);
        
        writer.push('>', control.html(), '</div>');
    };



    this.auto = function (control, auto) {

        var view = control.view;

        if (auto & 1)
        {
            control.offsetWidth = view.offsetWidth;
        }

        if (auto & 2)
        {
            control.offsetHeight = view.offsetHeight;
        }
    };


});




flyingon.defineClass(flyingon.Renderer, function (base) {



    this.bind(flyingon.Button);

    

    this.render = function (writer, control, css) {

        var text = control.text();

        if (text && !control.html())
        {
            text = flyingon.html_encode(text);
        }

        writer.push('<button type="button"');
        
        this.renderDefault(writer, control, css);
        
        writer.push('>', text, '</button>');
    };


    this.text = function (control, view, value) {

        if (control.html())
        {
            view.innerHTML = value;
        }
        else
        {
            view[this.__text_name] = value ? flyingon.html_encode(value) : value;
        }
    };



});




flyingon.defineClass(flyingon.Renderer, function (base) {



    this.bind(flyingon.LinkButton);

    

    this.render = function (writer, control, css) {

        var encode = flyingon.html_encode,
            href = control.href(),
            text = control.text();

        if (href)
        {
            href = encode(href);
        }

        if (text)
        {
            text = encode(text);
        }

        writer.push('<div');
        
        this.renderDefault(writer, control, css);
        
        writer.push('><a href="', href, '">', text, '</a></div>');
    };



    this.href = function (control, view, value) {

        view.href = value;
    };



});




flyingon.defineClass(flyingon.Renderer, function (base) {


    this.bind(flyingon.TextBox);



    //检测盒模型
    flyingon.dom_test(function (div) {
        
 
        div.innerHTML = '<input type="text" class="flyingon-control flyingon-textbox"/>';

        this.checkBoxModel(div.children[0]);


    }, this);

    

    this.render = function (writer, control, css) {

        var text = control.value();

        if (text)
        {
            text = flyingon.html_encode(text, false);
        }

        writer.push('<input type="text"');
        
        this.renderDefault(writer, control, css);
        
        writer.push(' value="', text, '"/>');
    };


    this.text = function (control, view, value) {

        view.value = value;
    };



    this.mount = function (control, view) {

        base.mount.call(this, control, view);
        control.on('change', on_change);
    };


    function on_change(event) {

        var view = this.view;

        this.view = null;
        this.value(event.original_event.target.value);
        this.view = view;
    };


});




//容器渲染器公用方法
flyingon.__container_renderer = function (scroll) {




    //渲染子项
    this.__render_children = function (writer, control, start, end) {

        var item = start || control.firstChild,
            css = this.__css_layout;

        while (item)
        {
            item.view || item.renderer.render(writer, item, item.__css_layout = css);
            
            if (item === end)
            {
                break;
            }

            item = item.nextSibling;
        }
    };




    //挂载子控件
    this.__mount_children = function (control, view, item, node, end) {

        var any;

        view.onscroll = flyingon.__dom_scroll;

        while (item && node)
        {
            //如果子控件已经包含view
            if (any = item.view)
            {
                view.insertBefore(any, node);
            }
            else //子控件不包含view则分配新渲染的子视图
            {
                item.renderer.mount(item, node);
                node = node.nextSibling;
            }

            if (item === end)
            {
                break;
            }

            item = item.nextSibling;
        }
    };


    this.unmount = function (control) {

        var item = control.firstChild;

        base.unmount.call(this, control);

        while (item)
        {
            if (item.view)
            {
                item.renderer.unmount(item);
            }

            item = item.nextSibling;
        }
    };




    //排列
    this.__arrange = function (control) {

        var list = [],
            style = control.view.style,
            auto = control.__auto_size,
            hscroll, 
            vscroll,
            any;

        if (auto & 1)
        {
            control.__hscroll = false;
        }
        else
        {
            //处理自动滚动
            switch (style.overflowX || style.overflow) //有些浏览器读不到overflowX的值
            {
                case 'scroll':
                    control.__hscroll = true;
                    break;

                case 'hidden':
                    control.__hscroll = false;
                    break;
                    
                default:
                    hscroll = true;
                    break;
            }
        }

        if (auto & 2)
        {
            control.__vscroll = false;
        }
        else
        {
            switch (style.overflowY || style.overflow)
            {
                case 'scroll':
                    control.__vscroll = true;
                    break;

                case 'hidden':
                    control.__vscroll = false;
                    break;

                default:
                    vscroll = true;
                    break;
            }
        }

        //筛选出非隐藏控件
        if (any = control.firstChild)
        {
            do
            {
                if (any.__visible = (any.__location_values || any.__storage || any.__defaults).visible)
                {
                    list.push(any);
                }
            }
            while (any = any.nextSibling);
        }

        //排列
        flyingon.arrange(control, list, hscroll, vscroll);

        control.__arrange_dirty = false;
    };




    //更新子控件
    this.__update_children = function (control, start, end) {

        var item = start || control.firstChild;

        while (item)
        {
            if (item.view)
            {
                //需要重新渲染
                if (item.__update_dirty)
                {
                    item.renderer.update(item);
                }
                else if (item.__location_dirty) //仅位置发生变化
                {
                    item.__location_dirty = false;
                    this.__update_location(item);
                }
            }

            if (item === end)
            {
                break;
            }

            item = item.nextSibling;
        }
    };



    //仅更新位置信息
    this.__update_location = function (control) {

        var x = control.offsetLeft,
            y = control.offsetTop,
            style1 = control.view.style,
            style2 = control.__locate_style;

        control.__location_tag = (y << 16) + x;

        style1.left = style2.left = x + 'px';
        style1.top = style2.top = y + 'px';
    };



    //应用移除视图补丁
    this.__remove_patch = function (control, view, value) {

        var index = value[0] === 0 ? 1 : 0,
            item,
            any;

        view = control.view_body || view;
            
        //clear
        if (index)
        {
            any = view.lastChild;

            while (any)
            {
                view.removeChild(any);
                any = view.lastChild;
            }
        }
        
        //remove
        while (item = value[index++])
        {
            //移除节点且还未移除视图
            if (item.parent !== control && (any = item.view) && (any.parentNode === view))
            {
                view.removeChild(any);
            }
        }
    };


    //应用插入视图补丁
    this.__insert_patch = function (control, view) {

        var list = control.__insert_patch,
            item, 
            next, 
            node, 
            any;

        if (list)
        {
            control.__insert_patch = null;

            view = control.view_body || control.view;

            //处理插入带view的节点
            for (var i = list.length - 1; i > 0; i--)
            {
                if ((item = list[i]) && item.parent === control && (node = item.view))
                {
                    if (next = item.nextSibling)
                    {
                        do
                        {
                            if ((any = next.view) && any.parentNode === view)
                            {
                                next = any;
                                break;
                            }
                        }
                        while (next = next.nextSibling);
                    }
                    
                    view.insertBefore(node, next || null);
                }
            }

            //处理未渲染的子节点
            if (list[0] && !scroll)
            {
                this.__unmount_patch(control, view);
            }
        }
    };

 
    //应用未挂载子项补丁
    this.__unmount_patch = function (control, view, start, end) {

        var item = start || control.firstChild;

        start = null;

        while (item)
        {
            if (item.view)
            {
                if (start)
                {
                    this.__unmount_html(control, view, start, item.previousSibling, item.view);
                    start = null;
                }
            }
            else if (!start)
            {
                start = item;
            }

            if (item === end)
            {
                break;
            }
            
            item = item.nextSibling;
        }

        if (start)
        {
            this.__unmount_html(control, view, start, end);
        }
    };


    //插入增量html片段
    this.__unmount_html = function (control, view, start, end, refChild) {

        var writer = [],
            item = start,
            node = (refChild = refChild || view.lastChild) && refChild.previousSibling;

        this.__render_children(writer, control, start, end);
        
        flyingon.dom_html(view, writer.join(''), refChild);

        node = node && node.nextSibling || view.firstChild;

        while (item)
        {
            item.renderer.mount(item, node);

            if (item === end)
            {
                break;
            }

            item = item.nextSibling;
            node = node.nextSibling;
        }
    };



    //控件顺序发生变化的补丁
    this.__view_order = function (control, view) {

        var item = control.lastChild,
            last = (control.view_body || view).lastChild,
            node,
            tag;

        while (item)
        {
            if (node = item.view)
            {
                if (node !== last)
                {
                    view.insertBefore(node, tag || null);
                }

                last = (tag = node).previousSibling;
            }

            item = item.previousSibling;
        }
    };



};




//容器控件渲染器
flyingon.PanelRenderer = flyingon.defineClass(flyingon.Renderer, function (base) {
    
    
       
    //设置渲染大小时不包含padding
    this.__no_padding = 0;


    //不渲染padding
    this.padding = 0;
    

    
    //绑定渲染器
    this.bind(flyingon.Panel);



    //渲染html
    this.render = function (writer, control, css) {

        writer.push('<div');
        
        this.renderDefault(writer, control, css, '', 'overflow:auto;');
        
        writer.push('>');

        this.__render_children(writer, control);

        //滚动位置控制(解决有右或底边距时拖不到底的问题)
        writer.push('<div style="position:static;overflow:hidden;visibility:hidden;margin:0;border:0;padding:0;"></div></div>');
    };


    

    this.mount = function (control, view) {

        base.mount.call(this, control, view);
        this.__mount_children(control, view, control.firstChild, view.firstChild);
    };



    this.update = function (control, css) {

        //定位当前控件
        base.update.call(this, control, css);

        //需要排列先重排
        if (control.__arrange_dirty)
        {
            this.__arrange(control);
            this.__update_scroll(control);
        }
        
        this.__update_children(control);
    };



    flyingon.__container_renderer.call(this);



    //更新滚动条
    this.__update_scroll = function (control) {

        var style = control.view.lastChild.style, //内容位置控制(解决有右或底边距时拖不到底的问题)
            cache = control.__scroll_cache || (control.__scroll_cache = {}),
            any;

        if (control.__hscroll_length !== (any = control.arrangeRight))
        {
            style.width = (control.__hscroll_length = any) + 'px'; 
        }

        if (control.__vscroll_length !== (any = control.arrangeBottom))
        {
            style.height = (control.__vscroll_length = any) + 'px'; 
        }
    };



});




//容器控件渲染器
flyingon.defineClass(flyingon.Renderer, function (base) {
    
    
    
    //设置渲染大小时不包含padding
    this.__no_padding = 0;


    //不渲染padding
    this.padding = 0;



    //绑定渲染器
    this.bind(flyingon.ScrollPanel);



    //渲染html
    this.render = function (writer, control, css) {

        //滚动位置控制(解决有右或底边距时拖不到底的问题)
        //使用模拟滚动条解决IE拖动闪烁问题
        //此处只渲染一个空的壳,实现渲染内容在update的时候根据需要渲染
        writer.push('<div');
        
        this.renderDefault(writer, control, css, '', 'overflow:auto;');
        
        writer.push('>',
                '<div style="position:absolute;left:0;top:0;right:0;bottom:0;width:auto;height:auto;overflow:auto;">',
                    '<div style="position:static;overflow:hidden;visibility:hidden;margin:0;border:0;padding:0;"></div>',
                '</div>',
                '<div class="flyingon-body" style="position:relative;overflow:hidden;margin:0;border:0;padding:0;left:0;top:0;width:100%;height:100%;">',
                    '<div style="position:static;overflow:hidden;visibility:hidden;margin:0;border:0;padding:0;"></div>',
                '</div>',
            '</div>');
    };


    
   this.mount = function (control, view) {

        base.mount.call(this, control, view);

        view.onscroll = null;

        control.view_body = view.lastChild;
        control.view.firstChild.onscroll = flyingon.__dom_scroll;

        control.on('mousewheel', mousewheel);
    };


    this.unmount = function (control) {

        base.unmount.call(this, control);
        control.view.firstChild.onscroll = null;
    };


    function mousewheel(event) {

        var view = this.view;

        if (view.style.overflowY !== 'hidden')
        {
            view.firstChild.scrollTop -= event.wheelDelta * 100 / 120;
            event.stopPropagation();
        }
    };



    this.update = function (control) {

        var first, last, any;

        //需要排列先重排
        if (control.__arrange_dirty)
        {
            this.__arrange(control);
            this.__update_scroll(control);
            
            control.__compute_visible();
        }

        //定位当前控件
        base.update.call(this, control);

        if ((any = control.__visible_list) && (first = any[0]))
        {
            last = any[any.length - 1];

            if (any.unmount)
            {
                any.unmount = false;
                this.__unmount_patch(control, control.view.lastChild, first, last);
            }
            
            this.__update_children(control, first, last);
        }
    };




    flyingon.__container_renderer.call(this, true);




    this.locate = function (control) {

        var style = base.locate.call(this, control);
            name = flyingon.rtl ? 'paddingLeft' : 'paddingRight';

        style[name] = control.__vscroll ? flyingon.vscroll_width + 'px' : 0;
        style.paddingBottom = control.__hscroll ? flyingon.hscroll_height + 'px' : 0;

        return style;
    };
    

    this.scroll = function (control, x, y) {

        var view = control.view.lastChild;

        control.__compute_visible();

        this.update(control);

        view.scrollLeft = x;
        view.scrollTop = y;
    };



    flyingon.__container_renderer.call(this);



    this.__update_scroll = function (control) {

        var view = control.view,
            style1 = view.firstChild.firstChild.style, //模拟滚动条控制
            style2 = view.lastChild.lastChild.style, //内容位置控制(解决有右或底边距时拖不到底的问题)
            cache = control.__scroll_cache || (control.__scroll_cache = {}),
            any;

        style1 = view.firstChild.firstChild.style; //模拟滚动条控制

        if (cache.x2 !== (any = control.arrangeRight))
        {
            style1.width = style2.width = (cache.x2 = any) + 'px'; 
        }

        if (cache.y2 !== (any = control.arrangeBottom))
        {
            style1.height = style2.height = (cache.y2 = any) + 'px'; 
        }
    };



});




flyingon.defineClass(flyingon.Renderer, function (base) {



    this.__css_layout = true;
    


    this.bind(flyingon.Unkown);



    //渲染html
    this.render = function (writer, control, css) {

        var tagName = control.tagName;

        writer.push('<', tagName);
        
        this.renderDefault(writer, control, css);
        
        writer.push('>');

        this.__render_children(writer, control);

        writer.push('</', tagName, '>');
    };

    


    this.mount = function (control, view) {

        base.mount.call(this, control, view);
        this.__mount_children(control, view, control.firstChild, view.firstChild);
    };



    this.update = function (control, css) {
        
        //定位当前控件
        base.update.call(this, control, css);

        this.__update_children(control);
    };



    flyingon.__container_renderer.call(this);



    //更新子控件
    this.__update_children = function (control, start, end) {

        var item = start || control.firstChild;

        while (item)
        {
            if (item.view && item.__update_dirty)
            {
                item.renderer.update(item, true);
            }

            if (item === end)
            {
                break;
            }

            item = item.nextSibling;
        }
    };



    this.measure_auto = function (control, auto) {

        var view = control.view;

        if (auto & 1)
        {
            control.offsetWidth = view.offsetWidth;
        }

        if (auto & 2)
        {
            control.offsetHeight = view.offsetHeight;
        }
    };



    this.compute = function (control) {

        var view = control.view;

        control.offsetLeft = view && view.offsetLeft || 0;
        control.offsetTop = view && view.offsetTop || 0;
        control.offsetWidth = view && view.offsetWidth || 0;
        control.offsetHeight = view && view.offsetHeight || 0;
    };



});




flyingon.defineClass(flyingon.PanelRenderer, function (base) {



    //弹出层管理器
    var stack = [];

    //当前弹出层
    var current = null;

    //注册事件函数
    var on = flyingon.dom_on;

    //注销事件函数
    var off = flyingon.dom_off;



    this.bind(flyingon.PopupLayer);

    

    //处理全局点击事件,点击当前弹出层以外的区域则关闭当前弹出层
    on(document, 'mousedown', function (e) { 

        var control;

        if (control = current) {

            var view = control.view,
                reference = control.__view_reference,
                any = e.target;

            while (any)
            {
                if (any === view || any === reference)
                {
                    return;
                }

                any = any.parentNode;
            }

            //调用关闭弹出层方法, 关闭类型为'auto'
            if (control.trigger('autoclosing', 'dom', e.target) !== false)
            {
                control.close('auto');
            }
        }
    });
    

    //处理全局键盘事件,点击Esc则退出当前窗口
    on(document, 'keydown', function (e) { 

        var control;

        if ((control = current) && e.which === 27)
        {
            control.close('cancel');
        }
    });




    //打开弹出层
    //reference: 停靠参考物
    this.show = function (control, reference, offset, direction, align, reverse) {

        var rect = (control.__view_reference = reference.view || reference).getBoundingClientRect();
            
        if (offset)
        {
            rect = {

                top: rect.top - (offset[0] | 0),
                right: rect.right + (offset[1] | 0),
                bottom: rect.bottom + (offset[2] | 0),
                left: rect.left - (offset[3] | 0)
            };
        }

        this.showAt(control, 0, 0);

        rect = flyingon.dom_align(control.view, rect, direction, align, reverse);

        control.offsetLeft = rect.left;
        control.offsetTop = rect.top;
    };


    //在指定的位置打开弹出层
    this.showAt = function (control, left, top) {

        var view;

        control.trigger('open');

        control.measure(0, 0);
        control.locate(left | 0, top | 0);

        if (view = control.view)
        {
            document.body.appendChild(view);
        }
        else
        {
            this.createView(control, document.body);
        }

        stack.push(current = control);
        
        if ((control.__closeAway = control.closeAway()) && !closeAway.count++)
        {
            closeAway.count = 1;
            on(document, 'mousemove', closeAway);
        }

        if (control.__closeLeave = control.closeLeave())
        {
            on(view, 'mouseout', closeLeave);
        }
    };


    function closeAway(e) {
        
        var control, any;

        if ((control = current) && (any = control.__closeAway))
        {
            var rect = control.__view_rect,
                x = e.clientX,
                y = e.clientY;

            if (rect)
            {
                if (rect.left - x > any.x1 || x - rect.right > any.x2 || 
                    rect.top - y > any.y1 || y - rect.bottom > any.y2)
                {
                    control.close('auto');
                }
            }
            else
            {
                control.__view_rect = rect = control.view.getBoundingClientRect();

                control.__closeAway = {

                    x1: (any = rect.left - x) > 0 ? any + 4 : 4,
                    x2: (any = x - rect.right) > 0 ? any + 4 : 4,
                    y1: (any = rect.top - y) > 0 ? any + 4 : 4,
                    y2: (any = y - rect.bottom) > 0 ? any + 4 : 4
                };
            }
        }
    };


    function closeLeave(e) {

        var control = current;

        if (control && control.view === this)
        {
            var rect = this.getBoundingClientRect(),
                x = e.clientX,
                y = e.clientY;

            if (x >= rect.right || y >= rect.bottom || x <= rect.left || y <= rect.top)
            {
                control.close('auto');
            }
        }
    };



    //关闭弹出层(弹出多级窗口时只有最后一个可以成功关闭)
    this.close = function (control) {

        var view = control.view,
            any;

        control.__view_reference = null;

        //注销事件
        if (control.__closeAway)
        {
            control.__closeAway = control.__view_rect = null;

            if (!--closeAway.count)
            {
                off(document, 'mousemove', closeAway);
            }
        }

        if (control.__closeLeave)
        {
            off(view, 'mouseout', closeLeave);
        }

        stack.pop();
        current = stack[stack.length - 1];

        if (any = view.parentNode)
        {
            any.removeChild(view);
        }
    };



});




flyingon.defineClass(flyingon.PanelRenderer, function (base) {



    this.bind(flyingon.Dialog);


    flyingon.dom_test(function (div) {

        div.innerHTML = '<div class="flyingon-dialog-header"></div>';
        flyingon.Dialog.prototype.defaultValue('headerHeight', div.children[0].offsetHeight);
    });



    this.render = function (writer, control, css) {

        writer.push('<div');
        
        this.renderDefault(writer, control, css);
        
        writer.push(' tag="dialog">',
            '<div class="flyingon-dialog-header" tag="header">',
                '<span class="flyingon-dialog-icon" style="display:none;"></span>',
                '<span class="flyingon-dialog-title"></span>',
                '<span class="flyingon-dialog-close" tag="close"></span>',
            '</div>',
            '<div class="flyingon-dialog-body" tag="body">');
        
        this.renderBody(writer, control);

        writer.push('</div></div>');
    };
    
    
    this.mount = function (control, view) {

        base.base.mount.call(this, control, view);

        view = view.lastChild;
        this.__init_children(control, view.lastChild, view.firstChild);

        control.on('mousedown', mousedown);
        control.on('click', click);
    };



    function mousedown(event) {

        if (event.which === 1 && this.movable())
        {
            switch (event_tag(event))
            {
                case 'header':
                case 'close':
                    this.renderer.movable(this, event);
                    break;
            }
        }
    };


    function click(event) {

        switch (event_tag(event))
        {
            case 'close':
                this.close();
                break;

            case 'header':
                //this.renderer.active(this);
                break;
        }
    };


    function event_tag(event) {

        var dom = event.original_event.target,
            any;

        do
        {
            if (any = dom.getAttribute('tag'))
            {
                return any;
            }
        }
        while (dom = dom.parentNode);
    };



    this.headerHeight = function (control, view, value) {

        var style = view.children[0].style;

        style.display = value ? '' : 'none';
        style.height = style.lineHeight = control.view_body.style.top = value + 'px';
    };


    this.icon = function (control, view, value) {

        var dom = view.children[0].children[0];

        dom.className = 'flyingon-dialog-icon ' + value;
        dom.style.display = value ? '' : 'none';
    };

    
    this.title = function (control, view, value) {

        view.children[0].children[1][this.__text_name] = value;
    };


    this.closable = function (control, view, value) {

        view.children[0].children[2].style.display = value ? '' : 'none';
    };



    this.show = function (control, left, top, overlay) {

        var body = document.body,
            view;

        control.trigger('open');
        control.measure(0, 0);

        if (left == null)
        {
            left = body.clientWidth - control.offsetWidth >> 1;
        }

        if (top == null)
        {
            top = ((window.innerHeight || document.documentElement.clientHeight) - control.offsetHeight >> 1) - body.clientLeft;
        }

        control.locate(left | 0, top | 0);

        if (view = control.view)
        {
            body.appendChild(view);
        }
        else
        {
            view = this.createView(control, body);
        }

        flyingon.dom_overlay(view);

        control.shown = true;
    };

    

    this.movable = function (control, event) {

        event = event.original_event;
        event.dom = control.view;

        flyingon.dom_drag(control, event);

        event.dom = null;
    };



    this.close = function (control) {

        var view = control.view,
            any;

        if (any = view.parentNode)
        {
            any.removeChild(view);
        }

        if (view.flyingon_overlay)
        {
            flyingon.dom_overlay(view, false);
        }
    };



});




flyingon.defineClass(flyingon.Renderer, function (base) {



    this.bind(flyingon.MessageBox);



    this.render = function (writer, control, css) {

        var any;
        
        writer.push('<div');
        
        this.renderDefault(writer, control, css);
        
        writer.push(' tag="dialog">',
            '<div class="flyingon-messagebox-header" tag="header">',
                '<span class="flyingon-messagebox-icon" ', (any = control.icon()) ? 'class="' + any : 'style="dispaly:none;', '"></span>',
                '<span class="flyingon-messagebox-title">', control.title(), '</span>',
                '<span class="flyingon-messagebox-close"', control.closable() ? '' : ' style="display:none;"', ' tag="close"></span>',
            '</div>',
            '<div class="flyingon-messagebox-body">',
                '<span class="flyingon-messagebox-type" ', (any = control.type()) ? 'class="' + any : 'style="display:none;', '"></span>',
                '<span class="flyingon-messagebox-text">', control.text(), '</span>',
            '</div>',
        '</div>');
    };



    this.show = function (control) {

        var body = document.body,
            view = control.view,
            left,
            top;

        if (view)
        {
            body.appendChild(view);
        }
        else
        {
            view = this.createView(control, body);
        }

        flyingon.dom_overlay(view);

        left = control.offsetWidth;
        left = body.clientWidth - left >> 1;

        top = control.offsetHeight;
        top = ((window.innerHeight || document.documentElement.clientHeight) - top >> 1) - body.clientLeft;

        control.measure(0, 0);
        control.locate(left | 0, top | 0);

        control.update();
    };


    
    this.mount = function (control, view) {

        base.mount.call(this, control, view);
        
        control.on('mousedown', mousedown);
        control.on('click', click);
    };


    function mousedown(event) {

        if (event.which === 1 && this.movable())
        {
            switch (event_tag(event))
            {
                case 'header':
                case 'close':
                    this.renderer.movable(this, event);
                    break;
            }
        }
    };


    function click(event) {

        if (event_tag(event) === 'close')
        {
            this.close('none');
        }
    };


    function event_tag(event) {

        var dom = event.original_event.target,
            any;

        do
        {
            if (any = dom.getAttribute('tag'))
            {
                return any;
            }
        }
        while (dom = dom.parentNode);
    };

    

    this.movable = function (control, event) {

        event = event.original_event;
        event.dom = control.view;

        flyingon.dom_drag(control, event);

        event.dom = null;
    };



    this.close = function (control) {

        var view = control.view,
            any;

        flyingon.dom_overlay(view, false);

        if (any = view.parentNode)
        {
            any.removeChild(view);
        }
    };



});




//宿主容器
(function (flyingon, document) {
    
   
          
    /*

    W3C事件规范:

    A: 鼠标事件 mousedown -> mouseup -> click -> mousedown -> mouseup -> click -> dblclick
    注: IE8以下会忽略第二个mousedown和click事件

    1. mousedown 冒泡 鼠标按下时触发
    2. mousemove 冒泡 鼠标在元素内部移动时重复的触发
    3. mouseup 冒泡 释放鼠标按键时触发
    4. click 冒泡 单击鼠标按键或回车键时触发
    5. dblclick 冒泡 双击鼠标按键时触发
    6. mouseover 冒泡 鼠标移入一个元素(包含子元素)的内部时触发
    7. mouseout 冒泡 鼠标移入另一个元素(包含子元素)内部时触发
    8. mouseenter 不冒泡 鼠标移入一个元素(不包含子元素)内部时触发
    9. mouseleave 不冒泡 鼠标移入另一个元素(不包含子元素)内部时触发


    B: 键盘事件

    1. keydown 冒泡 按下键盘上的任意键时触发 如果按住不放会重复触发
    2. keypress 冒泡 按下键盘上的字符键时触发 如果按住不放会重复触发
    3. keyup 冒泡 释放键盘上的按键时触发


    C: 焦点事件

    1. focus 不冒泡 元素获得焦点时触发
    2. blur 不冒泡 元素失去焦点时触发
    3. focusin 冒泡 元素获得焦点时触发
    4. focusout 冒泡 元素失去焦点时触发

    */
   
    
    var MouseEvent = flyingon.MouseEvent;
        
    var KeyEvent = flyingon.KeyEvent;
    
    var on = flyingon.dom_on;
    
    //鼠标按下事件
    var mousedown = null;
    
    //调整大小参数
    var resizable = 0;
    
    //移动控件参数
    var movable = null;
    
    //默认拖动事件
    var ondragstart = null;
    

    //顶级控件列表
    var controls = [];




    //挂载控件至指定的dom容器
    flyingon.mount = function (control, host, callback) {

        control && !control.__top_control && flyingon.ready(function () {

            var node = host,
                view = this.view,
                style,
                renderer = this.renderer,
                any;

            this.__top_control = true;
            this.fullClassName += ' flyingon-host';

            controls.push(this);

            if (typeof node === 'string')
            {
                node = document.getElementById(node);
            }
            
            this.__layout_top(node.clientWidth, node.clientHeight);

            if (view)
            {
                node.appendChild(view);
            }
            else
            {
                renderer.render(any = [], this);
                
                flyingon.dom_html(node, any.join(''));

                renderer.mount(this, view = node.lastChild);
            }

            style = view.style;
            style.width = style.height = 'auto';
            style.left = style.top = style.right = style.bottom = 0;

            renderer.update(this);

            if (typeof (any = callback) === 'function')
            {
                any.call(this);
            }

        }, control);
    };


    //取消控件挂载
    flyingon.unmount = function (control, dispose) {

        var dom, parent;
        
        if (control && control.__top_control)
        {
            control.__top_control = false;

            controls.splice(controls.indexOf(this), 1);

            //清除类型选择器缓存
            if (flyingon.__type_query_cache)
            {
                flyingon.__clear_type_query(control);
            }

            if ((dom = control.view) && (parent = dom.parentNode))
            {
                parent.removeChild(dom);
            }

            if (dispose !== false)
            {
                control.dispose();
            }
            else
            {
                control.fullClassName.replace(' flyingon-host', '');
            }
        }
    };

       
        
    //查找与指定dom关联的控件
    flyingon.findControl = function (dom) {
        
        var id;
        
        while (dom)
        {
            if (id = dom.flyingon_id)
            {
                return flyingon.__uniqueId_controls[id];
            }
            
            dom = dom.parentNode;
        }
    };
    


    //窗口大小变化时自动刷新顶级控件
    flyingon.dom_on(window, 'resize', function () {

        var list = controls;

        for (var i = 0, l = list.length; i < l; i++)
        {
            list[i].invalidate();
        }
    });
    
        
    //通用鼠标事件处理
    function mouse_event(e) {
        
        var control = flyingon.findControl(e.target);
        
        if (control && !control.disabled())
        {
            control.trigger(new MouseEvent(e));
        }
    };
    
    
    //通用键盘事件处理
    function key_event(e) {
        
        var control = flyingon.findControl(e.target);
        
        if (control && !control.disabled())
        {
            control.trigger(new KeyEvent(e));
        }
    };
    
    
    //检查调整尺寸方向
    function check_resize(value, e) {
        
        var dom = this.view,
            rect = dom.getBoundingClientRect(),
            side = 0,
            cursor = '',
            x,
            y;
        
        if (value !== 'x')
        {
            x = e.clientY - rect.top;
            
            if (x >= 0 && x <= 4)
            {
                side = 1;
                cursor = 's';                
            }
            else
            {
                y = this.offsetHeight;
                
                if (x >= y - 4 && x <= y)
                {
                    side = 2;
                    cursor = 'n';
                }
            }
        }
        
        if (value !== 'y')
        {
            x = e.clientX - rect.left;
            
            if (x >= 0 && x <= 4)
            {
                side |= 4;
                cursor += 'e';
            }
            else
            {
                y = this.offsetWidth;
                
                if (x >= y - 4 && x <= y)
                {
                    side |= 8;
                    cursor += 'w';
                }
            }
        }

        if (cursor)
        {
            cursor += '-resize';
        }
        else if ((value = this.__style_list) && (cursor = value.indexOf('cursor') >= 0))
        {
            cursor = value[cursor + 2];
        }
        
        dom.style.cursor = cursor || '';
        
        return side;
    };
    
    
    function do_resize(data) {
        
        var side = data.side;
        
        if ((side & 1) === 1) //top
        {
            this.height(data.height - data.distanceY);
        }
        else if ((side & 2) === 2) //bottom
        {
            this.height(data.height + data.distanceY);
        }
        
        if ((side & 4) === 4) //left
        {
            this.width(data.width - data.distanceX);
        }
        else if ((side & 8) === 8) //right
        {
            this.width(data.width + data.distanceX);
        }
    };
    
    
    
    function move_start(e) {
        
        if (this.trigger('move-start') !== false)
        {
            var view = this.view,
                dom = view.cloneNode(true),
                style = view.style,
                rect = view.getBoundingClientRect(),
                data = { dom: dom, left: rect.left, top: rect.top },
                control = this,
                any;

            style.borderStyle = 'dashed';
            style.borderColor = 'red';

            style = dom.style;
            style.opacity = 0.2;
            style.left = rect.left + 'px';
            style.top = rect.top + 'px';

            document.body.appendChild(dom);

            //获取移动容器及偏移位置
            while (any = control.parent)
            {
                control = any;
            }

            rect = control.view.getBoundingClientRect();

            data.host = control;
            data.offsetX = e.clientX - rect.left;
            data.offsetY = e.clientY - rect.top;

            return data;
        }
    };
    
    
    function do_move(data, e) {
        
        var style = data.dom.style,
            x = data.distanceX,
            y = data.distanceY,
            list = data.host.findDropTarget(data.offsetX + x, data.offsetY + y),
            parent = list[0],
            item = list[1];

        if (item)
        {
            if (this !== item)
            {
                parent.insertBefore(this, item);
            }
        }
        else if (this.parent !== parent)
        {
            //parent.insertBefore(this, null);
        }
        
        style.left = data.left + x + 'px';
        style.top = data.top + y + 'px';
        
        this.trigger('move');
    };
    
    
    function move_end(data, e) {
        
        var dom = data.dom,
            style1 = dom.style,
            style2 = this.view.style,
            parent;

        if (parent = dom.parentNode)
        {
            parent.removeChild(dom);
        }

        style2.borderStyle = style1.borderStyle;
        style2.borderColor = style1.borderColor;
        
        this.trigger('move-end');
    };
    
    

    on(document, 'mousedown', function (e) {
        
        var control = flyingon.findControl(e.target),
            parent,
            any;
        
        if (control && !control.disabled() && control.trigger(mousedown = new MouseEvent(e)) !== false)
        {
            if (any = resizable)
            {
                resizable = {
                 
                    side: any,
                    width: control.offsetWidth,
                    height: control.offsetHeight
                }
            }
            else if ((parent = control.parent) && control.movable())
            {
                any = movable = (control.__move_start || move_start).call(control, e);
            }
            
            if (any && (any = control.view))
            {
                any.setCapture && any.setCapture();

                any = document.body;
                ondragstart = any.ondragstart;
                
                any.ondragstart = function () {
                  
                    return false;
                };
            }
        }

    });
    
    
    on(document, 'mousemove', function (e) {
        
        var start = mousedown,
            control,
            any;
        
        if (start && (control = start.target))
        {
            var x = e.clientX - start.clientX,
                y = e.clientY - start.clientY;
                
            if (any = resizable)
            {
                any.distanceX = x;
                any.distanceY = y;

                do_resize.call(control, any);
            }
            else if (any = movable)
            {
                any.distanceX = x;
                any.distanceY = y;
                
                (control.__do_move || do_move).call(control, any, e);
            }
            else
            {
                e = new MouseEvent(e);
                
                e.mousedown = start;
                e.distanceX = x;
                e.distanceY = y;
                
                control.trigger(e);
            }
        }
        else if ((control = flyingon.findControl(e.target)) && 
            !control.disabled() && control.trigger(new MouseEvent(e)) !== false)
        {
            if ((any = control.resizable()) !== 'none')
            {
                resizable = (control.__check_resize || check_resize).call(control, any, e);
            }
        }

    });
    
    
    //按下鼠标时弹起处理
    on(document, 'mouseup', function (e) {
        
        var start = mousedown,
            control,
            any;
        
        if (start && (control = start.target))
        {
            if (any = resizable)
            {
                resizable = 0;
            }
            else if (any = movable)
            {
                (control.__move_end || move_end).call(control, any, e);
                movable = null;
            }

            e = new MouseEvent(e);

            e.mousedown = start;
            e.distanceX = e.clientX - start.clientX;
            e.distanceY = e.clientY - start.clientY;

            control.trigger(e);

            if (any = control.view)
            {
                any.setCapture && any.releaseCapture();
                any = document.body;
                
                if (any.ondragstart = ondragstart)
                {
                    ondragstart = null;
                }
            }
            
            mousedown = null;
        }
        else if ((control = flyingon.findControl(e.target)) && !control.disabled())
        {
            control.trigger(new MouseEvent(e));
        }

    });
        
            
    on(document, 'click', mouse_event);
    
    
    on(document, 'dblclick', mouse_event);
    
    
    on(document, 'mouseover', mouse_event);
    
    
    on(document, 'mouseout', mouse_event);
    
    
    
    on(document, 'keydown', key_event);
    
    on(document, 'keypress', key_event);
    
    on(document, 'keyup', key_event);



    /* 各浏览器对focusin/focusout事件的支持区别

    	                                    IE6/7/8	    IE9/10	    Firefox5	Safari5	    Chrome12	Opera11
    e.onfocusin	                            Y	        Y	        N	        N	        N	        Y
    e.attachEvent('onfocusin',fn)	        Y	        Y	        N	        N	        N	        Y
    e.addEventListener('focusin',fn,false)	N	        Y	        N	        Y	        Y	        Y

    */

    //w3c标准使用捕获模式
    if (document.addEventListener)
    {
        on(document, 'focus', focus, true);
        on(document, 'blur', blur, true);
    }
    else //IE
    {
        on(document, 'focusin', focus);
        on(document, 'focusout', blur);
    }


    function focus(e) {

        if (focus.disabled)
        {
            return true;
        }

        var control = flyingon.findControl(e.target);

        if (control && !control.disabled() && control.canFocus() && control.trigger('focus') !== false)
        {
            control.focus();
            flyingon.activeControl = control;
        }
        else if (control = flyingon.activeControl)
        {
            try
            {
                focus.disabled = true;
                control.renderer.focus(control);
            }
            finally
            {
                focus.disabled = false;
            }
        }
    };


    function blur(e) {

        var control = flyingon.findControl(e.target);

        if (control && control === flyingon.activeControl && control.trigger('blur') !== false)
        {
            control.blur();
            flyingon.activeControl = null;
        }
    };



    //滚事件不冒泡,每个控件自己绑定
    flyingon.__dom_scroll = function (event) {
      
        var control = flyingon.findControl(this);

        if (control && !control.disabled())
        {
            if (control.trigger('scroll') !== false)
            {
                control.__do_scroll(control.scrollLeft = this.scrollLeft, control.scrollTop = this.scrollTop);
            }
            else
            {
                try
                {
                    this.onscroll = null;
                    this.scrollTop = control.scrollTop;
                    this.scrollLeft = control.scrollLeft;
                }
                finally
                {
                    this.onscroll = scroll;
                }
            }
        }
    };


    
    //滚轮事件兼容处理firefox和其它浏览器不一样
    on(document, document.mozHidden ? 'DOMMouseScroll' : 'mousewheel', function (e) {

        var control = flyingon.findControl(e.target);

        if (control && !control.disabled())
        {
            //firefox向下滚动是3 其它浏览器向下滚动是-120 此处统一转成-120
            control.trigger('mousewheel', 'original_event', e, 'wheelDelta', e.wheelDelta || -e.detail * 40 || -120);
        }
    });



    on(document, 'change', function (e) {

        var control = flyingon.findControl(e.target);

        if (control && !control.disabled())
        {
            control.trigger('change', 'original_event', e);
        }
    });


    
})(flyingon, document);




//资源加载
(function (flyingon) {



    var create = flyingon.create,

        require_version = '', //引入资源版本

        version_files = create(null), //特殊指定的引入资源版本

        path_map = create(null), //相对地址对应绝对地址映射关系

        require_merge = create(null), //引入资源合并关系
        
        i18n_cache = create(null), //本地化信息集合
        
        change_files = create(null), //待切换资源文件集合

        require_keys = { //引入资源变量
            
            layout: 'default', //当前布局
            skin: 'default', //当前皮肤
            i18n: navigator.language || 'zh-CN'    //当前本地化名称
        };



    //资源加载函数
    function require(deps, callback) {

        if (deps)
        {
            switch (typeof deps)
            {
                case 'string':
                    require.require([require.path(deps)], callback);
                    return;

                case 'function':
                    deps.call(flyingon, flyingon);
                    return;
            }
            
            if (deps instanceof Array)
            {
                var list = [],
                    url;

                for (var i = 0, l = deps.length; i < l; i++)
                {
                    if ((url = deps[i]) && typeof url === 'string')
                    {
                        list.push(require.path(url));
                    }
                }

                if (list.length > 0)
                {
                    require.require(list, callback);
                    return;
                }
            }
        }
        
        if (typeof callback === 'function')
        {
            callback.call(flyingon, flyingon);
        }
    };


    //根目录
    require.__root_path = '';


    //相对基础目录
    require.__base_path = '';



    //指定引入资源起始路径
    require.base = function (path) {

        if (path === void 0)
        {
            return require.__base_path;
        }

        if (path && typeof path === 'string')
        {
            if (path.charAt(0) === '/')
            {
                path = require.__root_path + path.substring(1);
            }
            else if (path.indexOf('://') < 0)
            {
                path = require.__root_path + path;
            }
            
            if (path.charAt(path.length - 1) !== '/')
            {
                path += '/';
            }
        }
        else
        {
            path = require.__root_path;
        }

        path.__base_path = path;
    };


    //指定引入资源版本号
    require.version = function (version, files) {

        if (typeof version === 'string')
        {
            require_version = version;
        }
        else
        {
            files = version;
        }

        if (files)
        {
            var keys = version_files;
            
            for (var name in files)
            {
                keys[name] = files[name];
            }
        }
    };


    //指定引入资源合并关系
    require.merge = function (values) {

        if (values)
        {
            var keys = require_merge,
                value;
            
            for (var name in values)
            {
                if (typeof (value = values[name]) === 'string')
                {
                    keys[value] = name;
                }
                else
                {
                    for (var i = 0, l = value.length; i < l; i++)
                    {
                        keys[value[i]] = name;
                    }
                }
            }
        }
    };
    
        
    //转换相对地址为绝对地址
    require.path = function (url, change) {

        var file = url = require_merge[url] || url,
            name,
            index,
            any;

        //如果已经缓存则直接返回
        if (any = path_map[file])
        {
            return any;
        }

        //替换当前语言及主题
        if ((index = url.indexOf('{')) >= 0 && 
            (any = url.indexOf('}')) > index &&
            (name = url.substring(index + 1, any)) &&
            (any = require_keys[name]))
        {
            file = url.replace('{' + name + '}', any);
            
            if (any = path_map[file])
            {
                return any;
            }
        }
        else
        {
            change = false;
        }

        //添加版本号
        if (any = version_files[url] || require_version)
        {
            any = file + (url.indexOf('?') >= 0 ? '&' : '?') + 'require-version=' + any;
        }
        else
        {
            any = file;
        }

        //获取url绝对路径
        // '/xxx': 相对网站根目录
        // './xxx': 相对flyingon.js文件目录
        // 'xxx': 相对flyingon.js文件目录
        // '../xxx': 相对flyingon.js文件上级目录
        if (url.charAt(0) === '/')
        {
            any = require.__root_path + any.substring(1);
        }
        else if (url.indexOf('://') < 0)
        {
            any = require.__base_path + any;
        }
        
        //记录多语言及皮肤
        if (change !== false)
        {
            (change_files[name] || (change_files[name] = {}))[any] = url;
        }

        return path_map[file] = any;
    };
    
        
    
    //获取或设置资源变量值
    require.key = function (name, value, callback, set) {
        
        var keys = require_keys;
        
        if (!value)
        {
            return keys[name];
        }
        
        if (value && keys[name] !== value)
        {
            //设置当前变量
            keys[name] = value;

            set && set();
         
            if (keys = change_files[name])
            {
                require.__change(keys, name, callback);
            }
        }
    };
    


    //获取或设置当前皮肤
    flyingon.skin = function (name) {

        return require.key('skin', name);
    };
    
    
    //获取指定key的本地化信息
    flyingon.i18ntext = function (key) {

        return i18n_cache[key] || key;
    };


    //获取或设置当前本地化名称
    flyingon.i18n = function (name, values) {

        if (values && typeof values === 'object')
        {
            i18n(name, values);
        }
        else if (typeof name === 'object')
        {
            i18n(null, name);
        }
        else
        {
            return require.key('i18n', name, null, function () {
            
                //国际化时先清空缓存
                i18n_cache = create(null);

                if (typeof values === 'function')
                {
                    values();
                }
            });
        }
    };

    
    //定义国际化集合
    function i18n(name, values) {

        var keys = i18n_cache;
        
        if (name)
        {
            name += '.';

            for (var key in values)
            {
                keys[name + key] = values[key];
            }
        }
        else
        {
            for (name in values)
            {
                keys[name] = values[name];
            }
        }
    };
    
    

    //资源加载函数
    flyingon.require = require;



})(flyingon);




//资源加载
(function (flyingon) {



    var create = flyingon.create,

        require = flyingon.require, //资源加载函数

        require_keys = create(null), //所有资源文件集合加载状态 0:未加载 1:已请求 2:已响应 3:已执行

        require_back = create(null), //资源回溯关系
        
        require_wait = 0, //等待加载的请求数
        
        require_list = []; //当前要加载的资源集合
 


    //设置根目录及相对起始目录
    require.__root_path = require.__base_path = flyingon.absoluteUrl('/');



    //切换皮肤或多语言资源
    require.__change = function (keys, name, callback) {
        
        var list = document.getElementsByTagName(name === 'skin' ? 'link' : 'script'),
            any;

        //删除原dom节点
        for (var i = list.length - 1; i >= 0; i--)
        {
            if ((any = list[i]) && keys[any.src || any.href])
            {
                any.parentNode.removeChild(any);
            }
        }

        list = [];

        for (any in keys)
        {
            if (keys[any])
            {
                list.push(require.path(keys[any]));

                //移除缓存
                require_keys[any] = 0;
            }
        }
        
        require.require(list, callback || function () {});
    };


                    
    //添加回调函数(有依赖时才会添加成功)
    require.callback = function (callback, args) {
      
        var list = require_list;

        if (list && list.length > 0)
        {
            (list.callback || (list.callback = [])).push(callback, args || [flyingon]);
            return true;
        }
    };


    //资源加载处理
    require.require = function (list, callback) {

        var keys = require_keys,
            back = require_back,
            items,
            src,
            css,
            value;

        //有callback则为按需加载, 否则为依赖加载
        items = callback ? [] : require_list;

        for (var i = 0, l = list.length; i < l; i++)
        {
            if ((src = list[i]) && (value = keys[src]) !== 3)
            {
                //样式
                if (src.indexOf(css || '.css') > 0)
                {
                    if (!value)
                    {
                        //标记css文件已经加载
                        keys[src] = 3; 

                        //创建link标签加载样式
                        flyingon.link(src);
                    }
                }
                else if (!items[src])
                {
                    //去重处理
                    items[src] = true;

                    //添加进资源列表
                    items.push(src);
                    
                    //设置回溯关系
                    (back[src] || (back[src] = [])).push(items);
                }
            }
        }

        //按需加载
        if (callback)
        {
            //未执行完成则注册回调
            if (items.length > 0)
            {
                items.callback = [callback, [flyingon]];
                load_script(items);
            }
            else //已经加载完成则直接执行回调
            {
                callback.call(flyingon, flyingon);
            }
        }
    };

       
    //加载引入资源
    function load_script(list) {

        //乱序加载测试
        //list.sort(function(a, b) { return Math.random() > 0.5 ? -1 : 1; });

        var keys = require_keys,
            src;
        
        for (var i = 0, l = list.length; i < l; i++)
        {
            if (!keys[src = list[i]])
            {
                //标记已发送请求
                keys[src] = 1;

                //增加待请求数量
                require_wait++;

                //创建加载脚本标签
                flyingon.script(src, load_done);
            }
        }
    };

    
    //脚本加载完毕后处理
    function load_done() {

        var keys = require_keys,
            back = require_back,
            list = require_list,
            wait = --require_wait, //同步待请求的数量
            src = this.src,
            index = list.indexOf(src);
        
        //移除自身引用
        if (index >= 0)
        {
            list.splice(index, 1);
        }

        //如果资源中包含需引入的资源则继续加载
        if (list.length > 0)
        {
            //初始化当前引入对象
            require_list = [];
            
            //标记请求已响应未执行
            keys[src] = 2;
            
            //设置回溯父地址
            list.src = src;

            //继续加载资源
            load_script(list);
        }
        else
        {
            //标记请求已执行
            keys[src] = 3;
            
            //回溯检测
            check_back(keys, back, src);
        }
        
        //如果没有待发送的请求则表示有循环引用
        if (!wait)
        {
            check_cycle(keys, back);
        }
    };
    
    
    //回溯检测引入的资源是否已加载完成
    function check_back(keys, back, src) {
      
        var items = back[src],
            list,
            parent,
            any;

        //处理完毕则移除回溯关系
        delete back[src];

        if (!items)
        {
            return;
        }
        
        //循环检测
        for (var i = items.length - 1; i >= 0; i--)
        {
            list = items[i];
            
            if ((any = list.indexOf(src)) >= 0)
            {
                list.splice(any, 1);
            }
            
            if (list.length > 0)
            {
                continue;
            }

            //移除当前项
            items.splice(i, 1);

            //如果有回溯
            if (any = list.src)
            {
                //标记请求已执行
                keys[any] = 3;

                //添加回溯
                (parent || (parent = [])).push(any);
            }
            
            //执行回调
            if (any = list.callback)
            {
                list.callback = null;
                
                for (var j = 0, l = any.length; j < l; j++)
                {
                    any[j++].apply(flyingon, any[j]);
                }
            }
        }

        //继续向上回溯检测
        if (parent)
        {
            for (var i = 0, l = parent.length; i < l; i++)
            {
                check_back(keys, back, parent[i]);
            }
        }
    };
    
    
    //检测循环引用, 如果存在则打破(最先移除最后发起的请求)
    function check_cycle(keys, back) {
        
        var names = [],
            src,
            list;
        
        for (src in back)
        {
            names.push(src);
        }
        
        for (var i = names.length - 1; i >= 0; i--)
        {
            if ((list = back[src = names[i]]) && has_cycle(back, list, src))
            {
                //移除循环引用
                for (var j = i; j >= 0; j--)
                {
                    list = back[names[j]];
                    
                    if (!list)
                    {
                        continue;
                    }
                    
                    for (var k = list.length - 1; k >= 0; k--)
                    {
                        if (list[k] && list[k].src === src)
                        {
                            check_back(keys, back, src);
                            break;
                        }
                    }
                }
            }
        }
    };
    
    
    //检测是否存在循环引用
    function has_cycle(back, list, src) {
        
        var name, any;
        
        for (var i = list.length - 1; i >= 0; i--)
        {
            if ((any = list[i]) && (name = any.src))
            {
                if (name === src)
                {
                    return true;
                }
                
                if ((any = back[name]) && has_cycle(back, any, src))
                {
                    return true;
                }
            }
        }
    };
    
        

})(flyingon);



