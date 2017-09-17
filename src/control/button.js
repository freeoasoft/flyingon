flyingon.Control.extend('Button', function (base) {
   
    

    var define = function (self, name, defaultValue) {

        return self.defineProperty(name, defaultValue, {

            set: function (value) {

                this.rendered && this.renderer.set(this, name, value);
            }
        });
    };

    
    //图标
    define(this, 'icon', '');


    //图标大小
    this['icon-size'] = define(this, 'iconSize', 16);


    //图标和文字是否竖排
    define(this, 'vertical', false);


    //文本内容
    define(this, 'text', '');
    
    
    //文本内容是否html格式
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