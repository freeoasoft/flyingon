flyingon.widget({

    template: {

        Class: 'Plugin',
        padding: 8,
        children: [

            {
                Class: 'Grid',
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
            }

        ]
    },

    created: function () {

        this[0].on('change', function (e) {

            alert('change event  column-index:' + e.target.column.absoluteIndex + ' value:' + e.value);
        });
    }


});