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

                this.view && this.renderer.set(this, name, value);
            }
        });
    };


    function update_data() {

        var grid = this.grid;

        if (grid && grid.rendered)
        {
            grid.update(false);
        }
    };


    function update_all() {

        var grid = this.grid;

        if (grid && grid.rendered)
        {
            grid.update(true);
        }
    };



    //列类型
    this.type = '';


    //绑定的字段名
    this.defineProperty('name', '', { 
        
        set: function () {

            var grid = this.grid;
               
            this.__keys = null;

            if (grid && grid.rendered)
            {
                grid.update(false);
            }
        }
    });


    //标题 值为数组则为多行标题
    this.defineProperty('title', null, { 
        
        set: function (value) {

            var any;

            if (this.view)
            {
                this.view = false;

                //记录原单元格
                if (any = this.cells)
                {
                    any._ = any.slice(0);
                }

                this.__set_title(value);

                //如果原来跨列或现在跨列,需重新计算跨列
                if (any = this.grid)
                {
                    any.update(true);
                }
            }
            else
            {
                this.__set_title(value);
            }
        }
    });


    //列大小(支持固定数字及百分比)
    this.defineProperty('size', '100', {

        set: function (value) {

            var grid;
            
            if (this.view && (grid = this.grid))
            {
                grid.update(true);
            }
        }
    });


    //对齐方式
    //left
    //center
    //right
    define(this, 'align', 'left');


    //是否可调整列宽
    define(this, 'resizable', true);


    //是否只读
    define(this, 'readonly', false);


    this.__visible = true;

    //是否显示
    this.defineProperty('visible', true, {

        set: function (value) {

            var grid = this.grid;

            this.__visible = value;

            if (grid && grid.rendered)
            {
                grid.update(true);
            }
        }
    });


    //是否可点击列头排序
    this.defineProperty('sortable', true);


    //是否可拖动
    this.defineProperty('draggable', true);


    //格式化
    this.defineProperty('formatter', null, { set: update_data });


    //过滤方式
    this.defineProperty('filter', 'auto');


    //汇总设置
    //count:    计数
    //max:      最大值
    //min:      最小值
    //average:  平均值
    //sum:      总数
    //custom:   自定义
    this.defineProperty('summary', '', { set: update_data });


    //汇总信息是否显示在汇总行
    this.defineProperty('summaryRow', false, { set: update_data });



    //自定义单元格渲染
    this.onrender = null;



    this.__set_title = function (title) {

        var cells = this.cells;

        cells.length = 0;
        cells.span = 0;

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

            if (span > cells.span)
            {
                cells.span = span;
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
            count: span > 0 ? span : 1,
            className: name
        });
    };



    //绑定表格列渲染器
    flyingon.renderer.bind(this, 'GridColumn');



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

        this.__keys = null;

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

        grid.rendered && grid.update(true);
    };


    this.__remove_items = function (index, items) {

        var grid = this.grid,
            item;

        this.__keys = null;

        for (var i = 0, l = items.length; i < l; i++)
        {
            item = items[i];
            item.grid = null;

            if (item.view)
            {
                this.renderer.unmount(item);
            }
        }

        grid.rendered && grid.update(true);
    };



    //计算可见列索引范围
    this.__compute_visible = function (x) {

        var locked = this.locked,
            start = locked[0],
            end = this.length - locked[1],
            column,
            left,
            right;

        if (x == null)
        {
            x = this.arrangeLeft;
        }
        else
        {
            this.arrangeLeft = x;
        }

        right = x + this.arrangeWidth - locked[2] - locked[3];

        //计算可见列
        for (var i = start; i < end; i++)
        {
            if ((column = this[i]) && column.__visible)
            {
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
        }

        this.start = start;
        this.end = end;
    };


    //计算列宽
    this.__compute_size = function (width) {

        var locked = this.locked,
            start = locked[0],
            end = this.length,
            size = 0,
            mod = 0,
            any;

        if (width != null)
        {
            this.arrangeWidth = width;
        }

        //计算前锁定
        if (start > 0)
        {
            mod = compute_size(this, 0, start, mod);
            size += (locked[2] = this.width);
        }

        //计算后锁定
        if ((any = locked[1]) > 0)
        {
            mod = compute_size(this, end - any, end, mod);
            end -= any;

            size += (locked[3] = this.width);
        }

        //计算滚动区
        compute_size(this, start, end, mod);

        this.width += size;
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

            if (!column.__visible)
            {
                continue;
            }

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
                count = span + 1, //包含列数
                column,
                width;

            if (span > 0)
            {
                width = columns[index].width;

                while (span > 0) //计算到结束位置则提前终止
                {
                    if (index + span < end && (column = columns[index + span]))
                    {
                        if (column.offset < span)
                        {
                            column.offset = span;
                        }

                        if (column.__visible)
                        {
                            width += column.width;
                        }
                    }
                    else
                    {
                        count--;
                    }

                    span--;
                }

                cell.width = width;
            }

            cell.count = count;
        }
    };


    //缓存列名
    function cache_name(columns) {

        var keys = columns.__keys = flyingon.create(null),
            index = 0,
            column,
            any;

        while (column = columns[index++])
        {
            if ((any = column.__storage) && (any = any.name))
            {
                keys[any] = column;
            }
        }

        return keys;
    };


    //查找指定名称的表格列
    this.find = function (name) {

        return (this.__keys || cache_name(this))[name];
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


    //表格列是否需要更新
    this.__column_dirty = false;

    //表格行更新方式
    //0 不需要更新
    //1 需要处理过滤栏
    //2 需要处理分组栏
    //4 需要处理汇总栏
    this.__row_dirty = 0;



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

                this.rendered && this.update(true);
 
                return this;
            }

            return columns;
        }
    });


    //分组框大小
    this.defineProperty('groupbox', 0, {

        set: function (value) {

            var patch;

            if (value > 0)
            {
                this.__group_dirty = true;
            }

            if (this.rendered && (!(patch = this.__view_patch) || !patch.header))
            {
                this.renderer.set(this, 'header', 1);
                this.update(false);
            }
        }
    });


    //列头大小
    this.defineProperty('header', 30, {

        set: function (value) {

            if (this.rendered)
            {
                this.renderer.set(this, 'header', 2);
                this.update(false);
            }
        }
    });


    //是否显示过滤栏
    this.defineProperty('filter', false);


    //行高
    this['row-height'] = this.defineProperty('rowHeight', 28, {

        set: function () {

            this.update(false);
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

            this.rendered && this.update(true);
        }
    });



    //选择模式
    //0  仅选择单元格
    //1  选择行
    //2  选择列
    //3  选择行及列
    this['selected-mode'] = this.defineProperty('selectedMode', 0);



    
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
    this.update = function (column_dirty) {

        if (this.rendered)
        {
            var patch = this.__view_patch;

            if (column_dirty)
            {
                this.__column_dirty = true;
            }

            if (!patch || !patch.content)
            {
                this.renderer.set(this, 'content', true);
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



    //分组设置
    this.defineProperty('group', '', {

        set: function (value) {

            this.__group_dirty = true;
            this.__row_dirty = 2;
            this.rendered && this.update(false);
        }
    });


    //分组时是否显示汇总行
    this.defineProperty('summary', false, {

        set: function (value) {

            this.__row_dirty = 2;
            this.rendered && this.update(false);
        }
    });



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



    //延迟加载时默认行数
    this['lazy-load'] = this.defineProperty('lazyLoad', 0);



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