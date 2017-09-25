(function () {



    //插件缓存
    var cache = flyingon.create(null);


    //一次只能加载一个插件
    var loading = [];


    //加载插件
    function load_plugin(url, callback) {

        var value = cache[url];

        if (value)
        {
            if (value instanceof Array)
            {
                callback && value.push(callback);
            }
            else
            {
                callback && callback(value);
            }

            return;
        }

        loading.push(url, callback);

        if (loading.length > 2)
        {
            return;
        }

        value = cache[url] = [];
        callback && value.push(callback);

        //注册插件加载回调
        flyingon.__load_plugin = function (Class) {

            cache[url] = Class;
        };

        flyingon.load(url, function () {

            var Class = cache[url],
                any = value;

            flyingon.__load_plugin = null;

            //移除待加载项
            loading.splice(0, 2);

            if (Class instanceof Array)
            {
                cache[url] = null;
                throw '"' + url + '" not include any flyingon.Plugin!';
            }

            for (var i = 0, l = any.length; i < l; i++)
            {
                any[i](Class);
            }

            if ((any = loading).length > 0)
            {
                load_plugin(any.shift(), any.shift());
            }
        });

    };



    //url:              url, 包含插件地址及多级hash控制
    //options.text:     页头文字
    //options.icon:     页头图标
    //options.closable: 页签是否可关闭
    //options.target:   打开页面方式 _blank:在新页面打开 _self:在当前页面打开 other:在指定key为指定值的页面中打开
    function route(tab, url, options) {

        var page, url, any;
        
        if (!tab || !(tab instanceof flyingon.Tab))
        {
            throw 'rout tab must be a flyingon.Tab!';
        }

        if (!url || !(url = url.replace(/^[#!]+/g, '')))
        {
            throw 'route options.url can not be empty!';
        }

        if (!tab.__on_route)
        {
            tab.on('tab-change', route.__tab_change);
            tab.__on_route = true;
        }

        //打开页面方式(未设置页头时永远在当前页面打开)
        switch (any = tab.header() ? options.target : '_self')
        {
            case '_blank': //在新页面打开
                any = null;
                break;

            case '_self': //在当前页面打开
                if ((page = tab.selectedPage()) && page.url === url)
                {
                    return;
                }

                any = null;
                break;

            default: //在指定的target名称中打开
                if ((page = tab.findByKey(any)) && page.url === url)
                {
                    if (!page.selected())
                    {
                        tab.selectedPage(page, 'route');
                        
                        page.route.update();
                        page[0].openPlugin(page.route.next(), false);
                    }

                    return;
                }
                break;
        }
        
        if (page)
        {
            page[0].closePlugin();
            page.splice(0);
        }
        else
        {
            tab.push(page = new flyingon.TabPage().layout('fill'));
        }

        //设置页面key
        if (any)
        {
            page.key(any);
        }

        new Root().load(route.current = page, url, options);
    };


    //预加载hash插件
    route.preload = function (hash) {

        if (hash && (hash = hash.replace(/^[#!]+/g, '')))
        {
            load_plugin(hash.split('#')[0]);
        }
    };

    

    //路由
    flyingon.route = route;



    var Root = Object.extend(function () {



        //插件地址
        this.plugin = '';



        this.load = function (page, url, options) {

            var any;

            page.route = this;

            route.__update(page.url = this.url = url);

            //检测是否以iframe方式加载
            if (url.indexOf('iframe:') === 0)
            {
                url = url.substring(7);
            }
            else
            {
                this.parse(url);
                
                if (any = options.icon)
                {
                    page.icon(any);
                }

                if (any = options.text)
                {
                    page.text(any);
                }
                else
                {
                    page.parent.header(0);
                }

                page.closable(options.closable !== false);
                page.parent.selectedPage(page, 'route');

                page.loading(200);
 
                any = this;

                load_plugin(this.plugin, function (Class) {

                    var route = any,
                        plugin;

                    page.loading(false);
                    page.push(plugin = new Class());

                    plugin.loadPlugin(route = route.next());
                    plugin.openPlugin(route, true);

                    page = any = null;

                    //立即更新视图
                    flyingon.update();
                });
            }
        };


        //解析url
        this.parse = function (url) {

            var tokens = url.split('#'),
                last = this, 
                any;

            this.plugin = tokens[0];

            for (var i = 1, l = tokens.length; i < l; i++)
            {
                if (any = tokens[i])
                {
                    last = last.__next = new Route(this, any);
                }
            }
        };


        //获取下一个参数
        this.next = function () {

            return this.__next || (this.__next = new Route(this, ''));
        };


        //更新hash
        this.update = function () {

            var url = this.plugin,
                next = this,
                value;

            while ((next = next.__next) && (value = next.value))
            {
                url += '#' + value;
            }
 
            route.__update(url);
        };


    }, false);



    var Route = Object.extend(function () {

        
        //当前hash值
        this.value = '';


        this.init = function (root, value) {

            this.__root = root;
            this.value = value;
        };


        //修改当前hash值
        this.change = function (value) {

            this.value = '' + value;
            this.__root.update();
        };


        //清除后述参数
        this.clear = function () {

            this.__next = null;
            this.__root.update();
        };


        //获取下一个参数
        this.next = function () {

            return this.__next || (this.__next = new Route(this.__root, ''));
        };


        //分发至指定控件
        this.dispatch = function (control) {

            var fn;

            if (control)
            {
                if (fn = control.subscribeRoute)
                {
                    fn.call(control, this);
                }
                else
                {
                    for (var i = 0, l = control.length; i < l; i++)
                    {
                        if (fn = control[i].subscribeRoute)
                        {
                            fn.call(control[i], this);
                        }
                    }
                }
            }
        };


    }, false);



})();