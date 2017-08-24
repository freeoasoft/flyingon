flyingon.GridColumn = Object.extend(function () {



    this.init = function (options) {

        //列头单元格集合
        this.cells = [];

        if (options)
        {
            var properties = this.__properties;

            for (var name in options)
            {
                if (properties[name])
                {
                    this[name](options[name]);
                }
            }
        }
    };



    function define(self, name, defaultValue) {

        return self.defineProperty(name, defaultValue, {

            set: function (value) {

                this.rendered && this.renderer.set(this, name, value);
            }
        });
    };


    function update_data() {

        var grid = this.grid;

        if (grid)
        {
            grid.refresh(true);
        }
    };


    function update_all() {

        var grid = this.grid;

        if (grid)
        {
            grid.__columns.dirty = true;
            grid.refresh(true);
        }
    };



    //列类型
    this.type = '';


    //绑定的字段名
    this.defineProperty('name', '', { set: update_data });


    //标题 值为数组则为多行标题
    this.defineProperty('title', null, { 
        
        set: function (value) {

            this.__set_title(value);
            this.rendered && this.renderer.set(this, 'title', value);
        }
    });


    //对齐方式
    //left
    //center
    //right
    define(this, 'align', 'left');


    //列大小(支持固定数字及百分比)
    define(this, 'size', '100');


    //是否只读
    define(this, 'readonly', false);


    //是否可调整列宽
    define(this, 'resizable', true);


    //是否可点击列头排序
    this.defineProperty('sortable', true);


    //格式化
    this.defineProperty('formatter', null, { set: update_data });


    //汇总设置
    //count:    计数
    //max:      最大值
    //min:      最小值
    //average:  平均值
    //sum:      总数
    //custom:   自定义
    this.defineProperty('summary', '', { set: update_data });


    //自定义单元格渲染
    this.onrender = null;



    this.__set_title = function (title) {

        var cells = this.cells;

        cells.length = 0;
        cells.span = false;

        if (title instanceof Array)
        {
            for (var i = 0, l = title.length; i < l; i++)
            {
                this.__create_header(cells, title[i]);
            }
        }
        else
        {
            this.__create_header(cells, title);
        }
    };


    this.__create_header = function (cells, title) {

        var text, size, span, name;

        if (title && typeof title === 'object')
        {
            text = title.text;
            size = title.size | 0;
            span = title.span | 0;
            
            if (name = title.className)
            {
                name = ' ' + name;
            }

            if (span > 0)
            {
                cells.span = true;
            }
        }
        else
        {
            text = title;
        }

        cells.push({

            text: text == null ? '' : text, 
            size: size > 0 ? size : 0, 
            span: span > 0 ? span : 0,
            className: name
        });
    };



    //绑定表格列渲染器
    this.rendered = flyingon.renderer.bind(this, 'GridColumn');



});



//重载扩展表格类的方法
flyingon.GridColumn.extend = function (type, fn) {

    if (type && fn)
    {
        var any = flyingon.GridColumn.all || (flyingon.GridColumn.all = flyingon.create(null));
        return any[type] = flyingon.defineClass(this, fn);
    }
};



//行号列
flyingon.GridColumn.extend('no', function (base) {

});



//选择列
flyingon.GridColumn.extend('check', function (base) {

});



//检查框列
flyingon.GridColumn.extend('checkbox', function (base) {

});



//文本框列
flyingon.GridColumn.extend('textbox', function (base) {

});



//下拉框列
flyingon.GridColumn.extend('combobox', function (base) {

});



//日期列
flyingon.GridColumn.extend('date', function (base) {


});



//时间列
flyingon.GridColumn.extend('time', function (base) {


});



