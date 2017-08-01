//表格列基类
$class('GridColumn', function () {

    
    
    //更新表格头
    var update_header = { set: 'this.grid.renderDelay();' };
    
    //更新数据
    var update_body = { set: 'this.grid.renderDelay(false);' };
    
    
    
    //列类型
    this.type = '';

    
    //绑定的字段名
    this.defineProperty('fieldName', '', update_body);

    //数据类型
    this.defineProperty('dataType', 'string', update_body);

    //标题 值为数组则为多行标题
    this.defineProperty('title', '', update_header); 

    //对齐方式
    this.defineProperty('align', '', update_header);

    //列宽(水平绘制时有效)
    this.defineProperty('width', 100, {
     
        set: 'this.grid.renderDelay();'
    });
    
    //列高(竖直绘制时有效)
    this.defineProperty('height', '100', {
     
        set: 'this.grid.renderDelay();'
    });

    //单元格class
    this.defineProperty('cellClass', '', update_header);

    //是否可见
    this.defineProperty('visible', true, update_header);

    //是否只读
    this.defineProperty('readonly', false, update_body);

    //是否可调整列宽
    this.defineProperty('resizable', true, update_header);

    //是否可排序
    this.defineProperty('sortable', true, update_header);

    //是否降序排列
    this.defineProperty('desc', false, update_header);

    //是否可操作列
    this.defineProperty('showOperate', true, update_header);

    //格式化
    this.defineProperty('formatter', null, update_header);

    
    //left
    this.left = 0;

    //列索引
    this.index = -1;

    //是否选择
    this.selected = false;



    //渲染列头
    this.renderHeader = function (writer, columns, index, left, headerHeight) {

        var storage = this.__storage,
            title = storage.title || '',
            top = 0,
            width = storage.width,
            height = headerHeight;

        this.left = left;
        this.renderIndex = index;

        //渲染多行列
        if (typeof title !== 'string' && title.length > 1)
        {
            top = render_multi(this, title, writer, columns, headerHeight);
            height -= top;
            title = title[title.length - 1];
        }

        if (storage.visible)
        {
            if (width > 0 && height > 0)
            {
                title = this.titleText = this.headerText(title && title.text || title);
                render_header(this, writer, title, top, width, height);
            }

            if (storage.resizable)
            {
                writer.push('<div class="f-Grid-resize-column" style="position:absolute;overflow:hidden;z-index:1;background-color:transparent;width:5px;cursor:col-resize;left:',
                    this.left + width - 3,
                    'px;height:' + headerHeight,
                    'px;" column-index="' + index,
                    '"></div>');
            }

            return width;
        }

        return 0;
    };

    
    //渲染多行列
    function render_multi(target, list, writer, columns, headerHeight) {

        var top = 0,
            length = list.length,
            size = headerHeight / (length--) | 0,
            storage,
            item,
            column,
            text,
            width,
            height,
            columnSpan;
        
        for (var i = 0; i < length; i++)
        {
            if ((item = list[i]) != null)
            {
                if (typeof item === 'string')
                {
                    text = item;
                    height = size;
                }
                else
                {
                    text = item.text;
                    height = item.height || size;
                }
                
                if (text != null)
                {
                    storage = target.__storage;
                    width = storage.visible ? storage.width : 0;

                    if ((columnSpan = item.columnSpan) > 1)
                    {
                        for (var j = 1; j < columnSpan; j++)
                        {
                            if ((column = columns[target.renderIndex + j]) && 
                                (storage = column.__storage) && storage.visible)
                            {
                                width += storage.width;
                            }
                        }
                    }

                    if (width > 0 && height > 0)
                    {
                        text = target.headerText(text, item);
                        render_header(target, writer, text, top, width, height, columnSpan);
                    }
                }
            }

            top += height;
        }

        return top;
    };


    function render_header(target, writer, text, top, width, height, columnSpan) {

        var storage = target.__storage,
            index = target.renderIndex;

        writer.push('<div class="f-Grid-hcell ',
            storage.selected ? 'f-Grid-column-selected ' : '',
            '" style="position:absolute;overflow:hidden;margin:0;border-left:0;border-top:0;left:',
            target.left, 'px;top:',
            top, 'px;width:',
            width, 'px;height:',
            height, 'px;line-height:',
            height, 'px;',
            '" column-index="', index + '"',
            columnSpan > 1 ? ' column-end="' + (index + columnSpan - 1) + '"' : '',
            '>',
            text,
            '</div>');
    };


    //获取列头内容
    this.headerText = function (text, multi) {

        return text || '';
    };


    //渲染列内容
    this.renderBody = function (writer, columns, row, fn, end) {

        var cell = this.renderCell(row),
            text = typeof cell === 'string' ? cell : cell && cell.text;
        
        renderBody(this, writer, columns, cell, row);
        
        if (fn)
        {
            fn(writer, this, row, text);
        }
        else if (text)
        {
            writer.push(text);
        }
        
        if (end !== false)
        {
            writer.push('</div>');
        }
    };


    function renderBody(target, writer, columns, cell, row) {

        var storage = target.__storage,
            className = 'f-Grid-cell',
            width = storage.width,
            height = row.height,
            attribute = ' column-index="' + target.renderIndex + '" row-index="' + row.renderIndex + '"',
            zIndex,
            style,
            any;

        if (any = storage.cellClass)
        {
            className += ' ' + any;
        }

        if (row.checked)
        {
            className += ' f-Grid-row-checked';
        }

        if (row.selected)
        {
            className += ' f-Grid-row-selected';
        }

        if (storage.selected)
        {
            className += ' f-Grid-column-selected';
        }

        if (cell != null)
        {
            if (typeof cell === 'object')
            {
                if (any = cell.className)
                {
                    className += ' ' + any;
                }

                if ((any = cell.rowSpan) > 1)
                {
                    attribute += ' column-end="' + (target.renderIndex + any - 1) + '"';

                    height *= any;
                    zIndex = 1;
                }

                if ((any = cell.columnSpan) > 1)
                {
                    attribute += ' row-end="' + (row.renderIndex + any - 1) + '"';

                    width = target.columnWidth(columns, any);
                    zIndex = 1;
                }

                if (any = cell.attribute)
                {
                    attribute += ' ' + cell.attribute;
                }

                style = cell.style;
            }
        }
        else
        {
            style = 'visibility:hidden;';
        }

        writer.push('<div class="', className,
            '" style="left:', target.left,
            'px;top:', row.top,
            'px;width:', width,
            'px;height:', height,
            'px;line-height:', height,
            'px;',
            (any = storage.align) ? 'text-align:' + any + ';' : '',
            zIndex ? 'z-index:1;' : '',
            style || '',
            '"',
            attribute, 
            '>');
    };


    //渲染单元格
    this.renderCell = function (row) {

        var storage = this.__storage,
            formatter = storage.formatter,
            value = row.dataRow.get(storage.fieldName) || '';

        if (typeof formatter === 'function')
        {
            return formatter.call(this, value, row, this);
        }

        return value || '';
    };


    //获取排序函数
    this.sort = function (desc) {

        var storage = this.__storage,
            name = storage.fieldName,
            value1 = desc ? 'row2' : 'row1',
            value2 = desc ? 'row1' : 'row2',
            data;

        if (name)
        {
            value1 += '.data.' + name;
            value2 += '.data.' + name;

            if (storage.dataType === 'number')
            {
                data = 'return ' + value1 + ' - ' + value2 + ';';
            }
            else
            {
                data = 'var value1 = ' + value1 + ', value2 = ' + value2 + ';\n'
                    + 'if (value1 == value2) return 0;\n'
                    + 'return value1 > value2 ? 1 : -1;';
            }

            return new Function(['row1', 'row2'], data);
        }
    };


    //获取指定列后指定行数的总宽度
    this.columnWidth = function (columns, length) {

        var start = this.renderIndex,
            end = start + length,
            width = 0,
            column,
            storage;

        for (var i = start; i < end; i++)
        {
            if ((column = columns[i]) && (storage = column.__storage) && storage.visible)
            {
                width += storage.width;
            }
        }

        return width;
    };

    

    var columns;
    
    this.__class_init = function (Class) {

        if (columns)
        {
            if (this.type)
            {
                columns[this.type] = Class;
            }
            else
            {
                throw $translate('flyingon', 'GridColumn_type_error');
            }
        }
        else
        {
            Class.all = columns = flyingon.create(null);
        }
    };

    

});



