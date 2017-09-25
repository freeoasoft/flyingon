flyingon.Panel.extend('Pagination', function (base) {


    this.defaultHeight = 32;

    this.defaultValue('border', 1);

    this.defaultValue('padding', 4);

    this.defaultValue('layout', 'dock');


    var template = [
        { Class: 'ComboBox', className: 'f-page-records', tag: 'records', width: 60, popupWidth: 60, items: [10, 20, 30, 50, 100, 200, 500] },
        { Class: 'Label', className: 'f-page-sep', width: 1, margin: '2 4' },
        { Class: 'Icon', className: 'f-page-button', tag: 'first', icon: 'f-page-first' },
        { Class: 'Icon', className: 'f-page-button', tag: 'previous', icon: 'f-page-previous' },
        { Class: 'TextBox', className: 'f-page-current', tag: 'current', width: 40, value: 0, style: 'text-align:center' },
        { Class: 'Label', className: 'f-page-text', width: 10, text: '/' },
        { Class: 'Label', className: 'f-page-pages', tag: 'pages', width: 'auto', text: 0 },
        { Class: 'Icon', className: 'f-page-button', tag: 'next', icon: 'f-page-next' },
        { Class: 'Icon', className: 'f-page-button', tag: 'last', icon: 'f-page-last' },
        { Class: 'Label', className: 'f-page-sep', width: 1, margin: '2 4' },
        { Class: 'Icon', className: 'f-page-button', tag: 'refresh', icon: 'f-page-refresh' },
        { Class: 'Label', tag: 'total', dock: 'right' }
    ];


    this.init = function () {

        this.push.apply(this, template);

        this.on('click', click);
        this.on('change', change);
    };


    function click(e) {

        var any = e.target.tag();

        if (any && (any = this[any]) && typeof any === 'function')
        {
            any.call(this);
            e.stop();
        }
    };


    function change(e) {

        var control = e.target;

        switch (control.tag())
        {
            case 'records':
                this.records(control.value() | 0);
                e.stop();
                break;

            case 'current':
                this.moveTo(control.value() | 0);
                e.stop();
                break;
        }
    };


    //每页显示记录数
    this.defineProperty('records', 10, { set: move });


    //总记录数
    this.defineProperty('total', 0, { set: move });



    function move() {

        var storage = this.__storage || this.__defaults;

        this.__pages = Math.ceil(storage.total / storage.records);
        this.__arrange_delay(2);

        if (!this.moveTo(this.__index))
        {
            this.refresh();
            this.update();
        }
    };



    this.__index = 1;

    this.__pages = 0;


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

        this.moveTo(1);
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

        this.moveTo(this.__pages);
    };


    //刷新
    this.refresh = function () {

        this.trigger('refresh', 'index', this.__index);
    };


    //移动到指定页
    this.moveTo = function (index) {

        if ((index |= 0) < 1)
        {
            index = 1;
        }
        else if (index > this.__pages)
        {
            index = this.__pages;
        }

        if (this.__index !== index)
        {
            this.trigger('refresh', 'index', this.__index = index);
            this.update();

            return true;
        }
    };


    //同步至其它分页控件
    this.sync = function (pagination) {

        if (pagination && pagination !== this)
        {
            var storage = this.__storage,
                any;

            pagination.__index = this.__index;
            pagination.__pages = this.__pages;

            if (storage)
            {
                any = pagination.storage();
                any.total = storage.total;
                any.records = storage.records;
            }

            pagination.update();
        }
    };


    this.update = function () {

        var index = this.__index,
            pages = this.__pages;

        for (var i = this.length - 1; i >= 0; i--)
        {
            var item = this[i];

            switch (item.tag())
            {
                case 'records':
                    item.value(this.records());
                    break;

                case 'first':
                case 'previous':
                    item.disabled(index <= 1);
                    break;

                case 'current':
                    item.value(index);
                    break;

                case 'pages':
                    item.text(pages);
                    break;

                case 'next':
                case 'last':
                    item.disabled(index >= pages);
                    break;

                case 'total':
                    item.text(flyingon.i18ntext('page.total').replace('{0}', this.total()));
                    break;
            }
        }
    };



}).register(); 