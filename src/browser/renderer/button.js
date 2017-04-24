flyingon.defineClass(flyingon.Renderer, function (base) {



    this.bind(flyingon.Button);

    

    this.render = function (control, writer) {

        writer.push('<button class="', control.defaultClassName, '" style="', this.cssText(control), ';">',
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