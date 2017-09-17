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