flyingon.MessageBox = flyingon.defineClass(flyingon.Control, function (base) {


    //设置为顶级控件
    this.__top_control = true;


    this.defaultValue('border', 1);

    this.defaultValue('padding', 2);

    this.defaultValue('minWidth', 100);

    this.defaultValue('movable', true);



    //是否显示头部
    this.defineProperty('header', true);


    //窗口标题
    this.defineProperty('title', '');


    //窗口图标        
    this.defineProperty('icon', '');


    //是否显示关闭按钮
    this.defineProperty('closable', true);


    //消息框类型
    this.defineProperty('type', '');


    //文本内容
    this.defineProperty('text', '');

    
    //显示按钮
    this.defineProperty('buttons', '');



    this.show = function () {
        
        this.renderer.show(this);
        return this;
    };


    this.close = function (button) {

        this.view && this.renderer.close(this);
        this.trigger('closed', 'button', button);
        this.dispose();
        
        return this;
    };


});



flyingon.showMessage = function (options) {

    var control = new flyingon.MessageBox(),
        fn;

    if (options)
    {
        if (typeof options === 'string')
        {
            control.text(options);
        }
        else
        {
            for (var name in options)
            {
                if (name === 'closed')
                {
                    control.on('closed', options[name]);
                }
                else if (typeof (fn = control[name]) === 'function')
                {
                    fn.call(control, options[name]);
                }
            }
        }
    }

    control.show();

    return control;
};