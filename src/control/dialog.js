flyingon.Panel.extend('Dialog', function (base) {



    //窗口栈
    var stack = [];



    //设置为顶级控件
    this.__top_control = true;


    //窗口是否已显示
    this.shown = false;


    this.defaultValue('border', 1);

    this.defaultValue('padding', 2);

    this.defaultValue('movable', true);



    //头部高度        
    this.defineProperty('header', 28, {

        set: function (value) {

            this.rendered && this.renderer.set(this, 'header', value);
            this.__update_dirty || this.invalidate();
        }
    });


    //窗口图标        
    this.defineProperty('icon', '', {

        set: function (value) {

            this.rendered && this.renderer.set(this, 'icon', value);
        }
    });


    //窗口标题
    this.defineProperty('text', '', {

        set: function (value) {

            this.rendered && this.renderer.set(this, 'text', value);
        }
    });


    //是否显示关闭按钮
    this.defineProperty('closable', true, {

        set: function (value) {

            this.rendered && this.renderer.set(this, 'closable', value);
        }
    });



    //测量自动大小
    this.onmeasure = function (auto) {
        
        if (auto)
        {
            base.onmeasure.call(this, auto);

            if (auto & 2)
            {
                this.offsetHeight += this.header();
            }
        }
        else
        {
            return false;
        }
    };


    this.arrangeArea = function () {

        var header = this.header();

        this.arrangeHeight -= header;
        this.arrangeBottom -= header;
    };



    this.show = function () {
        
        this.renderer.show(this);
        this.shown = true;

        this.active();

        return this;
    };


    this.showDialog = function () {
        
        this.renderer.show(this, true);
        this.shown = true;

        this.active();

        return this;
    };


    this.moveTo = function (x, y) {

        this.shown && this.renderer.moveTo(this, x, y);
    };


    this.center = function () {

        this.shown && this.renderer.center(this);
    };


    this.active = function () {

        var last = stack[stack.length - 1];

        if (last !== this)
        {
            var index = stack.indexOf(this);

            if (index >= 0)
            {
                stack.splice(index, 1);
            }

            stack.push(this);

            if (last)
            {
                last.renderer.active(last, false);
                last.trigger('deactivated');
            }

            this.renderer.active(this, true);
            this.trigger('activated');
        }
        else if (last)
        {
            this.renderer.active(this, true);
        }
    };


    this.activated = function () {

        return stack[stack.length - 1] === this;
    };

        
    this.close = function (closeType) {

        if (!closeType)
        {
            closeType = 'ok';
        }

        if (this.trigger('closing', 'closeType', closeType) !== false)
        {
            this.rendered && this.renderer.close(this);
            this.shown = false;

            stack.splice(stack.indexOf(this), 1);

            stack[0] && stack[stack.length - 1].active();

            this.trigger('closed', 'closeType', closeType);

            if (this.autoDispose)
            {
                this.dispose();
            }
        }

        return this;
    };



}).register();