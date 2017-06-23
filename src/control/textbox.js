flyingon.defineClass('TextBox', flyingon.Control, function (base) {
    


    this.defaultHeight = 25;
    
    

    this.defineProperty('value', '', {

        set: function (value) {

            this.view && this.renderer.set(this, 'text', value);
        }
    });


    this.defineProperty('format', '');


    this.defineProperty('text', '', {

        set: function (value) {

            this.view && this.renderer.set(this, 'text', value);
        }
    });
    
    

}).register('textbox');