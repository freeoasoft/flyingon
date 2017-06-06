//容器控件渲染器
flyingon.PanelRenderer = flyingon.defineClass(flyingon.Renderer, function (base) {
    
    
       
    //设置渲染大小时不包含padding
    this.__no_padding = 0;


    //不渲染padding
    this.padding = 0;
    

    
    //绑定渲染器
    this.bind(flyingon.Panel);



    //渲染html
    this.render = function (writer, control, cssLayout) {

        writer.push('<div', this.renderDefault(control, cssLayout), '>');
        
        this.renderBody(writer, control);

        writer.push('</div>');
    };


    //渲染内容
    this.renderBody = function (writer, control) {

        var item = control.firstChild;

        //滚动位置控制(解决有右或底边距时拖不到底的问题)
        writer.push('<div style="position:relative;overflow:hidden;margin:0;border:0;padding:0;width:1px;height:1px;visibility:hidden;"></div>');

        while (item)
        {
            item.view || item.renderer.render(writer, item, false);
            item = item.nextSibling;
        }
    };


    this.mount = function (control, view) {

        var item = control.firstChild,
            node,
            any;

        base.mount.call(this, control, view);

        //如果指定了视图容器
        if (any = this.view_body)
        {
            view = any;
        }

        //第一个元素是滚动条定位元素
        node = view.firstChild.nextSibling;

        while (item && node)
        {
            //如果子控件已经包含view
            if (any = item.view)
            {
                item.__view_css = false;
                view.insertBefore(any, node);
            }
            else //子控件不包含view则分配新渲染的子视图
            {
                item.renderer.mount(item, item.view = node);
                node = node.nextSibling;
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

        control.view_body = control.view_scroll = null;
    };

    

    this.update = function (control) {

        var item = control.firstChild, 
            any;

        //定位当前控件
        base.update.call(this, control);

        //需要排列先重排
        if (control.__arrange_dirty)
        {
            this.__update_dirty(control);

            control.arrange();
            this.__update_scroll(control);
        }

        //循环更新子控件
        item = control.firstChild;

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

            item = item.nextSibling;
        }
    };


    this.locate = function (control) {

        var style = base.locate.call(this, control),
            auto = control.layout_auto,
            x = !(auto & 2) && control.layout_vscroll ? flyingon.vscroll_width + 'px' : 0,
            y = !(auto & 1) && control.layout_hscroll ? flyingon.hscroll_height + 'px' : 0;

        style[flyingon.rtl ? 'paddingLeft' : 'paddingRight'] = x;
        style['paddingBottom'] = y;

        return style;
    };


    flyingon.__container_renderer.call(this);


    //更新滚动条
    this.__update_scroll = function (control) {

        var style = control.view.firstChild.style, //内容位置控制(解决有右或底边距时拖不到底的问题)
            any;

        if (control.__hscroll_length !== (any = control.layout_hscroll ? control.arrangeRight - 1 : -1))
        {
            style.marginLeft = (control.__hscroll_length = any) + 'px'; 
        }

        if (control.__vscroll_length !== (any = control.layout_vscroll ? control.arrangeBottom - 1 : -1))
        {
            style.marginTop = (control.__vscroll_length = any) + 'px'; 
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



});