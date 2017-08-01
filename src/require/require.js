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