flyingon.widget({

    template: {

        Class: 'Plugin',
        padding: 8,
        layout: 'vertical-line',
        
        children: [
            { Class: 'Code' },
            {
                Class: 'Image',
                width: 300,
                height: 800,
                src: '../css/default/flyingon.png',
                alt: 'alt ...'
            }
        ]
    },

    created: function () {

    }


});