/**
 * @class flyingon.Panel
 * @extends flyingon.Control
 * @description 面板容器类
 */
flyingon.Control.extend('Panel', function (base) {



    
    //重写默认宽度
    this.defaultWidth = 300;
    
    //重写默认高度
    this.defaultHeight = 150;

        

    //排列区域
    this.arrangeLeft = this.arrangeTop = 
    this.arrangeRight = this.arrangeBottom = 
    this.arrangeWidth = this.arrangeHeight = 0;



    //重写默认为可放置移动或拖动对象
    this.defaultValue('droppable', true);



    //当前布局
    this.defineProperty('layout', null, {
     
        group: 'locate',
        query: true,

        set: function (value) {

            this.__layout = null;
            this.__arrent_dirty < 2 && this.__arrange_delay();
        }
    });


    //作为html布局时是否需要适应容器
    this.defineProperty('adaption', false);
    
    

    //扩展容器功能
    flyingon.fragment('f-container', this, true);



    //测量自动大小
    this.onmeasure = function (auto) {
        
        var tag = (this.offsetHeight << 16) + this.offsetWidth;

        if (this.__size_tag !== tag)
        {
            this.__size_tag = tag;
            this.__arrange_dirty = 2;
        }

        if (auto)
        {
            this.renderer.locate(this);
            this.__update_dirty = false;

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
    this.findAt = function (x, y) {
      
        if (this.length <= 0)
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

        return layout.controlAt(this, x, y);
    };    


 
    this.serialize = function (writer) {
        
        base.serialize.call(this, writer);
        
        if (this.length > 0)
        {
            writer.writeProperty('children', this, true);
        }
        
        return this;
    };
    

    this.dispose = function () {

        for (var i = this.length - 1; i >= 0; i--)
        {
            this[i].dispose(false);
        }

        base.dispose.apply(this, arguments);
        return this;
    };



}).register();