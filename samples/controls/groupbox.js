flyingon.widget({

    template: {
        Class: 'Plugin',
        padding: 8,
        layout: 'vertical-line',

        children: [
            {
                Class: 'GroupBox', 
                icon: 'f-tree-icon-file',
                text: 'title', 
                align: 'center',
                collapsable: 1,
                mutex: '1',
                width: 780
            },
            {
                Class: 'GroupBox', 
                icon: 'f-tree-icon-file',
                text: 'title', 
                align: 'center',
                collapsable: 1,
                collapsed: true,
                mutex: '1',
                width: 780
            },
            {
                Class: 'GroupBox', 
                icon: 'f-tree-icon-file',
                text: 'title', 
                collapsable: 2,
                width: 780
            },
            { Class: 'Code', margin: 0 }
        ]
    },

    created: function () {

    }

});