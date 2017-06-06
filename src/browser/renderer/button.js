flyingon.defineClass(flyingon.Renderer, function (base) {



    this.bind(flyingon.Button);

    

    this.render = function (writer, control, cssLayout) {

        writer.push('<button type="button"', this.renderDefault(control, cssLayout), '>',
                flyingon.html_encode(control.text()), 
            '</button>');
    };


    this.text = function (control, view, value) {

        if (control.html())
        {
            view.innerHTML = flyingon.html_encode(value);
        }
        else
        {
            view[this.__text_name] = value;
        }
    };



});