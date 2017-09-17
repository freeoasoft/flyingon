flyingon.Control.extend('Image', function (base) {



    this.defaultWidth = 400;

    this.defaultHeight = 300;



    this.defineProperty('src', '', {
            
        set: function (value) {

            this.rendered && this.renderer.set(this, 'src', value);
        }
    });


    this.defineProperty('alt', '', {
            
        set: function (value) {

            this.rendered && this.renderer.set(this, 'alt', value);
        }
    });



}).register();