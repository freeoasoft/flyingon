//容器控件渲染器
flyingon.defineClass(flyingon.PanelRenderer, function (base) {
    
    
           
    //绑定渲染器
    this.bind(flyingon.ScrollPanel);



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

        control.on('mousewheel', mousewheel);
    };


    function mousewheel(event) {

        this.view.firstChild.scrollTop -= event.wheelDelta * 100 / 120;
        event.stopPropagation();
    };



    //渲染内容
    this.renderBody = function (writer, control) {

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
            render_children(writer, any);
        }

        writer.push('</div>');
    };


    //渲染子控件
    function render_children(writer, list) {

        var index = 0,
            item;

        while (item = list[index++])
        {
            item.renderer.render(writer, item);
        }
    };
    

    this.__update_scroll = function (control) {

        var style1 = control.view_scroll.firstChild.style, //模拟滚动条控制
            style2 = control.view_body.firstChild.style, //内容位置控制(解决有右或底边距时拖不到底的问题)
            any;

        if (control.__hscroll_length !== (any = control.layout_hscroll ? control.arrangeRight - 1 : -1))
        {
            style1.marginLeft = style2.marginLeft = (control.__hscroll_length = any) + 'px'; 
        }

        if (control.__vscroll_length !== (any = control.layout_vscroll ? control.arrangeBottom - 1 : -1))
        {
            style1.marginTop = style2.marginTop = (control.__vscroll_length = any) + 'px'; 
        }
    };


    this.scroll = function (control, x, y) {

        var view = control.view_body;

        this.update(control);

        view.scrollLeft = x;
        view.scrollTop = y;
    };



});