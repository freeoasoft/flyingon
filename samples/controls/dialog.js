flyingon.widget({

    template: {

        Class: 'Plugin',
        padding: 8
    },

    created: function () {

        function createControls(parent) {

            flyingon.each('show,showDialog', function (item) {

                parent.push(new flyingon.Button().text(item).on('click', onclick));
            });
        };

        function onclick(e) {

            var dialog = new flyingon.Dialog().resizable(true).text('演示窗口').padding(8);

            createControls(dialog);
            dialog[e.target.text()]();
        };

        createControls(this);
    }


});
