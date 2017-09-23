flyingon.Control.extend('ToolTip', function () {



    this.init = function () {

        this.addClass('f-tooltip-right');
    };



    this.defaultValue('border', 1);

    this.defaultValue('width', 'auto');

    this.defaultValue('height', 'auto');



    //显示内容
    this.defineProperty('text', '');


    //文本是否html
    this.defineProperty('html', false);


    //停靠方向 bottom:下面 top:上面 right:右边 left:左边
    this.defineProperty('direction', 'right', {

        set: function (value, oldValue) {

            oldValue && this.removeClass('f-tooltip-' + oldValue);
            value && this.addClass('f-tooltip-' + value);
        }
    });
    
    
    //空间不足时是否反转方向
    this.defineProperty('reverse', true);



    //显示
    this.show = function (reference) {

        this.renderer.show(this, reference, this.direction(), this.reverse());
        return this;
    };


    //关闭
    this.close = function () {

        this.rendered && this.renderer.close(this);

        if (this.autoDispose)
        {
            this.dispose();
        }

        return this;
    };
    


}).register();