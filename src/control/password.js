flyingon.TextBox.extend('Password', function (base) {


    this.text = this.defineProperty('value', '', {

        set: function (value) {

            this.rendered && this.renderer.set(this, 'value', value);
        }
    });



}).register();