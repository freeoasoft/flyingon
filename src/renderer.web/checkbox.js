flyingon.renderer('CheckBox', function (base) {



    this.render = function (writer, control) {

        writer.push('<input type="checkbox" name="', control.name(), '"');
        
        this.renderDefault(writer, control);
        
        writer.push('/>');
    };



    this.mount = function (control, view) {

        base.mount.call(this, control, view);
        view.onchange = onchange;
    };


    this.unmount = function (control) {

        control.view.onchange = null;
        base.unmount.call(this, control);
    };


    function onchange() {

        var control = flyingon.findControl(this);

        control.hasRender = false;
        control.checked(this.checked);
        control.hasRender = true;

        control.trigger('change', 'value', this.checked);
    };


});