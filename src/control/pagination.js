flyingon.HtmlElement.extend('Pagination', function (base) {


    var template = [
        { Class: 'span', className: 'f-page-button f-page-first' },
        { Class: 'span', className: 'f-page-button f-page-previous' },
        { Class: 'input', type: 'text', className: 'f-page-current' },
        { Class: 'span', text: '/' },
        { Class: 'span', className: 'f-page-pages' },
        { Class: 'span', className: 'f-page-button f-page-next' },
        { Class: 'span', className: 'f-page-button f-page-last' },
        { Class: 'span', className: 'f-page-sep' },
        { Class: 'span', className: 'f-page-button f-page-refresh' },
        { Class: 'span', className: 'f-page-sep' },
        { Class: 'ComboBox', className: 'f-page-records' }
    ];


    this.init = function () {

        this.push.apply(this, template);
    };



    this.defaultHeight = 30;

    this.defaultValue('border', 1);


    //每页显示记录数
    this.defineProperty('records', 20, { set: move });


    //总记录数
    this.defineProperty('total', 0, { set: move });



    function move() {

        var storage = this.__storage || this.__defaults;

        this.__pages = Math.ceil(storage.total / storage.records);
        this.moveTo(this.__index);
    };



    this.__index = this.__pages = 0;


    //获取当前页码
    this.current = function () {

        return this.__index;
    };


    //获取总的页数
    this.pages = function () {

        return this.__pages;
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

        this.moveTo(this.__pages - 1);
    };


    //移动到指定页
    this.moveTo = function (index) {

        if ((index |= 0) < 0)
        {
            index = 0;
        }
        else if (index >= this.__pages)
        {
            index = this.__pages - 1;
        }

        if (this.__index !== index)
        {
            this.trigger('change', 'index', this.__index = index);
        }
    };



}).register(); 