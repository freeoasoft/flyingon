flyingon.widget({

    template: {

        Class: 'Plugin',
        padding: 8,
        children: [

            {
                Class: 'Grid',
                header: 40,
                group: 35,
                locked: '1 1',

                columns: [

                    { 
                        name: 'F1',
                        title: 'F1'
                    },

                    { 
                        name: 'F2',
                        title: 'F2'
                    },

                    { 
                        name: 'F3',
                        title: [{ text: 'F34', span: 1 }, 'F3'] 
                    },

                    { 
                        name: 'F4',
                        title: ['', 'F4'] 
                    },

                    { 
                        name: 'F5',
                        title: [{ text: 'F56', span: 1 }, 'F5']
                    },

                    { 
                        name: 'F6',
                        title: ['', 'F6'] 
                    },

                    { 
                        name: 'F7',
                        title: 'F7'
                    },

                    { 
                        name: 'F8',
                        title: 'F8'
                    }
                ]
            }

        ]
    },

    created: function () {

    }


});