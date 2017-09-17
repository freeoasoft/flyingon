flyingon.widget({

    template: {

        Class: 'Plugin',
        padding: 8,
        height: '100%',
        children: [
            {
                Class: 'Tab',
                width: 780,
                height: 200,
                selected: 0,
                children: [
                    { Class: 'route-page', key: 'p1', text: '页签1' },
                    { Class: 'route-page', key: 'p2', text: '页签2' },
                    { Class: 'route-page', key: 'p3', text: '页签3' },
                    { Class: 'route-page', key: 'p4', text: '页签4' }
                ]
            },
            { Class: 'Code' }
        ]
    },

    created: function () {


        //插件第一个加载时
        this.loadPlugin = function (route) {

            //检测第二级个路由参数
            var next = route.next();

            //记录下当前路由参数
            this.route = route;

            //根据传入的第一级参数定位页面
            if (route.value)
            {
                this[0].findByKey(route.value, true);
            }
            else if (page = this[0].selectedPage())
            {
                //同步hash与打开的页面一致
                route.change(page.key());
            }

            //如果未传入第二级参数则生成随机演示参数
            if (!next.value)
            {
                next.change(Math.random() * 100000000 | 0);
            }

            //下发到子页面
            next.dispatch(this.findByType('route-page'));
        };


        this.on('tab-change', function (e) {

            var page = e.current;

            if (page)
            {
                //切换hash与当前页面一致
                this.route.change(page.key());
            }
        });

    }


});



//子页面类
flyingon.widget('route-page', {


    template: {

        Class: 'TabPage',
        children: [{ Class: 'Label' }]
    },

    created: function () {

        //订阅上级分发的路由参数
        this.subscribeRoute = function (route) {
        
            this[0].text('receive route value: ' + route.value);
        };

    }

});
