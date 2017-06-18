//视图模板类
flyingon.ViewTemplate = flyingon.defineClass(function () {



    //控件实例集合
    var controls = flyingon.__uniqueId_controls;


    //当前依赖参数
    //0: 控件id
    //1: 模板节点
    //2: 绑定名称
    var depend_target;

    var push = [].push;

    var splice = [].splice;




    this.constructor = function (template) {

        if (typeof template === 'string' && template.charAt(0) === '#')
        {
            var node = document.getElementById(template.substring(1));
            template = node ? node.innerHTML : template;
        }

        this.__template = template;
    };




    //初始化模板生成视图模型
    this.init = function (defaults) {

        var vm = this.__vm_class,
            any;

        if (vm === void 0)
        {
            if (typeof (any = this.__template) === 'string')
            {
                any = any.replace(/<!--[\s\S]*?-->/g, '');
                any = any.match(/[<>=/]|[\w-:@]+|"[^"]*"|'[^']*'/g);
                any = parse(any, []);
            }

            if (any instanceof Array)
            {
                if (any[1])
                {
                    throw 'template can only one root node!';
                }

                any = this.__template = any[0];
            }

            if (any)
            {
                if (any['-loop'])
                {
                    throw 'template root nood can not use "d:loop"!';
                }
            }
            else
            {
                throw 'template can not be empty!';
            }
 
            if (defaults !== false)
            {
                analyse_object(vm = {}, any);


                any = null;

                for (any in vm)
                {
                    any = define_object(vm, '');
                    break;
                }
            }
            else
            {
                any = null;
            }

            this.__vm_class = vm = any;
        }

        return vm && new vm(null, defaults);
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
                        if (!item || tokens[index] !== item.type || tokens[index + 1] !== '>')
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

                    any = { type: token };

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
                            throw '"<' + item.type + '...' + token + '" not a valid attribute name!';
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
    //[0, 2, name, path, detail]  函数, detail为参数列表
    //[1, 0, name, path, detail]  对象节点, detail为属性列表
    //[1, 1, name, path, detail]  升级为对象节点的loop item变量, detail为属性列表
    //[2, 0, name, path, detail]  数组节点, detail是item变量
    //[2, 1, name, path, detail]  升级为数组节点的loop item变量, detail是item变量
    

    function analyse_object(node, template) {

        var item, any;

        for (var name in template)
        {
            switch (name)
            {
                case 'type':
                case 'children':
                case '-loop':
                    any = null;
                    break;

                default:
                    any = template[name];
                    break;
            }

            if (any)
            {
                switch (name.charAt(0))
                {
                    case '-': //指令
                        break;

                    case ':': //绑定
                        template[name] = any.indexOf('(') > 0 ? analyse_function(node, any) : analyse_name(node, any, 0, 0);
                        break;

                    case '@': //事件
                        template[name] = analyse_function(node, any);
                        break;
                }
            }
        }

        if (template = template.children)
        {
            any = 0;

            while (item = template[any++])
            {
                (item['-loop'] ? analyse_loop : analyse_object)(node, item);
            }
        }
    };


    function analyse_loop(node, template) {

        var keys = template['-loop'].match(/[\w.-]+/g),
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
                any = loop[4] = node[item] = [0, 1, item, null, null];

                if (index = keys[2])
                {
                    check_loop(node, index);

                    //添加进作用域
                    node[index] = [0, 0, index, null];
                }
            }

            //在作用域范围内分析模板
            analyse_object(node, template);

            if (item)
            {
                //标记超出作用域
                node[item] = 0;

                //如果item不是对象或数组,需把关联的参数节点修改为默认数组项对象
                if (any[0])
                {
                    item = any;
                }
                else
                {
                    //如果直接绑定到数组项的值,需转换成item.$value
                    //这么做的主要原因是为减少作用域的复杂程度
                    item = loop[4] = any.slice(0);

                    any[2] = '$value';
                    any[3] = [item];
                }

                //index没有单独的作用域,需挂靠成item.$index
                //这么做的主要原因是为减少作用域的复杂程度
                if (index)
                {
                    any = node[index];
                    any[2] = '$index';
                    any[3] = [item];

                    //标记超出作用域
                    node[index] = 0;
                }
            }
        }
        else
        {
            analyse_object(node, template);
        }

        template['-loop'] = loop;
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
                        if (item[1] === 1)
                        {
                            item[0] = 1;
                            node = item[4] || (item[4] = {}); 
                            break;
                        }

                    default:
                        throw '"' + name + '" can not set child name!';
                }
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
            else if (item[0])
            {
                throw '"' + name + '" is a object, can not bind!';
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
            index;

        if ((name = list[0]).indexOf('.') >= 0)
        {
            throw 'function "' + name + '" can not include "."!';
        }
        
        if ((item = node[name]) && item[1] !== 2)
        {
            throw 'function name "' + name + '" has be used!';
        }

        //函数支持重载,同一函数可传入不同的参数,所以每次分析都重新生成新节点
        item = node[name] = [0, 2, list[0], null, null, null];

        if (list[1])
        {
            args = [];
            index = 1;

            while (name = list[index++])
            {
                args.push(node[name] || analyse_name(node, name, 0, 0));
            }
            
            item[4] = args;
        }

        return item;
    };




    //添加依赖追踪
    function track(vm, name, value) {

        var keys = vm.__depends;

        if (!keys)
        {
            keys = vm.__depends = {};
            keys[name] = [];
        }

        push.apply(keys[name] || (keys[name] = []), value);
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
    };


    //变更通知
    function notify(vm, name, value, oldValue, type) {

        var keys = vm.__depends;

        if (keys)
        {
            if (name === '*')
            {
                for (var key in keys)
                {
                    sync_bind(vm, key, keys[key]);
                }
            }
            else if (keys = keys[name])
            {
                sync_bind(vm, name, keys);
            }
        }

        trigger(vm, name, value, oldValue, type);
    };


    //同步绑定
    function sync_bind(vm, name, depends) {

        var control,
            node,
            index = 0,
            any;

        vm = vm.__top || vm;

        while (any = depends[index++])
        {
            control = controls[any];
            node = depends[index++];

            if (node[1] === 2) //函数
            {
                any = bind_function(control, vm, null, node);
            }
            else //属性
            {
                any = (node[3] ? bind_vm(control, vm, null, node) : vm)[node[2]]();
            }

            control.set(depends[index++], any);
        }
    };


    //触发观测通知
    function trigger(vm, name, value, oldValue, type) {

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
                            type: type || 1,
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




    //定义对象视图模型类
    function define_object(node, path) {


        var self = Class.prototype;


        function Class(parent, value) {

            var list = this.__children,
                index = 0,
                name,
                any;

            this.__top = (this.__parent = parent) ? parent.__top : this;
            this.__data = value || {};

            //如果有子对象则初始化子对象
            while (name = list[index++])
            {
                if (any = value && value[name])
                {
                    any = new list[index++](this, any);
                }
                else
                {
                    any = new list[index++](this, any);
                    value[name] = any.__data;
                }

                this[name] = any;
            }
        };


        self.$name = path;
        self.$get = object_get;
        self.$set = object_set;
        self.$value = object_value;
        self.$watch = watch;


        define_properties(self, node);


        return Class;
    };


    function define_properties(self, node) {

        var keys1 = self.__keys = {},
            keys2 = self.__children = [],
            item;

        for (var name in node)
        {
            item = node[name];

            switch (keys1[name] = item[0])
            {
                case 0: //property
                    self[name] = define_property(name);
                    break;

                case 1: //object
                    keys2.push(name, self[name] = define_object(item[4], item[1]));
                    break;

                case 2: //loop
                    keys2.push(name, self[name] = define_array(item));
                    break;
            }
        }
    };
    

    function define_property(name) {

        function fn(value) {

            var data = this.__data,
                any;

            if (value === void 0)
            {
                if (value = depend_target)
                {
                    track(this, name, value);
                }

                return data[name];
            }
            
            if ((any = data[name]) !== value)
            {
                notify(this, name, data[name] = value, any);
            }

            return this;
        };

        fn.__vm_ = 1;

        return fn;
    };


    function object_value(value) {

        var data = this.__data;

        if (value === void 0)
        {
            return data;
        }

        if (data !== value)
        {
            var keys = this.__keys,
                any;

            for (var name in keys)
            {
                any = value && value[name];

                if (data[name] !== any)
                {
                    if (keys[name])
                    {
                        this[name].$value(any);
                    }
                    else
                    {
                        this[name](any);
                    }
                }
            }
            
            this.__data = value || {};
        }
    };


    function object_get(name) {

        var fn = this[name];
        return fn && fn.property ? fn.call(this) : this.__data[name];
    };


    function object_set(name, value) {

        if (this.__data[name] !== value)
        {
            switch (this.__keys[name])
            {
                case 0:
                    return this[name](value);

                case 1:
                case 2:
                    return this[name].$value(value);
            }

            this.__data[name] = value;
        }

        return this;
    };



    //定义数组视图模型类
    function define_array(node) {

        
        var self = Class.prototype;


        function Class(parent, value) {

            var length = this.length = value && value.length || 0;

            this.__top = parent.__top;
            this.__parent = parent;
            this.__data = value || [];

            if (value)
            {
                var fn = this.__item_class,
                    any;

                for (var i = 0; i < length; i++)
                {
                    if (any = value[i])
                    {
                        any = new fn(this, any);
                    }
                    else
                    {
                        any = new fn(this, any);
                        value[i] = any.__data;
                    }

                    (this[i] = any).__index = i;
                }
            }
        };


        self.$name = node[2];
        self.$get = array_get;
        self.$set = array_set;
        self.$value = array_value;
        self.$watch = watch;

        self.append = array_append;
        self.insert = array_insert;
        self.remove = array_remove;
        self.removeAt = array_removeAt;
        self.clear = array_clear;
        self.sort = array_sort;
        self.reverse = array_reverse;


        self.__item_class = define_item(node[4] || []);
 

        return Class;
    };


    function array_value(value) {

        var data = this.__data;

        if (value === void 0)
        {
            return data;
        }

        if (data !== value)
        {
            var length = this.length,
                any = value ? value.length : 0;

            this.__data = value || (value = []);

            if (any > length)
            {
                for (var i = 0; i < length; i++)
                {
                    this[i].$value(value[i]);
                }

                this.append(value.splice(length));
                return this;
            }

            if (length > any)
            {
                this.removeAt(length, length - any);
            }
            
            for (var i = 0; i < any; i++)
            {
                this[i].$value(value[i]);
            }
        }

        return this;
    };


    function array_get(index) {

        return this.__data[index];
    };

    
    function array_set(index, value) {

        if (this[index])
        {
            this[index].$value(value);
        }

        return this;
    };


    function array_append(item) {

        return this.insert(this.length, item);
    };


    function array_insert(index, item) {

        var data = this.__data,
            fn = this.__item_class,
            length = 1,
            any;

        if (index < 0)
        {
            index = 0;
        }
        else if (index > this.length)
        {
            index = this.length;
        }

        if (item instanceof Array)
        {
            if (!(length = item.length))
            {
                return this;
            }

            data.splice.apply(data, [index, 0].concat(item));
            
            for (var i = 0; i < length; i++)
            {
                (item[i] = new fn(this, item[i])).__index = index + i;
            }

            splice.apply(this, [index, 0].concat(item[i]));
            append_loop(this, index, index += length);
        }
        else
        {
            data.splice(index, 0, item);
            (item = new fn(this, item)).__index = index;

            splice.call(this, index, 0, item);
            append_loop(this, index, ++index);
        }

        while (item = this[index++])
        {
            item.__index = index;
            bind && notify(item, '$index', index - 1, index);
        }

        return this;
    };


    function array_remove(item) {

        return item && item.__parent === this ? this.removeAt(item.__index) : this;
    };


    function array_removeAt(index) {

        if (index >= 0 && index < this.length)
        {
            var item = this[index],
                bind = item.__depends.$index;

            this.__data.splice(index, 1);
            splice.call(this, index, 1);

            dispose_vm(item);

            if (item = loop_tag(this, index))
            {
                item.parent.removeChild(item);
            }

            while (item = this[index++])
            {
                item.__index--;
                bind && notify(item, '$index', index - 1, index);
            }
        }

        return this;
    };


    function array_clear() {

        if (this[0])
        {
            var parent, item, name, any;

            for (var i = this.length - 1; i >= 0; i--)
            {
                dispose_vm(this[i]);
            }

            this.__data.splice(0);
            splice.call(this, 0);

            if ((item = this.__start) && (item = item.nextSibling) && (parent = item.parent))
            {
                name = this.$name;

                while (any = item)
                {
                    item = item.nextSibling;

                    if (any.__loop_name === name)
                    {
                        parent.removeChild(any);
                    }
                }
            }
        }

        return this;
    };


    function array_sort(fn) {

        if (this[0])
        {
            
        }

        return this;
    };


    function array_reverse() {

        var length = this.length,
            bind,
            index,
            a,
            b;

        if (length > 1)
        {
            this.__data.reverse();

            bind = this[0].__depends.$index;

            for (var i = 0, l = length >> 1; i < l; i++)
            {
                a = this[i];
                b = this[index = length - i];

                a.__index = index;
                b.__index = i;

                this[i] = b;
                this[index] = a;

                if (bind)
                {
                    notify(a, '$index', i, index);
                    notify(b, '$index', index, i);
                }
            }
        }

        return this;
    };


    function dispose_vm(vm) {

        var any;

        vm.__parent = vm.__top = vm.__depends = vm.__watches = null;

        if (vm.__start)
        {
            for (var i = vm.length - 1; i >= 0; i--)
            {
                dispose_vm(vm[i]);
            }

            vm.__start = vm.__end = vm.__template = null;
        }
        else if (any = vm.__children)
        {
            for (var i = any.length - 2; i >= 0; i--)
            {
                dispose_vm(vm[any[i]]);
            }
        }
    };



    //定义数组项视图模型类
    function define_item(node) {

        var Class, any;

        switch (node[0])
        {
            case 1: //数组项是一个对象
                Class = define_object(node[4], node[2]);
                break;

            case 2: //数组项是一个数组
                Class = define_array(node[4]);
                break;

            default:
                Class = define_value(node[2]);
                break;
        }

        //开放获取数组项索引方法
        Class.prototype.$index = item_index;

        return Class;
    };


    function item_index() {

        var value;

        if (value = depend_target)
        {
            track(this, '$index', value);
        }

        return this.__index;
    };



    //定义简单值视图模型类
    function define_value(path) {

        var self = Class.prototype;


        function Class(parent, value) {

            this.__top = parent.__top;
            this.__parent = parent;
            this.__data = value;
        };


        self.$name = path;
        self.$value = property_value;
        self.$watch = watch;


        return Class;
    };

    
    function property_value(value) {

        var data = this.__data;

        if (value === void 0)
        {
            if (value = depend_target)
            {
                track(this, '$value', value);
            }

            return data;
        }

        if (data !== value)
        {
            this.__data = value;
            notify(this, '*', value, data);
        }

        return this;
    };




    //根据初始化后的视图模型创建控件
    this.create = function (vm) {

        var any = this.__template;

        if (vm)
        {
            depend_target = [0, null, ''];

            any = create_control(vm, flyingon.create(null), any, flyingon.components);
            any.vm = vm;

            depend_target = null;
        }
        else
        {
            any = flyingon.SerializeReader.deserialize(any);
        }

        return any;
    };



    function create_control(vm, scope, template, components, type) {

        var control = new (type || components[template.type] || flyingon.Unkown)(),
            depend = depend_target,
            node,
            any;

        depend[0] = control.uniqueId();

        for (var name in template)
        {
            switch (name)
            {
                case 'type':
                case 'children':
                case '-loop':
                    break;

                default:
                    node = template[name];

                    switch (name.charAt(0))
                    {
                        case ':': //绑定
                            depend[1] = node;
                            depend[2] = name = name.substring(1);
                            
                            if (node[1] === 2)
                            {
                                any = bind_function(control, vm, scope, node);
                            }
                            else //属性
                            {
                                any = (node[3] ? bind_vm(control, vm, scope, node) : vm)[node[2]]();
                            }

                            control.set(name, any);
                            break;

                        case '@': //事件
                            control.on(name.substring(1), bind_event(vm, node));
                            break;

                        case '-': //指令
                            //留待以后扩展
                            break;

                        default:
                            if (any = node.match(/^\{\{(\w+)\}\}$/))
                            {
                                control.addBind.call(this, name, any[1]);
                            }
                            else
                            {
                                control.set(name, node);
                            }
                            break;
                    }
            }
        }

        if (any = template.children)
        {
            any = create_children(vm, scope, any, components);
            any[0] && control.appendChild(any);
        }

        return control;
    };


    function create_children(vm, scope, template, components) {

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

        return controls;
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


    function append_loop(vm, start, end) {

        var controls = [],
            control = vm.__end,
            scope = {},
            any = control;

        while (any = any.parent)
        {
            if (any.__loop_item)
            {
                scope[any.__loop_scope] = any.__loop_item;
            }
        }

        depend_target = [0, null, ''];

        loop_controls(controls, vm, start, end, scope, flyingon.components);

        depend_target = null;

        control.parent.insertBefore(controls, loop_tag(vm, start) || control);
    };


    function loop_controls(controls, vm, start, end, scope, components) {

        var top = vm.__top,
            template = vm.__template,
            type = components[template.type] || flyingon.Unkown,
            item = template['-loop'],
            loop = item[2],
            name = item[4],
            control;
        
        if (name)
        {
            name = name[2];

            while (start < end)
            {
                scope[name] = item = vm[start++];

                controls.push(control = create_control(top, scope, template, components, type));

                //为后述查找缓存数据
                control.__loop_name = loop;
                control.__loop_scope = name;
                control.__loop_item = item;
            }

            scope[name] = null;
        }
        else
        {
            while (start++ < end)
            {
                controls.push(control = create_control(top, scope, template, components, type));
            }
        }
    };


    function loop_tag(vm, offset) {

        var start = vm.__start,
            end = vm.__end,
            name = vm.$name;

        while ((start = start.nextSibling) && start !== end)
        {
            if (start.__loop_name === name && !offset--)
            {
                return start;
            }
        }
    }; 



    //获取绑定的视图模型
    function bind_vm(control, vm, scope, node) {

        var list = node[3],
            item = list[0],
            index = 1;

        if (item[1] === 1) //loop item
        {
            vm = scope ? scope[item[2]] : bind_scope(control, item[2]);
        }
        else
        {
            vm = vm[item[2]];
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

        if (list)
        {
            while (item = list[index++])
            {
                if (item[3])
                {
                    item = bind_vm(control, vm, scope, item)[item[2]]();
                }
                else if (item[1] === 1)
                {
                    item = scope ? scope[item[2]] : bind_scope(control, item[2]);
                }
                else
                {
                    item = vm[item[2]]();
                }

                args.push(item);
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
    function bind_scope(control, item) {

        do
        {
            if (control.__loop_scope === item)
            {
                return control.__loop_item;
            }
        }
        while (control = control.parent);
    };




    //创建部件
    flyingon.widget = function (name, options) {


        if (!name && typeof name !== 'string')
        {
            throw 'widget name must input a string!';
        }

        check_options('widget', options);


        return flyingon.defineClass(function () {


            var template = new flyingon.ViewTemplate(options.template),
                vm;


            this.constructor = function () {

                var any;

                this.vm = vm || (vm = template.init(options.defaults));

                if (any = options.controller)
                {
                    any.call(item, item);
                }

                return template.create(vm);
            };


        }).register(name, options.force);

    };



    //创建视图
    flyingon.view = function (options) {

        check_options('view', options);

        var template = new flyingon.ViewTemplate(options.template),
            item = template.init(options.defaults), 
            any;

        if (any = options.controller)
        {
            any.call(item, item);
        }

        item = template.create(item);

        if (any = options.host)
        {
            flyingon.mount(item, any);
        }

        return item;
    };



    function check_options(name, options) {

        if (!options)
        {
            throw name + ' options must input a object!';
        }

        if (!options.template)
        {
            throw name + ' options template not allow empty!';
        }
    };



});