flyingon.Control.extend('Icon', function (base) {



    this.defaultWidth = 25;



    this.defineProperty('icon', '', {
            
        set: function (value) {

            this.rendered && this.renderer.set(this, 'icon', value);
        }
    });


    this.defineProperty('size', 16, {
        
        dataType: 'int',

        set: function (value) {

            this.rendered && this.renderer.set(this, 'size', value);
        }
    });



}).register();