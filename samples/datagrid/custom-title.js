flyingon.widget({

    template: {

        Class: 'Plugin',
        padding: 8,
        children: [

            {
                Class: 'DataGrid',
                header: 60,

                columns: [

                    {
                        title: [
                            'F1', 
                            {
                                control: {
                                    Class: 'CheckBox'
                                }
                            }
                        ]
                    },

                    {
                        title: [
                            'F2', 
                            {
                                control: {
                                    Class: 'TextBox',
                                    width: '100%'
                                }
                            }
                        ]
                    },

                    {
                        title: {
                            control: {
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

            alert(e.value);
        });
    }


});