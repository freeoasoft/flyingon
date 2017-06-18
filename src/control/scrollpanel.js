flyingon.defineClass('ScrollPanel', flyingon.Panel, function (base) {


    //预渲染
    //none: 不启用
    //x:    水平方向预渲染
    //y:    竖直方向预渲染
    //xy:   水平及竖直方向同时预渲染
    this.defineProperty('prerender', 'xy');


    //计算可见控件集合
    this.__compute_visible = function () {

        var list = this.__visible_list,
            x = this.scrollLeft, 
            y = this.scrollTop,
            right = this.offsetWidth,
            bottom = this.offsetHeight,
            item = this.firstChild,
            view = true,
            any;

        any = this.prerender();
        right += x + (any.indexOf('x') >= 0 ? right : 0);
        bottom += y + (any.indexOf('y') >= 0 ? bottom : 0);

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
            if (item.__visible_area =
                (any = item.offsetLeft) < right && any + item.offsetWidth > x && 
                (any = item.offsetTop) < bottom && any + item.offsetHeight > y)
            {
                if (view && !item.view)
                {
                    view = false; //标记有未渲染的子控件
                }

                list.push(item);
            }

            item = item.nextSibling;
        }

        list.unmount = !view;

        return list;
    };



    //处理滚动
    this.__do_scroll = function (x, y) {
    
        this.__compute_visible(x, y);
        this.renderer.scroll(this, x, y);
    };
    
        

}).register('scrollpanel');