(function () {



    var callback = [];

    var hash = location.hash.replace(/^[#!]+/, '');

    
    //打开页面有hash时需处理
    if (callback.hash = hash)
    {
        //预加载插件资源
        flyingon.route.preload(hash);
    }


    //侦听路由变化
    this.listen = function (fn) {

        if (typeof fn === 'function')
        {
            var hash = callback.hash;

            callback.push(fn);

            if (hash)
            {
                callback.hash = '';
                execute(hash, false);
            }
        }
    };


    //定制页面变更事件
    this.__tab_change = function (e) {
        
        if (e.target === this)
        {
            var page = flyingon.route.current = e.current;

            if (page)
            {
                page.route.update();
                e.tag !== 'route' && execute(page.url, true);
            }
            else
            {
                execute(location.hash = hash = '', true);
            }
        }
    };


    //更新路由地址
    this.__update = function (url) {
        
        location.hash = hash = url ? '#!' + url : ''; 
    };


    function execute(hash, route) {

        var list = callback;

        for (var i = 0, l = list.length; i < l; i++)
        {
            list[i](hash, route); //第二个参数标记是路由还是切换
        }
    };


    //执行路由
    function route() {

        if (location.hash !== hash)
        {
            execute(location.hash.replace(/^[#!]+/g, ''), false);
        }
    };


    //定时检测hash
    function check() {

        route();
        setTimeout(check, 200);
    };


    if ('onhashchange' in window)
    {
        flyingon.dom_on(window, 'hashchange', route);
    }
    else
    {
        setTimeout(check, 200);
    }


}).call(flyingon.route);