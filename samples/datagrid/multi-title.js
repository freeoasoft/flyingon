flyingon.widget({

    template: {

        Class: 'Plugin',
        padding: 8,
        children: [

            {
                Class: 'DataGrid',
                header: 80,

                columns: [

                    { 
                        title: [
                            { text: 'F1234', span: 3 }, 
                            { text: 'F12', span: 1 }, 
                            'F1'
                        ]
                    },

                    { 
                        title: ['', '', 'F2'] 
                    },

                    { 
                        title: ['', { text: 'F34', span: 1 }, 'F3'] 
                    },

                    { 
                        title: ['', '', 'F4'] 
                    },

                    { 
                        title: [
                            { text: 'F5', height: 40 }, 
                            { text: 'F56', span: 1 }, 
                            { text: 'F5678', span: 3 }
                        ]
                    },

                    { 
                        title: [
                            { text: 'F6', height: 40 }, 
                            '', 
                            ''
                        ] 
                    },

                    { 
                        title: [
                            { text:'F7', height: 40 }, 
                            { text: 'F78', span: 1 }, 
                            ''
                        ] 
                    },

                    { 
                        title: [
                            { text: 'F8', height: 40 }, 
                            '', 
                            ''
                        ]
                    }
                ]
            }

        ]
    },

    created: function () {

    }


});