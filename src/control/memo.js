flyingon.Control.extend('Memo', function (base) {
    


    this.defaultWidth = 400;

    this.defaultHeight = 100;



    this.text = this.defineProperty('value', '', {

        set: function (value) {

            this.rendered && this.renderer.set(this, 'text', value);
        }
    });



    flyingon.fragment('f-textbox', this);



}).register();