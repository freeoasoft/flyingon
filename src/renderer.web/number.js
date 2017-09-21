flyingon.renderer('Number', 'TextBox', function (base) {


    this.oninput = function (control, view) {

        var value = +view.value;

        if (value !== value)
        {
            view.value = control.__text;
        }
        else
        {
            control.__text = value;
        }
    };


});