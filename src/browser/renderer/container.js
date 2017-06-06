//容器渲染器共用方法
flyingon.__container_renderer = function () {
    
    
    
    this.__update_dirty = function (control) {

        var any;

        //处理视图变更历史
        if (any = control.__view_history)
        {
            control.__view_history = null;
            this.__update_history(control, any);
        }

        //处理未挂载子控件
        if (control.__view_unmount)
        {
            this.__update_unmount(control);
            control.__view_unmount = 0;
        }
    };


    //view变更历史更新
    this.__update_history = function (control, list) {

        var view = control.view_body || control.view,
            index,
            item,
            tag,
            any;

        //clear
        if (index = list[0] === 0 ? 1 : 0)
        {
            any = view.lastChild;

            while (any)
            {
                view.removeChild(any);
                any = view.lastChild;
            }
        }
        
        //处理增加或移除的控件
        while (item = list[index++])
        {
            if (any = item.view)
            {
                //插入的节点
                if (item.parent === control)
                {
                    if (tag = item.nextSibling)
                    {
                        do
                        {
                            if (tag.view)
                            {
                                tag = tag.view;
                                break;
                            }
                        }
                        while (tag = tag.nextSibling);
                    }
                    
                    view.insertBefore(any, tag || null);
                }
                else if (any.parentNode === view) //移除节点且还未移除视图
                {
                    view.removeChild(any);
                }
            }
        }
    };
 
 
    //更新新添加且未创建view的子控件
    this.__update_unmount = function (control, start, end) {

        var item = start;

        start = start || control.firstChild;
        end = end || control.lastChild;

        do
        {
            if (item.view)
            {
                if (start)
                {
                    insert_html(control, start, item.previousSibling, item.view);
                    start = null;
                }
            }
            else if (!start)
            {
                start = item;
            }
        }
        while (item !== end && (item = item.nextSibling));

        if (start)
        {
            insert_html(control, start, end);
        }
    };


    //插入增量html片段
    function insert_html(control, start, end, refChild) {

        var writer = [],
            index = 0,
            item = start,
            tag = refChild && refChild.previousSibling || (control.view_body || control.view).firstChild;

        do
        {
            item.renderer.render(writer, item);
        }
        while (item !== end && (item = item.nextSibling));

        flyingon.dom_html(view, writer.join(''), refChild);

        tag = tag.nextSibling;
        item = start;

        do
        {
            item.renderer.mount(item, item.view = tag);
            tag = tag.nextSibling;
        }
        while (item !== end && (item = item.nextSibling));
    };


};