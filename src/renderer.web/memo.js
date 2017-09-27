flyingon.renderer('Memo', function (base) {



    this.render = function (writer, control, render) {

        var text = control.text();

        if (text)
        {
            text = flyingon.html_encode(text);
        }

        writer.push('<textarea');
        
        render.call(this, writer, control);
        
        writer.push(' onchange="flyingon.TextBox.onchange.call(this)">', text, '</textarea>');
    };


    flyingon.TextBox.onchange = function () {

        var control = flyingon.findControl(this);

        try
        {
            control.rendered = false;
            control.value(this.value);
            control.trigger('change', 'value', value);
        }
        finally
        {
            control.rendered = true;
        }
    };


    this.text = function (control, view, value) {

        view.value = control.text();
    };


});