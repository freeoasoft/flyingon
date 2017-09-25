Object.extend('ToolTip', function () {



    //显示内容
    this.defineProperty('text', '');


    //文本是否html
    this.defineProperty('html', false);


    //停靠方向 bottom:下面 top:上面 right:右边 left:左边
    this.defineProperty('direction', 'right');
    
    
    //空间不足时是否反转方向
    this.defineProperty('reverse', true);


    //宽度
    this.defineProperty('width', 'auto');



    //显示
    this.show = function (reference) {

        this.renderer.show(this, reference);
        return this;
    };


    //关闭
    this.close = function () {

        this.renderer.close(this);
        return this;
    };
    


    flyingon.renderer.bind(this, 'ToolTip');



}).register();