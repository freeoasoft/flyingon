flyingon.GridColumn_renderer = (function () {
    
    var cache = flyingon.create(null);

    return function (type, fn) {

        if (type)
        {
            if (fn)
            {
                fn.call(cache[type] = {});
            }
            else
            {
                return cache[type];
            }
        }

        return cache;
    };

})();



flyingon.GridColumn_renderer('no', function () {


    this.render_title = function () {

    };


    this.render_cell = function () {

    };

});



flyingon.GridColumn_renderer('check', function () {


    this.render_title = function () {

    };


    this.render_cell = function () {

    };
    
});



flyingon.renderer('BaseGrid', function (base) {



    this.__no_padding = this.padding = 0;


    this.render = function (writer, control) {

        var relative = ' style="position:relative;',
            absolute = ' style="position:absolute;',
            style1 = 'overflow:hidden;margin:0;border:0;padding:0;',
            style2 = 'display:none;margin:0;right:0;bottom:0;z-index:1;',
            scroll = '<div style="' + style1 + 'width:1px;height:1px;"></div>',
            width = 'width:' + (flyingon.vscroll_width + 1) + 'px;',
            height = control.header();

        writer.push('<div');

        this.renderDefault(writer, control, 'f-grid', 'overflow:hidden;');

        writer.push('>',
            '<div class="f-grid-back"', absolute, 'left:0;top:0;right:0;width:auto;border:0"></div>',
            '<div class="f-grid-head"', relative, style1, 'white-space:nowarp;height:', height, 'px;line-height:', height, 'px;">');
        
        if (height > 0)
        {
            this.render_head(writer, control);
        }

        height = 'height:' + (flyingon.hscroll_height + 1) + 'px;';

        writer.push('</div>',
            '<div class="f-grid-body"', relative, style1, 'outline:none;" tabindex="0"></div>',
            '<div class="f-grid-end"', absolute, style2, width, height, 'left:auto;top:auto;overflow:scroll;"></div>',
            '<div class="f-grid-hscroll"', absolute, style2, height, 'width:auto;overflow-x:scroll;overflow-y:hidden;left:0;top:auto;">', scroll, '</div>',
            '<div class="f-grid-vscroll"', absolute, style2, width, 'height:auto;overflow-x:hidden;overflow-y:scroll;left:auto;top:0;">', scroll, '</div>',
        '</div>');
    };


    this.render_head = function (writer, control) {

        var storage = control.__storage || control.__defaults,
            locked = storage.locked,
            columns = control.__columns,
            length = columns.length,
            start = 0,
            end = length,
            any;

        if (length > 0 && storage.header > 0)
        {
            writer.push('<div class="f-grid-left" style="white-space:nowrap;">');

            if (locked)
            {
                locked = locked.split(' ');
                
                if ((any = locked[3] | 0) > 0)
                {
                    this.__render_head(writer, control, columns, start, start = any > end ? any : end);
                }

                if ((locked = locked[0] | 0) > 0)
                {
                    end -= locked;
                }
            }
            
            writer.push('</div><div class="f-grid-center" style="white-space:nowrap;">');

            this.__render_head(writer, control, columns, start, end);

            writer.push('</div><div class="f-grid-right" style="white-space:nowrap;">');

            if (locked > 0)
            {
                this.__render_head(writer, control, columns, end, length);
            }

            writer.push('</div>');
        }
    };


    this.__render_head = function (writer, control, columns, start, end) {

        while (start < end)
        {
            var column = columns[start],
                storage = column.__storage || column.__defaults,
                any = column.renderer;

            writer.push('<span class="f-grid-column" style="display:inline-block;width:', storage.width, storage.persent ? '%' : 'px', ';">');

            any = any && any.render_title || this.render_title;
            any.call(this, writer, control, storage, start);

            writer.push('</span>');

            start++;
        }
    };


    this.render_title = function (writer, control, column, index) {

        writer.push('<span>', column.title, '</span>');
    };


    //渲染多行列头
    this.render_multi = function (writer, column) {

    };


    this.render_body = function () {

    };


    this.render_cell = function (writer, control, column, row, cell) {

    };



    this.update = function (control) {

        base.update.call(this, control);
    };


    this.refresh = function (control, view) {

    };


});



flyingon.renderer('DataGrid', 'BaseGrid', function (base) {


    this.refresh = function (control, view) {


    };


    this.render_columns = function (control, start, end) {

    };


    this.render_rows = function (control, column, start, end) {

    };


});



flyingon.renderer('GroupDataGrid', 'DataGrid', function (base) {

});



flyingon.renderer('TreeDataGrid', 'DataGrid', function (base) {


});