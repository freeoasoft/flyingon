flyingon.renderer('TextButton', function (base) {

    

    this.render = function (writer, control, className, cssText) {

        var storage = control.__storage || control.__defaults,
            text = control.text(),
            size = storage.buttonSize;

        if (text)
        {
            text = flyingon.html_encode(text);
        }

        writer.push('<div');
        
        this.renderDefault(writer, control, className, cssText);

        writer.push('>',
                '<div class="f-textbutton-body" style="right:', size, 'px;">',
                    '<input type="text" class="f-textbutton-text" value="', text, '" onchange="flyingon.TextButton.onchange.call(this)"/>',
                '</div>',
                '<div class="f-textbutton-button ', storage.button, '" style="width:', size, 'px;" onclick="flyingon.TextButton.onclick.call(this)"></div>',
            '</div>');
    };


    flyingon.TextButton.onclick = function () {

        flyingon.findControl(this).__on_click();
    };


    flyingon.TextButton.onchange = function () {

        var control = flyingon.findControl(this);

        control.rendered = false;
        control.value(this.value);
        control.rendered = true;

        control.view.firstChild.firstChild.value = control.text();

        control.trigger('change', 'value', this.value);
    };



    this.button = function (control, view, value) {

        view.lastChild.className = 'f-textbutton-button ' + value;
    };


    this.buttonSize = function (control, view, value) {

        view.firstChild.style.right = view.lastChild.style.width = value + 'px';
    };


    this.text = function (control, view) {

        view.firstChild.firstChild.value = control.text();
    };


});