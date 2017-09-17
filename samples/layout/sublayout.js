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

                layout: {
                    type: 'dock',
                    spacingX: 10,
                    spacingY: 10,
                    //rtl: true,

                    //子布局
                    sublayouts: [

                        {
                            scale: 25,
                            dock: 'top',
                            height: 30,
                            layout: {

                                type: 'table',
                                spacingX: 2,
                                spacingY: 2,
                                data: '*[* * * * * * * *] *[50* * * * * * * * 50*] *[* * * * * * * *]'      
                            }
                        },

                        {
                            scale: 25,
                            dock: 'bottom',
                            height: 30,
                            layout: {

                                type: 'table',
                                spacingX: 2,
                                spacingY: 2,
                                data: '*[* * * * * * * *] *[50* * * * * * * * 50*] *[* * * * * * * *]'      
                            }
                        },

                        {
                            dock: 'fill',

                            layout: {

                                type: 'uniform',
                                size: 7,

                                location: function (container, item, index) {

                                    var height = container.arrangeHeight,
                                        value = Math.sin(58.648 * (index + 1) / Math.PI);

                                    if (value < 0)
                                    {
                                        value = -value;
                                    }

                                    this.alignY = 'middle';
                                    this.height = value * height / 2 | 0;
                                }
                            }
                        }

                    ]
                }

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

            for (var i = 1; i <= 101; i++)
            {
                controls.push(new flyingon.Control().className('f-border')); 
            }

            return controls;
        };

        this[0].push.apply(this[0], create_controls());
    }


});