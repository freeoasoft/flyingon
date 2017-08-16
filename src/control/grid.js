flyingon.defineClass('GridColumn', function () {



    var defineProperty = this.defineProperty;



    this.init = function (grid) {

        this.grid = grid;
    };



    this.defineProperty = function (name, defaultValue, attributes) {

        attributes === void 0 && (attributes = {

            set: function (value) {

                var grid = this.grid;

                if (grid && grid.hasRender)
                {
                    grid.renderer.set(grid, 'column.' + name, value);
                }
            }
        });

        return defineProperty.call(this, name, defaultValue, attributes);
    };


    //绑定的字段名
    this.defineProperty('name', '', { 
        
        set: function () {

            var grid = this.grid;
            grid && grid.refresh(true);
        }
        
     });


    //标题 值为数组则为多行标题
    this.defineProperty('title', null);


    //对齐方式
    this.defineProperty('align', '');


    //列宽
    this.defineProperty('size', 100);


    //是否可见
    this.defineProperty('visible', true);


    //是否只读
    this.defineProperty('readonly', false);


    //是否可调整列宽
    this.defineProperty('resizable', true);


    //是否可排序
    this.defineProperty('sortable', true);


    //是否降序排列
    this.defineProperty('desc', false);


    //是否可操作列
    this.defineProperty('operate', true);


    //格式化
    this.defineProperty('formatter', null, {
        
        set: function () {

            var grid = this.grid;
            grid && grid.refresh(true);
        }
        
     });


});




flyingon.GridColumns = Object.extend(function () {



    this.init = function (grid) {

        this.grid = grid;
    };



    flyingon.fragment('f.collection', this);


    this.__insert_items = function (items, index, fn) {
    
        var Class = flyingon.GridColumn,
            grid = this.grid,
            length = items.length,
            any;

        while (index < length)
        {
            (items[index] = new Class(items[index++])).grid = grid;
        }

        return fn.apply(this, items);
    };


    this.__remove_items = function (items) {

        if (items)
        {
            for (var i = items.length - 1; i >= 0; i--)
            {
                items[i].grid = null;
            }

            this.grid.refresh(true);
        }
    };


    this.__remove_item = function (item) {

        if (item)
        {
            item.grid = null;
            this.grid.refresh(true);
        }
    };



});




flyingon.GridRow = Object.extend(function () {

    
    
    //所属表格
    this.grid = null;
    
    //数据行唯一id
    this.uniqueId = null;
                 
    
    //是否选择
    this.selected = false;
    
    //是否勾选
    this.checked = false;
    
    
    //是否展开
    this.expanded = false;
    
    
});




flyingon.BaseGrid = flyingon.defineClass(flyingon.Control, function (base) {


    this.init = function () {

        this.__columns = new flyingon.GridColumns();
    };


    //表格列
    this.defineProperty('columns', null, {

        fn: function (value) {

            var columns = this.__columns;

            if (value)
            {
                if (columns.length > 0)
                {
                    columns.clear();
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
            }

            return this.__columns;
        }
    });


    //行高
    this.defineProperty('rowHeight', 28);


    //延迟加载最大行数
    this.defineProperty('maxDelayRows', 0);


    //数据集
    this.defineProperty('dataset', null);


    //是否只读
    this.defineProperty('readonly', true);


    //前部锁定列数
    this.defineProperty('lockedBefore', 0);


    this.defineProperty('lockedAfter', 0);


    //列头高
    this.defineProperty('headerHeight', 30);


    //是否自动选择当前行
    this.defineProperty('autoCurrentRow', true);


    //是否自动选择当前列
    this.defineProperty('autoCurrentColumn', false);



    //扩展行集功能
    flyingon.fragment('f.rows', this, flyingon.GridRow);



    //刷新表格
    this.refresh = function (reset) {

        if (this.hasRender && this.__visible)
        {
            var patch = this.__view_patch;

            if (!patch || !patch.refresh)
            {
                this.renderer.set(this, 'refresh', reset || false);
            }
            else if (reset)
            {
                patch.refresh = true;
            }
        }
        
        return this;
    };



});




flyingon.BaseGrid.extend('Grid', function (base) {



}).register();




flyingon.fragment('f.rows', function (childrenClass) {



    flyingon.fragment('f.collection', this, childrenClass);


    this.__insert_items = function (items, index, fn) {
    
        var Class = this.childrenClass,
            grid = this.grid,
            length = items.length,
            any;

        while (index < length)
        {
            items[index] = any = new Class(items[index++]);
            
            if (grid)
            {
                any.parent = this;
                any.grid = grid;
            }
            else
            {
                any.grid = this;
            }
        }

        return fn.apply(this, items);
    };


    this.__remove_items = function (items) {

        
    };


    this.__remove_item = function (item) {

        
    };


});




flyingon.TreeGridRow = flyingon.GridRow.extend(function (base) {



    this.childrenClass = flyingon.TreeGridRow;


    this.parent = null;


    this.collapsed = true;


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


    //扩展行集功能
    flyingon.fragment('f.rows', this, flyingon.TreeGridRow);


    this.expand = function () {

    };


    this.collapse = function () {

    };


});



flyingon.BaseGrid.extend('TreeGrid', function (base) {



    this.childrenClass = flyingon.TreeGridRow;


    this.expand = function () {

    };


    this.collapse = function () {

    };



}).register();