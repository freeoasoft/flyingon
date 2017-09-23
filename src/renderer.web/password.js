flyingon.renderer('Password', function () {


    this.render = function (writer, control) {

        var text = control.text();

        if (text)
        {
            text = flyingon.html_encode(text);
        }

        writer.push('<input');
        
        this.renderDefault(writer, control);
        
        writer.push(' type="password" value="', text, 
            '" onchange="flyingon.TextBox.onchange.call(this)"/>');
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

        control.trigger('change', 'value', this.value);
    };


    this.text = function (control, view, value) {

        view.value = value;
    };


});