/**
 * 校验结果显示
 */
flyingon.Control.extend('Error', function (base) {
   


    var all = flyingon.validator.errors = flyingon.create(null);



    this.defaultValue('visible', this.__visible = false);


    //校验目标控件id
    this.defineProperty('target', '', {

        set: function (value, oldValue) {

            if (oldValue)
            {
                delete all[oldValue];
            }

            if (value)
            {
                (all[value] || (all[value] = [])).push(this);
            }
        }
    });


    //指定校验器名称
    this.defineProperty('validator', '');


    //显示方式
    //!
    //?
    //text
    this.defineProperty('type', 'text');

    
    //标签文本, 支持变量
    //{{0}}     name
    //{{1}}     第一个参数
    //{{2}}     第二个参数
    this.defineProperty('text', '');


    //文本是否html
    this.defineProperty('html', false);



    this.show = function (error) {

        var control = error.control;

        (control.__errors || (control.__errors = [])).push(this);

        this.visible(true);
        this.renderer.set(this, 'text', this.showText(error));
    };


    this.showText = function (error) {

        var storage = this.__storage || this.__defaults,
            text;

        if (text = storage.text)
        {
            text = text.replace(/\{\{([^{}]*)\}\}/g, function (text, key) {

                return error[key];
            });
        }

        return text || '';
    };


    this.despose = function () {

        var id = this.__target;

        base.dispose.call(this);

        if (id)
        {
            delete all[id];
        }
    };
    


}).register();