flyingon.defineClass(flyingon.Renderer, function (base) {



    this.bind(flyingon.Comment);

    

    this.render = function (writer, control) {

        var text = control.text();

        if (text)
        {
            text = flyingon.html_encode(text, false);
        }

        writer.push('<!--', text, '-->');
    };


    this.update = function () {
    };


});