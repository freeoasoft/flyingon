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
                header: 80,

                columns: [

                    { 
                        title: [
                            { text: 'F1234', span: 3, size: 35 }, 
                            { text: 'F12', span: 1 }, 
                            'F1'
                        ]
                    },

                    { 
                        title: [{ text: '' , size: 35 }, '', 'F2'] 
                    },

                    { 
                        title: [{ text: '' , size: 35 }, { text: 'F34', span: 1 }, 'F3'] 
                    },

                    { 
                        title: [{ text: '' , size: 35 }, '', 'F4'] 
                    },

                    { 
                        title: [
                            { text: 'F5', size: 35 }, 
                            { text: 'F56', span: 1 }, 
                            { text: 'F5678', span: 3 }
                        ]
                    },

                    { 
                        title: [
                            { text: 'F6', size: 35 }, 
                            '', 
                            ''
                        ]
                    },

                    { 
                        title: [
                            { text: 'F7', size: 35 }, 
                            { text: 'F78', span: 1 }, 
                            ''
                        ] 
                    },

                    { 
                        title: [
                            { text: 'F8', size: 35 }, 
                            '', 
                            ''
                        ]
                    }
                ]
            },
            
            { Class: 'Code' }

        ]
    },

    created: function () {

    }


});