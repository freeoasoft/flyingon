flyingon.renderer('GroupBox', 'Panel', function (base) {



    this.render = function (writer, control) {

        var storage = control.__storage || control.__defaults,
            head = storage.header,
            text = storage.text,
            any;

        writer.push('<div');
        
        this.renderDefault(writer, control);
        
        if (text)
        {
            text = flyingon.html_encode(text);
        }

        if (any = control.format)
        {
            text = any.call(control, text);
        }

        writer.push('>',
            '<div class="f-groupbox-head" style="height:', head, 'px;line-height:', head, 'px;text-align:', storage.align, ';" tag="head">',
                '<span class="f-groupbox-icon ', (any = storage.icon) ? any : '" style="display:none;', '"></span>',
                '<span class="f-groupbox-text">', text, '</span>',
                '<span class="f-groupbox-flag f-groupbox-', storage.collapsed ? 'close"' : 'open"', storage.collapsable === 2 ? '' : ' style="display:none;"', '></span>',
                '<span class="f-groupbox-line"></span>',
            '</div>',
            '<div class="f-groupbox-body" style="top:', head, 'px;overflow:auto;', storage.collapsed ? '' : '', '">');

        if (control.length > 0 && control.__visible)
        {
            control.__content_render = true;
            this.__render_children(writer, control, 0, control.length);
        }

        writer.push(this.__scroll_html, '</div></div>');
    };
    

    this.mount = function (control, view) {

        control.view_content = view.lastChild;
        base.mount.call(this, control, view);
        
        control.on('click', on_click);
    };


    function on_click(event) {

        if (this.collapsable())
        {
            var view = this.view,
                node = event.original_event.target;

            while (node !== view)
            {
                if (node.getAttribute('tag') === 'head')
                {
                    this.collapsed(!this.collapsed());
                }

                node = node.parentNode;
            }
        }
    };



    this.header = function (control, view, value) {

        view.firstChild.style.height = view.lastChild.style.top = value + 'px';
    };


    this.text = function (control, view, value) {

        view = view.firstChild.firstChild.nextSibling;

        if (control.format)
        {
            if (value)
            {
                value = flyingon.html_encode(value);
            }

            view.innerHTML = control.format(value);
        }
        else
        {
            view[this.__text_name] = value;
        }
    };


    this.icon = function (control, view, value) {

        view = view.firstChild.firstChild;
        view.className = 'f-groupbox-icon' + (value ? ' ' + value : '');
        view.style.display = value ? '' : 'none';
    };


    this.collapsable = function (control, view, value) {

        view.firstChild.lastChild.style.display = value === 2 ? '' : 'none';
    };


    this.collapsed = function (control, view, value) {

        view.firstChild.lastChild.previousSibling.className = 'f-groupbox-flag f-groupbox-' + (value ? 'close' : 'open');
        view.lastChild.style.display = value ? 'none' : '';
    };


    this.align = function (control, view, value) {

        view.firstChild.style.textAlign = value;
    };


});