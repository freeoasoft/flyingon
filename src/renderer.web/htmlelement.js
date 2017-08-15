flyingon.renderer('HtmlElement', function (base) {



    this.__scroll_html = '';




    //渲染html
    this.render = function (writer, control) {

        var storage = control.__storage || control.__defaults,
            tagName = control.tagName,
            text;

        //标注内容已渲染
        control.__content_render = true;

        writer.push('<', tagName);
        
        this.renderDefault(writer, control);
        
        writer.push('>');

        if (text = storage.text)
        {
            if (!storage.html)
            {
                text = flyingon.html_encode(text);
            }

            writer.push(text);
        }
        else if (control.length > 0 && control.__visible)
        {
            this.__render_children(writer, control, 0, control.length);
        }

        writer.push('</', tagName, '>');
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



    this.update = function (control) {

        base.update.call(this, control);

        if (control.length > 0 && control.arrange())
        {
            this.__arrange(control);
        }
        else
        {
            control.__arrange_dirty = 0;
        }
    };


    this.__arrange = function (control) {

        var Class = flyingon.HtmlElement,
            width,
            height,
            any;

        width = control.offsetWidth - control.borderLeft - control.borderRight - control.paddingLeft - control.paddingRight;
        height = control.offsetHeight - control.borderTop - control.borderBottom - control.paddintTop - control.paddingBottom;

        for (var i = 0, l = control.length; i < l; i++)
        {
            if ((any = control[i]) && !(any instanceof Class))
            {
                //css布局方式时,如果指定了宽和高且不是auto,则计算offset大小作为以后排列的依据
                //在排列时直接读取view.offsetWidth或view.offsetHeight时性能太差
                any.measure(width, height, width, height);
            }
        }

        control.__arrange_dirty = 0;
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



    this.text = function (control, view, value) {

        if (control.html())
        {
            view.innerHTML = value;
        }
        else
        {
            view[this.__text_name] = value;
        }
    };



});