flyingon.renderer('ProgressBar', function (base) {


    this.render = function (writer, control, className, cssText) {

        var value = (control.__storage || control.__defaults).value;

        writer.push('<div');
        
        this.renderDefault(writer, control, className, cssText);

        writer.push('>',
                '<div class="f-progressbar-back" style="width:', value, '%;"></div>',
                '<div class="f-progressbar-text"><span>', value, '%</span></div>',
            '</div>');
    };


    this.value = function (control, view, value) {

        view.firstChild.style.width = value + 'px';
        view.lastChild.firstChild[this.__text_name] = value + '%';
    };


    this.text = function (control, view, value) {

        view.lastChild.style.display = value ? '' : 'none';
    };


});