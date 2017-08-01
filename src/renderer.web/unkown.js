flyingon.renderer('Unkown', function (base) {



    this.__css_layout = true;
    
    this.__scroll_html = '';




    //渲染html
    this.render = function (writer, control, css) {

        var tagName = control.tagName,
            text = control.text();

        writer.push('<', tagName);
        
        this.renderDefault(writer, control, css);
        
        writer.push('>');

        if (text)
        {
            writer.push(flyingon.html_encode(text, false));
        }
        else if (control.length > 0 && control.__visible)
        {
            control.__content_render = true;
            this.__render_children(writer, control, 0, control.length);
        }

        writer.push('</', tagName, '>');
    };



    //重新渲染内容
    this.__render_body = function (control, view) {

        var writer = [];

        //标记已渲染
        control.__content_render = true;

        this.__render_children(writer, control, 0, control.length);

        view.innerHTML = writer.join('');
        this.mount(control, view);
    };


 
    
    this.mount = function (control, view) {

        base.mount.call(this, control, view);

        if (control.__content_render)
        {
            this.__mount_children(control, view, 0, view.firstChild);
        }

        view.onscroll = flyingon.__dom_scroll;
    };


    this.unmount = function (control) {

        control.view.onscroll = null;

        this.__unmount_children(control);
        base.unmount.call(this, control);
    };


    this.update = function (control, css) {
        
        base.update.call(this, control, css);

        if (control.length > 0)
        {
            if (!control.__content_render)
            {
                this.__render_body(control, control.view);
            }

            if (control.__arrange_dirty > 1)
            {
                this.__arrange(control);
            }
        }

        this.__update_children(control, 0, control.length);
        control.__arrange_dirty = 0;
    };


    this.__arrange = function (control) {

        var width = control.offsetWidth - control.borderLeft - control.borderRight - control.paddingLeft - control.paddingRight,
            height = control.offsetHeight - control.borderTop - control.borderBottom - control.paddintTop - control.paddingBottom,
            item;

        for (var i = 0, l = control.length; i < l; i++)
        {
            if (item = control[i])
            {
                item.offsetLeft = item.offsetTop = 0;

                if (item.__is_container)
                {
                    //css布局方式时,如果指定了宽和高且不是auto,则计算offset大小作为以后排列的依据
                    //在排列时直接读取view.offsetWidth或view.offsetHeight时性能太差
                    item.measure(width, height, width, height);
                }
                else
                {
                    item.offsetWidth = item.offsetHeight = 0;
                }
            }
        }
    };




    this.__measure_auto = function (control, auto) {

        var view = control.view;

        if (auto & 2)
        {
            if (control.__content_render)
            {
                this.update(control);
            }
            
            control.offsetHeight = view && view.offsetHeight || 0;
        }
    };




    this.compute = function (control) {

        var view = control.view;

        control.offsetLeft = view && view.offsetLeft || 0;
        control.offsetTop = view && view.offsetTop || 0;
        control.offsetWidth = view && view.offsetWidth || 0;
        control.offsetHeight = view && view.offsetHeight || 0;
    };



    this.text = function (control, view, value) {

        view[this.__text_name] = value && flyingon.html_encode(value) || '';
    };



});