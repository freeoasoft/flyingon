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