//日历控件
flyingon.Control.extend('Calendar', function (base) {



    this.defaultWidth = this.defaultHeight = 240;


    this.defaultValue('border', 1);

    this.defaultValue('padding', 8);


    function define(self, name, defaultValue, type) {

        self.defineProperty(name, defaultValue, {

            dataType: type,

            set: function () {

                if (this.rendered && !this.__location_dirty)
                {
                    this.renderer.set(this, 'refresh');
                }
            }
        });
    };


    //日期值
    define(this, 'value', null, 'date');


    //最小可选值
    define(this, 'min', '');


    //最大可选值
    define(this, 'max', '');


    //是否编辑年月
    define(this, 'month', false);


    //是否显示时间
    define(this, 'time', false);


    //是否显示今天按钮
    define(this, 'today', false);


    //是否显示清除按钮
    define(this, 'clear', false);
    
    
    
}).register();