flyingon.renderer('Title', 'Label', function (base) {



    this.render = function (writer, control, className, cssText) {

        var storage = control.__storage || control.__defaults,
            text = storage.text;

        if (text)
        {
            text = flyingon.html_encode(text);
        }

        writer.push('<span');
        
        this.renderDefault(writer, control, className, cssText);
        
        writer.push('>', storage.required ? '<span class="f-required">*</span>' : '', text, '</span>');
    };



});