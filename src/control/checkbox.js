flyingon.Control.extend('CheckBox', function (base) {


    this.defineProperty('name', false, {

        set: function (value) {

            this.rendered && this.renderer.set(this, 'name', value);
        }
    });


    this.defineProperty('value', false, {

        set: function (value) {

            this.rendered && this.renderer.set(this, 'value', value);
        }
    });


}).register();