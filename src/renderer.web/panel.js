//容器控件渲染器
flyingon.renderer('Panel', function (base) {
    
    

    //不设置auto尺寸
    this.__auto_size = 0;


    //不渲染padding
    this.padding = 0;
    



    //渲染html
    this.render = function (writer, control, className, cssText) {

        writer.push('<div');
        
        this.renderDefault(writer, control, className, cssText);
        
        writer.push(' onscroll="flyingon.__dom_scroll.call(this, event)">');

        if (control.length > 0 && control.__visible)
        {
            control.__content_render = true;
            this.__render_children(writer, control, control, 0, control.length);
        }

        //滚动位置控制(解决有右或底边距时拖不到底的问题)
        writer.push(this.__scroll_html, '</div>');
    };


    //重新渲染内容
    this.__render_content = function (control, view) {

        var writer = [];

        //标记已渲染
        control.__content_render = true;

        this.__render_children(writer, control, control, 0, control.length);

        writer.push(this.__scroll_html);

        view.innerHTML = writer.join('');
        this.mount(control, view);
    };



    this.mount = function (control, view) {

        base.mount.call(this, control, view);

        if (control.__content_render)
        {
            view = control.view_content || view;
            this.__mount_children(control, view, control, 0, control.length, view.firstChild);
        }
    };


    this.unmount = function (control) {

        control.view = control.view_content = null;

        this.__unmount_children(control);
        base.unmount.call(this, control);
    };



    //作为html方式定位控件时需特殊处理
    this.locate_html = function (control) {

        var any = control.__location_dirty,
            width = 0,
            height = 0;
        
        if (any)
        {
            this.__locate_html(control);
        }

        control.__update_dirty = false;

        //如果需要适应容器,则计算容器大小(对性能有影响)
        if ((any = control.view) && (any = any.parentNode) && control.adaption())
        {
            width = any.clientWidth;
            height = any.clientHeight;
        }
        
        control.measure(width, height, width, height);
        this.locate(control);
    };


    this.locate = function (control) {

        base.locate.call(this, control);

        if (control.length > 0 && !control.__content_render)
        {
            this.__render_content(control, control.view_content || control.view);
        }
      
        //需要排列先重排
        if (control.__arrange_dirty > 1)
        {
            this.__arrange(control);
            this.__locate_scroll(control);
        }
 
        //定位子控件
        for (var i = 0, l = control.length; i < l; i++)
        {
            var item = control[i];

            if (item && item.view)
            {
                item.renderer.locate(item);
            }
        }
    };


    //定位滚动条
    this.__locate_scroll = function (control) {

        var style = (control.view_content || control.view).lastChild.style, //内容位置控制(解决有右或底边距时拖不到底的问题)
            cache = control.__scroll_cache || (control.__scroll_cache = {}),
            any;

        if (control.__hscroll_length !== (any = control.arrangeRight))
        {
            style.width = (control.__hscroll_length = any) + 'px'; 
        }

        if (control.__vscroll_length !== (any = control.arrangeBottom))
        {
            style.height = (control.__vscroll_length = any) + 'px'; 
        }
    };



});