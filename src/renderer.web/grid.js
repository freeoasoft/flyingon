flyingon.renderer('BaseGrid', function (base) {


    this.render = function (writer, grid) {


    };


    this.render_columns = function (grid, start, end) {

    };


    this.render_column = function (grid, column, start, end) {

    };


    this.render_head = function (grid, column, row) {

    };


    this.render_cell = function (grid, column, row, cell) {

    };


});



flyingon.renderer('DataGrid', 'BaseGrid', function (base) {

});



flyingon.renderer('GroupDataGrid', 'DataGrid', function (base) {

});



flyingon.renderer('TreeGrid', 'BaseGrid', function (base) {


});