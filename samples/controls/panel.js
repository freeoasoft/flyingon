//注册布局
flyingon.layout('wall', {

    type: 'table',
    spacingX: 2,
    spacingY: 2,
    data: '*[* * * * * * * *] *[50* * * * * * * * 50*] *[* * * * * * * *]'      
});


flyingon.layout('panel', [

    {
        type: 'dock',
        spacingX: 10,
        spacingY: 10,
        //rtl: true,

        //子布局
        sublayouts: [

            {
                scale: 25,
                dock: 'top',
                height: 40,
                layout: 'wall'
            },

            {
                scale: 25,
                dock: 'bottom',
                height: 40,
                layout: 'wall'
            },

            {
                dock: 'fill',

                layout: {

                    type: 'uniform',
                    size: 10,

                    location: function (container, item, index) {

                        var height = container.arrangeHeight,
                            value = Math.sin(58.648 * (index + 1) / Math.PI);

                        if (value < 0)
                        {
                            value = -value;
                        }

                        this.alignY = 'bottom';
                        this.height = value * height / 2 | 0;
                    }
                }
            }

        ]
    },

    {
        condition: { width: [0, 250] },
        type: 'vertical-line',
        spacingY: 2
    },

    {
        condition: { width: [251, 450] },
        type: 'flow',
        spacingX: 2,
        spacingY: 2
    },

    {
        condition: { width: [451, 600] },
        type: 'table',
        spacingX: 2,
        spacingY: 2,
        data: '20[* * *] *[* *{(50% 50%)L*[* * *]^3} *] 20[* * *]',
        auto: 2
    }

]);


flyingon.widget({

    template: {

        Class: 'Plugin',
        padding: 8,
        layout: 'vertical-line',

        children: [
            {
                Class: 'Panel',
                width: 780,
                height: 300,
                className: 'f-border',
                border: 1,
                padding: 8,
                resizable: true,
                layout: 'panel'
            },
            {
                Class: 'Label',
                margin: '4 0',
                text: '提醒:可拖动调整面板大小观看自适应效果'
            },
            { Class: 'Code' }
        ]
    },

    created: function () {

        function create_controls() {

            var controls = [];

            for (var i = 1; i <= 101; i++)
            {
                controls.push(new flyingon.Control().className('f-border')); 
            }

            return controls;
        };

        this[0].push.apply(this[0], create_controls());
    }


});