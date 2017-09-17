//容器控件渲染器
flyingon.renderer('ScrollPanel', function (base) {
    
    
    
    //不设置auto尺寸
    this.__auto_size = 0;


    //不渲染padding
    this.padding = 0;




    //渲染html
    this.render = function (writer, control, className, cssText) {

        var text = this.__scroll_html;

        //滚动位置控制(解决有右或底边距时拖不到底的问题)
        //使用模拟滚动条解决IE拖动闪烁问题
        //此处只渲染一个空的壳,实现渲染内容在locate的时候根据需要渲染
        writer.push('<div');
        
        this.renderDefault(writer, control, className, cssText);
        
        writer.push('>',
            '<div class="f-scrollpanel-scroll" onscroll="flyingon.__dom_scroll.call(this, event)">',
                text,
            '</div>',
            '<div class="f-scrollpanel-body" style="overflow:hidden;">',
                text,
            '</div>',
        '</div>');
    };


    
    this.mount = function (control, view) {

        control.view_content = view.lastChild;
        
        base.mount.call(this, control, view);

        control.on('mousewheel', mousewheel);
    };


    this.unmount = function (control, remove) {

        control.view_content = null;

        this.__unmount_children(control);
        base.unmount.call(this, control, remove);
    };


    function mousewheel(event) {

        this.view.firstChild.scrollTop -= event.wheelDelta * 100 / 120;
        flyingon.dom_stop(event);
    };



    this.locate = function (control) {

        var cache = base.locate.call(this, control),
            start, 
            end, 
            any;

        //需要排列先重排
        if (control.__arrange_dirty > 1)
        {
            start = control.__visible_start;
            end = control.__visible_end + 1;

            this.__arrange(control);

            control.__compute_visible();

            //隐藏原来显示的子项
            if (start >= 0)
            {
                while (start <= end)
                {
                    if ((any = control[start++]) && !any.__visible_area)
                    {
                        this.__locate_position(any);
                    }
                }
            }
        }

        any = control.view_content.style;
        any[flyingon.rtl ? 'left' : 'right'] = (control.__vscroll ? flyingon.vscroll_width : 0) + 'px';
        any.bottom = (control.__hscroll ? flyingon.hscroll_height : 0) + 'px';

        start = control.__visible_start;
        end = control.__visible_end + 1;

        if (start >= 0)
        {
            //插入未挂载的子控件
            if (control.__visible_unmount)
            {
                control.__visible_unmount = false;
                this.__insert_children(control, control.view_content, start, end);
            }
            
            //定位子控件
            while (start < end)
            {
                any = control[start++];

                if (any && any.view)
                {
                    any.renderer.locate(any);
                }
            }
        }

        return cache;
    };


    //仅更新位置信息
    this.__locate_position = function (control) {

        var style = control.view.style,
            cache = control.__locate_cache,
            any;

        if (cache)
        {
            if (cache.left !== (any = control.offsetLeft))
            {
                style.left = (cache.left = any) + 'px';
            }

            if (cache.top !== (any = control.offsetTop))
            {
                style.top = (cache.top = any) + 'px';
            }
        }
    };


    this.__sync_scroll = function (control) {

        var view = control.view,
            style1 = view.firstChild.firstChild.style, //模拟滚动条控制
            style2 = view.lastChild.lastChild.style; //内容位置控制(解决有右或底边距时拖不到底的问题)

        style1.overflowX = control.__hscroll ? 'scroll' : 'hidden';
        style1.overflowY = control.__vscroll ? 'scroll' : 'hidden';

        style1.width = style2.width = control.arrangeRight + 'px'; 
        style1.height = style2.height = control.arrangeBottom + 'px'; 
    };


    //插入视图补丁
    this.__insert_children = function (control, view, start, end) {

        var tag = view.lastChild || null,
            last = -1,
            item,
            node;
            
        //处理插入带view的节点
        for (var i = end - 1; i >= start; i--)
        {
            if (item = control[i])
            {
                if (node = item.view)
                {
                    if (node.parentNode !== view)
                    {
                        view.insertBefore(node, tag || null);
                    }

                    if (last > 0)
                    {
                        this.__unmount_html(control, view, control, i + 1, last, tag);
                        last = -1;
                    }

                    tag = node;
                }
                else if (last < 0)
                {
                    last = i + 1;
                }
            }
        }

        if (last > 0)
        {
            this.__unmount_html(control, view, control, start, last, tag);
        }
    };

 

    this.scroll = function (control, x, y) {

        var view = control.view.lastChild;

        this.locate(control);
        
        if (view.scrollLeft !== x)
        {
            view.scrollLeft = x;
        }

        if (view.scrollTop !== y)
        {
            view.scrollTop = y;
        }
    };


});