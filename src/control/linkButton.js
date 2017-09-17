flyingon.Control.extend('LinkButton', function (base) {
   


    var define = function (self, name, defaultValue) {

        return self.defineProperty(name, defaultValue, {

            set: function (value) {

                this.rendered && this.renderer.set(this, name, value);
            }
        });
    };

    
    //文本内容
    define(this, 'text', '');
    
    
    //文本内容是否html格式
    define(this, 'html', false);


    //链接地址
    define(this, 'href', '');
    

        
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