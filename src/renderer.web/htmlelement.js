flyingon.renderer('HtmlElement', function (base) {



    var tags = flyingon.create(null);

    var check_tag = document.createElement('div');


    tags.div = 'div';
    tags.span = 'span';
    tags.input = 'input';


    this.__scroll_html = '';



    //渲染html
    this.render = function (writer, control, className, cssText) {

        var storage = control.__storage || control.__defaults,
            tagName, 
            any;

        //注:IE8下不支持自定义标签,不支持的标签全部使用div
        if (!(tagName = tags[any = control.tagName]))
        {
            check_tag.innerHTML = '<' + any + '></' + any + '>';
            tags[any] = tagName = check_tag.firstChild ? any : 'div';
        }

        //标注内容已渲染
        control.__content_render = true;

        writer.push('<', tagName);
        
        this.renderDefault(writer, control, className, cssText);
        
        writer.push('>');

        if (any = storage.text)
        {
            if (!storage.html)
            {
                any = flyingon.html_encode(any);
            }

            writer.push(any);
        }
        else if (control.length > 0 && control.__visible)
        {
            this.__render_children(writer, control, control, 0, control.length);
        }

        writer.push('</', tagName, '>');
    };


    
    this.mount = function (control, view) {

        base.mount.call(this, control, view);

        if (control.__content_render)
        {
            this.__mount_children(control, view, control, 0, control.length, view.firstChild);
        }
    };


    this.unmount = function (control) {

        this.__unmount_children(control);
        base.unmount.call(this, control);
    };



    //定位控件时
    this.locate = function (control) {

        base.locate.call(this, control);
        
        if (control.length > 0)
        {
            this.__locate_children(control);
        }
    };


    //按照html方式定位控件时
    this.locate_html = function (control) {

        var dirty = control.__location_dirty;
        
        if (dirty)
        {
            this.__locate_html(control);
        }

        control.__update_dirty = false;

        if (control.length > 0)
        {
            this.__locate_children(control);
        }
    };


    //定位子控件
    this.__locate_children = function (control) {

        for (var i = 0, l = control.length; i < l; i++)
        {
            var item = control[i];

            if (item && item.view)
            {
                item.renderer.locate_html(item);
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
                this.locate(control);
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