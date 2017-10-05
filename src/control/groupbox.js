flyingon.Panel.extend('GroupBox', function (base) {



    this.defaultValue('border', 1);



    //页头高度
    this.defineProperty('header', 25, {

        set: function (name, value) {
            
            this.view && this.renderer.set(this, name, value);
            this.__update_dirty || this.invalidate();
        }
    });


 
    //文字对齐
    this.defineProperty('align', 'left', {

        set: this.render   
    });


    //图标
    this.defineProperty('icon', '', {

        set: this.render   
    });


    //text
    this.defineProperty('text', '', {

        set: this.render   
    });


    //是否可收收拢
    //0: 不可折叠
    //1: 可折叠不显示折叠图标
    //2: 可折叠且显示折叠图标
    this.defineProperty('collapsable', 0, {

        set: this.render   
    });


    //是否折叠
    this.defineProperty('collapsed', false, {

        set: function (name, value) {

            this.view && this.renderer.set(this, name, value);

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