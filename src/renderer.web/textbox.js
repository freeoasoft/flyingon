flyingon.renderer('TextBox', function (base) {



    this.render = function (writer, control, className, cssText) {

        var text = control.__text = control.text();

        if (text)
        {
            text = flyingon.html_encode(text);
        }

        writer.push('<input');
        
        this.renderDefault(writer, control, className, cssText);
        
        writer.push(' type="text" value="', text, 
            '" oninput="flyingon.TextBox.oninput.call(this)"',
            ' onchange="flyingon.TextBox.onchange.call(this)"/>');
    };


    flyingon.TextBox.oninput = function (e) {

        var control = flyingon.findControl(this);
        control.renderer.oninput(control, this, e);
    };


    flyingon.TextBox.onchange = function () {

        var control = flyingon.findControl(this);

        try
        {
            control.rendered = false;
            control.value(this.value);
        }
        finally
        {
            control.rendered = true;
        }
        
        this.value = control.text();

        control.trigger('change', 'value', control.value());
    };


    this.text = function (control, view, value) {

        view.value = control.text();
    };


});