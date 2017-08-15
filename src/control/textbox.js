flyingon.__extend_text = function () {



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



};



flyingon.Control.extend('TextBox', function (base) {
    


    this.defineProperty('value', '', {

        set: function (value) {

            this.hasRender && this.renderer.set(this, 'text');
        }
    });


    this.text = function () {

        return (this.__storage || this.__defaults).value;
    };


    flyingon.__extend_text.call(this);
    

    this['max-length'] = this.defineProperty('maxLength', 0);



}).register();