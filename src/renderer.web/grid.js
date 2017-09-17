flyingon.renderer('GridColumn', function (base) {



    this.render = function (writer, column, height) {

        var cells = column.__cells;

        if (cells[1])
        {
            render_multi(writer, column, cells, height);
        }
        else
        {
            render_header(writer, column, cells[0] || column.__set_title('')[0], 0, column.__size, height);
        }
    };



    function render_multi(writer, column, cells, height) {

        var width = column.__size,
            length = cells.length,
            y1 = 0,
            y2,
            cell;

        for (var i = 0; i < length; i++)
        {
            cell = cells[i];

            y2 = cell.__height;
            y2 = y2 > 0 ? y2 : (height / (length - i) | 0);
   
            render_header(writer, column, cell, y1, cell.__size || column.__size, y2);

            y1 += y2;
            height -= y2;
        }
    };



    function render_header(writer, column, cell, y, width, height) {

        cell.row = null;
        cell.column = column;
        cell.__as_html = true;

        cell.renderer.render(writer, cell, 'f-grid-cell' + column.fullClassName, 
            'left:' + column.__start +
            'px;top:' + y +
            'px;width:' + width + 
            'px;height:' + height + 
            'px;line-height:' + height + 'px;' + 
            (cell.columnSpan ? 'z-index:1;' : ''));
    };



    this.mount = function (column, view, fragment, tag) {

        var grid = column.grid,
            cells = column.__cells,
            index = 0,
            cell,
            node;

        column.view = true;

        while ((cell = cells[index++]) && (node = view.firstChild))
        {
            cell.parent = grid;
            cell.renderer.mount(cell, node);

            fragment.insertBefore(node, tag);
        }
    };


    this.unmount = function (column, cells) {

        var index = 0,
            cell;

        column.view = false;
        cells || (cells = column.__cells);

        while (cell = cells[index++])
        {
            if (cell.view)
            {
                cell.parent = null;
                cell.renderer.unmount(cell, false);
            }
        }
    };



    this.readonly = function (column, readonly) {


    };


    //计算网格高度
    this.__resize_height = function (column, height) {

        var cells = column.__cells,
            length = cells.length,
            index,
            cell,
            style,
            size,
            y;

        if (length > 1)
        {
            index = y = 0;

            while (cell = cells[index])
            {
                size = cell.__height;
                size = size > 0 ? size : height / (length - index) | 0;

                style = cell.view.style;
                style.top = y + 'px';
                style.height = style.lineHeight = size + 'px';

                y += size;
                height -= size;

                index++;
            }
        }
        else
        {
            style = cells[0].view.style;
            style.height = style.lineHeight = height + 'px';
        }
    };
    

});



