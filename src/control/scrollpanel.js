flyingon.Panel.extend('ScrollPanel', function (base) {


    //预渲染
    //none: 不启用
    //x:    水平方向预渲染
    //y:    竖直方向预渲染
    //xy:   水平及竖直方向同时预渲染
    this.defineProperty('prerender', 'none');



    //可见区范围
    this.__visible_start = this.__visible_end = -1;

    //可见区是否有未渲染的子控件
    this.__visible_unmount = true;



    //计算可见控件集合
    this.__compute_visible = function () {

        var start = -1,
            end = -1,
            x = this.scrollLeft, 
            y = this.scrollTop,
            right = this.offsetWidth,
            bottom = this.offsetHeight,
            view = true,
            item,
            any;

        any = this.prerender();
        right += x + (any.indexOf('x') >= 0 ? right : 0);
        bottom += y + (any.indexOf('y') >= 0 ? bottom : 0);

        for (var i = 0, l = this.length; i < l; i++)
        {
            if ((item = this[i]) &&
                (item.__visible_area = (any = item.offsetLeft) < right && any + item.offsetWidth > x && 
                (any = item.offsetTop) < bottom && any + item.offsetHeight > y))
            {
                if (view && !item.view)
                {
                    view = false; //标记有未渲染的子控件
                }

                if (start < 0)
                {
                    start = i;
                }

                end = i;
            }
        }

        this.__visible_start = start;
        this.__visible_end = end;
        this.__visible_unmount = !view;
    };



    //处理滚动
    this.__do_scroll = function (x, y) {
    
        this.scrollLeft = x;
        this.scrollTop = y;
        
        this.__compute_visible();
        this.renderer.scroll(this, x, y);
    };



}).register();