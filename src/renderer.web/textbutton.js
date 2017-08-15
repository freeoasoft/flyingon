flyingon.renderer('TextButton', function (base) {

    

    this.render = function (writer, control) {

        var storage = control.__storage || control.__defaults,
            text = control.text(),
            size = storage.buttonSize;

        if (text)
        {
            text = flyingon.html_encode(text);
        }

        writer.push('<div');
        
        this.renderDefault(writer, control);

        writer.push('>',
                '<div class="f-textbutton-body" style="right:', size, 'px;">',
                    '<input type="text" class="f-textbutton-text" value="', text, '"/>',
                '</div>',
                '<div class="f-textbutton-button ', storage.button, '" style="width:', size, 'px;"></div>',
            '</div>');
    };


    this.text = function (control, view) {

        view.firstChild.firstChild.value = control.text();
    };



    this.mount = function (control, view) {

        base.mount.call(this, control, view);

        view.onclick = onclick;
        view.onchange = onchange;
    };


    this.unmount = function (control) {

        var view = control.view;

        view.onclick = view.onchange = null;
        base.unmount.call(this, control);
    };


    function onclick(e) {

        if ((e.target || e.srcElement).className.indexOf('f-textbutton-button') >= 0)
        {
            flyingon.findControl(this).__on_click();
        }
    };


    function onchange() {

        var control = flyingon.findControl(this),
            input = this.firstChild.firstChild;

        control.hasRender = false;
        control.value(input.value);
        control.hasRender = true;

        control.trigger('change', 'value', input.value);
    };


});