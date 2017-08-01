flyingon.defineClass('HtmlText', flyingon.Control, function (base) {


        
    this.defineProperty('html', '', {
        
        set: function (value) {

            this.hasRender && this.renderer.set(this, 'html', value);
        }
    });
    

    
    //测量自动大小
    this.onmeasure = function (auto) {
        
        if (auto)
        {
            this.renderer.__measure_auto(this, auto);
        }
        else
        {
            return false;
        }
    };
    


}).register();