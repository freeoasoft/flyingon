flyingon.renderer('TextBox', function (base) {



    //检测盒模型
    flyingon.dom_test(function (div) {
        
 
        div.innerHTML = '<input type="text" class="f-control f-textbox"/>';

        this.checkBoxModel(div.children[0]);


    }, this);

    

    this.render = function (writer, control) {

        var text = control.text();

        if (text)
        {
            text = flyingon.html_encode(text);
        }

        writer.push('<input type="text"');
        
        this.renderDefault(writer, control);
        
        writer.push(' value="', text, '" onchange="flyingon.TextBox.onchange.call(this)"/>');
    };


    flyingon.TextBox.onchange = function () {

        var control = flyingon.findControl(this);

        control.rendered = false;
        control.value(this.value);
        control.rendered = true;

        this.value = control.text();

        control.trigger('change', 'value', this.value);
    };



    this.text = function (control, view) {

        view.value = control.text();
    };



});