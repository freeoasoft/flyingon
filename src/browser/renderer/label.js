flyingon.defineClass(flyingon.Renderer, function (base) {



    this.bind(flyingon.Label);

    

    this.render = function (control, writer) {

        writer.push('<div class="', control.defaultClassName, '" style="', this.cssText(control), ';">',
                flyingon.html_encode(control.text()),
            '</div>');
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