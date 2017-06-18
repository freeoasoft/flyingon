flyingon.defineClass(flyingon.Renderer, function (base) {



    this.bind(flyingon.Label);

    

    this.render = function (writer, control) {

        var text = control.text(),
            auto = control.__auto_size,
            style;

        if (auto)
        {
            style = '';

            if (auto & 1)
            {
                style = 'width:auto;';
            }

            if (auto & 2)
            {
                style += 'height:auto;';
            }
        }

        if (text)
        {
            text = flyingon.html_encode(text, false);
        }

        writer.push('<div', this.renderDefault(control, '', style), '>', text, '</div>');
    };


    this.auto = function (control, auto) {

        var view = control.view;

        if (auto & 1)
        {
            control.offsetWidth = view.offsetWidth;
        }

        if (auto & 2)
        {
            control.offsetHeight = view.offsetWidth;
        }
    };



});