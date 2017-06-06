flyingon.defineClass(flyingon.Renderer, function (base) {



    this.bind(flyingon.LinkButton);

    

    this.render = function (writer, control, cssLayout) {

        var encode = flyingon.html_encode,
            href = control.href(),
            text = control.text();

        if (href)
        {
            href = encode(href);
        }

        if (text)
        {
            text = encode(text);
        }

        writer.push('<div', this.renderDefault(control, cssLayout), '>',
                '<a href="', href, '">', text, '</a>',
            '</div>');
    };


    this.text = function (control, view, value) {

        view.innerHTML = flyingon.html_encode(value);
    };


    this.href = function (control, view, value) {

        view.href = value;
    };



});