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



});

  

//模块,类,属性及事件
(function (flyingon) {
    

    
    var create = flyingon.create,
        
        extend = flyingon.extend,

        components = flyingon.components || (flyingon.components = create(null)), //已注册所有组件类型集合
    
        anonymous = 1,
        
        modules = create(null), //模块集合

        module_stack = [], //模块栈

        module_current, //当前模块

        fragments = flyingon.fragments || (flyingon.fragments = create(null)), //功能片段集合

        class_name = 'class name can use only letters and numbers and begin with a upper letter!',

        class_fn = 'class fn must be a function!';
    

    
    //模块名
    flyingon.moduleName = 'flyingon';

    //控件class前缀
    flyingon.className = 'f';



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
                item = module_current || flyingon;
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



    //功能片段
    flyingon.fragment = function (name, fn) {

        var any;

        if (typeof fn === 'function')
        {
            fragments[name] = fn;
        }
        else if (any = fragments[name])
        {
            any.apply(fn, Array.prototype.slice.call(arguments, 2));
        }
    };

    

    //定义类方法
    //name:             类名称,省略即创建匿名类型(匿名类型不支持自动反序列化)
    //superclass:       父类
    //fn:               类代码, 函数, 参数(base:父类原型, self:当前类原型)
    //property:         是否支持属性, 默认支持, 可以从非属性类继承生成非属性类, 不能从属性类继承生成非属性类
    flyingon.defineClass = function (name, superclass, fn, property) {

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
            throw class_name;
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
                throw class_fn;
            }
        }
        else if (!superclass || typeof superclass !== 'function') //处理父类
        {
            superclass = Object;
        }

        return defineClass(name, superclass, fn, property);
    };
        

    //从当前类派生子类
    //name:             类名称,省略即创建匿名类型(匿名类型不支持自动反序列化)
    //fn:               类代码, 函数, 参数(base:父类原型, self:当前类原型)
    //property:         是否支持属性, 默认不支持
    Object.extend = function (name, fn, property) {

        //处理参数
        if (typeof name !== 'string') //不传name则创建匿名类
        {
            property = fn;
            fn = name;
            name = null;
        }
        else if (!/^[A-Z]\w*$/.test(name))
        {
            throw class_name;
        }

        if (typeof fn !== 'function')
        {
            throw class_fn;
        }
        
        return defineClass(name, this, fn, property);
    };



    //定义简单类
    Object.extend._ = function (superclass, fn) {

        if (!fn)
        {
            fn = superclass;
            superclass = Object;
        }
        
        function Class() {};

        fn.call(Class.prototype = create(superclass.prototype));

        return Class;
    };


    //定义类
    function defineClass(name, superclass, fn, property) {


        var Class, base, prototype, module, fullName, any;


        //定义类
        function Class() {

            var init = this.init;

            if (init)
            {
                init.apply(this, arguments);
            }
        };


        //创建原型
        prototype = create(base = superclass.prototype || Object.prototype);

        //设置base属性
        prototype.base = base;


        //父类不是flyingon类
        any = !base.__flyingon_class;

        
        //如果指定要生成属性或父类支持属性则处理属性相关功能
        if (property || (property == null && any) || base.__defaults)
        {
            //生成默认值集合
            prototype.__defaults = create(base.__defaults || null);

            //生成属性集合
            prototype.__properties = create(base.__properties || null);
            
            //父类不是flyingon类则生成属性相关方法
            if (any)
            {
                prototype.defineProperty = defineProperty;
                prototype.storage = storage;
                prototype.get = get;
                prototype.set = set;
                prototype.defaultValue = defaultValue;
                prototype.properties = properties;
                prototype.getOwnPropertyNames = getOwnPropertyNames;
                prototype.notify = notify;
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
            prototype.off = off;
            prototype.trigger = trigger;
            prototype.is = is;
            prototype.toString = toString;
            prototype.dispose = dispose;
        }
        
    
        //获取当前模块
        module = module_current || flyingon;

        //fullName
        fullName = name ? module.moduleName + '-' + name : 'anonymous-type-' + anonymous++;
        
        //类型标记
        prototype[fullName] = true;

        //获取当前类型
        prototype.Class = prototype.constructor = Class;


        //记录未执行的类扩展函数
        Class.__class_fn = fn;

        //注：为提升初始化性能，函数使用延迟执行
        //如果类未实例化过，其原型成员可能未完全创建
        prototype.init = delay_init;

     
        //注册类型(匿名类不注册)
        if (name)
        {
            //类名
            Class.typeName = name;

            //输出及注册类
            module[name] = components[fullName] = Class;
        }
        

        //类全名
        Class.fullName = fullName;
        
        //类原型
        Class.prototype = prototype;

        //所属模块
        Class.module = module;

        //父类
        Class.superclass = superclass;

        //设置组件别名
        Class.register = register;

        //初始化类方法(可调用此方法强制类初始化)
        Class.init = init;

        //派生子类方法
        Class.extend = Object.extend;

        //返回当前类型
        return Class;
    };


    //延时构造函数
    function delay_init() {

        var init;

        this.Class.init();

        if (init = this.init)
        {
            init.apply(this, arguments);
        }
    };


    //初始化类原型
    function init() {

        var prototype = this.prototype, 
            base = prototype.base,
            any;

        if ((any = this.superclass) && any.__class_fn)
        {
            any.init();
        }

        //执行扩展
        if (any = this.__class_fn)
        {
            any.call(prototype, base, prototype);

            //初始化类
            if (any = prototype.__class_init)
            {
                any.call(prototype, this, base, prototype);
            }

            delete this.__class_fn;

            //如果没有生成新的构造函数则删除延时构造函数
            if (prototype.init === delay_init)
            {
                delete prototype.init;
            }
        }

        return this;
    };


    //检测当前对象是否指定类型
    function is(type) {

        return type && (this instanceof type || ((type = type.fullName) && this[type]));
    };


    //默认toString方法
    function toString() {

        return '[object ' + this.fullName + ']';
    };
    

    //定义属性及set_XXX方法
    function defineProperty(name, defaultValue, attributes) {

        var fn, any;

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
        
        //创建读写方法
        this[name] = fn = attributes.fn || property_fn(name, any, attributes.check, attributes.set);

        //标记是属性方法
        fn.property = true;
        
        //扩展至选择器
        if (any = this.__selector_extend)
        {
            (any.prototype || any)[name] = selector_extend(name);
        }

        return fn;
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
                (storage || (this.__storage = create(this.__defaults)))[name] = value;

                if (set)
                {
                    set.call(this, value, any);
                }

                if ((storage = this.__watches) && (storage[name] || storage['*']))
                {
                    this.notify(name, value, any);
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
        

    //获取对象存储器
    function storage() {

        return this.__storage || (this.__storage = create(this.__defaults));
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

        if ((fn = this[name]) && fn.property)
        {
            fn.call(this, value);
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


    //通知属性变更
    function notify(name, value, oldValue) {

        var watches = this.__watches,
            any;

        if (watches)
        {
            if (any = watches[name])
            {
                do_notify.call(this, any, name, value, oldValue);
            }

            if (name !== '*' && (any = watches['*']))
            {
                do_notify.call(this, any, '*', value, oldValue);
            }
        }

        return this;
    };


    function do_notify(list, name, value, oldValue) {

        var item = list[0],
            index = 1;

        if (item)
        {
            this.pushBack(item, value);
        }

        while (item = list[index++])
        {
            item.call(this, name, value, oldValue);
        }
    };


    //观测属性变更
    function watch(name, fn) {

        if (typeof name === 'function')
        {
            fn = name;
            name = '*';
        }
        else if (typeof fn !== 'function')
        {
            return;
        }

        var watches = this.__watches || (this.__watches = {}),
            any = watches[name];

        if (any)
        {
            any.push(fn);
        }
        else
        {
            watches[name] = ['', fn];
        }

        return this;
    };


    //取消属性变更观测
    function unwatch(name, fn) {

        if (typeof name === 'function')
        {
            fn = name;
            name = '*';
        }

        var watches = this.__watches,
            any;

        if (watches && (any = watches[name]))
        {
            for (var i = any.length - 1; i >= 0; i--)
            {
                any.splice(i, 1);
            }

            if (any.length === 1 && !any[0])
            {
                delete watches[name];
            }
        }

        return this;
    };

    
    //绑定事件处理 注:type不带on
    function on(type, fn) {

        if (type && typeof fn === 'function')
        {
            var events = this.__events || (this.__events = create(null));

            (events[type] || (events[type] = [])).push(fn);

            if (fn = this.__event_on)
            {
                fn.apply(this, type);
            }
        }

        return this;
    };

    
    //只执行一次绑定的事件
    function once(type, fn) {

        var self = this;

        function callback() {

            fn.apply(self, arguments);
            self.off(type, callback);
        };

        return this.on(type, callback);
    };

        
    //移除事件处理
    function off(type, fn) {

        var events = this.__events,
            items;

        if (events)
        {
            if (type)
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

            if (fn = this.__event_off)
            {
                fn.call(this, type);
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


    //销毁对象
    function dispose() {

        if (this.__events)
        {
            this.off();
        }

        return this;
    };
    


    //设置组件别名
    function register(name, force) {
    
        if (name || (name = this.typeName))
        {
            if (!force && components[name])
            {
                throw 'component "' + name + '" has exist';
            }

            return components[this.nickName = name] = this;
        }

        return this;
    };
    


    //获取或修改指定类型的默认值
    flyingon.defaultValue = function (Class, name, value) {

        var properties = (Class = Class.prototype || Class).__properties,
            any;

        if (properties && (any = properties[name]))
        {
            if (value === void 0)
            {
                return any.defaultValue;
            }

            if (typeof value !== any.dataType)
            {
                throw 'type is defferent!';
            }

            any.defaultValue = Class.__defaults[name] = value;
        }
    };


    
    //输出全局事件方法
    flyingon.on = on;
    flyingon.off = off;
    flyingon.once = once;
    flyingon.trigger = trigger;
    
    

})(flyingon);



//事件基类
flyingon.Event = Object.extend(function () {

    
    
    this.init = function (type) {

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
    this.stop = function (prevent) {

        this.cancelBubble = true;
        prevent && (this.defaultPrevented = true);
        
        if (arguments[1] !== false && this.original_event)
        {
            flyingon.dom_stop(this.original_event, prevent);
        }
    };


    //禁止默认事件
    this.prevent = function () {

        this.defaultPrevented = true;
        
        if (arguments[0] !== false && this.original_event)
        {
            flyingon.dom_prevent(this.original_event);
        }
    };

    
    
}, false);