//集合功能扩展
flyingon.fragment('f-collection', function () {



    var array = Array.prototype;



    //子控件数量
    this.length = 0;



    //获取指定子控件的索引号
    this.indexOf = this.lastIndexOf = [].indexOf;



    //添加子控件
    this.push = function () {

        if (arguments.length > 0)
        {
            this.__check_items(this.length, arguments, 0);
            array.push.apply(this, arguments);
        }

        return this.length;
    };


    //弹出最后一个子控件
    this.pop = function () {
        
        var item = array.pop.call(this);

        if (item)
        {
            this.__remove_items(this.length - 1, [item]);
        }

        return item;
    };


    //在开始位置插入子控件
    this.unshift = function () {

        if (arguments.length > 0)
        {
            this.__check_items(0, arguments, 0);
            array.unshift.apply(this, arguments);
        }

        return this.length;
    };


    //弹出第一个子控件
    this.shift = function () {
        
        var item = array.shift.call(this);

        if (item)
        {
            this.__remove_items(0, [item]);
        }

        return item;
    };


    //插入及移除子控件
    this.splice = function (index, length) {

        if (arguments.length > 2)
        {
            var any = this.length;

            if ((index |= 0) < 0)
            {
                index += any;
            }

            if (index < 0)
            {
                index = 0;
            }
            else if (index > any)
            {
                index = any;
            }

            this.__check_items(index, arguments, 2);
        }

        var items = array.splice.apply(this, arguments);

        if (items.length > 0)
        {
            this.__remove_items(index, items);
        }

        return items;
    };

        

    //增加子项前检测处理
    this.__check_items = function (index, items, start) {
    };


    //移除子项处理
    this.__remove_items = function (index, items) {
    };


    
    //获取子控件集合
    this.children = function () {

        return array.slice.call(this, 0);
    };



});