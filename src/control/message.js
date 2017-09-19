flyingon.Control.extend('Message', function (base) {
   
    

    this.defaultWidth = 60;

    
    //标签文本
    this.defineProperty('text', '', {
            
        set: function () {

            this.rendered && this.renderer.set(this, 'text');
        }
    });


    //文本是否html
    this.defineProperty('html', false, {
        
        set: function () {

            this.rendered && this.renderer.set(this, 'text');
        }
    });

    
    //是否必填
    this.defineProperty('require', false);



}).register();