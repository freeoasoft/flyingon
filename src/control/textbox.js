flyingon.fragment('f-TextBox', function () {


    this.defaultWidth = 200;


    //是否只读
    this.defineProperty('readonly', false, {

        set: this.__to_render   
    });
    


    this.selectionStart = function (value) {
        
        return this.renderer.selectionStart(value);
    };


    this.selectionEnd = function (value) {

        return this.renderer.selectionEnd(value);
    };


    this.select = function () {

        return this.renderer.select();
    };


    //校验器
    flyingon.fragment('f-validate', this);


});



flyingon.Control.extend('TextBox', function (base) {
    


    this.__type = 'text';



    this.text = this.defineProperty('value', '', {

        set: this.__to_render
    });


    this.defineProperty('placehodler', '', {

        set: this.__to_render
    });



    this.__to_value = function (text) {

        return text;
    };



    flyingon.fragment('f-TextBox', this);
    


    this.__do_change = function (value) {

        var control = flyingon.findControl(this),
            value;

        try
        {
            control.rendered = false;
            
            value = control.__to_value(this.value);

            if (value !== control.value())
            {
                control.value(value);
                control.trigger('change', 'value', value);
            }

            this.value = control.text();
        }
        finally
        {
            control.rendered = true;
        }
    };



}).register();