flyingon.widget({

    template: {

        Class: 'Plugin',
        padding: 8,
        layout: 'vertical-line',

        children: [

            {
                Class: 'Grid',
                width: 780,
                height: 240,

                header: 60,

                columns: [

                    {
                        title: [
                            'F1', 
                            {
                                control: { Class: 'CheckBox' }
                            }
                        ]
                    },

                    {
                        title: [
                            'F2', 
                            {
                                control: { Class: 'TextBox' }
                            }
                        ]
                    },

                    {
                        title: {
                            control: {
                                Class: 'div',
                                children: [
                                    { Class: 'Label', text: 'F3', width: 'auto' },
                                    { Class: 'TextBox', width: 60 }
                                ]
                            }
                        }
                    }
                ]
            },
            
            { Class: 'Code' }

        ]
    },

    created: function () {

        this[0].on('change', function (e) {

            var target = e.target,
                column = target.column || target.parent.column;

            alert('change event  column-index:' + column.index() + ' value:' + e.value);
        });
    }


});