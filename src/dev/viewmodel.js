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

                    return scope.__loop_index + 1;
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
                return control.__loop_index + 1;
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