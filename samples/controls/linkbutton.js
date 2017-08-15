flyingon.widget({

    template: {

        Class: 'Plugin',
        padding: 8,
        children: [

            {
                Class: 'LinkButton',
                text: 'button',
                href: '#!flyingon/samples/controls/image.js'
            },

            {
                Class: 'LinkButton',
                text: '<span class="f-tree-icon-file" style="display:inline-block;width:16px;height:16px;"></span><span style="color:red;">button</span>',
                html: true,
                href: '#!flyingon/samples/controls/image.js'
            }

        ]
    },

    created: function () {

    }


});