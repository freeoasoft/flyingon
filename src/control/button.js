flyingon.defineClass('Button', flyingon.Control, function (base) {
   
            

    //文本内容
    this.defineProperty('text', '', {
        
        set: function (value) {

            this.hasRender && this.renderer.set(this, 'text', value);
        }
    });
    
    
    //文本内容是否html格式
    this.defineProperty('html', false);
    


}).register();