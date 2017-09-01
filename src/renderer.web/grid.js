flyingon.renderer('GridColumn', function (base) {



    this.render = function (writer, column, height) {

        var cells = column.__cells;

        if (cells._)
        {
            this.unmount(column, cells._);
            cells._ = null;
        }

        if (cells[1])
        {
            render_multi(writer, column, cells, height);
        }
        else
        {
            render_header(writer, column, cells[0], 0, column.__size, height);
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

        cell.renderer.render(writer, cell, 'f-grid-cell', 
            'left:' + column.__start + 
            'px;top:' + y +
            'px;width:' + width + 
            'px;height:' + height + 
            'px;line-height:' + height + 'px;' + 
            (cell.columnSpan ? 'z-index:1;' : ''));
    };



    this.mount = function (column, view, fragment) {

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

            fragment.appendChild(node);
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
                cell.renderer.unmount(cell);
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


    this.show = function (fragment, writer, row, columns, start, end, y, height, tag) {

        var cells = row.__cells || (row.__cells = []),
            cell,
            view,
            style,
            column,
            any;

        while (start < end)
        {
            if (cell = cells[start])
            {
                fragment.appendChild(view = cell.view);

                if (cell.__show_tag !== tag)
                {
                    cell.__show_tag = tag;

                    column = columns[start];

                    style = view.style;
                    style.left = column.__start + 'px';
                    style.top = y + 'px';

                    any = (any = cell.columnSpan) ? column.__span_size(any) : 0;
                    style.width = column.__size + any + 'px';

                    style.height = ((any = cell.rowSpan) ? ++any * height : height) + 'px';
                }
            }
            else
            {
                cell = this.render(writer, row, columns[start], y, height);

                if (cell)
                {
                    cell.__show_tag = tag;
                    cells[start] = cell;
                }
            }

            start++;
        }
    };


    this.render = function (writer, row, column, y, height) {

        var cell = column.__create_control(row),
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

        any = column.__storage;
        any = any && (any = any.align) && any !== 'left' ? 'text-align:' + any + ';' : '';

        if (span)
        {
            any += 'z-index:1;';
        }

        cell.row = row;
        cell.column = column;
        cell.__as_html = true;

        cell.renderer.render(writer, cell, 'f-grid-cell',
            'left:' + column.__start + 
            'px;top:' + y + 
            'px;width:' + width + 
            'px;height:' + height + 
            'px;line-height:' + height + 'px;' +
            any);

        return cell;
    };


    this.mount = function (view, row, start, end, fragment) {

        var grid = row.grid,
            tag = null,
            cells = row.__cells,
            cell,
            node;

        while (start < end)
        {
            if (cell = cells[start++])
            {
                if (node = cell.view)
                {
                    tag = node;
                }
                else if (node = view.firstChild)
                {
                    fragment.insertBefore(node, tag);

                    cell.parent = grid;
                    cell.renderer.mount(cell, node);
                }
            }
        }
    };


    this.unmount = function (row) {

        var cells = row.__cells,
            cell;

        for (var i = cells && cells.length - 1; i >= 0; i--)
        {
            if (cell = cells[i])
            {
                cell.parent = null;
                cell.renderer.unmount(cell);
            }
        }
    };


});



flyingon.renderer('GroupGridRow', 'GridRow', function (base) {


    this.render = function (writer, row, column, y, height) {

        var storage = column.__storage,
            name,
            summary;

        if ((summary = storage && storage.summary) && (name = storage.name))
        {
            var cell = new flyingon.Label(),
                fn,
                any;

            cell.row = row;
            cell.column = column;
            cell.__as_html = true;

            fn = column.__summary_fn || (column.__summary_fn = flyingon.summary_fn(summary));
            any = row.compute(column, name, fn[0], fn[1]);

            if (!(fn = column.onsummary) || !(any = fn.call(column, row, any, summary)))
            {
                any = summary + '=' + any.toFixed(storage.precision);
            }

            cell.text(any);

            cell.renderer.render(writer, cell, 'f-grid-group-row',
                'left:' + column.__start + 
                'px;top:' + y + 
                'px;width:' + column.__size + 
                'px;height:' + height + 
                'px;line-height:' + height + 'px;');

            return cell;
        }
    };



});



flyingon.renderer('Grid', function (base) {



    //拖动列时的辅助线
    var drag_thumb;

    //调整列宽时的辅助线
    var resize_thumb = document.createElement('div');

    resize_thumb.className = 'f-grid-resize-thumb';

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



    this.render = function (writer, grid, className, cssText) {

        var storage = grid.__storage || grid.__defaults,
            group = storage.group,
            header = storage.header,
            top = group + header,
            block = template;

        writer.push('<div');

        this.renderDefault(writer, grid, className, cssText);

        writer.push(' onclick="flyingon.Grid.onclick.call(this)">',
            '<div class="f-grid-head" onmousedown="flyingon.Grid.onmousedown.call(this, event)">',
                '<div class="f-grid-group-box" style="height:', group, 'px;line-height:', group, 'px;', group < 2 ? 'display:none;' : '', '"></div>',
                '<div class="f-grid-column-head" style="height:', header, 'px;', header < 2 ? 'display:none;' : '', '" onmouseover="flyingon.Grid.onmouseover.call(this, event)">', 
                    block,
                    '<div class="f-grid-resize" style="display:none;" onmousedown="flyingon.Grid.resize.call(this, event)"></div>',
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

        var any;

        base.mount.call(this, grid, view);

        view = view.firstChild;

        grid.view_group = any = view.firstChild;
        grid.view_head = any.nextSibling;
        grid.view_scroll = any = view.nextSibling;
        grid.view_body = any.nextSibling;

        grid.on('mousewheel', mousewheel);
    };


    this.unmount = function (grid) {

        var view = grid.view.lastChild;

        flyingon.dom_off(grid.view_head);

        grid.view_group = grid.view_head = grid.view_scroll = grid.view_body = null;

        base.unmount.call(this, grid);
    };

    
    function mousewheel(event) {

        this.view_scroll.scrollTop -= event.wheelDelta * 100 / 120;
        flyingon.dom_stop(event);
    };
    


    flyingon.Grid.onclick = function (e) {

        if (click_disabled)
        {
            click_disabled = false;
        }
        else
        {

        }
    };



    flyingon.Grid.onmouseover = function (e) {

        var target = e.target || e.srcElement,
            grid,
            column,
            cell,
            any;

        if (target.className.indexOf('f-grid-cell') >= 0 && 
            (cell = flyingon.findControl(target)) &&
            (grid = flyingon.findControl(this)) &&
            (column = cell.column))
        {
            //处理跨列
            if (any = cell.columnSpan)
            {
                column = grid.__columns[column.absoluteIndex + any];
            }

            if (column && column.resizable())
            {
                var dom = grid.view_head.lastChild,
                    style = dom.style;

                dom.column = column;

                style.left = target.parentNode.offsetLeft + target.offsetLeft + target.offsetWidth - 3 + 'px';
                style.top = target.offsetTop + 'px';
                style.height = target.offsetHeight + 'px';
                style.display = '';
            }
        }
    };


    flyingon.Grid.resize = function (e) {

        var grid = flyingon.findControl(this),
            view = grid.view,
            column = this.column,
            dom = this,
            left = 0,
            data = { 
                grid: grid, 
                column: column,
                size: column.__size 
            };

        grid.__column_dirty = true;
        grid.view.appendChild(e.dom = resize_thumb);

        while (dom !== view)
        {
            left += dom.offsetLeft;
            dom = dom.parentNode;
        }

        e.dom.style.left = left + 'px';
        grid.view_head.style.cursor = 'ew-resize';

        flyingon.dom_drag(data, e, null, do_resize, resize_end, 'y', false);
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

        grid.view_head.style.cursor = '';
        grid.view.removeChild(resize_thumb);

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
                index: column.absoluteIndex,
                count: count,
                from: from  //标记从分组框拖出
            },
            event,
            start_drag,
            do_drag,
            end_drag);

        click_disabled = true;
    };


    function start_drag(e) {

        var grid = this.grid,
            storage = grid.__storage || grid.__defaults,
            dom = this.dom,
            thumb = this.thumb = drag_thumb || init_drag_thumb(),
            count = this.count,
            style,
            any;

        this.group = any = storage.group;
        this.groups = storage.groups;
        this.header = storage.header;

        any = grid.view.firstChild.getBoundingClientRect();

        this.left = any.left;
        this.top = any.top;

        any = dom.cloneNode(true);

        //从分组框拖出
        if (this.from)
        {
            any.style.cssText = 'position:absolute;z-index:2;left:' 
                + dom.offsetLeft + 'px;top:' 
                + dom.offsetTop + 'px;';

            dom = any;

            any = this.groups.replace(this.name, '');
            any = grid.renderer.__render_group(grid, any);

            grid.__set_groups(storage.groups = any);
        }
        else //拖动列
        {
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

            if (this.groups)
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

            if ((any = this.groups) && (any = any.match(/\w+/g)))
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
            //显示列
            for (var i = 0; i < count; i++)
            {
                columns[index + i].__visible = true;
            }

            //如果顺序发生变化则调整列顺序
            if (this.at !== index)
            {
                grid.__reorder_column(this.at, index, count);
            }

            grid.update(true);
        }
    };


    function init_drag_thumb() {

        var dom = drag_thumb = document.createElement('div'),
            name = 'f-grid-column-thumb';

        dom.innerHTML = '<div class="' + name + '-body"><div></div></div>';
        dom.className = name;
        dom.style.width = '20px';

        return dom;
    };



    flyingon.Grid.onscroll = function () {

        var grid = flyingon.findControl(this),
            x = this.scrollLeft,
            y = this.scrollTop;

        if (grid.scrollLeft !== x)
        {
            grid.renderer.__do_hscroll(grid, grid.scrollLeft = x);
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
        if ((any = storage.group) > 0 && grid.__group_dirty)
        {
            height -= any;
            grid.__group_dirty = false;
            this.__render_group(grid, storage.groups);
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
        any = this.__show_body(grid, grid.__view.current(), height);

        //排列横向锁定区域
        this.__layout_locked(grid, columns.__locked, any);
    };



    //显示列头
    this.__show_header = function (grid, columns, height) {

        var view = grid.view_head.lastChild.previousSibling,
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
    };



    //显示列头
    this.show_header = function (view, columns, start, end, height) {

        var writer = [],
            tag = columns.__show_tag,
            fragment = dom_fragment,
            index = start,
            column,
            node,
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

            while (start < end)
            {
                if ((column = columns[start++]).__visible && !column.view)
                {
                    column.renderer.mount(column, any, fragment);
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



    //显示内容
    this.__show_body = function (grid, rows, height) {

        var view = grid.view_body.lastChild,
            storage = grid.__storage || grid.__defaults,
            start = grid.__locked_top,
            end = rows.length,
            rowHeight = rows.__row_height = storage.rowHeight,
            size = end * rowHeight,
            vscroll = size > height,
            any;

        grid.view_scroll.firstChild.style.height = size + 'px';
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
        any += start + 8; //多渲染部分行以减少滚动处理

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


    //显示过滤栏
    this.__show_filter = function (grid, column, height) {

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
            this.show_group(view, rows, start, end, top, rowHeight);
        }

        //left lock
        view = view.previousSibling;

        if (column_start)
        {
            this.show_rows(view, rows, start, end, columns, 0, column_start, top, rowHeight);
        }

        //right lock
        view = view.previousSibling;

        if (any = locked[1])
        {
            this.show_rows(view, rows, start, end, columns, column_end - any, column_end, top, rowHeight);
        }

        //scroll
        this.show_rows(view.previousSibling, rows, start, end, columns, columns.__show_start, columns.__show_end, top, rowHeight);
    };


    //显示表格行
    this.show_rows = function (view, rows, start, end, columns, column_start, column_end, top, height) {

        var writer = [], 
            tag = columns.__show_tag,
            fragment = dom_fragment, 
            row, 
            any;

        for (var i = start; i < end; i++)
        {
            (row = rows[i]).renderer.show(fragment, writer, row, columns, column_start, column_end, top, height, tag);
            top += height;
        }

        if (writer[0])
        {
            any = dom_host;
            any.innerHTML = writer.join('');

            for (var i = start; i < end; i++)
            {
                (row = rows[i]).renderer.mount(any, row, column_start, column_end, fragment);
            }
        }

        while (any = view.lastChild)
        {
            view.removeChild(any);
        }

        view.appendChild(fragment);
    };


    //显示分组行
    this.show_group = function (view, rows, start, end, top, height) {

        var writer = [],
            row;

        while (start < end)
        {
            if ((row = rows[start++]) && row.__group_row)
            {
                writer.push('<div class="f-grid-group-row" style="top:', top, 'px;height:', height, 'px;line-height:', height, 'px;left:0;">',
                    '<span class="f-grid-expand" style="margin-left:', row.level * 20, 'px;"></span>',
                    '<span> ', row.text, ' (', row.total, ')</span>', 
                    '<div class="f-grid-group-line"></div>',
                '</div>');
            }

            top += height;
        }

        view.innerHTML = writer.join('');
    };



    //渲染分组框
    this.__render_group = function (grid, groups) {

        var writer = [],
            columns = grid.__columns,
            column,
            cells,
            name;

        if (groups && (groups = groups.match(/\w+/g)))
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

        return groups ? groups.join(' ') : '';
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
            var rows = grid.__view.current(),
                any;
            
            view =  grid.view_body.firstChild;
            height = rows.__row_height;

            if (any = grid.__locked_top)
            {
                this.show_rows(view.nextSibling.firstChild, rows, 0, any, columns, start, end, 0, height);
            }

            if (any = grid.__locked_bottom)
            {
                this.show_rows(view.nextSibling.nextSibling.firstChild, rows, rows.length - any, rows.length, columns, start, end, 0, height);
            }

            this.show_rows(view.firstChild, rows, any = rows.__show_start, rows.__show_end, columns, start, end, any * height, height);
        }
    };


    //处理竖直滚动
    this.__do_vscroll = function (grid, top) {

        var rows = grid.__view.current(),
            view = grid.view_body.firstChild;

        view.style.top = -top + 'px';

        if (!this.__visible_rows(grid, rows, top, true))
        {
            this.__show_rows(grid, view, rows, rows.__show_start, rows.__show_end, true);
        }
    };


});