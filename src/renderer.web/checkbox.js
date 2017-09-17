flyingon.renderer('CheckBox', function (base) {



    this.render = function (writer, control, className, cssText) {

        writer.push('<div');
        
        this.renderDefault(writer, control, className, cssText);
        
        writer.push('><input type="checkbox" name="', control.name(), control.value() ? '" checked="checked' : '',
            '" class="f-checkbox-input" onchange="flyingon.CheckBox.onchange.call(this)" /></div>');
    };



    flyingon.CheckBox.onchange = function () {

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