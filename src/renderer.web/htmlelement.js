flyingon.renderer('HtmlElement', function (base) {



    var tags = flyingon.create(null);

    var check_tag = document.createElement('div');


    tags.div = 'div';
    tags.span = 'span';
    tags.input = 'input';


    this.__scroll_html = '';



    //渲染html
    this.render = function (writer, control) {

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
        
        this.renderDefault(writer, control);
        
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