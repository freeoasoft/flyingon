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
                        grid.__column_dirty = true;
                        grid.refresh(true);
                    }
                };
                break;

            case 3:
                attributes = function (value) {

                    var grid = this.grid;

                    if (grid && grid.hasRender)
                    {
                        grid.renderer.set(grid, '__column_' + name, value);
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
    define(this, 'align', '', 3);


    //列宽
    define(this, 'width', 100, 3);


    //列宽是否百分比
    define(this, 'persent', false, 3);


    //是否可见
    define(this, 'visible', true, 3);


    //是否只读
    define(this, 'readonly', false, 3);


    //是否可调整列宽
    define(this, 'resizable', true, 3);


    //是否可点击列头排序
    define(this, 'sortable', true);


    //是否可操作列
    define(this, 'operate', true);


    //排序显示
    //none:  不显示
    //asc:   显示升序
    //desc:  显示降序
    define(this, 'sort', 'none', 1);


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


});



//重载扩展表格类的方法
flyingon.GridColumn.extend = function (type, fn) {

    if (type && fn)
    {
        var any = flyingon.GridColumn.all || (flyingon.GridColumn.all = flyingon.create(null));

        any = any[type] = flyingon.defineClass(this, fn);
        any.renderer = flyingon.GridColumn_renderer(type);

        return any;
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


    this.__insert_items = function (items, index, fn) {

        var Class = flyingon.GridColumn,
            columns = Class.all,
            grid = this.grid,
            length = items.length,
            any;

        while (index < length)
        {
            any = items[index];

            if (any instanceof Class)
            {
                if (any.grid)
                {
                    any.remove();
                }
            }
            else
            {
                items[index] = any = new Class(any);
            }

            any.grid = this;
            index++;
        }

        any = fn.apply(this, items);

        grid.__column_dirty = true;
        grid.refresh(true);

        return any;
    };


    this.__remove_items = this.__remove_item = function (items) {

        var grid = this.grid;

        grid.__column_dirty = true;
        grid.refresh(true);
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



    function define(self, name, defaultValue, attributes) {

        switch (attributes)
        {
            case 1:
                attributes = function () {

                    this.refresh(true);
                };
                break;

            case 2:
                attributes = function () {

                    this.__column_dirty = true;
                    this.refresh(true);
                };
                break;
        }

        attributes = { set: attributes };

        return self.defineProperty(name, defaultValue, attributes);
    };


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

                return this;
            }

            return columns;
        }
    });



    //列头大小
    define(this, 'header', 30);


    //行高
    define(this, 'rowHeight', 28);


    //是否只读
    this.defineProperty('readonly', true);


    //锁定 锁定多个方向可按 top->right-bottom-left 顺序以空格分隔
    this.defineProperty('locked', '');



    //选择模式
    //0  仅选择单元格
    //1  选择行
    //2  选择列
    //3  选择行及列
    define(this, 'selectedMode', 0);


    //分页模式
    //none:     不分页
    //scroll:   不分页,滚动加载
    //number:   数字页码
    define(this, 'pagination', 'none');


    
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


    //计算列宽
    this.__compute_columns = function (columns, width) {

        var size = 0,
            persent = 0;

        for (var i = columns.length - 1; i >= 0; i--)
        {
            var column = columns[i],
                storage = column.__storage || column.__defaults;
            
            if (storage.persent)
            {
                persent += storage.width;
            }
            else
            {
                size += storage.width;
            }
        }

        if (persent > 0)
        {
            size += persent * width | 0;
        }

        return size;
    };



    //刷新表格
    this.refresh = function (delay) {

        if (this.hasRender && this.__visible)
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