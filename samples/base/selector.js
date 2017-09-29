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
                height: 32,
                border: 1,
                padding: 4,
                layout: 'line',

                children: [
                    { Class: 'Label', width: 50, text: '选择器', style: 'text-align:right;' },
                    { Class: 'TextBox', width: 100, value: 'TextBox:even' },
                    { Class: 'Label', width: 80, text: '属性', style: 'text-align:right;' },
                    { Class: 'TextBox', width: 100, value: 'color' },
                    { Class: 'Label', width: 50, text: '值', style: 'text-align:right;' },
                    { Class: 'TextBox', width: 100, value: 'red' },
                    { Class: 'Button', text: '执行', margin: '0 0 0 8' }
                ]
            },

            {
                Class: 'Panel',
                className: 'f-border',
                width: 780,
                height: 200,
                margin: '4 0 0 0',
                border: 1,
                padding: 8
            },

            { Class: 'Code' }
        ]
    },

    created: function () {

        var tool = this[0],
            host = this[1];

        function create_controls() {

            var controls = [];

            for (var i = 1; i <= 200; i++)
            {
                controls.push(new flyingon.TextBox().value('text ' + i)); 
            }

            return controls;
        };

        host.push.apply(host, create_controls());


        tool.on('click', function (e) {

            var target = e.target;

            if (target instanceof flyingon.Button)
            {
                var selector = tool[1].value(),
                    name = tool[3].value(),
                    value = tool[5].value();

                host.find(selector).set(name, value);
            }
        });
    }


});