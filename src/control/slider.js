flyingon.Control.extend('Slider', function (base) {



    var define = function (self, name, defaultValue) {

        return self.defineProperty(name, defaultValue, {

            dataType: 'integer',

            check: function (value) {

                return value < 0 ? 0 : value;
            },

            set: function () {

                if (this.rendered && !this.__location_dirty)
                {
                    this.renderer.set(this, 'refresh');
                }
            }
        });
    };



    define(this, 'value', 0);


    define(this, 'min', 0);


    define(this, 'max', 100);


    define(this, 'buttonSize', 8);



}).register();