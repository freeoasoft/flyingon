//容器控件渲染器
flyingon.renderer('ScrollPanel', function (base) {
    
    
    
    //不设置auto尺寸
    this.__auto_size = 0;


    //设置渲染大小时不包含padding
    this.__no_padding = 0;


    //不渲染padding
    this.padding = 0;




    //渲染html
    this.render = function (writer, control, css) {

        var text = this.__scroll_html;

        //滚动位置控制(解决有右或底边距时拖不到底的问题)
        //使用模拟滚动条解决IE拖动闪烁问题
        //此处只渲染一个空的壳,实现渲染内容在update的时候根据需要渲染
        writer.push('<div');
        
        this.renderDefault(writer, control, css);
        
        writer.push('>',
                '<div style="position:absolute;left:0;top:0;right:0;bottom:0;width:auto;height:auto;overflow:auto;">',
                    text,
                '</div>',
                '<div class="f-body" style="position:relative;overflow:hidden;margin:0;border:0;padding:0;left:0;top:0;width:100%;height:100%;">',
                    text,
                '</div>',
            '</div>');
    };


    
    this.mount = function (control, view) {

        base.mount.call(this, control, view);

        control.view_content = view.lastChild;
        control.view.firstChild.onscroll = flyingon.__dom_scroll;
        
        control.on('mousewheel', mousewheel);
    };


    this.unmount = function (control) {

        control.view.firstChild.onscroll = null;
        
        this.__unmount_children(control);
        base.unmount.call(this, control);
    };


    function mousewheel(event) {

        var view = this.view;

        if (view.style.overflowY !== 'hidden')
        {
            view.firstChild.scrollTop -= event.wheelDelta * 100 / 120;
            event.stopPropagation();
        }
    };



    this.update = function (control) {

        var start, end, item;

        //需要排列先重排
        if (control.__arrange_dirty > 1)
        {
            start = control.__visible_start;
            end = control.__visible_end + 1;

            this.__arrange(control);
            this.__update_scroll(control);
            
            control.__compute_visible();

            //隐藏原来显示的子项
            if (start >= 0)
            {
                while (start <= end)
                {
                    if ((item = control[start++]) && !item.__visible_area)
                    {
                        this.__update_position(item);
                    }
                }
            }
        }

        base.update.call(this, control);

        start = control.__visible_start;
        end = control.__visible_end + 1;

        if (start >= 0)
        {
            if (control.__visible_unmount)
            {
                control.__visible_unmount = false;
                this.__insert_patch(control, control.view.lastChild, start, end);
            }
            
            this.__update_children(control, start, end);
        }
    };


    this.__update_layout = function (control, style) {

        var cache = base.__update_layout.call(this, control, style),
            name = flyingon.rtl ? 'paddingLeft' : 'paddingRight',
            any;

        if (cache[name] !== (any = control.__vscroll ? flyingon.vscroll_width : 0))
        {
            style[name] = (cache[name] = any) + 'px';
        }

        if (cache.paddingBottom !== (any = control.__hscroll ? flyingon.hscroll_height : 0))
        {
            style.paddingBottom = (cache.paddingBottom = any) + 'px';
        }

        return cache;
    };
    


    this.scroll = function (control, x, y) {

        var view = control.view.lastChild;

        this.update(control);
        
        if (view.scrollLeft !== x)
        {
            view.scrollLeft = x;
        }

        if (view.scrollTop !== y)
        {
            view.scrollTop = y;
        }
    };



    this.__update_scroll = function (control) {

        var view = control.view,
            style1 = view.firstChild.firstChild.style, //模拟滚动条控制
            style2 = view.lastChild.lastChild.style, //内容位置控制(解决有右或底边距时拖不到底的问题)
            cache = control.__scroll_cache || (control.__scroll_cache = {}),
            any;

        style1 = view.firstChild.firstChild.style; //模拟滚动条控制

        if (cache.x2 !== (any = control.arrangeRight))
        {
            style1.width = style2.width = (cache.x2 = any) + 'px'; 
        }

        if (cache.y2 !== (any = control.arrangeBottom))
        {
            style1.height = style2.height = (cache.y2 = any) + 'px'; 
        }
    };


    this.__sync_scroll = function (control) {
    };



});