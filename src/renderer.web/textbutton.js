flyingon.renderer('TextButton', function (base) {

    

    this.render = function (writer, control, render) {

        var storage = control.__storage || control.__defaults,
            text = control.text(),
            size = storage.buttonSize;

        if (text)
        {
            text = flyingon.html_encode(text);
        }

        writer.push('<span');
        
        render.call(this, writer, control);

        writer.push('>',
                '<span class="f-textbutton-body" style="right:', size, 'px;">',
                    '<input type="text" class="f-textbutton-text" value="', text, 
                    storage.inputable ? '' : '" readonly="readonly',
                    '" onchange="flyingon.TextButton.onchange.call(this)"/>',
                '</span>',
                '<span class="f-textbutton-button ', storage.button, 
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



    this.button = function (control, view, value) {

        view.lastChild.className = 'f-textbutton-button ' + value;
    };


    this.buttonSize = function (control, view, value) {

        view.firstChild.style.right = view.lastChild.style.width = value + 'px';
    };


    this.text = function (control, view) {

        view.firstChild.firstChild.value = control.text();
    };


    this.inputable = function (control, view, value) {

        view = view.firstChild.firstChild;

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