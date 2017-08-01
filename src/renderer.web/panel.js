//容器控件渲染器
flyingon.renderer('Panel', function (base) {
    
    

    //不设置auto尺寸
    this.__auto_size = 0;


    //设置渲染大小时不包含padding
    this.__no_padding = 0;


    //不渲染padding
    this.padding = 0;
    



    //渲染html
    this.render = function (writer, control, css) {

        writer.push('<div');
        
        this.renderDefault(writer, control, css);
        
        writer.push('>');

        if (control.length > 0 && control.__visible)
        {
            control.__content_render = true;
            this.__render_children(writer, control, 0, control.length);
        }

        //滚动位置控制(解决有右或底边距时拖不到底的问题)
        writer.push(this.__scroll_html, '</div>');
    };


    //重新渲染内容
    this.__render_body = function (control, view) {

        var writer = [];

        //标记已渲染
        control.__content_render = true;

        this.__render_children(writer, control, 0, control.length);

        writer.push(this.__scroll_html);

        view.innerHTML = writer.join('');
        this.mount(control, view);
    };



    this.mount = function (control, view) {

        base.mount.call(this, control, view);

        view = control.view_content || view;
        view.onscroll = flyingon.__dom_scroll;

        if (control.__content_render)
        {
            this.__mount_children(control, view, 0, view.firstChild);
        }
    };


    this.unmount = function (control) {

        control.view = control.view_content = (control.view_content || control.view).onscroll = null;

        this.__unmount_children(control);
        base.unmount.call(this, control);
    };



    this.update = function (control, css) {

        base.update.call(this, control, css);

        if (control.length > 0 && !control.__content_render)
        {
            this.__render_body(control, control.view_content || control.view);
        }
      
        //需要排列先重排
        if (control.__arrange_dirty > 1)
        {
            this.__arrange(control);
            this.__update_scroll(control);
        }

        this.__update_children(control, 0, control.length);
    };



    //更新滚动条
    this.__update_scroll = function (control) {

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