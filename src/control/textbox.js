flyingon.fragment('f-textbox', function () {



    this.defineProperty('placehodler', '');



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
    


    this.text = this.defineProperty('value', '', {

        set: function (value) {

            this.rendered && this.renderer.set(this, 'text', value);
        }
    });



    flyingon.fragment('f-textbox', this);



    this.__to_value = function (text) {

        return text;
    };
    


}).register();