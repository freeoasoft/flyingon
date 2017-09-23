flyingon.renderer('Image', function (base) {



    this.render = function (writer, control, render) {

        var encode = flyingon.html_encode,
            storage = control.__storage || control.__defaults,
            src = storage.src,
            alt = storage.alt;

        if (src)
        {
            src = encode(src);
        }

        if (alt)
        {
            alt = encode(alt);
        }

        writer.push('<img');
        
        render.call(this, writer, control);
        
        writer.push(' src="', src, '" alt="', alt, '"></img>');
    };



    this.src = function (control, view, value) {

        view.src = value;
    };


    this.alt = function (control, view, value) {

        view.alt = value;
    };



});