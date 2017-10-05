flyingon.Control.extend('Memo', function (base) {
    


    this.defaultWidth = 400;

    this.defaultHeight = 100;



    this.text = this.defineProperty('value', '', {

        set: this.render
    });



    flyingon.fragment('f-textbox', this);



}).register();