flyingon.Control.extend('CheckBox', function (base) {


    this.defineProperty('name', '', {

        set: this.render
    });


    this.value = this.defineProperty('checked', false, {

        set: this.render
    });


    //是否只读
    this.readonly = this.disabled;
    

}).register();