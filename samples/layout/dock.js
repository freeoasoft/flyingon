flyingon.widget({

    template: {

        Class: 'Plugin',
        padding: 8,
        layout: 'vertical-line',

        children: [

            {
                Class: 'Panel',
                className: 'f-border',
                width: 780,
                height: 300,
                border: 1,
                padding: 8,
                resizable: true,
                layout: 'dock',

                children: [

                    { Class: 'Panel', className: 'f-border', dock: 'top', height: 60 },
                    { Class: 'Splitter', className: 'f-back', dock: 'top' },
                    { Class: 'Panel', className: 'f-border', dock: 'bottom', height: 60 },
                    { Class: 'Splitter', className: 'f-back', dock: 'bottom' },
                    { Class: 'Panel', className: 'f-border', dock: 'left', width: 60 },
                    { Class: 'Splitter', className: 'f-back', dock: 'left' },
                    { Class: 'Panel', className: 'f-border', dock: 'right', width: 60 },
                    { Class: 'Splitter', className: 'f-back', dock: 'right' },
                    { Class: 'Panel', className: 'f-border', dock: 'fill' },
                ]
            },
            
            {
                Class: 'Label',
                margin: '4 0',
                text: '提醒:可拖动调整面板大小'
            },

            { Class: 'Code' }
        ]
    },

    created: function () {

    }


});