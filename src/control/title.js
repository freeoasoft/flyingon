flyingon.Control.extend('Title', function (base) {
   
    

    this.defaultWidth = 60;

    
    //标签文本
    this.defineProperty('text', '', {
            
        set: function () {

            this.rendered && this.renderer.set(this, 'text');
        }
    });


    //是否必填
    this.defineProperty('require', false);



}).register();