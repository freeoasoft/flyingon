flyingon.Panel.extend('GroupBox', function (base) {



    this.defaultValue('border', 1);



    //页头高度
    this.defineProperty('header', 25, {

        set: function (value) {
            
            this.rendered && this.renderer.set(this, 'header', value);
            this.__update_dirty || this.invalidate();
        }
    });



    function define(self, name, defaultValue) {

        self.defineProperty(name, defaultValue, {

            set: function (value) {
                
                this.rendered && this.renderer.set(this, name, value);
            }
        });
    };

 
    //文字对齐
    define(this, 'align', 'left');


    //图标
    define(this, 'icon', '');


    //text
    define(this, 'text', '');


    //是否可收收拢
    //0: 不可折叠
    //1: 可折叠不显示折叠图标
    //2: 可折叠且显示折叠图标
    define(this, 'collapsable', 0);


    //是否折叠
    this.defineProperty('collapsed', false, {

        set: function (value) {

            this.rendered && this.renderer.set(this, 'collapsed', value);

            if (!value && (value = this.mutex()))
            {
                this.__do_mutex(value);
            }

            this.__update_dirty || this.invalidate();
        }
    });


    //折叠互斥组(同一时刻只有一个分组框可以打开)
    this.defineProperty('mutex', '');


    this.__do_mutex = function (value) {

        var parent = this.parent,
            item;

        if (parent)
        {
            for (var i = 0, l = parent.length; i < l; i++)
            {
                if ((item = parent[i]) && item !== this && item.__do_mutex && item.mutex() === value)
                {
                    item.collapsed(true);
                }
            }
        }
    };


    //测量自动大小
    this.onmeasure = function (auto) {
        
        if (this.collapsed())
        {
            this.offsetHeight = this.header();
            return false;
        }
        
        if (auto)
        {
            base.onmeasure.call(this, auto);
            this.offsetHeight += this.header();
        }
        else
        {
            return false;
        }
    };

    
    this.arrangeArea = function () {

        var header = this.header();

        this.arrangeHeight -= header;
        this.arrangeBottom -= header;
    };



}).register();