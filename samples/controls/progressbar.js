flyingon.widget({

    template: {

        Class: 'Plugin',
        padding: 8,
        layout: 'vertical-line',

        children: [
            {
                Class: 'ProgressBar',
                width: 400,
                value: 51
            },
            { Class: 'Code' }
        ]
    },

    created: function () {

        var control = this[0];

        function change() {

            var value = control.value() + 1;

            if (value > 100)
            {
                value = 0;
            }

            control.value(value);
            setTimeout(change, 50);
        };

        setTimeout(change, 1000);
    }


});