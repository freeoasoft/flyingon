//容器控件渲染器
flyingon.PanelRenderer = flyingon.defineClass(flyingon.Renderer, function (base) {
    
    
       
    //设置渲染大小时不包含padding
    this.__no_padding = false;
    

    
    //绑定渲染器
    this.bind(flyingon.Panel);


    
    this.padding = 0;
    
    

    this.insertBefore = function (control, item) {

        (control.__view_insert || (control.__view_insert = [])).push(item);
    };

   
    this.removeChild = function (control, item) {

        (control.__view_remove || (control.__view_remove = [])).push(item.view);
    };


    this.clear = function (control) {

        var list = this.__view_remove;

        if (list)
        {
            list.length = 0;
            list.push(0);
        }
        else
        {
            this.__view_remove = [0];
        }
    };



    this.initView = function (control, view) {

        base.initView.call(this, control, view);

        control.on('mousewheel', mousewheel);
        control.on('keypress', keypress);

        this.__init_children(control, view.lastChild, view.firstChild);
    };


    function mousewheel(event) {

        this.view.firstChild.scrollTop -= event.wheelDelta * 100 / 120;
        event.stopPropagation();
    };


    function keypress(event) {

        console.log(event.which);
    };


    this.__init_children = function (control, body, scroll) {

        var item = control.firstChild,
            dom = (control.view_body = body).firstChild.nextSibling;

        while (item && dom)
        {
            item.renderer.initView(item, item.view = dom);

            item = item.nextSibling;
            dom = dom.nextSibling;
        }

        (control.view_scroll = scroll).onscroll = flyingon.__dom_scroll;
    };



    //渲染html
    this.render = function (control, writer) {

        if (control.__arrange_dirty)
        {
            control.arrange();
        }

        writer.push('<div class="', control.defaultClassName, '" style="', this.cssText(control), '">');

        this.renderBody(control, writer);

        writer.push('</div>');
    };



    //渲染内容
    this.renderBody = function (control, writer) {

        //滚动位置控制(解决有右或底边距时拖不到底的问题)
        var text = '<div style="position:relative;overflow:hidden;margin:0;border:0;padding:0;width:1px;height:1px;visibility:hidden;margin-left:',
            any = control.boxModel,
            x = any.hscroll ? any.arrangeRight - 1 : -1,
            y = any.vscroll ? any.arrangeBottom - 1 : -1;

        //使用模拟滚动条解决IE拖动闪烁问题
        writer.push('<div style="position:absolute;left:0;top:0;right:0;bottom:0;width:auto;height:auto;overflow:auto;">',
                text, x, 'px;margin-top:', y, 'px;"></div>',
            '</div>',
            '<div class="flyingon-body" style="position:relative;overflow:hidden;margin:0;border:0;padding:0;left:0;top:0;width:100%;height:100%;">',
                text, x, 'px;margin-top:', y, 'px;"></div>');

        if ((any = control.__visible_list) && any[0])
        {
            render_children(any, writer);
        }

        writer.push('</div>');
    };


    //渲染子控件
    function render_children(list, writer) {

        var index = 0,
            item;

        while (item = list[index++])
        {
            item.renderer.render(item, writer);
        }
    };



    this.locate = function (control, cssText) {

        var style = base.locate.call(this, control),
            box = control.boxModel,
            auto = control.__auto_size,
            x = !(auto & 2) && box.vscroll ? flyingon.vscroll_width + 'px' : 0,
            y = !(auto & 1) && box.hscroll ? flyingon.hscroll_height + 'px' : 0;

        if (cssText)
        {
            style[flyingon.rtl ? 'padding-left' : 'padding-right'] = x;
            style['padding-bottom'] = y;
        }
        else
        {
            style[flyingon.rtl ? 'paddingLeft' : 'paddingRight'] = x;
            style['paddingBottom'] = y;
        }

        return style;
    };



    this.update = function (control) {

        var list, item, any;

        //移除标记删除的视图
        if (any = control.__view_remove)
        {
            control.__view_remove = null;
            remove_view(control.view_body, any);
        }

        //增加标记添加的视图
        if (any = control.__view_insert)
        {
            control.__view_insert = null;
            insert_view(control, any);
        }

        //需要排列先重排
        if (control.__arrange_dirty)
        {
            control.arrange();
            this.__update_scroll(control);
        }

        //处理增量渲染控件
        if ((list = control.__visible_list) && (item = list[any = 0]))
        {
            do
            {
                if (!item.view)
                {
                    render_insert(control.view_body, item, list[list.length - 1]);
                    break;
                }
            }
            while (item = list[any++])
        }

        //调用基类布局更新方法
        base.update.call(this, control);

        //循环更新子控件
        item = control.firstChild;

        while (item)
        {
            if (item.view)
            {
                if (item.__update_dirty)
                {
                    item.renderer.update(item);
                }
                else if (item.__location_dirty)
                {
                    item.__location_dirty = false;
                    update_location(item);
                }
            }

            item = item.nextSibling;
        }
    };


    //移除标记删除的视图
    function remove_view(view, list) {

        var index = 0,
            any;

        //clear
        if (list[0] === 0)
        {
            index++;
            any = view.lastChild;

            while (any)
            {
                view.removeChild(any);
                any = view.lastChild;
            }
        }

        //removeChild
        while (any = list[index++])
        {
            if (any.parentNode === view)
            {
                view.removeChild(any);
            }
        }
    };


    //插入挂起的视图
    function insert_view(control, list) {

        var view = control.view_body,
            index = 0,
            item,
            any;

        while (item = list[index++])
        {
            if (item.parent === control && (any = item.view))
            {
                view.insertBefore(any, insert_tag(item.nextSibling));
            }
        }
    };

     
    //渲染增量插入视图
    function render_insert(view, first, last) {

        var item = first,
            any;

        while (item)
        {
            if (item.view)
            {
                if (any)
                {
                    insert_html(view, any, item.view);
                    any = null;
                }
            }
            else
            {
                (any || (any = [])).push(item);
            }

            if (item === last)
            {
                break;
            }

            item = item.nextSibling;
        }

        if (any)
        {
            insert_html(view, any, insert_tag(last.nextSibling));
        }
    };


    //插入增量html片段
    function insert_html(view, list, dom) {

        var tag = dom ? dom.previousSibling : view.lastChild,
            any;

        render_children(list, any = []);
        
        flyingon.dom_html(view, any.join(''), dom);

        dom = tag && tag.nextSibling || view.firstChild;
 
        for (var i = 0, l = list.length; i < l; i++)
        {
            (any = list[i]).renderer.initView(any, any.view = dom);
            dom = dom.nextSibling;
        }

        list.length = 0;
    };


    //获取插入节点标记
    function insert_tag(item) {

        var view;

        while (item)
        {
            if (view = item.view)
            {
                return view;
            }

            item = item.nextSibling;
        }

        return null;
    };

    
    //仅更新位置信息
    function update_location(control) {

        var box = control.boxModel,
            x = box.offsetLeft,
            y = box.offsetTop,
            style1 = control.view.style,
            style2 = control.__locate_style;

        control.__location_tag = (y << 16) + x;

        style1.left = style2.left = x + 'px';
        style1.top = style2.top = y + 'px';
    };
    


    this.__update_scroll = function (control) {

        var style1 = control.view_scroll.firstChild.style, //模拟滚动条控制
            style2 = control.view_body.firstChild.style, //内容位置控制(解决有右或底边距时拖不到底的问题)
            box = control.boxModel,
            any;

        if (box.__hscroll_length !== (any = box.hscroll ? box.arrangeRight - 1 + 'px' : '-1px'))
        {
            box.__hscroll_length = style1.marginLeft = style2.marginLeft = any; 
        }

        if (box.__vscroll_length !== (any = box.vscroll ? box.arrangeBottom - 1 + 'px' : '-1px'))
        {
            box.__vscroll_length = style1.marginTop = style2.marginTop = any; 
        }
    };



    this.scroll = function (control, x, y) {

        var view = control.view_body;

        this.update(control);

        view.scrollLeft = x;
        view.scrollTop = y;
    };



    //销毁视图
    this.dispose = function (control) {

        var view = control.view,
            any;

        if (view)
        {
            if (any = control.view_scroll)
            {
                control.view_scroll = any.onscroll = null;
            }

            control.view = control.view_body = null;
        }
    };


});