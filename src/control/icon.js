flyingon.Control.extend('Icon', function (base) {



    this.defaultWidth = 25;



    this.defineProperty('icon', '', {
            
        set: this.__to_render
    });


    this.defineProperty('size', 16, {
        
        dataType: 'int',
        set: this.__to_render
    });



}).register();