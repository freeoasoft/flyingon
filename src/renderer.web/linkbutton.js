flyingon.renderer('LinkButton', function (base) {


    

    this.render = function (writer, control, css) {

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

        writer.push('<div');
        
        this.renderDefault(writer, control, css);
        
        writer.push('><a href="', href, '">', text, '</a></div>');
    };



    this.href = function (control, view, value) {

        view.href = value;
    };



});