//行编号列
$class(flyingon.GridColumn, function (base) {


    //列类型
    this.type = 'rowno';

    
    //默认宽度
    this.defaultValue('width', 25);

    //指定单元格class
    this.defaultValue('cellClass', 'f-Grid-rowno');

    //禁止编辑
    this.defaultValue('readonly', true);

    //禁止可调整列宽
    this.defaultValue('resizable', false);

    //禁止列头排序
    this.defaultValue('sortable', false);

    //禁止可操作列
    this.defaultValue('showOperate', false);

                      
    //是否显示行号
    this.defineProperty('rowno', true);



    this.renderCell = function (row) {

        var storage = this.__storage;
        
        if (storage.rowno)
        {
            var formatter = storage.formatter,
                value = row.renderIndex + 1;

            if (formatter)
            {
                if (formatter === 'tree')
                {
                    value = row.treeIndex;
                }
                else if (typeof formatter === 'function')
                {
                    value = formatter.call(this, value, row, this);
                }
            }

            return value != null ? value : '';
        }

        return '';
    };


});



//选择列
$class(flyingon.GridColumn, function (base) {


    //列类型
    this.type = 'checked';

    
    //默认宽度
    this.defaultValue('width', 25);

    //禁止编辑
    this.defaultValue('readonly', true);

    //禁止可调整列宽
    this.defaultValue('resizable', false);

    //禁止列头排序
    this.defaultValue('sortable', false);

    //禁止可操作列
    this.defaultValue('showOperate', false);

    //指定单元格class
    this.defaultValue('cellClass', 'f-Grid-checked');

    
    //是否显示选中所有
    this.defineProperty('all', false);


    this.headerText = function (title, multi) {

        return !multi && this.__storage.all ? '<input type="checkbox" class="f-gird-checked-all"></input>' : '';
    };


    this.renderCell = function (row) {

        return '<input type="checkbox"' + (row.checked ? ' checked="checked"' : '') + '></input>';
    };


    this.__on_cell_mousedown = function (e, cell) {

        var grid = this.grid,
            view = grid.__view,
            row;

        if (view && e.target.type === 'checkbox' && (row = view[cell.getAttribute('row-index') | 0]))
        {
            var items = view.checkedRows,
                list = view.findRowCells(row),
                className = 'f-Grid-row-checked';

            if (row.checked = !row.checked)
            {
                (items || (view.checkedRows = new Set())).add(row);
                list.addClass(className);
            }
            else
            {
                items && items['delete'](row);
                list.removeClass(className);
            }

            grid.trigger('checkedchange', row, cell);
            return false;
        }
    };

});



//仿excel的分组树列
$class(flyingon.GridColumn, function (base) {


    //列类型
    this.type = 'group';

    
    //默认宽度(收拢时的宽度)
    this.defaultValue('width', 40);

    //指定单元格class
    this.defaultValue('cellClass', 'f-Grid-grouptree');

    //禁止编辑
    this.defaultValue('readonly', true);

    //禁止可调整列宽
    this.defaultValue('resizable', false);

    //禁止列头排序
    this.defaultValue('sortable', false);

    //禁止可操作列
    this.defaultValue('showOperate', false);

                      
    //最大级别
    this.defineProperty('maxLevel', 0);

    //默认展示级别
    this.defineProperty('expandLevel', 0);

    //是否展开
    this.defineProperty('expanded', false);

    //栏位宽度
    this.defineProperty('itemWidth', 16);

    //栏位高度
    this.defineProperty('itemHeight', 16);

    //是否显示行号
    this.defineProperty('rowno', true);

    //行号宽度
    this.defineProperty('rownoWidth', 40);


    this.headerText = function (text, multi) {

        var storage = this.__storage;
        
        if (multi || !storage.expanded)
        {
            return text || '';
        }

        var data = [],
            left = 0,
            width = storage.itemWidth,
            html = '<span class="f-Grid-grouptree-level" style="display:inline-block;width:' + width + 'px;left:';

        for (var i = 1, _ = storage.maxLevel; i <= _; i++)
        {
            data.push(html, left, 'px;">', i, '</span>');
            left += width;
        }

        data.push('<span class="f-Grid-groupno-title" style="display:inline-block;width:', 
            storage.rownoWidth, 
            'px;">', 
            text || '', 
            '</span>');
        
        return data.join('');
    };


    this.renderBody = function (writer, columns, row, fn, end) {

        base.renderBody.call(this, writer, columns, row, fn, false);

        if (this.rowno)
        {
            writer.length--;
            render_rowno.call(this, writer, row);
        }
                    
        if (end !== false)
        {
            writer.push('</div>');
        }
    };


    this.renderCell = function (row) {

        var data = [],
            text1 = '<span class="f-Grid-grouptree-',
            text2 = '" style="display:inline-block;width:' + this.__storage.itemWidth + 'px;height:100%;" no-current="true"',
            target = row,
            any;

        while (any = target.parent)
        {
            data.unshift(text1, 
                'line', 
                ' f-Grid-grouptree-line-last',
                text2,
                '></span>');
            
            target = any;
        }

        if (row.children)
        {
            any = row.expanded ? 'expand' : 'collapse';
            data.push(text1, any, text2, ' tree-', any, '="true"></span>');
        }
        else
        {
            data.push(text1, 'leaf', text2, '></span>');
        }

        return {
            
            text: data.join(''),
            attribute: 'no-current="true"'
        };
    };


    function render_rowno(writer, row) {

        var storage = this.__storage,
            formatter = storage.formatter,
            value;

        if (formatter)
        {
            if (formatter === 'tree')
            {
                value = row.treeIndex;
            }
            else if (typeof formatter === 'function')
            {
                value = formatter.call(this, value, row, this);
            }
        }
        else
        {
            value = row.renderIndex + 1;
        }

        if (value !== null)
        {
            var className = 'f-Grid-groupno',
                style = 'display:inline-block;width:' + storage.rownoWidth + 'px;',
                attribute = '';

            if (storage.expanded)
            {
                className += ' f-Grid-groupno-expand'
            }

            if (typeof value === 'object')
            {
                if (value.className)
                {
                    className += ' ' + value.className;
                }

                if (value.style)
                {
                    style += value.style;
                }

                if (value.attribute)
                {
                    attribute = value.attribute;
                }
            }

            writer.push('<span class="', className,
                '" style="', style, ';"',
                attribute, '>',
                value,
                '</span>');
        }
    };


});


