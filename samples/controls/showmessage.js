flyingon.widget({

    template: {

        Class: 'Plugin',
        padding: 8,
        layout: 'vertical-line',
        
        children: [
            {
                Class: 'Panel',
                height: 40,
                
                children: [
                    { Class: 'Button', text: 'message' },
                    { Class: 'Button', text: 'information', tag: 'ok,cancel' },
                    { Class: 'Button', text: 'question', tag: 'yes,no,cancel' },
                    { Class: 'Button', text: 'warn', tag: 'ok,cancel' },
                    { Class: 'Button', text: 'error', tag: 'ok,cancel' }
                ]
            },
            { Class: 'Code' }
        ]
    },

    created: function () {

        this.on('click', function (e) {

            if (e.target instanceof flyingon.Button)
            {
                var text = e.target.text(),
                    tag = e.target.tag();
            
                if (tag)
                {
                    flyingon.showMessage('title', text, text, tag).on('closed', function (e) {

                        alert(e.closeType);  
                    });
                }
                else
                {
                    flyingon.showMessage('title', text);
                }
            }
        });
    }


});
