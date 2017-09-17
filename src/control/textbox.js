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



});



flyingon.Control.extend('TextBox', function (base) {
    


    this.defineProperty('value', '', {

        set: function (value) {

            this.rendered && this.renderer.set(this, 'text', value);
        }
    });


    this.text = function () {

        return (this.__storage || this.__defaults).value;
    };


    flyingon.fragment('f-textbox', this);
    

    this['max-length'] = this.defineProperty('maxLength', 0);



}).register();