$class('GridRow', function () {

    
    $constructor(function (view, uniqueId) {
      
        this.view = view;
        this.uniqueId = uniqueId;
    });
    
    
    //所属视图
    this.view = null;
    
    //数据行唯一id
    this.uniqueId = null;
                 
    //父表格行
    this.parent = null;


    //子表格行数量
    this.length = 0;
    
    
    //是否选择
    this.selected = false;
    
    //是否勾选
    this.checked = false;
    
    
    //是否展开
    this.expanded = false;
    
    
    
    //获取指定索引的单元格
    this.at = function (index) {
        
    };
    
    
    //获取指定列名的值
    this.get = function (name) {
        
    };
    
    
    //设置指定列名的值
    this.set = function (name, value) {
        
    };
        
    
    
}, false);


//表格视图
$class('GridView', function () {

    
    var DataRow = flyingon.GridRow;
    
    var splice = [].splice;
    var sort = [].sort;

    
    
    //视图类型
    this.type = '';
    
    
    //行高
    this.defineProperty('rowHeight', 28);

    //延迟加载最大行数
    this.defineProperty('maxDelayRows', 0);

    
    //表格行数量
    this.length = 0;
    

    //视图宽度
    this.width = 0;

    //视图高度
    this.height = 0;
    
    
    //当前行索引
    this.rowIndex = 0;
    
    //当前列索引
    this.columnIndex = 0;
    
    
    //选中的表格行
    this.checkRows = null;
    
    
    
    this.init = function (table) {
      
    };
    
    
    //获取指定索引的表格行
    this.at = function (index) {
        
        var row = this[index];
        
        if (row)
        {
            return row;
        }
        
        if (row = this.table[index])
        {
            return this[index] = new DataRow(this, row);
        }
        
        return null;
    };
    
    
    //查找指定位置的表格行
    this.findRowIndex = function (top) {

        return top / this.rowHeight() | 0;
    };


    //排序
    this.sort = function (column, desc) {

        var fn;

        if (column && (fn = column.sort(desc)))
        {
            sort.call(this, fn);
        }
    };


    //渲染
    this.render = function (start, resize) {

        var date = new Date();

        var writer = [],
            grid = this.grid,
            columns = grid.__columns,
            table = this.table,
            head = grid.dom_header,
            body = grid.dom_body,
            storage = this.__storage,
            rowHeight = storage.rowHeight,
            lockedWidth = head.lockedWidth,
            lockedBefore = head.lockedBefore,
            width = head.totalWidth - lockedWidth,
            height = Math.max(storage.maxDelayRows, this.length) * rowHeight,
            scrollTop = grid.dom_vscroll.scrollTop,
            style = 'position:absolute;overflow:hidden;margin:0;border:0;padding:0;top:' + -scrollTop + 'px;height:' + height + 'px;width:';

        //记录视图大小
        this.width = head.totalWidth;
        this.height = height;

        //如果是全局渲染
        if (grid.fullRender())
        {
            start = 0;
            this.end = this.length;
        }
        else
        {
            this.end = this.__render_end(start, scrollTop, grid.clientHeight - head.headerHeight, rowHeight);
        }

        //记录渲染的开始及结束行号
        this.start = start;

        //触发渲染前事件
        grid.trigger('beforerender');

        writer.view = this;
        writer.columns = columns;
        
        writer.push('<div class="f-Grid-scroll" style="', style, width, 'px;left:', lockedWidth - grid.dom_hscroll.scrollLeft, 'px;">');

        this.__render_columns(writer, columns, lockedBefore, columns.length, rowHeight);
        
        writer.push('</div>',
                    '<div class="f-Grid-locked" style="', style, lockedWidth, 'px;z-index:1;">');

        if (lockedBefore > 0)
        {
            this.__render_columns(writer, columns, 0, lockedBefore, rowHeight);
        }

        writer.push('</div>');

        writer.view = writer.columns = null;

        body.style.display = 'none';
        body.innerHTML = writer.join('');

        if (resize)
        {
            body.style.height = height + 'px';
            grid.renderScroll();
        }

        body.style.display = 'block';

        //触发渲染后事件
        grid.trigger('afterrender');

        console.log('render rows: ' + (this.end - start) + ' rows, time:' + (new Date() - date) + 'ms');
    };


    this.__render_end = function (start, top, height, rowHeight) {

        height += (top % rowHeight); //处理开始的行偏移避免有时渲染不出最后一行的问题
        return start + Math.min(this.length - start, Math.ceil(height / rowHeight));
    };


    this.__render_columns = function (writer, columns, start, end, rowHeight) {

        var top = this.start * rowHeight;

        for (var i = this.start, _ = this.end; i < _; i++)
        {
            var row = this[i] || this.at(i);

            row.top = top;
            row.height = rowHeight;
            row.renderIndex = i;

            this.renderRow(writer, row, columns, start, end);

            top += rowHeight;
        }
    };


    //渲染行
    this.renderRow = function (writer, row, columns, start, end) {

        var column, storage;

        for (var i = start; i < end; i++)
        {
            if ((column = columns[i]) && 
                (storage = column.__storage) && 
                storage.visible && 
                storage.width > 0)
            {
                column.renderBody(writer, columns, row);
            }
        }
    };


    //从指定的dom往上查找拥有指定className的dom
    this.findDom = function (dom, className) {

        var name;

        while (dom && dom.nodeType === 1)
        {
            if ((name = dom.className) && name.indexOf(className) >= 0)
            {
                return dom;
            }

            dom = dom.parentNode;
        }
    };


    //查找事件触发的列头单元格
    this.eventHeaderCell = function (event) {

        return this.findDom(event.target, 'f-Grid-hcell');
    };


    //查找事件触发的单元格
    this.eventBodyCell = function (event) {

        return this.findDom(event.target, 'f-Grid-cell');
    };


    //查找单元格
    this.findCell = function (row, column) {

        var list = this.find_row.cells(row),
            index = '' + (column >= 0 ? column : column.renderIndex);

        for (var i = 0, _ = list.length; i < _; i++)
        {
            if (list[i].getAttribute('column-index') === index)
            {
                return list[i];
            }
        }
    };


    //查找指定行索引的单元格
    this.findRowCells = function (row, list) {

        var grid = this.grid,
            start = this.start,
            end = this.end,
            index = row >= 0 ? row : row.renderIndex;

        list = list || new flyingon.NodeList();

        if (index < start || index >= end)
        {
            return list;
        }

        var head = grid.dom_header,
            body = grid.dom_body,
            children = body.children[1].children,
            step = head.locked_visible,
            offset = (index - start) * step;

        for (var i = 0; i < step; i++)
        {
            list.push(children[offset + i]);
        }

        children = body.children[0].children;
        step = head.scroll_visible;
        offset = (index - start) * step;

        for (var i = 0; i < step; i++)
        {
            list.push(children[offset + i]);
        }

        return list;
    };


    //查找指定列索引的单元格
    this.findColumnCells = function (column, list, header, body) {

        var grid = this.grid,
            columns = this.columns,
            head = grid.dom_header,
            index = column >= 0 ? column : column.renderIndex,
            lockedBefore = head.lockedBefore,
            children,
            item,
            any;

        list = list || new flyingon.NodeList();

        if (!(any = columns[index]) || !any.visible || any.width <= 0)
        {
            return list;
        }

        if (header !== false)
        {
            children = grid.dom_header.children[index >= lockedBefore ? 0 : 1].children;
            any = '' + index;

            for (var i = 0, _ = children.length; i < _; i++)
            {
                item = children[i];

                if (item.getAttribute('column-index') === any &&
                    item.className.indexOf('f-Grid-hcell') >= 0)
                {
                    list.push(item);
                }
            }
        }

        if (body !== false)
        {
            var start = index,
                step;

            children = grid.dom_body.children[index >= lockedBefore ? 0 : 1].children;

            for (var i = index - 1; i >= 0; i--)
            {
                if (!(item = columns[i]).visible || item.width <= 0)
                {
                    start--;
                }
            }

            if (index >= lockedBefore)
            {
                start -= lockedBefore;
                step = head.scroll_visible;
            }
            else
            {
                step = head.locked_visible;
            }

            any = children.length;

            while (start < any)
            {
                list.push(children[start]);
                start += step;
            }
        }

        return list;
    };


    //切换当前单元格
    this.changeCurrent = function (cell) {

        var grid = this.grid,
            //style = grid.dom_body.style,
            row1 = this.currentRow,
            row2 = this[cell.getAttribute('row-index') | 0],
            column1 = this.currentColumn,
            column2 = grid.__columns[cell.getAttribute('column-index') | 0],
            any;

        //style.visibility = 'hidden';

        if (column1 !== column2 && grid.autoCurrentColumn())
        {
            any = 'f-Grid-column-selected';

            if (column1)
            {
                column1.selected = false;
                this.findColumnCells(column1).removeClass(any);
            }

            column2.selected = true;

            this.currentColumn = column2;
            this.findColumnCells(column2).addClass(any);
        }

        if (row1 !== row2 && grid.autoCurrentRow())
        {
            any = 'f-Grid-row-selected';

            if (row1)
            {
                row1.selected = false;
                this.findRowCells(row1).removeClass(any);
            }

            row2.selected = true;

            this.currentRow = row2;
            this.findRowCells(row2).addClass(any);
        }

        //style.visibility = '';
    };


    //清除数据行
    this.clear = function () {

        var length = this.length,
            any;

        if (length > 0)
        {
            for (var i = 0; i < length; i++)
            {
                if (any = this[i])
                {
                    this[i] = any.grid = any.data = null;
                }
            }

            splice.call(this, 0, length);

            this.length = this.start = this.end = 0;

            if (any = this.checkedRows)
            {
                any.length = 0;
                this.checkedRows = null;
            }
        }

        this.currentRow = this.currentColumn = null;
    };


    
    var views;
    
    this.__class_init = function (Class) {

        if (views)
        {
            if (this.type)
            {
                views[this.type] = Class;
            }
            else
            {
                throw $translate('flyingon', 'GridView_type_error');
            }
        }
        else
        {
            Class.all = views = flyingon.create(null);
        }
    };


});



