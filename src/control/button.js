flyingon.Control.extend('Button', function (base) {
   
    

    this.defaultWidth = 80;



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


    //是否显示下拉箭头
    define(this, 'dropdown', false);


    //下拉菜单
    this.defineProperty('menu', null, {

        set: function (value, oldValue) {

            if (this.__menu = value)
            {
                if (!oldValue)
                {
                    this.on('click', show_menu);
                }
            }
            else if (oldValue)
            {
                this.off('click', show_menu);
            }
        }
    });


    function show_menu(e) {

        var Class = flyingon.Menu,
            menu = this.__menu;

        if (typeof menu === 'string')
        {
            menu = Class.all[menu];
        }

        if (menu instanceof Class)
        {
            menu.show(this);
        }
    };


    //显示下拉菜单
    this.showMenu = show_menu;

        
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