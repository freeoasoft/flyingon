flyingon.renderer('Pagination', function (base) {


    this.render = function (writer, control, className, cssText) {

        writer.push('<div');
        
        this.renderDefault(writer, control, className, cssText);
        
        writer.push('></div>');
    };



    this.content = function (control) {

        var layout = control.layout();


    };




});