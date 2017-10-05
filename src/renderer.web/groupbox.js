flyingon.renderer('GroupBox', 'Panel', function (base) {



    this.render = function (writer, control, render) {

        var storage = control.__storage || control.__defaults,
            head = storage.header;

        writer.push('<div');
        
        render.call(this, writer, control);

        writer.push('>',
            '<div class="f-groupbox-head f-back" class="f-border-box f-back" style="height:', head, 'px;line-height:', head - 1, 'px;text-align:', storage.align, ';" onclick="flyingon.GroupBox.onclick.call(this, event)">',
                '<span class="f-groupbox-icon" style="display:none;', '"></span>',
                '<span class="f-groupbox-text"></span>',
                '<span class="f-groupbox-flag f-groupbox-', storage.collapsed ? 'close"' : 'open"', storage.collapsable === 2 ? '' : ' style="display:none;"', '></span>',
            '</div>',
            '<div class="f-groupbox-body" style="top:', head, 'px;overflow:auto;', storage.collapsed ? '' : '', '">');

        if (control.length > 0 && control.__visible)
        {
            control.__content_render = true;
            this.__render_children(writer, control, control, 0, control.length);
        }

        writer.push(this.__scroll_html, '</div></div>');
    };
    

    this.mount = function (control, view) {

        control.view_content = view.lastChild;
        base.mount.call(this, control, view);
    };


    flyingon.GroupBox.onclick = function (e) {

        var control = flyingon.findControl(this);

        if (control.collapsable())
        {
            control.collapsed(!control.collapsed());
        }
    };



    this.header = function (control, view, value) {

        var style = view.firstChild.style;

        style.height = view.lastChild.style.top = value + 'px';
        style.lineHeight = value - 1 + 'px';
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

        view.firstChild.lastChild.className = 'f-groupbox-flag f-groupbox-' + (value ? 'close' : 'open');
        view.lastChild.style.display = value ? 'none' : '';
    };


    this.align = function (control, view, value) {

        view.firstChild.style.textAlign = value;
    };


});