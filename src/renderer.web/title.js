flyingon.renderer('Title', function (base) {



    this.lineHeight = 1;



    this.render = function (writer, control, render) {

        writer.push('<span');
        
        render.call(this, writer, control);
        
        writer.push('><span class="f-required"', control.__check() ? '' : ' style="display:none;"', 
            '>*</span><span></span></span>');
    };


    this.text = function (control, view, value) {

        var storage = control.__storage || control.__defaults;

        if (storage.html)
        {
            view.lastChild.innerHTML = storage.text;
        }
        else
        {
            view.lastChild[this.__text_name] = storage.text;
        }
    };


    this.required = function (control, view, value) {

        view.firstChild.style.display = value ? '' : 'none';
    };


});