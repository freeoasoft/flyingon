//容器控件渲染器
flyingon.PanelRenderer = flyingon.defineClass(flyingon.Renderer, function (base) {
    
    
       
    //设置渲染大小时不包含padding
    this.__no_padding = 0;


    //不渲染padding
    this.padding = 0;
    

    
    //绑定渲染器
    this.bind(flyingon.Panel);



    //渲染html
    this.render = function (writer, control) {

        writer.push('<div', this.renderDefault(control), '>');

        this.__render_children(writer, control);

        //滚动位置控制(解决有右或底边距时拖不到底的问题)
        writer.push('<div style="position:absolute;overflow:hidden;margin:0;border:0;padding:0;width:1px;height:1px;"></div></div>');
    };



    this.mount = function (control, view) {

        base.mount.call(this, control, view);
        this.__mount_children(control, view, control.firstChild, view.firstChild);
    };


    //挂载子控件
    this.__mount_children = function (control, view, item, node, end) {

        var any;

        while (item && node)
        {
            //如果子控件已经包含view
            if (any = item.view)
            {
                view.insertBefore(any, node);
            }
            else //子控件不包含view则分配新渲染的子视图
            {
                item.renderer.mount(item, node);
                node = node.nextSibling;
            }

            if (item === end)
            {
                break;
            }

            item = item.nextSibling;
        }
    };


    this.unmount = function (control) {

        var item = control.firstChild;

        base.unmount.call(this, control);

        while (item)
        {
            if (item.view)
            {
                item.renderer.unmount(item);
            }

            item = item.nextSibling;
        }
    };

    

    this.update = function (control) {

        //需要排列先重排
        if (control.__arrange_dirty)
        {
            this.__arrange(control);
            this.__update_scroll(control);
        }
        
        //定位当前控件
        base.update.call(this, control);

        this.__update_children(control);
    };



    flyingon.__container_renderer.call(this);



    this.locate = function (control) {

        var style = base.locate.call(this, control);

        style.overflowX = control.__hscroll ? 'scroll' : 'hidden';
        style.overflowY = control.__vscroll ? 'scroll' : 'hidden';

        return style;
    };


    //更新滚动条
    this.__update_scroll = function (control) {

        var style = control.view.lastChild.style, //内容位置控制(解决有右或底边距时拖不到底的问题)
            any;

        if (control.__hscroll_length !== (any = control.__hscroll ? control.arrangeRight - 1 : 0))
        {
            style.left = (control.__hscroll_length = any) + 'px'; 
        }

        if (control.__vscroll_length !== (any = control.__vscroll ? control.arrangeBottom - 1 : 0))
        {
            style.top = (control.__vscroll_length = any) + 'px'; 
        }
    };



});