flyingon.defineClass('TextButton', flyingon.Control, function (base) {



    //弹出层控件
    var popup_cache;


    //值
    this.defineProperty('value', null);


    //格式化
    this.defineProperty('format', '', {
        
        set: function (value) {

            this.hasRender && this.renderer.set(this, 'text');
        }
    });


    this.text = function () {

        var storage = this.__storage || this.__defaults,
            format = storage.format;

        return format ? format.replace(/\{\{value\}\}/g, value) : '' + storage.value;
    };



    //按钮图片
    this.defineProperty('button', '');


    //按钮大小
    this.defineProperty('size', 16);



    flyingon.__extend_text.call(this);



    this.__on_click = function () {

        this.trigger('button-click');
    };


    this.__get_popup = function (cache) {

        var popup = popup_cache;

        if (popup)
        {
            popup.close('auto');
        }
        else
        {
            popup = popup_cache = new flyingon.Popup();

            popup.autoDispose = false;

            popup.on('closed', function () {

                if (this.__cache)
                {
                    this.detachAll();
                }
                else
                {
                    this.clear();
                }
            });

            popup.width('auto').height('auto');
        }

        popup.__cache = cache;

        return popup;
    };



}).register();