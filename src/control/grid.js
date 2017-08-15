flyingon.defineClass('GridColumn', function () {



    this.init = function (column) {

        if (column)
        {
            for (var name in column)
            {
                var value = column[name];

                if (typeof value !== 'function')
                {
                    this[name] = value;
                }
            }
        }
    };



    //所属表格控件
    this.grid = null;


    //绑定的字段名
    this.name = '';


    //数据类型
    this.type = 'string';


    //标题 值为数组则为多行标题
    this.title = ''; 


    //对齐方式
    this.align = '';


    //列宽
    this.size = 100;


    //是否可见
    this.visible = true;


    //是否只读
    this.readonly = false;


    //是否可调整列宽
    this.resizable = true;


    //是否可排序
    this.sortable = true;


    //是否降序排列
    this.desc = false;


    //是否可操作列
    this.operate = true;


    //格式化
    this.formatter = null;



    this.$set = this.set = function (name, value) {

        var grid = this.grid,
            any;

        this[name] = value;

        if (grid && grid.hasRender)
        {
            
        }
    };


});




flyingon.defineClass('GridColumns', function () {



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

        
    };


    this.__remove_item = function (item) {

        
    };


});




flyingon.defineClass('GridRow', function () {

    
    
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
    
    
}, false);




flyingon.Control.extend('Grid', function (base) {


    this.init = function () {

        (this.__storage = flyingon.create(this.__defaults)).columns = new flyingon.GridColumns();
    };


    //表格列
    this.defineProperty('columns', null);


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



});




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




flyingon.GridRow.extend('TreeGridRow', function (base) {



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



flyingon.Grid.extend('TreeGrid', function (base) {



    this.childrenClass = flyingon.TreeGridRow;


    this.expand = function () {

    };


    this.collapse = function () {

    };


});