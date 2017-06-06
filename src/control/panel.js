flyingon.defineClass('Panel', flyingon.Control, function (base) {



    //排列区域
    this.arrangeLeft = this.arrangeTop = this.arrangeRight = this.arrangeBottom = this.arrangeWidth = this.arrangeHeight = 0;



    //重写默认为可放置移动或拖动对象
    this.defaultValue('droppable', true);


    this.defaultValue('overflowX', 'auto');


    this.defaultValue('overflowY', 'auto');



    //当前布局
    this.defineProperty('layout', null, {
     
        group: 'locate',
        query: true,
        set: function (value) {

            this.__layout = null;

            if (this.scrollLeft || this.scrollTop)
            {
                this.renderer.__reset_scroll(this);
            }
            
            this.invalidate();
        }
    });
    


    //引入容器功能片段    
    flyingon.__container_fragment(this);

 
               

    //测量自动大小
    this.onmeasure = function (auto) {
        
        if (auto)
        {
            this.arrange();

            if (auto & 1)
            {
                this.offsetWidth = this.arrangeRight + this.layout_border.width;
            }
            
            if (auto & 2)
            {
                this.offsetHeight = this.arrangeBottom + this.layout_border.height;
            }
        }
        else
        {
            return false;
        }
    };
    
        
    
    //排列子控件
    this.arrange = function () {

        var auto = this.layout_auto,
            list, 
            item, 
            hscroll, 
            vscroll;
        
        if (auto & 1)
        {
            this.layout_hscroll = false;
        }
        else
        {
            //处理自动滚动
            switch (this.overflowX())
            {
                case 'scroll':
                    this.layout_hscroll = true;
                    break;

                case 'auto':
                    hscroll = true;
                    break;
                    
                default:
                    this.layout_hscroll = false;
                    break;
            }
        }

        if (auto & 2)
        {
            this.layout_vscroll = false;
        }
        else
        {
            switch (this.overflowY())
            {
                case 'scroll':
                    this.layout_vscroll = true;
                    break;

                case 'auto':
                    vscroll = true;
                    break;
                    
                default:
                    this.layout_vscroll = false;
                    break;
            }
        }

        list = [];            

        //筛选出非隐藏控件
        if (item = this.firstChild)
        {
            do
            {
                if (item.__visible = item.visible())
                {
                    list.push(item);
                }
            }
            while (item = item.nextSibling);
        }

        //排列
        flyingon.arrange(this, list, hscroll, vscroll);

        this.__arrange_dirty = false;
        return this;
    };
    

    //计算排列区域
    this.arrangeArea = function (border, padding) {

        var any;

        //计算排列区域
        this.arrangeLeft = padding.left;
        this.arrangeTop = padding.top;

        this.arrangeWidth = (any = this.offsetWidth - border.width - padding.width) > 0 ? any : 0;
        this.arrangeHeight = (any = this.offsetHeight - border.height - padding.height) > 0 ? any : 0;
    };

    
    //查找指定坐标的子控件
    this.controlAt = function (x, y) {
      
        if (!this.firstChild)
        {
            return this;
        }

        var layout = flyingon.getLayout(this),
            any;
        
        if (any = this.layout_border)
        {
            x += this.scrollLeft - any.left;
            y += this.scrollTop - any.top;
        }
        
        if (any = layout.__sublayouts)
        {
            return (any = layout.controlAt(any, x, y)) ? any.controlAt(x, y) : null;
        }

        return layout.controlAt(this.__children || this.__init_children(), x, y);
    };
    
    

}).alias('panel');