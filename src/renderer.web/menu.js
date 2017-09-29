flyingon.renderer('Menu', function (base) {


    //菜单堆栈
    var stack = [];

    //注册事件函数
    var on = flyingon.dom_on;

    //注销事件函数
    var off = flyingon.dom_off;

    //菜单标记
    var tag = 1;

    

    function mousedown(e) {

        var control = stack[0];

        if (control)
        {
            var view = control.view,
                any = e.target;

            while (any)
            {
                if (any === view || any.__menu)
                {
                    return;
                }

                any = any.parentNode;
            }

            close(0, 1);
        }
    };


    function click(e) {

        var dom = e.target,
            any;

        while (dom)
        {
            if (dom.className.indexOf('f-menu-item') >= 0)
            {
                if ((any = dom.parentNode) && 
                    (any = stack[any.__index]) && 
                    (any = any[dom.getAttribute('index')]))
                {
                    close(0, 1);
                    any.trigger('click');
                }

                break;
            }

            dom = dom.parentNode;
        }

        close(0, 1);
    };


    function mouseover(e) {

        var dom = e.target;

        if (dom.className.indexOf('f-menu-item') >= 0)
        {
            var view = dom.parentNode,
                index = view.__index,
                list = stack,
                item,
                any;

            //查找应用菜单项
            if (item = list[view.__index])
            {
                //如果下一个菜单不是是当前项的子菜单则创建新菜单
                if (!(any = list[index + 1]) || item.__menu !== any.view.__menu)
                {
                    //关闭后续菜单
                    any && close(index + 1);

                    //如果当前项包含子菜单则创建并显示
                    if ((any = item[dom.getAttribute('index')]) && any.length > 0)
                    {
                        flyingon.dom_align(
                            create_view(any, any.__menu = ++tag),
                            dom.getBoundingClientRect(),
                            'right',
                            'top',
                            true);

                        stack.push(any);
                    }
                }
            }
        }
    };


    function show(menu) {

        stack.push(menu);
        menu.trigger('shown');

        if (!mouseover.on)
        {
            on(document, 'mousedown', mousedown);
            on(document, 'mouseover', mouseover);
            on(document, 'click', click);
            
            mouseover.on = 1;
        }
    };


    function create_view(menu, tag) {

        var writer = [],
            view = document.createElement('div'),
            item,
            any;

        menu.trigger('showing');

        view.className = 'f-menu';
        view.__menu = tag;
        view.__index = stack.length;

        for (var i = 0, l = menu.length; i < l; i++)
        {
            if ((item = menu[i]) && item !== '-')
            {
                any = item.__storage || item.__defaults;

                writer.push('<a class="f-menu-item f-hover-back', any.disabled ? ' f-disabled' : '', '" index="', i, '">',
                        '<span class="f-menu-icon ', any.icon || '', '"></span>',
                        '<span class="f-menu-text">', any.text, '</span>',
                        item.length > 0 ? '<span class="f-menu-sub"></span>' : '',
                    '</a>');
            }
            else
            {
                writer.push('<div class="f-menu-sep"></div>');
            }
        }

        view.innerHTML = writer.join('');
        document.body.appendChild(view);

        menu.view = view;

        return view;
    };


    function close(index, event_off) {

        var list = stack,
            item,
            view,
            any;

        for (var i = list.length - 1; i >= index; i--)
        {
            if (item = list[i])
            {
                item.trigger('close');

                if ((view = item.view) && (any = view.parentNode))
                {
                    any.removeChild(view);

                    item.view = null;
                    item.innerHTML = '';
                }
            }
        }

        list.length = index;

        if (event_off)
        {
            off(document, 'mousedown', mousedown);
            off(document, 'mouseover', mouseover);
            off(document, 'click', click);

            mouseover.on = 0;
        }
    };



    //打开菜单
    //reference: 停靠参考物
    this.show = function (menu, reference) {

        stack[0] && close(0);

        flyingon.dom_align(
            create_view(menu, 1),
            (reference.view || reference).getBoundingClientRect(),
            'bottom',
            'left',
            true);

        show(menu);
    };


    //在指定位置打开菜单
    this.showAt = function (menu, x, y) {

        var style;

        stack[0] && close(0);

        style = create_view(menu, 1).style;
        style.left = x + 'px';
        style.top = y + 'px';

        show(menu);
    };


    //关闭菜单
    this.close = function () {

        close(0, 1);
    };



});