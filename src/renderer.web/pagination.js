flyingon.renderer('Pagination1', function (base) {



    this.render = function (writer, control) {

        writer.push('<div');
        
        this.renderDefault(writer, control);
        
        writer.push('>');

        render_common(writer, control);
        
        writer.push('</div>');
    };


    function render_common(writer, control) {

        writer.push('<div class="f-page-first"></div>',
            '<div class="f-page-previous"></div>',
            '<input type="text" class="f-page-current"/>',
            '<div class="f-page-next"></div>',
            '<div class="f-page-last"></div>',
            '<div class="f-page-count"></div>',
            '<div class="f-page-refresh"></div>');
    };


});