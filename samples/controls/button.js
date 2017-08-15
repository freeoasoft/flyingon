flyingon.widget({

    template: {

        Class: 'Plugin',
        padding: 8,
        children: [

            {
                Class: 'Button',
                text: 'button'
            },

            {
                Class: 'Button',
                text: '<span style="color:red;">button</span>',
                html: true
            },

            {
                Class: 'Button',
                icon: 'f-tree-icon-file',
                text: 'button'
            },

            {
                Class: 'Button',
                height: 40,
                vertical: true,
                icon: 'f-tree-icon-file',
                text: 'button'
            }

        ]
    },

    created: function () {

    }


});