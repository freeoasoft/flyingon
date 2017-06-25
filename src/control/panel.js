flyingon.defineClass('Panel', flyingon.Control, function (base) {



    
    //重写默认宽度
    this.defaultWidth = 400;
    
    //重写默认高度
    this.defaultHeight = 300;

        

    //排列区域
    this.arrangeLeft = this.arrangeTop = this.arrangeRight = this.arrangeBottom = this.arrangeWidth = this.arrangeHeight = 0;



    //重写默认为可放置移动或拖动对象
    this.defaultValue('droppable', true);



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
            this.renderer.update(this);

            if (auto & 1)
            {
                this.offsetWidth = this.arrangeRight + this.borderLeft + this.borderRight;
            }
            
            if (auto & 2)
            {
                this.offsetHeight = this.arrangeBottom + this.borderTop + this.borderBottom;
            }
        }
        else
        {
            return false;
        }
    };
    
        
    
    //查找指定坐标的子控件
    this.controlAt = function (x, y) {
      
        if (!this.firstChild)
        {
            return this;
        }

        var layout = flyingon.getLayout(this),
            any;
    
        x += this.scrollLeft - this.borderLeft;
        y += this.scrollTop - this.borderTop;

        if (any = layout.__sublayouts)
        {
            return (any = layout.controlAt(any, x, y)) ? any.controlAt(x, y) : null;
        }

        return layout.controlAt(this.__children || this.__init_children(), x, y);
    };    


 
    this.serialize = function (writer) {
        
        base.serialize.call(this, writer);
        
        if (this.firstChild)
        {
            writer.writeProperty('children', this.children());
        }
        
        return this;
    };
    

    this.dispose = function (recursion) {

        var item = this.firstChild;
        
        if (item)
        {
            do
            {
                item.dispose(true);
            }
            while (item = item.nextSibling);

            this.firstChild = this.lastChild = this.__children = null;
        }

        return base.dispose.call(this) || this;
    };



}).register('panel');