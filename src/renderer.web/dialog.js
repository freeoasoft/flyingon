flyingon.defineClass(flyingon.PanelRenderer, function (base) {



    this.bind(flyingon.Dialog);


    flyingon.dom_test(function (div) {

        div.innerHTML = '<div class="flyingon-dialog-header"></div>';
        flyingon.Dialog.prototype.defaultValue('headerHeight', div.children[0].offsetHeight);
    });



    this.render = function (writer, control, css) {

        writer.push('<div', this.renderDefault(control, css), ' tag="dialog">',
            '<div class="flyingon-dialog-header" tag="header">',
                '<span class="flyingon-dialog-icon" style="display:none;"></span>',
                '<span class="flyingon-dialog-title"></span>',
                '<span class="flyingon-dialog-close" tag="close"></span>',
            '</div>',
            '<div class="flyingon-dialog-body" tag="body">');
        
        this.renderBody(writer, control);

        writer.push('</div></div>');
    };
    
    
    this.mount = function (control, view) {

        base.base.mount.call(this, control, view);

        view = view.lastChild;
        this.__init_children(control, view.lastChild, view.firstChild);

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

        switch (event_tag(event))
        {
            case 'close':
                this.close();
                break;

            case 'header':
                //this.renderer.active(this);
                break;
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



    this.headerHeight = function (control, view, value) {

        var style = view.children[0].style;

        style.display = value ? '' : 'none';
        style.height = style.lineHeight = control.view_body.style.top = value + 'px';
    };


    this.icon = function (control, view, value) {

        var dom = view.children[0].children[0];

        dom.className = 'flyingon-dialog-icon ' + value;
        dom.style.display = value ? '' : 'none';
    };

    
    this.title = function (control, view, value) {

        view.children[0].children[1][this.__text_name] = value;
    };


    this.closable = function (control, view, value) {

        view.children[0].children[2].style.display = value ? '' : 'none';
    };



    this.show = function (control, left, top, overlay) {

        var body = document.body,
            view;

        control.trigger('open');
        control.measure(0, 0);

        if (left == null)
        {
            left = body.clientWidth - control.offsetWidth >> 1;
        }

        if (top == null)
        {
            top = ((window.innerHeight || document.documentElement.clientHeight) - control.offsetHeight >> 1) - body.clientLeft;
        }

        control.locate(left | 0, top | 0);

        if (view = control.view)
        {
            body.appendChild(view);
        }
        else
        {
            view = this.createView(control, body);
        }

        flyingon.dom_overlay(view);

        control.shown = true;
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

        if (any = view.parentNode)
        {
            any.removeChild(view);
        }

        if (view.flyingon_overlay)
        {
            flyingon.dom_overlay(view, false);
        }
    };



});