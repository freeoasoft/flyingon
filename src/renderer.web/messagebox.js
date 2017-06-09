flyingon.defineClass(flyingon.Renderer, function (base) {



    this.bind(flyingon.MessageBox);



    this.render = function (writer, control) {

        var any;
        
        writer.push('<div', this.renderDefault(control), ' tag="dialog">',
            '<div class="flyingon-messagebox-header" tag="header">',
                '<span class="flyingon-messagebox-icon" ', (any = control.icon()) ? 'class="' + any : 'style="dispaly:none;', '"></span>',
                '<span class="flyingon-messagebox-title">', control.title(), '</span>',
                '<span class="flyingon-messagebox-close"', control.closable() ? '' : ' style="display:none;"', ' tag="close"></span>',
            '</div>',
            '<div class="flyingon-messagebox-body">',
                '<span class="flyingon-messagebox-type" ', (any = control.type()) ? 'class="' + any : 'style="display:none;', '"></span>',
                '<span class="flyingon-messagebox-text">', control.text(), '</span>',
            '</div>',
        '</div>');
    };



    this.show = function (control) {

        var body = document.body,
            view = control.view,
            left,
            top;

        if (view)
        {
            body.appendChild(view);
        }
        else
        {
            view = this.createView(control, body);
        }

        flyingon.dom_overlay(view);

        left = control.offsetWidth;
        left = body.clientWidth - left >> 1;

        top = control.offsetHeight;
        top = ((window.innerHeight || document.documentElement.clientHeight) - top >> 1) - body.clientLeft;

        control.measure(0, 0);
        control.locate(left | 0, top | 0);

        control.update();
    };


    
    this.mount = function (control, view) {

        base.mount.call(this, control, view);
        
        control.on('mousedown', mousedown);
        control.on('click', click);
    };


    function mousedown(event) {

        if (event.which === 1 && this.movable())
        {
            switch (event_tag(event))
            {
                case 'header':
                case 'close':
                    this.renderer.movable(this, event);
                    break;
            }
        }
    };


    function click(event) {

        if (event_tag(event) === 'close')
        {
            this.close('none');
        }
    };


    function event_tag(event) {

        var dom = event.original_event.target,
            any;

        do
        {
            if (any = dom.getAttribute('tag'))
            {
                return any;
            }
        }
        while (dom = dom.parentNode);
    };

    

    this.movable = function (control, event) {

        event = event.original_event;
        event.dom = control.view;

        flyingon.dom_drag(control, event);

        event.dom = null;
    };



    this.close = function (control) {

        var view = control.view,
            any;

        flyingon.dom_overlay(view, false);

        if (any = view.parentNode)
        {
            any.removeChild(view);
        }
    };



});