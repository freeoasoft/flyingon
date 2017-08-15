flyingon.Control.extend('RadioButton', function (base) {


    this.defineProprty('name', false, {

        set: function (value) {

            this.hasRender && this.renderer.set(this, 'name', value);
        }
    });


    this.defineProprty('checked', false, {

        set: function (value) {

            this.hasRender && this.renderer.set(this, 'checked', value);
        }
    });



}).register();