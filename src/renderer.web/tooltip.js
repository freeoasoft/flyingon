flyingon.renderer('ToolTip', function (base) {


    //当前弹出层
    var current = null;

    //注册事件函数
    var on = flyingon.dom_on;

    //注销事件函数
    var off = flyingon.dom_off;

    

    //处理全局点击事件,点击当前弹出层以外的区域则关闭当前弹出层
    on(document, 'mousedown', function (e) { 

        if (current) 
        {
            var view = current.view,
                any = e.target;

            while (any)
            {
                if (any === view)
                {
                    return;
                }

                any = any.parentNode;
            }

            current.close();
        }
    });
    

    //处理全局键盘事件,点击Esc则退出当前窗口
    on(document, 'keydown', function (e) {

        if (current && e.which === 27)
        {
            current.close();
        }
    });



    this.render = function (writer, control, render) {

        writer.push('<div');

        render.call(this, writer, control);
        
        writer.push('><div class="f-tooltip-body"></div><div class="f-tooltip-arrow1"></div><div class="f-tooltip-arrow2"></div></div>');
    };



    //打开弹出层
    //reference: 停靠参考物
    this.show = function (control, reference, direction, reverse) {

        var view = control.view || this.createView(control, false),
            any;

        if (control.html())
        {
            view.firstChild.innerHTML = control.text();
        }
        else
        {
            view.firstChild[this.__text_name] = control.text();
        }

        document.body.appendChild(view);

        control.measure(0, 0);
        control.locate(0, 0);

        flyingon.__update_patch();
        
        this.update(control);

        any = flyingon.dom_align(
            control.view, 
            (reference.view || reference).getBoundingClientRect(), 
            direction, direction === 'top' || direction === 'bottom' ? 'center' : 'middle', 
            reverse);

        control.offsetLeft = any.left;
        control.offsetTop = any.top;
        
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