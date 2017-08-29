flyingon.renderer('CheckBox', function (base) {



    this.render = function (writer, control, className, cssText) {

        writer.push('<div');
        
        this.renderDefault(writer, control, className, cssText);
        
        writer.push('><input type="checkbox" name="', control.name(), 
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