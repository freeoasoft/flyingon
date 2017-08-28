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
                                text: {
                                    Class: 'CheckBox'
                                }
                            }
                        ]
                    },

                    {
                        title: [
                            'F2', 
                            {
                                text: {
                                    Class: 'TextBox',
                                    width: '100%'
                                }
                            }
                        ]
                    },

                    {
                        title: {
                            text: {
                                Class: 'div',
                                width: '100%',
                                height: '100%',
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

            alert('change event  column-index:' + e.target.columnIndex + ' value:' + e.value);
        });
    }


});