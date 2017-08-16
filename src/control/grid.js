flyingon.GridColumn = Object.extend(function () {



    var defineProperty = this.defineProperty;



    this.init = function (options) {

        if (options)
        {
            for (var name in options)
            {
                var fn = this[name];

                if (typeof fn === 'function')
                {
                    fn.call(this, options[name]);
                }
            }
        }
    };



    this.defineProperty = function (name, defaultValue, attributes) {

        if (attributes !== void 0)
        {
            switch (attributes)
            {
                case 1:
                    attributes = function () {

                        var grid = this.grid;

                        if (grid)
                        {
                            grid.refresh(false, true);
                        }
                    };
                    break;

                case 2:
                    attributes = function () {

                        var grid = this.grid;

                        if (grid)
                        {
                            grid.refresh(true, true);
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
        }

        return defineProperty.call(this, name, defaultValue, attributes);
    };



    //列类型
    this.type = '';


    //绑定的字段名
    this.defineProperty('name', '', 1);


    //标题 值为数组则为多行标题
    this.defineProperty('title', null, 3);


    //对齐方式
    this.defineProperty('align', '', 3);


    //列宽
    this.defineProperty('width', 100, 3);


    //列高
    this.defineProperty('height', 20, 3);


    //是否可见
    this.defineProperty('visible', true, 3);


    //是否只读
    this.defineProperty('readonly', false, 3);


    //是否可调整列宽
    this.defineProperty('resizable', true, 3);


    //是否可排序
    this.defineProperty('sortable', true);


    //是否可操作列
    this.defineProperty('operate', true);


    //是否降序排列
    this.defineProperty('desc', false, 1);


    //格式化
    this.defineProperty('formatter', null, 1);


    //汇总设置
    //count:    计数
    //max:      最大值
    //min:      最小值
    //average:  平均值
    //sum:      总数
    //custom:   自定义
    this.defineProperty('summary', '', 1);


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



//表格行
flyingon.GridRow = Object.extend._(function () {

    
    
    //所属表格
    this.grid = null;
    
    
    //是否选择
    this.selected = false;
    
    //是否勾选
    this.checked = false;
    
    

    //获取单元格
    this.cells = function (index) {

        return index !== void 0 ? this.__cells[index] : this.__cells;   
    };
    
    
    
});



//表格基类
flyingon.BaseGrid = flyingon.Control.extend(function (base) {



    var defineProperty = this.defineProperty;



    this.init = function () {

        this.__columns = [];
        this.__rows = [];
    };



    this.defineProperty = function (name, defaultValue, attributes) {

        if (attributes !== void 0)
        {
            switch (attributes)
            {
                case 1:
                    attributes = function () {

                        this.refresh(false, true);
                    };
                    break;

                case 2:
                    attributes = function () {

                        this.refresh(true, true);
                    };
                    break;
            }

            attributes = { set: attributes };
        }

        return defineProperty.call(this, name, defaultValue, attributes);
    };


    //表格列
    this.defineProperty('columns', null, {

        fn: function (value) {

            return value !== void 0 ? this.__columns : this.__columns[index];
        }
    });


    //行高
    this.defineProperty('rowHeight', 28);


    //是否只读
    this.defineProperty('readonly', true);


    //前面锁定列数
    this.defineProperty('lockedBefore', 0);


    //后面锁定列数
    this.defineProperty('lockedAfter', 0);


    //列头高
    this.defineProperty('headerHeight', 30);


    //选择模式
    //0  仅选择单元格
    //1  选择行
    //2  选择列
    //3  选择行及列
    this.defineProperty('selectedMode', 0);


    //分页模式
    //none:     不分页
    //scroll:   不分页,滚动加载
    //number:   数字页码
    this.defineProperty('pagination', 'none');


    
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
    this.refresh = function (all, delay) {

        if (this.hasRender && this.__visible)
        {
            var patch = this.__view_patch;

            if (!patch || patch.refresh === void 0)
            {
                this.renderer.set(this, 'refresh', all || false);
            }
            else if (all)
            {
                patch.refresh = true;
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



//表格控件
flyingon.BaseGrid.extend('Grid', function (base) {



}).register();



//数据表格控件
flyingon.BaseGrid.extend('DataGrid', function (base) {



    //数据集
    this.defineProperty('dataset', null);


    //分组设置
    this.defineProperty('group', '', {


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



//树表行
flyingon.TreeGridRow = Object.extend._(flyingon.GridRow, function (base) {



    this.parent = null;


    this.expanded = false;


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
    

    this.expand = function () {

    };


    this.collapse = function () {

    };


});



//树表控件
flyingon.BaseGrid.extend('TreeGrid', function (base) {


    //数据集
    this.defineProperty('dataset', null);



    this.__init_row = function (rows, index) {

        var row, any;

        if ((any = this.__dataset) && (any = any[index]))
        {
            row = new flyingon.TreeGridRow();
            row.row = any;
            row.data = any.data;

            return row;
        }
    };


    this.expand = function () {

    };


    this.collapse = function () {

    };



}).register();



//竖向表格控件
flyingon.BaseGrid.extend('VerticalGrid', function (base) {


    //数据集
    this.defineProperty('dataset', null);


});