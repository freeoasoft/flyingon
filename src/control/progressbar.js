flyingon.Control.extend('ProgressBar', function (base) {



    this.defaultHeight = 20;

    this.defaultValue('border', 1);



    this.defineProperty('value', 0, {

        dataType: 'integer',

        check: function (value) {

            if (value < 0)
            {
                return 0;
            }

            return value > 100 ? 100 : value;
        },

        set: function (value) {

            this.rendered && this.renderer.set(this, 'value', value);
        }
    });


    this.defineProperty('text', true, {

        set: function (value) {

            this.rendered && this.renderer.set(this, 'text', value);
        }
    });


}).register();