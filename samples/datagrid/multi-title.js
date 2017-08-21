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
                            { text: 'F123', span: 2 }, 
                            { text: 'F12', span: 1, height: 15 }, 
                            'F1'
                        ]
                    },

                    { 
                        title: ['', '', { height: 15 }, 'F2'] 
                    },

                    { 
                        title: ['', '', { text: 'F34', height: 15, span: 1 }, 'F3'] 
                    },

                    { 
                        title: ['', '', { height: 15 }, 'F4'] 
                    },

                    { 
                        title: [
                            { text: 'F5', height: 25 }, 
                            { text: 'F56', span: 1, height: 15 }, 
                            { text: 'F567', span: 2 },
                            { text: 'F5678', span: 3 }
                        ]
                    },

                    { 
                        title: [
                            { text: 'F6', height: 25 }, 
                            { height: 15 }, 
                            '',
                            ''
                        ] 
                    },

                    { 
                        title: [
                            { text:'F7', height: 25 }, 
                            { text: 'F78', span: 1, height: 15 }, 
                            '',
                            ''
                        ] 
                    },

                    { 
                        title: [
                            { text: 'F8', height: 25 }, 
                            { height: 15 }, 
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