(function (flyingon) {


    
    var create = flyingon.create;

    //模块集合
    var modules = flyingon.moudles = create(null); 



    flyingon.moduleName = 'flyingon';

    modules.flyingon = flyingon;



    //获取指定名称的模块
    flyingon.use = function (name) {
        
        switch (typeof name)
        {
            case 'string':
                return modules[name] || parse_module(name);

            case 'object':
                return name || flyingon;
        }
        
        return flyingon; 
    };


    //定义或切换模块
    flyingon.defineModule = function (name, deps, callback) {

        var module, fn;

        //生成模块
        switch (typeof name)
        {
            case 'string':
                module = modules[name] || parse_module(name);

                if (typeof deps === 'function')
                {
                    deps.call(flyingon, module);
                    return module;
                }
                break;

            case 'function':
                name.call(flyingon, flyingon);
                return flyingon;

            case 'object':
                return name || flyingon;
        }

        if (deps)
        {
            flyingon.require(deps);
        }

        //处理回调
        if (typeof callback === 'function')
        {
            //如果正在动态加载脚本或还有依赖的js没有加载完成则先注册 否则立即执行
            if (!(fn = flyingon.require) || 
                !(fn = fn.callback) || 
                !fn(load_module, [module, callback]))
            {
                load_module(module, callback);
            }
        }

        return flyingon;
    };

    
  
    function parse_module(name) {
            
        var keys = modules,
            module = keys,
            list, 
            any;

        if (list = name.match(/\w+/g))
        {
            for (var i = 0, l = list.length; i < l; i++)
            {
                if (any = module[name = list[i]])
                {
                    module = any;
                }
                else
                {
                    any = (any = module.moduleName) ? any + '.' + name : name;
                    module = keys[any] = module[name] = create(null);
                    module.moduleName = any;
                }
            }

            return module;
        }

        flyingon.raise('flyingon', 'error.module_name');
    };


    function load_module(moudle, callback) {

        if (typeof callback === 'function')
        {
            callback.call(flyingon, moudle);
        }
    };



})(flyingon);