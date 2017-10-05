flyingon.fragment('f-TextBox', function () {


    this.defaultWidth = 200;


    //是否只读
    this.defineProperty('readonly', false, {

        set: this.render   
    });
    


    this.selectionStart = function (value) {
        
        if (this.view)
        {
            return this.renderer.selectionStart(this, value);
        }

        return value === void 0 ? 0 : this;
    };


    this.selectionEnd = function (value) {

        if (this.view)
        {
            return this.renderer.selectionEnd(this, value);
        }

        return value === void 0 ? 0 : this;
    };


    this.select = function () {

        this.renderer.select(this);
        return this;
    };


    //校验器
    flyingon.fragment('f-validate', this);


});



flyingon.Control.extend('TextBox', function (base) {
    


    this.__type = 'text';



    //无值时提醒信息
    this.defineProperty('placeholder', '', {

        set: this.__render_value
    });


    this.text = this.defineProperty('value', '', {

        set: this.__render_value
    });



    flyingon.fragment('f-TextBox', this);
    


}).register();