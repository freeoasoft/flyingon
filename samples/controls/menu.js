flyingon.widget({

    template: {

        Class: 'Plugin',
        padding: 8,
        layout: 'vertical-line',
        
        children: [
            {
                Class: 'Panel',
                width: 780,
                height: 40,

                children: [
                    { Class: 'Button', dropdown: true, width: 'auto', menu: 'test', text: '点击弹出下拉菜单' }
                ]
            },
            {
                Class: 'Panel',
                width: 780,
                height: 40,
                className: 'f-border',
                contextmenu: 'test',
                children: [
                    { Class: 'Label', text: '右键点击弹出自定义菜单' }
                ]
            },
            { Class: 'Code' }
        ]
    },

    created: function () {

        var menu = new flyingon.Menu();

        menu.push(
            { 
                text: 'menu 1',
                icon: 'f-tree-icon-open',
                children: [
                    { text: 'sub menu 1' },
                    { text: 'sub menu 2' }
                ]
            },
            '-',
            { 
                text: 'menu 2'
            });

        menu.register('test');

        menu.on('click', function (e) {

            alert(e.target.text());
        });
    }


});
