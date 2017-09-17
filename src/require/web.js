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