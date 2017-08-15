flyingon.widget({

    template: {

        Class: 'Plugin',
        padding: 8,
        children: [

            {
                Class: 'Label',
                text: 'text'
            },

            {
                Class: 'Label',
                text: '<span style="color:red;">text</span>',
                html: true
            }

        ]
    },

    created: function () {

    }


});