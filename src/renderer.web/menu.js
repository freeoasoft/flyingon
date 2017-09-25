flyingon.renderer('Menu', function (base) {


    //弹出菜单堆栈
    var stack = [];

    //当前弹出层
    var current = null;

    //注册事件函数
    var on = flyingon.dom_on;

    

    //处理全局键盘事件,点击Esc则退出当前窗口
    on(document, 'keydown', function (e) {

        if (current && e.which === 27)
        {
            current.close();
        }
    });



    //打开弹出层
    //reference: 停靠参考物
    this.show = function (control, reference) {

        var view = document.createElement('div'),
            direction = control.direction(), 
            reverse = control.reverse(),
            any;

        view.className = 'f-Menu';
        view.style.width = (any = control.width()) > 0 ? any + 'px' : any;

        document.body.appendChild(view);

        any = flyingon.dom_align(
            control.view, 
            (reference.view || reference).getBoundingClientRect(), 
            direction, direction === 'top' || direction === 'bottom' ? 'center' : 'middle', 
            reverse);

        if ((any = current) && any !== control)
        {
            any.close();
        }

        current = control;
    };


    //关闭弹出层(弹出多级窗口时只有最后一个可以成功关闭)
    this.close = function (control) {

        var view = control.view,
            any;

        current = null;

        if (any = view && view.parentNode)
        {
            any.removeChild(view);
        }
    };


});