flyingon.renderer('TextBox', function (base) {



    this.render = function (writer, control, className, cssText) {

        var text = control.text();

        if (text)
        {
            text = flyingon.html_encode(text);
        }

        writer.push('<input');
        
        this.renderDefault(writer, control, className, cssText);
        
        writer.push(' type="text" value="', text, '" onchange="flyingon.TextBox.onchange.call(this)"/>');
    };


    flyingon.TextBox.onchange = function () {

        var control = flyingon.findControl(this);

        control.rendered = false;
        control.value(this.value);
        control.rendered = true;

        this.value = control.text();

        control.trigger('change', 'value', this.value);
    };



    this.text = function (control, view, value) {

        view.value = value;
    };



});