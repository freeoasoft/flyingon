flyingon.defineClass('LinkButton', flyingon.Control, function (base) {
   
        
        
    this.defineProperty('text', '', {
        
        set: function (value) {

            this.hasRender && this.renderer.set(this, 'text', value);
        }
    });
    
    

    this.defineProperty('href', 'javascript:void 0', {

        set: function (value) {

            this.hasRender && this.renderer.set(this, 'href', value);
        }
    });
    


}).register();