flyingon.Control.extend('Label', function (base) {
   
    

    this.defaultWidth = 60;


    
    //标签文本
    this.defineProperty('text', '', {
        
        set: this.__render_text
    });


    //文本是否html
    this.defineProperty('html', false, {
        
        set: this.__render_text
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