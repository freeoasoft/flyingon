flyingon.Control.extend('CheckBox', function (base) {


    this.defineProperty('name', false, {

        set: function (value) {

            this.rendered && this.renderer.set(this, 'name', value);
        }
    });


    this.value = this.defineProperty('checked', false, {

        set: function (value) {

            this.rendered && this.renderer.set(this, 'checked', value);
        }
    });


}).register();