//树形表格视图
$class('TreeGridView', flyingon.GridView, function (base) {



    var splice = [].splice;
    var sort = [].sort;

    
    //注册的视图类型
    this.type = 'tree';

    
    //表格行类型
    this.rowType = flyingon.TreeGridRow;
    


    //计算树编号
    this.computeTreeIndex = function () {

        var start = this.start,
            end = this.end,
            index = 1,
            row;

        for (var i = 0; i < start; i++)
        {
            if (row = this[i])
            {
                if (row.expanded || !row.children)
                {
                    index++;
                }
                else
                {
                    index += row.count();
                }
            }
        }

        while (start < end)
        {
            if (row = this[start++])
            {
                row.treeIndex = index;

                if (row.expanded || !row.children)
                {
                    index++;
                }
                else
                {
                    index += row.count();
                }
            }
        }
    };


    this.__render_columns = function (writer, columns, start, end, rowHeight) {

        for (var i = 0, _ = columns.length; i < _; i++)
        {
            if (columns[i].formatter === 'tree')
            {
                this.computeTreeIndex();
                break;
            }
        }

        base.__render_columns.apply(this, arguments);
    };


    this.renderRow = function (writer, row, columns, start, end) {

        var treeFieldName = this.treeFieldName(),
            column,
            storage;

        for (var i = start; i < end; i++)
        {
            if ((column = columns[i]) && 
                (storage = column.__storage) && 
                storage.visible && 
                storage.width > 0)
            {
                column.renderBody(writer, columns, row, treeFieldName === storage.fieldName ? render_tree : null);
            }
        }
    };


    function render_tree(writer, column, row, text) {

        var children = row.children,
            any = row.level;
        
        any = (children ? 0 : 1) + (any > 0 ? any : 0);

        if (any > 0)
        {
            writer.push('<span class="f-Grid-tree-space" style="width:' + (any * 16) + 'px;"></span>');
        }

        if (children)
        {
            any = row.expanded ? 'expand' : 'collapse';
            writer.push('<span class="f-Grid-tree-' + any + '" tree-' + any + '="true" no-current="true"></span>');
        }

        if (any = column.iconClass)
        {
            if (typeof any === 'function')
            {
                any = any.call(column, row.data, row, column) || '';
            }

            if (any)
            {
                writer.push('<span class="f-Grid-tree-icon ' + any + '"></span>');
            }
        }

        writer.push('<span class="f-Grid-tree-cell">' + (text || '') + '</span>');
    };


    //修改竖直滚动条因收拢不足一屏时而造成的位置偏移
    this.fix_vscroll = function () {

        if (this.start > 0)
        {
            var grid = this.grid,
                storage = this.__storage,
                height = Math.max(storage.maxDelayRows, this.length) * storage.rowHeight;

            if (!grid.__check_scroll(this.width, height)[1])
            {
                grid.dom_vscroll.scrollTop = 0;
                return true;
            }
        }
    };


});



//分组视图
$class('GroupGridView', flyingon.GridView, function (base) {
    
    
    this.type = 'group';
    
});


