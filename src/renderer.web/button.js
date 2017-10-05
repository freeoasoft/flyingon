flyingon.renderer('Button', function (base) {

    


    this.render = function (writer, control, render) {

        writer.push('<button type="button"');
        
        render.call(this, writer, control);
        
        writer.push('><span class="f-button-icon" style="display:none;width:16px;height:16px;"></span>',
                '<br style="display:none;"/>',
                '<span class="f-button-text"></span>',
                '<span class="f-button-drop" style="display:none;"></span>',
            '</button>');
    };



    this.icon = function (control, view, value) {

        view = view.firstChild;
        view.style.display = value ? 'inline-block' : 'none';
        view.className = 'f-button-icon ' + value; 
    };
    
    
    this.iconSize = function (control, view, value) {

        var style = view.firstChild.style;
        style.width = style.height = value + 'px';
    };
    
    
    this.vertical = function (control, view, value) {

        view.firstChild.nextSibling.style.display = value ? '' : 'none';
    };


    this.dropdown = function (control, view, value) {

        view.lastChild.style.display = value ? '' : 'none';
    };


    this.text = function (control, view) {

        var storage = control.__storage || control.__defaults;

        view = view.lastChild.previousSibling;

        if (storage.html)
        {
            view.innerHTML = storage.text;
        }
        else
        {
            view[this.__text_name] = storage.text;
        }
    };



});