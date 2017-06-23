flyingon.defineClass(flyingon.Renderer, function (base) {



    this.__css_layout = true;
    


    this.bind(flyingon.Unkown);



    //渲染html
    this.render = function (writer, control, css) {

        var tagName = control.tagName;

        writer.push('<', tagName, this.renderDefault(control, css), '>');

        this.__render_children(writer, control);

        writer.push('</', tagName, '>');
    };

    


    this.mount = function (control, view) {

        base.mount.call(this, control, view);
        this.__mount_children(control, view, control.firstChild, view.firstChild);
    };



    this.update = function (control, css) {
        
        //定位当前控件
        base.update.call(this, control, css);

        this.__update_children(control);
    };



    flyingon.__container_renderer.call(this);



    //更新子控件
    this.__update_children = function (control, start, end) {

        var item = start || control.firstChild;

        while (item)
        {
            if (item.view && item.__update_dirty)
            {
                item.renderer.update(item, true);
            }

            if (item === end)
            {
                break;
            }

            item = item.nextSibling;
        }
    };



    this.measure_auto = function (control, auto) {

        var view = control.view;

        if (auto & 1)
        {
            control.offsetWidth = view.offsetWidth;
        }

        if (auto & 2)
        {
            control.offsetHeight = view.offsetHeight;
        }
    };



    this.compute = function (control) {

        var view = control.view;

        control.offsetLeft = view && view.offsetLeft || 0;
        control.offsetTop = view && view.offsetTop || 0;
        control.offsetWidth = view && view.offsetWidth || 0;
        control.offsetHeight = view && view.offsetHeight || 0;
    };


    this.__view_attributes = function (control, view) {

        var keys = control.__view_attributes;

        if (keys)
        {
            control.__view_attributes = null;

            for (var name in keys)
            {
                view.setAttribute(name, keys[name]);
            }
        }
    };


});