flyingon.renderer('GridRow', function (base) {


    var id = 1;


    this.show = function (fragment, writer, row, columns, start, end, y, height, tag) {

        var cells = row.__cells,
            cell,
            view,
            style,
            column,
            any;

        if (!cells)
        {
            row.view = true; //标记已渲染
            cells = row.__cells = {};
        }

        while (start < end)
        {
            column = columns[start];
            any = column.__name || (column.__name = '__column_' + id++);

            if (cell = cells[any])
            {
                //处理树列
                if (column.__tree_cell)
                {
                    fragment.appendChild(view = row.view);
                    
                    if (cell.__top !== y)
                    {
                        view.style.top = y + 'px';
                    }

                    if (cell.__show_tag !== tag)
                    {
                        style = view.style;
                        style.left = column.__start +  'px';
                        style.height = ((any = cell.rowSpan) ? ++any * height : height) + 'px';
                    }
                }

                fragment.appendChild(view = cell.view);

                //自定义显示前处理
                if (any = column.onshowing)
                {
                    any.call(column, cell, row);
                }

                if (cell.__top !== y)
                {
                    view.style.top = (cell.__top = y) + 'px';
                }

                if (cell.__show_tag !== tag)
                {
                    cell.__show_tag = tag;

                    style = view.style;
                    style.left = column.__start + 'px';

                    any = (any = cell.columnSpan) ? column.__span_size(any) : 0;
                    style.width = column.__size + any + 'px';

                    style.height = ((any = cell.rowSpan) ? ++any * height : height) + 'px';
                }
            }
            else if (cell = this.render(writer, row, column, y, height))
            {
                cell.__top = y;
                cell.__show_tag = tag;
                cells[any] = cell;
            }

            start++;
        }
    };


    this.render = function (writer, row, column, y, height) {

        var cell = column.createControl(row, column.__name),
            width = column.__size,
            span,
            any;

        //自定义渲染单元格
        if (any = column.onrender)
        {
            any.call(column, cell, row, column);

            if (any = cell.rowSpan) 
            {
                if ((any |= 0) > 0)
                {
                    span = 1;
                    height += any * height;
                }
                else
                {
                    any = 0;
                }

                cell.rowSpan = any;
            }

            if (any = cell.columnSpan) 
            {
                if ((any |= 0) > 0)
                {
                    span = 1;
                    width += column.__span_size(any);
                }
                else
                {
                    any = 0;
                }

                cell.columnSpan = any;
            }
        }

        cell.row = row;
        cell.column = column;
        cell.__as_html = true;

        //自定义显示前处理
        if (any = column.onshowing)
        {
            any.call(column, cell, row);
        }

        if (column.__tree_cell)
        {
            this.render_tree(writer, row, column, y, height, cell);
        }

        any = (any = column.__align) ? 'text-align:' + any + ';' : '';

        if (span)
        {
            any += 'z-index:1;';
        }

        cell.renderer.render(writer, cell, 'f-grid-cell' + column.fullClassName 
                + (row.__checked ? ' f-grid-checked' : '')
                + (row.__current ? ' f-grid-current' : ''),
            'left:' + column.__start + 
            'px;top:' + y + 
            'px;width:' + width + 
            'px;height:' + height + 
            'px;line-height:' + height + 'px;' +
            any);

        return cell;
    };


    this.render_tree = function (writer, row, column, y, height, cell) {

        var expand = row.length > 0 ? (row.expanded ? 'expand' : 'collapse') : 'file',
            icon = column.__tree_icon,
            width = 16;

        if (icon)
        {
            width += 16;

            if (icon = column.grid.onicon)
            {
                icon = icon.call(column.grid, row, column);
            }

            if (!icon)
            {
                icon = 'f-grid-icon-' + expand;
            }
        }

        while (row = row.parent)
        {
            width += 16;
        }

        writer.push('<div class="f-grid-tree" style="',
                'left:' + column.__start + 
                'px;top:' + y + 
                'px;width:' + width + 
                'px;height:' + height + 
                'px;line-height:' + height + 'px;">' +
                '<span class="f-grid-', expand, '" tag="', expand, '"', '></span>',
                '<span class="f-grid-icon', icon ? ' ' + icon : '" style="display:none;', '"></span>',
            '</div>');

        cell.padding('0 2 0 ' + (width + 2));
    };


    this.mount = function (view, row, columns, start, end, fragment, tag) {

        var grid = row.grid,
            cells = row.__cells,
            column,
            cell,
            node,
            name;

        while (start < end)
        {
            if ((column = columns[start++]) && (name = column.__name) && (cell = cells[name]))
            {
                if (node = cell.view)
                {
                    tag = node.nextSibling || null;
                }
                else if (node = view.firstChild)
                {
                    if (column.__tree_cell)
                    {
                        fragment.insertBefore(node, tag);

                        row.view = node;
                        node.row = row;
                        node.column = column;

                        node = view.firstChild;
                    }

                    fragment.insertBefore(node, tag);

                    cell.parent = grid;
                    cell.renderer.mount(cell, node);
                }
            }
        }

        return tag;
    };


    this.unmount = function (row) {

        var cells = row.__cells,
            any;

        for (var name in cells)
        {
            if (any = cells[name])
            {
                any.parent = any.row = any.column = null;
                any.renderer.unmount(any, false);

                cells[name] = null;
            }
        }
    };


    this.checked = function (row, view, value) {

        set_class(row.__cells, ' f-grid-checked', value);
    };


    this.current = function (row, view, value) {

        set_class(row.__cells, ' f-grid-current', value);
    };


    function set_class(cells, name, set) {

        var cell;

        if (set)
        {
            for (var key in cells)
            {
                if (cell = cells[key])
                {
                    cell.view.className += name;
                }
            }
        }
        else
        {
            for (var key in cells)
            {
                if (cell = cells[key])
                {
                    cell.view.className = cell.view.className.replace(name, '');
                }
            }
        }
    };


});



flyingon.renderer('GroupGridRow', 'GridRow', function (base) {


    this.render = function (writer, row, column, y, height) {

        var cell = new flyingon.Label(),
            storage = column.__storage,
            summary = storage && storage.summary,
            fn,
            any;

        cell.__as_html = true;

        if (summary && (any = storage.name))
        {
            fn = column.__summary_fn || (column.__summary_fn = flyingon.Grid.summary(summary));
            any = row.compute(column, any, fn[0], fn[1]);

            if ((fn = column.onsummary) && (fn = fn.call(column, row, any, summary)))
            {
                any = fn;
            }
            else
            {
                any = summary + '=' + any.toFixed(storage.precision);
            }

            cell.text(any);
        }

        cell.renderer.render(writer, cell, 'f-grid-group-row',
            'left:' + column.__start + 
            'px;top:' + y + 
            'px;width:' + column.__size + 
            'px;height:' + height + 
            'px;line-height:' + height + 'px;');

        return cell;
    };


    this.unmount = function (row) {

        var view = row.view_group;

        base.unmount.call(this, row);

        if (view)
        {
            view.row = row.view_group = null;
        }
    };


});



