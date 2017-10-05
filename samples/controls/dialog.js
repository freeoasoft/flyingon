flyingon.widget({

    template: {

        Class: 'Plugin',
        padding: 8,
        layout: 'vertical-line',

        children: [
            { Class: 'Panel', height: 40 },
            { Class: 'Code' }
        ]
    },

    created: function () {

        function createControls(parent) {

            flyingon.each('show,showDialog', function (item) {

                parent.push(new flyingon.Button().text(item).on('click', onclick));
            });
        };

        function onclick(e) {

            var dialog = window.dialog = new flyingon.Dialog().resizable(true).text('演示窗口').padding(8);

            createControls(dialog);
            dialog[e.target.text()]();
        };

        createControls(this[0]);
    }


});
