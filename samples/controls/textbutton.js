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
                    {
                        Class: 'TextButton',
                        value: 'text ...'
                    },
                    {
                        Class: 'TextButton',
                        placeholder: '请点击按钮选择'
                    },
                    {
                        Class: 'TextButton',
                        button: 'hover',
                        placeholder: '鼠标划过时才显示按钮'
                    }
                ]
            },
            { Class: 'Code' }
        ]
    },

    created: function () {

        this[0].on('button-click', function (e) {

            var target = e.target;

            flyingon.showMessage('title', 'text', 'question', 'yes,no,cancel').on('closed', function (e) {

                target.value(e.closeType);
            });
        });
    }


});