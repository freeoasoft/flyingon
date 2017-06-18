flyingon.defineClass('TextBox', flyingon.Control, function (base) {
    


    this.defaultValue('border', 1);

    this.defaultValue('padding', '0 2');
    
    this.defaultValue('borderStyle', 'solid');
    
    

    this.defineProperty('text', '', {

        set: function (value) {

            this.view && this.renderer.set(this, 'text', value);
        }
    });
    
    

}).register('textbox');