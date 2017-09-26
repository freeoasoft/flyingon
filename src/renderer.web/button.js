flyingon.renderer('Button', function (base) {

    

    this.render = function (writer, control, render) {

        writer.push('<button type="button"');
        
        render.call(this, writer, control);
        
        writer.push('>');

        this.__render_content(writer, control);
        
        writer.push('</button>');
    };


    this.__render_content = function (writer, control) {

        var encode = flyingon.html_encode,
            storage = control.__storage || control.__defaults,
            any;

        if (any = storage.icon)
        {
            writer.push('<span class="', encode(any), '" style="width:', 
                any = storage.iconSize, 'px;height:', any, 'px;">', '</span>');
            
            any = true;
        }

        if (any = storage.text)
        {
            if (any && storage.vertical)
            {
                writer.push('<br/>');
            }

            if (!storage.html)
            {
                any = encode(any);
            }

            writer.push('<span class="f-button-text">', any, '</span>');
        }

        if (any = storage.dropdown)
        {
            writer.push('<span class="f-button-drop"></span>');
        }
    };


    this.__measure_auto = function (control, auto) {

        var view = control.view;

        if (auto & 1)
        {
            control.offsetWidth = view && view.offsetWidth || 0;
        }

        if (auto & 2)
        {
            view.style.width = control.offsetWidth + 'px';
            control.offsetHeight = view && view.offsetHeight || 0;
        }
    };


    this.icon = this.iconSize = this.vertical = function (control, view, value) {

        var writer = [];

        this.__render_content(writer, control);
        view.innerHTML = writer.join('');
    };


    this.text = this.html = function (control, view) {

        var storage = control.__storage || control.__defaults;

        view = view.lastChild;

        while (view)
        {
            if (view.className.indexOf('f-button-text') >= 0)
            {
                if (storage.html)
                {
                    view.lastChild.pre.innerHTML = storage.text;
                }
                else
                {
                    view.lastChild[this.__text_name] = storage.text;
                }
            }

            view = view.previousSibling;
        }
    };



});