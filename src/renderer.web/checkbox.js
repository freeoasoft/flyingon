flyingon.renderer('CheckBox', function (base) {



    this.render = function (writer, control) {

        writer.push('<input type="checkbox" name="', control.name(), '"');
        
        this.renderDefault(writer, control);
        
        writer.push(' onchange="flyingon.CheckBox.onchange.call(this)" />');
    };



    flyingon.CheckBox.onchange = function () {

        var control = flyingon.findControl(this);

        control.rendered = false;
        control.checked(this.checked);
        control.rendered = true;

        control.trigger('change', 'value', this.checked);
    };


});