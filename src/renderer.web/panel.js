//容器控件渲染器
flyingon.PanelRenderer = flyingon.defineClass(flyingon.Renderer, function (base) {
    
    
       
    //设置渲染大小时不包含padding
    this.__no_padding = 0;


    //不渲染padding
    this.padding = 0;
    

    
    //绑定渲染器
    this.bind(flyingon.Panel);



    //渲染html
    this.render = function (writer, control, css) {

        writer.push('<div', this.renderDefault(control, css), '>');

        this.__render_children(writer, control);

        //滚动位置控制(解决有右或底边距时拖不到底的问题)
        writer.push('<div style="position:static;overflow:hidden;visibility:hidden;margin:0;border:0;padding:0;"></div></div>');
    };


    

    this.mount = function (control, view) {

        base.mount.call(this, control, view);
        this.__mount_children(control, view, control.firstChild, view.firstChild);
    };



    this.update = function (control, css) {

        //定位当前控件
        base.update.call(this, control, css);

        //需要排列先重排
        if (control.__arrange_dirty)
        {
            this.__arrange(control);
            this.__update_scroll(control);
        }
        
        this.__update_children(control);
    };



    flyingon.__container_renderer.call(this);



    //更新滚动条
    this.__update_scroll = function (control) {

        var style = control.view.style, //内容位置控制(解决有右或底边距时拖不到底的问题)
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

        style = control.view.lastChild.style; //内容位置控制(解决有右或底边距时拖不到底的问题)
            
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