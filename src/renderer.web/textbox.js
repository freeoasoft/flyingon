flyingon.renderer('TextBox', function (base) {



    this.__line_height = 1;



    //注: onchange, onpropertychange在IE8下不冒泡
    this.render = function (writer, control, render) {

        var text = control.text(),
            padding;

        if (text)
        {
            text = flyingon.html_encode(text);
        }

        writer.push('<span');
        
        padding = render.call(this, writer, control, 1);

        writer.push('><input type="', control.__type || 'text', 
            '" class="f-textbox-text f-border-box" value="', text, 
            padding ? '" style="' + padding : '',
            '" onchange="flyingon.TextBox.onchange.call(this)"/></span>');
    };


    flyingon.TextBox.onchange = function () {

        var control = flyingon.findControl(this),
            value = control.__to_value(this.value);

        if (value !== control.value())
        {
            control.rendered = false;
        
            try
            {
                control.value(value);
                control.trigger('change', 'value', value);
            }
            finally
            {
                control.rendered = true;
            }
        }

        this.value = control.text();
    };


    this.value = function (control, view) {

        view.firstChild.value = control.text();
    };


    this.color = function (control, view, value) {

        view.firstChild.style.color = value;
    };



});