flyingon.renderer('Grid', function (base) {



    //拖动列时的辅助线
    var dom_drag = document.createElement('div');

    //调整列宽时的辅助线
    var dom_resize = document.createElement('div');


    //textContent || innerText
    var text_name = this.__text_name;

    //是否禁止列头点击事件
    var click_disabled = false;

    //可输入标签
    var input_tag = 'input,select,textarea'.toUpperCase().split(',');

    //更新标记
    var update_tag = 1;

    //动态管理子节点的临时节点
    var dom_fragment = document.createDocumentFragment();

    //动态生成html片段的dom容器
    var dom_host = document.createElement('div');

    //html模板
    var template = '<div class="f-grid-center"></div>'
        + '<div class="f-grid-right" style="display:none;"></div>'
        + '<div class="f-grid-left" style="display:none;"></div>'
        + '<div class="f-grid-group" style="display:none;"></div>';



    this.padding = 0;


    
    //初始化dom
    dom_drag.innerHTML = '<div class="f-grid-drag-body"><div></div></div>';
    dom_drag.className = 'f-grid-drag';
    dom_drag.style.width = '20px';

    dom_resize.className = 'f-grid-resize-thumb';




    this.render = function (writer, grid, className, cssText) {

        var storage = grid.__storage || grid.__defaults,
            group = storage.group,
            header = storage.header,
            top = group + header,
            block = template;

        writer.push('<div');

        this.renderDefault(writer, grid, className, cssText);

        writer.push(' onclick="flyingon.Grid.onclick.call(this, event)" onkeydown="flyingon.Grid.onkeydown.call(this, event)">',
            '<div class="f-grid-head" onmousedown="flyingon.Grid.onmousedown.call(this, event)">',
                '<div class="f-grid-group-box" style="height:', group, 'px;line-height:', group, 'px;', group < 2 ? 'display:none;' : '', '"></div>',
                '<div class="f-grid-column-head" style="height:', header, 'px;', header < 2 ? 'display:none;' : '', '" onmouseover="flyingon.Grid.onmouseover.call(this, event)">', 
                    block,
                    '<div class="f-grid-resize" style="display:none;" onmousedown="flyingon.Grid.resize.call(this, event)"></div>',
                    '<div class="f-grid-sort" style="left:-100px;"></div>',
                '</div>',
                '<div class="f-grid-filter" style="display:none;">', block, '</div>',
            '</div>',
            '<div class="f-grid-scroll" style="top:', top, 'px;" onscroll="flyingon.Grid.onscroll.call(this)">',
                this.__scroll_html,
            '</div>',
            '<div class="f-grid-body" style="top:', top, 'px;" tabindex="0">',
                '<div class="f-grid-middle">', block, '</div>',
                '<div class="f-grid-bottom" style="display:none;">', block, '</div>',
                '<div class="f-grid-top" style="display:none;">', block, '</div>',
            '</div>',
        '</div>');
    };



    this.mount = function (grid, view) {

        var dom = view.firstChild,
            any;

        grid.view_group = any = dom.firstChild;
        grid.view_head = any = any.nextSibling;
        grid.view_resize = (grid.view_sort = any.lastChild).previousSibling;
        grid.view_filter = any.nextSibling;

        grid.view_scroll = any = dom.nextSibling;
        grid.view_body = any.nextSibling;

        base.mount.call(this, grid, view);

        grid.on('mousewheel', mousewheel);
        grid.on('change', change_event);
    };


    this.unmount = function (grid) {

        base.unmount.call(this, grid);
        grid.view_group = grid.view_head = grid.view_resize = grid.view_sort = 
        grid.view_filter = grid.view_scroll = grid.view_body = null;
    };

    
    function mousewheel(e) {

        this.view_scroll.scrollTop -= e.wheelDelta * 100 / 120;
        flyingon.dom_stop(e);
    };


    function change_event(e) {

        var control = e.target;

        if (control.__column_check)
        {
            control.row.checked(!control.row.__checked);
        }
        else
        {
            control.parent.__change_value(control);
        }
    };
    


    flyingon.Grid.onkeydown = function (e) {

        if (e.keyCode === 9)
        {
            setTimeout(sync_focus, 0);
        }
    };
    

    //同步使用tab造成焦点位置变化的问题
    function sync_focus() {

        var dom = document.activeElement,
            cell,
            grid,
            any,
            x;

        if (dom && (cell = flyingon.findControl(dom)))
        {
            grid = cell.parent;

            dom = cell.view;
            any = dom.parentNode;

            x = dom.offsetLeft;

            if (x < grid.scrollLeft || x + dom.offsetWidth > any.offsetWidth)
            {
                grid.view_scroll.scrollLeft = cell.column.__start;
            }

            if (dom.offsetTop + dom.offsetHeight > any.offsetHeight)
            {
                grid.view_scroll.scrollTop = dom.offsetTop;
            }
        }
    };



    flyingon.Grid.onclick = function (e) {

        if (click_disabled)
        {
            click_disabled = false;
        }
        else
        {
            var grid = flyingon.findControl(this),
                dom = e.target || e.srcElement,
                any;

            switch (dom.getAttribute('tag'))
            {
                case 'expand':
                    change_expand(grid, any = dom.parentNode.row, dom, 'collapse');
                    grid.__view.__collapse_row(any);
                    break;

                case 'collapse':
                    change_expand(grid, any = dom.parentNode.row, dom, 'expand');
                    grid.__view.__expand_row(any);
                    break;

                default:
                    if (any = flyingon.findControl(dom))
                    {
                        if (any.row) //数据行
                        {
                            grid.__set_current(any.row);
                        }
                        else if (any.column && !any.columnSpan && any.column.name()) //列头且无跨列
                        {
                            sort_column(grid, any);
                        }
                    }
                    break;
            }
        }
    };


    function change_expand(grid, row, dom, name) {

        dom.className = 'f-grid-' + name;
        dom.setAttribute('tag', name);

        if ((dom = dom.nextSibling) && dom.className.indexOf('f-grid-icon') >= 0)
        {
            var icon = grid.onicon;

            if (icon)
            {
                icon = icon.call(grid, row, dom.parentNode.column);
            }

            if (!icon)
            {
                icon = 'f-grid-icon-' + name;
            }

            dom.className = 'f-grid-icon ' + icon;
        }
    };


    function sort_column(grid, cell) {

        var dom = grid.view_sort,
            desc = dom.cell === cell && !dom.desc;

        dom.cell = cell;
        dom.desc = desc;
        dom.className = 'f-grid-sort' + (desc ? ' f-grid-sort-desc' : '');

        grid.sort(cell.column.name(), desc);

        sync_sort(dom);
    };


    function sync_sort(dom) {

        var cell = dom.cell,
            view,
            any;
            
        if (cell && (view = cell.view))
        {
            if (any = view.parentNode)
            {
                dom.style.left = any.offsetLeft + view.offsetLeft + view.offsetWidth - 18 + 'px';
                dom.style.top = view.offsetTop + (view.offsetHeight - 16 >> 1) + 'px';
            }
            else
            {
                dom.style.left = '-100px';
            }
        }
    };


    flyingon.Grid.onmouseover = function (e) {

        var dom = e.target || e.srcElement,
            grid,
            column,
            cell,
            any;

        if (dom.className.indexOf('f-grid-cell') >= 0 && 
            (cell = flyingon.findControl(dom)) &&
            (grid = flyingon.findControl(this)) &&
            (column = cell.column))
        {
            //处理跨列
            if (any = cell.columnSpan)
            {
                column = grid.__columns[column.__index + any];
            }

            if (column && column.resizable())
            {
                var head = grid.view_resize,
                    style = head.style;

                head.column = column;

                style.left = dom.parentNode.offsetLeft + dom.offsetLeft + dom.offsetWidth - 3 + 'px';
                style.top = dom.offsetTop + 'px';
                style.height = dom.offsetHeight + 'px';
                style.display = '';
            }
        }
    };


    flyingon.Grid.resize = function (e) {

        var grid = flyingon.findControl(this),
            left = 0,
            dom = this,
            any;

        grid.__column_dirty = true;
        grid.view.appendChild(e.dom = dom_resize);

        dom = grid.view_head;
        dom.style.cursor = 'ew-resize';

        any = e.dom.style;
        any.left = this.offsetLeft + (this.offsetWidth >> 1) + 1 + 'px';
        any.top = dom.offsetTop + 'px';
        any.bottom = grid.view_body.style.bottom;

        flyingon.dom_drag({

            grid: grid, 
            column: any = this.column,
            size: any.__size

        }, e, resize_start, do_resize, resize_end, 'y', false);
    };


    function resize_start() {

        click_disabled = true;
    };


    function do_resize(e) {

        var size = this.size;

        if (size + e.distanceX < 1)
        {
            e.distanceX = -size + 1;
        }
    };


    function resize_end(e) {

        var grid = this.grid,
            column = this.column,
            any = this.size + e.distanceX;

        click_disabled = false;

        grid.view_head.style.cursor = '';
        grid.view.removeChild(dom_resize);

        if (column.__size !== any)
        {
            column.storage().size = any;

            //触发列调整大小事件
            if (any = grid.oncolumnresize)
            {
                any.call(grid, column, storage.__size, this.size);
            }

            grid.update(true);
        }
    };



    flyingon.Grid.onmousedown = function (e) {

        var dom = e.target || e.srcElement,
            cell,
            any;

        if (input_tag.indexOf(dom.tagName) < 0)
        {
            if (any = dom.getAttribute('column-name'))
            {
                check_drag(this, dom, null, any, 1);
            }
            else
            {
                cell = flyingon.findControl(dom);

                while (cell)
                {
                    if (any = cell.column)
                    {
                        check_drag(this, dom, any, '', (cell.columnSpan | 0) + 1);
                        break;
                    }

                    cell = cell.parent;
                }
            }
        }
    };


    function check_drag(view, dom, column, name, count) {

        var grid = flyingon.findControl(view),
            from;

        if (column)
        {
            name = column.name();
        }
        else if (name && (column = grid.__columns.find(name)))
        {
             from = true;
        }
    
        column && column.draggable() && flyingon.dom_drag({

                grid: grid,
                column: column,
                dom: dom, 
                name: name,
                index: column.__index,
                count: count,
                from: from  //标记从分组框拖出
            },
            event,
            start_drag,
            do_drag,
            end_drag);
    };


    function start_drag(e) {

        var grid = this.grid,
            storage = grid.__storage || grid.__defaults,
            dom = this.dom,
            thumb = this.thumb = dom_drag,
            count = this.count,
            style,
            any;

        this.group = any = storage.group;
        this.header = storage.header;

        any = grid.view.firstChild.getBoundingClientRect();

        this.left = any.left;
        this.top = any.top;

        //从分组框拖出
        if (this.from)
        {
            dom.style.cssText = 'position:absolute;z-index:2;left:' 
                + dom.offsetLeft + 'px;top:' 
                + dom.offsetTop + 'px;';

            any = grid.__groups;
            any.splice(any.indexOf(this.name), 1);

            //清空原分组信息避免拖动结束后无法设置groups
            grid.__storage.groups = ' ';
        }
        else //拖动列
        {
            any = dom.cloneNode(true);

            style = any.style;
            style.borderWidth = '1px';
            style.left = dom.offsetLeft + dom.parentNode.offsetLeft + 'px';
            style.top = dom.offsetTop + dom.parentNode.parentNode.offsetTop + 'px';

            dom = any;

            //隐藏列头
            any = grid.__columns;

            while (count--)
            {
                any[this.index + count].__visible = false;
            }

            grid.update(true);
        }

        e.dom = dom;
        dom.style.zIndex = 2;

        any = grid.view.firstChild;
        any.appendChild(thumb);
        any.appendChild(dom);
        
        click_disabled = true;
    };


    function do_drag(event) {

        var grid = this.grid,
            style = this.thumb.style,
            x = event.clientX - this.left,
            y = event.clientY - this.top,
            view,
            height;

        //拖动到分组框
        if (this.to = this.name && y < this.group)
        {
            y = 4;
            height = this.group - 8;

            if (grid.__groups)
            {
                x = group_index(this, grid.view_group, x);
            }
            else
            {
                this.at = 0;
                x = 8;
            }
        }
        else //拖到列区
        {
            x = column_index(this, grid, x);
            y = this.group;
            height = this.header;
        }

        style.left = x - 11 + 'px';
        style.top = y + 'px';
        style.height = height + 'px';
    };


    function group_index(context, dom, x) {

        var index = 0,
            left = 0,
            width = 0;

        dom = dom.firstChild;

        while (dom)
        {
            left = dom.offsetLeft;
            width = dom.offsetWidth;

            if (left + (width >> 1) > x)
            {
                context.at = index;
                return left - 4;
            }

            if (left + width > x)
            {
                break;
            }

            index++;
            dom = dom.nextSibling;
        }

        context.at = index;
        return left + width + 4;
    };


    function column_index(context, grid, x) {

        var columns = grid.__columns,
            locked = columns.__locked,
            start = locked[0],
            end = columns.length,
            offset = 0,
            left = 0,
            size = 0,
            column;

        //在左锁定区
        if (start && locked[2] > x)
        {
            end = start;
            start = 0;
        }
        else if (locked[1] && x > (offset = columns.__arrange_size - locked[3])) //在右锁定区
        {
            start = end - locked[1];
            x += offset;
        }
        else //滚动区域
        {
            offset = -grid.scrollLeft | 0;
            x -= offset;
        }

        console.log(columns[2].__visible);

        while (start < end)
        {
            column = columns[start++];

            if (column.__visible)
            {
                left = column.__start;
                size = column.__size;

                if (left + (size >> 1) > x)
                {
                    context.at = start - 1;
                    return left + offset;
                }

                if (left + size > x)
                {
                    break;
                }
            }
        }

        context.at = start;
        return left + size + offset;
    };

    
    function end_drag(event) {

        var grid = this.grid,
            columns = grid.__columns,
            index = this.index,
            count = this.count,
            list = [],
            any;

        click_disabled = false;

        if (any = this.thumb)
        {
            any.parentNode.removeChild(any);
        }

        if (any = event.dom)
        {
            any.parentNode.removeChild(any);
        }

        //拖到分组框
        if (this.to)
        {
            for (var i = 0; i < count; i++)
            {
                list.push(columns[index + i].name());
            }

            if (any = grid.__groups)
            {
                any.splice(this.at, 0, list.join(' '));
                any = any.join(' ');
            }
            else
            {
                any = list.join(' ');
            }

            grid.groups(any);
        }
        else 
        {
            //从分组框拖出时需同步分组
            if (this.from)
            {
                grid.groups(grid.__groups.join(' '));
            }

            //显示列
            for (var i = 0; i < count; i++)
            {
                columns[index + i].__visible = true;
            }

            //如果顺序发生变化则调整列顺序
            if (this.at !== index)
            {
                reorder_column(columns, this.at, index, count);
            }

            grid.update(true);
        }
    };


    //调整列顺序
    function reorder_column(columns, newIndex, oldIndex, count) {

        var splice = [].splice,
            list = splice.call(columns, oldIndex, count || (count = 1));

        if (list[0])
        {
            if (newIndex > oldIndex)
            {
                newIndex -= count;
            }

            if (list[1])
            {
                list.unshift(newIndex, 0);
                splice.apply(columns, list);
            }
            else
            {
                splice.call(columns, newIndex, 0, list[0]);
            }
        }
    };



    flyingon.Grid.onscroll = function () {

        var grid = flyingon.findControl(this),
            x = this.scrollLeft,
            y = this.scrollTop;

        if (grid.scrollLeft !== x)
        {
            grid.renderer.__do_hscroll(grid, grid.scrollLeft = x);
            sync_sort(grid.view_sort);
        }

        if (grid.scrollTop !== y)
        {
            grid.renderer.__do_vscroll(grid, grid.scrollTop = y);
        }
    };



    this.locate = function (grid) {

        base.locate.call(this, grid);
        this.content(grid, grid.view);
    };


    this.locate_html = function (grid) {


    };



    //列头大小发生变化
    this.header = function (grid, view, value) {

        var columns = grid.__columns,
            storage = grid.__storage || grid.__defaults,
            group = storage.group,
            header = storage.header,
            style;

        grid.view_body.style.top = grid.view_scroll.style.top = group + header + 'px';

        if (value > 1)
        {
            style = grid.view_head.style;
            style.display = header > 1 ? '' : 'none';
            style.height = header + 'px';

            for (var i = columns.length - 1; i >= 0; i--)
            {
                var column = columns[i];

                if (column.view)
                {
                    column.renderer.__resize_height(column, header);
                }
            }
        }
        else
        {
            style = grid.view_group.style;
            style.display = group > 1 ? '' : 'none';
            style.height = style.lineHeight = group + 'px';
        }
    };


    //内容发生变化
    this.content = function (grid, view) {

        this.show(grid,
            grid.scrollLeft | 0,
            grid.scrollTop | 0,
            grid.offsetWidth - grid.borderLeft - grid.borderRight,
            grid.offsetHeight - grid.borderTop - grid.borderBottom);
    };



    //显示指定范围的表格内容
    this.show = function (grid, x, y, width, height) {

        var storage = grid.__storage || grid.__defaults,
            columns = grid.__columns,
            rows = grid.__rows,
            height = grid.offsetHeight - grid.borderTop - grid.borderBottom,
            any;

        //显示分组
        if ((any = storage.group) > 0)
        {
            height -= any;
        }

        //计算列宽度
        any = columns.__arrange_size !== width;

        if (grid.__column_dirty || any && columns.__persent)
        {
            grid.__column_dirty = false;

            columns.__show_tag = update_tag++;
            columns.__compute_size(width);
            columns.__compute_visible(x);
        }
        else if (any || columns.__arrange_start !== x)
        {
            columns.__arrange_size = width;
            columns.__compute_visible(x);
        }

        //控制水平滚动条
        if (columns.__size > width)
        {
            any = flyingon.hscroll_height;
            height -= any;
        }
        else
        {
            any = 1;
        }

        grid.view_body.style.bottom = any + 'px';
        grid.view_scroll.firstChild.style.width = columns.__size + 'px';

        //显示列头
        if ((any = storage.header) > 0)
        {
            height -= any;
            this.__show_header(grid, columns, any);
        }

        //显示过滤栏
        if ((any = storage.filter) > 0)
        {
            height -= any;
            this.__show_filter(grid, columns, any);
        }

        //显示内容
        any = this.__show_body(grid, grid.currentView(), height);

        //排列横向锁定区域
        this.__layout_locked(grid, columns.__locked, any);
    };



    //显示列头
    this.__show_header = function (grid, columns, height) {

        var view = grid.view_head.children[3],
            locked = columns.__locked,
            any;

        //group
        view = view.previousSibling;

        //left lock
        if (any = locked[0])
        {
            this.show_header(view, columns, 0, any, height);
        }

        //right lock
        view = view.previousSibling;

        if (any = locked[1])
        {
            this.show_header(view, columns, columns.length - any, columns.length, height);
        }

        //scroll
        this.show_header(view.previousSibling, columns, columns.__show_start, columns.__show_end, height);

        //sort arrow
        sync_sort(grid.view_sort);
    };



    //排列横向锁定区域
    this.__layout_locked = function (grid, locked, vscroll) {

        var view = grid.view_head,
            left = locked[2],
            right = locked[3],
            group = grid.__group_size,
            scroll = grid.scrollLeft | 0;

        if (vscroll = vscroll && right > 0)
        {
            right += 1;
        }

        layout_locked(view, left, vscroll ? right + flyingon.vscroll_width : right, group, scroll);

        layout_locked(view = grid.view_body.firstChild, left, right, group, scroll);
        layout_locked(view = view.nextSibling, left, right, group, scroll);
        layout_locked(view.nextSibling, left, right, group, scroll);
    };


    function layout_locked(view, left, right, group, scroll) {

        var dom = view.firstChild,
            style = dom.style;

        //center
        style[flyingon.rtl ? 'right' : 'left'] = -scroll + 'px';

        //right
        dom = dom.nextSibling;
        style = dom.style;

        if (right > 0)
        {
            style.width = right + 'px';
            style.display = '';
        }
        else
        {
            style.display = 'none';
        }

        //left
        dom = dom.nextSibling;
        style = dom.style;

        if (left > 0)
        {
            style.width = left + 'px';
            style.display = '';
        }
        else
        {
            style.display = 'none';
        }

        //group
        style = dom.nextSibling.style;

        if (group > 0)
        {
            style.width = group + 'px';
            style.display = '';
        }
        else
        {
            style.display = 'none';
        }
    };



    //显示列头
    this.show_header = function (view, columns, start, end, height) {

        var writer = [],
            tag = columns.__show_tag,
            fragment = dom_fragment,
            index = start,
            column,
            node,
            tag,
            style,
            cells,
            cell,
            any;

        while (index < end)
        {
            if ((column = columns[index++]).__visible)
            {
                if (column.view)
                {
                    any = 0;
                    cells = column.__cells;

                    if (style = column.__show_tag !== tag)
                    {
                        column.__show_tag = tag;
                    }

                    while (cell = cells[any++])
                    {
                        fragment.appendChild(node = cell.view);

                        if (style)
                        {
                            style = node.style;
                            style.left = column.__start + 'px';
                            style.width = (cell.__size || column.__size) + 'px';
                        }
                    }
                }
                else
                {
                    column.__show_tag = tag;
                    column.renderer.render(writer, column, height);
                }
            }
        }

        if (writer[0])
        {
            any = dom_host;
            any.innerHTML = writer.join('');

            tag = fragment.firstChild;

            while (start < end)
            {
                if ((column = columns[start++]).__visible)
                {
                    if (node = column.view)
                    {
                        tag = node.nextSibling || null;
                    }
                    else
                    {
                        column.renderer.mount(column, any, fragment, tag);
                    }
                }
            }
        }

        //移除原来显示的节点
        while (any = view.lastChild)
        {
            view.removeChild(any);
        }

        view.appendChild(fragment);
    };


    //显示过滤栏
    this.__show_filter = function (grid, column, height) {

    };


    //显示内容
    this.__show_body = function (grid, rows, height) {

        var view = grid.view_body.lastChild,
            storage = grid.__storage || grid.__defaults,
            start = grid.__locked_top,
            end = rows.length,
            rowHeight = rows.__row_height = storage.rowHeight,
            tree = storage.treeColumn,
            size = end * rowHeight,
            vscroll = size > height,
            any;

        //记录是否树列
        if (any = tree && grid.__columns.find(tree))
        {
            any.__tree_cell = true;
            any.__tree_icon = storage.treeIcon;
        }

        grid.view_scroll.firstChild.style.height = (size || 1) + 'px';
        grid.view_body.style[flyingon.rtl ? 'left' : 'right'] = (vscroll ? flyingon.vscroll_width : 0) + 'px';

        //显示顶部锁定
        if (start > 0)
        {
            view.style.display = '';
            view.style.height = (size = start * rowHeight) + 'px';

            height -= size;

            this.__show_rows(grid, view, rows, 0, start);
        }
        else
        {
            size = 0;
            view.style.display = 'none';
        }

        //显示底部锁定
        view = view.previousSibling;

        if ((any = grid.__locked_bottom) > 0)
        {
            view.style.display = '';
            view.style.height = (size = any * rowHeight) + 'px';

            height -= size;

            this.__show_rows(grid, view, rows, end - any, end);
            end -= any;
        }
        else
        {
            view.style.display = 'none';
        }

        //调整滚动区位置
        view = view.previousSibling;
        view.style.top = -(grid.scrollTop | 0) + 'px';

        //显示滚动区
        rows.__arrange_size = height;

        if (vscroll)
        {
            this.__visible_rows(grid, rows, grid.scrollTop | 0);
        }
        else
        {
            rows.__show_start = start;
            rows.__show_end = end;
        }

        this.__show_rows(grid, view, rows, rows.__show_start, rows.__show_end, true);

        return vscroll;
    };


    //计算行滚动行显示范围
    this.__visible_rows = function (grid, rows, top, scroll) {

        var start = grid.__locked_top,
            end = rows.length - grid.__locked_bottom,
            rowHeight = rows.__row_height,
            any;

        if (top > 0)
        {
            start += top / rowHeight | 0;
        }

        any = (rows.__arrange_size / rowHeight) | 0;
        any += start + 3; //多渲染部分行以减少滚动处理

        if (any < end)
        {
            end = any;
        }

        if (scroll && rows.__show_start <= start && rows.__show_end >= end)
        {
            return true;
        }

        if (any = grid.onrowstart)
        {
            any = any.call(grid, rows, start);

            if (any >= 0)
            {
                start = 0;
            }
        }
        
        rows.__show_start = start;
        rows.__show_end = end;
    };


    //显示表格行集
    this.__show_rows = function (grid, view, rows, start, end, scroll) {

        var columns = grid.__columns,
            locked = columns.__locked,
            rowHeight = rows.__row_height,
            column_start = locked[0],
            column_end = columns.length,
            top = scroll ? start * rowHeight : 0,
            any;

        //group
        view = view.lastChild;

        if (any = grid.__group_size)
        {
            this.show_group(grid, view, rows, start, end, top, rowHeight);
        }
        else if (view.firstChild)
        {
            view.innerHTML = ''; //销毁原分组行视图
        }

        //left lock
        view = view.previousSibling;

        if (column_start)
        {
            this.show_rows(grid, view, rows, start, end, columns, 0, column_start, top, rowHeight);
        }
        else if (view.firstChild)
        {
            view.innerHTML = '';
        }

        //right lock
        view = view.previousSibling;

        if (any = locked[1])
        {
            this.show_rows(grid, view, rows, start, end, columns, column_end - any, column_end, top, rowHeight);
        }
        else if (view.firstChild)
        {
            view.innerHTML = '';
        }

        //scroll
        this.show_rows(grid, view.previousSibling, rows, start, end, columns, columns.__show_start, columns.__show_end, top, rowHeight);
    };


    //显示表格行
    this.show_rows = function (grid, view, rows, start, end, columns, column_start, column_end, top, height) {

        var writer = [], 
            tag = columns.__show_tag,
            fragment = dom_fragment, 
            row, 
            any;

        for (var i = start; i < end; i++)
        {
            if (row = rows[i])
            {
                row.__show_index = i; //记录显示行索引以便于事件处理
                row.renderer.show(fragment, writer, row, columns, column_start, column_end, top, height, tag);

                top += height;
            }
        }

        if (writer[0])
        {
            any = dom_host;
            any.innerHTML = writer.join('');

            tag = fragment.firstChild;

            for (var i = start; i < end; i++)
            {
                tag = (row = rows[i]).renderer.mount(any, row, columns, column_start, column_end, fragment, tag);
            }
        }

        while (any = view.lastChild)
        {
            view.removeChild(any);
        }

        view.appendChild(fragment);
    };


    //显示分组行头
    this.show_group = function (grid, view, rows, start, end, top, height) {

        var writer = [],
            fragment = dom_fragment,
            tag = grid.__columns.__show_tag,
            size = grid.__group_size,
            fn = grid.ongroup,
            index = start,
            row,
            node,
            text,
            any;

        while (index < end)
        {
            if (row = rows[index])
            {
                if (row.__group_row)
                {
                    //记录行索引以支持事件定位
                    row.__show_index = index;

                    text = any = fn && fn(row) || row.text + ' (' + row.total + ')';

                    if (node = row.view_group)
                    {
                        fragment.appendChild(node);

                        if (row.__text !== text)
                        {
                            node.firstChild.nextSibling[text_name] = row.__text = text;
                        }

                        if (row.__top !== top)
                        {
                            node.style.top = (row.__top = top) - 1 + 'px';
                        }
                    }
                    else
                    {
                        writer.push('<div class="f-grid-group-row" style="top:', (row.__top = top) - 1, 
                                'px;height:', height + 1, 
                                'px;line-height:', height, 
                                'px;min-width:', size, 'px;',
                                'px;text-align:left;">',
                            '<span class="f-grid-', row.expanded ? 'expand" tag="expand"' : 'collapse" tag="collapse"',
                            ' style="margin-left:', row.level * 20, 'px;"></span>',
                            '<span> ', row.__text = text, '</span>', 
                            '<div class="f-grid-group-line" style="top:0;bottom:auto;"></div>',
                            '<div class="f-grid-group-line"></div>',
                        '</div>');
                    }
                }

                top += height;
            }

            index++;
        }

        view.style.height = top + 'px';

        if (writer[0])
        {
            any = dom_host;
            any.innerHTML = writer.join('');

            tag = fragment.firstChild;

            while (start < end)
            {
                if ((row = rows[start]) && row.__group_row)
                {
                    if (node = row.view_group)
                    {
                        tag = node.nextSibling || null;
                    }
                    else
                    {
                        node = any.firstChild;
                        node.row = row;
                        row.view_group = node;

                        fragment.insertBefore(node, tag);
                    }
                }

                start++;
            }
        }

        while (any = view.lastChild)
        {
            view.removeChild(any);
        }

        view.appendChild(fragment);
    };



    //渲染分组框
    this.__render_group = function (grid) {

        var writer = [],
            groups = grid.__groups,
            columns = grid.__columns,
            column,
            cells,
            name;

        if (groups)
        {
            for (var i = 0, l = groups.length; i < l; i++)
            {
                if (column = columns.find(name = groups[i]))
                {
                    column.__visible = false;
                    cells = column.__cells;

                    writer.push('<span class="f-grid-group-cell" column-name="', name, '">', 
                            column.__find_text() || name, 
                        '</span>');
                }
            }
        }
        else
        {
            writer.push('<span class="f-information">', flyingon.i18ntext('grid.group'), '</span>');
        }

        grid.view_group.innerHTML = writer.join('');
    };



    //处理水平滚动
    this.__do_hscroll = function (grid, left) {

        var columns = grid.__columns,
            view = grid.view_head.firstChild,
            height = (grid.__storage || grid.__defaults).header,
            name = flyingon.rtl ? 'right' : 'left',
            scroll = -left + 'px',
            update = !columns.__compute_visible(left, true), //计算可见列范围并获取是否超出上次的渲染范围
            start = columns.__show_start,
            end = columns.__show_end;

        //重渲染列头
        if (height > 0)
        {
            //控制滚动位置
            view.style[name] = scroll;

            //超出上次渲染的范围则重新渲染
            if (update)
            {
                this.show_header(view, columns, start, end, height);
            }
        }

        view = grid.view_body.firstChild;
        view.firstChild.style[name] = scroll;

        view = view.nextSibling;
        view.firstChild.style[name] = scroll;

        view.nextSibling.firstChild.style[name] = scroll;

        if (update)
        {
            var rows = grid.currentView(),
                any;
            
            select_cache(grid, true);

            view =  grid.view_body.firstChild;
            height = rows.__row_height;

            if (any = grid.__locked_top)
            {
                this.show_rows(grid, view.nextSibling.firstChild, rows, 0, any, columns, start, end, 0, height);
            }

            if (any = grid.__locked_bottom)
            {
                this.show_rows(grid, view.nextSibling.nextSibling.firstChild, rows, rows.length - any, rows.length, columns, start, end, 0, height);
            }

            this.show_rows(grid, view.firstChild, rows, any = rows.__show_start, rows.__show_end, columns, start, end, any * height, height);
        
            select_cache(grid);
        }
    };


    //处理竖直滚动
    this.__do_vscroll = function (grid, top) {

        var rows = grid.currentView(),
            view = grid.view_body.firstChild;

        select_cache(grid, true);
            
        view.style.top = -top + 'px';

        if (!this.__visible_rows(grid, rows, top, true))
        {
            this.__show_rows(grid, view, rows, rows.__show_start, rows.__show_end, true);
        }

        select_cache(grid);
    };



    function select_cache(grid, start) {

        var view = grid.view_body,
            dom = document.activeElement, 
            any;

        if (start)
        {
            any = dom;

            while (any = any.parentNode)
            {
                if (any === view)
                {
                    select_cache.dom = dom;
                    view.focus();
                    return;
                }
            }
        }
        else if (any = select_cache.dom)
        {
            if (dom === view)
            {
                any.focus();
            }
            else
            {
                select_cache.dom = null;
            }
        }
    };



});