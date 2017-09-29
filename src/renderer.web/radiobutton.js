flyingon.renderer('RadioButton', function (base) {



    this.padding = 0;



    this.render = function (writer, control, render) {

        writer.push('<div');
        
        render.call(this, writer, control, false);
        
        writer.push('><input type="radio" name="', control.name(), control.checked() ? '" checked="checked' : '',
            '" class="f-radio-input" onchange="flyingon.RadioButton.onchange.call(this)" /></div>');
    };



    flyingon.RadioButton.onchange = function () {

        var control = flyingon.findControl(this);

        control.rendered = false;
        control.checked(this.checked);
        control.rendered = true;

        control.trigger('change', 'value', this.checked);
    };


    this.checked = function (control, view, value) {

        view.firstChild.checked = value;
    };

    
});