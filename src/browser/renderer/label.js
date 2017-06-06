flyingon.defineClass(flyingon.Renderer, function (base) {



    this.bind(flyingon.Label);

    

    this.render = function (writer, control, cssLayout) {

        var text = control.text(),
            auto,
            style;

        if (!cssLayout && (auto = control.layout_auto))
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

        if (text && !control.html())
        {
            text = flyingon.html_encode(text);
        }

        writer.push('<div', this.renderDefault(control, cssLayout, '', style), '>', text, '</div>');
    };


    this.text = function (control, view, value) {

        if (control.html())
        {
            view.innerHTML = value;
        }
        else
        {
            view[this.__text_name] = value;
        }
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