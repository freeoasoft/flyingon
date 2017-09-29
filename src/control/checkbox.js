flyingon.Control.extend('CheckBox', function (base) {


    this.defineProperty('name', false, {

        set: this.__to_render
    });


    this.value = this.defineProperty('checked', false, {

        set: this.__to_render
    });


    //是否只读
    this.defineProperty('readonly', false, {

        set: this.__to_render   
    });
    

}).register();