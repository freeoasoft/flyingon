flyingon.Control.extend('Image', function (base) {



    this.defaultWidth = 400;

    this.defaultHeight = 300;



    this.defineProperty('src', '', {
            
        set: this.__to_render
    });


    this.defineProperty('alt', '', {
            
        set: this.__to_render
    });



}).register();