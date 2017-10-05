flyingon.Control.extend('LinkButton', function (base) {
   

    
    //文本内容
    this.defineProperty('text', '', {

        set: this.render   
    });
    
    
    //文本内容是否html格式
    this.defineProperty('html', false, {

        set: this.render   
    });


    //链接地址
    this.defineProperty('href', '', {

        set: this.render   
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