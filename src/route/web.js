(function () {



    var hash = location.hash;


    if (hash)
    {
        flyingon.route.preload(hash);
    }


    //初始化路由
    this.__init = function (tab) {

        if (hash)
        {
            flyingon.route(hash);
        }

        tab.on('tab-change', function (e) {

            if (e.target === this)
            {
                var page = flyingon.route.current = e.newValue;

                if (page)
                {
                    page.route.update();
                }
                else
                {
                    location.hash = hash = '';
                }
            }
        });

        if ('onhashchange' in window)
        {
            flyingon.dom_on(window, 'hashchange', route);
        }
        else
        {
            setTimeout(check, 200);
        }
    };


    //更新路由地址
    this.__update = function (url) {
        
        location.hash = hash = url ? '#!' + url : ''; 
    };


    //执行路由
    function route() {

        if (location.hash !== hash)
        {
            flyingon.route(hash = location.hash);
        }
    };


    //定时检测hash
    function check() {

        route();
        setTimeout(check, 200);
    };



}).call(flyingon.route);