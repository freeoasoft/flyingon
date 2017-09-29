flyingon.renderer('CheckBox', function (base) {



    this.render = function (writer, control, render) {

        writer.push('<div');
        
        render.call(this, writer, control, false);
        
        writer.push('><input type="checkbox" name="', control.name(), control.checked() ? '" checked="checked' : '',
            '" class="f-checkbox-input" onchange="flyingon.CheckBox.onchange.call(this)" /></div>');
    };



    flyingon.CheckBox.onchange = function () {

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