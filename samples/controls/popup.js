flyingon.widget({

    template: {

        Class: 'Plugin',
        padding: 8
    },

    created: function () {

        function createControls(parent) {

            flyingon.each('left,top,right,bottom', function (item) {

                parent.push(new flyingon.Button().text(item).on('click', onclick));
            });
        };

        function onclick(e) {

            var button = e.target,
                popup;

            if ((popup = button.popup) && popup.shown)
            {
                button.popup = null;
                popup.close('auto');
            }
            else
            {
                popup = button.popup = new flyingon.Popup()
                    .direction(button.text())
                    //.closeLeave(true)
                    //.closeAway(true)
                    .padding(8);

                createControls(popup);
                popup.show(button);
            }
        };

        createControls(this);
    }


});
