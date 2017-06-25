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