//表格列集合
flyingon.GridColumns = Object.extend(function () {


    this.init = function (grid) {

        this.grid = grid;
        this.locked = [0, 0, 0, 0];
    };

    

    flyingon.fragment('f-collection', this);


    this.__check_items = function (index, items, start) {

        var Class = flyingon.GridColumn,
            columns = Class.all,
            grid = this.grid,
            end = items.length,
            any;

        while (start < end)
        {
            any = items[start];

            if (any instanceof Class)
            {
                if (any.grid)
                {
                    any.remove();
                }
            }
            else
            {
                items[start] = any = new Class(any);
            }

            any.grid = grid;
            start++;
        }

        this.dirty = true;
        grid.refresh(true);
    };


    this.__remove_items = function (index, items) {

        var grid = this.grid,
            item;

        for (var i = 0, l = items.length; i < l; i++)
        {
            item = items[i];
            item.grid = null;

            if (item.rendered)
            {
                grid.renderer.__remove_column(grid, item);
            }
        }

        this.dirty = true;
        grid.refresh(true);
    };



    //计算可见列索引范围
    this.visibleRange = function (x, width) {

        var locked = this.locked,
            start = locked[0],
            end = this.length - locked[1],
            column,
            left,
            right = x + width - locked[2] - locked[3];

        this.arrangeLeft = x;

        //计算可见列
        for (var i = start; i < end; i++)
        {
            column = this[i];
            left = column.left;

            if (left > right)
            {
                end = i;
                break;
            }

            if (left < x && start < i)
            {
                start = i;
            }
        }

        this.start = start;
        this.end = end;
    };


    //计算列宽
    this.compute = function (width) {

        var locked = this.locked,
            start = locked[0],
            end = this.length,
            width = 0,
            mod = 0,
            any;

        this.arrangeWidth = width;
        this.dirty = false;

        //计算前锁定
        if (start > 0)
        {
            mod = compute_size(this, 0, start, mod);
            width += (locked[2] = this.width);
        }

        //计算后锁定
        if ((any = locked[1]) > 0)
        {
            mod = compute_size(this, end - any, end, mod);
            end -= any;

            width += (locked[3] = this.width);
        }

        //计算滚动区
        compute_size(this, start, end, mod);

        this.width += width;
    };


    //计算列大小
    function compute_size(columns, start, end, mod) {

        var left = 0,
            width = 0,
            span = -1,
            column,
            size,
            any;

        while (start < end)
        {
            column = columns[start];

            column.absoluteIndex = start++;
            column.offset = 0; //前置偏移

            size = (column.__storage || column.__defaults).size;
            
            if (size >= 0)
            {
                size |= 0;
            }
            else if ((size = parseFloat(size)) > 0)
            {
                any = size * width / 100;
                size = any | 0;

                if ((any -= size) > 0 && (mod += any) >= 1)
                {
                    mod--;
                    size++;
                }
            }

            column.left = left;
            column.width = size;

            left += size;
            width += size;

            //检测是否需要跨列处理
            if (span < 0 && (any = column.cells).span)
            {
                span = start - 1;
            }
        }

        //记录宽度和
        columns.width = width;

        //处理跨列
        if (span >= 0)
        {
            start = span;

            while (start < end)
            {
                if ((any = columns[start].cells) && any.span)
                {
                    compute_span(columns, start, end, any);
                }

                start++;
            }
        }

        return mod;
    };


    //计算跨列
    function compute_span(columns, index, end, cells) {

        for (var i = cells.length - 1; i >= 0; i--)
        {
            var cell = cells[i],
                span = cell.span,
                column,
                width;

            if (span > 0)
            {
                width = columns[index].width;

                while (span > 0 && index + span < end && (column = columns[index + span])) //计算到结束位置则提前终止
                {
                    if (column.offset < span)
                    {
                        column.offset = span;
                    }

                    width += column.width;
                    span--;
                }

                cell.width = width;
            }
        }
    };



    //绑定渲染器
    flyingon.renderer.bind(this, 'GridColumns');



});



//表格行集片段
flyingon.fragment('f-grid-rows', function () {


    flyingon.fragment(this, 'f-collection');


    this.__check_items = function (index, items, start) {

    };


    this.__remove_items = function (index, items) {

    };


});



//表格行
flyingon.GridRow = Object.extend._(function () {

    
    
    //所属表格
    this.grid = null;
    
    //上级行
    this.parent = null;
    
    //是否选择
    this.selected = false;
    
    //是否勾选
    this.checked = false;
    
    //是否展开
    this.expanded = false;

    //单元格集合
    this.cells = null;


    //获取行级别
    this.level = function () {

        var parent = this.parent,
            level = 0;

        while (parent)
        {
            level++;
            parent = parent.parent;
        }

        return level;
    };


    
    //扩展表格行集功能
    flyingon.fragment(this, 'f-grid-rows');



    //获取指定索引行或行记录数
    this.rows = function (index) {

        var rows = this.__rows,
            row,
            any;

        if (index >= 0)
        {
            if (row = rows[index])
            {
                return row;
            }

            if ((any = this.row) && (any = any[index]))
            {
                row = new flyingon.TreeGridRow();
                row.parent = this;
                row.row = any;
                row.data = any.data;

                return row;
            }
        }

        return rows.length;
    };
    

    //展开当前行
    this.expand = function () {

    };


    //收拢当前行
    this.collapse = function () {

    };

    
});



