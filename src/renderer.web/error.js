flyingon.renderer('Error', 'Label', function (base) {



    this.render = function (writer, control, className, cssText) {

        writer.push('<span');
        
        this.renderDefault(writer, control, className, cssText);
        
        writer.push('></span>');
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


});