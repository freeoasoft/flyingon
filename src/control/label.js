flyingon.defineClass('Label', flyingon.Control, function (base) {
   
        
        
    this.defineProperty('text', '', {
        
        set: function (value) {

            this.view && this.renderer.set(this, 'text', value);
        }
    });
    
    
    //测量自动大小
    this.onmeasure = function (auto, border) {
        
        if (auto)
        {
            this.renderer.measure_auto(this, auto, border);
        }
        else
        {
            return false;
        }
    };
    


}).register('label');