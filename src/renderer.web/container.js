//容器渲染器公用方法
flyingon.__container_renderer = function (scroll) {



    //渲染子项
    this.__render_children = function (writer, control, start, end) {

        var item = start || control.firstChild;

        while (item)
        {
            item.view || item.renderer.render(writer, item);
            
            if (item === end)
            {
                break;
            }

            item = item.nextSibling;
        }
    };



    //排列
    this.__arrange = function (control) {

        var auto = control.__auto_size,
            list = [],
            hscroll, 
            vscroll,
            any;

        if (auto & 1)
        {
            control.__hscroll = false;
        }
        else
        {
            //处理自动滚动
            switch (control.overflowX())
            {
                case 'scroll':
                    control.__hscroll = true;
                    break;

                case 'auto':
                    hscroll = true;
                    break;
                    
                default:
                    control.__hscroll = false;
                    break;
            }
        }

        if (auto & 2)
        {
            control.__vscroll = false;
        }
        else
        {
            switch (control.overflowY())
            {
                case 'scroll':
                    control.__vscroll = true;
                    break;

                case 'auto':
                    vscroll = true;
                    break;
                    
                default:
                    control.__vscroll = false;
                    break;
            }
        }

        //筛选出非隐藏控件
        if (any = control.firstChild)
        {
            do
            {
                if (any.__visible = (any.__location_values || any.__storage || any.__defaults).visible)
                {
                    list.push(any);
                }
            }
            while (any = any.nextSibling);
        }

        //排列
        flyingon.arrange(control, list, hscroll, vscroll);

        control.__arrange_dirty = false;
    };



    //更新子控件
    this.__update_children = function (control, start, end) {

        var item = start || control.firstChild;

        while (item)
        {
            if (item.view)
            {
                //需要重新渲染
                if (item.__update_dirty)
                {
                    item.renderer.update(item);
                }
                else if (item.__location_dirty) //仅位置发生变化
                {
                    item.__location_dirty = false;
                    this.__update_location(item);
                }
            }

            if (item === end)
            {
                break;
            }

            item = item.nextSibling;
        }
    };



    //仅更新位置信息
    this.__update_location = function (control) {

        var x = control.offsetLeft,
            y = control.offsetTop,
            style1 = control.view.style,
            style2 = control.__locate_style;

        control.__location_tag = (y << 16) + x;

        style1.left = style2.left = x + 'px';
        style1.top = style2.top = y + 'px';
    };



    //应用移除视图补丁
    this.__remove_patch = function (control, view, value) {

        var index = value[0] === 0 ? 1 : 0,
            item,
            any;

        view = control.view_body || view;
            
        //clear
        if (index)
        {
            any = view.lastChild;

            while (any)
            {
                view.removeChild(any);
                any = view.lastChild;
            }
        }
        
        //remove
        while (item = value[index++])
        {
            //移除节点且还未移除视图
            if (item.parent !== control && (any = item.view) && (any.parentNode === view))
            {
                view.removeChild(any);
            }
        }
    };


    //应用插入视图补丁
    this.__insert_patch = function (control, view) {

        var list = control.__insert_patch,
            item, 
            next, 
            node, 
            any;

        if (list)
        {
            control.__insert_patch = null;

            view = control.view_body || control.view;

            //处理插入带view的节点
            for (var i = list.length - 1; i > 0; i--)
            {
                if ((item = list[i]) && item.parent === control && (node = item.view))
                {
                    if (next = item.nextSibling)
                    {
                        do
                        {
                            if ((any = next.view) && any.parentNode === view)
                            {
                                next = any;
                                break;
                            }
                        }
                        while (next = next.nextSibling);
                    }
                    
                    view.insertBefore(node, next || null);
                }
            }

            //处理未渲染的子节点
            if (list[0] && !scroll)
            {
                this.__unmount_patch(control, view);
            }
        }
    };

 
    //应用未挂载子项补丁
    this.__unmount_patch = function (control, view, start, end) {

        var item = start || control.firstChild;

        start = null;

        while (item)
        {
            if (item.view)
            {
                if (start)
                {
                    this.__unmount_html(control, view, start, item.previousSibling, item.view);
                    start = null;
                }
            }
            else if (!start)
            {
                start = item;
            }

            if (item === end)
            {
                break;
            }
            
            item = item.nextSibling;
        }

        if (start)
        {
            this.__unmount_html(control, view, start, end);
        }
    };


    //插入增量html片段
    this.__unmount_html = function (control, view, start, end, refChild) {

        var writer = [],
            item = start,
            node = (refChild = refChild || view.lastChild) && refChild.previousSibling;

        this.__render_children(writer, control, start, end);
        
        flyingon.dom_html(view, writer.join(''), refChild);

        node = node && node.nextSibling || view.firstChild;

        while (item)
        {
            item.renderer.mount(item, node);

            if (item === end)
            {
                break;
            }

            item = item.nextSibling;
            node = node.nextSibling;
        }
    };



};