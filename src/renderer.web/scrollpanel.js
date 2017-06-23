//容器控件渲染器
flyingon.defineClass(flyingon.Renderer, function (base) {
    
    
    
    //设置渲染大小时不包含padding
    this.__no_padding = 0;


    //不渲染padding
    this.padding = 0;



    //绑定渲染器
    this.bind(flyingon.ScrollPanel);



    //渲染html
    this.render = function (writer, control, css) {

        //滚动位置控制(解决有右或底边距时拖不到底的问题)
        //使用模拟滚动条解决IE拖动闪烁问题
        //此处只渲染一个空的壳,实现渲染内容在update的时候根据需要渲染
        writer.push('<div', this.renderDefault(control, css), '>',
                '<div style="position:absolute;left:0;top:0;right:0;bottom:0;width:auto;height:auto;overflow:auto;">',
                    '<div style="position:static;overflow:hidden;visibility:hidden;margin:0;border:0;padding:0;"></div>',
                '</div>',
                '<div class="flyingon-body" style="position:relative;overflow:hidden;margin:0;border:0;padding:0;left:0;top:0;width:100%;height:100%;">',
                '<div style="position:static;overflow:hidden;visibility:hidden;margin:0;border:0;padding:0;"></div>',
                '</div>',
            '</div>');
    };


    
   this.mount = function (control, view) {

        base.mount.call(this, control, view);

        view.onscroll = null;
        control.view.firstChild.onscroll = flyingon.__dom_scroll;

        control.on('mousewheel', mousewheel);
    };


    this.unmount = function (control) {

        base.unmount.call(this, control);
        control.view.firstChild.onscroll = null;
    };


    function mousewheel(event) {

        this.view.firstChild.scrollTop -= event.wheelDelta * 100 / 120;
        event.stopPropagation();
    };



    this.update = function (control) {

        var first, last, any;

        //需要排列先重排
        if (control.__arrange_dirty)
        {
            this.__arrange(control);
            this.__update_scroll(control);
            
            control.__compute_visible();
        }

        //定位当前控件
        base.update.call(this, control);

        if ((any = control.__visible_list) && (first = any[0]))
        {
            last = any[any.length - 1];

            if (any.unmount)
            {
                any.unmount = false;
                this.__unmount_patch(control, control.view.lastChild, first, last);
            }
            
            this.__update_children(control, first, last);
        }
    };




    flyingon.__container_renderer.call(this, true);




    this.locate = function (control) {

        var style = base.locate.call(this, control);
            name = flyingon.rtl ? 'paddingLeft' : 'paddingRight';

        style[name] = control.__vscroll ? flyingon.vscroll_width + 'px' : 0;
        style.paddingBottom = control.__hscroll ? flyingon.hscroll_height + 'px' : 0;

        return style;
    };
    

    this.scroll = function (control, x, y) {

        var view = control.view.lastChild;

        control.__compute_visible();

        this.update(control);

        view.scrollLeft = x;
        view.scrollTop = y;
    };



    flyingon.__container_renderer.call(this);



    this.__update_scroll = function (control) {

        var view = control.view,
            style = view.firstChild.style,
            style1 = view.firstChild.firstChild.style, //模拟滚动条控制
            style2 = view.lastChild.lastChild.style, //内容位置控制(解决有右或底边距时拖不到底的问题)
            cache = control.__scroll_cache || (control.__scroll_cache = {}),
            any;

        if (cache.x1 !== (any = control.__hscroll ? 'scroll' : 'hidden'))
        {
            style.overflowX = cache.x1 = any;
        }

        if (cache.y1 !== (any = control.__vscroll ? 'scroll' : 'hidden'))
        {
            style.overflowY = cache.y1 = any;
        }

        if (cache.x2 !== (any = control.arrangeRight))
        {
            style1.width = style2.width = (cache.x2 = any) + 'px'; 
        }

        if (cache.y2 !== (any = control.arrangeBottom))
        {
            style1.height = style2.height = (cache.y2 = any) + 'px'; 
        }
    };



});