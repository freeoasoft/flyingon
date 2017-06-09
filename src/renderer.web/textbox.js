flyingon.defineClass(flyingon.Renderer, function (base) {


    this.bind(flyingon.TextBox);

    

    this.render = function (writer, control) {

        var text = control.text();

        if (text)
        {
            text = flyingon.html_encode(text, false);
        }

        writer.push('<div', this.renderDefault(control), '>',
                '<input type="text" class="flyingon-textbox-text" value="', text, '" />',
            '</div>');
    };


    this.text = function (control, view, value) {

        view.firstChild.value = value;
    };



    this.mount = function (control, view) {

        base.mount.call(this, control, view);
        control.on('change', on_change);
    };


    function on_change(event) {

        var view = this.view;

        this.view = null;
        this.text(event.original_event.target.value);
        this.view = view;
    };


});