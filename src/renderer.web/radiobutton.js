flyingon.renderer('RadioButton', function (base) {



    this.render = function (writer, control, className, cssText) {

        writer.push('<input type="radio" name="', control.name(), '"', control.value() ? ' checked="checked"' : '');
        
        this.renderDefault(writer, control, className, cssText);
        
        writer.push(' onchange="flyingon.RadioButton.onchange.call(this)"/>');
    };



    flyingon.RadioButton.onchange = function () {

        var control = flyingon.findControl(this);

        control.rendered = false;
        control.value(this.checked);
        control.rendered = true;

        control.trigger('change', 'value', this.checked);
    };


    this.value = function (control, view, value) {

        view.firstChild.checked = value;
    };

    
});