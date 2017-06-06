
//控件模板处理
(function (flyingon) {



    //模板类
    function Class(template) {

        this.template = template;
    };



    //初始化模板生成视图模型
    Class.prototype.init = function () {

        var vm = this.viewModel,
            any;

        if (!vm)
        {
            var stack = [], //for循环堆栈
                error = []; //错误集合

            any = this.template;
                
            if (typeof any === 'string')
            {
                any = this.template = parse(any);
            }

            analyse(vm = this.viewModel = {}, any, stack, error);

            if (error[0])
            {
                alert(error.join('\n'));
            }

            vm.$watch = watch;
        }

        vm = flyingon.create(vm);

        if (any = vm.__array_keys)
        {
            init(vm, any);
        }

        return vm;
    };



    //初始化数组模型,添加数组方法
    function init(vm, array) {

        for (var name in array)
        {
            var fn = vm[name];

            fn.push = function (item) {

            };

            fn.pop = function () {

            };

            fn.unshift = function () {

            };

            fn.shift = function () {

            };

            fn.splice = function () {

            };

            fn.sort = function () {

            };

            fn.reverse = function () {

            };
        }
    };


    //解析xml模板
    function parse(template) {

    };


    //分析模板生成视图模型原型
    function analyse(vm, options, stack, error) {

        var any;

        if (options instanceof Array)
        {
            for (var i = 0, l = options.length; i < l; i++)
            {
                analyse(vm, options[i], stack, error);
            }
        }
        else if ((any = options['for'] || options[':for']) && (any = any.match(/\w+/g)))
        {
            analyse_for(vm, options, any, stack, error);
        }
        else
        {
            analyse_object(vm, options, stack, error);
        }
    };


    function analyse_object(vm, options, stack, error) {

        var any;
        
        for (var name in options)
        {
            if (name.charAt(0) === ':' && name !== ':for')
            {
                analyse_property(vm, stack, options[name]);
            }
        }

        if (any = options.children)
        {
            analyse(vm, any, stack, error);
        }
    };


    //分析for模板
    function analyse_for(vm, options, values, stack, error) {

        var name = values[0],
            item = values[1],
            index = values[2],
            any;

        if (any = vm[name])
        {
            if (any.tag !== 'array')
            {
                if (any.tag)
                {
                     error.push('for name "' + item + '" has used, please use another name!');
                }
                else
                {
                    any.array = true;
                }
            }
        }
        else
        {
            vm[name] = define_property(name);
        }

        if (item)
        {
            if (any = vm[item])
            {
                error.push('for item name "' + item + '" has used, please use another name!');
            }
            else
            {
                vm[item] = array_item(name, item);
            }
        }
        else
        {
            error.push('for item is required(sample :for="list(item)")!');
        }

        if (index)
        {
            if (any = vm[name])
            {
                error.push('for index name "' + index + '" has used, please use another name!');
            }
            else
            {
                (vm[name] = function (index) {

                    return index;

                }).tag = 'index';
            }
        }

        //压入数据项栈,在栈内的数组项才是有项的数组项,否则会抛出异常
        stack.push(item);

        analyse_object(vm, options, stack, error);

        //结束当前数组项
        stack.pop();
    };


    //分析属性
    function analyse_property(vm, stack, name) {

        var data = name.substring(0, index),
            item = name.substring(index + 1);

        vm[name] = define_member();
    };

 

    function define_property(name) {

        return function (value, tag) {

            var storage = this.__storage;

            if (value === void 0)
            {
                //依赖
                if (tag)
                {
                    (this.__deps || (this.__deps = [])).push(tag);
                }

                return storage[name];
            }

            if (storage[name] !== value)
            {
                storage[name] = value;
                notify(this, name, name, value);
            }
        };
    };


    function array_item(name, item) {

        function fn(index, value, tag) {

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
                //依赖
                if (tag)
                {
                    (this.__deps || (this.__deps = [])).push(tag);
                }

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



    //根据初始化后的视图模型创建控件
    Class.prototype.create = function () {


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