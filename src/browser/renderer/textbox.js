flyingon.defineClass(flyingon.Renderer, function (base) {


    this.bind(flyingon.TextBox);

    

    this.render = function (control, writer) {

        writer.push('<div class="', control.defaultClassName, '" style="', this.cssText(control), 'border-width:1px;border-style:solid;">',
                '<input type="text" class="flyingon-textbox-text" value="', flyingon.html_encode(control.text()), '" />',
            '</div>');
    };


    this.text = function (control, view, value) {

        view.firstChild.value = value;
    };



    this.initView = function (control, view) {

        base.initView.call(this, control, view);
        
        control.on('change', on_change);
    };


    function on_change(event) {

        var view = this.view;

        this.view = null;
        this.text(event.original_event.target.value);
        this.view = view;
    };


});