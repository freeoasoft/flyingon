flyingon.Panel.extend('TabPage', function (base) {



    this.defaultValue('layout', 'vertical-line');

    

    //自定义key
    this.defineProperty('key', '');


    
    function define(self, name, defaultValue) {

        return self[name] = self.defineProperty(name, defaultValue, {

            set: function (value) {
            
                this.rendered && this.renderer[name](this, value);
            }
        });
    };
    

    //图标
    define(this, 'icon', '');


    //页头文字
    define(this, 'text', '');


    //自定义button列表
    define(this, 'buttons', '');

    
    //是否可关闭
    define(this, 'closable', false);



    this.selected = function () {

        var parent = this.parent,
            storage;

        return parent && (storage = parent.__storage) && parent[storage.selected] === this || false;
    };
    


}).register();




flyingon.Control.extend('Tab', function (base) {



    this.defineWidth = this.defaultHeight = 300;

    this.defaultValue('border', 1);
    

    //页头偏移距离
    this.__scroll_header = 0;


    //是否需要重算页头
    this.__reset_header = true;



    //页头样式
    //default   默认样式
    //dot       圆点样式
    this.defineProperty('theme', 'default', {

        set: function (value) {

            this.rendered && this.renderer.set(this, 'theme', value);
        }
    });



    //定义页面签属性
    var define = function (self, name, defaultValue, view) {

        self.defineProperty(name, defaultValue, {

            set: function (value) {

                this.__reset_header = true;
                this.__update_dirty || this.invalidate();
            }
        });
    };


    //页签方向
    //top       顶部页签
    //left      左侧页签
    //right     右侧页签
    //bottom    底部页签
    define(this, 'direction', 'top');


    //页头大小
    define(this, 'header', 30);


    //页头偏移
    define(this, 'offset', 2);


    //滚动按钮大小
    define(this, 'scroll', 16);



    define = function (self, name, defaultValue) {

        self.defineProperty(name, defaultValue, {

            set: function () {

                this.__update_dirty || this.invalidate();
            }
        });
    };



    //页签大小
    define(this, 'size', 60);


    //是否自动充满
    define(this, 'fill', false);


    //开始位置
    define(this, 'start', 0);


    //结束位置
    define(this, 'end', 0);


    //页签间距
    define(this, 'space', 2);



    //选中页索引
    this.defineProperty('selected', -1, { 

        set: function (value) {

            this.__selectedPage !== true && this.selectedPage(this[value], false);
        }
    });



    //获取或设置选中页面
    this.selectedPage = function (page) {

        var selected = this.__selectedPage,
            any;

        if (page === void 0)
        {
            return selected !== void 0 ? selected : (this.__selectedPage = this[this.selected()]);
        }

        if (selected !== page && (!page || page.parent === this))
        {
            if (selected && selected.view_head)
            {
                 selected.renderer.selected(selected, false);
            }

            if (page)
            {
                if (page && page.view_head)
                {
                    page.renderer.selected(page, true);
                }

                this.rendered && this.renderer.set(this, 'selected', page);

                any = this.indexOf(page);
            }
            else
            {
                page = null;
                any = -1;
            }

            if (arguments[1] !== false)
            {
                this.__selectedPage = true;
                this.selected(any);
            }

            this.__selectedPage = page;
            this.trigger('tab-change', 'newValue', page, 'oldValue', selected);
        }

        return this;
    };



    //扩展容器功能
    flyingon.fragment('f-container', this, flyingon.TabPage, true);


    var remove_items = this.__remove_items;


    this.__remove_items = function (index, items) {

        var selected = this.selected();

        remove_items.apply(this, arguments);

        this.selectedPage(this[selected] || this[--selected] || null);
    };


    this.findByKey = function (key, selected) {

        for (var i = this.length - 1; i >= 0; i--)
        {
            if (this[i].key() === key)
            {
                selected && this.selected(i);
                return this[i];
            }
        }
    };


    this.findByText = function (text, selected) {

        for (var i = this.length - 1; i >= 0; i--)
        {
            if (this[i].text() === text)
            {
                selected && this.selected(i);
                return this[i];
            }
        }
    };



}).register();