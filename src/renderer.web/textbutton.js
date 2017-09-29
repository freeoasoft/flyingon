flyingon.renderer('TextButton', function (base) {

    
    
    this.__line_height = 1;



    this.render = function (writer, control, render) {

        var storage = control.__storage || control.__defaults,
            text = control.text(),
            size = storage.button,
            padding;

        if (text)
        {
            text = flyingon.html_encode(text);
        }

        writer.push('<span');
        
        padding = render.call(this, writer, control, 1);

        writer.push('>',
                '<input type="text" class="f-textbox-text f-border-box" value="', text, 
                    storage.inputable ? '' : '" readonly="readonly',
                    padding ? '" style="' + padding : '',
                    '" onchange="flyingon.TextButton.onchange.call(this)"/>',
                    '<span class="f-textbox-button ', storage.icon, 
                        '" style="width:', size, 'px;" onclick="flyingon.TextButton.onclick.call(this)"></span>',
            '</span>');
    };


    flyingon.TextButton.onclick = function () {

        var control = flyingon.findControl(this),
            storage = control.__storage;

        if (!storage || !(storage.disabled || storage.readonly))
        {
            control.__on_click();
        }
    };


    flyingon.TextButton.onchange = function () {

        var control = flyingon.findControl(this);

        control.rendered = false;
        control.value(this.value);
        control.rendered = true;

        control.view.firstChild.firstChild.value = control.text();

        control.trigger('change', 'value', this.value);
    };



    this.icon = function (control, view, value) {

        view.lastChild.className = 'f-textbox-button ' + value;
    };


    this.button = function (control, view, value) {

        view.firstChild.style.marginRight = view.lastChild.style.width = value + 'px';
    };


    this.value = function (control, view) {

        view.firstChild.value = control.text();
    };


    this.color = function (control, view, value) {

        view.firstChild.style.color = value;
    };


    this.inputable = function (control, view, value) {

        view = view.firstChild;

        if (value)
        {
            view.removeAttribute('readonly');
        }
        else
        {
            view.setAttribute('readonly', 'readonly');
        }
    };



});