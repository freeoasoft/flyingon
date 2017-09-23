//容器控件渲染器
flyingon.renderer('Box', function (base) {
    
    

    this.__scroll_html = '';

    this.__auto_size = 0;



    //渲染html
    this.render = function (writer, control) {

        writer.push('<div');
        
        this.renderDefault(writer, control);
        
        writer.push('>');

        this.__render_children(writer, control, control, 0, control.length);

        writer.push('</div>');
    };



    this.mount = function (control, view) {

        base.mount.call(this, control, view);
        this.__mount_children(control, view, control, 0, control.length, view.firstChild);
    };


    this.unmount = function (control) {

        this.__unmount_children(control);
        base.unmount.call(this, control);
    };



    //作为html方式定位控件时需特殊处理
    this.locate_html = function (control) {

        var width = 0,
            height = 0,
            any;
        
        base.__locate_html.call(this, control);

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



});