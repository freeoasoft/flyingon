flyingon.GridColumn = Object.extend(function () {



    this.init = function (options) {

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



    function define(self, name, defaultValue, attributes) {

        switch (attributes)
        {
            case 1:
                attributes = function () {

                    var grid = this.grid;

                    if (grid)
                    {
                        grid.refresh(true);
                    }
                };
                break;

            case 2:
                attributes = function () {

                    var grid = this.grid;

                    if (grid)
                    {
                        grid.__columns.dirty = true;
                        grid.refresh(true);
                    }
                };
                break;

            case 3:
                attributes = function () {

                    var grid = this.grid;

                    if (grid && grid.rendered)
                    {
                        grid.renderer.set(grid, '__column_' + name);
                    }
                };
                break;
        }

        attributes = { set: attributes };

        return self.defineProperty(name, defaultValue, attributes);
    };



    //列类型
    this.type = '';


    //绑定的字段名
    define(this, 'name', '', 1);


    //标题 值为数组则为多行标题
    define(this, 'title', null, 3);


    //对齐方式
    //left
    //center
    //right
    define(this, 'align', 'left', 1);


    //列大小
    define(this, 'size', 100, 3);


    //列宽是否百分比
    define(this, 'persent', false, 3);


    //是否只读
    define(this, 'readonly', false, 1);


    //是否可调整列宽
    define(this, 'resizable', true, 3);


    //是否可点击列头排序
    define(this, 'sortable', true);


    //是否可操作列
    define(this, 'operate', true);


    //格式化
    define(this, 'formatter', null, 1);


    //汇总设置
    //count:    计数
    //max:      最大值
    //min:      最小值
    //average:  平均值
    //sum:      总数
    //custom:   自定义
    define(this, 'summary', '', 1);



    //渲染列头
    this.render_header = function (title) {

        return title;
    };


    //渲染单元格
    this.render_cell = function (value, text) {


    };


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
    };

    

    flyingon.fragment('f.collection', this);


    this.__check_items = function (items, start, index) {

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

            any.grid = this;
            start++;
        }

        this.dirty = true;
        grid.refresh(true);
    };


    this.__remove_items = function (items) {

        var grid = this.grid,
            item;

        for (var i = 0, l = items.length; i < l; i++)
        {
            item = items[i];
            item.grid = null;

            if (item.rendered)
            {
                grid.renderer.__remove_column(item);
            }
        }

        this.dirty = true;
        grid.refresh(true);
    };



    //计算列宽
    this.compute = function (width) {

        var locked = this.grid.__locked,
            start = locked[0],
            end = this.length - locked[1],
            x = 0,
            left = 0,
            sum = 0,
            mod,
            any;

        this.arrangeWidth = width;
        this.dirty = false;

        this.locked1 = 0; //前锁定宽度

        for (var i = 0, l = this.length; i < l; i++)
        {
            var column = this[i],
                storage = column.__storage || column.__defaults;
            
            column.absoluteIndex = i;

            if (i === start)
            {
                this.locked1 = left;
                left = 0;
            }
            else if (i === end)
            {
                left = 0;
            }

            any = storage.size;

            if (storage.persent)
            {
                mod = any * width / 100;
                any = mod | 0;

                if ((mod -= any) > 0 && (sum += mod) >= 1)
                {
                    sum--;
                    any++;
                }
            }

            column.left = left;
            column.width = any;

            x += any;
            left += any;
        }

        this.locked2 = locked[1] ? left : 0; //后锁定宽度 
        this.width = x; //总宽
        this.scroll = x > width; //是否有水平滚动条
    };


    //计算可见列索引范围
    this.visibleRange = function (x, width) {

        var locked = this.grid.__locked,
            start = locked[0],
            end = this.length - locked[1],
            right = x + width - this.locked1 - this.locked2,
            column,
            left;

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

            if (left + column.width < x)
            {
                start = i;
            }
        }

        this.start = start;
        this.end = end;
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



//表格基类
flyingon.BaseGrid = flyingon.Control.extend(function (base) {



    this.init = function () {

        this.__columns = new flyingon.GridColumns(this);
        this.__rows = [];
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


    this.__locked = [0, 0, 0, 0];

    //锁定 锁定多个方向可按 left->right->top->bottom 顺序以空格分隔
    this.defineProperty('locked', '', {

        set: function (value) {

            if (value && (value = value.match(/\d+/g)))
            {
                value = [value[0] | 0, value[1] | 0, value[2] | 0, value[3] | 0];
            }
            else
            {
                value = [0, 0, 0, 0]
            }

            this.__locked = value;

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