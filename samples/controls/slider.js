flyingon.widget({

    template: {

        Class: 'Plugin',
        padding: 8,
        layout: 'vertical-line',
        
        children: [
            {
                Class: 'Slider',
                width: 400,
                value: 50
            },
            { Class: 'Number', width: 200 },
            { Class: 'Code' }
        ]
    },

    created: function () {

        this[1].value(this[0].value());

        this[0].on('change', function (e) {

            this.parent[1].value(e.value);
        });

        this[1].on('change', function (e) {

            this.parent[0].value(e.value);
        });
    }


});