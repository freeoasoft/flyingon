flyingon.defineClass('ScrollPanel', flyingon.Panel, function (base) {



    //计算可见控件集合
    this.__compute_visible = function (x, y) {

        var list = this.__visible_list,
            box = this.boxModel,
            right = x + this.offsetWidth,
            bottom = y + this.offsetHeight,
            item = this.firstChild,
            view,
            any;

        if (list)
        {
            list.length = 0;
        }
        else
        {
            list = this.__visible_list = [];
        }

        while (item)
        {
            if (item.__visible_area = (box = item.boxModel) &&
                (any = this.offsetLeft) < right && any + this.offsetWidth > x && 
                (any = this.offsetTop) < bottom && any + this.offsetHeight > y)
            {
                list.push(item);
            }

            item = item.nextSibling;
        }

        return list;
    };


    

    //处理滚动
    this.__do_scroll = function (x, y) {
    
        this.__compute_visible(x, y);
        this.renderer.scroll(this, x, y);
    };
    
        

}).alias('scrollpanel');