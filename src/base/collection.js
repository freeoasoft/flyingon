/**
 * @class f-collection
 * @extension
 * @description 集合功能片段
 */
flyingon.fragment('f-collection', function () {



    var array = Array.prototype;



    /**
     * @property length
     * @type {int}
     * @description 子项总数量
     */
    this.length = 0;


    /**
     * @method indexOf
     * @description 获取指定子项的索引号(与数组同名方法相同)
     * @param {any} item 子项
     * @return {int} 索引号, -1表示不存在
     */

    /**
     * @method lastIndexOf
     * @description 从后向前获取指定子项的索引号(与数组同名方法相同)
     * @param {any} item 子项
     * @return {int} 索引号, -1表示不存在
     */
    this.indexOf = this.lastIndexOf = [].indexOf;



    /**
     * @method push
     * @description 在集合的末尾添加一个或多个子项(与数组同名方法相同)
     * @param {...*} item 子项
     * @return {int} 子项总数量
     */
    this.push = function () {

        if (arguments.length > 0)
        {
            this.__check_items(this.length, arguments, 0);
            array.push.apply(this, arguments);
        }

        return this.length;
    };


    /**
     * @method pop
     * @description 弹出最后一个子项(与数组同名方法相同)
     * @return {any} 弹出的子项
     */
    this.pop = function () {
        
        var item = array.pop.call(this);

        if (item)
        {
            this.__remove_items(this.length - 1, [item]);
        }

        return item;
    };


    /**
     * @method unshift
     * @description 在集合的开始位置插入一个或多个子项(与数组同名方法相同)
     * @param {...any} item 子项
     * @return {int} 子项总数量
     */
    this.unshift = function () {

        if (arguments.length > 0)
        {
            this.__check_items(0, arguments, 0);
            array.unshift.apply(this, arguments);
        }

        return this.length;
    };


    /**
     * @method shift
     * @description 弹出第一个子项(与数组同名方法相同)
     * @return {any} 弹出的子项
     */
    this.shift = function () {
        
        var item = array.shift.call(this);

        if (item)
        {
            this.__remove_items(0, [item]);
        }

        return item;
    };


    /**
     * @method splice
     * @description 在集合的指定位置移除或插入一个或多个子项(与数组同名方法相同)
     * @param {int} index 索引号
     * @param {int=} length 要移除的子项数量 
     * @param {...*=} item 要插入的子项
     * @return {object[]} 移除的子项集合
     */
    this.splice = function (index, length) {
            
        var any = this.length;

        if (arguments.length > 2)
        {
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
            
            any = array.splice.apply(this, arguments);
        }
        else //注:IE8不支持 array.splice(0)清空所有项,必须指明长度
        {
            any = array.splice.call(this, index, length === void 0 ? any : length);
        }

        if (any.length > 0)
        {
            this.__remove_items(index, any);
        }

        return any;
    };

        

    //增加子项前检测处理
    this.__check_items = function (index, items, start) {
    };


    //移除子项处理
    this.__remove_items = function (index, items) {
    };


    
    /**
     * @method children
     * @description 获取子项集合
     * @return {object[]} 子项集合
     */
    this.children = function () {

        return array.slice.call(this, 0);
    };



});