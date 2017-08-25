flyingon.widget({

    template: {

        Class: 'Plugin',
        padding: 8,
        children: [

            {
                Class: 'DataGrid',
                header: 80,
                groupbox: 35,

                columns: [

                    { 
                        name: 'F1',
                        title: [
                            { text: 'F1234', span: 3, size: 35 }, 
                            { text: 'F12', span: 1 }, 
                            'F1'
                        ]
                    },

                    { 
                        name: 'F2',
                        title: [{ text: '' , size: 35 }, '', 'F2'] 
                    },

                    { 
                        name: 'F3',
                        title: [{ text: '' , size: 35 }, { text: 'F34', span: 1 }, 'F3'] 
                    },

                    { 
                        name: 'F4',
                        title: [{ text: '' , size: 35 }, '', 'F4'] 
                    },

                    { 
                        name: 'F5',
                        title: [
                            { text: 'F5', size: 35 }, 
                            { text: 'F56', span: 1 }, 
                            { text: 'F5678', span: 3 }
                        ]
                    },

                    { 
                        name: 'F6',
                        title: [
                            { text: 'F6', size: 35 }, 
                            '', 
                            ''
                        ] 
                    },

                    { 
                        name: 'F7',
                        title: [
                            { text:'F7', size: 35 }, 
                            { text: 'F78', span: 1 }, 
                            ''
                        ] 
                    },

                    { 
                        name: 'F8',
                        title: [
                            { text: 'F8', size: 35 }, 
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