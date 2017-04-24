flyingon.defineClass(flyingon.Renderer, function (base) {



    this.bind(flyingon.LinkButton);

    

    this.render = function (control, writer) {

        var encode = flyingon.html_encode;

        writer.push('<div class="', control.defaultClassName, '" style="', this.cssText(control), ';">',
                '<a href="', encode(control.href()), '">', encode(control.text()), '</a>',
            '</div>');
    };


    this.text = function (control, view, value) {

        view.innerHTML = flyingon.html_encode(value);
    };


    this.href = function (control, view, value) {

        view.href = value;
    };



});