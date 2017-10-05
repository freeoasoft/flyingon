flyingon.Control.extend('Icon', function (base) {



    this.defaultWidth = 25;



    this.defineProperty('icon', '', {
            
        set: this.render
    });


    this.defineProperty('size', 16, {
        
        dataType: 'int',
        set: this.render
    });



}).register();