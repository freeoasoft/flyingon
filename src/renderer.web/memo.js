flyingon.renderer('Memo', function (base) {



    this.render = function (writer, control, render) {

        writer.push('<textarea');
        
        render.call(this, writer, control);
        
        writer.push(' onchange="flyingon.TextBox.onchange.call(this)"></textarea>');
    };


    flyingon.TextBox.onchange = function () {

        var control = flyingon.findControl(this);

        control.value(this.value);
        control.trigger('change', 'value', value);
    };


    this.value = function (control, view, value) {

        view.value = control.text();
    };


});