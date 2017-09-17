flyingon.TextBox.extend('NumberPicker', function (base) {


    this.defineProperty('value', '', {

        set: function (value) {

            this.rendered && this.renderer.set(this, 'text', value);
        }
    });


}).register();