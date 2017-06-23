flyingon.defineClass(flyingon.Renderer, function (base) {



    this.bind(flyingon.Button);

    

    this.render = function (writer, control, css) {

        var text = control.text();

        if (text && !control.html())
        {
            text = flyingon.html_encode(text);
        }

        writer.push('<button type="button"', this.renderDefault(control, css), '>', text, '</button>');
    };


    this.text = function (control, view, value) {

        if (control.html())
        {
            view.innerHTML = value;
        }
        else
        {
            view[this.__text_name] = value ? flyingon.html_encode(value) : value;
        }
    };



});