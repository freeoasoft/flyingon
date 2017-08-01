flyingon.__extend_text = function () {

    
    this.defaultHeight = 25;


};



flyingon.defineClass('TextBox', flyingon.Control, function (base) {
    


    this.defineProperty('value', '', {

        set: function (value) {

            this.hasRender && this.renderer.set(this, 'text');
        }
    });


    this.text = function () {

        return (this.__storage || this.__defaults).value;
    };


    flyingon.__extend_text.call(this);
    
    

}).register();