//表格视图
flyingon.GridView = Object.extend(function () {


    this.init = function (grid) {

        this.grid = grid;
        this.locked = [0, 0];
    };


    //扩展表格行集功能
    flyingon.fragment(this, 'f-grid-rows');


});



//表格分组视图
flyingon.GroupGridView = flyingon.GridView.extend(function (base) {


});



//表格基类
flyingon.BaseGrid = flyingon.Control.extend(function (base) {



    this.init = function () {

        this.__columns = new flyingon.GridColumns(this);
        this.__rows = new flyingon.GridView(this);
    };



    this.defaultWidth = 600;

    this.defaultHeight = 300;


    this.defaultValue('border', 1);




    //表格列
    this.defineProperty('columns', null, {

        fn: function (value) {

            var columns = this.__columns;

            if (value >= 0)
            {
                return columns[value];
            }

            if (value)
            {
                if (typeof value === 'string')
                {
                    value = flyingon.parseJSON(value);
                }

                if (value instanceof Array)
                {
                    columns.push.apply(columns, value);
                }
                else
                {
                    columns.push(value);
                }

                if (this.rendered)
                {
                    columns.dirty = true;
                    this.refresh(true);
                }
                
                return this;
            }

            return columns;
        }
    });



    //列头大小
    this.defineProperty('header', 30, {

        set: function (value) {

            if (this.rendered)
            {
                this.renderer.set(this, 'header', value);
                this.refresh(true);
            }
        }
    });


    //行高
    this['row-height'] = this.defineProperty('rowHeight', 28, {

        set: function () {

            this.refresh(true);
        }
    });


    //是否只读
    this.defineProperty('readonly', true);


    //锁定 锁定多个方向可按 left->right->top->bottom 顺序以空格分隔
    this.defineProperty('locked', '', {

        set: function (value) {

            var x = this.__columns.locked,
                y = this.__rows.locked;

            x[0] = x[1] = x[2] = x[3] = y[0] = y[1] = 0;

            if (value && (value = value.match(/\d+/g)))
            {
                x[0] = value[0] | 0;
                x[1] = value[1] | 0;

                y[0] = value[2] | 0;
                y[1] = value[3] | 0;
            }

            if (this.rendered)
            {
                this.__columns.dirty = true;
                this.refresh(true);
            }
        }
    });



    //选择模式
    //0  仅选择单元格
    //1  选择行
    //2  选择列
    //3  选择行及列
    this['selected-mode'] = this.defineProperty('selectedMode', 0);


    //延迟加载时默认行数
    this['lazy-load'] = this.defineProperty('lazyLoad', 0);


    
    //获取指定索引行或行记录数
    this.rows = function (index) {
        
        var rows = this.__rows,
            row;

        if (index >= 0)
        {
            if (row = rows[index])
            {
                return row;
            }

            return this.__init_row(rows, index);
        }

        return rows.length;
    };


    this.__init_row = function (rows, index) {


    };



    //刷新表格
    this.refresh = function (delay) {

        if (this.rendered)
        {
            var patch = this.__view_patch;

            if (!patch || patch.refresh === void 0)
            {
                this.renderer.set(this, 'refresh', true);
            }

            if (patch)
            {
                delete patch.refresh;
            }

            if (!delay)
            {
                this.update();
            }
        }
        
        return this;
    };



});



// //表格控件
// flyingon.BaseGrid.extend('Grid', function (base) {



// }).register();



//数据表格控件
flyingon.BaseGrid.extend('DataGrid', function (base) {



    //数据集
    this.defineProperty('dataset', null, {

        fn: function (value) {

            var oldValue = this.__dataset || null;

            if (value === void 0)
            {
                return oldValue;
            }

            if (oldValue === value)
            {
                return this;
            }

            if (this.__watch_list && flyingon.__do_watch(this, name, value) === false)
            {
                return this;
            }

            this.__dataset = value;

            //

            return this;
        }
    });


    //分组设置
    this.defineProperty('group', '', {


    });


    //树表列
    this.defineProperty('treeField', '', {
        
    });



    this.__init_row = function (rows, index) {

        var row, any;

        if ((any = this.__dataset) && (any = any[index]))
        {
            row = new flyingon.GridRow();
            row.row = any;
            row.data = any.data;

            return row;
        }
    };



}).register();




// //竖向表格控件
// flyingon.BaseGrid.extend('VerticalGrid', function (base) {


//     //数据集
//     this.defineProperty('dataset', null);


// });