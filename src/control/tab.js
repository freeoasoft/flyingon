flyingon.Panel.extend('TabPage', function (base) {



    this.defaultValue('layout', 'vertical-line');

    

    //自定义key
    this.defineProperty('key', '');



    //图标
    this.defineProperty('icon', '', {
    
        set: this.render
    });


    //页头文字
    this.defineProperty('text', '', {
    
        set: this.render
    });


    //自定义button列表
    this.defineProperty('buttons', '', {
    
        set: this.render
    });

    
    //是否可关闭
    this.defineProperty('closable', false, {
    
        set: this.render
    });



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

        set: function (name, value) {

            this.view && this.renderer.set(this, name, value);
        }
    });



    function render1(name, value) {

        this.__reset_header = true;
        this.__update_dirty || this.invalidate();
    };


    function render2(name, value) {

        this.__update_dirty || this.invalidate();
    };



    //页签方向
    //top       顶部页签
    //left      左侧页签
    //right     右侧页签
    //bottom    底部页签
    this.defineProperty('direction', 'top', {

        set: render1
    });


    //页头大小
    this.defineProperty('header', 30, {

        set: render1
    });


    //页头偏移
    this.defineProperty('offset', 2, {

        set: render1
    });


    //滚动按钮大小
    this.defineProperty('scroll', 16, {

        set: render1
    });



    //页签大小
    this.defineProperty('size', 60, {

        set: render2
    });


    //是否自动充满
    this.defineProperty('fill', false, {

        set: render2
    });


    //开始位置
    this.defineProperty('start', 0, {

        set: render2
    });


    //结束位置
    this.defineProperty('end', 0, {

        set: render2
    });


    //页签间距
    this.defineProperty('space', 2, {

        set: render2
    });



    //选中页索引
    this.defineProperty('selected', -1, { 

        set: function (name, value) {

            this.__selectedPage !== true && this.selectedPage(this[value], false);
        }
    });



    //获取或设置选中页面
    this.selectedPage = function (page, tag) {

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

                this.view && this.renderer.set(this, 'selected', page, 'tag', tag);

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
            this.trigger('tab-change', 'current', page, 'last', selected, 'tag', tag);
        }

        return this;
    };



    //扩展容器功能
    flyingon.fragment('f-container', this, base, flyingon.TabPage, true);


    var remove_items = this.__remove_items;


    this.__remove_items = function (index, items) {

        var selected = this.selected();

        remove_items.apply(this, arguments);

        this.selectedPage(this[selected] || this[--selected] || null, 'remove');
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