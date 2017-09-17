flyingon.Control.extend('Label', function (base) {
   
    

    this.defaultWidth = 60;


    
    function define(self, name, defaultValue) {

        self.defineProperty(name, defaultValue, {
            
            set: function () {

                this.rendered && this.renderer.set(this, 'text');
            }
        });
    };


    //标签文本
    define(this, 'text', '');


    //文本是否html
    define(this, 'html', false);


    
    
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