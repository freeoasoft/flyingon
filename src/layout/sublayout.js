//子布局
flyingon.Sublayout = flyingon.defineClass(flyingon.Control, function (base) {
       
    
        
    //子项占比
    this.defineProperty('scale', 0, {
     
        check: function (value) {

            return value > 0 ? value : 0;
        }
    });
    
    
    //布局
    this.defineProperty('layout', null, {
     
        set: function () {

            this.__layout = null;
        }
    });
    
    
    //指定默认大小
    this.defaultWidth = this.defaultHeight = 200;
    
        
    
    this.onmeasure = function (box, auto) {

        flyingon.arrange(this, this.__children, false, false, true);
        
        if (auto)
        {
            if (auto === 1)
            {
                box.offsetWidth = box.arrangeRight + box.border.width;
            }
            else
            {
                box.offsetHeight = box.arrangeBottom + box.border.height;
            }
        }
        else
        {
            return false;
        }
    };
    
        
    this.onlocate = function (box) {
        
        var items = this.__children,
            x = box.offsetLeft,
            y = box.offsetTop;
        
        //处理定位偏移
        if (items && (x || y))
        {
            for (var i = items.length - 1; i >= 0; i--)
            {
                if (box = items[i].boxModel)
                {
                    box.offsetLeft += x;
                    box.offsetTop += y;
                }
            }
        }
        
        return false;
    };


    this.controlAt = function (x, y) {

        var layout = this.__layout;
        return layout ? layout.controlAt(this.__children, x, y) : null;
    };
    
    
    //重载方法禁止绘制
    this.update = function () {};
    
    
});