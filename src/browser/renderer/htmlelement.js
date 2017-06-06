//未知控件(html节点元素)渲染器
flyingon.defineClass(flyingon.Renderer, function (base) {
    
    
    
    //绑定渲染器
    this.bind(flyingon.HtmlElement);


    

    //渲染html
    this.render = function (writer, control, cssLayout) {

        var item = control.firstChild,
            tag = control.tagName;

        writer.push('<', tag, this.renderDefault(control, cssLayout), '>');
        
        while (item)
        {
            if (item.view)
            {
                //如果有未处理的定位样式则注册
                if (item.__view_location)
                {
                    item.renderer.set(item, '__style_location', item.__view_location);
                }
            }
            else
            {
                item.renderer.render(writer, item, true);
            }

            item = item.nextSibling;
        }

        writer.push('</', tag, '>');
    };



    this.mount = function (control, view) {

        var item = control.firstChild,
            node = view.firstChild || null,
            renderer,
            any;

        base.mount.call(this, control, view);

        while (item && node)
        {
            renderer = item.renderer;

            //如果子控件已经包含view
            if (any = item.view)
            {
                item.__view_css = true;
                view.insertBefore(any, node);
            }
            else //子控件不包含view则分配新渲染的子视图
            {
                renderer.mount(item, node);
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
    };


    this.update = function (control) {

        var item = control.firstChild;

        //定位当前控件
        base.update.call(this, control);

        //需要排列先重排
        if (control.__arrange_dirty)
        {
            this.__update_dirty(control);
        }

        while (item)
        {
            item.renderer.update(control);
            item = item.nextSibling;
        }
    };


    flyingon.__container_renderer.call(this);


    this.measure = function (control, auto) {


    };



});