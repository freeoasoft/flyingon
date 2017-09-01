flyingon.GridColumn = Object.extend(function () {



    var Class = flyingon.Label;

    var create = flyingon.create;



    this.init = function (options) {

        //列头控件集合
        this.__cells = [];

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



    //列类型
    this.type = '';


    //绑定的字段名
    this.defineProperty('name', '', { 
        
        set: function () {

            var grid = this.grid;
               
            if (grid && grid.rendered)
            {
                grid.__columns.__keys = null;
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
                if (any = this.__cells)
                {
                    any._ = any.slice(0);
                    any = any.__span;
                }

                this.__set_title(value);

                if (any = this.grid)
                {
                    //原来有跨列可现在有跨列则需重计算列
                    any.update(any > 0 || this.__cells.__span > 0);
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


    //是否可调整列宽
    this.defineProperty('resizable', true);


    //是否可点击列头排序
    this.defineProperty('sortable', true);


    //是否可拖动调整顺序
    this.defineProperty('draggable', true);


    //过滤方式
    this.defineProperty('filter', 'auto');


    //汇总设置
    //MAX:      最大值
    //MIN:      最小值
    //AVG:      平均值
    //SUM:      求和
    this.defineProperty('summary', '', { 
        
        set: function update() {

            var grid = this.grid;

            if (grid && grid.rendered)
            {
                grid.__summary_list = this.__summary_fn = null;
                grid.update(false);
            }
        }
    });


    //汇总数字精度
    this.defineProperty('precision', 0);



    this.__set_title = function (title) {

        var cells = this.__cells;

        cells.length = 0;
        this.__span = false;

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

        var control, size, span;

        if (title && typeof title === 'object')
        {
            size = title.size | 0;
            span = title.span | 0;

            if (control = title.control)
            {
                control = flyingon.ui(control);
            }
            else
            {
                title = title.text;
            }
        }
        
        if (!control)
        {
            control = new Class();
            (control.__storage = create(control.__defaults)).text = '' + title;
        }

        if (size > 0)
        {
            control.__height = size;
        }

        if (span > 0)
        {
            control.__span = span;
            this.__span = true;
        }

        cells.push(control);
    };


    this.__find_text = function () {

        var title = this.title(),
            any;

        if (title && typeof title === 'object')
        {
            if (title instanceof Array)
            {
                if ((any = title[0]) && any.__span)
                {
                    return any && any.text || any;
                }

                any = title[title.length - 1];
                return any && any.text || any;
            }
            
            return title.text;
        }

        return title;
    };


    this.__span_size = function (count) {

        var columns = this.grid.__columns,
            index = this.absoluteIndex,
            size = 0,
            column;

        while (count > 0 && (column = columns[index + count]))
        {
            size += column.__size;
            count--;
        }

        return size;
    };


    //创建单元格控件
    this.__create_control = function (row) {

        var control = new Class(),
            storage = this.__storage,
            name = storage && storage.name;

        storage = control.__storage = create(control.__defaults);
        storage.text = name ? row.data[name] : '';

        return control;
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



//定义或获取表格汇总函数
flyingon.summary_fn = (function () {
    

    var keys = flyingon.create(null);


    function fn(type, fn, summary) {

        //不区分大小写
        type = type.toLowerCase();

        if (typeof fn === 'function')
        {
            keys[type] = [fn, summary];
        }
        else
        {
            return keys[type] || keys.sum;
        }
    };


    fn('sum', function (row, name) {

        var value = 0,
            any;

        for (var i = row.length - 1; i >= 0; i--)
        {
            if ((any = row[i]) && (any = any.data))
            {
                value += any[name];
            }
        }

        return value;
    });


    fn('avg', keys.sum[0], function (row, name, value) {

        return value / row.total;
    });


    fn('max', function (row, name) {

        var value = -Infinity,
            any;

        for (var i = row.length - 1; i >= 0; i--)
        {
            if ((any = row[i]) && (any = any.data) && (any = any[name]) > value)
            {
                value = any;
            }
        }

        return value;
    });


    fn('min', function fn(row, name) {

        var value = Infinity,
            any;

        for (var i = row.length - 1; i >= 0; i--)
        {
            if ((any = row[i]) && (any = any.data) && (any = any[name]) < value)
            {
                value = any;
            }
        }

        return value;
    });


    return fn;

})();



//表格列集合
flyingon.GridColumns = Object.extend(function () {


    this.init = function (grid) {

        this.grid = grid;
        this.__locked = [0, 0, 0, 0];
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
                items[start] = any = new (any && columns[any.type] || Class)(any);
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
                item.renderer.unmount(item);
            }
        }

        grid.rendered && grid.update(true);
    };



    //计算可见列索引范围
    this.__compute_visible = function (x, scroll) {

        var locked = this.__locked,
            start = locked[0],
            end = this.length - locked[1],
            column,
            left,
            any;

        this.__arrange_start = x;

        x += locked[2];

        //计算开始位置
        for (var i = start; i < end; i++)
        {
            if ((column = this[i]) && column.__visible && column.__start + column.__size >= x)
            {
                start = i;
                break;
            }
        }

        //计算结束位置
        any = x + this.__arrange_size - locked[2] - locked[3];

        for (var i = start; i < end; i++)
        {
            if ((column = this[i]) && column.__visible && column.__start > any)
            {
                end = i + 1;
                break;
            }
        }

        //记录可见范围
        this.__visible_start = start;
        this.__visible_end = end;

        //滚动时如果未超出上次渲染范围则返回true
        if (scroll && this.__show_start <= start && this.__show_end >= end)
        {
            return true;
        }

        //多渲染部分列以减少滚动处理
        any = end + 8;
        end = this.length - locked[1];
        end = any > end ? end : any;

        //处理跨列偏移
        start -= this[start].__offset; 

        if (any = this.grid.oncolumnstart)
        {
            any = any.call(this.grid, this, start);

            if (any >= 0)
            {
                start = any;
            }
        }

        this.__show_start = start;
        this.__show_end = end;
    };


    //计算列宽
    this.__compute_size = function (width) {

        var locked = this.__locked,
            group = this.grid.__group_size, //分组偏移大小
            size = group,
            mod = 0,
            start = locked[0],
            end = this.length,
            any;

        this.__arrange_size = width;
        this.__persent = false;

        //计算前锁定
        if (start > 0)
        {
            mod = compute_size(this, width, group, 0, start, mod);

            group = 0;
            size += (locked[2] = this.__size);
        }

        //计算后锁定
        if ((any = locked[1]) > 0)
        {
            mod = compute_size(this, width, 0, end - any, end, mod);
            end -= any;

            size += (locked[3] = this.__size);
        }

        //计算滚动区
        compute_size(this, width, group + locked[2], start, end, mod);

        this.__size += size;
    };


    //计算列大小
    function compute_size(columns, total, left, start, end, mod) {

        var width = 0,
            span = -1,
            persent,
            column,
            size,
            any;

        while (start < end)
        {
            column = columns[start];

            column.absoluteIndex = start++;
            column.__offset = 0; //前置偏移

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
                persent = true;

                any = size * total / 100;
                size = any | 0;

                if ((any -= size) > 0 && (mod += any) >= 1)
                {
                    mod--;
                    size++;
                }
            }

            column.__start = left;
            column.__size = size;

            left += size;
            width += size;

            //检测是否需要跨列处理
            if (span < 0 && column.__span)
            {
                span = start - 1;
            }
        }

        //记录宽度和
        columns.__size = width;

        //处理跨列
        if (span >= 0)
        {
            start = span;

            while (start < end)
            {
                column = columns[start];

                if (column.__span)
                {
                    compute_span(columns, start, end, column.__cells);
                }

                start++;
            }
        }

        if (persent)
        {
            columns.__persent = true;
        }

        return mod;
    };


    //计算跨列
    function compute_span(columns, index, end, cells) {

        for (var i = cells.length - 1; i >= 0; i--)
        {
            var cell = cells[i],
                span = cell.__span,
                count = span, //实际跨列数
                column,
                size;

            if (span > 0)
            {
                size = columns[index].__size;

                while (span > 0) //计算到结束位置则提前终止
                {
                    if (index + span < end && (column = columns[index + span]))
                    {
                        if (column.__offset < span)
                        {
                            column.__offset = span;
                        }

                        if (column.__visible)
                        {
                            size += column.__size;
                        }
                    }
                    else
                    {
                        count--;
                    }

                    span--;
                }

                cell.__size = size;
            }

            //实际跨列数
            cell.columnSpan = count;
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


});




//表格行共用功能片段
flyingon.fragment('f-grid-row', function () {



    //所属表格
    this.grid = null;


    //子行数
    this.length = 0;



    //在指定位置插入新表格行
    this.insert = function (index, parent) {

    };


    //展开当前行
    this.expand = function () {

    };


    //收拢当前行
    this.collapse = function () {

    };

    
 
    //销毁
    this.dispose = function (deep) {

        var list, cell;

        this.grid = null;

        if (deep !== false)
        {
            for (var i = this.length - 1; i >= 0; i--)
            {
                this[i].dispose();
            }
        }

        if (list = this.__cells)
        {
            for (var i = list.length - 1; i >= 0; i--)
            {
                if ((cell = list[i]) && cell.view)
                {
                    cell.renderer.unmount(cell);
                }
            }
        }
    };



});



//表格行
flyingon.GridRow = Object.extend._(function () {

    

    //上级行
    this.parent = null;
        
    //行数据
    this.data = null;

    //是否展开
    this.expanded = false;

    //是否选择
    this.selected = false;
    
    //是否勾选
    this.checked = false;
    


    flyingon.fragment('f-grid-row', this);



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



    flyingon.renderer.bind(this, 'GridRow');

    
});



//分组行
flyingon.GroupGridRow = Object.extend._(function (base) {


    //分组行标记
    this.__group_row = true;


    //上级行
    this.parent = null;
        
    //行数据
    this.data = null;
    

    //分组列名
    this.name = '';

    //行级别
    this.level = 0;


    //总子项数(含子项的子项)
    this.total = 0;


    //是否展开
    this.expanded = false;



    flyingon.fragment('f-grid-row', this);



    //计算汇总信息
    this.compute = function (column, name, fn, summary) {

        var data = this.data,
            any;

        if (data && name in data)
        {
            any = data[name];
        }
        else if ((any = this.length) > 0)
        {
            if (this[0].__group_row)
            {
                for (var i = 0; i < any; i++)
                {
                    this[i].compute(column, name, fn);
                }
            }

            (data || (this.data = {}))[name] = any = fn(this, name);
        }
        else
        {
            any = 0;
        }
        
        return summary ? summary(this, name, any) : any;
    };

    

    flyingon.renderer.bind(this, 'GroupGridRow');


});



//表格视图
flyingon.GridView = Object.extend(function () {



    var create = Object.create;



    //view: 视图,未分组时等于物理行集
    this.init = function (grid) {

        this.grid = grid;
        this.view = this;
    };



    flyingon.fragment('f-grid-row', this);



    //标记分组变更
    this.__group_dirty = function () {

        var view = this.view;

        this.view = this.visual = null;

        if (view !== this)
        {
            this.__group = view;
        }
    };


    //获取当前视图
    this.current = function () {

        return this.visual || this.view || this.__init_view();
    };



    //初始化视图
    this.__init_view = function () {

        var grid = this.grid,
            any;

        if (any = this.__group)
        {
            this.__group = null;
            
            for (var i = any.length - 1; i >= 0; i--)
            {
                any[i].dispose(false);
            }
        }

        if ((any = grid.groups()) && (any = any.match(/\w+/g)))
        {
            any = this.group(any);
        }
        else
        {
            any = this;
        }

        return this.view = any;
    };


    //分组
    this.group = function (groups) {

        var view;

        if (this.length > 0)
        {
            view = group_rows(flyingon.GroupGridRow, this.grid, null, this, groups, 0, 0);
        }

        return this.view = view || [];
    };


    function group_rows(Class, grid, parent, rows, groups, index, level) {

        var view = [],
            name = groups[index++],
            keys = group_data(rows, name),
            next = groups[index],
            row;

        for (var key in keys)
        {
            rows = keys[key];

            row = new Class();
            row.grid = grid;
            row.parent = parent;
            row.name = name,
            row.text = key;
            row.level = level;
            row.total = rows.length;
            
            if (next)
            {
                rows = group_rows(Class, grid, row, rows, groups, index, level + 1);
            }

            view.push.apply(row, rows);
            view.push(row);
        }

        return view;
    };


    function group_data(rows, name) {

        var keys = create ? create(null) : {},
            row,
            data,
            key;

        for (var i = 0, l = rows.length; i < l; i++)
        {
            if ((row = rows[i]) && (data = row.data))
            {
                (keys[key = data[name]] || (keys[key] = [])).push(row);
            }
        }

        return keys;
    };



    //从dataset加载数据行
    this.dataset = function (dataset) {

        var Class = flyingon.GridRow,
            grid = this.grid;

        if (this.length > 0)
        {
            this.splice(0);
        }

        for (var i = 0, l = this.length = dataset.length; i < l; i++)
        {
            var gr = this[i] = new Class(),
                dr = dataset[i];

            gr.grid = grid;
            gr.data = dr.data;
            gr.rowId = dr.uniqueId; 
        }
    };



});



//表格控件
flyingon.Control.extend('Grid', function (base) {



    this.init = function () {

        this.__columns = new flyingon.GridColumns(this);
        this.__view = new flyingon.GridView(this);
    };



    this.defaultWidth = 800;

    this.defaultHeight = 300;


    this.defaultValue('border', 1);



    //默认锁定行
    this.__locked_top = this.__locked_bottom = 0;


    //列位置或顺序已经变更
    this.__column_dirty = true;


    //分组偏移
    this.__group_size = 0;



    //表格列
    this.defineProperty('columns', null, {

        fn: function (value) {

            var columns = this.__columns;

            if (value === void 0)
            {
                return columns;
            }

            if (value >= 0)
            {
                return columns[value];
            }

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
            
            return this;
        }
    });


    //分组框高度
    this.defineProperty('group', 0, {

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


    //过滤栏高度
    this.defineProperty('filter', 0, {

        set: function (value) {

            if (this.rendered)
            {
                this.renderer.set(this, 'filter', value);
                this.update(false);
            }
        }
    });


    //锁定 锁定多个方向可按 left->right->top->bottom 顺序以空格分隔
    this.defineProperty('locked', '', {

        set: function (value) {

            var locked = this.__columns.__locked;

            locked[0] = locked[1] = locked[2] = locked[3] = 
            this.__locked_top = this.__locked_bottom = 0;

            if (value && (value = value.match(/\d+/g)))
            {
                locked[0] = value[0] | 0;
                locked[1] = value[1] | 0;

                this.__locked_top = value[2] | 0;
                this.__locked_bottom = value[3] | 0;
            }

            this.rendered && this.update(true);
        }
    });


    //行高
    this['row-height'] = this.defineProperty('rowHeight', 25);


    //分组设置
    this.defineProperty('groups', '', {

        check: function (value) {
        
            return value && value.match(/\w/) ? value : ''
        },

        set: function (value) {

            this.__set_groups(value);
            this.rendered && this.update(true);
        }
    });


    this.__set_groups = function (value) {

        this.__view.__group_dirty(value);
        this.__group_dirty = true;
        this.__group_size = value && (value = value.match(/\w+/g)) && value.length * 20 || 0;
    };


    //是否只读
    this.defineProperty('readonly', true);


    //选择模式
    //0  仅选择单元格
    //1  选择行
    //2  选择列
    //3  选择行及列
    this['selected-mode'] = this.defineProperty('selectedMode', 0);



    //树表列
    this['tree-column'] = this.defineProperty('treeColumn', '', {
        

    });



    //数据集
    this.defineProperty('dataset', null, {

        fn: function (value) {

            var any = this.__dataset || null;

            if (any === void 0)
            {
                return any;
            }

            if (any === value)
            {
                return this;
            }

            if (this.__watch_list && flyingon.__do_watch(this, 'dataset', value) === false)
            {
                return this;
            }

            this.__dataset = value;

            if (any) 
            {
                any.subscribe(this, true);
            }

            if (value) 
            {
                value.subscribe(this);
            }

            this.__view.dataset(value);

            return this;
        }
    });



    //调整列顺序
    this.__reorder_column = function (newIndex, oldIndex, count) {

        var list = this.__columns,
            splice = [].splice,
            any;

        any = splice.call(list, oldIndex, count || (count = 1));

        if (any[0])
        {
            if (newIndex > oldIndex)
            {
                newIndex -= count;
            }

            if (any[1])
            {
                any.unshift(newIndex, 0);
                splice.apply(list, any);
            }
            else
            {
                splice.call(list, newIndex, 0, any[0]);
            }

            //调整行的单元格顺序
            if ((list = this.__view) && (list = list.view))
            {
                reorder_column(list, oldIndex, newIndex, count, splice);
            }
        }
    };


    //调整数据行的列顺序
    function reorder_column(rows, oldIndex, newIndex, count, splice) {

        var row, cells, any;

        for (var i = rows.length - 1; i >= 0; i--)
        {
            if (row = rows[i])
            {
                if (cells = row.__cells)
                {
                    any = splice.call(cells, oldIndex, count);

                    if (any[0])
                    {
                        if (any[1])
                        {
                            any.unshift(newIndex, 0);
                            splice.apply(cells, any);
                        }
                        else
                        {
                            splice.call(cells, newIndex, 0, any[0]);
                        }
                    }
                }

                if (any = row.__rows)
                {
                    reorder_column(any, oldIndex, newIndex, count, splice);
                }
            }
        }
    };

    
    //获取指定索引行或行集合
    this.rows = function (index) {
        
        var view = this.__view;

        view = view.view || view.__init_view();

        if (index === void 0)
        {
            return view;
        }

        return view[index] || null;
    };



    //刷新表格
    this.update = function (change) {

        if (this.rendered)
        {
            var patch = this.__view_patch;

            if (change)
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



}).register();