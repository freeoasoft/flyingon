flyingon.renderer('Title', function (base) {



    this.__line_height = 1;



    this.render = function (writer, control) {

        var storage = control.__storage || control.__defaults,
            text = storage.text;

        if (text && !storage.html)
        {
            text = flyingon.html_encode(text);
        }

        writer.push('<span');
        
        this.renderDefault(writer, control);
        
        writer.push('><span class="f-required"', control.__check() ? '' : ' style="display:none;"', '>*</span>',
            '<span>', text, '</span></span>');
    };


    this.text = function (control, view, value) {

        if (storage.html)
        {
            view.lastChild.innerHTML = value;
        }
        else
        {
            view.lastChild[this.__text_name] = value;
        }
    };


    this.required = function (control, view, value) {

        view.firstChild.style.display = value ? '' : 'none';
    };


});