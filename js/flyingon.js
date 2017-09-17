/*
* flyingon javascript library v0.0.1.0
* https://github.com/freeoasoft/flyingon
*
* Copyright 2014, yaozhengyang
* licensed under the LGPL Version 3 licenses
*/



//启用严格模式
'use strict';



/**
 * @class flyingon
 * @static
 * @description flyingon全局名字空间
 */
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
    
    
    /**
     * @property version
     * @type string
     * @for flyingon
     * @description flyingon版本号
     */
    flyingon.version = '1.0.1';



    //空函数
    function fn() {};
        
        
    /**
     * @method create
     * @for flyingon
     * @description 以指定原型创建对象
     * @param {object} prototype 新创建对象的原型
     * @return {object} 新创建的对象
     * @example 
     * //创建一个原型为null的对象
     * flyingon.create(null);
     * @example 
     * //创建一个原型为数组的对象
     * flyingon.create([]);
     */
    flyingon.create = Object.create || function (prototype) {

        if (prototype)
        {
            fn.prototype = prototype;
            return new fn();
        }

        return {};
    };


    /**
     * @method extend
     * @for flyingon
     * @description 复制源对象成员至目标对象
     * @param {object} target 目标对象
     * @param {object} source 源对象(可以有多个源对象)
     * @param {boolean} deep 是否深复制
     * @return {object} 目标对象
     * @example
     * flyingon.extend({}, { a: 1, b: [1, 2] }, { c: 3 }, true);
     */
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
        

    /**
     * @method each
     * @for flyingon
     * @description 循环处理
     * @param {string|any[]} values 循环目标
     * @param {function} fn 循环函数
     * @param {object} [context] 指定函数上下文(this)
     * @example
     * flyingon.each('1,2,3,4,5', function (item, index) {
     * 
     *      //...
     * });
    * @example
     * flyingon.each([1,2,3,4,5], function (item, index) {
     * 
     *      //...
     * });
     */
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

        slice = [].slice,

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



    /**
     * @method use
     * @for flyingon
     * @description 使用指定模块
     * @param {string} name 模块名称, 多级名称用"."分隔
     * @return {object} 模块对象
     * @example
     * flyingon.use('a.b');
     */
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


     /**
     * @method defineModule
     * @for flyingon
     * @description 定义或切换当前模块
     * @param {string} name 模块名称, 多级名称用"."分隔
     * @param {function} [callback] 模块定义函数, 不传入表示切换当前模块
     * @return {object} 模块对象
     * @example
     * flyingon.use('a.b');
     */
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

    
    /**
     * @method endModule
     * @for flyingon
     * @description 结束当前切换当前模块
     * @return {object} 模块对象
     * @example
     * flyingon.endModule();
     */
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



    /**
     * @method fragment
     * @for flyingon
     * @description 定义或扩展功能片段
     * @param {string} name 片段名称
     * @param {function|object} fn 类型是函数时表示功能实现, 类型是对象时表示对比对象扩展定义名称的片段
     * @example
     * //定义功能片段
     * flyingon.fragment('test', function () {
     * 
     *      this.fn = function () {};
     * });
     * @example
     * //给定义的类扩展功能片段
     * Object.extend(function () {
     * 
     *      flyingon.fragment('test', this);
     * });
     */
    flyingon.fragment = function (name, fn) {

        var any;

        if (typeof fn === 'function')
        {
            fragments[name] = fn;
        }
        else if (any = fragments[name])
        {
            any.apply(fn, slice.call(arguments, 2));
        }
    };

    


    /**
     * @class Class
     * @description 通过flyingon.defineClass或{父类}.extend定义的类
     */


    /**
     * @method defineClass
     * @for flyingon
     * @description 定义类方法, 此方法大多数情况下可使用{父类}.extend替换, 比如Object.extend表示从Object继承定义子类
     * @param {string} [name] 类名称, 只能包含英文字母及数字且首字母需大写
     * @param {function} [superclass] 父类, 省略时表示从Object继承
     * @param {function} fn 类实现, 函数内this指向类原型, 参数(base:父类原型, self:当前类原型)
     * @param {boolean} [property] 是否支持属性, 默认支持, 可以从非属性类继承生成非属性类, 不能从属性类继承生成非属性类
     * @return {Class} 生成的类
     * @example
     * //从Object继承定义父类
     * var BaseClass = flyingon.defineClass(function () {
     * 
     *      //定义字符串类型的name属性, 默认值为空字符串
     *      this.defineProperty('name', '');
     * 
     *      //定义方法
     *      this.fn = function () {};
     * });
     * @example
     * //从BaseClass继承派生子类
     * var ChildClass = flyingon.defineClass(BaseClass, function (base) {
     * 
     *      //重载父类方法
     *      this.fn = function () {
     * 
     *          //调用父类方法
     *          base.fn.call(this);
     *      };
     * });
     */
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
    
    
    /**
     * @method extend
     * @for Class
     * @description 从当前类派生生成子类
     * @param {string} [name] 类名称, 只能包含英文字母及数字且首字母需大写
     * @param {function} fn 类实现, 函数内this指向类原型, 参数(base:父类原型, self:当前类原型)
     * @param {boolean} [property] 是否支持属性, 默认支持, 可以从非属性类继承生成非属性类, 不能从属性类继承生成非属性类
     * @return {Class} 生成的类
     * @example
     * //从Object继承定义父类
     * var BaseClass = Object.extend(function () {
     * 
     *      //定义字符串类型的name属性, 默认值为空字符串
     *      this.defineProperty('name', '');
     * 
     *      //定义方法
     *      this.fn = function () {};
     * });
     * @example
     * //从BaseClass继承派生子类
     * var ChildClass = BaseClass.extend(function (base) {
     * 
     *      //重载父类方法
     *      this.fn = function () {
     * 
     *          //调用父类方法
     *          base.fn.call(this);
     *      };
     * });
     */
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

        //注册组件
        Class.register = superclass.register || register;

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


    /**
     * @static
     * @method init
     * @for Class
     * @description 类初始化方法, 默认情况下在第一次实例化类时会自动初始化, 如有特殊需要可手动调用此方法对类进行初始化
     * @return {Class} 返回当前类
     */
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


    /**
     * @method is
     * @for Class
     * @description 检测当前对象是否指定类型
     * @param {function} type 指定的类型
     * @return {boolean} 是否指定类型  
     */
    function is(type) {

        return type && (this instanceof type || ((type = type.fullName) && this[type]));
    };


    /**
     * @method toString
     * @for Class
     * @description 返回类的字符串表示
     * @return {string} 类字符串表示
     */
    function toString() {

        return '[object ' + this.fullName + ']';
    };
    

    /**
     * @method defineProperty
     * @for Class
     * @description 定义属性
     * @param {string} name 属性名, 不能包含英文字母及数字且以英文字母开头
     * @param {any} defaultValue 属性默认值, 如果attributes中未指定dataType, 会自动从此值推导出默认值
     * @param {object=} attributes 属性参数 { dataType: string, check: function, set: function }
     * @return {function} 属性函数
     */
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
                    value = value ? Date.create(value) : null; //自定义扩展Date.create函数解决不同浏览对日期格式解析不一致的问题
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
        

    /**
     * @method storage
     * @for Class
     * @description 获取对象存储器
     * @return {object} 对象存储器或默认存储器
     */
    function storage() {

        return this.__storage || (this.__storage = create(this.__defaults));
    };


    /**
     * @method get
     * @for Class
     * @description 获取指定名称的属性值
     * @param {string} name 属性名
     * @return {any} 属性值
     */
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
    
    
    /**
     * @method set
     * @for Class
     * @description 设置指定名称的属性值
     * @param {string} name 属性名
     * @param {any} value 属性值
     * @return {object} 当前实例对象
     */
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


    /**
     * @method defaultValue
     * @for Class
     * @description 获取或设置属性默认值
     * @param {string} name 属性名
     * @param {any=} value 默认值, 未传入此值时表示读取默认值, 否则表示设置默认值
     * @return {(any|object)} 读取默认值时返回默认值, 否则返回当前实例对象
     */
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


    /**
     * @method properties
     * @for Class
     * @description 获取属性值集合
     * @param {boolean=} deep 是否返回父类的属性值
     * @param {function=} filter 过滤条件
     * @return {object[]} 属性值集合
     */
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


    /**
     * @method notify
     * @for Class
     * @description 通知对象属性值变更
     * @param {string} name 属性名
     * @param {any} newValue 新属性值
     * @param {any} oldValue 原属性值
     * @return {object} 当前实例对象
     */
    function notify(name, newValue, oldValue) {

        var watches = this.__watches,
            any;

        if (watches)
        {
            if (any = watches[name])
            {
                do_notify.call(this, any, name, newValue, oldValue);
            }

            if (name !== '*' && (any = watches['*']))
            {
                do_notify.call(this, any, '*', newValue, oldValue);
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


    /**
     * @method watch
     * @for Class
     * @description 观测属性变更
     * @param {string} name 属性名
     * @param {function} fn 属性值变更后的回调方法
     * @return {object} 当前实例对象
     */
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


    /**
     * @method unwatch
     * @for Class
     * @description 取消属性变更观测
     * @param {string} name 属性名, 传入"*"表示取消所有观测
     * @param {function=} fn 注册的属性变更方法
     * @return {object} 当前实例对象
     */
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
            if (fn)
            {
                for (var i = any.length - 1; i >= 1; i--)
                {
                    if (any[i] === fn)
                    {
                        any.splice(i, 1);
                    }
                }
            }
            else
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

    
    /**
     * @method on
     * @for Class
     * @description 绑定事件处理 注:type不带on
     * @param {string} type 事件类型
     * @param {function=} fn 事件处理方法
     * @return {object} 当前实例对象
     */
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

    
    /**
     * @method once
     * @for Class
     * @description 绑定事件处理, 执行一次后自动移除绑定 注:type不带on
     * @param {string} type 事件类型
     * @param {function=} fn 事件处理方法
     * @return {object} 当前实例对象
     */
    function once(type, fn) {

        var self = this;

        function callback() {

            fn.apply(self, arguments);
            self.off(type, callback);
        };

        return this.on(type, callback);
    };

        
    /**
     * @method off
     * @for Class
     * @description 移除事件处理
     * @param {string=} type 事件类型, 不传值时表示移除所有事件处理
     * @param {function=} fn 事件处理方法, 不传值时表示移除指定类型的所有事件处理
     * @return {object} 当前实例对象
     */
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

    
    /**
     * @method trigger
     * @for Class
     * @description 分发事件
     * @param {(string|flyingon.Event)=} e 事件参数
     * @param {...any=} 自定义事件参数 按name, value的方式传入
     * @return {boolean} 是否阻止默认处理
     * @example
     * //分发类型为test的事件(有一个自定义的data参数, 值为1)
     * flyingon.trigger('test', 'data', 1);
     */
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


    /**
     * @method getOwnPropertyNames
     * @for Class
     * @description 获取自身属性名集合(不包含默认值)
     * @return {string[]} 属性名集合
     */
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


     /**
     * @method dispose
     * @for Class
     * @description 销毁对象
     * @return {object} 当前实例对象
     */
    function dispose() {

        if (this.__events)
        {
            this.off();
        }

        return this;
    };
    


    /**
     * @static
     * @method register
     * @for Class
     * @description 注册类
     * @param {string=} name 注册名称, 省略时默认以类名注册
     * @param {boolean=} force 名称已经注册过时是否强制覆盖
     * @return {Class} 当前类
     */
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
    


    /**
     * @method defaultValue
     * @for flyingon
     * @description 获取或修改指定类的默认值
     * @param {Class} Class 指定的目标类
     * @param {string} name 属性名
     * @param {any=} value 默认值, 未传入时表示读取默认值, 否则表示设置默认值
     */
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

    /**
     * @method on
     * @for flyingon
     * @description 绑定事件处理 注:type不带on
     * @param {string} type 事件类型
     * @param {function=} fn 事件处理方法
     * @return {object} 当前实例对象
     */
    flyingon.on = on;

    /**
     * @method once
     * @for flyingon
     * @description 绑定事件处理, 执行一次后自动移除绑定 注:type不带on
     * @param {string} type 事件类型
     * @param {function=} fn 事件处理方法
     * @return {object} 当前实例对象
     */
    flyingon.once = once;

    /**
     * @method off
     * @for flyingon
     * @description 移除事件处理
     * @param {string=} type 事件类型, 不传值时表示移除所有事件处理
     * @param {function=} fn 事件处理方法, 不传值时表示移除指定类型的所有事件处理
     * @return {object} 当前实例对象
     */
    flyingon.off = off;
    
    /**
     * @method trigger
     * @for flyingon
     * @description 分发事件
     * @param {(string|flyingon.Event)=} e 事件参数
     * @param {...any=} 自定义事件参数 按name, value的方式传入
     * @return {boolean} 是否阻止默认处理
     * @example
     * //分发类型为test的事件(有一个自定义的data参数, 值为1)
     * flyingon.trigger('test', 'data', 1);
     */
    flyingon.trigger = trigger;
    
    

})(flyingon);



/**
 * @class flyingon.Event
 * @description 事件基类
 */
Object.extend('Event', function () {

    

    this.init = function (type) {

        this.type = type;
    };
    
    
    
    /**
     * @readonly
     * @property type
     * @type {string}
     * @description 事件类型
     */
    this.type = null;


    /**
     * @readonly
     * @property target
     * @type {object}
     * @description 触发事件目标对象
     */
    this.target = null;


    /**
     * @readonly
     * @property cancelBubble
     * @type {boolean}
     * @description 是否取消冒泡
     */
    this.cancelBubble = false;

    
    /**
     * @readonly
     * @property defaultPrevented
     * @type {boolean}
     * @description 是否阻止默认动作
     */
    this.defaultPrevented = false;


    /**
     * @method stop
     * @description 停止事件冒泡
     * @param {boolean} prevent 是否同时禁止默认事件处理
     * @return {object} 当前对象实例
     */
    this.stop = function (prevent) {

        this.cancelBubble = true;
        prevent && (this.defaultPrevented = true);
        
        if (arguments[1] !== false && this.original_event)
        {
            flyingon.dom_stop(this.original_event, prevent);
        }

        return this;
    };


    /**
     * @method prevent
     * @description 禁止默认事件处理
     * @return {object} 当前对象实例
     */
    this.prevent = function () {

        this.defaultPrevented = true;
        
        if (arguments[0] !== false && this.original_event)
        {
            flyingon.dom_prevent(this.original_event);
        }

        return this;
    };

    
    
}, false);




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
    
    

//html编码函数
flyingon.html_encode = (function () {
    
    var map = flyingon.create(null);

    map['&'] = '&amp;';
    map['<'] = '&lt;';
    map['>'] = '&gt;';
    map['\''] = '&apos;';
    map['"'] = '&quot;';

    return function (text) {

        if (text && typeof text === 'string')
        {
            var keys = map;

            return text.replace(/([&<>'"])/g, function (_, key) {

                return keys[key];
            });
        }

        return '' + text;
    };

})();


//html解码函数
flyingon.html_decode = (function () {
    
    var map = flyingon.create(null);

    map['amp'] = '&';
    map['lt'] = '<';
    map['gt'] = '>';
    map['apos'] = '\'';
    map['quot'] = '"';

    return function (text) {

        var keys = map;

        return text && text.replace(/&(\w+);/g, function (_, key) {

            return keys[key] || key;
        });
    };

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




/**
 * @class flyingon.Async
 * @description 异步处理类
 */
flyingon.Async = Object.extend(function () {


    
    /**
     * @method sleep
     * @description 延时
     * @param {int} time 延时时间
     * @param {function} [done] 延时成功后调用方法
     * @param {function} [fail] 延时失败后调用方法
     * @return {object} 当前实例对象
     */
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
    
       
    /**
     * @method done
     * @description 注册成功执行函数或异步通知
     * @param {boolean} [asyn] 是否异步
     * @param {function} fn 调用方法
     * @return {object} 当前实例对象
     */
    this.done = function (asyn, fn) {

        return registry(this, asyn, fn, 1);
    };


    /**
     * @method fail
     * @description 注册执行失败函数或异步通知
     * @param {boolean} [asyn] 是否异步
     * @param {function} fn 调用方法
     * @return {object} 当前实例对象
     */
    this.fail = function (asyn, fn) {

        return registry(this, asyn, fn, 2);
    };
    
    
    /**
     * @method complete
     * @description 注册执行完毕函数或异步通知
     * @param {boolean} [asyn] 是否异步
     * @param {function} fn 调用方法
     * @return {object} 当前实例对象
     */
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
    
    
    /**
     * @method resolve
     * @description 成功执行通知
     * @param {any} value 自定义通知参数
     * @return {object} 当前实例对象
     */
    this.resolve = function (value) {

        return complete(this, 1, value);
    };


    /**
     * @method reject
     * @description 失败执行通知
     * @param {string} error 错误信息
     * @param {boolean} [bubble] 是否向上冒泡
     * @return {object} 当前实例对象
     */
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
    


     /**
     * @method progress
     * @description 注册执行进度函数
     * @param {function} fn 执行函数
     * @return {object} 当前实例对象
     */
    this.progress = function (fn) {

        if (typeof fn === 'function')
        {
            (this.__progress || (this.__progress = [])).push(fn);
        }
        
        return this;
    };


     /**
     * @method notify
     * @description 执行进度通知
     * @param {any} value 自定义参数
     * @return {object} 当前实例对象
     */
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
    
    
}, false);

    

/**
 * @method delay
 * @for flyingon
 * @description 异步延时处理
 * @param {int} [delay] 指定延时时间
 * @param {function} fn 执行函数
 * @return {object} 当前实例对象
 */
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


    //转换数组项为键值对
    this.pair = function (value) {

        var map = flyingon.create(null);

        if (value === void 0)
        {
            value = true;
        }

        for (var i = 0, l = this.length; i < l; i++)
        {
            map[this[i]] = value;
        }

        return map;
    };


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



(function () {
    

    var regex = /([yMdhmsSq]+)/g;
    
    var keys1 = {
    
        'GMT': 'toGMTString',
        'ISO': 'toISOString',
        'UTC': 'toUTCString',
        'date': 'toDateString',
        'time': 'toTimeString',
        'locale': 'toLocaleString',
        'locale-date': 'toLocaleDateString',
        'locale-time': 'toLocaleTimeString'
    };

    var keys2 = {

        'y': 'getFullYear',
        'd': 'getDate',
        'h': 'getHours',
        'm': 'getMinutes',
        's': 'getSeconds',
        'S': 'getMilliseconds'
    };


    this.format = function (format) {

        var any;

        if (format)
        {
            if (any = keys1[format])
            {
                return this[any]();
            }

            any = this;

            return format.replace(regex, function (_, text) {

                var length = text.length;

                switch (text = text.charAt(0))
                {
                    case 'M':
                        text = any.getMonth() + 1;
                        break;

                    case 'q':
                        text = (any.getMonth() + 3) / 3 | 0;
                        break;

                    default:
                        text = any[keys2[text]]();
                        break;
                }

                text = '' + text;

                if (length === 1 || (length -= text.length) <= 0)
                {
                    return text;
                }

                //substr负索引有IE7下有问题
                return '0000'.substring(0, length) + text;
            });
        }
        
        return this.toString();
    };


    this.addYear = function (value) {

        this.setFullYear(this.getFullYear() + (value | 0));
        return this;
    };


    this.addMonth = function (value) {

        this.setMonth(this.getMonth() + (value | 0));
        return this;
    };


    this.addDate = function (value) {

        this.setDate(this.getDate() + (value | 0));
        return this;
    };



    //解决不同浏览器对字符串解析不同的问题(不同浏览器之间存在很多差别)
    //比如IE不支持new Date('2017-1-1 1:1:1')
    Date.create = function (value) {

        if (value)
        {
            var date = new Date(value),
                any = date.valueOf();

            if (any === any)
            {
                return date;
            }

            if (typeof value === 'string' && (value = value.match(/\d+/g)))
            {
                any = value[1] | 0;
                date = new Date(value[0], any > 0 ? any - 1 : 0, value[2] | 0, value[3] | 0, value[4] | 0, value[5] | 0);
            }
        }

        return null;
    };



}).call(Date.prototype);




/**
 * @class f-collection
 * @extension
 * @description 集合功能片段
 */
flyingon.fragment('f-collection', function () {



    var array = Array.prototype;



    /**
     * @property length
     * @type {int}
     * @description 子项总数量
     */
    this.length = 0;


    /**
     * @method indexOf
     * @description 获取指定子项的索引号(与数组同名方法相同)
     * @param {any} item 子项
     * @return {int} 索引号, -1表示不存在
     */

    /**
     * @method lastIndexOf
     * @description 从后向前获取指定子项的索引号(与数组同名方法相同)
     * @param {any} item 子项
     * @return {int} 索引号, -1表示不存在
     */
    this.indexOf = this.lastIndexOf = [].indexOf;



    /**
     * @method push
     * @description 在集合的末尾添加一个或多个子项(与数组同名方法相同)
     * @param {...*} item 子项
     * @return {int} 子项总数量
     */
    this.push = function () {

        if (arguments.length > 0)
        {
            this.__check_items(this.length, arguments, 0);
            array.push.apply(this, arguments);
        }

        return this.length;
    };


    /**
     * @method pop
     * @description 弹出最后一个子项(与数组同名方法相同)
     * @return {any} 弹出的子项
     */
    this.pop = function () {
        
        var item = array.pop.call(this);

        if (item)
        {
            this.__remove_items(this.length - 1, [item]);
        }

        return item;
    };


    /**
     * @method unshift
     * @description 在集合的开始位置插入一个或多个子项(与数组同名方法相同)
     * @param {...any} item 子项
     * @return {int} 子项总数量
     */
    this.unshift = function () {

        if (arguments.length > 0)
        {
            this.__check_items(0, arguments, 0);
            array.unshift.apply(this, arguments);
        }

        return this.length;
    };


    /**
     * @method shift
     * @description 弹出第一个子项(与数组同名方法相同)
     * @return {any} 弹出的子项
     */
    this.shift = function () {
        
        var item = array.shift.call(this);

        if (item)
        {
            this.__remove_items(0, [item]);
        }

        return item;
    };


    /**
     * @method splice
     * @description 在集合的指定位置移除或插入一个或多个子项(与数组同名方法相同)
     * @param {int} index 索引号
     * @param {int=} length 要移除的子项数量 
     * @param {...*=} item 要插入的子项
     * @return {object[]} 移除的子项集合
     */
    this.splice = function (index, length) {

        if (arguments.length > 2)
        {
            var any = this.length;

            if ((index |= 0) < 0)
            {
                index += any;
            }

            if (index < 0)
            {
                index = 0;
            }
            else if (index > any)
            {
                index = any;
            }

            this.__check_items(index, arguments, 2);
        }

        var items = array.splice.apply(this, arguments);

        if (items.length > 0)
        {
            this.__remove_items(index, items);
        }

        return items;
    };

        

    //增加子项前检测处理
    this.__check_items = function (index, items, start) {
    };


    //移除子项处理
    this.__remove_items = function (index, items) {
    };


    
    /**
     * @method children
     * @description 获取子项集合
     * @return {object[]} 子项集合
     */
    this.children = function () {

        return array.slice.call(this, 0);
    };



});




//序列化功能扩展
flyingon.fragment('f-serialize', function () {
    
    
       
    //设置不反序列化Class属性
    this.deserialize_Class = true;
    
    
    
    //序列化方法
    this.serialize = function (writer) {

        var any;
        
        if ((any = this.Class) && (any = any.nickName || any.Class))
        {
            writer.writeProperty('Class', any);
        }
        
        if (any = this.__storage)
        {
            writer.writeProperties(any, this.getOwnPropertyNames(), this.__watches);
        }
    };
    
        
    //反序列化方法
    this.deserialize = function (reader, values) {

        var bind = this.addBind,
            value,
            any;
        
        for (var name in values)
        {
            if ((value = values[name]) === void 0)
            {
                continue;
            }
            
            if (bind && typeof value === 'string' && value.charAt(0) === '{' && (any = value.match(/^\{\{(\w+)\}\}$/)))
            {
                this.addBind(name, any[1]);
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
                this.set(name, value);
            }
        }
    };


});



//读序列化类
flyingon.SerializeReader = Object.extend(function () {

    

    var components = flyingon.components;
    
    var Array = window.Array;
    
    

    this.deserialize = function (data) {

        if (data)
        {
            if (typeof data === 'string')
            {
                data = flyingon.parseJSON(data);
            }

            if (typeof data === 'object')
            {
                data = data instanceof Array ? this.readArray(data) : this.readObject(data);
                this.all = this.callback = null;
            }
        }

        return data;
    };


    this.readArray = function (data, type) {

        if (data)
        {
            var array = [],
                any;

            for (var i = 0, l = data.length; i < l; i++)
            {
                if ((any = data[i]) && typeof any === 'object')
                {
                    if (type || !(any instanceof Array))
                    {
                        any = this.readObject(any, type);
                    }
                    else
                    {
                        any = this.readArray(any);
                    }
                }

                array.push(any);
            }

            return array;
        }

        return null;
    };


    this.readObject = function (data, type) {

        if (data)
        {
            var target, any;

            if (any = data.Class)
            {
                if (any = components[any])
                {
                    target = new any();
                }
                else
                {
                    target = new flyingon.HtmlElement();
                    target.tagName = data.Class;
                }

                target.deserialize(this, data);
                
                if (any = data.id)
                {
                    read_reference.call(this, target, any);
                }
            }
            else if (type)
            {
                if ((target = new type()).deserialize)
                {
                    target.deserialize(this, data);
                    
                    if (any = data.id)
                    {
                        read_reference.call(this, target, any);
                    }
                }
                else
                {
                    this.readProperties(target, data); 
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
      
        var any;

        for (var name in data)
        {
            if ((any = data[name]) && typeof any === 'object')
            {
                any = any instanceof Array ? this.readArray(any) : this.readObject(any);
            }

            target[name] = any;
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
      
        

}, false);



//写序列化类
flyingon.SerializeWriter = Object.extend(function () {


    
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
            if (value instanceof Date)
            {
                writer.push('"', value, '"', ',');
                return;
            }

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


    this.writeProperties = function (storage, keys, watches) {

        var data = this.data,
            name,
            any;
        
        for (var i = 0, l = keys.length; i < l; i++)
        {
            name = keys[i];
            
            if (watches && (any = watches[name]) && (any = any[0]))
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
    
    
    this.writeProperty = function (name, value, array) {
      
        if (name)
        {
            this.data.push('"', name, '":');

            if (array)
            {
                this.writeArray(value);
            }
            else
            {
                this.write(value);
            }
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

    

}, false);




//行集合类
flyingon.RowCollection = Object.extend._(function () {
    

    //记录数
    this.length = 0;

    
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
    
            
    this.toJSON = function (change, names) {
        
        var writer = ['['],
            row,
            data,
            tag,
            any;
        
        if (change && names)
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
                
                if (change && (any = row.originalData))
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
                else if (value instanceof Date)
                {
                    writer.push('"', value, '"');
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
                            else if (value instanceof Date)
                            {
                                writer.push('"', value, '"');
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
    
    
});



//数据集功能片段
flyingon.fragment('f-dataset', function () {
    
    
        
    //加载数据
    this.load = function (list, primaryKey) {
        
        var dataset = this.dataset;
        
        (dataset || this).__load_data(dataset ? this : null, list, primaryKey);        
        return this;
    };
    
    
    //加载树型数据
    this.loadTreeList = function (list, primaryKey, childrenName) {
        
        var dataset = this.dataset;
        
        (dataset || this).__load_data(dataset ? this : null, list, primaryKey, '', childrenName || 'children');        
        return this;
    };


    //扩展集合操作功能
    flyingon.fragment('f-collection', this);
    
    
    //插入子项
    this.__check_items = function (index, items, start) {

        var Class = flyingon.DataRow,
            rows = [],
            dataset = this.dataset,
            parent = null,
            keys1,
            keys2,
            primaryKey,
            row,
            data;
                
        if (dataset)
        {
            parent = this;
        }
        else
        {
            dataset = this;
        }

        keys1 = dataset.__keys1;
        keys2 = (primaryKey = dataset.primaryKey) && dataset.__keys2;

        for (var i = start, l = items.length; i < l; i++)
        {
            if ((data = items[i]) && data.dataset)
            {
                row = data;
            }
            else
            {
                row = new Class();
            
                row.dataset = dataset;
                row.parent = parent;
                row.data = data = data || {};
                row.state = 'add';
            }
            
            keys1[row.uniqueId = dataset.__new_id++] = row;
            
            if (primaryKey)
            {
                keys2[row.id = data[primaryKey]] = row;
            }
        
            dataset.__change_rows.push(row);
            rows.push(row);
        }

        dataset.trigger('add', 'parent', parent, 'index', index, 'rows', rows);
    };


    //移除子项
    this.__remove_items = function (index, items) {

        var dataset = this.dataset,
            parent = null,
            keys1,
            keys2,
            primaryKey,
            row;
                    
        if (dataset)
        {
            parent = this;
        }
        else
        {
            dataset = this;
        }

        keys1 = dataset.__keys1;
        keys2 = dataset.primaryKey && dataset.__keys2;

        dataset.trigger('remove', 'parent', parent, 'index', index, 'rows', items);

        for (var i = 0, l = items.length; i < l; i++)
        {
            row = this[i];
 
            delete keys1[row.uniqueId];

            if (primaryKey)
            {
                delete keys2[row.id];
            }

            row.dataset = row.parent = null;
        }

        if (row.uniqueId === dataset.__current_id)
        {
            dataset.moveTo(this[index] || this[--index]);
        }
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
flyingon.DataRow = Object.extend._(flyingon.RowCollection, function () {
    
    

    //默认事件
    var default_event = new flyingon.Event();
    
        

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
    //normal        未变更状态
    //add           增加状态
    //change        已修改状态
    this.state = 'normal';
                
    
                
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
                event, 
                key, 
                any;
            
            if (trigger !== false)
            {
                event = default_event;
                event.type = 'change';
                event.row = this;
                event.name = name;
                event.value = value;
                event.oldValue = oldValue;
                
                if (dataset.trigger(event) === false)
                {
                    return this;
                }
                
                if ((any = event.value) !== value && any !== void 0)
                {
                    value = any;
                }
            }
            
            if (this.state === 'normal')
            {
                this.originalData = any = {};

                for (key in data)
                {
                    any[key] = data[key];
                }

                this.state = 'change';

                dataset.__change_rows.push(this);
            }

            data[name] = value;

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
            parent.splice(parent.indexOf(this), 1);
        }
        
        return this;
    };
    
    
    
    //扩展数据集功能
    flyingon.fragment('f-dataset', this);
    

    
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
    this.total = function () {
        
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
    
    
    
    this.init = function () {
       
        //id生成器
        this.__new_id = 1;
        
        //uniqueId集合
        this.__keys1 = flyingon.create(null);
        
        //id集合
        this.__keys2 = flyingon.create(null);
        
        //变更的数据行集合
        this.__change_rows = [];
    };
    


    //主键
    this.primaryKey = '';

    
        
    //扩展数据集功能
    flyingon.fragment('f-dataset', this);
    
    
    
        
    //从二维关系表加载树型数据
    this.loadTreeFromList = function (list, primaryKey, parentKey) {
        
        return this.__load_data(null, list, this.primaryKey = primaryKey || 'id', parentKey || 'parentId');
    };
    
    
    //加载数据内部方法
    this.__load_data = function (parent, list, primaryKey, parentKey, childrenName) {

        if (list && list.length > 0)
        {
            this.__new_id = load_data(this, 
                parent, 
                list, 
                this.primaryKey = primaryKey, 
                parentKey, 
                childrenName, 
                this.__new_id++);
            
            this.trigger('load', 'parent', parent);
        }
        
        return this;
    };
    
    
    function load_data(dataset, parent, list, primaryKey, parentKey, childrenName, uniqueId) {
      
        var target = parent || dataset,
            rowType = flyingon.DataRow,
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
    
    
    //获取或设置当前行
    this.current = function () {
        
        var id = this.__current_id;
        return id && this.__keys1[id] || null;
    };
    
    
    //移动到第一行
    this.first = function () {
        
        var row = this[0];
        
        if (row)
        {
            this.moveTo(row);
        }

        return this;
    };
    
    
    //移动到上一行
    this.previous = function () {
        
        var row = this.current(),
            parent = row && row.parent || this,
            index = row ? parent.indexOf(row) - 1 : 0;
        
        if (row = parent[index])
        {
            this.moveTo(row);
        }

        return this;
    };
    
    
    //移动到下一行
    this.next = function () {
        
        var row = this.current(),
            parent = row && row.parent || this,
            index = row ? parent.indexOf(row) + 1 : 0;
        
        if (row = parent[index])
        {
            this.moveTo(row);
        }

        return this;
    };
    
    
    //移动到最后一行
    this.last = function () {
        
        var row = this[this.length - 1];
        
        if (row)
        {
            this.moveTo(row);
        }

        return this;
    };
    
    
    //移动到指定行
    this.moveTo = function (row) {
        
        var id = this.__current_id,
            oldValue = id && this.__keys1[id] || null;
        
        if (oldValue !== row && this.trigger('move', 'value', row, 'oldValue', oldValue) !== false)
        {
            this.__current_id = row && row.uniqueId;

            //触发当前行移动动作
            this.dispatch('move', row);
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
            rows = this.__change_rows,
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
        
        var rows = this.__change_rows,
            length = rows.length,
            row;
        
        if (length > 0)
        {
            for (var i = 0; i < length; i++)
            {
                if (row = rows[i])
                {
                    row.originalData = null;
                    row.state = 'normal';
                }
            }
            
            rows.length = 0;
        }
        
        return this;
    };
  
    
    //拒绝所有修改
    this.rejectChanges = function () {
        
        var rows = this.__change_rows,
            length = rows.length,
            row,
            data,
            any;
        
        if (length > 0)
        {
            for (var i = length - 1; i >= 0; i--)
            {
                if (row = rows[i])
                {
                    if (any = row.originalData)
                    {
                        data = row.data;

                        for (var name in any)
                        {
                            data[name] = any[name];
                        }

                        row.originalData = null;
                        row.state = 'normal';

                        this.dispatch('change', row);
                    }
                    else
                    {
                        row.remove();
                    }
                }
            }
            
            rows.length = 0;
        }
        
        return this;
    };
    
    
    
    //订阅或取消订阅变更动作
    this.subscribe = function (control, cancel) {
        
        if (control && control.subscribeBind)
        {
            var list = this.__subscribe,
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
                (this.__subscribe = []).push(control);
            }
        }

        return this;
    };


    

    var action_cache = { type: '', row: null, name: null, current: false };
    
    
    //派发变更动作
    this.dispatch = function (type, row, name) {
        
        var list;
        
        if (type && (list = this.__subscribe))
        {
            var action = action_cache,
                current;

            action.type = type;
            action.name = name || null;

            if (action.row = row)
            {
                current = row ? row.uniqueId === this.__current_id : false;
            }
            else
            {
                action.row = this.current();
                current = true;
            }

            for (var i = 0, l = list.length; i < l; i++)
            {
                if (current || list[i].__subscribe_all)
                {
                    list[i].subscribeBind(this, action);
                }
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

        any = (any = action.row.data) && any[name];
        return any !== void 0 ? any : '';
    };


    //设置绑定值
    this.setBindingValue = function (name, value, row) {

        var any = this.__expression_keys;

        if (any && (any = any[name]))
        {
            if (any = any[1])
            {
                any.call(this, value, row || this.current());
            }
        }
        else
        {
            (row || this.current()).set(name, value);
        }

        return this;
    };

    
        
}, false);




/**
 * @class f-bindable
 * @extension
 * @description 可绑定功能片段
 */
flyingon.fragment('f-bindable', function () {
    
    

    /**
     * @method dataset
     * @description 获取或设置关联的数据集
     * @param {?flyingon.DataSet=} value 未传入值时表示获取值, 否则表示设置值
     * @return {(?flyingon.DataSet|object)} 获取值时返回数据集对象或null, 否则返回当前对象实例
     */
    this.defineProperty('dataset', null, {
        
        fn: function (value) {

            var any = this.__dataset || null;

            if (value === void 0)
            {
                return any;
            }

            if (any === value)
            {
                return this;
            }

            if (this.__watch_list && flyingon.__do_watch(this, 'dataset', value) === false)
            {
                return this;
            }

            this.__dataset = value;

            if (any) 
            {
                any.subscribe(this, true);
            }

            if (value) 
            {
                value.subscribe(this);
            }

            return this;
        }
    });
    
    
    /**
     * @method addBind
     * @description 添加属性绑定
     * @param {string} name 属性名
     * @param {string} fieldName 数据集字段名
     * @return {object} 当前实例对象
     */
    this.addBind = function (name, fieldName) {
        
        if (name && fieldName)
        {
            var watches = this.__watches || (this.__watches = {}),
                any;

            if (any = watches[name])
            {
                any[0] = fieldName;
            }
            else
            {
                watches[name] = [fieldName];
            }
        }
        
        return this;
    };
    
    
    /**
     * @method removeBind
     * @description 移除属性绑定
     * @param {string} name 属性名
     * @return {object} 当前实例对象
     */
    this.removeBind = function (name) {
        
        var watches = this.__watches,
            any;
        
        if (watches && (any = watches[name]) && any[0])
        {
            if (any[1])
            {
                any[0] = '';
            }
            else
            {
                delete watches[name];
            }
        }
        
        return this;
    };

    
    /**
     * @method subscribeBind
     * @description 接收数据集变更动作处理
     * @param {flyingon.DataSet} dataset 数据集
     * @param {object} action 数据集动作 { name: string, row: DataRow }
     * @return {object} 当前实例对象
     */
    this.subscribeBind = function (dataset, action) {
        
        var watches = this.__watches;
        
        if (watches)
        {
            var bind = action.name, 
                key, 
                any;

            for (var name in watches)
            {
                if ((any = watches[name]) && (key = any[0]) && (!bind || key === bind))
                {
                    //禁止自身回推
                    any[0] = '';

                    try
                    {
                        this.set(name, dataset.getBindingValue(key, action));
                    }
                    finally
                    {
                        //回退缓存
                        any[0] = key;
                    }
                }
            }
        }
        
        return this;
    };
    
    
    /**
     * @method pushBack
     * @description 回推数据至数据集
     * @param {string} name 属性名
     * @param {any} value 属性值
     * @return {object} 当前实例对象
     */
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

    
    
});




(function () {


    
    var components = flyingon.components;
    
    var reader = new flyingon.SerializeReader();



    //初始化唯一id组件集
    if (!flyingon.__uniqueId)
    {
        (flyingon.__uniqueId = flyingon.create(null)).id = 1;
    }



    //根据选项创建界面元素
    flyingon.ui = function (options) {

        var control = new (components[options.Class] || arguments[1] || flyingon.HtmlElement)();

        control.deserialize(reader, options);

        return control;
    };


    flyingon.__find_id = function (list, id) {

        var exports = [],
            index = 0,
            item,
            any;
            
        while (item = list[index++])
        {
            if ((any = item.__storage) && any.id === id)
            {
                exports.push(item);
            }
        }

        return exports;
    };


    flyingon.__find_type = function (list, name) {

        var Class = flyingon.components[name],
            exports = [],
            index = 0,
            item;

        if (Class)
        {
            while (item = list[index++])
            {
                if (item instanceof Class)
                {
                    exports.push(item);
                }
            }
        }

        return exports;
    };


    flyingon.__find_class = function (list, name) {

        var exports = [],
            index = 0,
            item,
            any;
        
        while (item = list[index++])
        {
            if ((any = item.__class_keys) && any[name])
            {
                exports.push(item);
            }
        }

        return exports;
    };


})();




//可视组件基础功能扩展
flyingon.fragment('f-visual', function () {


    //根据uniqueId组织的控件集合
    var uniqueId = flyingon.__uniqueId;


    //有效属性集合
    var attributes = flyingon.create(null);


    
    //扩展至选择器
    this.__selector_extend = flyingon.Query;
    
                
    //向上冒泡对象名
    this.eventBubble = 'parent';
    

    //父控件
    this.parent = null;


    //是否已经渲染
    this.rendered = false;



    this.__uniqueId = 0;
    
    //唯一id
    this.uniqueId = function () {
        
        var id = this.__uniqueId;
        return id || (uniqueId[this.__uniqueId = id = uniqueId.id++] = this, id);
    };
    

    
    //读取自定义值
    this.__custom_get = function (name) {

        var fn, any;

        if (name && (any = name.indexOf(':')) > 0) //class: or style:
        {
            if (fn = this[name.substring(0, ++any)])
            {
                fn.call(this, name.substring(any));
            }
            else
            {
                throw '"' + name + '" is not a valid property!';
            }
        }

        return (this.__storage || this.__defaults)[name];
    };


    //设置自定义值
    this.__custom_set = function (name, value) {

        var fn, any;

        if (name && (any = name.indexOf(':')) > 0) //class: or style:
        {
            if (fn = this[name.substring(0, ++any)])
            {
                fn.call(this, name.substring(any), value);
            }
            else
            {
                throw '"' + name + '" is not a valid property!';
            }
        }
        else
        {
            (this.__storage || (this.__storage = flyingon.create(this.__defaults)))[name] = value;

            //如果是有效的属性名则当作自定义属性处理
            if ((any = attributes[name]) === true || (any == null && (attributes[name] = flyingon.__check_attribute(name))))
            {
                if (any = this.__view_patch)
                {
                    any[name] = value;
                }
                else
                {
                    this.renderer.set(this, name, value);
                }
            }
        }
    };
    

        
    //从父控件中移除
    this.remove = function () {
        
        var parent = this.parent,
            index;
        
        if (parent && (index = parent.indexOf(this)) >= 0)
        {
            parent.splice(index, 1);
        }
    };


    //从父控件中独立出来(不销毁)
    this.alone = function () {

        var parent = this.parent,
            index;

        if (parent && (index = parent.indexOf(this)) >= 0)
        {
            parent.splice(index, 1);
            this.autoDispose = false;
        }
    };
    


    //id
    this.defineProperty('id', '', {
     
        set: function (value, oldValue) {

            var any;

            if (this.rendered)
            {
                if (any = this.__view_patch)
                {
                    any.id = value;
                }
                else
                {
                    this.renderer.set(this, 'id', value);
                }
            }
        }
    });


    
    //指定class名 与html一样
    this['class'] = this.defineProperty('className', '', {

        set: function (value) {

            var any;

            this.fullClassName = value = value ? this.defaultClassName + ' ' + value : this.defaultClassName;

            if (this.rendered)
            {
                if (any = this.__view_patch)
                {
                    any['class'] = value;
                }
                else
                {
                    this.renderer.set(this, 'class', value);
                }
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

        self.className(any.join(' '));
    };



    //class
    this['class:'] = function (name, value) {

        if (value)
        {
            this.addClass(name);
        }
        else
        {
            this.removeClass(name);
        }
    };



    //变更指令
    this['#model'] = function (vm, name) {

        this.on('change', function (e) {

            vm.$set(name, e.value);
        });
    };


        
    //控件类初始化处理
    this.__class_init = function (Class, base) {
     
        var module = Class.module,
            name = Class.typeName;
        
        //绑定渲染器
        if (this.renderer === base.renderer)
        {
            flyingon.renderer.bind(this, name);
        }

        if (name)
        {
            name = ((module.className || module.moduleName) + '-' + name).toLowerCase();
            
            if (base = base.defaultClassName)
            {
                 name = base + ' ' + name;
            }
            
            this.fullClassName = this.defaultClassName = name;
        }
    };
    


});





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



//获取当前正在执行的js绝对路径
flyingon.__script_src = function () {

    var any;

    // firefox, chrome
    if (any = document.currentScript)
    {
        return any.src;
    }

    try
    {
        any();
    }
    catch (e)
    {
        //ie10
        if ((any = e.fileName || e.sourceURL || e.stack || e.stacktrace) &&
            (any = /((?:http|https|file):\/\/.*?\/[^:]+)(?::\d+)?:\d+/.exec(any)))
        {
            return any[1];
        }
    }

    // IE5-9
    any = document.scripts;

    for (var i = any.length - 1; i >= 0; i--)
    {
        if (any[i].readyState === 'interactive')
        {
            return flyingon.absoluteUrl(any[i].src);
        }
    }

};


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

        dom = dom.onload = dom.onerror = null;

        if (callback)
        {
            callback.call(this);
            callback = null;
        }
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

    

    var on = 'addEventListener';


    
    //以下为通用事件扩展(IE8以下浏览器不支持addEventListener)
    //IE的attachEvent中this为window且执行顺序相反
    if (!window[on])
    {
        on = false;
    }


    //触发dom事件
    function trigger(e) {

        var items = this.__events,
            fn;

        if (items = items && items[e.type])
        {
            e.target || (e.target = e.srcElement);

            for (var i = 0, l = items.length; i < l; i++)
            {
                if ((fn = items[i]) && !fn.disabled)
                {
                    if (fn.call(this, e) === false && e.returnValue !== false)
                    {
                        flyingon.dom_prevent(e);
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

    
    //挂起函数
    function suspend(e) {
      
        flyingon.dom_stop(e); //有些浏览器不会设置cancelBubble
    };



    //组件dom默认事件
    flyingon.dom_prevent = function (event) {

        event.returnValue = false;
        event.preventDefault && event.preventDefault();
    };


    //停止dom事件冒泡
    flyingon.dom_stop = function (event, prevent) {

        if (prevent)
        {
            event.returnValue = false;
            event.preventDefault && event.preventDefault();
        }

        event.cancelBubble = true;
        event.stopPropagation && event.stopPropagation();
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


    //触发事件
    flyingon.dom_trigger = function (dom, event) {

        if (dom && event)
        {
            return trigger.call(dom, event.type ? event : { type: event });
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



//检查属性名是否合法
flyingon.__check_attribute = function () {

    var div = document.createElement('div');

    return function (name) {

        try
        {
            div.setAttribute(name, '');
            return true;
        }
        catch (e)
        {
            return false;
        }
    };

}();



//html文档树加载完毕
flyingon.ready = function () {

    var list;

    function ready() {

        var any = list;

        if (any)
        {
            any.ready = true;

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
        else if (list && !list.ready)
        {
            ready();
        }
    };

}();



//根据id查找对应的dom
flyingon.dom_id = function (id) {
    
    if (id)
    {
        if (id.charAt(0) === '#')
        {
            id = id.substring(1);
        }

        return document.getElementById(id);
    }
};



//dom测试
flyingon.dom_test = function () {

    var dom = document.createElement('div'),
        list;

    dom.id = 'f-dom-test';
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

}();




//在dom元素内插入html片段
flyingon.dom_html = function (host, html, refChild) {
    
    if (host && html)
    {
        var after, tag, any;

        if (refChild || (refChild = host.lastChild) && (after = 1))
        {
            tag = after ? refChild : refChild.previousSibling;

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

            return tag ? tag.nextSibling : host.firstChild;
        }

        host.innerHTML = html;
        return host.firstChild;
    }
};




//拖动基础方法
flyingon.dom_drag = function (context, event, begin, move, end, locked, delay) {

    var dom = event.dom || event.target || event.srcElement,
        on = flyingon.dom_on,
        off = flyingon.dom_off,
        x1 = event.clientX,
        y1 = event.clientY,
        distanceX = 0,
        distanceY = 0,
        style,
        x0,
        y0;

    function start(e) {
        
        if (begin)
        {
            e.dom = dom;
            begin.call(context, e);
            dom = e.dom;
        }

        if (style = dom && dom.style)
        {
            x0 = dom.offsetLeft;
            y0 = dom.offsetTop;
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
            
            if (style && locked !== true)
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
            
            flyingon.dom_stop(e, true);
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

            context = dom = null;
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
    
    flyingon.dom_stop(event, true);
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

    overlay.className = 'f-overlay';

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
flyingon.MouseEvent = flyingon.Event.extend(function () {


    this.init = function (event) {

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
flyingon.KeyEvent = flyingon.Event.extend(function () {


    this.init = function (event) {

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




//Ajax类
flyingon.Ajax = flyingon.Async.extend(function () {

    
    
    //请求的url
    this.url = '';
    
    //指定版本号
    this.version = '';

    //method
    this.method = 'GET';

    //text || json || xml
    this.dataType = 'text';

    //内容类型
    this.contentType = 'application/x-www-form-urlencoded';

    //自定义http头
    this.header = null;
    
    //是否异步
    this.async = true;
        
    //是否支持跨域资源共享(CORS)
    this.CORS = false;
    
    //jsonp回调名称
    this.jsonp = 'jsonp';
    
    //超时时间
    this.timeout = 0;
    

    
    this.send = function (url, options) {

        var list = [], //自定义参数列表
            data, 
            get,
            any;
        
        if (options)
        {
            for (var name in options)
            {
                if (name !== 'data')
                {
                    this[name] = options[name];
                }
                else
                {
                    data = options[name];
                }
            }
        }
        
        //执行发送前全局start事件
        if (any = flyingon.Ajax.start)
        {
            for (var i = 0, l = any.length; i < l; i++)
            {
                if (any[i].call(this, url) === false)
                {
                    return false;
                }
            }
            
            url =  this.url;
        }
        
        if (!(this.url = url))
        {
            return false;
        }
              
        if ((get = /get|head|options/i.test(this.method)) && data)
        {
            list.push(flyingon.encode(data));
            data = null;
        }
        
        any = this.dataType === 'jsonp';
        
        if (this.version)
        {
            list.push('ajax-version=', this.version);
        }
                
        if (any || list.length > 0)
        {
            list.start = url.indexOf('?') >= 0 ? '&' : '?';
        }

        //jsonp
        if (any)
        {
            any = get ? jsonp_get : jsonp_post;
        }
        else
        {
            any = ajax_send;
        }
        
        any(this, url, list, data);

        return this;
    };

    
    
    //发送ajax请求
    function ajax_send(self, url, list, data) {
    
        var xhr = self.xhr = new XMLHttpRequest(),
            any;
        
        if (list.start)
        {
            url = url + list.start + list.join('&');
        }
              
        //CORS
        if (self.CORS)
        {
            //withCredentials是XMLHTTPRequest2中独有的
            if ('withCredentials' in xhr)
            {
                xhr.withCredentials = true;
            }
            else if (any = window.XDomainRequest)
            {
                xhr = new any();
            }
        }
        
        if ((any = self.timeout) > 0)
        {
            self.__timer = setTimeout(function () {

                xhr.abort();
                self.fail('timeout');

            }, any);
        }

        xhr.onreadystatechange = function () {

            ajax_done(self, xhr, url);
        };
        
        xhr.open(self.method, url, self.async);
          
        if (any = self.header)
        {
            for (var name in any)
            {
                xhr.setRequestHeader(name, any[name]);
            }
        }

        xhr.setRequestHeader('Content-Type', self.contentType);

        if (data)
        {
            data = flyingon.encode(data);
            xhr.setRequestHeader('Content-Length', data.length);
        }

        xhr.send(data);
    };
    

    //处理响应结果
    function ajax_done(self, xhr, url) {

        var any = xhr.readyState;

        if (any === 4)
        {
            if (any = self.__timer)
            {
                clearTimeout(any);
                self.__timer = 0;
                any = void 0;
            }

            if (xhr.status < 300)
            {
                try
                {
                    switch (self.dataType)
                    {
                        case 'json':
                            self.resolve(flyingon.parseJSON(xhr.responseText));
                            break;
                            
                        case 'xml':
                            self.resolve(xhr.responseXML);
                            break;
                            
                        default:
                            self.resolve(xhr.responseText);
                            break;
                    }
                }
                catch (e)
                {
                    self.reject(e);
                }
            }
            else
            {
                self.reject(any = xhr.statusText);
            }
            
            //结束处理
            ajax_end(self, url, any);
            
            //清除引用
            self.xhr = self.onreadystatechange = null;
        }
        else
        {
            self.notify(any);
        }
    };
    
    
    //ajax执行完毕
    function ajax_end(self, url, error) {
        
        var end = flyingon.Ajax.end;
        
        //执行全局ajax执行结束事件
        if (end)
        {
            for (var i = 0, l = end.length; i < l; i++)
            {
                end[i].call(self, url, error);
            }
        }
    };
        
    
    //jsonp_get
    function jsonp_get(self, url, list) {
        
        var target = jsonp_get,
            any = target.cache || (target.cache = []),
            name = any.pop() || 'flyingon_callback' + (++target.id || (target.id = 1));
        
        window[name] = function (data) {
        
            self.resolve(data);
            ajax_end(self, url);
        };
        
        list.push(self.jsonp || 'jsonp', '=', name);
        
        if (!self.version)
        {
            list.push('jsonp-version=' + (++target.version || (target.version = 1)));
        }
        
        flyingon.script(url = url + list.start + list.join('&'), function (src, error) {
            
            any.push(name);

            if (error)
            {
                self.reject(error);
                ajax_end(self, url, error);
            }

            window[name] = void 0;
            this.parentNode.removeChild(this);
            
            self = null;
        });
    };
    
    
    //jsonp_post
    function jsonp_post(self, url, list, data) {
                
        var iframe = jsonp_iframe(),
            flag;
        
        //处理url
        list.push('jsonp=post');
        url = url + list.start + list.join('&');
                    
        function load() {
          
            if (flag)
            {
                //IE67可能需要设置成同源的url才能取值
                this.contentWindow.location = 'about:blank';

                jsonp_end(self, url, this.contentWindow.name);
                jsonp_iframe(this);

                flyingon.dom_off(this, 'load', load);
                self = iframe = list = data = null;
            }
            else
            {
                flag = 1;
                
                //解决IE6在新窗口打开的BUG
                this.contentWindow.name = this.name; 

                //动态生成表单提交数据
                jsonp_form(this, url, data, self.method);
            }
        };
        
        //IE6不能触发onload事件, 如果要兼容ie6, 需要使用attachEvent绑定事件
        flyingon.dom_on(iframe, 'load', load);
        
        iframe.src = 'about:blank';
        document.head.appendChild(iframe);
    };
    
    
    //获取或缓存iframe
    function jsonp_iframe(iframe) {
        
        var any = jsonp_iframe.cache || (jsonp_iframe.cache = []);
        
        if (iframe)
        {
            any.push(iframe);
            iframe.parentNode.removeChild(iframe);
        }
        else
        {
            iframe = any.pop();
            
            if (!iframe)
            {
                iframe = document.createElement('iframe');
                iframe.name = 'jsonp-iframe';
            }
            
            return iframe;
        }
    };
    

    //生成jsonp提交表单
    function jsonp_form(iframe, url, data, method) {
        
        var array = ['<form id="form" enctype="application/x-www-form-urlencoded"'];
        
        array.push(' action="', url, '" method="', 'GET', '">'); //method || 'POST'
        
        for (var name in data)
        {
            array.push('<input type="hidden" name="', name, '"');
            
            if (typeof (name = data[name]) === 'string')
            {
                name = name.replace(/"/g, '\\"');
            }
            
            array.push(' value="', name, '" />');
        }
        
        array.push('</form>', '<script>form.submit();</script>');
        
        iframe.contentWindow.document.write(array.join(''));
    };
    

    //jsonp返回结果处理
    function jsonp_end(self, url, text) {

        try
        {
            self.resolve(flyingon.parseJSON(text));
            ajax_end(self, url);
        }
        catch (e)
        {
            self.reject(e);
            ajax_end(self, url, e);
        }
    };

    

});



//自定义ajax开始提交方法
flyingon.ajaxStart = function (fn) {

    (flyingon.Ajax.start || (flyingon.Ajax.start = [])).push(fn);
};


//自定义ajax执行结束方法
flyingon.ajaxEnd = function (fn) {

    (flyingon.Ajax.end || (flyingon.Ajax.end = [])).push(fn);
};


//ajax提交(默认为GET方式提交)
flyingon.ajax = function (url, options) {

    return new flyingon.Ajax().send(url, options);
};


//POST提交
//在IE6时会可能会出错, asp.net服务端可实现IHttpAsyncHandler接口解决些问题 
flyingon.ajaxPost = function (url, options) {

    options = options || {};
    options.method = 'POST';

    return new flyingon.Ajax().send(url, options);
};


//jsonp get提交
flyingon.jsonp = function (url, options) {

    options = options || {};
    options.dataType = 'jsonp';

    return new flyingon.Ajax().send(url, options);
};


//jsonp post提交
//服务器需返回 <script>window.name = 'xxx';</script> 形式的内容且不能超过2M大小
flyingon.jsonpPost = function (url, options) {

    options = options || {};
    options.dataType = 'jsonp';
    options.method = 'POST';

    return new flyingon.Ajax().send(url, options);
};




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
    function require(depends, callback) {

        if (depends)
        {
            switch (typeof depends)
            {
                case 'string':
                    require.require([require.path(depends)], callback);
                    return;

                case 'function':
                    depends.call(flyingon, flyingon);
                    return;
            }
            
            if (depends instanceof Array)
            {
                var list = [],
                    url;

                for (var i = 0, l = depends.length; i < l; i++)
                {
                    if ((url = depends[i]) && typeof url === 'string')
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

        require.__base_path = path;
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
    require.path = function (url) {

        var file = url = require_merge[url] || url,
            change,
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
    flyingon.i18ntext = function (key, text) {

        return i18n_cache[key] || (text != null ? text : key);
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
 


    //设置根目录
    require.__root_path = flyingon.absoluteUrl('/');
    

    //设置相对起始目录
    //如果当前js路径包含"flyingon/",则取此上级目录
    //否则取要目录
    require.__base_path = (function () {
        
        var url = flyingon.__script_src() || flyingon.absoluteUrl(''),
            index = url.indexOf('flyingon/');

        if (index >= 0)
        {
            return url.substring(0, index);
        }

        return require.__root_path;

    })();


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

            if (require.wait)
            {
                require.wait();
                require.wait = null;
            }
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



    //加载完毕后处理
    require.done = function (callback) {

        if (require_wait > 0)
        {
            require.wait = callback;
        }
        else
        {
            callback();
        }
    };
    
        
    

    //加载组件
    flyingon.load = function (url, callback) {

        if (url)
        {
            if (url.indexOf('.js') > 0)
            {
                flyingon.require(url, callback);
            }
            else
            { 
                flyingon.ajax(flyingon.require.path(url)).done(function (html) {

                    html && html_load(url, html, callback);

                }).fail(function (error) {
                    
                    console && console.error(error);
                });
            }
        }
    };


    function html_load(url, html, callback) {

        var template = {},
            script = [];

        //抽出模板和脚本
        html.replace(/<(script|template|style)([^>]*)>\s*([\s\S]*?)\s*<\/\1>/gm, function (_, type, head, text) {

            switch (type)
            {
                case 'template':
                    if (head = head.match(/id="([^"]+)"|'([^']+)'/))
                    {
                        template['#' + (head[1] || head[2])] = text.replace(/[\r\n]+\s*/gm, '').replace(/(['"])/gm, '\\$1');
                    }
                    break;

                case 'link':
                    if (head = head.match(/href="([^"]+)"|'([^']+)'/))
                    {
                        flyingon.link(head[1] || head[2]);
                    }
                    break;

                case 'style':
                    flyingon.style(text);
                    break;

                case 'script':
                    if (head = head.match(/src=("[^"]"|'[^']')/))
                    {
                        script.push('flyingon.require(', head[1], ');\n');
                    }
                    else
                    {
                        script.push('flyingon.defineModule(function () {\n\n\n\n', text, '\n\n\n\n});\n\n');
                    }
                    break;
            }
        });

        if (script.length > 0)
        {
            script.push('\n\n//# sourceURL=', url);
            
            html = script.join('');

            for (var name in template)
            {
                html = html.replace(new RegExp(name, 'gm'), template[name]);
            }

            flyingon.globalEval(html);
        }

        flyingon.require.done(callback);
    };



})(flyingon);




(function () {



    //插件缓存
    var cache = flyingon.create(null);


    //一次只能加载一个插件
    var loading = [];


    //加载插件
    function load_plugin(url, callback) {

        var value = cache[url];

        if (value)
        {
            if (value instanceof Array)
            {
                callback && value.push(callback);
            }
            else
            {
                callback && callback(value);
            }

            return;
        }

        loading.push(url, callback);

        if (loading.length > 2)
        {
            return;
        }

        value = cache[url] = [];
        callback && value.push(callback);

        //注册插件加载回调
        flyingon.__load_plugin = function (Class) {

            cache[url] = Class;
        };

        flyingon.load(url, function () {

            var Class = cache[url],
                any = value;

            flyingon.__load_plugin = null;

            //移除待加载项
            loading.splice(0, 2);

            if (Class instanceof Array)
            {
                cache[url] = null;
                throw '"' + url + '" not include any flyingon.Plugin!';
            }

            for (var i = 0, l = any.length; i < l; i++)
            {
                any[i](Class);
            }

            if ((any = loading).length > 0)
            {
                load_plugin(any.shift(), any.shift());
            }
        });

    };



    //url:              url, 包含插件地址及多级hash控制
    //options.text:     页头文字
    //options.icon:     页头图标
    //options.closable: 页签是否可关闭
    //options.target:   打开页面方式 _blank:在新页面打开 _self:在当前页面打开 other:在指定key为指定值的页面中打开
    function route(tab, url, options) {

        var page, url, any;
        
        if (!tab || !(tab instanceof flyingon.Tab))
        {
            throw 'rout tab must be a flyingon.Tab!';
        }

        if (!url || !(url = url.replace(/^[#!]+/g, '')))
        {
            throw 'route options.url can not be empty!';
        }

        if (!tab.__on_route)
        {
            tab.on('tab-change', route.__tab_change);
            tab.__on_route = true;
        }

        //打开页面方式(未设置页头时永远在当前页面打开)
        switch (any = tab.header() ? options.target : '_self')
        {
            case '_blank': //在新页面打开
                any = null;
                break;

            case '_self': //在当前页面打开
                if ((page = tab.selectedPage()) && page.url === url)
                {
                    return;
                }

                any = null;
                break;

            default: //在指定的target名称中打开
                if ((page = tab.findByKey(any)) && page.url === url)
                {
                    if (!page.selected())
                    {
                        tab.selectedPage(page, 'route');
                        
                        page.route.update();
                        page[0].openPlugin(page.route.next(), false);
                    }

                    return;
                }
                break;
        }
        
        if (page)
        {
            page[0].closePlugin();
            page.splice(0);
        }
        else
        {
            tab.push(page = new flyingon.TabPage().layout('fill'));
        }

        //设置页面key
        if (any)
        {
            page.key(any);
        }

        new Root().load(route.current = page, url, options);
    };


    //预加载hash插件
    route.preload = function (hash) {

        if (hash && (hash = hash.replace(/^[#!]+/g, '')))
        {
            load_plugin(hash.split('#')[0]);
        }
    };

    

    //路由
    flyingon.route = route;



    var Root = Object.extend(function () {



        //插件地址
        this.plugin = '';



        this.load = function (page, url, options) {

            var any;

            page.route = this;

            route.__update(page.url = this.url = url);

            //检测是否以iframe方式加载
            if (url.indexOf('iframe:') === 0)
            {
                url = url.substring(7);
            }
            else
            {
                this.parse(url);
                
                if (any = options.icon)
                {
                    page.icon(any);
                }

                if (any = options.text)
                {
                    page.text(any);
                }
                else
                {
                    page.parent.header(0);
                }

                page.closable(options.closable !== false);
                page.parent.selectedPage(page, 'route');
 
                any = this;

                load_plugin(this.plugin, function (Class) {

                    var route = any,
                        plugin;

                    page.push(plugin = new Class());

                    plugin.loadPlugin(route = route.next());
                    plugin.openPlugin(route, true);

                    page = any = null;

                    //立即更新视图
                    flyingon.update();
                });
            }
        };


        //解析url
        this.parse = function (url) {

            var tokens = url.split('#'),
                last = this, 
                any;

            this.plugin = tokens[0];

            for (var i = 1, l = tokens.length; i < l; i++)
            {
                if (any = tokens[i])
                {
                    last = last.__next = new Route(this, any);
                }
            }
        };


        //获取下一个参数
        this.next = function () {

            return this.__next || (this.__next = new Route(this, ''));
        };


        //更新hash
        this.update = function () {

            var url = this.plugin,
                next = this,
                value;

            while ((next = next.__next) && (value = next.value))
            {
                url += '#' + value;
            }
 
            route.__update(url);
        };


    }, false);



    var Route = Object.extend(function () {

        
        //当前hash值
        this.value = '';


        this.init = function (root, value) {

            this.__root = root;
            this.value = value;
        };


        //修改当前hash值
        this.change = function (value) {

            this.value = '' + value;
            this.__root.update();
        };


        //清除后述参数
        this.clear = function () {

            this.__next = null;
            this.__root.update();
        };


        //获取下一个参数
        this.next = function () {

            return this.__next || (this.__next = new Route(this.__root, ''));
        };


        //分发至指定控件
        this.dispatch = function (control) {

            var fn;

            if (control)
            {
                if (fn = control.subscribeRoute)
                {
                    fn.call(control, this);
                }
                else
                {
                    for (var i = 0, l = control.length; i < l; i++)
                    {
                        if (fn = control[i].subscribeRoute)
                        {
                            fn.call(control[i], this);
                        }
                    }
                }
            }
        };


    }, false);



})();




(function () {



    var callback = [];

    var hash = location.hash.replace(/^[#!]+/, '');

    
    //打开页面有hash时需处理
    if (callback.hash = hash)
    {
        //预加载插件资源
        flyingon.route.preload(hash);
    }


    //侦听路由变化
    this.listen = function (fn) {

        if (typeof fn === 'function')
        {
            var hash = callback.hash;

            callback.push(fn);

            if (hash)
            {
                callback.hash = '';
                execute(hash, false);
            }
        }
    };


    //定制页面变更事件
    this.__tab_change = function (e) {
        
        if (e.target === this)
        {
            var page = flyingon.route.current = e.current;

            if (page)
            {
                page.route.update();
                e.tag !== 'route' && execute(page.url, true);
            }
            else
            {
                execute(location.hash = hash = '', true);
            }
        }
    };


    //更新路由地址
    this.__update = function (url) {
        
        location.hash = hash = url ? '#!' + url : ''; 
    };


    function execute(hash, route) {

        var list = callback;

        for (var i = 0, l = list.length; i < l; i++)
        {
            list[i](hash, route); //第二个参数标记是路由还是切换
        }
    };


    //执行路由
    function route() {

        if (location.hash !== hash)
        {
            execute(location.hash.replace(/^[#!]+/g, ''), false);
        }
    };


    //定时检测hash
    function check() {

        route();
        setTimeout(check, 200);
    };


    if ('onhashchange' in window)
    {
        flyingon.dom_on(window, 'hashchange', route);
    }
    else
    {
        setTimeout(check, 200);
    }


}).call(flyingon.route);





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
                    node = new Class(relation, '', token, node);
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
flyingon.Selector_node = Object.extend(function () {
    
    

    this.init = function (relation, type, name, node) {
       
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

        var name = this.name;
        return name ? flyingon.__find_type(controls, name) : [];
    };
    
        
    this['*'] = function (controls, cache) {

        return controls;
    };
    
    
    this['.'] = function (controls, cache) {

        var name = this.name;;
        return name ? flyingon.__find_class(controls, name) : [];
    };
    

    this['#'] = function (controls, cache) {

        var name = this.name;;
        return name ? flyingon.__find_id(controls, name) : [];
    };
    
    
    
    //后代选择器
    this[' '] = function (controls) {
        
        var index = 0,
            exports,
            item,
            any;
        
        while (item = controls[index++])
        {
            if (item.length > 0 && item.all)
            {
                any = item.all();

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

    
    //子控件选择器
    this['>'] = function (controls) {

        var index = 0,
            exports = [],
            item,
            any;

        while (item = controls[index++])
        {
            if (item.length > 0)
            {
                exports.push.apply(exports, item);
            }
        }

        return exports[0] && this.filter(exports, 2) || exports;
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
        
        while (item = controls[index++])
        {
            while (item = item.nextSibling)
            {
                exports[length++] = item;
            }
        }
 
        return exports[0] ? this.filter(exports) : exports;
    };

    
    
}, false);



//复合选择器节点类
flyingon.Selector_nodes = Object.extend(function () {
    
    
    
    this.type = ',';
    
    
    //子节点数量
    this.length = 0;
    
    
    //选择节点
    this.select = function (controls, exports) {
        
        var index = 1,
            list,
            item;
        
        if (item = this[0])
        {
            exports = item.select(controls, exports);

            while (item = this[index++])
            {
                list = item.select(controls, []);

                if (list.length > 0)
                {
                    exports.push.apply(exports, list);
                }
            }
        }

        return exports;
    };
    
    
    
}, false);



//选择器属性类
flyingon.Selector_property = Object.extend(function () {
    
    
    
    this.init = function (node, name) {
       
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

        var exports = [],
            name = this.name,
            fn;

        if (name && (fn = this[this.relation]))
        {
            fn.call(this, controls, name, exports, 0);
        }

        return exports;
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
flyingon.Selector_pseudo = Object.extend(function () {
    
    
    
    this.init = function (node, name) {
       
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

        var exports = [],
            name = this.name,
            fn;

        if (name && (fn = this[name]))
        {
            fn.call(this, controls, exports, 0);
        }

        return exports;
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
            if (item.length <= 0)
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
            if (item.parent.length === 1)
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
            if (item = item.parent[0])
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
            item,
            any;

        while (item = controls[index++])
        {
            if (!(((any = item.parent) && any.indexOf(item)) & 1))
            {
                exports[length++] = item;
            }
        }
    };
    
    
    this.even = function (controls, exports, length) {
        
        var value = this.value,
            index = 0,
            item,
            any;

        while (item = controls[index++])
        {
            if (((any = item.parent) && any.indexOf(item)) & 1)
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
            if (((any = item.parent) && any.indexOf(item)) === value)
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
            if (((any = item.parent) && any.indexOf(item)) > value)
            {
                exports[length++] = item;
            }
        }
    };

    
    this.lt = function (controls, exports, length) {

        var value = this.value,
            index = 0,
            item,
            any;

        while (item = controls[index++])
        {
            if (((any = item.parent) && any.indexOf(item)) < value)
            {
                exports[length++] = item;
            }
        }
    };

    
}, false);



//选择器查询类
flyingon.Query = Object.extend(function () {
    
    
    
    //选择器解析缓存
    var parse = flyingon.__parse_selector;
    

    //选择数量
    this.length = 0;
    
    
    this.init = function (selector, context) {
       
        var list, item, index, length, cache, any;
        
        if (context && (any = parse(selector)) && (list = any.select(context)) && (length = list.length) > 0)
        {
            index = this.length;
            cache = flyingon.create(null);

            //去重处理
            for (var i = 0; i < length; i++)
            {
                if ((item = list[i]) && (any = item.__uniqueId || item.uniqueId()) && !cache[any])
                {
                    cache[any] = true;
                    this[index++] = item;
                }
            }
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
                item.addClass(className);
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




//控件渲染器
(function () {
    
    

    //是否右向顺序
    flyingon.rtl = false;



    var self = this;

    //注册的渲染器集合
    var registry_list = flyingon.create(null);

    //唯一id
    var uniqueId = flyingon.__uniqueId;

    //创建html的dom节点(给createView用)
    var dom_html = document.createElement('div');

    //margin border padding css样式缓存
    var sides_cache = flyingon.create(null);

    //css名称映射
    var css_map = flyingon.css_map(true);

    //style名称映射
    var style_map = flyingon.css_map();

    //定位属性映射
    var location_map = {

        32: ['minWidth', 'min-width'],
        64: ['maxWidth', 'max-width'],
        128: ['minHeight', 'min-height'],
        256: ['maxHeight', 'max-height']
    };




    //滚动条位置控制
    this.__scroll_html = '<div class="f-scroll" style="position:static;overflow:hidden;visibility:hidden;margin:0;border:0;padding:0;width:1px;height:1px;"></div>';

       
    //设置text属性名
    this.__text_name = 'textContent' in document.head ? 'textContent' : 'innerText';

    
    //是否支持auto尺寸
    this.__auto_size = 1;


    //是否设置padding
    this.padding = 1;
    



    function css_sides(value) {

        var any = +value;

        if (any === any)
        {
            return sides_cache[value] = (any | 0) + 'px';
        }

        return sides_cache[value] = value ? value.replace(/(\d+)(\s+|$)/g, '$1px$2') : '';
    };



    //创建控件视图
    this.createView = function (control, position) {

        var host = dom_html,
            view,
            any;

        this.render(any = [], control);

        host.innerHTML = any.join('');

        view = host.firstChild;
        host.removeChild(view); //需先从父节点移除,否则在IE下会被销毁

        host.innerHTML = '';

        if (position !== false && !(any = view.style).position)
        {
            any.position = 'relative';
        }

        this.mount(control, view);

        return view;
    };


    //渲染html
    this.render = function (writer, control, className, cssText) {

        writer.push('<div');

        this.renderDefault(writer, control, className, cssText);

        writer.push('></div>');
    };


    //渲染控件默认样式及属性
    this.renderDefault = function (writer, control, className, cssText) {

        var storage = control.__storage || control.__defaults,
            encode = flyingon.html_encode,
            html = control.__as_html,
            any;

        control.rendered = true;
        
        if (any = control.__id || storage.id)
        {
            writer.push(' id="', encode(any), '"');
        }

        writer.push(' class="', encode(control.fullClassName), 
            html ? ' f-html' : ' f-absolute', 
            className ? ' ' + className : '',
            '" style="');

        if (cssText)
        {
            writer.push(cssText);
        }

        if (any = control.__style)
        {
            this.__render_style(writer, control, any, encode);
        }

        if (any = control.__location_dirty)
        {
            control.__location_dirty = 0;

            if (html)
            {
                this.__render_location(writer, control, any);
            }
        }

        if (any = storage.border)
        {
            writer.push('border-width:', sides_cache[any] || css_sides(any), ';');
        }
        
        if ((any = storage.padding) && this.padding)
        {
            writer.push('padding:', sides_cache[any] || css_sides(any), ';');
        }

        if (!storage.visible)
        {
            writer.push('display:none;');
        }

        writer.push('"');
    };


    this.__render_style = function (writer, control, values, encode) {

        var map = css_map,
            value, 
            any;

        for (var name in values)
        {
            if (name === 'cssText' || (value = values[name]) === '')
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
                    
                    if (!(any = control.__style_patch))
                    {
                        any = control.__view_patch || (control.__view_patch = {});
                        any = any.__style_patch = controls.__style_patch = {};
                    }

                    any[name] = value;
                    break;
            }
        }
    };


    this.__render_location = function (writer, control, dirty) {

        var values = control.__storage || control.__defaults,
            flag = 1,
            name,
            value,
            any;

        while (dirty >= flag)
        {
            if (dirty & flag)
            {
                switch (flag)
                {
                    case 1:
                    case 2:
                        if (value = values[name = flag === 1 ? 'width' : 'height'])
                        {
                            if (value === 'default' || value === 'auto')
                            {
                                writer.push(name, ':auto;');
                            }
                            else
                            {
                                writer.push(name, ':', value >= 0 ? value + 'px' : value, ';');
                            }
                        }
                        break;

                    case 4:
                        if (value = values.margin)
                        {
                            writer.push('margin:', sides_cache[value] || css_sides(value), ';');
                        }
                        break;

                    case 8:
                        if (value = values.border)
                        {
                            writer.push('border-width:', sides_cache[value] || css_sides(value), ';');
                        }
                        break;

                    case 16:
                        if (this.padding && (value = values.padding))
                        {
                            writer.push('padding:', sides_cache[value] || css_sides(value), ';');
                        }
                        break;

                    case 32:
                    case 64:
                    case 128:
                    case 256:
                        any = location_map[flag];

                        if (value = values[any[0]])
                        {
                            writer.push(any[1], ':', value > 0 ? value + 'px' : value, ';');
                        }
                        break;

                    case 512:
                    case 1024:
                        if (value = values[name = flag < 1000 ? 'left' : 'top'])
                        {
                            writer.push(name, ':', (any = +value) === any ? value + 'px' : value, ';');
                        }
                        break;
                }
            }

            flag <<= 1;
        }
    };




    //挂载视图
    this.mount = function (control, view) {

        var any;
        
        control.view = view;

        if (!(any = control.__uniqueId))
        {
            any = uniqueId;
            any[any = any.id++] = control;
        }

        view.flyingon_id = any;

        //应用补丁
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
    this.unmount = function (control, remove) {

        var view = control.view,
            any;

        if (view)
        {
            //触发注销控件挂载过程
            if (any = control.onunmount)
            {
                any.call(control, view);
            }

            control.view = null;

            if (remove !== false && (any = view.parentNode))
            {
                any.removeChild(view);
            }
        }
    };



    //更新顶级控件
    this.__update_top = function (control, width, height) {

        var view = control.view,
            index = view.className.indexOf(' f-rtl');

        control.__location_values = null;
        control.left = control.top = 0;

        control.measure(width, height, width, height, height ? 3 : 1);

        if (flyingon.rtl)
        {
            if (index < 0)
            {
                view.className += ' f-rtl';
            }
        }
        else if (index >= 0)
        {
            view.className = view.className.replace(' f-rtl', '');
        }
        
        if (control.__update_dirty || control.__arrange_dirty)
        {
            this.update(control);
        }
    };


    //更新视图
    this.update = function (control) {

        if (control.__as_html)
        {
            this.locate_html(control);
        }
        else
        {
            this.locate(control);
        }
    };


    //按照html方式定位
    this.locate_html = function (control) {

        var dirty = control.__location_dirty;
        
        if (dirty)
        {
            this.__locate_html(control);
        }

        control.__update_dirty = false;
    };


    //按照html方式定位控件
    this.__locate_html = function (control) {

        var style = control.view.style,
            values = control.__storage || control.__defaults,
            dirty = control.__location_dirty,
            flag = 1,
            name,
            value,
            any;

        control.__location_dirty = 0;

        while (dirty >= flag)
        {
            if (dirty & flag)
            {
                switch (flag)
                {
                    case 1:
                    case 2:
                        if (value = values[name = flag === 1 ? 'width' : 'height'])
                        {
                            if (value === 'default' || value === 'auto')
                            {
                                style[name] = 'auto';
                            }
                            else
                            {
                                style[name] = value >= 0 ? value + 'px' : value;
                            }
                        }
                        break;

                    case 4:
                    case 16:
                        value = values[name = flag === 4 ? 'margin' : 'padding'];
                        style[name] = sides_cache[value] || css_sides(value);
                        break;

                    case 8:
                        value = values.border;
                        style.borderWidth = sides_cache[value] || css_sides(value);
                        break;

                    case 32:
                    case 64:
                    case 128:
                    case 256:
                        any = location_map[flag];
                        value = values[name = any[0]];
                        style[name] = value > 0 ? value + 'px' : value;
                        break;

                    case 512:
                    case 1024:
                        value = values[name = flag < 1000 ? 'left' : 'top'];
                        style[name] = (any = +value) === any ? value + 'px' : value;
                        break;
                }
            }

            flag <<= 1;
        }
    };


    //定位控件
    this.locate = function (control) {

        var style = control.view.style,
            cache = control.__style_cache,
            value = this.__auto_size && control.__auto_size,
            left = control.offsetLeft,
            top = control.offsetTop,
            width = (value & 1) ? 'auto' : control.offsetWidth,
            height = (value & 2) ? 'auto' : control.offsetHeight,
            any;

        control.__update_dirty = false;

        if (any = !cache)
        {
            cache = control.__style_cache = {};
        }

        if (any || left !== cache.left)
        {
            //右向顺序设置right,否则设置left
            style[flyingon.rtl ? 'right' : 'left'] = (cache.left = left) + 'px';
        }

        if (any || top !== cache.top)
        {
            style.top = (cache.top = top) + 'px';
        }

        if (any || width !== cache.width)
        {
            cache.width = width;
            style.width = (value & 1) ? width : width + 'px';
        }

        if (any || height !== cache.height)
        {
            cache.height = height;
            style.height = (value & 2) ? height : height + 'px';
        }

        if (any = control.__location_dirty)
        {
            control.__location_dirty = 0;

            if (any & 8)
            {
                value = control.border();
                style.borderWidth = sides_cache[value] || css_sides(value);
            }

            if ((any & 16) && this.padding)
            {
                value = control.padding();
                style.padding = sides_cache[value] || css_sides(value);
            }
        }

        return cache;
    };



    //需要处理视图补丁的控件集合
    var controls = [];

    //子项变更补丁集合
    var children = [];

    //延迟更新队列
    var update_list = [];
    
    //更新定时器
    var update_delay;
    
        
    //立即更新所有控件
    flyingon.update = function () {
        
        var list = update_list,
            index = 0,
            item,
            node;

        if (update_delay)
        {
            clearTimeout(update_delay);
        }

        flyingon.__update_patch();
        
        while (item = list[index++])
        {
            if (item.__update_dirty)
            {
                if ((node = item.view) && (node = node.parentNode))
                {
                    item.renderer.__update_top(item, node.clientWidth, node.clientHeight);
                }
            }
            else           
            {
                switch (item.__arrange_dirty)
                {
                    case 2:
                        item.renderer.update(item);
                        break;

                    case 1:
                        update_children(item);
                        break;
                }
            }
        }
        
        list.length = update_delay = 0;
    };


    //递归更新子控件
    function update_children(control) {

        control.__arrange_dirty = 0;

        for (var i = 0, l = control.length; i < l; i++)
        {
            var item = control[i];

            switch (item.__arrange_dirty)
            {
                case 2:
                    item.renderer.update(item);
                    break;

                case 1:
                    update_children(item);
                    break;
            }
        }
    };
    

    //延时更新
    flyingon.__update_delay = function (control) {
      
        if (update_list.indexOf(control) < 0)
        {
            update_list.push(control);
            update_delay || (update_delay = setTimeout(flyingon.update, 0)); //定时刷新
        }
    };


    //更新所有挂起的dom补丁(在调用控件update前需要先更新补丁)
    flyingon.__update_patch = function () {

        var list = children,
            index = 0,
            item,
            view,
            any;

        //先处理子项变更
        while (item = list[index++])
        {
            if (any = item.__children_patch)
            {
                item.__children_patch = null;
                item.renderer.__children_patch(item, any);
            }
        }

        //再处理视图变更
        list = controls;
        index = 0;

        while (item = list[index++])
        {
            if ((any = item.__view_patch) && (view = item.view))
            {
                item.__view_patch = null;
                item.renderer.__apply_patch(item, view, any);
            }
        }

        children.length = controls.length = 0;
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
                update_delay || (update_delay = setTimeout(flyingon.update, 0)); //定时刷新
            }
        }
    };


    //应用dom补丁
    this.__apply_patch = function (control, view, patch) {

        var fn, value;

        for (var name in patch)
        {
            //已处理过则不再处理
            if ((value = patch[name]) === null)
            {
                continue;
            }

            if (fn = this[name])
            {
                if (typeof fn === 'function')
                {
                    fn.call(this, control, view, value);
                }
            }
            else //作为属性处理
            {
                if (value || value === 0)
                {
                    view.setAttribute(name, value);
                }
                else
                {
                    view.removeAttribute(name);
                }
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



    this.visible = function (control, view, value) {

        view.style.display = value ? '' : 'none';
    };


    this.focus = function (control) {

        control.view.focus();
    };


    this.blur = function (control) {

        control.view.blur();
    };



    //渲染子项
    this.__render_children = function (writer, control, items, start, end) {

        var item;

        while (start < end)
        {
            if (item = items[start++])
            {
                item.view || item.renderer.render(writer, item);
            }
        }
    };


    //挂载子控件
    this.__mount_children = function (control, view, items, start, end, node) {

        var item, any;

        while (start < end)
        {
            if (item = items[start++])
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
            }
        }
    };


    //取消挂载子控件
    this.__unmount_children = function (control) {

        for (var i = control.length - 1; i >= 0; i--)
        {
            var item = control[i];

            if (item && item.view && !item.parent)
            {
                item.renderer.unmount(item, false);
            }
        }
    };


    //排列
    this.__arrange = function (control) {

        var list = [],
            style = control.__style,
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
            switch (style && (style['overflow-x'] || style.overflow)) //有些浏览器读不到overflowX的值
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
            switch (style && (style['overflow-y'] || style.overflow))
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
        for (var i = 0, l = control.length; i < l; i++)
        {
            if ((any = control[i]) && (any.__storage || any.__defaults).visible)
            {
                list.push(any);
            }
        }

        //排列
        flyingon.arrange(control, list, hscroll, vscroll);

        this.__sync_scroll(control);

        control.__arrange_dirty = 0;
    };


    //同步滚动条状态
    //overflow:auto在某些情况下可能会不准确,通过直接设置scroll或hidden解决些问题
    this.__sync_scroll = function (control) {

        var style = (control.view_content || control.view).style;

        style.overflowX = control.__hscroll ? 'scroll' : 'hidden';
        style.overflowY = control.__vscroll ? 'scroll' : 'hidden';
    };



    //注册子项变更补丁
    this.__children_dirty = function (control) {

        children.push(control);
        update_delay || (update_delay = setTimeout(flyingon.update, 0)); //定时刷新
    };


    //子项补丁
    this.__children_patch = function (control, patch) {

        for (var i = 0, l = patch.length; i < l; i++)
        {
            switch (patch[i++])
            {
                case 1: //增加子项
                    this.__insert_patch(control, patch[i++], patch[i]);
                    break;

                case 2: //删除子项
                    this.__remove_patch(control, patch[++i]);
                    break;
            }
        }
    };
    

    //插入子项
    this.__insert_patch = function (control, index, items) {

        var view = control.view_content || control.view;
        this.__unmount_html(control, view, items, 0, items.length, view.children[index] || null);
    };


    //插入未挂载的html片段
    this.__unmount_html = function (control, view, items, start, end, tag) {

        var writer = [],
            node = tag && tag.previousSibling,
            item;

        this.__render_children(writer, control, items, start, end);
        
        writer[0] && flyingon.dom_html(view, writer.join(''), tag);

        node = node && node.nextSibling || view.firstChild;

        this.__mount_children(control, view, items, start, end, node);
    };


    //移除子项
    this.__remove_patch = function (control, items) {

        var item, node;
        
        for (var i = 0, l = items.length; i < l; i++)
        {
            if (item = items[i])
            {
                //允许自动销毁且没有父控件则销毁控件
                if (item.autoDispose && !item.parent)
                {
                    item.dispose();
                }
                else if ((node = item.view) && (item = node.parentNode)) //否则从dom树移除
                {
                    item.removeChild(node);
                }
            }
        }
    };



    //控件顺序发生变化的补丁
    this.__view_order = function (control, view) {

        var item, last, node, tag;

        view = control.view_content || view;

        if ((last = view.lastChild) && last.className === 'f-scroll')
        {
            tag = last;
            last = last.previousSibling;
        }

        for (var i = control.length - 1; i >= 0; i--)
        {
            if ((item = control[i]) && (node = item.view))
            {
                if (node !== last)
                {
                    view.insertBefore(node, tag || null);
                }

                last = (tag = node).previousSibling;
            }
        }
    };

 

    //销毁视图
    this.dispose = function (control) {

        var view = control.view,
            any;

        if (view)
        {
            if (any = view.parentNode)
            {
                any.removeChild(view);
            }

            this.unmount(control);

            view.innerHTML = '';
        }
    };




    //创建渲染器或给渲染器取别名
    flyingon.renderer = function (name, parent, fn) {

        if (!name)
        {
            throw 'renderer name not allow empty!'
        }

        if (typeof parent === 'function')
        {
            fn = parent;
            parent = '';
        }
        else if (typeof fn !== 'function') //给指定的类型绑定渲染器
        {
            return;
        }
        
        if (parent && (parent = registry_list[parent]))
        {
            fn.__parent = parent;
        }

        registry_list[fn.__name = name] = fn;
    };


    //绑定渲染器至目标对象
    flyingon.renderer.bind = function (target, name) {

        var renderer = registry_list[name];

        if (renderer && typeof renderer === 'function')
        {
            renderer = init_renderer(renderer);
        }

        if (renderer)
        {
            target.renderer = renderer;
        }
        else if (!target.renderer)
        {
            target.renderer = self;
        }
    };


    //初始化渲染器
    function init_renderer(fn) {

        var parent = fn.__parent,
            target,
            name;

        parent = parent && init_renderer(parent) || self;

        if (name = fn.__name)
        {
            target = flyingon.create(parent);
            fn.call(target, parent);

            return registry_list[name] = target;
        }
    };



}).call(flyingon.create(null));




flyingon.renderer('HtmlElement', function (base) {



    var tags = flyingon.create(null);

    var check_tag = document.createElement('div');


    tags.div = 'div';
    tags.span = 'span';
    tags.input = 'input';


    this.__scroll_html = '';



    //渲染html
    this.render = function (writer, control, className, cssText) {

        var storage = control.__storage || control.__defaults,
            tagName, 
            any;

        //注:IE8下不支持自定义标签,不支持的标签全部使用div
        if (!(tagName = tags[any = control.tagName]))
        {
            check_tag.innerHTML = '<' + any + '></' + any + '>';
            tags[any] = tagName = check_tag.firstChild ? any : 'div';
        }

        //标注内容已渲染
        control.__content_render = true;

        writer.push('<', tagName);
        
        this.renderDefault(writer, control, className, cssText);
        
        writer.push('>');

        if (any = storage.text)
        {
            if (!storage.html)
            {
                any = flyingon.html_encode(any);
            }

            writer.push(any);
        }
        else if (control.length > 0 && control.__visible)
        {
            this.__render_children(writer, control, control, 0, control.length);
        }

        writer.push('</', tagName, '>');
    };


    
    this.mount = function (control, view) {

        base.mount.call(this, control, view);

        if (control.__content_render)
        {
            this.__mount_children(control, view, control, 0, control.length, view.firstChild);
        }
    };


    this.unmount = function (control) {

        this.__unmount_children(control);
        base.unmount.call(this, control);
    };



    //定位控件时
    this.locate = function (control) {

        base.locate.call(this, control);
        
        if (control.length > 0)
        {
            this.__locate_children(control);
        }
    };


    //按照html方式定位控件时
    this.locate_html = function (control) {

        var dirty = control.__location_dirty;
        
        if (dirty)
        {
            this.__locate_html(control);
        }

        control.__update_dirty = false;

        if (control.length > 0)
        {
            this.__locate_children(control);
        }
    };


    //定位子控件
    this.__locate_children = function (control) {

        for (var i = 0, l = control.length; i < l; i++)
        {
            var item = control[i];

            if (item && item.view)
            {
                item.renderer.locate_html(item);
            }
        }

        control.__arrange_dirty = 0;
    };



    this.__measure_auto = function (control, auto) {

        var view = control.view;

        if (auto & 2)
        {
            if (control.__content_render)
            {
                this.locate(control);
            }
            
            control.offsetHeight = view && view.offsetHeight || 0;
        }
    };



    this.text = function (control, view, value) {

        if (control.html())
        {
            view.innerHTML = value;
        }
        else
        {
            view[this.__text_name] = value;
        }
    };



});




flyingon.renderer('Label', function (base) {



    this.render = function (writer, control, className, cssText) {

        var storage = control.__storage || control.__defaults,
            text = storage.text;

        if (text && !storage.html)
        {
            text = flyingon.html_encode(text);
        }

        writer.push('<span');
        
        this.renderDefault(writer, control, className, cssText);
        
        writer.push('>', text, '</span>');
    };



    this.locate = function (control) {

        var cache = base.locate.call(this, control),
            height = control.offsetHeight;

        if (cache.lineHeight !== height)
        {
            control.view.style.lineHeight = (cache.lineHeight = height) + 'px';
        }

        return cache;
    };



    this.__measure_auto = function (control, auto) {

        var view = control.view;

        if (auto & 1)
        {
            control.offsetWidth = view && view.offsetWidth || 0;
        }

        if (auto & 2)
        {
            view.style.width = control.offsetWidth + 'px';
            control.offsetHeight = view && view.offsetHeight || 0;
        }
    };



    this.text = function (control, view) {

        var storage = control.__storage || control.__defaults;

        if (storage.html)
        {
            view.innerHTML = storage.text;
        }
        else
        {
            view[this.__text_name] = storage.text;
        }
    };



});




flyingon.renderer('Button', function (base) {

    

    this.render = function (writer, control, className, cssText) {

        writer.push('<button type="button"');
        
        this.renderDefault(writer, control, className, cssText);
        
        writer.push('>');

        this.__render_content(writer, control);
        
        writer.push('</button>');
    };


    this.__render_content = function (writer, control) {

        var encode = flyingon.html_encode,
            storage = control.__storage || control.__defaults,
            any;

        if (any = storage.icon)
        {
            writer.push('<span class="', encode(any), '" style="width:', 
                any = storage.iconSize, 'px;height:', any, 'px;">', '</span>');
            
            any = true;
        }

        if (any = storage.text)
        {
            if (any && storage.vertical)
            {
                writer.push('<br/>');
            }

            if (!storage.html)
            {
                any = encode(any);
            }

            writer.push('<span>', any, '</span>');
        }
    };


    this.__measure_auto = function (control, auto) {

        var view = control.view;

        if (auto & 1)
        {
            control.offsetWidth = view && view.offsetWidth || 0;
        }

        if (auto & 2)
        {
            view.style.width = control.offsetWidth + 'px';
            control.offsetHeight = view && view.offsetHeight || 0;
        }
    };


    this.icon = this.iconSize = this.vertical = function (control, view, value) {

        var writer = [];

        this.__render_content(writer, control);
        view.innerHTML = writer.join('');
    };


    this.text = this.html = function (control, view) {

        var storage = control.__storage || control.__defaults;

        if (storage.html)
        {
            view.lastChild.innerHTML = storage.text;
        }
        else
        {
            view.lastChild[this.__text_name] = storage.text;
        }
    };



});




flyingon.renderer('LinkButton', function (base) {



    this.render = function (writer, control, className, cssText) {

        var storage = control.__storage || control.__defaults,
            any;
        
        writer.push('<a type="button"');
        
        this.renderDefault(writer, control, className, cssText);

        if (any = storage.href)
        {
            writer.push(' href="', flyingon.html_encode(any), '"');
        }
        
        writer.push('>');

        if (any = storage.text)
        {
            if (!storage.html)
            {
                any = flyingon.html_encode(any);
            }

            writer.push(any);
        }
        
        writer.push('</a>');
    };



    this.__measure_auto = function (control, auto) {

        var view = control.view;

        if (auto & 1)
        {
            control.offsetWidth = view && view.offsetWidth || 0;
        }

        if (auto & 2)
        {
            view.style.width = control.offsetWidth + 'px';
            control.offsetHeight = view && view.offsetHeight || 0;
        }
    };


    this.text = this.html = function (control, view) {

        var storage = control.__storage || control.__defaults;

        if (storage.html)
        {
            view.innerHTML = storage.text;
        }
        else
        {
            view[this.__text_name] = storage.text;
        }
    };


    this.href = function (control, view, value) {

        view.href = value;
    };



});




flyingon.renderer('Image', function (base) {



    this.render = function (writer, control, className, cssText) {

        var encode = flyingon.html_encode,
            storage = control.__storage || control.__defaults,
            src = storage.src,
            alt = storage.alt;

        if (src)
        {
            src = encode(src);
        }

        if (alt)
        {
            alt = encode(alt);
        }

        writer.push('<img');
        
        this.renderDefault(writer, control, className, cssText);
        
        writer.push(' src="', src, '" alt="', alt, '"></img>');
    };



    this.src = function (control, view, value) {

        view.src = value;
    };


    this.alt = function (control, view, value) {

        view.alt = value;
    };



});




flyingon.renderer('Slider', function (base) {


    this.render = function (writer, control, className, cssText) {

        writer.push('<div');
        
        this.renderDefault(writer, control, className, cssText);

        writer.push('>',
                '<div class="f-slider-bar" onclick="flyingon.Slider.onclick.call(this, event)"><div></div></div>',
                '<div class="f-slider-button" onmousedown="flyingon.Slider.onmousedown.call(this, event)"><div></div></div>',
            '</div>');
    };



    this.locate = function (control) {

        base.locate.call(this, control);
        this.refresh(control);
    };


    flyingon.Slider.onclick = function (e) {

        var control = flyingon.findControl(this),
            storage = control.__storage || control.__defaults,
            size = control.view.offsetWidth - storage.buttonSize,
            x = e.offsetX;

        if (x === void 0)
        {
            x = e.clientX - control.view.getBoundingClientRect().left;
        }

        x /= size;
        x = (storage.max - storage.min) * (x > 1 ? 1 : x) | 0;

        control.value(x);
        control.trigger('change', 'value', x);
    };


    flyingon.Slider.onmousedown = function (e) {

        var control = flyingon.findControl(this),
            storage = control.__storage || control.__defaults,
            context = { control: control },
            size = context.size = control.view.offsetWidth - storage.buttonSize,
            value = storage.value * size / (storage.max - storage.min) + 0.5 | 0;

        e.dom = this;

        context.min = -value;
        context.max = size - value;

        flyingon.dom_drag(context, e, null, check_move, move_end, 'y');
    };


    function check_move(e) {

        var x = e.distanceX;

        if (x < this.min)
        {
            e.distanceX = this.min;
        }
        else if (x > this.max)
        {
            e.distanceX = this.max;
        }
    };


    function move_end(e) {

        var control = this.control,
            storage = control.__storage || control.__defaults,
            x = e.distanceX - this.min;

        x = (storage.max - storage.min) * x / this.size | 0;

        control.value(x);
        control.trigger('change', 'value', x);
    };


    this.refresh = function (control) {

        var storage = control.__storage || control.__defaults,
            view = control.view,
            style = view.lastChild.style,
            width = view.offsetWidth - storage.buttonSize;

        style.left = (storage.value * width / (storage.max - storage.min) | 0) + 'px';
        style.width = storage.buttonSize + 'px';
    };


});




flyingon.renderer('ProgressBar', function (base) {


    this.render = function (writer, control, className, cssText) {

        var value = (control.__storage || control.__defaults).value;

        writer.push('<div');
        
        this.renderDefault(writer, control, className, cssText);

        writer.push('>',
                '<div class="f-progressbar-back" style="width:', value, '%;"></div>',
                '<div class="f-progressbar-text"><span>', value, '%</span></div>',
            '</div>');
    };


    this.value = function (control, view, value) {

        view.firstChild.style.width = value + 'px';
        view.lastChild.firstChild[this.__text_name] = value + '%';
    };


    this.text = function (control, view, value) {

        view.lastChild.style.display = value ? '' : 'none';
    };


});




//容器控件渲染器
flyingon.renderer('Panel', function (base) {
    
    

    //不设置auto尺寸
    this.__auto_size = 0;


    //不渲染padding
    this.padding = 0;
    



    //渲染html
    this.render = function (writer, control, className, cssText) {

        writer.push('<div');
        
        this.renderDefault(writer, control, className, cssText);
        
        writer.push(' onscroll="flyingon.__dom_scroll.call(this, event)">');

        if (control.length > 0 && control.__visible)
        {
            control.__content_render = true;
            this.__render_children(writer, control, control, 0, control.length);
        }

        //滚动位置控制(解决有右或底边距时拖不到底的问题)
        writer.push(this.__scroll_html, '</div>');
    };


    //重新渲染内容
    this.__render_content = function (control, view) {

        var writer = [];

        //标记已渲染
        control.__content_render = true;

        this.__render_children(writer, control, control, 0, control.length);

        writer.push(this.__scroll_html);

        view.innerHTML = writer.join('');
        this.mount(control, view);
    };



    this.mount = function (control, view) {

        base.mount.call(this, control, view);

        if (control.__content_render)
        {
            view = control.view_content || view;
            this.__mount_children(control, view, control, 0, control.length, view.firstChild);
        }
    };


    this.unmount = function (control) {

        control.view = control.view_content = null;

        this.__unmount_children(control);
        base.unmount.call(this, control);
    };



    //作为html方式定位控件时需特殊处理
    this.locate_html = function (control) {

        var any = control.__location_dirty,
            width = 0,
            height = 0;
        
        if (any)
        {
            this.__locate_html(control);
        }

        control.__update_dirty = false;

        //如果需要适应容器,则计算容器大小(对性能有影响)
        if ((any = control.view) && (any = any.parentNode) && control.adaption())
        {
            width = any.clientWidth;
            height = any.clientHeight;
        }
        
        control.measure(width, height, width, height);
        this.locate(control);
    };


    this.locate = function (control) {

        base.locate.call(this, control);

        if (control.length > 0 && !control.__content_render)
        {
            this.__render_content(control, control.view_content || control.view);
        }
      
        //需要排列先重排
        if (control.__arrange_dirty > 1)
        {
            this.__arrange(control);
            this.__locate_scroll(control);
        }
 
        //定位子控件
        for (var i = 0, l = control.length; i < l; i++)
        {
            var item = control[i];

            if (item && item.view)
            {
                item.renderer.locate(item);
            }
        }
    };


    //定位滚动条
    this.__locate_scroll = function (control) {

        var style = (control.view_content || control.view).lastChild.style, //内容位置控制(解决有右或底边距时拖不到底的问题)
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




flyingon.renderer('GroupBox', 'Panel', function (base) {



    this.render = function (writer, control, className, cssText) {

        var storage = control.__storage || control.__defaults,
            head = storage.header,
            text = storage.text,
            any;

        writer.push('<div');
        
        this.renderDefault(writer, control, className, cssText);
        
        if (text)
        {
            text = flyingon.html_encode(text);
        }

        if (any = control.format)
        {
            text = any.call(control, text);
        }

        writer.push('>',
            '<div class="f-groupbox-head" style="height:', head, 'px;line-height:', head, 'px;text-align:', storage.align, ';" onclick="flyingon.GroupBox.onclick.call(this, event)">',
                '<span class="f-groupbox-icon ', (any = storage.icon) ? any : '" style="display:none;', '"></span>',
                '<span class="f-groupbox-text">', text, '</span>',
                '<span class="f-groupbox-flag f-groupbox-', storage.collapsed ? 'close"' : 'open"', storage.collapsable === 2 ? '' : ' style="display:none;"', '></span>',
                '<span class="f-groupbox-line"></span>',
            '</div>',
            '<div class="f-groupbox-body" style="top:', head, 'px;overflow:auto;', storage.collapsed ? '' : '', '">');

        if (control.length > 0 && control.__visible)
        {
            control.__content_render = true;
            this.__render_children(writer, control, control, 0, control.length);
        }

        writer.push(this.__scroll_html, '</div></div>');
    };
    

    this.mount = function (control, view) {

        control.view_content = view.lastChild;
        base.mount.call(this, control, view);
    };


    flyingon.GroupBox.onclick = function (e) {

        var control = flyingon.findControl(this);

        if (control.collapsable())
        {
            control.collapsed(!control.collapsed());
        }
    };



    this.header = function (control, view, value) {

        view.firstChild.style.height = view.lastChild.style.top = value + 'px';
    };


    this.text = function (control, view, value) {

        view = view.firstChild.firstChild.nextSibling;

        if (control.format)
        {
            if (value)
            {
                value = flyingon.html_encode(value);
            }

            view.innerHTML = control.format(value);
        }
        else
        {
            view[this.__text_name] = value;
        }
    };


    this.icon = function (control, view, value) {

        view = view.firstChild.firstChild;
        view.className = 'f-groupbox-icon' + (value ? ' ' + value : '');
        view.style.display = value ? '' : 'none';
    };


    this.collapsable = function (control, view, value) {

        view.firstChild.lastChild.style.display = value === 2 ? '' : 'none';
    };


    this.collapsed = function (control, view, value) {

        view.firstChild.lastChild.previousSibling.className = 'f-groupbox-flag f-groupbox-' + (value ? 'close' : 'open');
        view.lastChild.style.display = value ? 'none' : '';
    };


    this.align = function (control, view, value) {

        view.firstChild.style.textAlign = value;
    };


});




//容器控件渲染器
flyingon.renderer('ScrollPanel', function (base) {
    
    
    
    //不设置auto尺寸
    this.__auto_size = 0;


    //不渲染padding
    this.padding = 0;




    //渲染html
    this.render = function (writer, control, className, cssText) {

        var text = this.__scroll_html;

        //滚动位置控制(解决有右或底边距时拖不到底的问题)
        //使用模拟滚动条解决IE拖动闪烁问题
        //此处只渲染一个空的壳,实现渲染内容在locate的时候根据需要渲染
        writer.push('<div');
        
        this.renderDefault(writer, control, className, cssText);
        
        writer.push('>',
            '<div class="f-scrollpanel-scroll" onscroll="flyingon.__dom_scroll.call(this, event)">',
                text,
            '</div>',
            '<div class="f-scrollpanel-body" style="overflow:hidden;">',
                text,
            '</div>',
        '</div>');
    };


    
    this.mount = function (control, view) {

        control.view_content = view.lastChild;
        
        base.mount.call(this, control, view);

        control.on('mousewheel', mousewheel);
    };


    this.unmount = function (control, remove) {

        control.view_content = null;

        this.__unmount_children(control);
        base.unmount.call(this, control, remove);
    };


    function mousewheel(event) {

        this.view.firstChild.scrollTop -= event.wheelDelta * 100 / 120;
        flyingon.dom_stop(event);
    };



    this.locate = function (control) {

        var cache = base.locate.call(this, control),
            start, 
            end, 
            any;

        //需要排列先重排
        if (control.__arrange_dirty > 1)
        {
            start = control.__visible_start;
            end = control.__visible_end + 1;

            this.__arrange(control);

            control.__compute_visible();

            //隐藏原来显示的子项
            if (start >= 0)
            {
                while (start <= end)
                {
                    if ((any = control[start++]) && !any.__visible_area)
                    {
                        this.__locate_position(any);
                    }
                }
            }
        }

        any = control.view_content.style;
        any[flyingon.rtl ? 'left' : 'right'] = (control.__vscroll ? flyingon.vscroll_width : 0) + 'px';
        any.bottom = (control.__hscroll ? flyingon.hscroll_height : 0) + 'px';

        start = control.__visible_start;
        end = control.__visible_end + 1;

        if (start >= 0)
        {
            //插入未挂载的子控件
            if (control.__visible_unmount)
            {
                control.__visible_unmount = false;
                this.__insert_children(control, control.view_content, start, end);
            }
            
            //定位子控件
            while (start < end)
            {
                any = control[start++];

                if (any && any.view)
                {
                    any.renderer.locate(any);
                }
            }
        }

        return cache;
    };


    //仅更新位置信息
    this.__locate_position = function (control) {

        var style = control.view.style,
            cache = control.__locate_cache,
            any;

        if (cache)
        {
            if (cache.left !== (any = control.offsetLeft))
            {
                style.left = (cache.left = any) + 'px';
            }

            if (cache.top !== (any = control.offsetTop))
            {
                style.top = (cache.top = any) + 'px';
            }
        }
    };


    this.__sync_scroll = function (control) {

        var view = control.view,
            style1 = view.firstChild.firstChild.style, //模拟滚动条控制
            style2 = view.lastChild.lastChild.style; //内容位置控制(解决有右或底边距时拖不到底的问题)

        style1.overflowX = control.__hscroll ? 'scroll' : 'hidden';
        style1.overflowY = control.__vscroll ? 'scroll' : 'hidden';

        style1.width = style2.width = control.arrangeRight + 'px'; 
        style1.height = style2.height = control.arrangeBottom + 'px'; 
    };


    //插入视图补丁
    this.__insert_children = function (control, view, start, end) {

        var tag = view.lastChild || null,
            last = -1,
            item,
            node;
            
        //处理插入带view的节点
        for (var i = end - 1; i >= start; i--)
        {
            if (item = control[i])
            {
                if (node = item.view)
                {
                    if (node.parentNode !== view)
                    {
                        view.insertBefore(node, tag || null);
                    }

                    if (last > 0)
                    {
                        this.__unmount_html(control, view, control, i + 1, last, tag);
                        last = -1;
                    }

                    tag = node;
                }
                else if (last < 0)
                {
                    last = i + 1;
                }
            }
        }

        if (last > 0)
        {
            this.__unmount_html(control, view, control, start, last, tag);
        }
    };

 

    this.scroll = function (control, x, y) {

        var view = control.view.lastChild;

        this.locate(control);
        
        if (view.scrollLeft !== x)
        {
            view.scrollLeft = x;
        }

        if (view.scrollTop !== y)
        {
            view.scrollTop = y;
        }
    };


});




flyingon.renderer('Splitter', function (base) {



    //渲染html
    this.render = function (writer, control, className, cssText) {

        writer.push('<div');

        this.renderDefault(writer, control, className, (cssText || '') + 'cursor:ew-resize;');

        writer.push(' onmousedown="flyingon.Splitter.onmousedown.call(this, event)"><div></div></div>');
    };
    

    this.locate = function (control) {

        var vertical = control.offsetWidth > control.offsetHeight;

        base.locate.call(this, control);

        if (control.vertical !== vertical)
        {
            control.vertical = vertical;
            control.view.style.cursor = vertical ? 'ns-resize' : 'ew-resize';
        }
    };


    flyingon.Splitter.onmousedown = function (e) {
            
        var control = flyingon.findControl(this),
            data = resize_data(control);

        if (data)
        {
            flyingon.dom_drag(data, e, null, do_resize, null, true);
        }
    };


    function resize_data(control) {

        var parent = control.parent,
            vertical = control.vertical,
            dock = (control.__storage || control.__defaults).dock;

        if (parent && (control = parent[parent.indexOf(control) - 1]))
        {
            return [control, vertical, vertical ? control.offsetHeight : control.offsetWidth, dock === 'right' || dock === 'bottom'];
        }
    };


    function do_resize(event) {

        var control = this[0],
            vertical = this[1],
            style = control.__style,
            name = vertical ? 'distanceY' : 'distanceX',
            size = this[2] + (this[3] ? -event[name] : event[name]),
            visible = 'visible';

        if (size < 4)
        {
            size = 0;
            visible = 'hidden';
        }

        if (!style || !style.visibility !== visible)
        {
            control.style('visibility', visible);
        }

        control[vertical ? 'height' : 'width'](size);
    };

     

});




flyingon.renderer('ListBox', function (base) {



    this.render = function (writer, control, className, cssText) {

        writer.push('<div');
        
        this.renderDefault(writer, control, className, cssText);

        writer.push(' onclick="flyingon.ListBox.onclick.call(this, event)"></div>');
    };



    flyingon.ListBox.onclick = function (e) {

        var dom = e.target || e.srcElement;

        while (dom !== this)
        {
            var index = dom.getAttribute('index');

            if (index)
            {
                change(flyingon.findControl(this), this, 0, index | 0, true);
                return;
            }

            dom = dom.parentNode;
        }
    };


    function change(control, view, oldIndex, newIndex, change) {

        var type = control.__list_type,
            any;

        if (change)
        {
            oldIndex = control.__selectedIndex;
        }

        //多选
        if (type === 'checkbox')
        {
            if (change) //通过界面操作变更
            {
                if (oldIndex && (any = oldIndex.indexOf(newIndex)) >= 0)
                {
                    oldIndex.splice(any, 1);
                    change_selected(view, newIndex, false, type);
                }
                else
                {
                    change_selected(view, newIndex, true, type);

                    if (oldIndex)
                    {
                        oldIndex.push(newIndex);
                    }
                    else
                    {
                        oldIndex = [newIndex];
                    }
                }

                newIndex = oldIndex;
            }
            else //批量修改
            {
                if (oldIndex) //清除原来选中
                {
                    for (var i = oldIndex.length - 1; i >= 0; i--)
                    {
                        if (!newIndex || newIndex.indexOf(oldIndex[i]) < 0)
                        {
                            change_selected(view, oldIndex[i], false, type);
                        }
                    }
                }

                if (newIndex) //增加新选中
                {
                    for (var i = newIndex.length - 1; i >= 0; i--)
                    {
                        if (!oldIndex || oldIndex.indexOf(newIndex[i]) < 0)
                        {
                            change_selected(view, newIndex[i], true, type);
                        }
                    }
                }
            }
        }
        else //单选
        {
            if (newIndex === oldIndex)
            {
                return;
            }

            if (oldIndex >= 0) //清除原选中
            {
                change_selected(view, oldIndex, false, type);
            }

            if (newIndex >= 0)
            {
                change_selected(view, newIndex, true, type);
            }
        }

        if (change)
        {
            control.__use_index = true;
            control.__selectedIndex = newIndex;

            control.trigger('change', 'value', control.selectedValue());
        }
    };


    function change_selected(view, index, selected, type) {

        if (view = view.children[index])
        {
            var name = ' f-listbox-selected',
                index = view.className.indexOf(name);

            if (selected)
            {
                if (index < 0)
                {
                    view.className += name;

                    if (type && (view = view.firstChild))
                    {
                        view.checked = true;
                    }
                }
            }
            else if (index >= 0)
            {
                view.className = view.className.replace(name, '');

                if (type && (view = view.firstChild))
                {
                    view.checked = false;
                }
            }
        }
    };


    this.locate = function (control) {

        base.locate.call(this, control);
        this.content(control);
    };


    this.content = function (control) {

        var storage = control.__storage || control.__defaults,
            items = storage.items;
            
        if (!items)
        {
            return '';
        }

        var writer = [],
            encode = flyingon.html_encode,
            template = control.__template,
            type = control.__list_type,
            selected = control.selectedIndex(),
            clear = !type && storage.clear ? 1 : 0,
            columns = storage.columns,
            itemHeight = storage.itemHeight,
            display = storage.displayField,
            style = ' style="height:' + itemHeight + 'px;line-height:' + itemHeight + 'px;',
            left = flyingon.rtl ? 'right:' : 'left:',
            top = 0,
            index = 0,
            length = items.length,
            width,
            checked,
            item,
            x,
            y,
            any;

        if (columns <= 0)
        {
            columns = items.length;
        }

        if (columns > 1)
        {
            any = control.offsetWidth - control.borderLeft - control.borderRight - control.paddingLeft - control.paddingRight;

            if (control.offsetHeight - control.borderTop - control.borderBottom - control.paddingTop - control.paddingBottom <
                Math.ceil(items.length / columns) * itemHeight)
            {
                any -= flyingon.vscroll_width;
            }

            width = any / columns | 0;
            style += 'width:' + (width - 10) + 'px;';
        }
        else
        {
            width = 0;
            style += flyingon.rtl ? 'left:0;' : 'right:0;'; //单列时充满可用空间
        }

        switch (type)
        {
            case 'radio':
                break;

            case 'checkbox':
                checked = selected.length > 0 && selected.pair();
                break;

            default:
                type = null;
                break;
        }

        if (!template && (template = storage.template))
        {
            if (typeof template === 'string')
            {
                template = new flyingon.view.Template(template).parse(true);
            }

            control.__template = template = template instanceof Array ? template : [template];
        }

        if (template)
        {
            length = template.length;
        }

        while (index < length)
        {
            item = items[index];
            any = index + clear;

            if (columns > 1)
            {
                x = (any % columns) * width;
                y = (any / columns | 0) * itemHeight;
            }
            else
            {
                x = 0;
                y = any * itemHeight;
            }

            any = checked ? checked[index] : selected === index;

            writer.push('<div class="f-listbox-item', any ? ' f-listbox-selected"' : '"', 
                style, 'top:', y, 'px;', left, x, 'px;" index="', index++, '">');

            if (type)
            {
                writer.push('<input type="', type, '"', any ? ' checked="checked"' : '', '/>');
            }

            if (template)
            {
                for (var j = 0, l = template.length; j < l; j++)
                {
                    render_template(writer, item, index, template[j], display, encode);
                }
            }
            else
            {
                any = item;

                if (display)
                {
                    any = any && any[display] || '';
                }

                if (any && typeof any === 'string')
                {
                    any = encode(any);
                }

                writer.push(any);
            }

            writer.push('</div>');
        }

        //生成清除项
        if (clear)
        {
            writer.push('<div class="f-listbox-item f-listbox-clear"', style, 'top:0;', left, '0;" index="-1"><span>', 
                flyingon.i18ntext('listbox.clear'), '</span></div>');
        }

        control.view.innerHTML = writer.join('');
    };


    function render_template(writer, item, index, template, display, encode) {

        var tag = template.Class || 'div',
            text,
            any;

        writer.push('<', tag);

        for (var name in template)
        {
            switch (name)
            {
                case 'Class':
                case 'children':
                    break;

                default:
                    if ((any = template[name]) != null)
                    {
                        if (name.charAt(0) === ':')
                        {
                            name = name.substring(1);

                            if (any === 'index')
                            {
                                any = index;
                            }
                            else if (display)
                            {
                                any = item ? item[display] : '';
                            }
                            else if (any === 'item')
                            {
                                any = item;
                            }
                            else
                            {
                                any = '';
                            }
                        }

                        if (any && typeof any === 'string')
                        {
                            any = encode(any);
                        }

                        if (name === 'text')
                        {
                            text = any;
                        }
                        else
                        {
                            writer.push(' ', name, '="', any, '"');
                        }
                    }
                    break;
            }
        }

        writer.push('>');

        if (text)
        {
            writer.push(text);
        }
        else if (any = template.children)
        {
            if (any instanceof Array)
            {
                for (var i = 0, l = any.length; i < l; i++)
                {
                    render_item(writer, item, any[i]);
                }
            }
            else
            {
                render_item(writer, item, any);
            }
        }

        writer.push('</', tag, '>');
    };



});




flyingon.renderer('RadioButton', function (base) {



    this.render = function (writer, control, className, cssText) {

        writer.push('<input type="radio" name="', control.name(), '"', control.value() ? ' checked="checked"' : '');
        
        this.renderDefault(writer, control, className, cssText);
        
        writer.push(' onchange="flyingon.RadioButton.onchange.call(this)"/>');
    };



    flyingon.RadioButton.onchange = function () {

        var control = flyingon.findControl(this);

        control.rendered = false;
        control.value(this.checked);
        control.rendered = true;

        control.trigger('change', 'value', this.checked);
    };


    this.value = function (control, view, value) {

        view.firstChild.checked = value;
    };

    
});




flyingon.renderer('CheckBox', function (base) {



    this.render = function (writer, control, className, cssText) {

        writer.push('<div');
        
        this.renderDefault(writer, control, className, cssText);
        
        writer.push('><input type="checkbox" name="', control.name(), control.value() ? '" checked="checked' : '',
            '" class="f-checkbox-input" onchange="flyingon.CheckBox.onchange.call(this)" /></div>');
    };



    flyingon.CheckBox.onchange = function () {

        var control = flyingon.findControl(this);

        control.rendered = false;
        control.value(this.checked);
        control.rendered = true;

        control.trigger('change', 'value', this.checked);
    };


    this.value = function (control, view, value) {

        view.firstChild.checked = value;
    };


});




flyingon.renderer('TextBox', function (base) {



    this.render = function (writer, control, className, cssText) {

        var text = control.text();

        if (text)
        {
            text = flyingon.html_encode(text);
        }

        writer.push('<input');
        
        this.renderDefault(writer, control, className, cssText);
        
        writer.push(' type="text" value="', text, '" onchange="flyingon.TextBox.onchange.call(this)"/>');
    };


    flyingon.TextBox.onchange = function () {

        var control = flyingon.findControl(this);

        control.rendered = false;
        control.value(this.value);
        control.rendered = true;

        this.value = control.text();

        control.trigger('change', 'value', this.value);
    };



    this.text = function (control, view, value) {

        view.value = value;
    };



});




flyingon.renderer('TextButton', function (base) {

    

    this.render = function (writer, control, className, cssText) {

        var storage = control.__storage || control.__defaults,
            text = control.text(),
            size = storage.buttonSize;

        if (text)
        {
            text = flyingon.html_encode(text);
        }

        writer.push('<div');
        
        this.renderDefault(writer, control, className, cssText);

        writer.push('>',
                '<div class="f-textbutton-body" style="right:', size, 'px;">',
                    '<input type="text" class="f-textbutton-text" value="', text, '" onchange="flyingon.TextButton.onchange.call(this)"/>',
                '</div>',
                '<div class="f-textbutton-button ', storage.button, '" style="width:', size, 'px;" onclick="flyingon.TextButton.onclick.call(this)"></div>',
            '</div>');
    };


    flyingon.TextButton.onclick = function () {

        flyingon.findControl(this).__on_click();
    };


    flyingon.TextButton.onchange = function () {

        var control = flyingon.findControl(this);

        control.rendered = false;
        control.value(this.value);
        control.rendered = true;

        control.view.firstChild.firstChild.value = control.text();

        control.trigger('change', 'value', this.value);
    };



    this.button = function (control, view, value) {

        view.lastChild.className = 'f-textbutton-button ' + value;
    };


    this.buttonSize = function (control, view, value) {

        view.firstChild.style.right = view.lastChild.style.width = value + 'px';
    };


    this.text = function (control, view) {

        view.firstChild.firstChild.value = control.text();
    };


});




flyingon.renderer('Calendar', function (base) {



    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    //var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    var weeks = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];



    this.render = function (writer, control, className, cssText) {

        writer.push('<div');
        
        this.renderDefault(writer, control, className, (cssText || '') + 'padding:8px;');
        
        writer.push(' onclick="flyingon.Calendar.onclick.call(this, event)"></div>');
    };



    flyingon.Calendar.onclick = function (e) {

        var control = flyingon.findControl(this),
            dom = e.target || e.srcElement,
            data = control.__data,
            any;

        switch (dom.getAttribute('tag'))
        {
            case 'to-year':
                render_year(control, data);
                break;

            case 'to-month':
                render_month(control, data);
                break;

            case 'to-date':
                render_date(control, data);
                break;

            case 'date-2':
                data[4] -= 1;
                render_date(control, data);
                break;

            case 'date-1':
                if (--data[5] < 1)
                {
                    data[5] = 12;
                    data[4]--;
                }

                render_date(control, data);
                break;

            case 'date+1':
                if (++data[5] > 12)
                {
                    data[5] = 1;
                    data[4]++;
                }

                render_date(control, data);
                break;

            case 'date+2':
                data[4] += 1;
                render_date(control, data);
                break;

            case 'month-2':
                data[4] -= 10;
                render_month(control, data);
                break;

            case 'month-1':
                data[4] -= 1;
                render_month(control, data);
                break;

            case 'month+1':
                data[4] += 1;
                render_month(control, data);
                break;

            case 'month+2':
                data[4] += 10;
                render_month(control, data);
                break;

            case 'year-2':
                data[4] -= 100;
                render_year(control, data);
                break;

            case 'year-1':
                data[4] -= 20;
                render_year(control, data);
                break;

            case 'year+1':
                data[4] += 20;
                render_year(control, data);
                break;

            case 'year+2':
                data[4] += 100;
                render_year(control, data);
                break;

            case 'today':
                any = new Date();
                data[0] = data[4] = any.getFullYear();
                data[1] = data[5] = any.getMonth() + 1;
                data[2] = any.getDate();

                do_change(control, data, render_date);
                break;

            case 'clear':
                data[0] = data[1] = data[2] = 0;
                
                if (raise_change(control, null))
                {
                    render_date(control, data);
                }
                break;

            case 'year':
                data[0] = data[4] = +dom.innerHTML;
                (control.month() ? render_month : render_date)(control, data);
                break;

            case 'month':
                data[0] = data[4];
                data[1] = data[5] = +dom.getAttribute('value');

                if (control.month())
                {
                    do_change(control, data, render_month);
                }
                else
                {
                    render_date(control, data);
                }
                break;
                
            case 'date':
                if (dom.className.indexOf('f-calendar-disabled') < 0)
                {
                    any = data[5] + (dom.getAttribute('offset') | 0);

                    if (any < 1)
                    {
                        any = 12;
                        data[4]--;
                    }
                    else if (any > 12)
                    {
                        any = 1;
                        data[4]++;
                    }
                    else
                    {
                        data[4];
                    }

                    data[0] = data[4];
                    data[1] = data[5] = any;
                    data[2] = +dom.innerHTML;

                    do_change(control, data, render_date);
                }
                break;
        }
    };


    flyingon.Calendar.onchange = function () {

        var control = flyingon.findControl(this),
            values = this.value.match(/\d+/g);

        this.value = control.__data[3] = values ? check_time(values) : '00:00:00';
    };


    function do_change(control, data, fn) {

        var storage = control.__storage || control.__defaults,
            value,
            any;

        if (storage.month)
        {
            value = data[0] + '-' + data[1];
        }
        else
        {
            value = data[0] + '-' + data[1] + '-' + data[2];

            if (storage.time)
            {
                any = data[3].split(':');
                value += ' ' + any[0] + ':' + any[1] + ':' + any[2];
            }

            value = new Date(value);
        }

        if (raise_change(control, value))
        {
            fn && fn(control, data);
            return true;
        }
    };


    function raise_change(control, value) {

        if (control.value() !== value)
        {
            control.rendered = false;
            control.value(value);
            control.rendered = true;

            control.trigger('change', 'value', value);
        }

        return control.trigger('selected', 'value', value) !== false;
    };


    function check_time(values) {

        var list = [],
            max = 24,
            any;

        for (var i = 0; i < 3; i++)
        {
            if (any = values[i])
            {
                //substr在IE7下使用负索引有问题
                if (any > max)
                {
                    any = max;
                }
                else if ((any = '' + any).length === 1)
                {
                    any = '0' + any;
                }
            }
            else
            {
                any = '00';
            }

            list.push(any);
            max = 60;
        }

        return list.join(':');
    };


    this.locate = function (control) {

        base.locate.call(this, control);

        control.__data = null;
        render(control);
    };


    function render(control) {

        var storage = control.__storage || control.__defaults,
            data = control.__data,
            any;

        if (!data)
        {
            any = storage.value;

            control.__data = data = [

                any ? any.getFullYear() : 0, 
                any ? any.getMonth() + 1 : 0,
                any ? any.getDate() : 0,
                '',
                (any = any || new Date()).getFullYear(),
                any.getMonth() + 1
            ];

            if (storage.time && !storage.month)
            {
                 data[3] = check_time([any.getHours(), any.getMinutes(), any.getSeconds()]);
            }
        }

        if (storage.month)
        {
            render_month(control, data);
        }
        else
        {
            render_date(control, data);
        }
    };


    function render_year(control, data) {

        var writer = [],
            storage = control.__storage || control.__defaults,
            min = storage.min,
            max = storage.max,
            check = control.oncheck,
            year,
            text,
            name,
            any;

        min && (min = min.match(/\d+/g));
        max && (max = max.match(/\d+/g));

        any = (clientHeight(control) - 30) / 4 | 0;
        text = '<div style="height:' + any + 'px;line-height:' + any + 'px;">';

        year = (data[4] / 20 | 0) * 20 + 1;

        any = flyingon.i18ntext('calendar.title', 'Y')[0];
        any = any.replace('Y', year) + ' - ' + any.replace('Y', year + 19);
        any = '<span tag="to-' + (control.month() ? 'month">' : 'date">') + any + '</span>';

        render_head(writer, data, 'year', any);

        writer.push('<div class="f-calendar-year">');

        any = data[0];

        for (var i = 0; i < 4; i++)
        {
            writer.push(text);

            for (var j = 0; j < 5; j++)
            {
                name = year === any ? 'f-calendar-selected ' : '';

                if (min && check_min(min, year) ||
                    max && check_max(max, year) ||
                    check && check(year) === false)
                {
                    name += 'f-calendar-disabled ';
                }

                writer.push('<span class="', name, '" tag="year">', year++, '</span>');
            }

            writer.push('</div>');
        }

        control.view.innerHTML = writer.join('');
    };


    function render_month(control, data) {

        var writer = [],
            i18n = flyingon.i18ntext,
            storage = control.__storage || control.__defaults,
            min = storage.min,
            max = storage.max,
            check = control.oncheck,
            keys = i18n('calendar.month', '') || months,
            year = data[4],
            month,
            name,
            text,
            any;

        if (min = min && min.match(/\d+/g))
        {
            min[1] || (min[1] = 0);
        }

        if (max = max && max.match(/\d+/g))
        {
            max[1] || (max[1] = 12);
        }

        any = '<span tag="' + (control.month() ? 'to-year">' : 'to-date">')
            + i18n('calendar.title', 'Y')[0].replace('Y', year)
            + '</span>';

        render_head(writer, data, 'month', any);

        any = (clientHeight(control) - 30) / 3 | 0;
        text = '<div style="height:' + any + 'px;line-height:' + any + 'px;">';

        writer.push('<div class="f-calendar-month">');

        any = data[1];

        for (var i = 0; i < 3; i++)
        {
            writer.push(text);

            for (var j = 0; j < 4; j++)
            {
                month = i * 4 + j + 1;

                name = month === any ? 'f-calendar-selected ' : '';

                if (min && check_min(min, year, month) ||
                    max && check_max(max, year, month) ||
                    check && check(year, month) === false)
                {
                    name += 'f-calendar-disabled';
                }

                writer.push('<span class="', name, '" value="', month, '" tag="month">', keys[month - 1], '</span>');
            }

            writer.push('</div>');
        }

        writer.push('</div>');

        control.view.innerHTML = writer.join('');
    };


    function render_date(control, data) {

        var writer = [],
            i18n = flyingon.i18ntext,
            storage = control.__storage || control.__defaults,
            min = storage.min,
            max = storage.max,
            foot = storage.today || storage.clear || storage.time,
            check = control.oncheck,
            index = 0,
            week, //每月第一天是星期几
            last, //上一个月最大天数
            days, //本月最大天数
            text,
            name,
            year,
            month,
            date,
            selected,
            offset,
            any;

        if (min = min && min.match(/\d+/g))
        {
            min[1] || (min[1] = 0);
            min[2] || (min[2] = 0);
        }

        if (max = max && max.match(/\d+/g))
        {
            max[1] || (max[1] = 12);
            max[2] || (max[2] = 31);
        }

        //title标题
        name = i18n('calendar.title', ['Y', 'M', 'M Y']);

        year = name[0].replace('Y', data[4]);
        month = name[1].replace('M', (i18n('calendar.month', '') || months)[data[5] - 1]);
        
        any = name[2].replace('Y', '<span tag="to-year">' + year + '</span>');
        any = any.replace('M', '<span tag="to-month">' + month + '</span>');

        render_head(writer, data, 'date', any);

        //渲染周
        any = i18n('calendar.week', '') || weeks;

        writer.push('<div class="f-calendar-week" style="height:25px;line-height:25px;">');

        for (var i = 0; i < 7; i++)
        {
            writer.push('<span>', any[i], '</span>');
        }

        writer.push('</div><div class="f-calendar-line" style="height:1px;"></div><div class="f-calendar-space" style="height:4px;"></div>');
  
        any = new Date(data[4], data[5], 1);
        
        week = any.getDay();
        any.setDate(-1);

        last = any.getDate() + 1;

        any = new Date(data[4], data[5] + 1, 1);
        any.setDate(-1);

        days = any.getDate() + 1;

        any = (clientHeight(control) - (foot ? 90 : 60)) / 6 | 0;
        text = '<div class="f-calendar-date" style="height:' + any + 'px;line-height:' + any + 'px;">';

        //共渲染6行
        for (var i = 0; i < 6; i++)
        {
            writer.push(text);

            while (index++ < 7)
            {
                date = i * 7  - week + index;

                year = data[4];
                month = data[5];

                if (date < 1)
                {
                    if (--month < 1)
                    {
                        year--;
                        month = 12;
                    }

                    date += last;
                    offset = -1;
                }
                else if (date > days)
                {
                    if (++month > 12)
                    {
                        year++;
                        month = 1;
                    }

                    date -= days;
                    offset = 1;
                }
                else
                {
                    offset = 0;
                }

                name = offset ? 'f-calendar-dark ' : '';

                if (data[2] === date && data[1] === month && data[0] === year)
                {
                    name += 'f-calendar-selected ';
                }

                if (min && check_min(min, year, month, date) ||
                    max && check_max(max, year, month, date) ||
                    check && check(year, month, date) === false)
                {
                    name += 'f-calendar-disabled ';
                }

                if (index === 1 || index === 7)
                {
                    name += 'f-calendar-weekend';
                }

                writer.push('<span class="', name, '" tag="date" offset="', offset, '">', date, '</span>');
            }

            index = 0;

            writer.push('</div>');
        }
        
        if (foot)
        {
            writer.push('<div class="f-calendar-space" style="height:4px;"></div><div class="f-calendar-foot" style="height:25px;line-height:25px;">');

            storage.time && writer.push('<input type="text" class="f-calendar-time" value="', data[3], '" onchange="flyingon.Calendar.onchange.call(this)"/>');

            storage.clear && writer.push('<span class="f-calendar-clear" tag="clear">', i18n('calendar.clear', 'clear'), '</span>');
            
            storage.today && writer.push('<span class="f-calendar-today" tag="today">', i18n('calendar.today', 'today'), '</span>');

            writer.push('</div>');
        }

        control.view.innerHTML = writer.join('');
    };


    function render_head(writer, data, tag, text) {

        writer.push('<div class="f-calendar-head" style="height:30px;line-height:30px;">',
                '<span class="f-calendar-before2" tag="', tag, '-2"></span>',
                '<span class="f-calendar-before1" tag="', tag, '-1"></span>',
                '<span class="f-calendar-title">', text, '</span>',
                '<span class="f-calendar-after1" tag="', tag, '+1"></span>',
                '<span class="f-calendar-after2" tag="', tag, '+2"></span>',
            '</div>');
    };

    
    function clientHeight(control) {

        return control.offsetHeight 
            - control.borderTop - control.borderBottom 
            - control.paddingTop - control.paddingBottom;
    };


    function check_min(min, year, month, date) {

        var any = year - min[0];

        if (any < 0)
        {
            return true;
        }

        if (any === 0 && month > 0)
        {
            any = month - min[1];

            if (any < 0)
            {
                return true;
            }

            return any === 0 && date < min[2];
        }
    };


    function check_max(max, year, month, date) {

        var any = year - max[0];

        if (any > 0)
        {
            return true;
        }

        if (any === 0 && month > 0)
        {
            any = month - max[1];

            if (any > 0)
            {
                return true;
            }

            return any === 0 && date > max[2];
        }
    };


    this.refresh = function (control) {

        control.__data = null;
        render(control);
    };
    

});




flyingon.fragment('f-tree-renderer', function (base) {


    this.unmount = function (control, remove) {

        this.__unmount_children(control);

        control.view_content = null;
        base.unmount.call(this, control, remove);
    };


    this.__children_patch = function (control, patch) {

        var view = control.view_content || control.view,
            last = view.lastChild;

        base.__children_patch.apply(this, arguments);

        //最后一个节点发生变化且是线条风格则需处理
        if (last !== view.lastChild && (last = last.firstChild) && 
            last.className.indexOf(' f-tree-node-last') >= 0)
        {
            remove_line(last, control.isTreeNode ? control.level() + 1 : 0);
        }
    };


    //移除节点线条
    function remove_line(node, level) {

        node.className = node.className.replace(' f-tree-node-last', '');

        node = node.nextSibling;
        node.className = node.className.replace(' f-tree-list-last', '');

        if (node = node.firstChild)
        {
            remove_background(node, level);
        }
    };


    //移除子节点线条背景
    function remove_background(node, level) {

        var dom;

        while (node)
        {
            if (dom = node.firstChild)
            {
                dom.children[level].style.background = '';

                if (dom = node.lastChild.firstChild)
                {
                    remove_background(dom, level);
                }
            }

            node = node.nextSibling;
        }
    };


});



flyingon.renderer('Tree', function (base) {



    this.__scroll_html = '';



    this.render = function (writer, control, className, cssText) {

        var storage = control.__storage || control.__defaults,
            length = control.length;
        
        writer.push('<div');
        
        this.renderDefault(writer, control, 
            (className || '') + 'f-tree-theme-' + storage.theme + 
                (!storage.checked ? ' f-tree-no-check' : '') + 
                (!storage.icon ? ' f-tree-no-icon' : ''));
        
        writer.push(' onclick="flyingon.Tree.onclick.call(this, event)">');

        if (length > 0 && control.__visible)
        {
            control.__content_render = true;
            this.__render_children(writer, control, control, 0, length);
        }

        //滚动位置控制(解决有右或底边距时拖不到底的问题)
        writer.push('</div>');
    };



    this.__render_children = function (writer, control, items, start, end) {

        var line = (control.__storage || control.__defaults).theme === 'line',
            format = control.format,
            last = control[control.length - 1],
            item;

        while (start < end)
        {
            if (item = items[start++])
            {
                item.view || item.renderer.render(writer, item, format, 0, item === last, line);
            }
        }
    };



    flyingon.Tree.onclick = function (e) {

        var tree = flyingon.findControl(this),
            dom = e.target || e.srcElement,
            node = flyingon.findControl(dom);

        while (dom && dom !== this)
        {
            switch (dom.getAttribute('tag'))
            {
                case 'folder':
                    tree[node.expanded ? 'collapse' : 'expand'](node);
                    return;

                case 'check':
                    node.checked(!node.checked());
                    return;

                case 'node':
                    tree.trigger('node-click', 'node', node);
                    tree.current(node);
                    return;

                default:
                    dom = dom.parentNode;
                    break;
            }
        }
    };


    
    flyingon.fragment('f-tree-renderer', this, base);


    this.mount = function (control, view) {

        var node = control.__current;

        base.mount.call(this, control, view);

        if (control.__content_render)
        {
            this.__mount_children(control, view, control, 0, control.length, view.firstChild);
        }

        node && node.view && setTimeout(function () {

            control.renderer.scrollTo(control, node);
            
        }, 500);
    };
    

    this.theme = function (control, view, value) {

        view.className = view.className.replace(/f-tree-theme-\w+/, 'f-tree-theme-' + value);
    };


    this.checked = function (control, view, value) {

        var name = view.className;

        if (value)
        {
            name = name.replace(' f-tree-no-check', '');
        }
        else
        {
            name += ' f-tree-no-check';
        }

        view.className = name;
    };


    this.icon = function (control, view, value) {

        var name = view.className;

        if (value)
        {
            name = name.replace(' f-tree-no-icon', '');
        }
        else
        {
            name += ' f-tree-no-icon';
        }

        view.className = name;
    };


    this.scrollTo = function (control, node) {

        var view = control.view,
            dom = node.view,
            y = view.scrollTop,
            top = dom.offsetTop,
            height;

        if (top < y)
        {
            view.scrollTop = top;
        }
        else if (top > y + (height = view.clientHeight))
        {
            view.scrollTop = top + dom.offsetHeight - height;
        }
    };


});



flyingon.renderer('TreeNode', function (base) {



    this.render = function (writer, node, format, level, last, line, space) {

        var encode = flyingon.html_encode,
            storage = node.__storage || node.__defaults,
            icon,
            text,
            any;

        node.rendered = true;

        writer.push('<div class="', encode(node.fullClassName), '">',
            '<div class="f-tree-node', 
                last && line ? ' f-tree-node-last' : '',
                node.__current ? ' f-tree-node-current': '',
                (any = storage.className) ? ' ' + encode(any) : '',
            (any = storage.id) ? '" id="' + encode(any) + '"' : '', '" tag="node">');

        if (space)
        {
            writer.push(space);
        }

        if (any = storage.delay)
        {
            storage.delay = false;
        }
        
        if (any || node.length > 0)
        {
            if (any || !node.expanded)
            {
                icon = 'f-tree-icon-close';
                writer.push('<span class="f-tree-folder f-tree-close" tag="folder"></span>');
            }
            else
            {
                icon = 'f-tree-icon-open';
                writer.push('<span class="f-tree-folder f-tree-open" tag="folder"></span>');
            }
        }
        else
        {
            icon = 'f-tree-icon-file';
            writer.push('<span class="f-tree-file"></span>');
        }

        text = (text = storage.text) ? encode(text) : '';

        if (format)
        {
            text = format(node, text);
        }

        writer.push('<span class="f-tree-check f-tree-', storage.checked ? 'checked' : 'unchecked', '" tag="check"></span>',
            '<span class="f-tree-icon ', storage.icon || icon, '" tag="icon"></span>',
            '<span class="f-tree-text" tag="text">', text, '</span></div>',
            '<div class="f-tree-list', last && line ? ' f-tree-list-last' : '', '">');

        if (node.expanded && node.length > 0)
        {
            this.__render_children(writer, node, node, 0, node.length, format, ++level, last, line);
        }

        writer.push('</div></div>');
    };


    //渲染子项
    this.__render_children = function (writer, node, items, start, end, format, level, last, line) {

        var item, space, any;

        node.__content_render = true;

        //如果未传入渲染参数则初始化渲染参数
        if (format === void 0 && (item = node.parent))
        {
            level = 1;
            last = item[item.length - 1] === node;
            
            do
            {
                if (item.isTreeNode)
                {
                    level++;
                }
                else
                {
                    format = item.format || null;
                    line = (item.__storage || item.__defaults).theme === 'line';
                    break;
                }
            }
            while (item = item.parent);
        }

        space = last && line ? ' style="background:none;"' : '';
        space = '<span class="f-tree-space"' + space + '></span>';

        if (level > 1)
        {
            space = new Array(level + 1).join(space);
        }

        any = items.length;
            
        while (start < end)
        {
            if (item = items[start++])
            {
                if (item.view)
                {
                    item.renderer.unmount(item);
                }

                item.renderer.render(writer, item, format, level, start === any, line, space);
            }
        }
    };

        
    
    flyingon.fragment('f-tree-renderer', this, base);


    this.mount = function (control, view) {

        var dom = control.view_content = view.lastChild;

        base.mount.call(this, control, view);

        if (control.__content_render)
        {
            this.__mount_children(control, view, control, 0, control.length, dom.firstChild);
        }
    };
    


    this.checked = function (node, view, value) {

        value = value ? 'checked' : (node.checkedChildren ? 'checked2' : 'unchecked');
        find_dom(view, 'check', 'f-tree-check f-tree-' + value);
    };


    this.icon = function (node, view, value) {

        find_dom(view, 'icon', 'f-tree-icon ' + value);
    };


    this.text = function (node, view, value) {

        var any;

        if (view = find_dom(view, 'text'))
        {
            while ((any = node.parent) && any.isTreeNode)
            {
                node = any;
            }

            if (any = node && node.format)
            {
                view.innerHTML = format(flyingon.html_encode(value));
            }
            else
            {
                view[this.__text_name] = value;
            }
        }
    };


    this.expand = function (node) {

        var view = node.view,
            folder = find_dom(view, 'folder'),
            icon = find_dom(view, 'icon'),
            any;

        if (node.length > 0)
        {
            if (folder)
            {
                folder.className = 'f-tree-folder f-tree-open';
            }

            if (icon)
            {
                icon.className = 'f-tree-icon f-tree-icon-open';
            }

            view = view.lastChild;

            if (!node.__content_render)
            {
                this.__render_children(any = [], node, node, 0, node.length);

                view.innerHTML = any.join('');

                this.__mount_children(node, view, node, 0, node.length, view.firstChild);
            }
            
            view.style.display = '';
        }
        else
        {
            if (folder)
            {
                folder.className = 'f-tree-file';
                folder.removeAttribute('tag');
            }

            if (icon)
            {
                icon.className = 'f-tree-icon f-tree-icon-file';
            }

            view.lastChild.style.display = 'none';
        }
    };


    this.collapse = function (node) {

        var view = node.view;

        view.lastChild.style.display = 'none';

        find_dom(view, 'folder', 'f-tree-folder f-tree-close');
        
        if (view = find_dom(view, 'icon'))
        {
            view.className = view.className.replace('f-tree-icon-open', 'f-tree-icon-close');
        }
    };


    function find_dom(view, tag, className) {

        var node = view.firstChild.lastChild;

        while (node)
        {
            if (node.getAttribute('tag') === tag)
            {
                if (className)
                {
                    node.className = className;
                }

                return node;
            }

            node = node.previousSibling;
        }
    };



    this.current = function (node, current) {

        var dom = node.view.firstChild,
            name = dom.className,
            key = ' f-tree-node-current';

        if (current)
        {
            if (name.indexOf(key) < 0)
            {
                dom.className += key;
            }
        }
        else
        {
            dom.className = name.replace(key, '');
        }
    };



});




flyingon.renderer('GridColumn', function (base) {



    this.render = function (writer, column, height) {

        var cells = column.__cells;

        if (cells[1])
        {
            render_multi(writer, column, cells, height);
        }
        else
        {
            render_header(writer, column, cells[0] || column.__set_title('')[0], 0, column.__size, height);
        }
    };



    function render_multi(writer, column, cells, height) {

        var width = column.__size,
            length = cells.length,
            y1 = 0,
            y2,
            cell;

        for (var i = 0; i < length; i++)
        {
            cell = cells[i];

            y2 = cell.__height;
            y2 = y2 > 0 ? y2 : (height / (length - i) | 0);
   
            render_header(writer, column, cell, y1, cell.__size || column.__size, y2);

            y1 += y2;
            height -= y2;
        }
    };



    function render_header(writer, column, cell, y, width, height) {

        cell.row = null;
        cell.column = column;
        cell.__as_html = true;

        cell.renderer.render(writer, cell, 'f-grid-cell' + column.fullClassName, 
            'left:' + column.__start +
            'px;top:' + y +
            'px;width:' + width + 
            'px;height:' + height + 
            'px;line-height:' + height + 'px;' + 
            (cell.columnSpan ? 'z-index:1;' : ''));
    };



    this.mount = function (column, view, fragment, tag) {

        var grid = column.grid,
            cells = column.__cells,
            index = 0,
            cell,
            node;

        column.view = true;

        while ((cell = cells[index++]) && (node = view.firstChild))
        {
            cell.parent = grid;
            cell.renderer.mount(cell, node);

            fragment.insertBefore(node, tag);
        }
    };


    this.unmount = function (column, cells) {

        var index = 0,
            cell;

        column.view = false;
        cells || (cells = column.__cells);

        while (cell = cells[index++])
        {
            if (cell.view)
            {
                cell.parent = null;
                cell.renderer.unmount(cell, false);
            }
        }
    };



    this.readonly = function (column, readonly) {


    };


    //计算网格高度
    this.__resize_height = function (column, height) {

        var cells = column.__cells,
            length = cells.length,
            index,
            cell,
            style,
            size,
            y;

        if (length > 1)
        {
            index = y = 0;

            while (cell = cells[index])
            {
                size = cell.__height;
                size = size > 0 ? size : height / (length - index) | 0;

                style = cell.view.style;
                style.top = y + 'px';
                style.height = style.lineHeight = size + 'px';

                y += size;
                height -= size;

                index++;
            }
        }
        else
        {
            style = cells[0].view.style;
            style.height = style.lineHeight = height + 'px';
        }
    };
    

});



flyingon.renderer('GridRow', function (base) {


    var id = 1;


    this.show = function (fragment, writer, row, columns, start, end, y, height, tag) {

        var cells = row.__cells,
            cell,
            view,
            style,
            column,
            any;

        if (!cells)
        {
            row.view = true; //标记已渲染
            cells = row.__cells = {};
        }

        while (start < end)
        {
            column = columns[start];
            any = column.__name || (column.__name = '__column_' + id++);

            if (cell = cells[any])
            {
                //处理树列
                if (column.__tree_cell)
                {
                    fragment.appendChild(view = row.view);
                    
                    if (cell.__top !== y)
                    {
                        view.style.top = y + 'px';
                    }

                    if (cell.__show_tag !== tag)
                    {
                        style = view.style;
                        style.left = column.__start +  'px';
                        style.height = ((any = cell.rowSpan) ? ++any * height : height) + 'px';
                    }
                }

                fragment.appendChild(view = cell.view);

                //自定义显示前处理
                if (any = column.onshowing)
                {
                    any.call(column, cell, row);
                }

                if (cell.__top !== y)
                {
                    view.style.top = (cell.__top = y) + 'px';
                }

                if (cell.__show_tag !== tag)
                {
                    cell.__show_tag = tag;

                    style = view.style;
                    style.left = column.__start + 'px';

                    any = (any = cell.columnSpan) ? column.__span_size(any) : 0;
                    style.width = column.__size + any + 'px';

                    style.height = ((any = cell.rowSpan) ? ++any * height : height) + 'px';
                }
            }
            else if (cell = this.render(writer, row, column, y, height))
            {
                cell.__top = y;
                cell.__show_tag = tag;
                cells[any] = cell;
            }

            start++;
        }
    };


    this.render = function (writer, row, column, y, height) {

        var cell = column.createControl(row, column.__name),
            width = column.__size,
            span,
            any;

        //自定义渲染单元格
        if (any = column.onrender)
        {
            any.call(column, cell, row, column);

            if (any = cell.rowSpan) 
            {
                if ((any |= 0) > 0)
                {
                    span = 1;
                    height += any * height;
                }
                else
                {
                    any = 0;
                }

                cell.rowSpan = any;
            }

            if (any = cell.columnSpan) 
            {
                if ((any |= 0) > 0)
                {
                    span = 1;
                    width += column.__span_size(any);
                }
                else
                {
                    any = 0;
                }

                cell.columnSpan = any;
            }
        }

        cell.row = row;
        cell.column = column;
        cell.__as_html = true;

        //自定义显示前处理
        if (any = column.onshowing)
        {
            any.call(column, cell, row);
        }

        if (column.__tree_cell)
        {
            this.render_tree(writer, row, column, y, height, cell);
        }

        any = (any = column.__align) ? 'text-align:' + any + ';' : '';

        if (span)
        {
            any += 'z-index:1;';
        }

        cell.renderer.render(writer, cell, 'f-grid-cell' + column.fullClassName 
                + (row.__checked ? ' f-grid-checked' : '')
                + (row.__current ? ' f-grid-current' : ''),
            'left:' + column.__start + 
            'px;top:' + y + 
            'px;width:' + width + 
            'px;height:' + height + 
            'px;line-height:' + height + 'px;' +
            any);

        return cell;
    };


    this.render_tree = function (writer, row, column, y, height, cell) {

        var expand = row.length > 0 ? (row.expanded ? 'expand' : 'collapse') : 'file',
            icon = column.__tree_icon,
            width = 16;

        if (icon)
        {
            width += 16;

            if (icon = column.grid.onicon)
            {
                icon = icon.call(column.grid, row, column);
            }

            if (!icon)
            {
                icon = 'f-grid-icon-' + expand;
            }
        }

        while (row = row.parent)
        {
            width += 16;
        }

        writer.push('<div class="f-grid-tree" style="',
                'left:' + column.__start + 
                'px;top:' + y + 
                'px;width:' + width + 
                'px;height:' + height + 
                'px;line-height:' + height + 'px;">' +
                '<span class="f-grid-', expand, '" tag="', expand, '"', '></span>',
                '<span class="f-grid-icon', icon ? ' ' + icon : '" style="display:none;', '"></span>',
            '</div>');

        cell.padding('0 2 0 ' + (width + 2));
    };


    this.mount = function (view, row, columns, start, end, fragment, tag) {

        var grid = row.grid,
            cells = row.__cells,
            column,
            cell,
            node,
            name;

        while (start < end)
        {
            if ((column = columns[start++]) && (name = column.__name) && (cell = cells[name]))
            {
                if (node = cell.view)
                {
                    tag = node.nextSibling || null;
                }
                else if (node = view.firstChild)
                {
                    if (column.__tree_cell)
                    {
                        fragment.insertBefore(node, tag);

                        row.view = node;
                        node.row = row;
                        node.column = column;

                        node = view.firstChild;
                    }

                    fragment.insertBefore(node, tag);

                    cell.parent = grid;
                    cell.renderer.mount(cell, node);
                }
            }
        }

        return tag;
    };


    this.unmount = function (row) {

        var cells = row.__cells,
            any;

        for (var name in cells)
        {
            if (any = cells[name])
            {
                any.parent = any.row = any.column = null;
                any.renderer.unmount(any, false);

                cells[name] = null;
            }
        }
    };


    this.checked = function (row, view, value) {

        set_class(row.__cells, ' f-grid-checked', value);
    };


    this.current = function (row, view, value) {

        set_class(row.__cells, ' f-grid-current', value);
    };


    function set_class(cells, name, set) {

        var cell;

        if (set)
        {
            for (var key in cells)
            {
                if (cell = cells[key])
                {
                    cell.view.className += name;
                }
            }
        }
        else
        {
            for (var key in cells)
            {
                if (cell = cells[key])
                {
                    cell.view.className = cell.view.className.replace(name, '');
                }
            }
        }
    };


});



flyingon.renderer('GroupGridRow', 'GridRow', function (base) {


    this.render = function (writer, row, column, y, height) {

        var cell = new flyingon.Label(),
            storage = column.__storage,
            summary = storage && storage.summary,
            fn,
            any;

        cell.__as_html = true;

        if (summary && (any = storage.name))
        {
            fn = column.__summary_fn || (column.__summary_fn = flyingon.Grid.summary(summary));
            any = row.compute(column, any, fn[0], fn[1]);

            if ((fn = column.onsummary) && (fn = fn.call(column, row, any, summary)))
            {
                any = fn;
            }
            else
            {
                any = summary + '=' + any.toFixed(storage.precision);
            }

            cell.text(any);
        }

        cell.renderer.render(writer, cell, 'f-grid-group-row',
            'left:' + column.__start + 
            'px;top:' + y + 
            'px;width:' + column.__size + 
            'px;height:' + height + 
            'px;line-height:' + height + 'px;');

        return cell;
    };


    this.unmount = function (row) {

        var view = row.view_group;

        base.unmount.call(this, row);

        if (view)
        {
            view.row = row.view_group = null;
        }
    };


});



flyingon.renderer('Grid', function (base) {



    //拖动列时的辅助线
    var dom_drag = document.createElement('div');

    //调整列宽时的辅助线
    var dom_resize = document.createElement('div');


    //textContent || innerText
    var text_name = this.__text_name;

    //是否禁止列头点击事件
    var click_disabled = false;

    //可输入标签
    var input_tag = 'input,select,textarea'.toUpperCase().split(',');

    //更新标记
    var update_tag = 1;

    //动态管理子节点的临时节点
    var dom_fragment = document.createDocumentFragment();

    //动态生成html片段的dom容器
    var dom_host = document.createElement('div');

    //html模板
    var template = '<div class="f-grid-center"></div>'
        + '<div class="f-grid-right" style="display:none;"></div>'
        + '<div class="f-grid-left" style="display:none;"></div>'
        + '<div class="f-grid-group" style="display:none;"></div>';



    this.padding = 0;


    
    //初始化dom
    dom_drag.innerHTML = '<div class="f-grid-drag-body"><div></div></div>';
    dom_drag.className = 'f-grid-drag';
    dom_drag.style.width = '20px';

    dom_resize.className = 'f-grid-resize-thumb';




    this.render = function (writer, grid, className, cssText) {

        var storage = grid.__storage || grid.__defaults,
            group = storage.group,
            header = storage.header,
            top = group + header,
            block = template;

        writer.push('<div');

        this.renderDefault(writer, grid, className, cssText);

        writer.push(' onclick="flyingon.Grid.onclick.call(this, event)" onkeydown="flyingon.Grid.onkeydown.call(this, event)">',
            '<div class="f-grid-head" onmousedown="flyingon.Grid.onmousedown.call(this, event)">',
                '<div class="f-grid-group-box" style="height:', group, 'px;line-height:', group, 'px;', group < 2 ? 'display:none;' : '', '"></div>',
                '<div class="f-grid-column-head" style="height:', header, 'px;', header < 2 ? 'display:none;' : '', '" onmouseover="flyingon.Grid.onmouseover.call(this, event)">', 
                    block,
                    '<div class="f-grid-resize" style="display:none;" onmousedown="flyingon.Grid.resize.call(this, event)"></div>',
                    '<div class="f-grid-sort" style="left:-100px;"></div>',
                '</div>',
                '<div class="f-grid-filter" style="display:none;">', block, '</div>',
            '</div>',
            '<div class="f-grid-scroll" style="top:', top, 'px;" onscroll="flyingon.Grid.onscroll.call(this)">',
                this.__scroll_html,
            '</div>',
            '<div class="f-grid-body" style="top:', top, 'px;" tabindex="0">',
                '<div class="f-grid-middle">', block, '</div>',
                '<div class="f-grid-bottom" style="display:none;">', block, '</div>',
                '<div class="f-grid-top" style="display:none;">', block, '</div>',
            '</div>',
        '</div>');
    };



    this.mount = function (grid, view) {

        var dom = view.firstChild,
            any;

        grid.view_group = any = dom.firstChild;
        grid.view_head = any = any.nextSibling;
        grid.view_resize = (grid.view_sort = any.lastChild).previousSibling;
        grid.view_filter = any.nextSibling;

        grid.view_scroll = any = dom.nextSibling;
        grid.view_body = any.nextSibling;

        base.mount.call(this, grid, view);

        grid.on('mousewheel', mousewheel);
        grid.on('change', change_event);
    };


    this.unmount = function (grid) {

        base.unmount.call(this, grid);
        grid.view_group = grid.view_head = grid.view_resize = grid.view_sort = 
        grid.view_filter = grid.view_scroll = grid.view_body = null;
    };

    
    function mousewheel(e) {

        this.view_scroll.scrollTop -= e.wheelDelta * 100 / 120;
        flyingon.dom_stop(e);
    };


    function change_event(e) {

        var control = e.target;

        if (control.__column_check)
        {
            control.row.checked(!control.row.__checked);
        }
        else
        {
            control.parent.__change_value(control);
        }
    };
    


    flyingon.Grid.onkeydown = function (e) {

        if (e.keyCode === 9)
        {
            setTimeout(sync_focus, 0);
        }
    };
    

    //同步使用tab造成焦点位置变化的问题
    function sync_focus() {

        var dom = document.activeElement,
            cell,
            grid,
            any,
            x;

        if (dom && (cell = flyingon.findControl(dom)))
        {
            grid = cell.parent;

            dom = cell.view;
            any = dom.parentNode;

            x = dom.offsetLeft;

            if (x < grid.scrollLeft || x + dom.offsetWidth > any.offsetWidth)
            {
                grid.view_scroll.scrollLeft = cell.column.__start;
            }

            if (dom.offsetTop + dom.offsetHeight > any.offsetHeight)
            {
                grid.view_scroll.scrollTop = dom.offsetTop;
            }
        }
    };



    flyingon.Grid.onclick = function (e) {

        if (click_disabled)
        {
            click_disabled = false;
        }
        else
        {
            var grid = flyingon.findControl(this),
                dom = e.target || e.srcElement,
                any;

            switch (dom.getAttribute('tag'))
            {
                case 'expand':
                    change_expand(grid, any = dom.parentNode.row, dom, 'collapse');
                    grid.__view.__collapse_row(any);
                    break;

                case 'collapse':
                    change_expand(grid, any = dom.parentNode.row, dom, 'expand');
                    grid.__view.__expand_row(any);
                    break;

                default:
                    if (any = flyingon.findControl(dom))
                    {
                        if (any.row) //数据行
                        {
                            grid.__set_current(any.row);
                        }
                        else if (any.column && !any.columnSpan && any.column.name()) //列头且无跨列
                        {
                            sort_column(grid, any);
                        }
                    }
                    break;
            }
        }
    };


    function change_expand(grid, row, dom, name) {

        dom.className = 'f-grid-' + name;
        dom.setAttribute('tag', name);

        if ((dom = dom.nextSibling) && dom.className.indexOf('f-grid-icon') >= 0)
        {
            var icon = grid.onicon;

            if (icon)
            {
                icon = icon.call(grid, row, dom.parentNode.column);
            }

            if (!icon)
            {
                icon = 'f-grid-icon-' + name;
            }

            dom.className = 'f-grid-icon ' + icon;
        }
    };


    function sort_column(grid, cell) {

        var dom = grid.view_sort,
            desc = dom.cell === cell && !dom.desc;

        dom.cell = cell;
        dom.desc = desc;
        dom.className = 'f-grid-sort' + (desc ? ' f-grid-sort-desc' : '');

        grid.sort(cell.column.name(), desc);

        sync_sort(dom);
    };


    function sync_sort(dom) {

        var cell = dom.cell,
            view,
            any;
            
        if (cell && (view = cell.view))
        {
            if (any = view.parentNode)
            {
                dom.style.left = any.offsetLeft + view.offsetLeft + view.offsetWidth - 18 + 'px';
                dom.style.top = view.offsetTop + (view.offsetHeight - 16 >> 1) + 'px';
            }
            else
            {
                dom.style.left = '-100px';
            }
        }
    };


    flyingon.Grid.onmouseover = function (e) {

        var dom = e.target || e.srcElement,
            grid,
            column,
            cell,
            any;

        if (dom.className.indexOf('f-grid-cell') >= 0 && 
            (cell = flyingon.findControl(dom)) &&
            (grid = flyingon.findControl(this)) &&
            (column = cell.column))
        {
            //处理跨列
            if (any = cell.columnSpan)
            {
                column = grid.__columns[column.__index + any];
            }

            if (column && column.resizable())
            {
                var head = grid.view_resize,
                    style = head.style;

                head.column = column;

                style.left = dom.parentNode.offsetLeft + dom.offsetLeft + dom.offsetWidth - 3 + 'px';
                style.top = dom.offsetTop + 'px';
                style.height = dom.offsetHeight + 'px';
                style.display = '';
            }
        }
    };


    flyingon.Grid.resize = function (e) {

        var grid = flyingon.findControl(this),
            left = 0,
            dom = this,
            any;

        grid.__column_dirty = true;
        grid.view.appendChild(e.dom = dom_resize);

        dom = grid.view_head;
        dom.style.cursor = 'ew-resize';

        any = e.dom.style;
        any.left = this.offsetLeft + (this.offsetWidth >> 1) + 1 + 'px';
        any.top = dom.offsetTop + 'px';
        any.bottom = grid.view_body.style.bottom;

        flyingon.dom_drag({

            grid: grid, 
            column: any = this.column,
            size: any.__size

        }, e, resize_start, do_resize, resize_end, 'y', false);
    };


    function resize_start() {

        click_disabled = true;
    };


    function do_resize(e) {

        var size = this.size;

        if (size + e.distanceX < 1)
        {
            e.distanceX = -size + 1;
        }
    };


    function resize_end(e) {

        var grid = this.grid,
            column = this.column,
            any = this.size + e.distanceX;

        click_disabled = false;

        grid.view_head.style.cursor = '';
        grid.view.removeChild(dom_resize);

        if (column.__size !== any)
        {
            column.storage().size = any;

            //触发列调整大小事件
            if (any = grid.oncolumnresize)
            {
                any.call(grid, column, storage.__size, this.size);
            }

            grid.update(true);
        }
    };



    flyingon.Grid.onmousedown = function (e) {

        var dom = e.target || e.srcElement,
            cell,
            any;

        if (input_tag.indexOf(dom.tagName) < 0)
        {
            if (any = dom.getAttribute('column-name'))
            {
                check_drag(this, dom, null, any, 1);
            }
            else
            {
                cell = flyingon.findControl(dom);

                while (cell)
                {
                    if (any = cell.column)
                    {
                        check_drag(this, dom, any, '', (cell.columnSpan | 0) + 1);
                        break;
                    }

                    cell = cell.parent;
                }
            }
        }
    };


    function check_drag(view, dom, column, name, count) {

        var grid = flyingon.findControl(view),
            from;

        if (column)
        {
            name = column.name();
        }
        else if (name && (column = grid.__columns.find(name)))
        {
             from = true;
        }
    
        column && column.draggable() && flyingon.dom_drag({

                grid: grid,
                column: column,
                dom: dom, 
                name: name,
                index: column.__index,
                count: count,
                from: from  //标记从分组框拖出
            },
            event,
            start_drag,
            do_drag,
            end_drag);
    };


    function start_drag(e) {

        var grid = this.grid,
            storage = grid.__storage || grid.__defaults,
            dom = this.dom,
            thumb = this.thumb = dom_drag,
            count = this.count,
            style,
            any;

        this.group = any = storage.group;
        this.header = storage.header;

        any = grid.view.firstChild.getBoundingClientRect();

        this.left = any.left;
        this.top = any.top;

        //从分组框拖出
        if (this.from)
        {
            dom.style.cssText = 'position:absolute;z-index:2;left:' 
                + dom.offsetLeft + 'px;top:' 
                + dom.offsetTop + 'px;';

            any = grid.__groups;
            any.splice(any.indexOf(this.name), 1);

            //清空原分组信息避免拖动结束后无法设置groups
            grid.__storage.groups = ' ';
        }
        else //拖动列
        {
            any = dom.cloneNode(true);

            style = any.style;
            style.borderWidth = '1px';
            style.left = dom.offsetLeft + dom.parentNode.offsetLeft + 'px';
            style.top = dom.offsetTop + dom.parentNode.parentNode.offsetTop + 'px';

            dom = any;

            //隐藏列头
            any = grid.__columns;

            while (count--)
            {
                any[this.index + count].__visible = false;
            }

            grid.update(true);
        }

        e.dom = dom;
        dom.style.zIndex = 2;

        any = grid.view.firstChild;
        any.appendChild(thumb);
        any.appendChild(dom);
        
        click_disabled = true;
    };


    function do_drag(event) {

        var grid = this.grid,
            style = this.thumb.style,
            x = event.clientX - this.left,
            y = event.clientY - this.top,
            view,
            height;

        //拖动到分组框
        if (this.to = this.name && y < this.group)
        {
            y = 4;
            height = this.group - 8;

            if (grid.__groups)
            {
                x = group_index(this, grid.view_group, x);
            }
            else
            {
                this.at = 0;
                x = 8;
            }
        }
        else //拖到列区
        {
            x = column_index(this, grid, x);
            y = this.group;
            height = this.header;
        }

        style.left = x - 11 + 'px';
        style.top = y + 'px';
        style.height = height + 'px';
    };


    function group_index(context, dom, x) {

        var index = 0,
            left = 0,
            width = 0;

        dom = dom.firstChild;

        while (dom)
        {
            left = dom.offsetLeft;
            width = dom.offsetWidth;

            if (left + (width >> 1) > x)
            {
                context.at = index;
                return left - 4;
            }

            if (left + width > x)
            {
                break;
            }

            index++;
            dom = dom.nextSibling;
        }

        context.at = index;
        return left + width + 4;
    };


    function column_index(context, grid, x) {

        var columns = grid.__columns,
            locked = columns.__locked,
            start = locked[0],
            end = columns.length,
            offset = 0,
            left = 0,
            size = 0,
            column;

        //在左锁定区
        if (start && locked[2] > x)
        {
            end = start;
            start = 0;
        }
        else if (locked[1] && x > (offset = columns.__arrange_size - locked[3])) //在右锁定区
        {
            start = end - locked[1];
            x += offset;
        }
        else //滚动区域
        {
            offset = -grid.scrollLeft | 0;
            x -= offset;
        }

        console.log(columns[2].__visible);

        while (start < end)
        {
            column = columns[start++];

            if (column.__visible)
            {
                left = column.__start;
                size = column.__size;

                if (left + (size >> 1) > x)
                {
                    context.at = start - 1;
                    return left + offset;
                }

                if (left + size > x)
                {
                    break;
                }
            }
        }

        context.at = start;
        return left + size + offset;
    };

    
    function end_drag(event) {

        var grid = this.grid,
            columns = grid.__columns,
            index = this.index,
            count = this.count,
            list = [],
            any;

        click_disabled = false;

        if (any = this.thumb)
        {
            any.parentNode.removeChild(any);
        }

        if (any = event.dom)
        {
            any.parentNode.removeChild(any);
        }

        //拖到分组框
        if (this.to)
        {
            for (var i = 0; i < count; i++)
            {
                list.push(columns[index + i].name());
            }

            if (any = grid.__groups)
            {
                any.splice(this.at, 0, list.join(' '));
                any = any.join(' ');
            }
            else
            {
                any = list.join(' ');
            }

            grid.groups(any);
        }
        else 
        {
            //从分组框拖出时需同步分组
            if (this.from)
            {
                grid.groups(grid.__groups.join(' '));
            }

            //显示列
            for (var i = 0; i < count; i++)
            {
                columns[index + i].__visible = true;
            }

            //如果顺序发生变化则调整列顺序
            if (this.at !== index)
            {
                reorder_column(columns, this.at, index, count);
            }

            grid.update(true);
        }
    };


    //调整列顺序
    function reorder_column(columns, newIndex, oldIndex, count) {

        var splice = [].splice,
            list = splice.call(columns, oldIndex, count || (count = 1));

        if (list[0])
        {
            if (newIndex > oldIndex)
            {
                newIndex -= count;
            }

            if (list[1])
            {
                list.unshift(newIndex, 0);
                splice.apply(columns, list);
            }
            else
            {
                splice.call(columns, newIndex, 0, list[0]);
            }
        }
    };



    flyingon.Grid.onscroll = function () {

        var grid = flyingon.findControl(this),
            x = this.scrollLeft,
            y = this.scrollTop;

        if (grid.scrollLeft !== x)
        {
            grid.renderer.__do_hscroll(grid, grid.scrollLeft = x);
            sync_sort(grid.view_sort);
        }

        if (grid.scrollTop !== y)
        {
            grid.renderer.__do_vscroll(grid, grid.scrollTop = y);
        }
    };



    this.locate = function (grid) {

        base.locate.call(this, grid);
        this.content(grid, grid.view);
    };


    this.locate_html = function (grid) {


    };



    //列头大小发生变化
    this.header = function (grid, view, value) {

        var columns = grid.__columns,
            storage = grid.__storage || grid.__defaults,
            group = storage.group,
            header = storage.header,
            style;

        grid.view_body.style.top = grid.view_scroll.style.top = group + header + 'px';

        if (value > 1)
        {
            style = grid.view_head.style;
            style.display = header > 1 ? '' : 'none';
            style.height = header + 'px';

            for (var i = columns.length - 1; i >= 0; i--)
            {
                var column = columns[i];

                if (column.view)
                {
                    column.renderer.__resize_height(column, header);
                }
            }
        }
        else
        {
            style = grid.view_group.style;
            style.display = group > 1 ? '' : 'none';
            style.height = style.lineHeight = group + 'px';
        }
    };


    //内容发生变化
    this.content = function (grid, view) {

        this.show(grid,
            grid.scrollLeft | 0,
            grid.scrollTop | 0,
            grid.offsetWidth - grid.borderLeft - grid.borderRight,
            grid.offsetHeight - grid.borderTop - grid.borderBottom);
    };



    //显示指定范围的表格内容
    this.show = function (grid, x, y, width, height) {

        var storage = grid.__storage || grid.__defaults,
            columns = grid.__columns,
            rows = grid.__rows,
            height = grid.offsetHeight - grid.borderTop - grid.borderBottom,
            any;

        //显示分组
        if ((any = storage.group) > 0)
        {
            height -= any;
        }

        //计算列宽度
        any = columns.__arrange_size !== width;

        if (grid.__column_dirty || any && columns.__persent)
        {
            grid.__column_dirty = false;

            columns.__show_tag = update_tag++;
            columns.__compute_size(width);
            columns.__compute_visible(x);
        }
        else if (any || columns.__arrange_start !== x)
        {
            columns.__arrange_size = width;
            columns.__compute_visible(x);
        }

        //控制水平滚动条
        if (columns.__size > width)
        {
            any = flyingon.hscroll_height;
            height -= any;
        }
        else
        {
            any = 1;
        }

        grid.view_body.style.bottom = any + 'px';
        grid.view_scroll.firstChild.style.width = columns.__size + 'px';

        //显示列头
        if ((any = storage.header) > 0)
        {
            height -= any;
            this.__show_header(grid, columns, any);
        }

        //显示过滤栏
        if ((any = storage.filter) > 0)
        {
            height -= any;
            this.__show_filter(grid, columns, any);
        }

        //显示内容
        any = this.__show_body(grid, grid.currentView(), height);

        //排列横向锁定区域
        this.__layout_locked(grid, columns.__locked, any);
    };



    //显示列头
    this.__show_header = function (grid, columns, height) {

        var view = grid.view_head.children[3],
            locked = columns.__locked,
            any;

        //group
        view = view.previousSibling;

        //left lock
        if (any = locked[0])
        {
            this.show_header(view, columns, 0, any, height);
        }

        //right lock
        view = view.previousSibling;

        if (any = locked[1])
        {
            this.show_header(view, columns, columns.length - any, columns.length, height);
        }

        //scroll
        this.show_header(view.previousSibling, columns, columns.__show_start, columns.__show_end, height);

        //sort arrow
        sync_sort(grid.view_sort);
    };



    //排列横向锁定区域
    this.__layout_locked = function (grid, locked, vscroll) {

        var view = grid.view_head,
            left = locked[2],
            right = locked[3],
            group = grid.__group_size,
            scroll = grid.scrollLeft | 0;

        if (vscroll = vscroll && right > 0)
        {
            right += 1;
        }

        layout_locked(view, left, vscroll ? right + flyingon.vscroll_width : right, group, scroll);

        layout_locked(view = grid.view_body.firstChild, left, right, group, scroll);
        layout_locked(view = view.nextSibling, left, right, group, scroll);
        layout_locked(view.nextSibling, left, right, group, scroll);
    };


    function layout_locked(view, left, right, group, scroll) {

        var dom = view.firstChild,
            style = dom.style;

        //center
        style[flyingon.rtl ? 'right' : 'left'] = -scroll + 'px';

        //right
        dom = dom.nextSibling;
        style = dom.style;

        if (right > 0)
        {
            style.width = right + 'px';
            style.display = '';
        }
        else
        {
            style.display = 'none';
        }

        //left
        dom = dom.nextSibling;
        style = dom.style;

        if (left > 0)
        {
            style.width = left + 'px';
            style.display = '';
        }
        else
        {
            style.display = 'none';
        }

        //group
        style = dom.nextSibling.style;

        if (group > 0)
        {
            style.width = group + 'px';
            style.display = '';
        }
        else
        {
            style.display = 'none';
        }
    };



    //显示列头
    this.show_header = function (view, columns, start, end, height) {

        var writer = [],
            tag = columns.__show_tag,
            fragment = dom_fragment,
            index = start,
            column,
            node,
            tag,
            style,
            cells,
            cell,
            any;

        while (index < end)
        {
            if ((column = columns[index++]).__visible)
            {
                if (column.view)
                {
                    any = 0;
                    cells = column.__cells;

                    if (style = column.__show_tag !== tag)
                    {
                        column.__show_tag = tag;
                    }

                    while (cell = cells[any++])
                    {
                        fragment.appendChild(node = cell.view);

                        if (style)
                        {
                            style = node.style;
                            style.left = column.__start + 'px';
                            style.width = (cell.__size || column.__size) + 'px';
                        }
                    }
                }
                else
                {
                    column.__show_tag = tag;
                    column.renderer.render(writer, column, height);
                }
            }
        }

        if (writer[0])
        {
            any = dom_host;
            any.innerHTML = writer.join('');

            tag = fragment.firstChild;

            while (start < end)
            {
                if ((column = columns[start++]).__visible)
                {
                    if (node = column.view)
                    {
                        tag = node.nextSibling || null;
                    }
                    else
                    {
                        column.renderer.mount(column, any, fragment, tag);
                    }
                }
            }
        }

        //移除原来显示的节点
        while (any = view.lastChild)
        {
            view.removeChild(any);
        }

        view.appendChild(fragment);
    };


    //显示过滤栏
    this.__show_filter = function (grid, column, height) {

    };


    //显示内容
    this.__show_body = function (grid, rows, height) {

        var view = grid.view_body.lastChild,
            storage = grid.__storage || grid.__defaults,
            start = grid.__locked_top,
            end = rows.length,
            rowHeight = rows.__row_height = storage.rowHeight,
            tree = storage.treeColumn,
            size = end * rowHeight,
            vscroll = size > height,
            any;

        //记录是否树列
        if (any = tree && grid.__columns.find(tree))
        {
            any.__tree_cell = true;
            any.__tree_icon = storage.treeIcon;
        }

        grid.view_scroll.firstChild.style.height = (size || 1) + 'px';
        grid.view_body.style[flyingon.rtl ? 'left' : 'right'] = (vscroll ? flyingon.vscroll_width : 0) + 'px';

        //显示顶部锁定
        if (start > 0)
        {
            view.style.display = '';
            view.style.height = (size = start * rowHeight) + 'px';

            height -= size;

            this.__show_rows(grid, view, rows, 0, start);
        }
        else
        {
            size = 0;
            view.style.display = 'none';
        }

        //显示底部锁定
        view = view.previousSibling;

        if ((any = grid.__locked_bottom) > 0)
        {
            view.style.display = '';
            view.style.height = (size = any * rowHeight) + 'px';

            height -= size;

            this.__show_rows(grid, view, rows, end - any, end);
            end -= any;
        }
        else
        {
            view.style.display = 'none';
        }

        //调整滚动区位置
        view = view.previousSibling;
        view.style.top = -(grid.scrollTop | 0) + 'px';

        //显示滚动区
        rows.__arrange_size = height;

        if (vscroll)
        {
            this.__visible_rows(grid, rows, grid.scrollTop | 0);
        }
        else
        {
            rows.__show_start = start;
            rows.__show_end = end;
        }

        this.__show_rows(grid, view, rows, rows.__show_start, rows.__show_end, true);

        return vscroll;
    };


    //计算行滚动行显示范围
    this.__visible_rows = function (grid, rows, top, scroll) {

        var start = grid.__locked_top,
            end = rows.length - grid.__locked_bottom,
            rowHeight = rows.__row_height,
            any;

        if (top > 0)
        {
            start += top / rowHeight | 0;
        }

        any = (rows.__arrange_size / rowHeight) | 0;
        any += start + 3; //多渲染部分行以减少滚动处理

        if (any < end)
        {
            end = any;
        }

        if (scroll && rows.__show_start <= start && rows.__show_end >= end)
        {
            return true;
        }

        if (any = grid.onrowstart)
        {
            any = any.call(grid, rows, start);

            if (any >= 0)
            {
                start = 0;
            }
        }
        
        rows.__show_start = start;
        rows.__show_end = end;
    };


    //显示表格行集
    this.__show_rows = function (grid, view, rows, start, end, scroll) {

        var columns = grid.__columns,
            locked = columns.__locked,
            rowHeight = rows.__row_height,
            column_start = locked[0],
            column_end = columns.length,
            top = scroll ? start * rowHeight : 0,
            any;

        //group
        view = view.lastChild;

        if (any = grid.__group_size)
        {
            this.show_group(grid, view, rows, start, end, top, rowHeight);
        }
        else if (view.firstChild)
        {
            view.innerHTML = ''; //销毁原分组行视图
        }

        //left lock
        view = view.previousSibling;

        if (column_start)
        {
            this.show_rows(grid, view, rows, start, end, columns, 0, column_start, top, rowHeight);
        }
        else if (view.firstChild)
        {
            view.innerHTML = '';
        }

        //right lock
        view = view.previousSibling;

        if (any = locked[1])
        {
            this.show_rows(grid, view, rows, start, end, columns, column_end - any, column_end, top, rowHeight);
        }
        else if (view.firstChild)
        {
            view.innerHTML = '';
        }

        //scroll
        this.show_rows(grid, view.previousSibling, rows, start, end, columns, columns.__show_start, columns.__show_end, top, rowHeight);
    };


    //显示表格行
    this.show_rows = function (grid, view, rows, start, end, columns, column_start, column_end, top, height) {

        var writer = [], 
            tag = columns.__show_tag,
            fragment = dom_fragment, 
            row, 
            any;

        for (var i = start; i < end; i++)
        {
            if (row = rows[i])
            {
                row.__show_index = i; //记录显示行索引以便于事件处理
                row.renderer.show(fragment, writer, row, columns, column_start, column_end, top, height, tag);

                top += height;
            }
        }

        if (writer[0])
        {
            any = dom_host;
            any.innerHTML = writer.join('');

            tag = fragment.firstChild;

            for (var i = start; i < end; i++)
            {
                tag = (row = rows[i]).renderer.mount(any, row, columns, column_start, column_end, fragment, tag);
            }
        }

        while (any = view.lastChild)
        {
            view.removeChild(any);
        }

        view.appendChild(fragment);
    };


    //显示分组行头
    this.show_group = function (grid, view, rows, start, end, top, height) {

        var writer = [],
            fragment = dom_fragment,
            tag = grid.__columns.__show_tag,
            size = grid.__group_size,
            fn = grid.ongroup,
            index = start,
            row,
            node,
            text,
            any;

        while (index < end)
        {
            if (row = rows[index])
            {
                if (row.__group_row)
                {
                    //记录行索引以支持事件定位
                    row.__show_index = index;

                    text = any = fn && fn(row) || row.text + ' (' + row.total + ')';

                    if (node = row.view_group)
                    {
                        fragment.appendChild(node);

                        if (row.__text !== text)
                        {
                            node.firstChild.nextSibling[text_name] = row.__text = text;
                        }

                        if (row.__top !== top)
                        {
                            node.style.top = (row.__top = top) - 1 + 'px';
                        }
                    }
                    else
                    {
                        writer.push('<div class="f-grid-group-row" style="top:', (row.__top = top) - 1, 
                                'px;height:', height + 1, 
                                'px;line-height:', height, 
                                'px;min-width:', size, 'px;',
                                'px;text-align:left;">',
                            '<span class="f-grid-', row.expanded ? 'expand" tag="expand"' : 'collapse" tag="collapse"',
                            ' style="margin-left:', row.level * 20, 'px;"></span>',
                            '<span> ', row.__text = text, '</span>', 
                            '<div class="f-grid-group-line" style="top:0;bottom:auto;"></div>',
                            '<div class="f-grid-group-line"></div>',
                        '</div>');
                    }
                }

                top += height;
            }

            index++;
        }

        view.style.height = top + 'px';

        if (writer[0])
        {
            any = dom_host;
            any.innerHTML = writer.join('');

            tag = fragment.firstChild;

            while (start < end)
            {
                if ((row = rows[start]) && row.__group_row)
                {
                    if (node = row.view_group)
                    {
                        tag = node.nextSibling || null;
                    }
                    else
                    {
                        node = any.firstChild;
                        node.row = row;
                        row.view_group = node;

                        fragment.insertBefore(node, tag);
                    }
                }

                start++;
            }
        }

        while (any = view.lastChild)
        {
            view.removeChild(any);
        }

        view.appendChild(fragment);
    };



    //渲染分组框
    this.__render_group = function (grid) {

        var writer = [],
            groups = grid.__groups,
            columns = grid.__columns,
            column,
            cells,
            name;

        if (groups)
        {
            for (var i = 0, l = groups.length; i < l; i++)
            {
                if (column = columns.find(name = groups[i]))
                {
                    column.__visible = false;
                    cells = column.__cells;

                    writer.push('<span class="f-grid-group-cell" column-name="', name, '">', 
                            column.__find_text() || name, 
                        '</span>');
                }
            }
        }
        else
        {
            writer.push('<span class="f-information">', flyingon.i18ntext('grid.group'), '</span>');
        }

        grid.view_group.innerHTML = writer.join('');
    };



    //处理水平滚动
    this.__do_hscroll = function (grid, left) {

        var columns = grid.__columns,
            view = grid.view_head.firstChild,
            height = (grid.__storage || grid.__defaults).header,
            name = flyingon.rtl ? 'right' : 'left',
            scroll = -left + 'px',
            update = !columns.__compute_visible(left, true), //计算可见列范围并获取是否超出上次的渲染范围
            start = columns.__show_start,
            end = columns.__show_end;

        //重渲染列头
        if (height > 0)
        {
            //控制滚动位置
            view.style[name] = scroll;

            //超出上次渲染的范围则重新渲染
            if (update)
            {
                this.show_header(view, columns, start, end, height);
            }
        }

        view = grid.view_body.firstChild;
        view.firstChild.style[name] = scroll;

        view = view.nextSibling;
        view.firstChild.style[name] = scroll;

        view.nextSibling.firstChild.style[name] = scroll;

        if (update)
        {
            var rows = grid.currentView(),
                any;
            
            select_cache(grid, true);

            view =  grid.view_body.firstChild;
            height = rows.__row_height;

            if (any = grid.__locked_top)
            {
                this.show_rows(grid, view.nextSibling.firstChild, rows, 0, any, columns, start, end, 0, height);
            }

            if (any = grid.__locked_bottom)
            {
                this.show_rows(grid, view.nextSibling.nextSibling.firstChild, rows, rows.length - any, rows.length, columns, start, end, 0, height);
            }

            this.show_rows(grid, view.firstChild, rows, any = rows.__show_start, rows.__show_end, columns, start, end, any * height, height);
        
            select_cache(grid);
        }
    };


    //处理竖直滚动
    this.__do_vscroll = function (grid, top) {

        var rows = grid.currentView(),
            view = grid.view_body.firstChild;

        select_cache(grid, true);
            
        view.style.top = -top + 'px';

        if (!this.__visible_rows(grid, rows, top, true))
        {
            this.__show_rows(grid, view, rows, rows.__show_start, rows.__show_end, true);
        }

        select_cache(grid);
    };



    function select_cache(grid, start) {

        var view = grid.view_body,
            dom = document.activeElement, 
            any;

        if (start)
        {
            any = dom;

            while (any = any.parentNode)
            {
                if (any === view)
                {
                    select_cache.dom = dom;
                    view.focus();
                    return;
                }
            }
        }
        else if (any = select_cache.dom)
        {
            if (dom === view)
            {
                any.focus();
            }
            else
            {
                select_cache.dom = null;
            }
        }
    };



});




flyingon.renderer('Tab', function (base) {




    this.__scroll_html = '';




    this.render = function (writer, control, className, cssText) {

        var storage = control.__storage || control.__defaults,
            any;

        control.__content_render = true;

        writer.push('<div');
        
        this.renderDefault(writer, control, (className || '') + 'f-tab-direction-' + storage.direction, cssText);
        
        writer.push('><div class="f-tab-head f-tab-theme-', storage.theme, '">',
                    '<div class="f-tab-line"></div>',
                    '<div class="f-tab-content"></div>',
                    '<div class="f-tab-move f-tab-forward" onclick="flyingon.Tab.forward.call(this)"><a class="f-tab-move-link"><span class="f-tab-move-icon"></span></a></div>',
                    '<div class="f-tab-move f-tab-back" onclick="flyingon.Tab.back.call(this)"><a class="f-tab-move-link"><span class="f-tab-move-icon"></span></a></div>',
                '</div>',
            '<div class="f-tab-body">');

        if (any = control.selectedPage())
        {
            any.renderer.render(writer, any, false); 
        }

        writer.push('</div></div>');
    };



    flyingon.Tab.forward = function () {

        var control = control = flyingon.findControl(this);

        if ((control.__scroll_header -= 100) < 0)
        {
            control.__scroll_header = 0;
        }

        update_header(control);
    };


    flyingon.Tab.back = function () {

        var control = control = flyingon.findControl(this);

        control.__scroll_header += 100;
        update_header(control);
    };



    this.mount = function (control, view) {

        var page = control.selectedPage();

        base.mount.call(this, control, view);
        
        this.__insert_head(control);

        if (page)
        {
            page.renderer.mount(page, view.lastChild.firstChild);
        }
    };


    this.unmount = function (control, remove) {

        this.__unmount_children(control);
        base.unmount.call(this, control, remove);
    };



    this.selected = function (control, view, page) {

        //移动到当前位置
        var storage = control.__storage || control.__defaults,
            size = storage.size,
            space = storage.space,
            head,
            start;

        if (!page.view)
        {
            view.lastChild.appendChild(page.renderer.createView(page, false));
            page.renderer.locate(page);
        }

        head = page.view_head;

        if (size > 0)
        {
            start = control.indexOf(page) * (size + space);
        }
        else if ('left,right'.indexOf(storage.direction) >= 0)
        {
            size = head.offsetWidth;
            start = head.offsetTop - space;
        }
        else
        {
            size = head.offsetHeight;
            start = head.offsetLeft - space;
        }

        view = view.firstChild.firstChild.nextSibling;
        space = -view.offsetLeft;

        //如果起始位置在可见区或可见区的右边
        if (start > space)
        {
            //如果整个页头在可见区则不调整位置
            size = head.offsetLeft + size;
            start = view.parentNode.offsetWidth;

            if (size < space + start)
            {
                return;
            }

            start = size - start + 80; //后移一点方便点击后一节点
        }
        else if ((start -= 50) < 0) //前移一点方便点击前一节点
        {
            start = 0;
        }

        if (control.__scroll_header !== start)
        {
            control.__scroll_header = start;
            control.__update_dirty || update_header(control);
        }
    };


    //页签风格变更处理
    this.theme = function (control, view, value) {

        view.className = view.className.replace(/f-tab-type-\w+/, 'f-tab-type-' + value);
    };

    

    this.__insert_head = function (control) {

        var view = control.view.firstChild.firstChild.nextSibling,
            item, 
            node, 
            tag;        
            
        //处理插入带view的节点
        for (var i = control.length - 1; i >= 0; i--)
        {
            if (item = control[i])
            {
                if (node = item.view_head)
                {
                    if (node.parentNode === view)
                    {
                        tag = node;
                        continue;
                    }
                }
                else
                {
                    item.renderer.__render_header(item);
                    node = item.view_head;
                }

                if (tag)
                {
                    view.insertBefore(node, tag);
                }
                else
                {
                    view.appendChild(node);
                }

                tag = node;
            }
        }
    };


    this.__insert_patch = function (control, index, items) {

        this.__insert_head(control);
    };


    this.__remove_patch = function (control, items) {

        var view = control.view.firstChild.firstChild.nextSibling,
            index = 0, 
            item,
            any;

        while (item = items[index++])
        {
            //移除节点且还未移除视图
            if (item.parent !== control && (any = item.view_head) && (any.parentNode === view))
            {
                view.removeChild(any);
            }
        }

        base.__remove_patch.apply(this, arguments);
    };



    this.locate = function (control) {

        var page = control.selectedPage();

        base.locate.call(this, control);
        
        if (control.__reset_header)
        {
            control.__reset_header = false;
            reset_header(control);
        }

        if (control.length > 0)
        {
            if (control.header() > 0)
            {
                update_header(control);
            }

            this.__arrange(control);
        }

        if (page)
        {
            if (!page.view)
            {
                control.view.lastChild.appendChild(page.renderer.createView(page, false));
            }

            page.renderer.locate(page);
        }

        control.__arrange_dirty = 0;
    };


    
    function update_header(control) {

        var view = control.view.firstChild.firstChild.nextSibling,
            node = view.firstChild,
            length = control.length,
            name = flyingon.rtl ? 'right' : 'left',
            storage = control.__storage || control.__defaults,
            vertical = 'left,right'.indexOf(storage.direction) >= 0,
            space = storage.space,
            style, //默认样式
            total, //容器空间
            size,
            any;

        any = storage.header - storage.offset;

        if (vertical)
        {
            style = 'margin-top:' + space + 'px;width:' + any + 'px;line-height:' + (storage.size - 2) + 'px;';
            total = control.offsetHeight - control.borderTop - control.borderBottom - storage.start;
        }
        else
        {
            style = 'margin-' + name + ':' + space + 'px;height:' + any + 'px;line-height:' + (any - 2) + 'px;';
            total = control.offsetWidth - control.borderLeft - control.borderRight - storage.start;
        }

        //充满可用空间
        if (storage.fill)
        {
            //计算可用大小
            total -= space * (length + 1) + storage.end;

            any = style + (vertical ? 'height:' : 'width:');

            while (node)
            {
                size = total / length | 0;
                node.style.cssText = any + size + 'px;';

                node = node.nextSibling;

                length--;
                total -= size;
            }
            
            length = 0;
        }
        else
        {
            any = (size = storage.size) > 0 ? size + 'px;' : 'auto;';

            if (vertical)
            {
                style += 'height:' + any + 'margin-top:' + space + 'px;';
            }
            else
            {
                style += 'width:' + any + 'margin-' + name + ':' + space + 'px;';
            }

            while (node)
            {
                node.style.cssText = style;
                node = node.nextSibling;
            }

            if (size > 0)
            {
                length = (size + space) * length + space;
            }
            else
            {
                length = (vertical ? view.offsetHeight : view.offsetWidth) + space;
            }
        }

        //有滚动条
        if ((any = length - total) > 0)
        {
            any += storage.scroll - 1;

            if (control.__scroll_header > any)
            {
                control.__scroll_header = size = any;
            }
            else
            {
                size = control.__scroll_header - storage.scroll + 1;
            }
        }
        else
        {
            control.__scroll_header = size = any = 0;
        }

        view.style[vertical ? 'top' : name] = -(storage.start + size) + 'px';

        node = view.nextSibling;
        node.style.display = node.nextSibling.style.display = any > 0 ? '' : 'none';
    };


    //重算页头
    function reset_header(control) {

        var view = control.view,
            storage = control.__storage || control.__defaults,
            style1 = view.firstChild.style, //head
            style2 = view.lastChild.style, //body
            direction = storage.direction,
            header = storage.header,
            text = ':' + header + 'px',
            any;

        view.className = view.className.replace(/f-tab-direction-\w+/, 'f-tab-direction-' + direction);
        
        switch (direction)
        {
            case 'left':
                style1.cssText = 'right:auto;width' + text;
                style2.cssText = direction + text;
                text = 'height';
                break;

            case 'right':
                style1.cssText = 'left:auto;width' + text;
                style2.cssText = direction + text;
                text = 'height';
                break;

            case 'bottom':
                style1.cssText = 'top:auto;height' + text;
                style2.cssText = direction + text;
                text = 'width';
                break;

            default:
                style1.cssText = 'bottom:auto;height' + text;
                style2.cssText = direction + text;
                text = 'width';
                break;
        }

        if (header > 0)
        {
            view = view.firstChild.firstChild;

            if (view = view.nextSibling)
            {
                view.style.cssText = any = direction + ':' + storage.offset + 'px';
                text = text + ':' + storage.scroll + 'px;display:none;' + any;
                
                while (view = view.nextSibling)
                {
                    view.style.cssText = text;
                }
            }

            style1.display = '';
        }
        else
        {
            style1.display ='none';
        }
    };


    this.__arrange = function (control) {
        
        var storage = control.__storage || control.__defaults,
            header = storage.header,
            width = control.offsetWidth - control.borderLeft - control.borderRight - control.paddingLeft - control.paddingRight,
            height = control.offsetHeight - control.borderTop - control.borderBottom - control.paddingTop - control.paddingBottom;

        if (header > 0)
        {
            if ('left,right'.indexOf(storage.direction) >= 0)
            {
                width -= header;
            }
            else
            {
                height -= header;
            }
        }

        for (var i = control.length - 1; i >= 0; i--)
        {
            var item = control[i];

            item.measure(width, height, width, height, 3);
            item.locate(0, 0);
        }
    };



});



flyingon.renderer('TabPage', 'Panel', function (base) {



    this.__render_header = function (control) {

        var node = control.view_head = document.createElement('span'),
            writer = [],
            encode = flyingon.html_encode,
            storage = control.__storage || control.__defaults,
            any;

        node.className = 'f-tab-item' + (control.selected() ? ' f-tab-selected' : '');

        writer.push('<a class="f-tab-link">',
            '<span class="f-tab-icon ', (any = storage.icon) ? encode(any) : 'f-tab-icon-none', '"></span>',
            '<span class="f-tab-text">', (any = storage.text) ? encode(any) : '', '</span>');

        if ((any = storage.buttons) && (any = encode(any).replace(/(\w+)\W*/g, '<span class="f-tab-button $1" tag="button"></span>')))
        {
            writer.push(any);
        }

        writer.push('<span class="f-tab-close"', storage.closable ? '' : ' style="display:none"', ' tag="close"></span>',
            '</a>');

        node.innerHTML = writer.join('');
        
        node.page = control;
        node.onclick = onclick;
    };


    function onclick(e) {

        var page = this.page,
            target = (e || (e = window.event)).target || e.srcElement;

        while (target && target !== this)
        {
            switch (target.getAttribute('tag'))
            {
                case 'close':
                    page.remove();
                    return;

                case 'button':
                    this.trigger('button-click', 'page', page);
                    return;
            }

            target = target.parentNode;
        }

        page.parent.selectedPage(page, 'click');
    };


    this.unmount = function (control, remove) {

        var view = control.view_head;

        control.view_head = view.control = view.onclick = null;

        base.unmount.call(this, control, remove);
    };



    this.icon = function (control, value) {

        control.view_head.firstChild.firstChild.className = 'f-tab-icon ' + (value || 'f-tab-icon-none');
    };


    this.text = function (control, value) {

        control.view_head.firstChild.firstChild.nextSibling[this.__text_name] = value;
    };


    this.buttons = function (control, value) {

        var last = (view = control.view_head).firstChild.lastChild,
            node = last.previousSibling;

        while (node && node.getAttribute('tag') === 'button')
        {
            node = node.previousSibling;
            view.removeChild(node.nextSibling);
        }

        if (value)
        {
            value = flyingon.html_encode(any).replace(/(\w+)\W*/g, '<span class="f-tab-button $1" tag="button"></span>');
            flyingon.dom_html(view, value, last);
        }
    };


    this.closable = function (control, value) {

        control.view_head.firstChild.lastChild.style.display = value ? '' : 'none';
    };


    this.selected = function (control, value) {

        if (control.view)
        {
            control.view.style.display = value ? '' : 'none';
        }

        control.view_head.className = 'f-tab-item' + (value ? ' f-tab-selected' : '');
    };


});




flyingon.renderer('Popup', 'Panel', function (base) {



    //弹出层管理器
    var stack = [];

    //当前弹出层
    var current = null;

    //注册事件函数
    var on = flyingon.dom_on;

    //注销事件函数
    var off = flyingon.dom_off;

    

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

        var view = control.view || this.createView(control, false);

        document.body.appendChild(view);

        control.trigger('showing');

        control.measure(document.body.clientWidth, 0);
        control.locate(left | 0, top | 0);

        flyingon.__update_patch();
        
        this.update(control);

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
        
        control.trigger('shown');
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




flyingon.renderer('Dialog', 'Panel', function (base) {



    this.render = function (writer, control, className, cssText) {

        var storage = control.__storage || control.__defaults,
            head = storage.header,
            text = storage.text,
            any;

        writer.push('<div');
        
        this.renderDefault(writer, control, className, cssText);
        
        if (text)
        {
            text = flyingon.html_encode(text);
        }

        if (any = control.format)
        {
            text = any.call(control, text);
        }

        writer.push('>',
            '<div class="f-dialog-head" style="height:', head, 'px;line-height:', head, 'px;" onmousedown="flyingon.Dialog.onmousedown.call(this, event)" onclick="flyingon.Dialog.onclick.call(this, event)">',
                '<span class="f-dialog-icon ', (any = storage.icon) ? any : '" style="display:none;', '"></span>',
                '<span class="f-dialog-text">', text, '</span>',
                '<span class="f-dialog-close"', storage.closable ? '' : ' style="display:none;"', ' tag="close"></span>',
                '<span class="f-dialog-line"></span>',
            '</div>',
            '<div class="f-dialog-body" style="top:', head, 'px;">');

        if (control.length > 0 && control.__visible)
        {
            control.__content_render = true;
            this.__render_children(writer, control, control, 0, control.length);
        }

        writer.push(this.__scroll_html, '</div></div>');
    };
    



    flyingon.Dialog.onclick = function (e) {

        var control = flyingon.findControl(this),
            dom = e.target || e.srcElement;

        if (dom.getAttribute('tag') === 'close')
        {
            control.close();
        }
        else
        {
            control.active();
        }
    };
    
    
    flyingon.Dialog.onmousedown = function (e) {

        var control = flyingon.findControl(this);
        
        if (control.movable())
        {
            control.active();
            control.renderer.movable(control, e);
        }
    };



    this.mount = function (control, view) {

        control.view_content = view.lastChild;
        base.mount.call(this, control, view);
    };



    this.active = function (control, active) {

        var view = control.view,
            name = ' f-dialog-active';

        if (active)
        {
            if (view.className.indexOf(name) < 0)
            {
                view.className += name;
            }
        }
        else
        {
            view.className = view.className.replace(name, '');
        }
    };


    this.header = function (control, view, value) {

        view.firstChild.style.height = view.lastChild.style.top = value + 'px';
    };


    this.text = function (control, view, value) {

        view = view.firstChild.firstChild.nextSibling;

        if (control.format)
        {
            if (value)
            {
                value = flyingon.html_encode(value);
            }

            view.innerHTML = control.format(value);
        }
        else
        {
            view[this.__text_name] = value;
        }
    };


    this.icon = function (control, view, value) {

        view = view.firstChild.firstChild;
        view.className = 'f-groupbox-icon' + (value ? ' ' + value : '');
        view.style.display = value ? '' : 'none';
    };


    this.closable = function (control, view, value) {

        view.firstChild.lastChild.style.display = value ? '' : 'none';
    };



    this.show = function (control, overlay) {

        var body = document.body,
            view = control.view || this.createView(control, false),
            width = body.clientWidth;

        body.appendChild(view);
        
        control.trigger('showing');

        control.measure(width, 0);

        this.center(control);

        if (overlay)
        {
            flyingon.dom_overlay(view);
        }

        flyingon.__update_patch();
        this.update(control);
        
        control.trigger('shown');
    };

    
    this.center = function (control) {

        var body = document.body,
            style = control.view.style;

        style.left = (control.offsetLeft = body.clientWidth - control.offsetWidth >> 1) + 'px';
        style.top = (control.offsetTop = ((window.innerHeight || document.documentElement.clientHeight) 
            - control.offsetHeight >> 1) - body.clientLeft) + 'px';
    };


    this.movable = function (control, event) {

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




flyingon.showMessage = function (title, text, type, buttons, focus) {

    var dialog, any;

    if (arguments.length < 4)
    {
        focus = buttons;
        buttons = type;
        type = '';
    }

    buttons = buttons ? '' + buttons : 'ok';

    any = buttons.match(/\w+/g);
    buttons = [];

    for (var i = 0, l = any.length; i < l; i++)
    {
        buttons.push({

            Class: 'Button',
            height: 25,
            style: 'min-width:80px;margin-top:8px;',
            tag: any[i],
            text: flyingon.i18ntext('system.' + any[i], any[i])
        });
    }

    dialog = flyingon.ui({

        layout: 'vertical-line',
        width: 300,
        height: 'auto',
        padding: 0,
        text: title,

        children: [
            { 
                Class: 'Panel', 
                layout: 'dock',
                height: 'auto',
                padding: 8,
                minHeight: 60,
                style: 'overflow:hidden;',
                children: [
                    { Class: 'Label', dock: 'left', width: 50, height: 50, visible: type, className: 'f-message-icon' + (type ? ' f-message-' + type : '') },
                    { Class: 'Label', dock: 'fill', height: 'auto', text: text }
                ]
            },
            {
                Class: 'div', 
                height: 40,
                className: 'f-message-foot', 
                style: 'overflow:hidden;',
                children: buttons
            }
        ]

    }, flyingon.Dialog).showDialog();

    any = dialog.offsetHeight / 200;

    if (any > 1)
    {
        any = 300 * any;

        dialog.width(any > 800 ? 800 : any);
        dialog.showDialog();
    }

    dialog.view.lastChild.firstChild.nextSibling.children[focus | 0].focus();

    dialog.on('click', function (e) {

        var tag = e.target.tag();

        if (tag)
        {
            this.close(tag);
        }
    });

    return dialog;

};





/**
 * @class flyingon.Control
 * @uses f-bindable
 * @uses f-collection
 * @description 控件基类
 */
//IE7点击滚动条时修改className会造成滚动条无法拖动,需在改变className后设置focus获取焦点解决此问题
Object.extend('Control', function () {

    
    
    var create = flyingon.create;
  
    var pixel = flyingon.pixel;

    var pixel_sides = flyingon.pixel_sides;

          
    /**
     * @property defaultWidth
     * @type {int}
     * @description 控件默认宽度(width === 'default'时的宽度)
     */
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

        
    
    //扩展可视组件功能
    flyingon.fragment('f-visual', this);

    
    //扩展可绑定功能
    flyingon.fragment('f-bindable', this);
    


    //获取焦点指令
    this['#focused'] = function (value) {

        if (value)
        {
            this.focus();
        }
        else
        {
            this.blur();
        }
    };



    this.__visible = true;


    /**
     * @method visible
     * @description 是否可见
     * @param {boolean} value
     */
    this.defineProperty('visible', true, {
        
        group: 'layout',

        set: function (value) {

            var any;

            this.__visible = value;
            
            if (this.rendered)
            {
                if (any = this.__view_patch)
                {
                    any.visible = value;
                }
                else
                {
                    this.renderer.set(this, 'visible', value);
                }
            }

            this.__update_dirty || this.invalidate();
        }
        
    });
        



    //定位属性变化
    this.__location_dirty = 0;


    //定义定位属性
    var define = function (self, name, defaultValue, dirty) {
   
        return self.defineProperty(name, defaultValue, {
            
            group: 'layout',

            set: function () {

                this.__location_dirty |= dirty;
                this.__update_dirty || this.invalidate();
            }
        });
    };
    

    //左边距
    define(this, 'left', '', 512);

    //顶边距
    define(this, 'top', '', 1024);

    //宽度
    //default: 默认
    //auto: 自动
    //number: 指定象素
    //number + css单位
    define(this, 'width', 'default', 1);

    //高度
    //default: 默认
    //auto: 自动
    //number: 指定象素
    //number + css单位
    define(this, 'height', 'default', 2);


    //最小宽度
    this['min-width'] = define(this, 'minWidth', '', 32);

    //最大宽度
    this['max-width'] = define(this, 'maxWidth', '', 64);

    //最小高度
    this['min-height'] = define(this, 'minHeight', '', 128);

    //最大高度
    this['max-height'] = define(this, 'maxHeight', '', 256);


    //外边距
    define(this, 'margin', '', 4);

    //边框宽度
    define(this, 'border', '', 8);

    //内边距
    define(this, 'padding', '', 16);


    define = function (self, name, defaultValue, dirty) {
   
        return self.defineProperty(name, defaultValue, {
            
            group: 'layout',

            set: function () {

                if (!this.__as_html && !this.__update_dirty)
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
    this['align-x'] = define(this, 'alignX', 'left');

    //控件纵向对齐方式
    //top       顶部对齐
    //middle    纵向居中对齐
    //bottom    底部对齐
    this['align-y'] = define(this, 'alignY', 'top');
    
    //控件停靠方式(此值仅在当前布局类型为停靠布局(dock)时有效)
    //left:     左停靠
    //top:      顶部停靠
    //right:    右停靠
    //bottom:   底部停靠
    //fill:     充满
    define(this, 'dock', 'left');



    //设置自定义样式
    this.defineProperty('style', '', {
        
        group: 'appearance',

        fn: function (name, value) {

            var style = this.__style,
                any;

            if (name === void 0)
            {
                if (style && (any = style.cssText) === false)
                {
                    return style.cssText = style_text(style);
                }

                return any || '';
            }

            name = '' + name;

            //单个设置样式
            if (value !== void 0)
            {
                this['style:'](name, value);
                return this;
            }
            
            if (name.length < 36 && name.indexOf(':') < 0) //读指定名称的样式
            {
                return style && style[name] || '';
            }
            
            if (value = name.match(/\:|[^\s:;]+(\s+[^\s:;]+)?/g))
            {
                set_style.call(this, style, value);
            }

            return this;
        }
    });

    
    //设置样式
    this['style:'] = function (name, value) {

        var style = this.__style,
            watches,
            any;

        if (!name || (any = style && style[name] || '') === value)
        {
            return;
        }

        (style || (style = this.__style = {}))[name] = value;

        if (watches = this.__watches)
        {
            if (watches['style:' + name])
            {
                this.notify('style:' + name, value, any);
            }

            if (watches.style)
            {
                any = style.cssText || '';
                this.notify('style', style_text(style), any);
            }
        }
        else
        {
            style.cssText = false;
        }

        if (this.rendered)
        {
            (this.__style_patch || style_patch(this))[name] = value;
        }
    };


    //批量设置样式
    function set_style(style, list) {

        var watches = this.__watches,
            render = this.rendered,
            index = 0,
            length = list.length,
            name,
            value,
            patch,
            any;

        style = style || (this.__style = {});

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

            if ((any = style && style[name] || '') !== value)
            {
                style[name] = value;

                if (watches && watches['style:' + name])
                {
                    this.notify('style:' + name, value, any);
                }

                if (render)
                {
                    (patch || (patch = this.__style_patch || style_patch(this)))[name] = value;
                }
                else
                {
                    patch = true;
                }
            }
        }

        if (patch)
        {
            if (watches && watches.style)
            {
                any = style.cssText || '';
                this.notify('style', style_text(style), any);
            }
            else
            {
                style.cssText = false;
            }
        }
    };


    //创建样式补丁
    function style_patch(self) {

        var view = self.__view_patch,
            patch = self.__style_patch = {};
        
        if (view)
        {
            view.__style_patch = patch;
        }
        else
        {
            self.renderer.set(self, '__style_patch', patch);
        }

        return patch;
    };


    //获取样式文本
    function style_text(style) {

        var list = [],
            value;

        for (var name in style)
        {
            if (name !== 'cssText' && (value = style[name]) !== '')
            {
                list.push(name, ':', value, ';');
            }
        }

        return style.cssText = list.join('');
    };

    

    //定义attribute属性
    define = function (self, name, defaultValue, attributes) {

        attributes = attributes || {};

        attributes.set = function (value) {

            var any;

            if (any = this.__view_patch)
            {
                any[name] = value;
            }
            else
            {
                this.renderer.set(this, name, value);
            }
        };

        self.defineProperty(name, defaultValue, attributes);
    };

    
    //tab顺序
    define(this, 'tabindex', 0);
    
    
    //是否禁用
    define(this, 'disabled', false);
    

    //是否只读
    define(this, 'readonly', false);


    //提示信息
    define(this, 'title', '');


    //快捷键
    define(this, 'accesskey', '');
    
    
    
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


    

    //测量控件大小
    //containerWidth    容器宽度
    //containerHeight   容器高度
    //availableWidth    可用宽度 
    //availableHeight   可用高度
    //defaultToFill     默认宽度或高度是否转成充满 0:不转 1:宽度转 2:高度转 3:宽高都转
    this.measure = function (containerWidth, containerHeight, availableWidth, availableHeight, defaultToFill) {
        
        var storage = this.__storage || this.__defaults,
            location = this.__location_values || storage,
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

        //不支持在布局中修改边框和内边距
        any = cache[any = storage.border] || fn(any, 0); //border不支持百分比

        this.borderLeft = any.left;
        this.borderTop = any.top;
        this.borderRight = any.right;
        this.borderBottom = any.bottom;

        //不支持在布局中修改边框和内边距
        any = cache[any = storage.padding] || fn(any, containerWidth);

        this.paddingLeft = any.left;
        this.paddingTop = any.top;
        this.paddingRight = any.right;
        this.paddingBottom = any.bottom;

        fn = pixel;
        cache = fn.cache;

        minWidth = minWidth > 0 ? minWidth | 0 : cache[minWidth] || fn(minWidth, containerWidth);
        maxWidth = maxWidth > 0 ? maxWidth | 0 : cache[maxWidth] || fn(maxWidth, containerWidth);

        minHeight = minHeight > 0 ? minHeight | 0 : cache[minHeight] || fn(minHeight, containerHeight);
        maxHeight = maxHeight > 0 ? maxHeight | 0 : cache[maxHeight] || fn(maxHeight, containerHeight);

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

        return !!this.tabindex;
    };


    this.focus = function () {

        this.rendered && this.renderer.focus(this);
    };


    this.blur = function () {

        this.rendered && this.renderer.blur(this);
    };
    
           
      

    this.__update_dirty = true;

    //使布局无效
    this.invalidate = function () {

        var parent = this.parent;

        this.__update_dirty = true;

        if (parent)
        {
            parent.__arrange_delay(2);
        }
        else if (this.__top_control)
        {
            flyingon.__update_delay(this);
        }

        return this;
    };


    this.__arrange_dirty = 0;

    //启用延时排列
    this.__arrange_delay = function (dirty) {

        if (this.__arrange_dirty < dirty)
        {
            var parent = this.parent;

            this.__arrange_dirty = dirty;

            if (parent)
            {
                parent.__arrange_delay(1);
            }
            else if (this.__top_control)
            {
                flyingon.__update_delay(this);
            }
        }
    };

        
    
    //滚动事件处理
    this.__do_scroll = function (x, y) {
        
    };

    
    
    //扩展可序列化功能
    flyingon.fragment('f-serialize', this);


    
    //序列化方法
    this.serialize = function (writer) {

        var any;
        
        if ((any = this.Class) && (any = any.nickName || any.fullName))
        {
            writer.writeProperty('Class', any);
        }
        
        if (any = this.__storage)
        {
            writer.writeProperties(any, this.getOwnPropertyNames(), this.__watches);
        }

        if (any = this.__style)
        {
            serialize_style(writer, any, this.__watches);
        }
    };


    function serialize_style(writer, style, watches) {

        var list = [],
            key,
            value,
            any;

        for (var name in style)
        {
            if (name !== 'cssText' && (value = style[name]) !== '')
            {
                if (watches && (any = watches[key = 'style:' + name]) && (any = any[0]))
                {
                    writer.writeProperty(key, '{{' + any + '}}');
                }
                else
                {
                    list.push(name, ':', value, ';');
                }
            }
        }

        if (list[0])
        {
            writer.writeProperty('style', list.join(''));
        }
    };
    
    

    //被移除或关闭时是否自动销毁
    this.autoDispose = true;
    
    
    //销毁控件    
    this.dispose = function () {
    
        var storage = this.__storage,
            any;

        //触发销毁过程
        if (any = this.distroyed)
        {
            any.call(this);
        }
        
        if (this.view)
        {
            this.renderer.dispose(this);
        }

        if (any = this.__dataset)
        {
            any.subscribe(this, true);
            this.__dataset = null;
        }
        
        if (this.__events)
        {
            this.off();
        }
        
        this.parent = this.__loop_vm = null;

        return this;
    };
    
    

}).register();




flyingon.Control.extend('HtmlElement', function (base) {


    this.tagName = 'div';


    //内容文本
    this.defineProperty('text', '', {
        
        set: function (value) {

            this.length > 0 && this.splice(0);
            this.rendered && this.renderer.set(this, 'text', value);
        }
    });


    //设置的text是否html(注意html注入漏洞)
    this.defineProperty('html', false);


    //是否排列子控件(如果子控件或子子控件不包含布局控件,此值设为false可提升性能)
    this.defineProperty('arrange', true);
    
    

    //扩展容器功能
    flyingon.fragment('f-container', this, true);



    //测量自动大小
    this.onmeasure = function (auto) {
        
        var tag = (this.offsetHeight << 16) + this.offsetWidth;

        if (this.__size_tag !== tag)
        {
            this.__size_tag = tag;
            this.__arrange_dirty = 2;
        }

        if (auto)
        {
            this.renderer.__measure_auto(this, auto);
        }
        else
        {
            return false;
        }
    };



    this.serialize = function (writer) {
        
        base.serialize.call(this, writer);
        
        if (this.length > 0)
        {
            writer.writeProperty('children', this, true);
        }
        
        return this;
    };
    

    this.dispose = function () {

        for (var i = this.length - 1; i >= 0; i--)
        {
            this[i].dispose(false);
        }

        base.dispose.apply(this, arguments);
        return this;
    };



});




flyingon.Control.extend('Label', function (base) {
   
    

    this.defaultWidth = 60;


    
    function define(self, name, defaultValue) {

        self.defineProperty(name, defaultValue, {
            
            set: function () {

                this.rendered && this.renderer.set(this, 'text');
            }
        });
    };


    //标签文本
    define(this, 'text', '');


    //文本是否html
    define(this, 'html', false);


    
    
    //测量自动大小
    this.onmeasure = function (auto) {
        
        if (auto)
        {
            this.renderer.__measure_auto(this, auto);
        }
        else
        {
            return false;
        }
    };
    


}).register();




flyingon.Control.extend('Button', function (base) {
   
    

    var define = function (self, name, defaultValue) {

        return self.defineProperty(name, defaultValue, {

            set: function (value) {

                this.rendered && this.renderer.set(this, name, value);
            }
        });
    };

    
    //图标
    define(this, 'icon', '');


    //图标大小
    this['icon-size'] = define(this, 'iconSize', 16);


    //图标和文字是否竖排
    define(this, 'vertical', false);


    //文本内容
    define(this, 'text', '');
    
    
    //文本内容是否html格式
    define(this, 'html', false);


        
    //测量自动大小
    this.onmeasure = function (auto) {
        
        if (auto)
        {
            this.renderer.__measure_auto(this, auto);
        }
        else
        {
            return false;
        }
    };
       


}).register();




flyingon.Control.extend('LinkButton', function (base) {
   


    var define = function (self, name, defaultValue) {

        return self.defineProperty(name, defaultValue, {

            set: function (value) {

                this.rendered && this.renderer.set(this, name, value);
            }
        });
    };

    
    //文本内容
    define(this, 'text', '');
    
    
    //文本内容是否html格式
    define(this, 'html', false);


    //链接地址
    define(this, 'href', '');
    

        
    //测量自动大小
    this.onmeasure = function (auto) {
        
        if (auto)
        {
            this.renderer.__measure_auto(this, auto);
        }
        else
        {
            return false;
        }
    };
       


}).register();




flyingon.Control.extend('Image', function (base) {



    this.defaultWidth = 400;

    this.defaultHeight = 300;



    this.defineProperty('src', '', {
            
        set: function (value) {

            this.rendered && this.renderer.set(this, 'src', value);
        }
    });


    this.defineProperty('alt', '', {
            
        set: function (value) {

            this.rendered && this.renderer.set(this, 'alt', value);
        }
    });



}).register();




flyingon.Control.extend('Slider', function (base) {



    var define = function (self, name, defaultValue) {

        return self.defineProperty(name, defaultValue, {

            dataType: 'integer',

            check: function (value) {

                return value < 0 ? 0 : value;
            },

            set: function () {

                if (this.rendered && !this.__location_dirty)
                {
                    this.renderer.set(this, 'refresh');
                }
            }
        });
    };



    define(this, 'value', 0);


    define(this, 'min', 0);


    define(this, 'max', 100);


    define(this, 'buttonSize', 8);



}).register();




flyingon.Control.extend('ProgressBar', function (base) {



    this.defaultHeight = 20;

    this.defaultValue('border', 1);



    this.defineProperty('value', 0, {

        dataType: 'integer',

        check: function (value) {

            if (value < 0)
            {
                return 0;
            }

            return value > 100 ? 100 : value;
        },

        set: function (value) {

            this.rendered && this.renderer.set(this, 'value', value);
        }
    });


    this.defineProperty('text', true, {

        set: function (value) {

            this.rendered && this.renderer.set(this, 'text', value);
        }
    });


}).register();




//集合功能扩展
flyingon.fragment('f-container', function (childrenClass, arrange) {



    if (childrenClass === true)
    {
        childrenClass = null;
        arrange = true;
    }


    //子控件类
    this.childrenClass = childrenClass || flyingon.Control;


    //是否需要排列
    this.__arrange_dirty = arrange ? 2 : 0;

    

    flyingon.fragment('f-collection', this);


    this.__check_error = function (Class) {

        throw '"' + this.Class.fullName + '" type can push "' + Class.fullName + '" type only!';
    };

  

    //分离子控件(不销毁)
    this.detach = function (index, length) {

        var items = this.splice.apply(this, arguments),
            length = items.length,
            item;

        if (length > 0)
        {
            for (var i = 0; i < length; i++)
            {
                if (item = items[i])
                {
                    item.autoDispose = false;
                }
            }
        }

        return items;
    };


    //添加子项前检测处理
    this.__check_items = function (index, items, start) {

        var Class = this.childrenClass,
            html = this instanceof flyingon.HtmlElement,
            patch = this.__content_render && [],
            length = items.length,
            item,
            any;

        while (start < length)
        {
            item = items[start];

            if (item.__flyingon_class)
            {
                if (item instanceof Class)
                {
                    if ((any = item.parent) && any !== this)
                    {
                        any.__remove_items(any.indexOf(item), [item]);
                    }
                }
                else
                {
                    this.__check_error(Class);
                }
            }
            else if ((item = this.__create_child(item, Class)) instanceof Class)
            {
                items[start] = item;
            }
            else
            {
                this.__check_error(Class);
            }

            item.parent = this;
            item.__as_html = html;

            if (patch)
            {
                patch.push(item);
            }

            start++;
        }

        this.__all && this.__clear_all();

        if (patch && patch[0])
        {
            this.__children_dirty(1, index, patch);
        }

        if (arrange && this.__arrange_dirty < 2)
        {
            this.__arrange_delay(2);
        }
    };


    //创建控件方法
    this.__create_child = flyingon.ui;


    //移除多个子项
    this.__remove_items = function (index, items) {

        var patch = [],
            item;

        this.__all && this.__clear_all();

        for (var i = items.length - 1; i >= 0; i--)
        {
            if (item = items[i])
            {
                item.parent = null;
                item.autoDispose = true;

                patch.push(item);
            }
        }

        //注册子项变更补丁
        if (patch[0])
        {
            this.__children_dirty(2, -1, patch);
        }

        if (arrange && this.__arrange_dirty < 2)
        {
            this.__arrange_delay(2);
        }
    };


    //注册子项变更补丁
    this.__children_dirty = function (type, index, items) {

        var patch = this.__children_patch;

        if (patch)
        {
            var any = patch.length - 3;

            //相同类型进行合并处理
            if (type === patch[any++] && patch[any++] === index)
            {
                any = patch[any + 1];
                any.apply(any, items);
            }
            else
            {
                patch.push(type, index, items);
            }
        }
        else
        {
            this.__children_patch = [type, index, items];
            this.renderer.__children_dirty(this);
        }
    };



    //清除all缓存
    this.__clear_all = function () {

        var any = this.parent;

        this.__all = null;

        while (any && any.__all)
        {
            any.__all = null;
            any = any.parent;
        }
    };



    //使用选择器查找子控件
    this.find = function (selector) {

        return new flyingon.Query(selector, [this]);
    };


    //查找指定id的子控件
    this.findById = function (id, deep) {

        var query = new flyingon.Query(),
            list;

        if (id)
        {
            list = flyingon.__find_id(deep !== false ? this.all() : this, id);
            list.push.apply(query, list);
        }

        return query;
    };


    //查找指定类型的子控件
    this.findByType = function (name, deep) {

        var query = new flyingon.Query(),
            list;

        if (name)
        {
            list = flyingon.__find_type(deep !== false ? this.all() : this, name);
            list.push.apply(query, list);
        }

        return query;
    };


    //查找指定class的子控件
    this.findByClass = function (name, deep) {

        var query = new flyingon.Query(),
            list;

        if (name)
        {
            list = flyingon.__find_class(deep !== false ? this.all() : this, name);
            list.push.apply(query, list);
        }

        return query;
    };


    //获取所有子控件
    this.all = function () {

        return this.__all || (this.__all = all(this, []));
    };


    function all(self, list) {

        var item, any;

        for (var i = 0, l = self.length; i < l; i++)
        {
            if (item = self[i])
            {
                list.push(item);

                if (any = item.all)
                {
                    list.push.apply(list, any.call(item));
                }
            }
        }

        return list;
    };


    
    //查找拖拉放置目标及位置
    this.findDropTarget = function (x, y) {
        
        var control = this.findAt(x, y);

        if (control)
        {
            //
            
            return [this, control];
        }
        
        return [this, null];
    };
    
    
    
    //查找指定坐标的子控件
    this.findAt = function (x, y) {
      
        return this;
    };
    
  
    
    this.deserialize_children = function (reader, values) {
      
        if (typeof values === 'function')
        {
            var any = [];

            values(any); //values(values = []); 在IE7下会出错
            values = any;
        }

        this.push.apply(this, reader.readArray(values, this.childrenClass));
    };



    //接收数据集变更动作处理
    this.subscribeBind = function (dataset, action) {
        
        var item;
        
        this.base.subscribeBind.call(this, dataset, action);

        //向下派发
        for (var i = 0, l = this.length; i < l; i++)
        {
            if ((item = this[i]) && !item.__dataset)
            {
                item.subscribeBind(dataset, action);
            }
        }
        
        return this;
    };


});




/**
 * @class flyingon.Panel
 * @extends flyingon.Control
 * @description 面板容器类
 */
flyingon.Control.extend('Panel', function (base) {



    
    //重写默认宽度
    this.defaultWidth = 300;
    
    //重写默认高度
    this.defaultHeight = 150;

        

    //排列区域
    this.arrangeLeft = this.arrangeTop = 
    this.arrangeRight = this.arrangeBottom = 
    this.arrangeWidth = this.arrangeHeight = 0;



    //重写默认为可放置移动或拖动对象
    this.defaultValue('droppable', true);



    //当前布局
    this.defineProperty('layout', null, {
     
        group: 'locate',
        query: true,

        set: function (value) {

            this.__layout = null;
            this.__arrent_dirty < 2 && this.__arrange_delay();
        }
    });


    //作为html布局时是否需要适应容器
    this.defineProperty('adaption', false);
    
    

    //扩展容器功能
    flyingon.fragment('f-container', this, true);



    //测量自动大小
    this.onmeasure = function (auto) {
        
        var tag = (this.offsetHeight << 16) + this.offsetWidth;

        if (this.__size_tag !== tag)
        {
            this.__size_tag = tag;
            this.__arrange_dirty = 2;
        }

        if (auto)
        {
            this.renderer.locate(this);
            this.__update_dirty = false;

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
    this.findAt = function (x, y) {
      
        if (this.length <= 0)
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

        return layout.controlAt(this, x, y);
    };    


 
    this.serialize = function (writer) {
        
        base.serialize.call(this, writer);
        
        if (this.length > 0)
        {
            writer.writeProperty('children', this, true);
        }
        
        return this;
    };
    

    this.dispose = function () {

        for (var i = this.length - 1; i >= 0; i--)
        {
            this[i].dispose(false);
        }

        base.dispose.apply(this, arguments);
        return this;
    };



}).register();




flyingon.Panel.extend('GroupBox', function (base) {



    this.defaultValue('border', 1);



    //页头高度
    this.defineProperty('header', 25, {

        set: function (value) {
            
            this.rendered && this.renderer.set(this, 'header', value);
            this.__update_dirty || this.invalidate();
        }
    });



    function define(self, name, defaultValue) {

        self.defineProperty(name, defaultValue, {

            set: function (value) {
                
                this.rendered && this.renderer.set(this, name, value);
            }
        });
    };

 
    //文字对齐
    define(this, 'align', 'left');


    //图标
    define(this, 'icon', '');


    //text
    define(this, 'text', '');


    //是否可收收拢
    //0: 不可折叠
    //1: 可折叠不显示折叠图标
    //2: 可折叠且显示折叠图标
    define(this, 'collapsable', 0);


    //是否折叠
    this.defineProperty('collapsed', false, {

        set: function (value) {

            this.rendered && this.renderer.set(this, 'collapsed', value);

            if (!value && (value = this.mutex()))
            {
                this.__do_mutex(value);
            }

            this.__update_dirty || this.invalidate();
        }
    });


    //折叠互斥组(同一时刻只有一个分组框可以打开)
    this.defineProperty('mutex', '');


    this.__do_mutex = function (value) {

        var parent = this.parent,
            item;

        if (parent)
        {
            for (var i = 0, l = parent.length; i < l; i++)
            {
                if ((item = parent[i]) && item !== this && item.__do_mutex && item.mutex() === value)
                {
                    item.collapsed(true);
                }
            }
        }
    };


    //测量自动大小
    this.onmeasure = function (auto) {
        
        if (this.collapsed())
        {
            this.offsetHeight = this.header();
            return false;
        }
        
        if (auto)
        {
            base.onmeasure.call(this, auto);
            this.offsetHeight += this.header();
        }
        else
        {
            return false;
        }
    };

    
    this.arrangeArea = function () {

        var header = this.header();

        this.arrangeHeight -= header;
        this.arrangeBottom -= header;
    };



}).register();




flyingon.Panel.extend('ScrollPanel', function (base) {


    //预渲染
    //none: 不启用
    //x:    水平方向预渲染
    //y:    竖直方向预渲染
    //xy:   水平及竖直方向同时预渲染
    this.defineProperty('prerender', 'none');



    //可见区范围
    this.__visible_start = this.__visible_end = -1;

    //可见区是否有未渲染的子控件
    this.__visible_unmount = true;



    //计算可见控件集合
    this.__compute_visible = function () {

        var start = -1,
            end = -1,
            x = this.scrollLeft, 
            y = this.scrollTop,
            right = this.offsetWidth,
            bottom = this.offsetHeight,
            view = true,
            item,
            any;

        any = this.prerender();
        right += x + (any.indexOf('x') >= 0 ? right : 0);
        bottom += y + (any.indexOf('y') >= 0 ? bottom : 0);

        for (var i = 0, l = this.length; i < l; i++)
        {
            if ((item = this[i]) &&
                (item.__visible_area = (any = item.offsetLeft) < right && any + item.offsetWidth > x && 
                (any = item.offsetTop) < bottom && any + item.offsetHeight > y))
            {
                if (view && !item.view)
                {
                    view = false; //标记有未渲染的子控件
                }

                if (start < 0)
                {
                    start = i;
                }

                end = i;
            }
        }

        this.__visible_start = start;
        this.__visible_end = end;
        this.__visible_unmount = !view;
    };



    //处理滚动
    this.__do_scroll = function (x, y) {
    
        this.scrollLeft = x;
        this.scrollTop = y;
        
        this.__compute_visible();
        this.renderer.scroll(this, x, y);
    };



}).register();




flyingon.Control.extend('Splitter', function (base) {



    this.defaultWidth = this.defaultHeight = 4;


    //是否竖直方向
    this.vertical = false;




}).register();




flyingon.Panel.extend('Plugin', function (base) {



    this.loadPlugin = function (route) {

    };


    this.openPlugin = function (route) {

    };


    this.closePlugin = function () {

    };
    


    this.__class_init = function (Class) {

        var fn = flyingon.__load_plugin;

        base.__class_init.apply(this, arguments);

        if (fn && (Class !== flyingon.Plugin))
        {
            fn(Class);
        }
    };



}).register();




flyingon.plugin = function (superclass, fn) {

    if (!fn)
    {
        fn = superclass;
        superclass = flyingon.Plugin;
    }

    return superclass.extend(fn).init();
};




flyingon.Control.extend('ListBox', function (base) {



    this.defaultWidth = 200;

    this.defaultHeight = 100;


    this.defaultValue('border', 1);



    function define(self, name, defaultValue, clear) {

        return self.defineProperty(name, defaultValue, {

            set: function () {

                this.__template = null;
                this.rendered && this.renderer.set(this, 'content');
            }
        });
    };



    //指定渲染列数
    //0     在同一行按平均宽度渲染
    //大于0 按指定的列数渲染
    define(this, 'columns', 1);


    //是否可清除
    define(this, 'clear', false);


    //子项模板
    define(this, 'template', null);


    //子项高度
    this['item-height'] = define(this, 'itemHeight', 21);


    //值字字段名
    this['value-field'] = this.defineProperty('valueField', '', {

        set: function () {

            this.__template = null;

            if (!this.__use_index)
            {
                this.__selectedIndex = void 0;
            }

            this.rendered && this.renderer.set(this, 'content');
        }
    });


    //显示字段名
    this['display-field'] = define(this, 'displayField', '');



    //列表项集合
    this.defineProperty('items', null, {

        check: function (value) {

            if (value)
            {
                if (typeof value === 'string')
                {
                    value = flyingon.parseJSON(value);
                }

                return value instanceof Array ? value : [value];
            }

            return null;
        },

        set: function () {

            this.rendered && this.renderer.set(this, 'content');
        }
    });


    //默认选中索引
    this.defineProperty('index', -1, {

        dataType: 'integer',

        set: function (value) {

            //标记使用索引定位
            this.__use_index = true;

            this.__selectedIndex = value;
            this.rendered && this.renderer.set(this, 'change');
        }
    });


    //值类型
    //boolean   布尔类型
    //integer   整数类型
    //number    数字类型
    //string    字符类型
    this.defineProperty('type', 'string', {

        set: function () {

            if (!this.__use_index)
            {
                this.__selectedIndex = void 0;
            }

            this.rendered && this.renderer.set(this, 'change');
        }
    });


    //默认选中值
    this.defineProperty('value', '', {

        set: function () {

            //标记不使用索引定位
            this.__use_index = false;
            this.__selectedIndex = void 0;

            this.rendered && this.renderer.set(this, 'change');
        }
    });



    //获取选中索引
    this.selectedIndex = function () {

        var index = this.__selectedIndex;

        if (index === void 0)
        {
            var storage = this.__storage,
                items,
                name,
                value;

            if (storage && (items = storage.items) && items.length > 0)
            {
                value = storage.value;

                switch (storage.type)
                {
                    case 'boolean':
                        value = !!value && value !== false;
                        break;
                    
                    case 'integer':
                        value |= 0;
                        break;

                    case 'number':
                        value = +value;
                        break;
                }

                if (name = storage.valueField)
                {
                    for (var i = 0, l = items.length; i < l; i++)
                    {
                        if ((storage = items[i]) && storage[name] === value)
                        {
                            return this.__selectedIndex = i;
                        }
                    }

                    return this.__selectedIndex = -1;
                }

                return this.__selectedIndex = items.indexOf(value);
            }

            return -1;
        }

        return index;
    };


    //获取选中项
    this.selectedItem = function (field) {

        var storage = this.__storage,
            item = storage && (item = storage.items) && item[this.selectedIndex()];
        
        if (field)
        {
            if (field = storage && storage[field])
            {
                item = item ? item[field] : '';
            }

            return item !== void 0 ? '' + item : '';
        }

        return item;
    };


    //获取选中值
    this.selectedValue = function () {

        return this.selectedItem('valueField');
    };


    this.selectedText = function () {

        return this.selectedItem('displayField');
    };



}).register();




flyingon.ListBox.extend('RadioListBox', function (base) {


    this.__list_type = 'radio';


}).register();




flyingon.ListBox.extend('CheckListBox', function (base) {



    this.__list_type = 'checkbox';



    //默认选中索引
    this.defineProperty('index', null, {

        check: function (value) {

            if (value)
            {
                if (value > 0)
                {
                    return [vlaue | 0];
                }

                if (value instanceof Array)
                {
                    return value;
                }

                if (typeof value === 'string' && (value = value.match(/\d+/g)))
                {
                    for (var i = value.length - 1; i >= 0; i--)
                    {
                        value[i] |= 0;
                    }
                }
            }
            else if (value === 0)
            {
                return [0];
            }
            
            return null;
        },

        set: function (value) {

            //标记使用索引定位
            this.__use_index = true;

            this.__selectedIndex = value;
            this.rendered && this.renderer.set(this, 'content');
        }
    });


    //多值时的分隔符
    this.defineProperty('separator', ',', {

        set: function () {

            if (!this.__use_index)
            {
                this.__selectedIndex = void 0;
                this.rendered && this.renderer.set(this, 'change');
            }
        }
    });



    this.selectedIndex = function () {
        
        var list = this.__selectedIndex;

        if (list === void 0)
        {
            var storage = this.__storage,
                items,
                value,
                any;

            this.__selectedIndex = list = [];

            if (storage && (items = storage.items) && items.length > 0 && (value = storage.value))
            {
                value = storage.value.split(storage.separator);

                any = storage.type;

                if (any !== 'string')
                {
                    for (var i = value.length - 1; i >= 0; i--)
                    {
                        switch (any)
                        {
                            case 'boolean':
                                value[i] = !!value[i] && value[i] !== false;
                                break;

                            case 'integer':
                                value[i] |= 0;
                                break;

                            case 'number':
                                value[i] = +value[i];
                                break;
                        }
                    }
                }

                storage.selected = list;

                if (any = storage.valueField)
                {
                    for (var i = 0, l = items.length; i < l; i++)
                    {
                        if ((storage = items[i]) && value.indexOf(storage[any]) >= 0)
                        {
                            list.push(i);
                        }
                    }
                }
                else
                {
                    for (var i = 0, l = items.length; i < l; i++)
                    {
                        if (value.indexOf(items[i]) >= 0)
                        {
                            list.push(i);
                        }
                    }
                }
            }
        }

        return list;
    };


    //获取选中项集合
    this.selectedItem = function (field) {

        var list = [],
            storage = this.__storage,
            name = field && storage[field],
            items,
            item,
            selected,
            length;

        if (storage && (items = storage.items) && (selected = this.selectedIndex()) && (length = selected.length) > 0)
        {
            for (var i = 0; i < length; i++)
            {
                item = items[selected[i]];

                if (name)
                {
                    item && list.push(item[name]);
                }
                else
                {
                    list.push(item);
                }
            }
        }

        return field ? list.join() : list;
    };


    //获取选中项集合
    this.selectedValue = function () {

        return this.selectedItem('valueField');
    };


    //获取选中项集合
    this.selectedText = function () {

        return this.selectedItem('displayField');
    };



}).register();




flyingon.Control.extend('RadioButton', function (base) {


    this.defineProperty('name', false, {

        set: function (value) {

            this.rendered && this.renderer.set(this, 'name', value);
        }
    });


    this.defineProperty('value', false, {

        set: function (value) {

            this.rendered && this.renderer.set(this, 'value', value);
        }
    });



}).register();




flyingon.Control.extend('CheckBox', function (base) {


    this.defineProperty('name', false, {

        set: function (value) {

            this.rendered && this.renderer.set(this, 'name', value);
        }
    });


    this.defineProperty('value', false, {

        set: function (value) {

            this.rendered && this.renderer.set(this, 'value', value);
        }
    });


}).register();




flyingon.fragment('f-textbox', function () {



    this.defineProperty('placehodler', '');



    this.selectionStart = function (value) {
        
        return this.renderer.selectionStart(value);
    };


    this.selectionEnd = function (value) {

        return this.renderer.selectionEnd(value);
    };


    this.select = function () {

        return this.renderer.select();
    };



});



flyingon.Control.extend('TextBox', function (base) {
    


    this.defineProperty('value', '', {

        set: function (value) {

            this.rendered && this.renderer.set(this, 'text', value);
        }
    });


    this.text = function () {

        return (this.__storage || this.__defaults).value;
    };


    flyingon.fragment('f-textbox', this);
    

    this['max-length'] = this.defineProperty('maxLength', 0);



}).register();




flyingon.Control.extend('TextButton', function (base) {



    //弹出层控件
    var popup_cache;


    function define(self, name, defaultValue, key) {

        return self.defineProperty(name, defaultValue, {

            set: function (value) {
    
                this.rendered && this.renderer.set(this, key || name, value);
            }
        });
    };


    //值
    define(this, 'value', null, 'text');


    //格式化
    define(this, 'format', '', 'text');


    this.text = function () {

        var storage = this.__storage || this.__defaults,
            format = storage.format;

        return format ? format.replace(/\{\{value\}\}/g, value) : '' + storage.value;
    };



    //按钮图片
    define(this, 'button', '');


    //按钮大小
    this['button-size'] = define(this, 'buttonSize', 16);



    flyingon.fragment('f-textbox', this);



    this.__on_click = function () {

        this.trigger('button-click');
    };


    this.__get_popup = function () {

        var popup = popup_cache;

        if (popup)
        {
            popup.close('auto');
        }
        else
        {
            popup = popup_cache = new flyingon.Popup();

            popup.autoDispose = false;

            popup.on('closed', function () {

                this.detach(0);
            });

            popup.width('auto').height('auto');
        }

        return popup;
    };



}).register();




flyingon.TextBox.extend('NumberPicker', function (base) {


    this.defineProperty('value', '', {

        set: function (value) {

            this.rendered && this.renderer.set(this, 'text', value);
        }
    });


}).register();




flyingon.TextButton.extend('ComboBox', function (base) {


    
    //缓存的列表控件
    var listbox_cache; 



    this.defaultValue('button', 'f-combobox-button');



    //指定渲染列数
    //0     在同一行按平均宽度渲染
    //大于0 按指定的列数渲染
    this.defineProperty('columns', 1);


    //是否生成清除项
    this.defineProperty('clear', false);


    //子项模板
    this.defineProperty('template', null);


    //子项高度
    this['item-height'] = this.defineProperty('itemHeight', 21);


    //值字字段名
    this['value-field'] = this.defineProperty('valueField', '');


    //显示字段名
    this['display-field'] = this.defineProperty('displayField', '');


    //列表项集合
    this.defineProperty('items', null, {

        check: function (value) {

            if (value)
            {
                if (typeof value === 'string')
                {
                    value = flyingon.parseJSON(value);
                }

                return value instanceof Array ? value : [value];
            }

            return null;
        }
    });



    //值类型
    //boolean   布尔类型
    //integer   整数类型
    //number    数字类型
    //string    字符类型
    this.defineProperty('type', 'string');


    //默认选中值
    this.defineProperty('value', '', {

        set: function () {

            this.rendered && this.renderer.set(this, 'text');
        }
    });



    //获取选中索引
    this.selectedIndex = function () {

        var storage = this.__storage,
            items,
            name,
            value;

        if (storage && (items = storage.items) && items.length > 0)
        {
            value = storage.value;

            switch (storage.type)
            {
                case 'boolean':
                    value = !!value && value !== false;
                    break;
                
                case 'integer':
                    value |= 0;
                    break;

                case 'number':
                    value = +value;
                    break;
            }

            if (name = storage.valueField)
            {
                for (var i = 0, l = items.length; i < l; i++)
                {
                    if ((storage = items[i]) && storage[name] === value)
                    {
                        return i;
                    }
                }

                return -1;
            }

            return items.indexOf(value);
        }

        return -1;
    };


    //获取选中项
    this.selectedItem = function (field) {

        var storage = this.__storage,
            item = storage && (item = storage.items) && item[this.selectedIndex()];
        
        if (field)
        {
            if (field = storage && storage[field])
            {
                item = item ? item[field] : '';
            }

            return item !== void 0 ? '' + item : '';
        }

        return item;
    };


    //获取选中值
    this.selectedValue = function () {

        return this.selectedItem('valueField');
    };


    this.text = function () {

        return this.selectedItem('displayField');
    };



    //弹出日历窗口
    this.popup = this.__on_click = function () {

        var popup = this.__get_popup(),
            storage = this.__storage || this.__defaults,
            listbox = this.__get_listbox();

        this.__before_popup(popup, listbox, storage);

        listbox.border(0)
            .columns(storage.columns)
            .clear(storage.clear)
            .template(storage.template)
            .itemHeight(storage.itemHeight)
            .valueField(storage.valueField)
            .displayField(storage.displayField)
            .type(storage.type)
            .items(storage.items)
            .value(storage.value);

        listbox.target = this;
        listbox.popup = popup;

        popup.push(listbox);
        popup.show(this);
    };


    this.__before_popup = function (popup, listbox, storage) {
    };


    this.__get_listbox = function () {

        return listbox_cache = new flyingon.ListBox().on('change', function (e) {
            
            this.target.value(e.value);
            this.popup.close();
        });
    };



}).register();



flyingon.ComboBox.extend('RadioComboBox', function (base) {


    var listbox_cache;


    this.__get_listbox = function () {

        return listbox_cache = new flyingon.RadioListBox().on('change', function (e) {
            
            this.target.value(e.value);
            this.popup.close();
        });
    };


}).register();



flyingon.ComboBox.extend('CheckComboBox', function (base) {



    var listbox_cache;
    

    //多值时的分隔符
    this.defineProperty('separator', ',');




    this.selectedIndex = function () {
        
        var list = [],
            storage = this.__storage,
            items,
            value,
            any;

        if (storage && (items = storage.items) && items.length > 0 && (value = storage.value))
        {
            value = storage.value.split(storage.separator);

            any = storage.type;

            if (any !== 'string')
            {
                for (var i = value.length - 1; i >= 0; i--)
                {
                    switch (any)
                    {
                        case 'boolean':
                            value[i] = !!value[i] && value[i] !== false;
                            break;

                        case 'integer':
                            value[i] |= 0;
                            break;

                        case 'number':
                            value[i] = +value[i];
                            break;
                    }
                }
            }

            if (any = storage.valueField)
            {
                for (var i = 0, l = items.length; i < l; i++)
                {
                    if ((storage = items[i]) && value.indexOf(storage[any]) >= 0)
                    {
                        list.push(i);
                    }
                }
            }
            else
            {
                for (var i = 0, l = items.length; i < l; i++)
                {
                    if (value.indexOf(items[i]) >= 0)
                    {
                        list.push(i);
                    }
                }
            }
        }

        return list;
    };


    //获取选中项集合
    this.selectedItem = function (field) {

        var list = [],
            storage = this.__storage,
            name = field && storage[field],
            items,
            item,
            selected,
            length;

        if (storage && (items = storage.items) && (selected = this.selectedIndex()) && (length = selected.length) > 0)
        {
            for (var i = 0; i < length; i++)
            {
                item = items[selected[i]];

                if (name)
                {
                    item && list.push(item[name]);
                }
                else
                {
                    list.push(item);
                }
            }
        }

        return field ? list.join() : list;
    };


    //获取选中项集合
    this.selectedValue = function () {

        return this.selectedItem('valueField');
    };


    //获取选中项集合
    this.text = function () {

        return this.selectedItem('displayField');
    };




    this.__get_listbox = function () {

        return listbox_cache = new flyingon.CheckListBox().on('change', function (e) {
            
            this.target.value(e.value);
        });
    };


    this.__before_popup = function (popup, listbox, storage) {

        listbox.separator(storage.separator);
    };



}).register();




//日历控件
flyingon.Control.extend('Calendar', function (base) {



    this.defaultWidth = this.defaultHeight = 240;


    this.defaultValue('border', 1);

    this.defaultValue('padding', 8);


    function define(self, name, defaultValue, type) {

        self.defineProperty(name, defaultValue, {

            dataType: type,

            set: function () {

                if (this.rendered && !this.__location_dirty)
                {
                    this.renderer.set(this, 'refresh');
                }
            }
        });
    };


    //日期值
    define(this, 'value', null, 'date');


    //最小可选值
    define(this, 'min', '');


    //最大可选值
    define(this, 'max', '');


    //是否编辑年月
    define(this, 'month', false);


    //是否显示时间
    define(this, 'time', false);


    //是否显示今天按钮
    define(this, 'today', false);


    //是否显示清除按钮
    define(this, 'clear', false);
    
    
    
}).register();




flyingon.TextButton.extend('DatePicker', function (base) {


    //日历控件
    var calendar_cache;


    this.defaultValue('button', 'f-datepicker-button');


    //日期值
    this.defineProperty('value', null, {
        
        dataType: 'date',

        set: function () {

            this.rendered && this.renderer.set(this, 'text');
        }
    });


    this.defineProperty('format', 'locale-date', {
        
        set: function () {

            this.rendered && this.renderer.set(this, 'text');
        }
    });


    //最小可选值
    this.defineProperty('min', '');


    //最大可选值
    this.defineProperty('max', '');


    //是否显示时间
    this.defineProperty('time', false);


    //是否显示今天按钮
    this.defineProperty('today', false);


    //是否显示清除按钮
    this.defineProperty('clear', false);



    this.text = function () {

        var storage = this.__storage || this.__defaults,
            value = storage.value;

        return value ? value.format(storage.format) : ''
    };


    //弹出日历窗口
    this.popup = this.__on_click = function () {

        var popup = this.__get_popup(),
            storage = this.__storage || this.__defaults,
            calendar = calendar_cache;

        if (!calendar)
        {
            calendar = calendar_cache = new flyingon.Calendar();
            calendar.border(0).on('selected', function (e) {
                
                this.target.value(e.value);
                this.popup.close();
            });
        }

        calendar.value(storage.value)
            .min(storage.min)
            .max(storage.max)
            .time(storage.time)
            .today(storage.today)
            .clear(storage.clear);

        calendar.oncheck = this.oncheck;
        calendar.target = this;
        calendar.popup = popup;

        popup.push(calendar);
        popup.show(this);
    };



}).register();




flyingon.TextBox.extend('TimePicker', function (base) {


    //值
    this.defineProperty('value', '', {
        
        check: function (value) {

            if (value && (value = value.match(/\d+/g)))
            {
                value.length = 3;

                value[1] |= 0;
                value[2] |= 0;

                return value.join(':');
            }

            return '';
        },

        set: function () {

            this.rendered && this.renderer.set(this, 'text');
        }

    });


    //格式化
    this.defineProperty('format', '', {
        
        set: function () {

            this.rendered && this.renderer.set(this, 'text');
        }
    });


    this.text = function () {

        var storage = this.__storage || this.__defaults,
            value = storage.value,
            format;

        if (value && (format = storage.format))
        {
            value = value.split(':');
            return new Date(2000, 1, 1, value[0] | 0, value[1] | 0, value[2] | 0).format(format);
        }

        return value;
    };



}).register();




flyingon.TextButton.extend('MonthPicker', function (base) {



    //日历控件
    var calendar_cache;


    this.defaultValue('button', 'f-datepicker-button');



    //日期值
    this.defineProperty('value', null, {
        
        dataType: 'date',

        set: function () {

            this.rendered && this.renderer.set(this, 'text');
        }
    });


    this.defineProperty('format', 'yyyy-MM', {
        
        set: function () {

            this.rendered && this.renderer.set(this, 'text');
        }
    });


    //最小可选值
    this.defineProperty('min', '');


    //最大可选值
    this.defineProperty('max', '');



    this.text = function () {

        var storage = this.__storage || this.__defaults,
            value = storage.value;

        return value ? value.format(storage.format) : ''
    };


    //弹出日历窗口
    this.popup = this.__on_click = function () {

        var popup = this.__get_popup(),
            storage = this.__storage || this.__defaults,
            calendar = calendar_cache;

        if (!calendar)
        {
            calendar = calendar_cache = new flyingon.Calendar();
            calendar.border(0).month(true).on('selected', function (e) {
                
                this.target.value(e.value);
                this.popup.close();
            });
        }

        calendar.value(storage.value).min(storage.min).max(storage.max);

        calendar.oncheck = this.oncheck;
        calendar.target = this;
        calendar.popup = popup;

        popup.push(calendar);
        popup.show(this);
    };



}).register();




Object.extend('TreeNode', function () {



    //扩展可视组件功能
    flyingon.fragment('f-visual', this);



    //标记是树节点
    this.isTreeNode = true;


    //是否展开
    this.expanded = false;


    //选中的子项数量
    this.checkedChildren = 0;
    


    function define(self, name, defaltValue) {

        return self.defineProperty(name, defaltValue, {

            set: function (value) {

                this.rendered && this.renderer.set(this, name, value);
            }
        });
    };


    //节点图标
    define(this, 'icon', '');


    //节点文本
    define(this, 'text', '');


    //是否禁用
    define(this, 'disabled', false);


    //是否选中
    this.defineProperty('checked', false, {
        
        set: function (value) {

            var parent = this.parent;

            while (parent && parent.isTreeNode)
            {
                if (!(value ? parent.checkedChildren++ : --parent.checkedChildren) && 
                    parent.view && !parent.checked())
                {
                    parent.renderer.set(parent, 'checked', false);
                }

                parent = parent.parent;
            }

            this.rendered && this.renderer.set(this, 'checked', value);
            this.trigger('checked-change', 'value', value);
        }
    });



    //是否启用延时加载
    this.defineProperty('delay', false);



    //扩展容器功能
    flyingon.fragment('f-container', this, flyingon.TreeNode);


    //创建子控件
    this.__create_child = function (options, Class) {

        var node = new Class(),
            storage = node.__storage || (node.__storage = flyingon.create(node.__defaults));

        for (var name in options)
        {
            switch (name)
            {
                case 'text':
                case 'icon':
                    storage[name] = '' + options[name];
                    break;

                case 'checked':
                    storage[name] = !!options[name];
                    break;

                case 'expanded':
                    if (options[name])
                    {
                        node.expanded = true;
                    }
                    break;

                case 'children':
                case 'items':
                    node.push.apply(node, options[name]);
                    break;

                default:
                    storage[name] = options[name];
                    break;
            }
        }

        return node;
    };


    //获取节点级别
    this.level = function () {

        var target = this.parent,
            index = 0;

        while (target && target.isTreeNode)
        {
            index++;
            target = target.parent;
        }

        return index;
    };



}).register();




flyingon.Control.extend('Tree', function (base) {



    this.defaultWidth = 200;
    
    this.defaultHeight = 300;

        
    this.defaultValue('border', 1);
    

    this.defaultValue('padding', 2);



    function define(self, name, defaltValue) {

        return self.defineProperty(name, defaltValue, {

            set: function (value) {

                this.rendered && this.renderer.set(this, name, value);
            }
        });
    };


    //树风格
    //default   默认风格
    //blue      蓝色风格
    //plus      加减风格
    //line      线条风格
    define(this, 'theme', 'default');



    //是否显示检查框
    define(this, 'checked', false);


    //是否显示图标
    define(this, 'icon', true);


    //是否可编辑
    this.defineProperty('editable', false);


    //格式化函数
    this.format = null;



    //扩展容器功能
    flyingon.fragment('f-container', this, flyingon.TreeNode.init());


    this.__create_child = flyingon.TreeNode.prototype.__create_child;



    //展开节点
    this.expand = function (node) {

        if (node)
        {
            this.__expand_node(node);
        }
        else
        {
            for (var i = 0, l = this.length; i < l; i++)
            {
                this.__expand_node(this[i]);
            }
        }

        return this;
    };


    this.__expand_node = function (node) {

        if (!node.expanded && this.trigger('expand', 'node', node) !== false)
        {
            node.expanded = true;
            node.rendered && node.renderer.set(node, 'expand');
        }
    };


    //展开节点至指定级别
    this.expandTo = function (node, level) {

        if (arguments.length < 2)
        {
            level = node;
            node = null;
        }

        this.__expand_to(node || this, level | 0);
        return this;
    };


    this.__expand_to = function (nodes, level) {

        level--;

        for (var i = nodes.length - 1; i >= 0; i--)
        {
            var node = nodes[i];

            if (!node.expanded)
            {
                if (this.trigger('expand', 'node', node) === false)
                {
                    continue;
                }

                node.expanded = true;
                node.rendered && node.renderer.set(node, 'expand');
            }

            if (node.length > 0)
            {
                if (level)
                {
                    this.__expand_to(node, level);
                }
                else
                {
                    //收拢最后一级
                    for (var j = node.length - 1; j >= 0; j--)
                    {
                        var item = node[j];

                        if (item.expanded && this.trigger('collapse', 'node', node) !== false)
                        {
                            item.expanded = false;
                            item.rendered && item.renderer.set(item, 'collapse');
                        }
                    }
                }
            }
        }
    };


    //收拢节点
    this.collapse = function (node) {

        if (node)
        {
            this.__collapse_node(node);
        }
        else
        {
            for (var i = 0, l = this.length; i < l; i++)
            {
                this.__collapse_node(this[i]);
            }
        }

        return this;
    };


    //收拢节点
    this.__collapse_node = function (node) {

        if (node.expanded && node.length > 0 && this.trigger('collapse', 'node', node) !== false)
        {
            node.expanded = false;
            node.rendered && node.renderer.set(node, 'collapse');
        }
    };



    this.beginEdit = function () {

    };


    this.endEdit = function () {

    };


    this.findNode = function (fn) {

        if (typeof fn === 'function')
        {
            return find(this, fn);
        }
    };


    function find(nodes, fn) {

        for (var i = 0, l = nodes.length; i < l; i++)
        {
            var node = nodes[i];

            if (fn(node))
            {
                return node;
            }

            if (node.length > 0 && (node = find(node, fn)))
            {
                return node;
            }
        }
    };


    this.current = function (node) {

        var any = this.__current;
        
        if (any)
        {
            any.__current = false;
        }

        if (this.__current = node)
        {
            node.__current = true;
        }

        if (this.rendered)
        {
            any && any.renderer.current(any, false);
            node && node.renderer.current(node, true);
        }
    };


    this.scrollTo = function (node) {

        this.rendered && this.renderer.scrollTo(this, node);
    };


    this.dispose = function () {

        for (var i = this.length - 1; i >= 0; i--)
        {
            this[i].dispose(false);
        }

        base.dispose.apply(this, arguments);
        return this;
    };



}).register();




(flyingon.GridColumn = Object.extend(function () {



    var Class = flyingon.Label;

    var create = flyingon.create;



    this.init = function (options) {

        //列头控件集合
        this.__cells = [];

        if (options)
        {
            var properties = this.__properties;

            for (var name in options)
            {
                if (properties[name])
                {
                    this[name](options[name]);
                }
            }
        }
    };



    //列类型
    this.type = '';


    //绑定的字段名
    this.defineProperty('name', '', { 
        
        set: function (value) {

            var grid = this.grid;

            this.__name = value;
               
            if (grid && grid.rendered)
            {
                grid.__columns.__keys = null;
                grid.update();
            }
        }
    });


    //标题 值为数组则为多行标题
    this.defineProperty('title', null, { 
        
        set: function (value) {

            var any;

            if (this.view)
            {
                this.view = false;

                //销毁原单元格
                if (any = this.__cells)
                {
                    for (var i = any.length - 1; i >= 0; i--)
                    {
                        any[i].view = null;
                        any[i].dispose();
                    }

                    any = any.__span;
                }

                this.__set_title(value);

                if (this.grid)
                {
                    //原来有跨列可现在有跨列则需重计算列
                    this.grid.update(any || this.__cells.__span > 0);
                }
            }
            else
            {
                this.__set_title(value);
            }
        }
    });


    //列大小(支持固定数字及百分比)
    this.defineProperty('size', '100', {

        set: function (value) {

            var grid;
            
            if (this.view && (grid = this.grid))
            {
                grid.update(true);
            }
        }
    });


    this.fullClassName = this.defaultClassName = '';

    //自定义class
    this.defineProperty('className', '', {

        set: function (value) {

            if (value && this.defaultClassName)
            {
                value += ' ' + this.defaultClassName;
            }

            this.fullClassName = value ? ' ' + value : '';
        }
    });


    //对齐方式
    //left
    //center
    //right
    this.defineProperty('align', '', {

        set: function (value) {

            this.__align = value;
        }
    });


    //是否只读
    this.defineProperty('readonly', false, {

        set: function (value) {

            this.__readonly = value;
            this.view && this.renderer.set(this, name, value);
        }   
    });


    this.__visible = true;

    //是否显示
    this.defineProperty('visible', true, {

        set: function (value) {

            var grid = this.grid;

            this.__visible = value;

            if (grid && grid.rendered)
            {
                grid.update(true);
            }
        }
    });


    //是否可调整列宽
    this.defineProperty('resizable', true);


    //是否可点击列头排序
    this.defineProperty('sortable', true);


    //是否可拖动调整顺序
    this.defineProperty('draggable', true);


    //过滤方式
    this.defineProperty('filter', 'auto');


    //汇总设置
    //MAX:      最大值
    //MIN:      最小值
    //AVG:      平均值
    //SUM:      求和
    this.defineProperty('summary', '', { 
        
        set: function update() {

            var grid = this.grid;

            if (grid && grid.rendered)
            {
                grid.__summary_list = this.__summary_fn = null;
                grid.update();
            }
        }
    });


    //汇总数字精度
    this.defineProperty('precision', 0);



    this.__set_title = function (title) {

        var cells = this.__cells;

        cells.length = 0;
        this.__span = false;

        if (title instanceof Array)
        {
            for (var i = 0, l = title.length; i < l; i++)
            {
                this.__create_header(Class, cells, title[i]);
            }
        }
        else
        {
            this.__create_header(Class, cells, title);
        }

        return cells;
    };


    this.__create_header = function (Class, cells, title) {

        var control, size, span;

        if (title && typeof title === 'object')
        {
            size = title.size | 0;
            span = title.span | 0;

            if (control = title.control)
            {
                control = flyingon.ui(control);
            }
            else
            {
                title = title.text;
            }
        }
        
        if (!control)
        {
            control = new Class();

            if (title)
            {
                (control.__storage = create(control.__defaults)).text = '' + title;
            }
        }

        if (size > 0)
        {
            control.__height = size;
        }

        if (span > 0)
        {
            control.__span = span;
            this.__span = true;
        }

        cells.push(control);
    };


    this.index = function () {

        var columns = this.grid.__columns;

        if (columns.__show_tag !== this.__show_tag)
        {
            return columns.indexOf(this);
        }

        return this.__index;
    };


    this.__find_text = function () {

        var title = this.title(),
            any;

        if (title && typeof title === 'object')
        {
            if (title instanceof Array)
            {
                if ((any = title[0]) && any.__span)
                {
                    return any && any.text || any;
                }

                any = title[title.length - 1];
                return any && any.text || any;
            }
            
            return title.text;
        }

        return title;
    };


    this.__span_size = function (count) {

        var columns = this.grid.__columns,
            index = this.__index,
            size = 0,
            column;

        while (count > 0 && (column = columns[index + count]))
        {
            size += column.__size;
            count--;
        }

        return size;
    };


    //创建单元格控件
    this.createControl = function (row, name) {

       var control = new Class();
        
        if (name)
        {
            (control.__storage = create(control.__defaults)).text = row.data[name];
        }

        return control;
    };



    //绑定表格列渲染器
    flyingon.renderer.bind(this, 'GridColumn');



    //列初始化处理
    this.__class_init = function (Class, base) {
     
        var any;

        if (any = this.defaultClassName)
        {
            this.fullClassName = ' ' + any;
        }
    };



})).register = function (name, force) {
    
    if (name)
    {
        var all = flyingon.GridColumn.all || (flyingon.GridColumn.all = flyingon.create(null));

        if (!force && all[name])
        {
            throw 'column "' + name + '" has exist';
        }

        all[this.type = name] = this;
    }

    return this;
};



//行号列
flyingon.GridColumn.extend(function (base) {


    this.defaultClassName = 'f-grid-column-no';


    this.__name = '__column_no';


    this.defaultValue('size', 25);


    this.defaultValue('draggable', false);


    this.defaultValue('resizable', false);


    //是否显示行号
    this.defineProperty('no', false, {

        set: function (value) {
            
            this.__show_no = value;
        }
    });


    this.onshowing = function (cell, row) {

        if (this.__show_no)
        {
            cell.text(row.__show_index + 1);
        }
    };


}).register('no');



//选择列
flyingon.GridColumn.extend(function (base) {


    var Class = flyingon.CheckBox;


    this.defaultClassName = 'f-grid-column-check';


    this.__name = '__column_check';
    

    this.defaultValue('size', 30);


    this.defaultValue('draggable', false);


    this.defaultValue('resizable', false);


    //创建单元格控件
    this.createControl = function (row) {

       var control = new Class();
        
        control.__column_check = true;

        if (row.checked)
        {
            control.value(true);
        }

        return control;
    };


}).register('check');



//检查框列
flyingon.GridColumn.extend(function (base) {


    var Class = flyingon.CheckBox;


    //创建单元格控件
    this.createControl = function (row, name) {

       var control = new Class();
        
        if (name && row.data[name])
        {
            control.value(true);
        }

        return control;
    };


}).register('checkbox');



//文本框列
flyingon.GridColumn.extend(function (base) {


    var Class = flyingon.TextBox;


    //创建单元格控件
    this.createControl = function (row, name) {

       var control = new Class();
        
        if (name)
        {
            control.value(row.data[name]);
        }

        return control;
    };


}).register('textbox');



//文本按钮列
flyingon.GridColumn.extend(function (base) {


    var Class = flyingon.TextButton;


    //创建单元格控件
    this.createControl = function (row, name) {

       var control = new Class();
        
        if (name)
        {
            control.value(row.data[name]);
        }

        return control;
    };


}).register('textbutton');



//数字列
flyingon.GridColumn.extend(function (base) {


    var Class = flyingon.NumberPicker;


    //创建单元格控件
    this.createControl = function (row, name) {

       var control = new Class();
        
        if (name)
        {
            control.value(row.data[name]);
        }

        return control;
    };


}).register('number');



//下拉框列
flyingon.GridColumn.extend(function (base) {


    var Class = flyingon.ComboBox;


    //创建单元格控件
    this.createControl = function (row, name) {

       var control = new Class();
        
        if (name)
        {
            control.value(row.data[name]);
        }

        return control;
    };


}).register('combobox');



//日期列
flyingon.GridColumn.extend(function (base) {


    var Class = flyingon.DatePicker;


    //创建单元格控件
    this.createControl = function (row, name) {

       var control = new Class();
        
        if (name)
        {
            control.value(row.data[name]);
        }

        return control;
    };


}).register('date');



//时间列
flyingon.GridColumn.extend(function (base) {


    var Class = flyingon.TimePicker;


    //创建单元格控件
    this.createControl = function (row, name) {

       var control = new Class();
        
        if (name)
        {
            control.value(row.data[name]);
        }

        return control;
    };


}).register('time');



//表格列集合
flyingon.GridColumns = Object.extend(function () {


    this.init = function (grid) {

        this.grid = grid;
        this.__locked = [0, 0, 0, 0];
    };

    

    flyingon.fragment('f-collection', this);


    
    this.__check_items = function (index, items, start) {

        var Class = flyingon.GridColumn,
            columns = Class.all,
            grid = this.grid,
            end = items.length,
            any;

        this.__keys = null;

        while (start < end)
        {
            any = items[start];

            if (any instanceof Class)
            {
                if (any.grid)
                {
                    any.remove();
                }
            }
            else
            {
                items[start] = any = new (any && columns[any.type] || Class)(any);
            }

            any.grid = grid;
            start++;
        }

        grid.rendered && grid.update(true);
    };


    this.__remove_items = function (index, items) {

        var grid = this.grid,
            item;

        this.__keys = null;

        for (var i = 0, l = items.length; i < l; i++)
        {
            item = items[i];
            item.grid = null;

            if (item.view)
            {
                item.renderer.unmount(item);
            }
        }

        grid.rendered && grid.update(true);
    };



    //计算可见列索引范围
    this.__compute_visible = function (x, scroll) {

        var locked = this.__locked,
            start = locked[0],
            end = this.length,
            column,
            left,
            any;

        if (end <= 0)
        {
            return;
        }

        this.__arrange_start = x;

        x += locked[2];
        end -= locked[1];

        //计算开始位置
        for (var i = start; i < end; i++)
        {
            if ((column = this[i]) && column.__visible && column.__start + column.__size >= x)
            {
                start = i;
                break;
            }
        }

        //计算结束位置
        any = x + this.__arrange_size - locked[2] - locked[3];

        for (var i = start; i < end; i++)
        {
            if ((column = this[i]) && column.__visible && column.__start > any)
            {
                end = i + 1;
                break;
            }
        }

        //记录可见范围
        this.__visible_start = start;
        this.__visible_end = end;

        //滚动时如果未超出上次渲染范围则返回true
        if (scroll && this.__show_start <= start && this.__show_end >= end)
        {
            return true;
        }

        //多渲染部分列以减少滚动处理
        any = end + 2;
        end = this.length - locked[1];
        end = any > end ? end : any;

        //处理跨列偏移
        start -= this[start].__offset; 

        if (any = this.grid.oncolumnstart)
        {
            any = any.call(this.grid, this, start);

            if (any >= 0)
            {
                start = any;
            }
        }

        this.__show_start = start;
        this.__show_end = end;
    };


    //计算列宽
    this.__compute_size = function (width) {

        var locked = this.__locked,
            group = this.grid.__group_size, //分组偏移大小
            size = group,
            mod = 0,
            start = locked[0],
            end = this.length,
            any;

        this.__arrange_size = width;
        this.__persent = false;

        //计算前锁定
        if (start > 0)
        {
            mod = compute_size(this, width, group, 0, start, mod);

            group = 0;
            size += (locked[2] = this.__size);
        }

        //计算后锁定
        if ((any = locked[1]) > 0)
        {
            mod = compute_size(this, width, 0, end - any, end, mod);
            end -= any;

            size += (locked[3] = this.__size);
        }

        //计算滚动区
        compute_size(this, width, group + locked[2], start, end, mod);

        this.__size += size;
    };


    //计算列大小
    function compute_size(columns, total, left, start, end, mod) {

        var width = 0,
            span = -1,
            persent,
            column,
            size,
            any;

        while (start < end)
        {
            column = columns[start];

            column.__index = start++;
            column.__offset = 0; //前置偏移

            if (!column.__visible)
            {
                continue;
            }

            size = (column.__storage || column.__defaults).size;
            
            if (size >= 0)
            {
                size |= 0;
            }
            else if ((size = parseFloat(size)) > 0)
            {
                persent = true;

                any = size * total / 100;
                size = any | 0;

                if ((any -= size) > 0 && (mod += any) >= 1)
                {
                    mod--;
                    size++;
                }
            }

            column.__start = left;
            column.__size = size;

            left += size;
            width += size;

            //检测是否需要跨列处理
            if (span < 0 && column.__span)
            {
                span = start - 1;
            }
        }

        //记录宽度和
        columns.__size = width;

        //处理跨列
        if (span >= 0)
        {
            start = span;

            while (start < end)
            {
                column = columns[start];

                if (column.__span)
                {
                    compute_span(columns, start, end, column.__cells);
                }

                start++;
            }
        }

        if (persent)
        {
            columns.__persent = true;
        }

        return mod;
    };


    //计算跨列
    function compute_span(columns, index, end, cells) {

        for (var i = cells.length - 1; i >= 0; i--)
        {
            var cell = cells[i],
                span = cell.__span,
                count = span, //实际跨列数
                column,
                size;

            if (span > 0)
            {
                size = columns[index].__size;

                while (span > 0) //计算到结束位置则提前终止
                {
                    if (index + span < end && (column = columns[index + span]))
                    {
                        if (column.__offset < span)
                        {
                            column.__offset = span;
                        }

                        if (column.__visible)
                        {
                            size += column.__size;
                        }
                    }
                    else
                    {
                        count--;
                    }

                    span--;
                }

                cell.__size = size;
            }

            //实际跨列数
            cell.columnSpan = count;
        }
    };


    //缓存列名
    function cache_name(columns) {

        var keys = columns.__keys = flyingon.create(null),
            index = 0,
            column,
            any;

        while (column = columns[index++])
        {
            if ((any = column.__storage) && (any = any.name))
            {
                keys[any] = column;
            }
        }

        return keys;
    };


    //查找指定名称的表格列
    this.find = function (name) {

        return (this.__keys || cache_name(this))[name];
    };


    //同步因分组隐藏的列
    this.__sync_visible = function () {

        for (var i = this.length - 1; i >= 0; i--)
        {
            var column = this[i],
                storage;

            if (!column.__visible && (!(storage = column.__storage) || storage.visible))
            {
                column.__visible = true;
            }
        }
    };


    this.dispose = function () {

        for (var i = this.length - 1; i >= 0; i--)
        {
            var item = this[i];

            item.grid = null;

            if (item.view)
            {
                item.renderer.unmount(item);
            }
        }

        this.grid = null;
    };


});



//表格行
flyingon.GridRow = Object.extend._(function () {

    
    //行id
    this.id = 0;

    //上级行
    this.parent = null;

    //行数据
    this.data = null;
    
    //是否展开
    this.expanded = false;



    //获取行级别
    this.level = function () {

        var parent = this.parent,
            level = 0;

        while (parent)
        {
            level++;
            parent = parent.parent;
        }

        return level;
    };


    //获取或设置当前行是否勾选
    this.checked = function (checked) {

        if (checked === void 0)
        {
            return this.__checked || false;
        }

        if (this.__checked !== (checked = !!checked))
        {
            var rows = this.grid.__checked_rows;

            if (checked)
            {
                rows.push(this);
            }
            else
            {
                rows.splice(rows.indexOf(this), 1);
            }

            this.view && this.renderer.set(this, 'checked', this.__checked = checked);
        }
    };


    //销毁
    this.dispose = function () {

        var length = this.length;

        if (length > 0)
        {
            for (var i = length - 1; i >= 0; i--)
            {
                this[i].dispose();
            }
        }

        this.grid = null;
        this.view && this.renderer.unmount(this);
    };



    flyingon.renderer.bind(this, 'GridRow');

    
});



//分组行
flyingon.GroupGridRow = Object.extend._(function (base) {



    //分组行标记
    this.__group_row = true;


    //上级行
    this.parent = null;

    //行数据
    this.data = null;


    //分组列名
    this.name = '';

    //行级别
    this.level = 0;


    //是否展开
    this.expanded = false;


    //总子项数(含子项的子项)
    this.total = 0;



    //计算汇总信息
    this.compute = function (column, name, fn, summary) {

        var data = this.data,
            any;

        if (data && name in data)
        {
            any = data[name];
        }
        else if ((any = this.length) > 0)
        {
            //如果子行是分组行,先计算子分组
            if (this.__sub_group)
            {
                for (var i = 0; i < any; i++)
                {
                    this[i].compute(column, name, fn);
                }
            }

            (data || (this.data = {}))[name] = any = fn(this, name);
        }
        else
        {
            any = 0;
        }
        
        return summary ? summary(this, name, any) : any;
    };



    //销毁
    this.dispose = function () {

        var length = this.length;

        if (length > 0)
        {
            for (var i = length - 1; i >= 0; i--)
            {
                this[i].dispose();
            }
        }

        this.grid = null;
        this.view && this.renderer.unmount(this);
    };


    flyingon.renderer.bind(this, 'GroupGridRow');


});



//表格视图
flyingon.GridView = flyingon.defineClass(Array, function () {



    var create = Object.create;



    this.init = function (grid) {

        this.grid = grid;
        this.view = []; //显示视图集
        this.keys = flyingon.create(null);
    };



    //从dataset加载数据行
    this.dataset = function (dataset) {

        var grid = this.grid,
            any;

        if (this.length > 0)
        {
            this.dispose(false);
        }

        init_rows(flyingon.GridRow, this.keys, grid, this, null, dataset);

        if (this.__group_view = !!(any = grid.__groups))
        {
            group_view(this, any);
        }

        this.__dirty = true;
    };


    //根据数据集初始化表格行
    function init_rows(Class, keys, grid, view, parent, rows) {

        var row, any;

        for (var i = 0, l = view.length = rows.length; i < l; i++)
        {            
            any = rows[i];

            row = view[i] = new Class();
            row.grid = grid;
            row.parent = parent;
            row.data = any.data;

            keys[row.id = any.uniqueId] = row;

            if (any.length > 0)
            {
                init_rows(Class, keys, grid, row, row, any);
            }
        }
    };


    //切换分组
    this.__change_group = function (groups) {

        //如果当前是分组视图,需先销毁原分组行
        if (this.__group_view)
        {
            ungroup_view(this);
        }

        //如果当前有排序则重新排序
        if (this.__sort)
        {
            this.sort.apply(this, this.__sort);
        }

        //标记是否分组视图
        if (this.__group_view = !!groups)
        {
            group_view(this, groups);
        }
        
        this.__dirty = true;
    };


    //分组视图
    function group_view(self, groups) {

        var rows = self.splice(0);

        if (rows.length > 0)
        {
            rows = group_rows(flyingon.GroupGridRow, self.grid, null, rows, groups, 0, 0);
            rows.push.apply(self, rows);
        }
    };


    function group_rows(Class, grid, parent, rows, groups, index, level) {

        var view = [],
            name = groups[index++],
            keys = group_data(rows, name),
            next = !!groups[index],
            row,
            text;

        for (var i = 0, l = keys.length; i < l; i++)
        {
            if (rows = keys[text = keys[i]])
            {
                row = new Class();

                row.grid = grid;
                row.parent = parent;
                row.name = name,
                row.text = text;

                row.level = level;
                row.total = rows.length;
                
                //标记子行是否是分组行
                if (row.__sub_group = next)
                {
                    rows = group_rows(Class, grid, row, rows, groups, index, level + 1);
                }

                view.push.apply(row, rows);
                view.push(row);
            }
        }

        return view;
    };


    function group_data(rows, name) {

        var keys = [],
            row,
            data,
            key,
            any;

        for (var i = 0, l = rows.length; i < l; i++)
        {
            if ((row = rows[i]) && (data = row.data) && (key = data[name]) != null)
            {
                if (any = keys[key])
                {
                    any.push(row);
                }
                else
                {
                    keys.push(key);
                    keys[key] = [row];
                }
            }
        }

        if (keys.length > 0)
        {
            keys.sort();
        }

        return keys;
    };


    //解除分组
    function ungroup_view(self) {

        var rows = self.splice(0),
            any;

        //显示分组列
        self.grid.__columns.__sync_visible();

        if (rows.length > 0)
        {
            ungroup_rows(rows, any = []);
            any.push.apply(self, any);
        }
    };


    function ungroup_rows(rows, exports) {

        var splice = exports.splice,
            row, 
            any;

        for (var i = 0, l = rows.length; i < l; i++)
        {
            if (row = rows[i])
            {
                row.renderer.unmount(row);

                if (row.__sub_group)
                {
                    ungroup_rows(row, exports);
                }
                else if ((any = splice.call(row, 0)).length > 0)
                {
                    for (var j = any.length - 1; i >= 0; i--)
                    {
                        any[j].parent = null;
                    }

                    exports.push.apply(exports, any);
                }
            }
        }
    };



    //同步展开视图
    this.__sync_view = function () {

        var view = this.view;

        this.__dirty = false;

        view.length = 0;

        if (this.__group_view)
        {
            sync_view(view, this);
        }
        else
        {
            view.push.apply(view, view.slice.call(this, 0));
        }

        return view;
    };


    function sync_view(view, rows) {

        for (var i = 0, l = rows.length; i < l; i++)
        {
            var row = rows[i];

            view.push(row);

            if (row.expanded && row.length > 0)
            {
                sync_view(view, row);
            }
        }
    };



    //展开指定行(仅供界面操作用)
    this.__expand_row = function (row) {

        if (row && !row.expanded && this.grid.trigger('expand', 'row', row) !== false)
        {
            row.expanded = true;

            if (row.length > 0)
            {
                var view = this.view,
                    rows = [row.__show_index + 1, 0];

                expand_rows(row, rows);
                rows.splice.apply(view, rows);

                this.grid.update();
            }
            else
            {
                return false; //告知展开后无子节点
            }
        }
    };


    //收拢指定行(仅供界面操作用)
    this.__collapse_row = function (row) {

        if (row && row.expanded && row.length > 0 && this.grid.trigger('collapse') !== false)
        {
            row.expanded = false;

            this.view.splice(row.__show_index + 1, expand_count(row));
            this.grid.update();
        }
    };


    //获取展开表格行集合
    function expand_rows(rows, exports) {

        var row;

        for (var i = 0, l = rows.length; i < l; i++)
        {
            if (row = rows[i])
            {
                exports.push(row);

                if (row.expanded && row.length > 0)
                {
                    expand_rows(row, exports);
                }
            }
        }
    };


    //获取展开表格行数量
    function expand_count(rows) {

        var length = rows.length,
            count = length,
            row;

        for (var i = 0; i < length; i++)
        {
            if ((row = rows[i]) && row.expanded)
            {
                count += expand_count(row);
            }
        }

        return count;
    };


    //根据id查找指定行
    this.find = function (id) {

        return this.keys[id] || null;
    };


    //排序
    this.sort = function (name, desc, tree) {

        if (this.length > 0)
        {
            var sort = this.view.sort,
                fn;

            if (desc)
            {
                fn = function (a, b) {

                    return a.data[name] > b.data[name] ? -1 : 1;
                };
            }
            else
            {
                fn = function (a, b) {

                    return a.data[name] > b.data[name] ? 1 : -1;
                };
            }
        
            if (this.__group_view)
            {
                sort_group(this, fn, sort, tree);
            }
            else if (tree)
            {
                sort_tree(this, fn, sort);
            }
            else
            {
                sort.call(this, fn);
            }

            this.__sort = [name, desc, tree];
            this.__dirty = true;
        }
    };


    function sort_group(rows, fn, sort, tree) {

        for (var i = rows.length - 1; i >= 0; i--)
        {
            var row = rows[i];

            if (row.__sub_group)
            {
                sort_group(row, fn, sort, tree);
            }
            else if (tree)
            {
                sort_tree(row, fn, sort);
            }
            else
            {
                sort.call(row, fn);
            }
        }
    };


    function sort_tree(rows, fn, sort) {

        sort.call(rows, fn);

        for (var i = rows.length - 1; i >= 0; i--)
        {
            var row = rows[i];

            if (row[0])
            {
                sort_tree(row, fn, sort);
            }
        }
    };


    //通过数据源增加表格行
    this.__add = function (index, rows, parent) {

        if (parent)
        {
            parent = this.keys[parent.uniqueId] || null;
        }

        rows = create_rows(flyingon.GridRow, this.keys, this.grid, parent, rows);

        if (parent || !this.__group_view)
        {
            rows.unshift(index, 0);
            rows.splice.apply(parent || this, rows);
        }
        else
        {

        }

        this.__dirty = true;
        this.grid.update(false);
    };


    function create_rows(Class, keys, grid, parent, items) {

        var rows = [],
            row, 
            any;

        for (var i = 0, l = items.length; i < l; i++)
        {            
            any = items[i];

            row = new Class();
            row.grid = grid;
            row.parent = parent;
            row.data = any.data;

            keys[row.id = any.uniqueId] = row;

            if (any.length > 0)
            {
                init_rows(Class, keys, grid, row, row, any);
            }

            rows.push(row);
        }

        return rows;
    };


    //通过数据源移除表格行
    this.__remove = function (index, rows, parent) {

        var keys = this.keys,
            group = false,
            row;

        if (parent)
        {
            parent = keys[parent.uniqueId];
        }

        if (parent || !this.__group_view)
        {
            group = true;
            rows.splice.call(parent || this, index, rows.length);
        }

        for (var i = rows.length - 1; i >= 0; i--)
        {
            if (row = keys[rows[i].uniqueId])
            {
                if (group)
                {
                
                }

                row.view = false;
                row.dispose();
            }
        }

        this.__dirty = true;
        this.grid.update(false);
    };



    //销毁
    this.dispose = function () {

        for (var i = this.length - 1; i >= 0; i--)
        {
            this[i].dispose();
        }

        this.view.splice.call(this, 0);
        this.view.length = 0;

        if (arguments[0] === false)
        {
            this.keys = flyingon.create(null);
        }
        else
        {
            this.grid = this.keys = null;
        }
    };


});



//表格控件
flyingon.Control.extend('Grid', function (base) {



    this.init = function () {

        this.__columns = new flyingon.GridColumns(this);
        this.__view = new flyingon.GridView(this);
        this.__checked_rows = [];
    };



    this.defaultWidth = 800;

    this.defaultHeight = 400;


    this.defaultValue('border', 1);



    //默认锁定行
    this.__locked_top = this.__locked_bottom = 0;


    //列位置或顺序已经变更
    this.__column_dirty = true;


    //分组偏移
    this.__group_size = 0;



    //表格列
    this.defineProperty('columns', null, {

        fn: function (value) {

            var columns = this.__columns;

            if (value === void 0)
            {
                return columns;
            }

            if (value >= 0)
            {
                return columns[value];
            }

            if (typeof value === 'string')
            {
                value = flyingon.parseJSON(value);
            }

            if (value instanceof Array)
            {
                columns.push.apply(columns, value);
            }
            else
            {
                columns.push(value);
            }
            
            return this;
        }
    });


    //分组框高度
    this.defineProperty('group', 0, {

        set: function (value) {
            
            if (value > 0)
            {
                this.renderer.set(this, '__render_group');
            }

            if (this.rendered)
            {
                this.renderer.set(this, 'header', 1);
                this.update();
            }
        }
    });


    //列头大小
    this.defineProperty('header', 30, {

        set: function (value) {

            if (this.rendered)
            {
                this.renderer.set(this, 'header', 2);
                this.update();
            }
        }
    });


    //过滤栏高度
    this.defineProperty('filter', 0, {

        set: function (value) {

            if (this.rendered)
            {
                this.renderer.set(this, 'filter', value);
                this.update();
            }
        }
    });


    //锁定 锁定多个方向可按 left->right->top->bottom 顺序以空格分隔
    this.defineProperty('locked', '', {

        set: function (value) {

            var locked = this.__columns.__locked;

            locked[0] = locked[1] = locked[2] = locked[3] = 
            this.__locked_top = this.__locked_bottom = 0;

            if (value && (value = value.match(/\d+/g)))
            {
                locked[0] = value[0] | 0;
                locked[1] = value[1] | 0;

                this.__locked_top = value[2] | 0;
                this.__locked_bottom = value[3] | 0;
            }

            this.rendered && this.update(true);
        }
    });


    //行高
    this['row-height'] = this.defineProperty('rowHeight', 25);


    //分组设置
    this.defineProperty('groups', '', {

        set: function (value) {

            var view = this.__view;

            this.__groups = value = value && value.match(/\w+/g) || null;
            this.__group_size = value ? value.length * 20 : 0;

            if (view.length > 0)
            {
                view.__change_group(value);
            }

            this.trigger(value ? 'group' : 'ungroup');

            this.renderer.set(this, '__render_group');
            this.rendered && this.update(true);
        }
    });


    //是否只读
    this.defineProperty('readonly', true);


    //选择模式
    //0  仅选择单元格
    //1  选择行
    //2  选择列
    //3  选择行及列
    this['selected-mode'] = this.defineProperty('selectedMode', 0);


    //树列名
    this['tree-column'] = this.defineProperty('treeColumn', '', {

        set: function (value) {

            this.__tree_column = value;
        }
    });


    //树列是否显示图标
    this['tree-icon'] = this.defineProperty('treeIcon', true);


    //数据集
    this.defineProperty('dataset', null, {

        fn: function (value) {

            var any = this.__dataset || null;

            if (value === void 0)
            {
                return any;
            }

            if (any === value && this.__watch_list && flyingon.__do_watch(this, 'dataset', value) === false)
            {
                return this;
            }

            this.__dataset = value;

            if (any) 
            {
                any.grid = null;
                any.subscribe(this, true);
                any.off('add', add_rows);
                any.off('remove', remove_rows);
            }

            if (value) 
            {
                value.subscribe(value.grid = this);
                value.on('add', add_rows);
                value.on('remove', remove_rows);

                this.subscribeBind(value, { type: 'bind' });
            }
            else
            {
                this.__view.dispose(false);
            }

            this.rendered && this.update();

            return this;
        }
    });


    
    //获取指定索引行或行集合
    this.rows = function (index) {
        
        var view = this.__view;

        if (index === void 0)
        {
            return view;
        }

        return view[index] || null;
    };



    //获取当前渲染视图
    this.currentView = function () {
    
        var view = this.__view;
        return view.__dirty ? view.__sync_view() : view.view;
    };



    function add_rows(e) {

        var grid = this.grid;

        grid.__view.__add(e.index, e.rows, e.parent);
        grid.update(false);
    };


    function remove_rows(e) {

        var grid = this.grid;

        grid.__view.__remove(e.index, e.rows, e.parent);
        grid.update(false);
    };



    //展开行
    this.expand = function (row) {

        var view = this.__view,
            dirty;

        if (row)
        {
            if (!row.expanded && this.trigger('expand', 'row', row) !== false)
            {
                dirty = 1;
                row.expanded = true;
            }
        }
        else
        {
            for (var i = 0, l = view.length; i < l; i++)
            {
                if ((row = view[i]) && !row.expanded && this.trigger('expand', 'row', row) !== false)
                {
                    dirty = 1;
                    row.expanded = true;
                }
            }
        }

        if (dirty)
        {
            view.__dirty = true;
            this.rendered && this.update();
        }

        return this;
    };


    //展开行到指定级别
    this.expandTo = function (row, level) {

        if (arguments.length < 2)
        {
            level = row;
            row = null;
        }

        if (this.__expand_to(row || this.__view, level | 0))
        {
            this.__view.__dirty = true;
            this.rendered && this.update();
        }

        return this;
    };

    
    this.__expand_to = function (rows, level) {

        var dirty;

        level--;

        for (var i = rows.length - 1; i >= 0; i--)
        {
            var row = rows[i];

            if (!row.expanded)
            {
                if (this.trigger('expand', 'row', row) === false)
                {
                    continue;
                }

                row.expanded = true;
                dirty = 1;
            }

            if (row.length > 0)
            {
                if (level)
                {
                    if (this.__expand_to(row, level))
                    {
                        dirty = 1;
                    }
                }
                else
                {
                    //收拢最后一级
                    for (var j = row.length - 1; j >= 0; j--)
                    {
                        var item = row[j];

                        if (item.expanded && this.trigger('collapse', 'row', row) !== false)
                        {
                            item.expanded = false;
                            dirty = 1;
                        }
                    }
                }
            }
        }

        return dirty;
    };


    //收拢行
    this.collapse = function (row) {

        var view = this.__view,
            dirty;

        if (row)
        {
            if (row.expanded && this.trigger('collapse', 'row', row) !== false)
            {
                dirty = 1;
                row.expanded = false;
            }
        }
        else
        {

            for (var i = 0, l = view.length; i < l; i++)
            {
                if ((row = view[i]) && row.expanded && this.trigger('collapse', 'row', row) !== false)
                {
                    dirty = 1;
                    row.expanded = false;
                }
            }
        }

        if (dirty)
        {
            view.__dirty = true;
            this.rendered && this.update();
        }

        return this;
    };


    //获取勾选中的行集合
    this.checkedRows = function () {

        return this.__checked_rows;
    };


    //获取当前行
    this.current = function () {

        return this.__current || null;
    };


    //切换当前行
    this.__set_current = function (row, sync) {

        var any = this.__current;

        if (any !== row)
        {
            this.__current = row;

            if (this.rendered)
            {
                any && any.renderer.set(any, 'current', any.__current = false);
                row && row.renderer.set(row, 'current', row.__current = true);
            }

            if (sync !== false && (any = this.__dataset))
            {
                any.moveTo(row && any.uniqueId(row.id) || null);
            }
        }
    };


    
    //标记订阅所有dataset变更动作
    this.__subscribe_all = true;


    //处理数据源变更通知
    this.subscribeBind = function (dataset, action) {

        var view = this.__view,
            row = action.row || dataset.current(),
            any;

        row = row && view.find(row.uniqueId) || null;

        switch (action.type)
        {
            case 'move':
                this.__set_current(row, false);
                break;

            case 'change':
                if (row && (any = row.__cells) && (any = any[action.name]))
                {
                    (any.value || any.text).call(any, row.data[action.name]);
                }
                break;

            case 'bind':
                view.dataset(dataset);
                this.__set_current(row, false);
                break;
        }
    };


    //值变更处理
    this.__change_value = function (control) {

        var dataset = this.__dataset,
            column = control.column,
            name,
            any;

        if (dataset && column && (name = column.__name))
        {
            if (any = dataset.uniqueId(control.row.id))
            {
                any.set(name, (control.value || control.text).call(control));
            }
        }
    };



    this.sort = function (name, desc) {

        if (name)
        {
            this.__view.sort(name, desc, !!this.__tree_column);
            this.update(false);
        }
    };


    //刷新表格
    this.update = function (change) {

        if (this.rendered)
        {
            var patch = this.__view_patch;

            if (change)
            {
                this.__column_dirty = true;
            }

            if (!patch || !patch.content)
            {
                this.renderer.set(this, 'content', true);
            }
        }
        
        return this;
    };



    this.dispose = function () {

        this.__columns.dispose();
        this.__view.dispose();

        this.__columns = this.__view = this.__checked_rows = null;

        base.dispose.call(this);
    };



}).register();



//定义或获取表格汇总函数
flyingon.Grid.summary = (function () {
    

    var keys = flyingon.create(null);


    function fn(type, fn, summary) {

        //不区分大小写
        type = type.toLowerCase();

        if (typeof fn === 'function')
        {
            keys[type] = [fn, summary];
        }
        else
        {
            return keys[type] || keys.sum;
        }
    };


    fn('sum', function (row, name) {

        var value = 0,
            any;

        for (var i = row.length - 1; i >= 0; i--)
        {
            if ((any = row[i]) && (any = any.data))
            {
                value += any[name];
            }
        }

        return value;
    });


    fn('avg', keys.sum[0], function (row, name, value) {

        return value / row.total;
    });


    fn('max', function (row, name) {

        var value = -Infinity,
            any;

        for (var i = row.length - 1; i >= 0; i--)
        {
            if ((any = row[i]) && (any = any.data) && (any = any[name]) > value)
            {
                value = any;
            }
        }

        return value;
    });


    fn('min', function (row, name) {

        var value = Infinity,
            any;

        for (var i = row.length - 1; i >= 0; i--)
        {
            if ((any = row[i]) && (any = any.data) && (any = any[name]) < value)
            {
                value = any;
            }
        }

        return value;
    });


    return fn;

})();




flyingon.Panel.extend('TabPage', function (base) {



    this.defaultValue('layout', 'vertical-line');

    

    //自定义key
    this.defineProperty('key', '');


    
    function define(self, name, defaultValue) {

        return self[name] = self.defineProperty(name, defaultValue, {

            set: function (value) {
            
                this.rendered && this.renderer[name](this, value);
            }
        });
    };
    

    //图标
    define(this, 'icon', '');


    //页头文字
    define(this, 'text', '');


    //自定义button列表
    define(this, 'buttons', '');

    
    //是否可关闭
    define(this, 'closable', false);



    this.selected = function () {

        var parent = this.parent,
            storage;

        return parent && (storage = parent.__storage) && parent[storage.selected] === this || false;
    };
    


}).register();




flyingon.Control.extend('Tab', function (base) {



    this.defineWidth = this.defaultHeight = 300;

    this.defaultValue('border', 1);
    

    //页头偏移距离
    this.__scroll_header = 0;


    //是否需要重算页头
    this.__reset_header = true;



    //页头样式
    //default   默认样式
    //dot       圆点样式
    this.defineProperty('theme', 'default', {

        set: function (value) {

            this.rendered && this.renderer.set(this, 'theme', value);
        }
    });



    //定义页面签属性
    var define = function (self, name, defaultValue, view) {

        self.defineProperty(name, defaultValue, {

            set: function (value) {

                this.__reset_header = true;
                this.__update_dirty || this.invalidate();
            }
        });
    };


    //页签方向
    //top       顶部页签
    //left      左侧页签
    //right     右侧页签
    //bottom    底部页签
    define(this, 'direction', 'top');


    //页头大小
    define(this, 'header', 30);


    //页头偏移
    define(this, 'offset', 2);


    //滚动按钮大小
    define(this, 'scroll', 16);



    define = function (self, name, defaultValue) {

        self.defineProperty(name, defaultValue, {

            set: function () {

                this.__update_dirty || this.invalidate();
            }
        });
    };



    //页签大小
    define(this, 'size', 60);


    //是否自动充满
    define(this, 'fill', false);


    //开始位置
    define(this, 'start', 0);


    //结束位置
    define(this, 'end', 0);


    //页签间距
    define(this, 'space', 2);



    //选中页索引
    this.defineProperty('selected', -1, { 

        set: function (value) {

            this.__selectedPage !== true && this.selectedPage(this[value], false);
        }
    });



    //获取或设置选中页面
    this.selectedPage = function (page, tag) {

        var selected = this.__selectedPage,
            any;

        if (page === void 0)
        {
            return selected !== void 0 ? selected : (this.__selectedPage = this[this.selected()]);
        }

        if (selected !== page && (!page || page.parent === this))
        {
            if (selected && selected.view_head)
            {
                 selected.renderer.selected(selected, false);
            }

            if (page)
            {
                if (page && page.view_head)
                {
                    page.renderer.selected(page, true);
                }

                this.rendered && this.renderer.set(this, 'selected', page, 'tag', tag);

                any = this.indexOf(page);
            }
            else
            {
                page = null;
                any = -1;
            }

            if (arguments[1] !== false)
            {
                this.__selectedPage = true;
                this.selected(any);
            }

            this.__selectedPage = page;
            this.trigger('tab-change', 'current', page, 'last', selected, 'tag', tag);
        }

        return this;
    };



    //扩展容器功能
    flyingon.fragment('f-container', this, flyingon.TabPage, true);


    var remove_items = this.__remove_items;


    this.__remove_items = function (index, items) {

        var selected = this.selected();

        remove_items.apply(this, arguments);

        this.selectedPage(this[selected] || this[--selected] || null, 'remove');
    };


    this.findByKey = function (key, selected) {

        for (var i = this.length - 1; i >= 0; i--)
        {
            if (this[i].key() === key)
            {
                selected && this.selected(i);
                return this[i];
            }
        }
    };


    this.findByText = function (text, selected) {

        for (var i = this.length - 1; i >= 0; i--)
        {
            if (this[i].text() === text)
            {
                selected && this.selected(i);
                return this[i];
            }
        }
    };



}).register();




/**
* 弹出层组件
* 
* 事件:
* open: 打开事件
* autoclosing: 鼠标点击弹出层外区域时自动关闭前事件(可取消)
* closing: 关闭前事件(可取消)
* closed: 关闭后事件
*/
flyingon.Panel.extend('Popup', function () {



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

        this.rendered && this.renderer.close(this);
        this.shown = false;

        this.trigger('closed', 'closeType', closeType);

        if (this.autoDispose)
        {
            this.dispose();
        }

        return this;
    };
    


}).register();




flyingon.Panel.extend('Dialog', function (base) {



    //窗口栈
    var stack = [];



    //设置为顶级控件
    this.__top_control = true;


    //窗口是否已显示
    this.shown = false;


    this.defaultValue('border', 1);

    this.defaultValue('padding', 2);

    this.defaultValue('movable', true);



    //头部高度        
    this.defineProperty('header', 28, {

        set: function (value) {

            this.rendered && this.renderer.set(this, 'header', value);
            this.__update_dirty || this.invalidate();
        }
    });


    //窗口图标        
    this.defineProperty('icon', '', {

        set: function (value) {

            this.rendered && this.renderer.set(this, 'icon', value);
        }
    });


    //窗口标题
    this.defineProperty('text', '', {

        set: function (value) {

            this.rendered && this.renderer.set(this, 'text', value);
        }
    });


    //是否显示关闭按钮
    this.defineProperty('closable', true, {

        set: function (value) {

            this.rendered && this.renderer.set(this, 'closable', value);
        }
    });



    //测量自动大小
    this.onmeasure = function (auto) {
        
        if (auto)
        {
            base.onmeasure.call(this, auto);

            if (auto & 2)
            {
                this.offsetHeight += this.header();
            }
        }
        else
        {
            return false;
        }
    };


    this.arrangeArea = function () {

        var header = this.header();

        this.arrangeHeight -= header;
        this.arrangeBottom -= header;
    };



    this.show = function () {
        
        this.renderer.show(this);
        this.shown = true;

        this.active();

        return this;
    };


    this.showDialog = function () {
        
        this.renderer.show(this, true);
        this.shown = true;

        this.active();

        return this;
    };


    this.moveTo = function (x, y) {

        this.shown && this.renderer.moveTo(this, x, y);
    };


    this.center = function () {

        this.shown && this.renderer.center(this);
    };


    this.active = function () {

        var last = stack[stack.length - 1];

        if (last !== this)
        {
            var index = stack.indexOf(this);

            if (index >= 0)
            {
                stack.splice(index, 1);
            }

            stack.push(this);

            if (last)
            {
                last.renderer.active(last, false);
                last.trigger('deactivated');
            }

            this.renderer.active(this, true);
            this.trigger('activated');
        }
        else if (last)
        {
            this.renderer.active(this, true);
        }
    };


    this.activated = function () {

        return stack[stack.length - 1] === this;
    };

        
    this.close = function (closeType) {

        if (!closeType)
        {
            closeType = 'ok';
        }

        if (this.trigger('closing', 'closeType', closeType) !== false)
        {
            this.rendered && this.renderer.close(this);
            this.shown = false;

            stack.splice(stack.indexOf(this), 1);

            stack[0] && stack[stack.length - 1].active();

            this.trigger('closed', 'closeType', closeType);

            if (this.autoDispose)
            {
                this.dispose();
            }
        }

        return this;
    };



}).register();




//子布局
flyingon.Sublayout = flyingon.Control.extend(function (base) {
       
    
        
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
flyingon.Layout = Object.extend(function () {

    

    
    //布局类型
    this.type = '';

    
    
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
            
            this.arrange(container, items, hscroll, vscroll);
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
    
       
    
    //扩展可序列化功能
    flyingon.fragment('f-serialize', this);
    
    
    
    //设置不反序列化type属性
    this.deserialize_type = true;
    


});




//布局基础方法
(function () {



    //注册的布局列表
    var all = flyingon.Layout.all = flyingon.create(null); 
    
    //已定义的布局集合
    var layouts = flyingon.create(null); 

    //反序列化读
    var reader = new flyingon.SerializeReader();

    


    //重写布局类注册方法
    flyingon.Layout.register = function (name, force) {

        if (name)
        {
            if (!force && all[name])
            {
                throw 'layout "' + name + '" has exist';
            }

            layouts[name] = [all[this.type = name] = this, null];
        }

        return this;
    };



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
  
        return new all.flow();
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

        return new all.flow();
    };
    

    //反序列化布局实例
    function deserialize_layout(data, adaption) {
        
        if (typeof data === 'function')
        {
            return new data();
        }

        //数组为自适应布局
        if (adaption !== false && data instanceof Array)
        {
            return data;
        }
        
        var layout = new (all[data && data.type] || all.flow)();
        
        layout.deserialize(reader, data);
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

        

})();



//充满容器空间
flyingon.Layout.extend(function (base) {


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
            control.measure(width, height, width, height, 3);
            control.locate(x, y, width, height);
        }
    };
    
    
}).register('fill');



//单列布局类
flyingon.Layout.extend(function (base) {

        
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
    
    
}).register('line');



//纵向单列布局类
flyingon.Layout.extend(function (base) {

        
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
    
    
}).register('vertical-line');



//流式布局类
flyingon.Layout.extend(function (base) {



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

    
}).register('flow');



//纵向流式布局类
flyingon.Layout.extend(function (base) {


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

    
}).register('vertical-flow');



//停靠布局类
flyingon.Layout.extend(function (base) {

    
    //排列布局
    this.arrange = function (container, items, hscroll, vscroll) {

        var x = container.arrangeLeft,
            y = container.arrangeTop,
            width = container.arrangeWidth,
            height = container.arrangeHeight,
            right = container.arrangeRight = x + width, //不允许出现滚动条
            bottom = container.arrangeBottom = y + height, //不允许出现滚动条
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
                    control.locate(x, y, 0, height);

                    x = control.offsetLeft + control.offsetWidth + control.marginRight + spacingX;

                    if ((width = right - x) < 0)
                    {
                        width = 0;
                    }
                    break;

                case 'top':
                    control.measure(arrangeWidth, arrangeHeight, width, height, 1);
                    control.locate(x, y, width, 0);

                    y = control.offsetTop + control.offsetHeight + control.marginBottom + spacingY;

                    if ((height = bottom - y) < 0)
                    {
                        height = 0;
                    }
                    break;

                case 'right':
                    control.measure(arrangeWidth, arrangeHeight, width, height, 2);
                    
                    right -= control.offsetWidth - control.marginLeft - control.marginRight;
                    control.locate(right, y, 0, height);

                    if ((width = (right -= spacingX) - x) < 0)
                    {
                        width = 0;
                    }
                    break;

                case 'bottom':
                    control.measure(arrangeWidth, arrangeHeight, width, height, 1);
                    
                    bottom -= control.offsetHeight - control.marginTop - control.marginBottom;
                    control.locate(x, bottom, width, 0);

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
                control.locate(x, y, width, height);
            }
        }
    };

    
}).register('dock');



//层叠布局类
flyingon.Layout.extend(function (base) {

    
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
    
    
}).register('cascade');



//绝对定位布局类
flyingon.Layout.extend(function (base) {

    
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
    
    
}).register('absolute');



//均分布局
flyingon.Layout.extend(function (base) {
    


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
    
    
}).register('uniform');




//表格布局类
flyingon.Layout.extend(function (base) {

    

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
    

    
    //解析布局
    function parse(text) {
        
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
    var Cell = Object.extend(function () {
        
                
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
    var Group = Object.extend(function () {
        

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
    
    
}).register('table');




(function (flyingon) {



    var components = flyingon.components;

    var unkown = flyingon.HtmlElement;

    var reader = new flyingon.SerializeReader();


    var uniqueId = flyingon.__uniqueId;


    var create = flyingon.create;


    var array_base = Array.prototype;

    var array_like = create(array_base);

    var slice = array_base.slice;

    var push = array_base.push;

    var splice = array_base.splice;


    //当前依赖参数
    //0: 控件id
    //1: 模板节点
    //2: 绑定名称
    var depend_target;

    var depend_cache = [null, null, null];





    //创建视图
    flyingon.view = function (options) {

        var template = view_template('view', options),
            defaults = options.defaults,
            control,
            vm,
            any;

        template.parse();

        if (vm = template.analyse())
        {
            vm = new (compile_object(vm, ''))(null, defaults);
        }

        template = template.ast;

        if (!(control = options.control))
        {
            control = template.Class;

            if (any = components[control])
            {
                control = new any();
            }
            else
            {
                control = new unkown();
                control.tagName = control;
            }
        }

        if (any = options.creating)
        {
            any.call(control, vm || {});
        }

        if (vm)
        {
            init_control(control, control.vmodel = vm, template);
        }
        else
        {
            control.deserialize(reader, template);
        }

        if (any = options.created)
        {
            any.call(control, vm || {});
        }

        if (any = options.host)
        {
            flyingon.show(control, any);
        }

        return control;
    };


    //创建部件
    flyingon.widget = function (name, options) {

        if (typeof name !== 'string')
        {
            options = name;
            name = '';
        }

        var template = view_template('widget', options),
            Class = components[template.parse().Class] || unkown;

        Class = Class.extend(widget_fn);

        Class.__widget_options = options;
        Class.__widget_template = template;

        if (name)
        {
            Class.register(name, options.force);
        }
        else //匿名widget立即初始化类
        {
            Class.init();
        }

        return Class;
    };


    function widget_fn(base) {

        var template = this.Class.__widget_template,
            options = this.Class.__widget_options,
            vmodel = template.analyse(),
            creating = options.creating,
            created = options.created,
            defaults,
            any;

        template = template.ast;

        if (vmodel)
        {
            vmodel = compile_object(any = vmodel, '');

            defaults = options.defaults;

            if (typeof defaults === 'function')
            {
                defaults = defaults.call(this, vmodel.prototype);
            }

            for (name in any)
            {
                if (any[name])
                {
                    widget_property(this, name, defaults && defaults[name] || null);
                }
            }
        
            //扩展widget元型或视图模型
            if (any = options.extend)
            {
                any.call(this, vmodel.prototype);
            }

            this.init = function () {

                var vm = this.vmodel = new vmodel(null, defaults),
                    any;

                if (any = creating)
                {
                    any.call(this, vm);
                }

                init_control(this, vm, template);

                if (any = created)
                {
                    any.call(this, vm);
                }
            };

            this.dispose = function () {

                var vm = this.vmodel;

                if (vm)
                {
                    vm.$dispose();
                    this.vmodel = null;
                }

                base.dispose.apply(this, arguments);
                return this;
            };
        }
        else
        {
            //扩展widget元型或视图模型
            if (any = options.extend)
            {
                any.call(this, {});
            }

            this.init = function () {

                var any;

                if (any = creating)
                {
                    any.call(this, {});
                }

                this.deserialize(reader, template);

                if (any = created)
                {
                    any.call(this, {});
                }
            };
        }

    };

    
    function widget_property(self, name, defaultValue) {

        var key1 = name,
            key2 = name;

        if (name.indexOf('-') > 0)
        {
            key1 = name.replace(/-(\w)/g, camelize);
        }
        else
        {
            key2 = name.replace(/([A-Z])/g, '-$1').toLowerCase();
        }

        self[key2] = self.defineProperty(key1, defaultValue || null, {

            set: function (value) {

                this.vmodel.$set(name, value);
            }
        });
    };


    function camelize(_, key) {

        return key.toUpperCase();
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

        if (typeof template === 'string' && template.charAt(0) === '#')
        {
            template = (template = flyingon.dom_id(template)) && template.innerHTML || '';
        }

        return new flyingon.view.Template(template);
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
                        item_track(vm, scope, any);
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
                        item_track(scope.__loop_vm, scope, any);
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

        var keys = vm.__depends || (vm.__depends = create(null));
        push.apply(keys[name] || (keys[name] = []), depends);
    };


    //添加数组项值变化依赖追踪
    function item_track(vm, control, depends) {

        var keys = keys = vm.__depends || (vm.__depends = create(null)),
            id = control.__uniqueId || (control.__uniqueId = uniqueId.id++);

        push.apply(keys[id] || (keys[id] = []), depends);
    };


    //更新指定绑定
    function update_bind(vm, scope, depends) {

        var index = 0,
            item;

        while (item = depends[index++])
        {
            item.set(depends[index++], bind_value(item, vm, scope, depends[index++]));
        }
    };




    //编译对象视图模型类
    function compile_object(node, name) {


        var self = Class.prototype;

        var keys1 = self.__keys1 = create(null);

        var keys2 = self.__keys2 = create(null);


        function Class(parent, value) {

            var keys, fn;

            this.__top = (this.__parent = parent) ? parent.__top : this;
            
            if (value)
            {
                if (typeof value === 'object')
                {
                    keys = this.__keys1;

                    for (var name in keys)
                    {
                        if (fn = keys[name])
                        {
                            this[name] = new fn(this, value[name]);
                        }
                        else
                        {
                            this[name] = value[name];
                        }
                    }
                }
                else if (parent)
                {
                    throw '"' + this.$name + '" must input a object!';
                }
            }
            else
            {
                keys = this.__keys2;

                for (var name in keys)
                {
                    this[name] = new keys[name](this);
                }

                value = null;
            }

            this.$data = value;
        };


        self.$name = name;
        self.$watch = watch;
        self.$get = object_get;
        self.$set = object_set;
        self.$replace = object_replace;
        self.$update = object_update;
        self.$dispose = object_dispose;


        //顶层视图绑定事件
        if (!name)
        {
            self.eventBubble = '__up_vm';

            self.$on = flyingon.on;
            self.$once = flyingon.once
            self.$off = flyingon.off;
            self.$trigger = flyingon.trigger;
        }


        for (var name in node)
        {
            var item = node[name];

            if (item[1] > 0) //function || item || index
            {
                continue;
            }

            switch (item[0])
            {
                case 1: //object
                    keys1[name] = keys2[name] = compile_object(item[4], item[1]);
                    break;

                case 2: //loop
                    keys1[name] = keys2[name] = compile_array(item);
                    break;

                default:
                    keys1[name] = 0;
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

        var any = this.__keys1[name];

        if (any)
        {
            if (any = this[name])
            {
                any.$replace(value);
                notify(this, name, value, any);
            }
        }
        else if (any === 0 && (any = this[name]) !== value)
        {
            this[name] = value;

            notify(this, name, value, any);

            if ((any = this.__depends) && (any = any[name]))
            {
                update_bind(this, null, any);
            }
        }

        return this;
    };


    function object_replace(value, update) {

        var keys = this.__keys1,
            data = this.$data;

        //记录原始数据
        this.$data = value = value && typeof value === 'object' ? value : null;

        for (var name in keys)
        {
            if (keys[name])
            {
                this[name].$replace(value && value[name], false);
            }
            else if (value || data)
            {
                this[name] = value && value[name];
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
            for (var name in keys)
            {
                update_bind(this, null, keys[name]);
            }
        }

        if (keys || this.__top.__created)
        {
            keys = this.__keys2;

            for (var name in keys)
            {
                this[name].$update();
            }
        }
    };

    
    function object_dispose() {

        var keys = this.__keys1;

        for (var name in keys)
        {
            if (keys[name])
            {
                this[name].$dispose();
            }
            else
            {
                this[name] = null;
            }
        }

        this.__top = this.__parent = this.__depends = this.__watches = this.$data = null;
    };


           

    //编译数组视图模型类
    function compile_array(node) {

        
        var self = Class.prototype = create(array_like);


        function Class(parent, value) {

            var fn = this.__item_fn,
                length = value && value.length;

            this.__top = (this.__parent = parent).__top;
            
            if (length > 0)
            {
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
        

        //数组项是一个对象
        if (node[0] === 1 || (node = node[4]) && node[0] === 1)
        {
            self.__item_fn = compile_object(node[4], node[2]);
        }
        else if (node && node[0] === 2) //数组项是一个数组
        {
            self.__item_fn = compile_array(node[4]);
        }

        return Class;
    };


    function array_get(index) {

        var value;

        if (value = depend_target)
        {
            item_track(this, this.__controls[index], value);
        }

        return this[index];
    };


    function array_set(index, value) {

        var control, any;

        if (index >= 0)
        {
            if (index < this.length)
            {
                any = this[index];

                if (any && any.$replace)
                {
                    any.$replace(value);
                }
                else if (any !== value)
                {
                    this[index] = value;

                    if ((any = this.__depends) && 
                        (index = this.__controls[index]) && 
                        (index = index.__uniqueId) &&
                        (any = any[index]))
                    {
                        update_bind(this, null, any);
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

        var l1 = this.length,
            l2 = (value && value.length) | 0,
            any;

        if (l2 <= 0)
        {
            if (l1 > 0)
            {
                this.splice(0);
            }
            
            return this;
        }

        if (l1 > l2)
        {
            this.splice(l2);
            l1 = l2;
        }

        if (l1 > 0)
        {
            if (this.__item_fn)
            {
                for (var i = 0; i < l1; i++)
                {
                    this[i].$replace(value[i]);
                }
            }
            else
            {
                any = slice.call(value, 0, l1);
                any.unshift(0, l1);

                splice.apply(this, any); 
            }

            if (update !== false)
            {
                this.$update();
            }
        }

        if (l1 < l2)
        {
            this.push.apply(this, slice.call(value, l1));
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

        if (deep !== false && this.__item_fn && this.__controls)
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
                this[i].$dispose();
            }
        }

        this.__top = this.__parent = this.__depends = this.__watches = 
        this.__controls = this.__template = this.__tag = this.__container = null;

        return this;
    };


    //类数组方法扩展
    array_like.push = function (item) {

        var index = this.length,
            length = arguments.length;

        if (length > 0)
        {
            if (this.__item_fn)
            {
                append_check(this, arguments, 0);
            }

            push.apply(this, arguments);

            //插入节点
            if (this.__controls)
            {
                append_loop(this, index, index += length);
            }
        }

        return index;
    };


    array_like.pop = function () {
        
        var length = this.length;

        if (length > 0)
        {
            remove_item(this, length - 1);
            return array_base.pop.call(this);
        }
    };


    array_like.unshift = function (item) {

        var length = arguments.length;

        if (length > 0)
        {
            if (this.__item_fn)
            {
                append_check(this, arguments, 0);
            }

            array_base.unshift.apply(this, arguments);

            //插入节点
            if (this.__controls)
            {
                append_loop(this, 0, length); 
            }

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
            remove_item(this, 0);

            item = array_base.shift.call(this);

            if (this.length > 1)
            {
                adjust_index(this, 0, -1);
            }

            return item;
        }
    };


    array_like.splice = function (index, length) {

        var l1 = this.length,
            l2 = arguments.length,
            any;

        if ((index |= 0) < 0 && (index += l1) < 0)
        {
            index = 0;
        }
        else if (index > l1)
        {
            index = l1;
        }

        if (l2 > 2 && this.__item_fn)
        {
            append_check(this, arguments, 2);
        }

        any = splice.apply(this, arguments);

        if (any.length > 0)
        {
            remove_items(this, index, any);
        }

        //插入节点
        if ((l2 -= 2) > 0 && this.__controls)
        {
            append_loop(this, index, index += l2); 
        }

        if (index < this.length && (l2 -= any.length))
        {
            adjust_index(this, index, l2);
        }

        return any;
    };


    array_like.sort = function (fn) {

        var sort = array_base.sort,
            length = this.length;

        if (length > 1)
        {
            var controls = this.__controls,
                item;
            
            //如果有子循环则移动视图(解决嵌套数组更新的问题)
            if (this.__item_fn)
            {
                if (controls)
                {
                    //先记录原控件
                    for (var i = length - 1; i >= 0; i--)
                    {
                        this[i].__control = controls[i];
                    }

                    //排序
                    sort.call(this, fn);

                    //再按照新的位置重编控件索引
                    for (var i = length - 1; i >= 0; i--)
                    {
                        item = this[i];
                        controls[i] = item.__control;
                        item.__control = null;
                    }

                    adjust_sort(this, controls);
                }
                else
                {
                    sort.call(this, fn);
                }
            }
            else //否则直接同步绑定
            {
                sort.call(this, fn);
                controls && this.$update();
            }
        }
    };


    array_like.reverse = function () {
             
        if (this.length > 1)
        {       
            var controls = this.__controls,
                reverse = array_base.reverse;

            //如果有子循环则移动视图(解决嵌套数组更新的问题)
            if (this.__item_fn)
            {
                if (controls)
                {
                    reverse.call(this);
                    controls.reverse();

                    adjust_sort(this, controls);
                }
                else
                {
                    reverse.call(this);
                }
            }
            else //否则直接同步绑定
            {
                reverse.call(this);
                controls && this.$update();
            }
        }
    };


    function append_check(vm, list, index) {

        var fn = vm.__item_fn;

        for (var i = index, l = list.length; i < l; i++)
        {
            list[i] = new fn(vm, list[i]);
        }
    };


    function remove_item(vm, index) {
    
        var controls = vm.__controls,
            control,
            any;

        if (controls)
        {
            control = controls[index]
            controls.splice(index, 1);

            if (control && (any = vm.__depends))
            {
                delete any[control.__uniqueId];
            }

            if (any = vm.__container)
            {
                any.splice(index, 1);
            }
        }

        if (vm.__item_fn)
        {
            vm[index].$dispose();
        }
    };


    function remove_items(vm, index, list) {

        var controls = vm.__controls,
            depends = vm.__depends,
            length = list.length,
            any;

        if (controls)
        {
            if (depends)
            {
                for (var i = 0; i < length; i++)
                {
                    if (any = controls[index + i])
                    {
                        delete depends[any.__uniqueId];
                    }
                }
            }
            
            controls.splice(index, length);

            if (any = vm.__container)
            {
                any.splice(index, length);
            }
        }
        
        if (vm.__item_fn)
        {
            for (var i = 0; i < length; i++)
            {
                list[i].$dispose();
            }
        }
    };


    function adjust_index(vm, start, offset) {

        var controls = vm.__controls,
            control;

        for (var i = start, l = controls.length; i < l; i++)
        {
            if (control = controls[i])
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

        var parent = vm.__container,
            item;

        if (parent)
        {
            for (var i = list.length - 1; i >= 0; i--)
            {
                (parent[i] = item = list[i]).__loop_index = i;
            }

            if (vm.__depends)
            {
                vm.$update(false);
            }

            parent.renderer.set(parent, '__view_order');
            parent.invalidate();
        }
    };




    //根据编译后的视图模型初始化或创建控件
    function init_control(control, vm, template) {

        var scope = create(null),
            any;

        //标记已创建控件
        vm.__created = true;

        bind_control(control, vm, scope, template);

        if (any = template.children)
        {
            create_children(control, vm, scope, any, components);
        }
    };


    function create_control(vm, scope, template, components, type) {

        var control, any;

        any = template.Class;

        if (type || (type = components[any]))
        {
            control = new type();
        }
        else
        {
            control = new unkown();
            control.tagName = any;
        }

        if (any = control.vm)
        {
            any.__up_vm = vm.__top;
        }

        bind_control(control, vm, scope, template);

        if (any = template.children)
        {
            create_children(control, vm, scope, any, components);
        }

        return control;
    };


    function bind_control(control, vm, scope, template) {

        var depend = depend_target = depend_cache,
            node,
            any;

        depend[0] = control;

        for (var name in template)
        {
            switch (name)
            {
                case 'Class':
                case 'children':
                case '#loop':
                    break;

                case '#model': //模型指令特殊处理
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

                        case '@': //事件
                            control.on(name.substring(1), bind_event(vm, node));
                            break;

                        case '#': //指令
                            if (any = control[name])
                            {
                                depend[1] = name;
                                depend[2] = node;

                                any.call(control, bind_value(control, vm, scope, node));
                            }
                            break;

                        default:
                            if (node && (typeof node === 'string') && node.charAt(0) === '{' && (any = node.match(/^\{\{(\w+)\}\}$/)))
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
            if ((node = template[i]) && node['#loop'])
            {
                controls.push.apply(controls, create_loop(parent, vm, scope, node, components));
            }
            else
            {
                controls.push(create_control(vm, scope, node, components));
            }
        }

        if (controls[0])
        {
            parent.push.apply(parent, controls);
        }
    };


    function create_loop(parent, vm, scope, template, components) {

        var controls = [], 
            item = template['#loop'],
            loop = item[2],
            any;
        
        if (item[3])
        {
            vm = bind_vm(parent, vm, scope, item)[loop];
        }
        else if (any = scope && scope[loop])
        {
            vm = any.__loop_vm[any.__loop_index];
        }
        else
        {
            vm = vm[loop];
        }

        vm.__template = template;
        vm.__container = parent;
        vm.__controls = controls;
        vm.__tag = parent.lastChild; //记录标记位作为插入的起点,如果手动移动此控件后果自负

        if ((any = vm.length) > 0)
        {
            loop_controls(controls, vm, 0, any, scope, components);
        }

        return controls;
    };


    function loop_controls(list, vm, start, end, scope, components) {

        var top = vm.__top,
            template = vm.__template,
            tag = template.Class,
            type = components[tag],
            node = template['#loop'],
            item = node.item,
            index = node.index,
            control,
            any;
        
        if (item || index)
        {
            while (start < end)
            {
                if (type)
                {
                    control = new type();
                }
                else
                {
                    control = new unkown();
                    control.tagName = tag;
                }

                if (any = control.vm)
                {
                    any.__up_vm = top;
                }

                //为后述查找缓存数据
                control.__loop_vm = vm;
                control.__loop_index = start++;
                
                if (item)
                {
                    scope[item] = control;
                }

                if (index)
                {
                    scope[index] = control;
                }

                bind_control(control, top, scope, template);
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


    function append_loop(vm, index, end) {

        var list = [],
            parent = vm.__container,
            controls = vm.__controls,
            control = parent,
            scope = {},
            name,
            any;

        while (control)
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

            control = control.parent;
        }

        loop_controls(list, vm, index, end, scope, components);

        if (any = controls[0])
        {
            any = parent.indexOf(any);
        }
        else if (any = vm.__tag)
        {
            any = parent.indexOf(any) + 1;
        }
        else
        {
            any = 0;
        }

        list.unshift(index, 0);
        controls.splice.apply(controls, list);

        list[0] += any;
        parent.splice.apply(parent, list);
    };




})(flyingon);




//视图模板类
flyingon.view.Template = Object.extend(function () {



    //标签嵌套规则
    var rule = flyingon.view.rule = flyingon.create(null);



    this.init = function (template) {

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
    this.parse = function (multi) {

        var ast = this.ast,
            any;

        if (!ast && (any = this.template))
        {
            any = any.replace(/<!--[\s\S]*?-->/g, '').replace(/>\s+<\s*\//g, '></');
            any = any.match(/[<=/]|[\w-:#@]+|\>[^<>]+(?=\<\s*\/)|[>/]|"[^"]*"|'[^']*'/g);

            ast = parse(any, []);

            if (!multi && ast instanceof Array)
            {
                if (ast[1])
                {
                    throw 'template can only one root node!';
                }

                ast = ast[0];
            }

            if (ast)
            {
                if (ast['#loop'])
                {
                    throw 'template root nood can not use "#loop"!';
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

            return this.vm = null;
        }

        return vm;
    };



    //解析html模板
    function parse(tokens, array) {

        var regex_node = /[^\w-]/,
            regex_name = /[^\w-:#@]/,
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
                        if (!item || tokens[index] !== item.Class || tokens[index + 1].charAt(0) !== '>')
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

                    any = { Class: token };

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
                        break;
                    }

                    throw parse_error(token, item);

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
                        break;
                    }

                    throw parse_error(token, item);


                default:
                    if (flag)
                    {
                        if (name)
                        {
                            item[name] = true;
                        }

                        flag = token.charAt(0);

                        //处理标签间的文本
                        if (item && flag === '>')
                        {
                            name = null;
                            flag = false;

                            if ((token = token.substring(1)).indexOf('&') >= 0)
                            {
                                token = flyingon.html_decode(token);
                            }

                            item.text = token;
                        }
                        else
                        {
                            if (token.match(regex_name))
                            {
                                throw '"<' + item.Class + '...' + token + '" not a valid attribute name!';
                            }

                            name = token;
                        }
                    }
                    break;
            }
        }

        return array;
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

        //节点容错处理
        if ((item = ast.Class) && (item = rule[item]) && (any = ast.children) && any[0])
        {
            check_rule(item, ast, any);
        }

        for (var name in ast)
        {
            switch (name)
            {
                case 'Class':
                case 'children':
                case '#loop':
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
                    case '#': //指令
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
                (item['#loop'] ? analyse_loop : analyse_object)(node, item);
            }
        }
    };


    function analyse_loop(node, ast) {

        var keys = ast['#loop'].match(/[\w.-]+/g),
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

        ast['#loop'] = loop;
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


    //检查标签规则,符合配置规则时替换标签以解决html不合法嵌套带来的dom结构混乱的问题
    function check_rule(rule, ast, children) {

        var check = rule[0],
            tag = rule[1] || check,
            flag = typeof check === 'string';
        
        for (var i = 0, l = children.length; i < l; i++)
        {
            if (flag ? children[i].Class !== check : !check.test(children[i].Class))
            {
                children[i] = { Class: tag, children: [children[i]] };
            }
        }
    };



    //默认html规则
    //参数1: string|Regex 替换条件 字符串表示是否与指定的类型相同
    //参数2: string       要替换成的类型 与第二项相同时可省略

    rule.table = [/tbody|thead|tfoot/, 'tbody'];

    rule.thead = rule.tbody = rule.tfoot = ['tr'];

    rule.tr = [/td|th/, 'td'];

    rule.ol = rule.ul = ['li'];

    rule.dl = ['dt'];

    rule.dt = ['dd'];

    rule.select = ['option'];


}, false);




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

    //获取属性值
    var attr = document.getAttribute;
    



    //在指定dom容器显示控件
    flyingon.show = function (control, host) {

        if (typeof host === 'string')
        {
            host = document.getElementById(host);
        }
        
        if (!host)
        {
            throw 'can not find host!';
        }

        var width = host.clientWidth,
            height = host.clientHeight;

        //挂载之前处理挂起的ready队列
        flyingon.ready();
        flyingon.__update_patch();

        if (!control.__top_control)
        {
            control.__top_control = true;
            control.fullClassName += ' f-host';
        }

        host.appendChild(control.view || control.renderer.createView(control));
        control.renderer.__update_top(control, width, height);
    };


    //隐藏控件
    flyingon.hide = function (control, dispose) {

        if (control.__top_control)
        {
            var view = control.view,
                any;

            control.__top_control = false;

            if (view && (any = view.parentNode))
            {
                any.removeChild(view);
            }

            control.fullClassName = control.fullClassName.replace(' f-host', '');

            if (dispose !== false)
            {
                control.dispose();
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
                return flyingon.__uniqueId[id];
            }
            
            dom = dom.parentNode;
        }
    };


        
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
        else if (value = this.__style)
        {
            cursor = value.cursor;
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

        clear_selection();
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
                parent.splice(parent.indexOf(item), 0, item);
            }
        }
        else if (this.parent !== parent)
        {
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
    

    function clear_selection() {

        var fn = window.getSelection;

        if (fn)
        {
            fn.call(window).removeAllRanges();
        }
        else
        {
            document.selection.empty();
        }
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
                };
            }
            else if ((parent = control.parent) && (any = control.movable) && any.call(control))
            {
                any = movable = (control.__move_start || move_start).call(control, e);
            }
            
            // if (any && (any = control.view))
            // {
            //     any.setCapture && any.setCapture();
            //     any = document.body;

            //     flyingon.css_value(any, 'user-select', 'none');

            //     ondragstart = any.ondragstart;
                
            //     any.ondragstart = function () {
                  
            //         return false;
            //     };
            // }
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
            !control.disabled() && control.trigger(new MouseEvent(e)) !== false &&
            (any = control.resizable) && any.call(control) !== 'none')
        {
            resizable = (control.__check_resize || check_resize).call(control, any, e);
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

            // if (any = control.view)
            // {
            //     any.setCapture && any.releaseCapture();
            //     any = document.body;
                
            //     flyingon.css_value(any, 'user-select', '');

            //     if (any.ondragstart = ondragstart)
            //     {
            //         ondragstart = null;
            //     }
            // }
            
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

    //IE
    // if ('onfocusin' in document)
    // {
    //     on(document, 'focusin', focus);
    //     on(document, 'focusout', blur);
    // }
    // else //w3c标准使用捕获模式
    // {
    //     on(document, 'focus', focus, true);
    //     on(document, 'blur', blur, true);
    // }


    function focus(e) {

        if (focus.__disabled)
        {
            return true;
        }

        var control = flyingon.findControl(e.target);

        if (control && control.canFocus && !control.disabled() && control.canFocus() && 
            control.trigger('focus') !== false)
        {
            control.focus();
            flyingon.activeControl = control;
        }
        else if (control = flyingon.activeControl)
        {
            try
            {
                focus.__disabled = true;
                control.renderer.focus(control);
            }
            finally
            {
                focus.__disabled = false;
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



    
})(flyingon, document);




flyingon.renderer('Highlight', function (base) {


    var styles = flyingon.create(null),
        cache;


    this.render = function (writer, control, className, cssText) {
        
        writer.push('<div');
        
        this.renderDefault(writer, control, className, (cssText || '') + 'overflow:auto');
        
        writer.push('><pre style="margin:0;width:auto;height:auto;"><code style="overflow:visible;"></code></pre></div>');
    };



    this.theme = function (control, view, value) {

        if (!styles[value])
        {
            flyingon.link(flyingon.require.path('flyingon/third/highlight/styles/' + value + '.css'));
        }
    };


    this.code = function (control, view, value) {

        var hljs = window.hljs,
            any;

        if (hljs)
        {
            view = view.firstChild.firstChild;
            view.className = control.language();
            view[this.__text_name] = value;

            hljs.highlightBlock(view);
        }
        else if (any = cache)
        {
            any.push(control);
        }
        else
        {
            cache = [control];

            this.theme(control, view, control.theme());
            flyingon.script(flyingon.require.path('flyingon/third/highlight/highlight.js'), init);
        }
    };
        

    function init() {
        
        var list = cache,
            index = 0,
            control;

        while (control = list[index++])
        {
            control.renderer.code(control, control.view, control.code());
        }

        cache = null;
    };

        
});



flyingon.Control.extend('Highlight', function (base) {


    this.defaultWidth = 400;

    this.defaultHeight = 200;


    //当前语言
    this.defineProperty('language', 'javascript', {
        
        set: function (value) {

            this.rendered && this.renderer.set(this, 'code', this.code());
        }
    });


    //当前主题
    this.defineProperty('theme', 'vs', {
     
        set: function (value) {

            this.rendered && this.renderer.set(this, 'theme', value);
        }
    });


    //代码内容
    this.defineProperty('code', '', {
        
        set: function (value) {

            this.renderer.set(this, 'code', value);
        }
    });


}).register();



