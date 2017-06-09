flyingon.defineClass('Dialog', flyingon.Panel, function (base) {



    //设置为顶级控件
    this.__top_control = true;


    //窗口是否已显示
    this.shown = false;


    this.defaultValue('border', 1);

    this.defaultValue('padding', 2);

    this.defaultValue('movable', true);


    //头部高度        
    this.defineProperty('headerHeight', 0, {

        set: function (value) {

            this.renderer.set(this, 'headerHeight', value);
        }
    });


    //窗口图标        
    this.defineProperty('icon', '', {

        set: function (value) {

            this.renderer.set(this, 'icon', value);
        }
    });


    //窗口标题
    this.defineProperty('title', '', {

        set: function (value) {

            this.renderer.set(this, 'title', value);
        }
    });


    //是否显示关闭按钮
    this.defineProperty('closable', true, {

        set: function (value) {

            this.renderer.set(this, 'closable', value);
        }
    });


    //关闭时是否自动销毁
    this.defineProperty('autoDispose', true);



    //测量自动大小
    this.onmeasure = function (auto) {
        
        if (auto)
        {
            this.arrange();

            if (auto & 1)
            {
                this.offsetWidth = this.arrangeRight + this.borderLeft + this.borderRight;
            }
            
            if (auto & 2)
            {
                this.offsetHeight = this.headerHeight() + this.arrangeBottom + this.borderTop + this.borderBottom;
            }
        }
        else
        {
            return false;
        }
    };



    this.show = function (left, top) {
        
        this.renderer.show(this, left, top);
        return this;
    };


    this.showDialog = function (left, top) {
        
        this.renderer.show(this, left, top, true);
        return this;
    };

        
    this.close = function (closeType) {

        if (!closeType)
        {
            closeType = 'ok';
        }

        if (this.trigger('closing', 'closeType', closeType) !== false)
        {
            this.view && this.renderer.close(this);

            this.trigger('closed', 'closeType', closeType);
            this.shown = false;

            if (this.autoDispose())
            {
                this.dispose();
            }
        }

        return this;
    };



}).alias('dialog');