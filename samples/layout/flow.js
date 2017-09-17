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
                border: 1,
                padding: 8,
                resizable: true,
                layout: 'flow'
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

        function create_controls() {

            var controls = [];

            for (var i = 1; i <= 100; i++)
            {
                controls.push(new flyingon.Button().text('Button' + i)); 
            }

            return controls;
        };

        this[0].push.apply(this[0], create_controls());
    }


});