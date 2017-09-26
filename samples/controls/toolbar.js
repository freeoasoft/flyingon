flyingon.widget({

    template: {

        Class: 'Plugin',
        padding: 8,
        layout: 'vertical-line',
        
        children: [
            {
                Class: 'ToolBar',
                width: 780,

                children: [
                    { Class: 'Icon', tag: 'first', icon: 'f-page-first' },
                    { Class: 'Icon', tag: 'previous', icon: 'f-page-previous' },
                    { Class: 'Icon', tag: 'next', icon: 'f-page-next' },
                    { Class: 'Icon', tag: 'last', icon: 'f-page-last' },
                    { Class: 'Separator' },
                    { Class: 'Icon', tag: 'refresh', icon: 'f-page-refresh' },
                    { Class: 'Label', tag: 'total', dock: 'right' }
                ]
            },
            { Class: 'Code' }
        ]
    },

    created: function () {

        this.on('click', function (e) {

            var tag = e.target.tag();

            if (tag)
            {
                alert(tag);
            }
        });
    }


});
