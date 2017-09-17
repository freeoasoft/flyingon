flyingon.Control.extend('Pagination', function (base) {



    //分页类型
    //common        普通类型
    //number        数字
    //custom        自定义布局
    this.defineProperty('type', 'common');


    //自定义布局
    this.defineProperty('layout', '');


    //每页显示记录数
    this.defineProperty('records', 20, { set: move });


    //总记录数
    this.defineProperty('total', 0, { set: move });



    function move() {

        var storage = this.__storage || this.__defaults;

        this.__count = Math.ceil(storage.total / storage.records);
        this.moveTo(this.__index);
    };



    this.__index = this.__count = 0;


    //获取当前页码
    this.current = function () {

        return this.__index;
    };


    //获取总的页数
    this.count = function () {

        return this.__count;
    };


    //移动到第一页
    this.first = function () {

        this.moveTo(0);
    };


    //移动到上一页
    this.previous = function () {

        this.moveTo(this.__index - 1);
    };


    //移动到下一页
    this.next = function () {

        this.moveTo(this.__index + 1);
    };


    //移动到最后一页
    this.last = function () {

        this.moveTo(this.__count - 1);
    };


    //移动到指定页
    this.moveTo = function (index) {

        if ((index |= 0) < 0)
        {
            index = 0;
        }
        else if (index >= this.__count)
        {
            index = this.__count - 1;
        }

        if (this.__index !== index)
        {
            this.trigger('change', 'index', this.__index = index);
        }
    };



}).register(); 