//表格控件
$class('Grid', flyingon.Control, function (base) {


    
    //弹出菜单
    var contextmenu;
    
    //弹出提醒
    var tip; 



    $constructor(function () {

        var self = this,
            dom = this.dom,
            children = dom.children,
            head,
            body,
            hscroll,
            vscroll,
            on = flyingon.dom_on;

        this.dom_back = children[0];
        this.dom_header = head = children[1];
        this.dom_body = body = children[2];
        this.dom_resize = children[3];
        this.dom_end = children[4];
        this.dom_hscroll = hscroll = children[5];
        this.dom_vscroll = vscroll = children[6];
        this.dom_sort = children[7];

        on(head, 'mouseover', function (e) {

            head_mouseover(self, e);
        });

        on(head, 'mousedown', function (e) {

            head_mousedown(self, e);
        });

        on(head, 'click', function (e) {

            head_click(self, e);
        });

        on(head, 'mouseout', function (e) {

            dom_mouseout(self, e, this);
        });

        on(body, 'mouseover', function (e) {

            body_mouseover(self, e);
        });

        on(body, 'mousedown', function (e) {

            body_mousedown(self, e);
        });

        on(body, 'click', function (e) {

            body_click(self, e);
        });

        on(body, 'mouseout', function (e) {

            dom_mouseout(self, e, this);
        });

        on(body, 'keydown', function (e) {

            body_keyup(self, e);
        });

        on(dom, 'mousewheel', function (e) {

            vscroll.scrollTop -= event.wheelDelta || (-event.detail * 40);//鼠标滚轮数据
        });

        on(dom, 'mouseout', function (e) {

            dom_mouseout(self, e, this);
        });

        on(hscroll, 'scroll', function (e) {

            var dom = self.dom_sort;

            head.children[0].style.left = body.children[0].style.left = head.lockedWidth - this.scrollLeft + 'px';

            if (dom.scroll_left >= 0)
            {
                dom.style.left = (dom.offset_left + dom.scroll_left - this.scrollLeft) + 'px';
            }
        });

        on(vscroll, 'scroll', function (e) {

            if (tip)
            {
                tip.close();
            }

            if (self.fullRender()) //全局渲染
            {
                body.children[0].style.top = body.children[1].style.top = -this.scrollTop + 'px';
            }
            else
            {
                self.renderBody();
            }
        });

        if (!tip)
        {
            contextmenu = new flyingon.Popup(false).multi(true).closeAway(true).addClass('f-Grid-contextmenu');
            tip = new flyingon.Popup(false).multi(true).addClass('f-Grid-tip');
        }
    });



    this.createDomTemplate(function () {
        
        var start = '<div class="f-Grid',
            end = '</div>',
            relative = '" style="position:relative;',
            absolute = '" style="position:absolute;',
            style1 = 'overflow:hidden;margin:0;border:0;padding:0;',
            style2 = 'display:none;margin:0;right:0;bottom:0;z-index:1;',
            scroll = '<div style="' + style1 + 'width:1px;height:1px;"></div>',
            width = flyingon.vscroll_width,
            height = flyingon.hscroll_height;
        
        //解决IE7,8点击无法滚动或不出现滚动条的问题
        if (flyingon.ie9)
        {
            width++;
            height++;
        }

        width = 'width:' + width + 'px;';
        height = 'height:' + height + 'px;';       
        
        return new Array(
            
            start, relative, 'overflow:hidden;border-width:1px;">',
                start, '-back"', absolute, 'left:0;top:0;right:0;width:auto;border:0">', end,
                start, '-header"', relative, style1, '">', end,
                start, '-body"', relative, style1, 'outline:none;" tabindex="0">', end,
                start, '-resize"', absolute, style2, 'display:none;height:100%;">', end,
                start, '-end"', absolute, style2, width, height, 'left:auto;top:auto;overflow:scroll;">', end,
                start, '-hscroll', absolute, style2, height, 'width:auto;overflow-x:scroll;overflow-y:hidden;left:0;top:auto;">', scroll, end,
                start, '-vscroll', absolute, style2, width, 'height:auto;overflow-x:hidden;overflow-y:scroll;left:auto;top:0;">', scroll, end,
                start, '-sort"', absolute, style2, '">', end,
            end
            
        ).join('');
        
    }());



    this.defaultValue('border', 1);


    
    //表格列
    this.defineProperty('columns', null, {

        storage: 'this.__columns',
        set: 'this.__init_columns(value);'
    });

    //表格视图
    this.defineProperty('view', null, {

        storage: 'this.__view',
        set: 'this.__init_view(value);'
    });

    //数据集
    this.defineProperty('dataTable', null, {

        storage: 'this.__table',
        set: 'this.__init_table(value, oldValue);'
    });

    //是否只读
    this.defineProperty('readonly', true);

    //前部锁定列数
    this.defineProperty('lockedBefore', 0);

    //列头高
    this.defineProperty('headerHeight', 30);

    //是否自动选择当前行
    this.defineProperty('autoCurrentRow', true);

    //是否自动选择当前列
    this.defineProperty('autoCurrentColumn', false);

    //是否完整渲染(完全渲染时会一次性渲染所有数据)
    this.defineProperty('fullRender', false);

    

    this.__init_columns = function (options) {

        var Class = flyingon.GridColumn,
            list = Class.all,
            columns = [],
            any;

        if (this.__columns)
        {
            this.__dispose_columns();
        }

        for (var i = 0, _ = options.length; i < _; i++)
        {
            if (any = options[i])
            {
                var column = new (list[any.type] || Class)();
                
                column.grid = this;
                column.assign(any, 'type');
                
                columns.push(column);
            }
        }

        (this.__columns = columns).__init = true;
    };
    

    this.__init_view = function (value) {

        var GridView = flyingon.GridView,
            table = this.__table,
            view = this.__view;

        if (view instanceof GridView)
        {
            view.clear();
            view.grid = null;
        }
        
        view = this.__view = new (GridView.all[value && value.type || value] || GridView)();
        view.grid = this;
        view.assign(value, 'type');
        
        if (table)
        {
            init_view(this, table);
        }

        return view;
    };
    
    
    this.__init_table = function (table, oldValue) {
        
        if (table instanceof flyingon.DataTable)
        {
            var self = this,
                id = this.uniqueId;

            if (oldValue)
            {
                oldValue.off(id);
            }
        
            init_view(self);
                
            table.on('load', function () {
               
                init_view(self);
                
            }, id);
        }
        else
        {
            alert($translate('flyingon', 'type error'));
        }
    };
    
    
    function init_view(self, table) {
      
        var view = self.__view,
            length;
        
        if (view)
        {
            if ((length = view.length) > 0)
            {
                Array.prototype.splice.call(view, 0, view.length);
            }
            
            view.table = table;
            view.length = table.length;
            view.init(table);
        }
    };


    
    //检测列操作
    function check_operate(self, e) {

        var dom = self.dom_header.children[2], //ie7下未渲染时dom为空
            view = self.__view,
            cell;

        if (dom && view && e && (cell = view.eventHeaderCell(e)))
        {
            var style = dom.style,
                index = cell.getAttribute('column-index') | 0,
                column = self.__columns[index],
                storage,
                parent;

            if (column && (storage = column.__storage) && storage.showOperate)
            {
                dom.setAttribute('column-index', index);

                parent = cell.parentNode;
                
                style.display = 'block';
                style.top = (cell.offsetTop + 1) + 'px';
                style.left = (parent.parentNode.offsetLeft + parent.offsetLeft + column.left + 2) + 'px';
            }
            else
            {
                style.display = 'none';
            }
        }
    };


    //显示操作指引
    function show_operate(self, e) {

        var columns = self.__columns,
            dom = e.target,
            index = dom.getAttribute('column-index') | 0;

        if (columns && index >= 0)
        {
            var writer = [],
                menu = contextmenu,
                column,
                storage;

            menu.close('auto');

            for (var i = 0, _ = columns.length; i < _; i++)
            {
                if ((column = columns[i]) && (storage = column.__storage) && storage.showOperate)
                {
                    writer.push('<div class="f-Grid-contextmenuitem">',
                        '<input type="checkbox"', 
                        storage.visible ? ' checked="true"' : '',
                        ' column-index="', i, 
                        '"></input>',
                        column.titleText,
                        '</div>');
                }
            }

            menu.dom.innerHTML = writer.join('');
            menu.open(dom);

            dom = menu.dom;

            flyingon.dom_on(dom, 'click', function (e) {

                hide_column(self, e);
            });

            menu.on('closed', function (e, closeType, event) {

                flyingon.dom_off(dom, 'click');
                check_operate(self, event);
            });
        }
    };


    //隐藏表格列
    function hide_column(self, e) {

        var columns = self.__columns,
            index = e.target.getAttribute('column-index'),
            column,
            any,
            visible;

        if (index != null && (column = columns[index | 0]) && (column = column.__storage))
        {
            if (column.visible = e.target.checked)
            {
                visible = true;
            }
            else
            {
                //检测不可隐藏所有列
                for (var i = 0, _ = columns.length; i < _; i++)
                {
                    if ((any = columns[i]) && 
                        (any = any.__storage) && 
                        any.visible && 
                        any.width > 0 && 
                        any.showOperate)
                    {
                        visible = true;
                        break;
                    }
                }
            }

            if (visible)
            {
                self.renderHeader();
                self.renderBody();
                self.renderScroll();
            }
            else
            {
                column.visible = true;
                alert('unable to hide all columns!');
            }
        }
    };


    //处理列头鼠标移入事件
    function head_mouseover(self, e) {

        var name = e.target.className;

        if (name && !self.__column_resize && name.indexOf('f-Grid-operate') < 0)
        {
            check_operate(self, e);
        }
    };


    //处理列头鼠标按下事件
    function head_mousedown(self, e) {

        var name = e.target.className;

        if (name && name.indexOf('f-Grid-resize-column') >= 0)
        {
            var dom = e.dom = self.dom_resize,
                style = dom.style,
                target = e.target,
                parent = target.parentNode,
                column = self.__columns[target.getAttribute('column-index') | 0],
                context = {

                    style: style,
                    grid: self,
                    column: column
                };

            style.left = (parent.parentNode.offsetLeft + parent.offsetLeft + column.left + column.__storage.width - 2) + 'px';
            style.display = 'block';

            flyingon.dom_drag(context, e, null, null, resize_end, 'y', false);
        }
    };


    //停止调整列宽
    function resize_end(e) {

        var self = this.grid,
            column = this.column,
            storage = column.__storage,
            style = this.style,
            distanceX = e.distanceX;

        self.__column_resize = false;
        style.display = 'none';

        if (distanceX)
        {
            if (distanceX < -storage.width)
            {
                distanceX = -storage.width;
            }

            storage.width += distanceX;

            self.renderHeader();
            self.renderBody();
            self.renderScroll();

            //调整滚动条位置
            if (distanceX < 0 && (style = self.dom_hscroll.style).display === 'none')
            {
                //设置滚动位置
                style.display = 'block';
                
                self.dom_hscroll.scrollLeft = 0;
                self.dom_header.children[0].style.left = self.dom_body.children[0].style.left = self.dom_header.lockedWidth + 'px';
            }

            if (self.dom_sort.column_index >= column.renderIndex)
            {
                self.dom_sort.style.left = (self.dom_sort.offset_left += distanceX) + 'px';
            }
        }

        this.grid = this.column = this.style = null;
    };


    //处理列头点击事件
    function head_click(self, e) {

        var name = e.target.className,
            view,
            cell,
            column;

        if (name && name.indexOf('f-Grid-operate') >= 0)
        {
            show_operate(self, e);
        }
        else if ((view = self.__view) &&
            (cell = view.eventHeaderCell(e)) &&
            (cell.getAttribute('column-end') == null) &&
            (column = self.__columns[cell.getAttribute('column-index') | 0]))
        {
            var storage = column.__storage,
                dom = self.dom_sort,
                parent = cell.parentNode,
                style = dom.style,
                any;

            if (storage.sortable && (any = parent.parentNode))
            {
                view.sort(column, storage.desc = !storage.desc);

                style.display = 'block';

                dom.column_index = column.renderIndex;
                dom.offset_left = any.offsetLeft + parent.offsetLeft + column.left + cell.offsetWidth - dom.offsetWidth - 2;

                style.top = (cell.offsetTop + ((cell.offsetHeight - dom.offsetHeight) >> 1)) + 'px';
                style.left = dom.offset_left + 'px';

                dom.className = 'f-Grid-sort f-Grid-' + (storage.desc ? 'desc' : 'asc');

                //如果是滚动列则记下滚动条位置以便拖动时调整偏移
                if (parent && (parent = parent.className) && parent.indexOf('f-Grid-scroll') >= 0)
                {
                    dom.scroll_left = self.dom_hscroll.scrollLeft;
                }
                else
                {
                    dom.scroll_left = -1;
                }

                self.renderBody();
            }
            else
            {
                style.display = 'none';
            }
        }
    };


    //处理表格体鼠标移入事件
    function body_mouseover(self, e) {

        var view = self.__view,
            cell,
            text;

        if (tip)
        {
            tip.close();
        }

        try
        {
            //IE8在滚动鼠标分屏加载时会触发系统异常, 可能IE8的渲染与js执行不是同步的
            if (tip && view && (cell = view.eventBodyCell(e)) &&
                self.trigger('cellmouseover', e, cell) !== false &&
                cell.scrollWidth > cell.clientWidth &&
                (text = cell.textContent || cell.innerText))
            {
                tip.dom['textContent' in cell ? 'textContent' : 'innerText'] = text;
                tip.open(cell, 4);
            }
        }
        catch (e)
        {
        }
    };


    //处理表格体鼠标按下事件
    function body_mousedown(self, e) {

        var view, cell, column;

        if ((e.which === 1 || e.button === 1) &&
            (view = self.__view) &&
            (cell = view.eventBodyCell(e)) &&
            (column = self.__columns[cell.getAttribute('column-index') | 0]))
        {
            if (!e.target.getAttribute('no-current') &&
                (!column.__on_cell_mousedown || column.__on_cell_mousedown(e, cell) !== false))
            {
                view.changeCurrent(cell);
            }
        }
    };


    //处理单元格点击事件
    function body_click(self, e) {

        var view = self.__view,
            cell;

        if (view)
        {
            if (e.target.getAttribute('tree-expand'))
            {
                view.__on_collapse(e);
            }
            else if (e.target.getAttribute('tree-collapse'))
            {
                view.__on_expand(e);
            }
            else if (cell = view.eventBodyCell(e))
            {
                self.trigger('cellclick', e, cell);
            }
        }
    };


    //移动表格行
    function change_row(self, view, offset) {

        var row = view.currentRow,
            index = 0;

        if (row)
        {
            index = row.renderIndex + offset;
        }

        if (index < 0)
        {
            index = 0;
        }
        else if (index >= view.length)
        {
            index = view.length - 1;
        }

        if (!row || index !== row.renderIndex)
        {
            self.currentRow(index);
        }
    };


    //移动表格列
    function change_column(self, view, offset) {

        var column = view.currentColumn,
            index = 0;

        if (column)
        {
            index = column.renderIndex + offset;
        }

        if (index < 0)
        {
            index = 0;
        }
        else if (index >= self.__columns.length)
        {
            index = self.__columns.length - 1;
        }

        if (!column || index !== column.renderIndex)
        {
            self.currentColumn(index);
        }
    };


    //处理表格体keyup事件
    function body_keyup(self, e) {

        var view = self.__view;

        if (view)
        {
            switch (e.which || e.keyCode)
            {
                case 37: //向左
                    change_column(self, view, -1);
                    break;

                case 38: //向上
                    change_row(self, view, -1);
                    break;

                case 9: //tab
                case 39: //向右
                    change_column(self, view, 1);
                    break;

                case 40: //向下
                    change_row(self, view, 1);
                    break;
            }
        }
    };


    //移出表格组件范围时的清理
    function dom_mouseout(self, e, dom) {

        if (self.trigger('cellmouseout', e) !== false)
        {
            var rect = dom.getBoundingClientRect(),
                x = e.clientX,
                y = e.clientY;

            if (x <= rect.left || y <= rect.top || x >= rect.right || y >= rect.bottom)
            {
                if (dom === self.dom_header)
                {
                    dom.children[2].style.display = 'none';
                }
            }
        }
    };


    //获取事件触发相关的表格行
    this.eventRow = function (e) {

        var view = this.__view,
            cell;

        if (view && (cell = view.eventBodyCell(e)))
        {
            return view[cell.getAttribute('row-index') | 0];
        }
    };


    //获取事件触发相关的表格列
    this.eventColumn = function (e) {

        var columns = this.__columns,
            view = this.__view,
            cell;

        if (columns && view && (cell = view.eventBodyCell(e) || view.eventHeaderCell(e)))
        {
            return columns[cell.getAttribute('column-index') | 0];
        }
    };


    //查找列
    this.findColumn = function (filter) {
        
        var columns = this.__columns;
        
        if (columns)
        {
            if (!filter)
            {
                return null;
            }
            
            switch (typeof filter)
            {
                case 'number':
                    return columns[filter | 0] || null;

                case 'string':
                    for (var i = columns.length - 1; i >= 0; i--)
                    {
                        if (columns[i].fieldName === filter)
                        {
                            return columns[i];
                        }
                    }
                    break;

                case 'function':
                    for (var i = columns.length - 1; i >= 0; i--)
                    {
                        if (filter(columns[i]))
                        {
                            return columns[i];
                        }
                    }
                    break;
            }
        }
        
        return null;
    };
    
    
    //添加列
    this.addColumn = function (type, options) {
        
        return this.insertColumn(-1, type, options);
    };
    
    
    //插入列
    this.insertColumn = function (index, type, options) {
        
        var columns = this.__columns || (this.__columns = []),
            Class = flyingon.GridColumn,
            column;
        
        if (type instanceof Class)
        {
            column = type;
        }
        else if (type)
        {
            if (typeof type === 'object')
            {
                options = type;
                type = type.type;
            }
                
            column = new (Class.all[type] || Class)();
            column.assign(options);
        }
        else
        {
            column = new Class();
            column.assign('');
        }
        
        if (index < 0 || index >= columns.length)
        {
            columns.push(column);
        }
        else
        {
            columns.splice(index, 0, column);
        }
        
        return this.renderDelay();
    };
    
    
    //移除列
    this.removeColumn = function (index) {
      
        var columns = this.__columns;
        
        if (columns)
        {
            columns.splice(index.renderIndex || (index | 0), 1);
            this.renderDelay();
        }
        
        return this;
    };
    
    
    
    var render_time = 0;
    
    //延迟绘制表格
    this.renderDelay = function (body) {

        var self = this;
        
        if (render_time)
        {
            clearTimeout(render_time);
        }
        
        render_time = setTimeout(function () {
            
            self.render(body);
            
        }, 20);
        
        return this;
    };
    
    
    //重绘表格
    this.render = function (header) {
    
        var date = new Date();

        base.render.call(this);
        
        //先记录下窗口的大小
        this.clientWidth = this.dom.clientWidth;
        this.clientHeight = this.dom.clientHeight;

        if (header !== false)
        {
            this.renderHeader();
        }
        
        this.renderBody(true);
            
        console.log('update:' + (new Date() - date));
        
        return this;
    };
    
    
    //渲染表头
    this.renderHeader = function () {

        var columns = this.__columns;

        if (columns && columns.length > 0)
        {
            var date = new Date();

            var head = this.dom_header,
                style = head.style,
                lockedBefore = this.lockedBefore(), //锁定列
                totalWidth = 0,
                lockedWidth = 0,
                visible1 = 0,
                visible2 = 0,
                column,
                storage,
                width;

            //计算锁定列宽
            for (var i = 0, _ = columns.length; i < _; i++)
            {
                if ((column = columns[i]) && 
                    (storage = column.__storage) && 
                    (storage.visible && (width = storage.width) > 0))
                {
                    if (i < lockedBefore)
                    {
                        visible1++;
                        lockedWidth += width;
                    }
                    else
                    {
                        visible2++;
                    }

                    totalWidth += width;
                }
            }

            head.locked_visible = visible1; //锁定列可见列数
            head.scroll_visible = visible2; //非锁定列的可见列数

            head.lockedBefore = lockedBefore; //锁定列数
            head.lockedWidth = lockedWidth; //锁定列宽
            head.totalWidth = totalWidth; //滚动列宽

            head.headerHeight = this.headerHeight(); //列头高度

            style.display = 'none';

            //设置总宽高
            style.width = head.totalWidth + 'px';
            style.height = this.dom_back.style.height = head.headerHeight + 'px';

            //渲染列头
            head.innerHTML = head.headerHeight > 0 ? render_header(this, columns) : '';

            style.display = 'block';

            console.log('render columns: ' + columns.length + ' columns, time:' + (new Date() - date) + 'ms');
        }

        return this;
    };

    
    function render_header(self, columns) {

        var writer = [],
            head = self.dom_header,
            lockedBefore = head.lockedBefore,
            lockedWidth = head.lockedWidth,
            headerHeight = head.headerHeight,
            style = 'position:absolute;overflow:hidden;margin:0;border:0;padding:0;height:' + headerHeight + 'px;width:';

        writer.push('<div class="f-Grid-scroll" style="', style, head.totalWidth - lockedWidth, 'px;left:', lockedWidth - self.dom_hscroll.scrollLeft, 'px;">');

        render_columns_header(writer, columns, lockedBefore, columns.length, headerHeight);

        writer.push('</div>',
                    '<div class="f-Grid-locked" style="', style, lockedWidth, 'px;left:0;z-index:1;">');

        if (lockedBefore > 0)
        {
            render_columns_header(writer, columns, 0, lockedBefore, headerHeight);
        }

        writer.push('</div>',
                    '<div class="f-Grid-operate" style="position:absolute;display:none;z-index:1;"></div>');

        return writer.join('');
    };


    function render_columns_header(writer, columns, start, end, headerHeight) {

        var left = 0;

        for (var i = start; i < end; i++)
        {
            left += columns[i].renderHeader(writer, columns, i, left, headerHeight);
        }
    };



    //渲染数据
    this.renderBody = function (resize) {

        var table = this.__table,
            view = this.__view || this.__init_view(),
            start = view.findRowIndex(this.dom_vscroll.scrollTop);

        this.dom_body.style.height = (this.clientHeight - this.dom_header.headerHeight) + 'px';

        if (table)
        {
            //启用了延迟分包加载
            if (view.maxDelayRows() > table.length && start > table.length)
            {
                this.trigger('delayload');
            }
            else
            {
                view.render(start);

                if (resize !== false)
                {
                    this.renderScroll();
                }
            }
        }
        
        return this;
    };


    this.__check_scroll = function (width, height) {

        var head= this.dom_header,
            style1 = head.style,
            style2 = this.dom_body.style,
            clientWidth = this.clientWidth,
            clientHeight = this.clientHeight,
            hscroll = 0,
            vscroll = 0;

        if (width > clientWidth)
        {
            hscroll = flyingon.hscroll_height;
        }

        if (height > clientHeight - head.headerHeight - hscroll)
        {
            vscroll = flyingon.vscroll_width;

            if (width > clientWidth - vscroll)
            {
                hscroll = flyingon.hscroll_height;
            }
        }

        return [hscroll, vscroll];
    };


    //渲染滚动条
    this.renderScroll = function () {

        var date = new Date();

        var head = this.dom_header,
            view = this.__view,
            hscroll_style = this.dom_hscroll.style,
            vscroll_style = this.dom_vscroll.style,
            end_style = this.dom_end.style;

            var width = view && view.width || head.totalWidth,
            height = view && view.height || 0,
            scroll = this.__check_scroll(width, height),
            hscroll = scroll[0],
            vscroll = scroll[1];

        if (hscroll > 0)
        {
            hscroll_style.display = 'block';
            this.dom_hscroll.children[0].style.width = width + (vscroll > 0 ? 1 : 0) + 'px';
        }
        else
        {
            hscroll_style.display = 'none';
        }

        if (vscroll > 0)
        {
            vscroll_style.display = 'block';
            vscroll_style.top = head.headerHeight + 'px';
            vscroll_style.bottom = (hscroll > 0 ? hscroll - 2 : 0) + 'px';

            this.dom_vscroll.children[0].style.height = height + (hscroll > 0 ? 1 : 0) + 'px';
        }
        else
        {
            vscroll_style.display = 'none';
        }

        if (hscroll > 0 && vscroll > 0)
        {
            hscroll_style.right = (vscroll - 2) + 'px';

            end_style.display = 'block';
            end_style.width = vscroll + 'px';
            end_style.height = hscroll + 'px';
        }
        else
        {
            end_style.display = 'none';
            hscroll_style.right = '0';
        }

        console.log('render scroll:' + (new Date() - date));

        return this;
    };


    //获取设置或清除选中行
    this.checkedRows = function (rows) {

        var view = this.__view,
            any = view && view.checkedRows;

        //获取选中行
        if (rows === void 0)
        {
            return any.values || [];
        }

        var list = new flyingon.NodeList(),
            className = 'f-Grid-row-checked',
            row,
            length;

        //查找选择框的函数
        function find(dom) {

            if (dom && dom.className.indexOf('f-Grid-checked') >= 0)
            {
                return dom.getElementsByTagName('input')[0];
            }
        };

        //清空选中行
        if (view && any && (length = any.length) > 0)
        {
            for (var i = 0; i < length; i++)
            {
                if (row = any[i])
                {
                    row.checked = false;
                    view.findRowCells(row, list);
                }
            }

            list.removeClass(className);
            list.find(find).prop('checked', false);
            list.length = 0;

            any.clear();
            view.checkedRows = null;
        }

        //设置选中行
        if (view && rows !== null)
        {
            if (!Array.isArray(rows))
            {
                rows = [rows];
            }

            length = rows.length;

            for (var i = 0; i < length; i++)
            {
                if ((row = rows[i]) >= 0)
                {
                    row = this.__view[row];
                }

                if (row)
                {
                    row.checked = true;
                    
                    (any || (view.checkedRows = new Set())).add(row);
                    view.findRowCells(row, list);
                }
            }

            if (list.length > 0)
            {
                list.addClass(className);
                list.find(find).prop('checked', true);
                list.length = 0;
            }
        }

        return this;
    };


    //获取设置或清除当前行
    this.currentRow = function (row) {

        var view = this.__view,
            any = view && view.currentRow;

        //不传参数则获取当前行
        if (row === void 0)
        {
            return any || null;
        }

        if (row !== null)
        {
            if (row >= 0)
            {
                row = view && view[row];
            }
            else if (row < 0)
            {
                row = view && view[view.length + row];
            }
        }

        if (any !== row)
        {
            var className = 'f-Grid-row-selected';

            if (any)
            {
                any.selected = false;

                view.currentRow = null;
                view.findRowCells(any).removeClass(className);
            }

            if (row)
            {
                row.selected = true;

                view.currentRow = row;
                view.findRowCells(row).addClass(className);
            }
        }

        return this;
    };


    //获取设置或清除当前列
    this.currentColumn = function (column) {

        var view = this.__view,
            any = view && view.currentColumn,
            columns;

        //不传参数则获取当前行
        if (column === void 0)
        {
            return any || null;
        }

        if (column !== null && (columns = this.__columns))
        {
            if (column >= 0)
            {
                column = columns[column];
            }
            else if (column < 0)
            {
                column = columns[columns.length + column];
            }
        }

        if (any !== column)
        {
            var className = 'f-Grid-column-selected';

            if (any)
            {
                any.selected = false;

                view.currentColumn = null;
                view.findColumnCells(any).removeClass(className);
            }

            if (column)
            {
                column.selected = true;

                view.currentColumn = column;
                view.findColumnCells(column).addClass(className);
            }
        }

        return this;
    };


    //滚动到指定行
    this.scrollTo = function (index) {

        var view = this.__view;

        if (view)
        {
            var length = view.length;

            if (index < 0)
            {
                index = length + index;
            }

            if (index >= length)
            {
                index = length - 1;
            }

            this.dom_vscroll.scrollTop = view.rowHeight() * index;
        }

        return this;
    };


    //展开树节点
    this.expand = function (expandLevel) {

        var view = this.__view;

        if (view)
        {
            view.expand();
            this.renderBody(true);
        }

        return this;
    };


    //收拢树节点
    this.collapse = function () {

        var view = this.__view;

        if (view)
        {
            view.collapse(true);
            view.fix_vscroll();

            this.renderBody(true);
        }

        return this;
    };


    //关闭提醒信息
    this.closeTip = function () {

        tip && tip.close();
        return this;
    };


    this.dispose = function () {

        var view = this.__view,
            off = flyingon.dom_off;

            off(this.dom_hscroll);
            off(this.dom_vscroll);
            off(this.dom_header);
            off(this.dom_body);
            off(this.dom);

        if (view)
        {
            if (view.grid)
            {
                view.clear();
                view.grid = null;
            }

            this.__view = null;
        }

        this.__dispose_columns();

        return base.dispose.call(this);
    };


    this.__dispose_columns = function () {

        var columns = this.__columns,
            length;

        if (columns && columns.__init && (length = columns.length) > 0)
        {
            for (var i = 0; i < length; i++)
            {
                columns[i].grid = null;
            }

            columns.length = 0;
            this.__columns = null;
        }
    };


});