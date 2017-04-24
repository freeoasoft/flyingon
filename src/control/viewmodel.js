
//控件模板处理
(function (flyingon) {



    //创建窗口
    flyingon.window = function (options) {

        var window = new flyingon.Window(),
            template = create_template(options.template),
            vm = window.viewModel = template.init(),
            storage = vm.__storage = flyingon.create(null),
            any;

        if (any = options.properties)
        {
            for (var name in any)
            {
                window.set(name, any[key]);
            }
        }

        if (any = options.defaults)
        {
            for (var name in any)
            {
                storage[name] = any[name];
            }
        }

        if (any = options.init)
        {
            any.call(window, vm);
        }

        window.appendControls(template.create());

        if (any = options.created)
        {
            any.call(window, vm);
        }

        return window;
    };



    //创建部件
    flyingon.widget = function (name, options) {


        if (!name || !options)
        {
            throw 'widget name or options not allow empty!';
        }


        return flyingon.defineClass(flyingon.Widget, function () {


            var template = create_template(options.template),
                controller = options.controller,
                any;


            this.constructor = function () {

                this.vm = template.init();
            };


            //重载默认属性
            if (any = options.properties)
            {
                for (var name in any)
                {
                    this.defaultValue(name, any[key]);
                }
            }


            //初始化部件
            this.init = function () {

                this.appendControls(template.create(this));

                if (controller)
                {
                    controller.call(this, this.vm);
                }
            };


            options = any = null;


        }).register(name);

    };



    //创建模板对象
    function create_template(template) {

        return {

            template: template,

            init: function () {

                return flyingon.create(this.viewModel || init_prototype.call(this));
            },

            create: function () {
                
            },
        };
    };


    //初始化视图模型
    function init_viewModel() {

        var vm = this.viewModel = {},
            template = this.template,
            stack = [], //for循环堆栈
            error = []; //错误集合

        if (typeof template === 'string')
        {
            template = this.template = parse(template);
        }

        analyse(vm, template, stack, error);

        if (error[0])
        {
            alert(error.join('\n'));
        }

        vm.$watch = watch;

        return vm;
    };


    //创建控件
    function create_controls() {

    };



    //解析xml模板
    function parse(template) {

    };


    //分析模板生成视图模型原型
    function analyse(vm, options, stack, error) {

        if (options instanceof Array)
        {
            for (var i = 0, l = options.length; i < l; i++)
            {
                analyse_object(vm, options[i], stack, error);
            }
        }
        else
        {
            analyse_object(vm, options, stack, error);
        }
    };


    //分析对象模板
    function analyse_object(vm, options, stack, error) {

        var any;

        switch (options.type)
        {
            case 'for':
                options.template && analyse_for(vm, options, stack, error);
                break;

            case 'switch':
                options.condition && analyse_switch(vm, options, stack, error);
                break;

            default:
                if (any = options.model)
                {
                    for (var name in any)
                    {
                        if (name.indexOf(':') > 0)
                        {
                            analyse_member(stack, name);
                        }
                        else
                        {
                            vm[name] || (vm[name] = create_fn(name));
                        }
                    }
                }

                if (any = options.children)
                {
                    for (var i = 0, l = any.length; i < l; i++)
                    {
                        analyse_object(vm, any[index++], stack, error);
                    }
                }
                break;
        }
    };


    //分析for模板
    function analyse_for(vm, options, stack, error) {

        var name = options.name,
            item = options.item,
            index = options.index,
            any;

        if (name)
        {
            if (any = vm[name])
            {
                if (any.tag !== 'array')
                {
                    error.push('for name "' + name + '" has used!');
                }
            }
            else
            {
                vm[name] = create_fn(name, 'array');
            }
        }
        else
        {
            error.push('for name is required!');
        }

        if (item)
        {
            if (any = vm[item])
            {
                if (any.array !== target)
                {
                    error.push('for item "' + item + '" has used!');
                }
            }
            else
            {
                vm[item] = array_item(name, item);
            }
        }
        else
        {
            error.push('for item is required!');
        }

        if (index)
        {
            if (any = vm[name])
            {
                if (!any.index)
                {
                    error.push('for index "' + index + '" has used!');
                }
            }
            else
            {
                (vm[name] = function (index) {

                    return index;

                }).index = true;
            }
        }

        //压入数据项栈,在栈内的数组项才是有项的数组项,否则会抛出异常
        stack.push(item);

        analyse(vm, options.template, stack, error);

        //结束当前数组项
        stack.pop();
    };


    //分析switch模板
    function analyse_switch(vm, options, stack, error) {

    };


    //分析成员
    function analyse_member(vm, stack, name) {

        var data = name.substring(0, index),
            item = name.substring(index + 1);

        vm[name] = define_member();
    };

 

    function create_fn(name, tag) {

        function fn(value) {

            var storage = this.__storage;

            if (value === void 0)
            {
                return storage[name];
            }

            if (storage[name] !== value)
            {
                storage[name] = value;
                notify(this, name, name, value);
            }
        };

        if (tag)
        {
            fn.tag = tag;
        }

        return fn;
    };


    function array_item(name, item) {

        function fn(index, value) {

            var fn = this[item],
                storage;

            if (!fn)
            {
                throw '"' + item + '" is not defined!'; 
            }

            if (!(storage = fn.call(this)))
            {
                throw '"' + item + '" is unassigned!'; 
            }

            if (value === void 0)
            {
                return storage[index];
            }

            if (storage[index] !== value)
            {
                storage[index] = value;
                //notify(this, key + '|index|' + index, item, value, index);
            }
        };

        fn.array = name;
        return fn;
    };


    function define_member(item, name, array) {

        function fn(index, value) {

            var storage = this[item](index);

            if (!storage)
            {
                throw '"' + item + '" is unassigned!'; 
            }

            if (value === void 0)
            {
                return storage[name];
            }

            if (storage[name] !== value)
            {
                storage[name] = value;
                //notify(this, key + '|index|' + index, name, value, index);
            }
        };

        fn.array = true;
        return fn;
    };



    function array_fn(vm, name) {

        vm[name + 'push'] = function (item) {

        };

        vm[name + 'pop'] = function () {

        };

        vm[name + 'unshift'] = function () {

        };

        vm[name + 'shift'] = function () {

        };

        vm[name + 'splice'] = function () {

        };

        vm[name + 'sort'] = function () {

        };

        vm[name + 'reverse'] = function () {

        };
    };



    function watch(name, fn) {

        if (!fn)
        {
            fn = name;
            name = '__all__';
        }

        if (typeof fn === 'function')
        {
            var keys = this.__watch_keys,
                any;

            if (keys)
            {
                if (any = keys[name])
                {
                    any.push(fn);
                }
                else
                {
                    keys[name] = [fn];
                }
            }
            else
            {
                (this.__watch_keys = {})[name] = [fn];
            }
        }
    };



    function registry(vm, key, control, name) {

        var keys = vm.__depend_keys || (vm.__depend_keys = flyingon.create(null));

        (control.__model_keys || (control.__model_keys = {}))[name] = key;
        (keys[key] || (keys[key] = [])).push(control.uniqueId());
    };


    function notify(vm, key, name, value, index) {

        var list, index, item, any;

        if (list = vm.__watch_keys)
        {
            if (any = list[key])
            {
                index = 0;

                while (item = any[index++])
                {
                    item.call(vm, value, index);
                }
            }

            if (any = list.__all__)
            {
                index = 0;

                while (item = any[index++])
                {
                    item.call(vm, name, value, index);
                }
            }
        }

        if ((list = vm.__depend_keys) && (list = list[index === void 0 ? key : key + '|index|' + index]))
        {
            index = 0;

            while (item = list[index++])
            {
                if ((item = flyingon.__uniqueId_controls[item]) && (any = item.__model_keys))
                {
                    if (any[name])
                    {
                        item[name](value);
                    }
                }
                else
                {
                    list.splice(--index, 1);
                }
            }
        }
    };




})(flyingon);