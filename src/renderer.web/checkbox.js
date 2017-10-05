flyingon.renderer('CheckBox', function (base) {



    this.render = function (writer, control, render) {

        writer.push('<span');
        
        render.call(this, writer, control);
        
        writer.push('><input type="checkbox" class="f-checkbox-input" onchange="flyingon.CheckBox.onchange.call(this)"/></span>');
    };



    flyingon.CheckBox.onchange = function () {

        var control = flyingon.findControl(this);

        control.checked(this.checked);
        control.trigger('change', 'value', this.checked);
    };


    this.checked = function (control, view, value) {

        view.firstChild.checked = value;
    };


    this.disabled = function (control, view, value) {

        if (value)
        {
            view.firstChild.setAttribute('disabled', 'disabled');
        }
        else
        {
            view.firstChild.removeAttribute('disabled');
        }
    };


});