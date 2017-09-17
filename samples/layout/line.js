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
                height: 60,
                border: 1,
                padding: 8,
                resizable: true,
                layout: 'line'
            },

            {
                Class: 'Panel',
                className: 'f-border',
                width: 780,
                height: 200,
                margin: '8 0 0 0',
                border: 1,
                padding: 8,
                resizable: true,
                layout: 'vertical-line'
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

            for (var i = 1; i <= 20; i++)
            {
                controls.push(new flyingon.Button().text('Button' + i)); 
            }

            return controls;
        };

        this[0].push.apply(this[0], create_controls());
        this[1].push.apply(this[1], create_controls());
    }


});