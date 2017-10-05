flyingon.Control.extend('Image', function (base) {



    this.defaultWidth = 400;

    this.defaultHeight = 300;



    this.defineProperty('src', '', {
            
        set: this.render
    });


    this.defineProperty('alt', '', {
            
        set: this.render
    });



}).register();