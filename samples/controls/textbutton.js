flyingon.widget({

    template: {

        Class: 'Plugin',
        padding: 8,
        layout: 'vertical-line',
        
        children: [

            {
                Class: 'TextButton',
                width: 200,
                value: 'text'
            },

            { Class: 'Code' }

        ]
    },

    created: function () {

        this[0].on('button-click', function (e) {

            var self = this;

            flyingon.showMessage('title', 'text', 'question', 'yes,no,cancel').on('closed', function (e) {

                self.value(e.closeType);
            });
        });
    }


});