flyingon.renderer('RadioButton', function (base) {



    this.padding = 0;



    this.render = function (writer, control, render) {

        writer.push('<span');
        
        render.call(this, writer, control);
        
        writer.push('><input type="radio" class="f-radio-input" name="" onchange="flyingon.RadioButton.onchange.call(this)" /></span>');
    };



    flyingon.RadioButton.onchange = function () {

        var control = flyingon.findControl(this);

        control.checked(this.checked);
        control.trigger('change', 'value', this.checked);
    };



    this.name = function (control, view, value) {

        view.firstChild.name = value ? value : '';
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