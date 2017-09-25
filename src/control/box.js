flyingon.Control.extend('Box', function (base) {



    this.defaultWidth = 300;


    this.defaultHeight = 33;


    this.defaultValue('padding', 4);


    this.defaultValue('height', 'auto');



    //标记是否检验容器
    this.__validate_box = true;



    //是否竖直排列
    this.defineProperty('vertical', false);


    //作为html布局时是否需要适应容器
    this.defineProperty('adaption', false);

    

    //扩展容器功能
    flyingon.fragment('f-container', this, base, true);



    //设置或清除检验信息
    this.__set_validate = function (error, control) {

        var target = this.__find_error();

        if (target)
        {
            target.__validate_text = error ? error.text : '';
            target.visible(!!error);

            if (error && !target.__no_text)
            {
                target.renderer.set(target, 'text', error.text);
            }
        }
        else if (control)
        {
            control.__set_validate(error);
        }
    };



    //获取错误提醒控件
    this.__find_error = function () {

        for (var i = this.length - 1; i >= 0; i--)
        {
            if (this[i].__box_error)
            {
                return this[i];
            }
        }
    };



    //获取标题控件
    this.__find_title = function () {

        for (var i = 0, l = this.length; i < l; i++)
        {
            if (this[i].__box_title)
            {
                return this[i];
            }
        }
    };


    //获取错误标题信息
    this.__error_title = function (control) {

        var any;

        control = this.__find_title();

        return control && (any = control.__storage) ? any.text : '';
    };



    //测量自动大小
    this.onmeasure = function (auto) {
        
        var tag = (this.offsetHeight << 16) + this.offsetWidth;

        if (this.__size_tag !== tag)
        {
            this.__size_tag = tag;
            tag = true;
        }
        else
        {
            tag = this.__arrange_dirty > 1;
        }

        if (tag)
        {
            this.__arrange_dirty = 0;
            arrange(this);
        }

        if (auto)
        {
            if (auto & 1)
            {
                this.offsetWidth = this.arrangeRight + this.borderLeft + this.borderRight + this.paddingRight;
            }
            
            if (auto & 2)
            {
                this.offsetHeight = this.arrangeBottom + this.borderTop + this.borderBottom + this.paddingBottom;
            }
        }
        else
        {
            return false;
        }
    };


    function arrange(control) {

        var x = control.paddingLeft,
            y = control.paddingTop,
            width = control.offsetWidth - x - control.borderLeft - control.borderRight - control.paddingRight,
            height = control.offsetHeight - y - control.borderTop - control.borderBottom - control.paddingBottom;

        control.arrangeRight = control.arrangeBottom = 0;

        if (control.vertical())
        {
            control.__arrange_vertical(x, y, width, height);
        }
        else
        {
            control.__arrange(x, y, width, height);
        }
    };


    this.__arrange = function (x, y, width, height) {

        var left = x,
            right = x + width,
            control;
        
        //先按无滚动条的方式排列
        for (var i = 0, l = this.length; i < l; i++)
        {
            control = this[i];

            if (control.__visible)
            {
                if (control.__new_line)
                {
                    x = left;
                    y = this.arrangeBottom;

                    control.measure(width, height, width, height, 1);
                    right = x + width;
                }
                else
                {
                    control.measure(width, height, right - x || -1, height);
                }

                control.locate(x, y, 0, height, this);

                x = this.arrangeX;
            }
        }
    };


    this.__arrange_vertical = function () {

        var bottom = y + height,
            control;
        
        //先按无滚动条的方式排列
        for (var i = 0, l = this.length; i < l; i++)
        {
            control = this[i];

            if (control.__visible)
            {
                control.measure(width, height, width, bottom - height || -1, 1);
                control.locate(x, y, width, 0, this);

                y = this.arrangeY;
            }
        }
    };



}).register();