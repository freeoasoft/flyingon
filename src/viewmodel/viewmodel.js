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