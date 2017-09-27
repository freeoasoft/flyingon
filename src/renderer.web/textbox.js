flyingon.renderer('TextBox', function (base) {



    this.render = function (writer, control, render) {

        var text = control.text();

        if (text)
        {
            text = flyingon.html_encode(text);
        }

        writer.push('<input');
        
        render.call(this, writer, control);
        
        writer.push(' type="text" value="', text, 
            //'" oninput="flyingon.TextBox.oninput.call(this)',
            '" onchange="flyingon.TextBox.onchange.call(this)"/>');
    };


    // flyingon.TextBox.oninput = function (e) {

    //     var control = flyingon.findControl(this);
    //     control.renderer.oninput(control, this, e);
    // };


    flyingon.TextBox.onchange = function () {

        var control = flyingon.findControl(this),
            value;

        try
        {
            control.rendered = false;
            
            value = control.__to_value(this.value);

            if (value !== control.value())
            {
                control.value(value);
                control.trigger('change', 'value', value);
            }

            this.value = control.text();
        }
        finally
        {
            control.rendered = true;
        }
    };


    // this.oninput = function (control, view, event) {

    // };


    this.text = function (control, view, value) {

        view.value = control.text();
    };


});