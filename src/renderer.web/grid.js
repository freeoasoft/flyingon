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
            render_header(writer, column, cells[0], 0, column.width, height);
        }
    };



    function render_multi(writer, column, cells, height) {

        var width = column.width,
            length = cells.length,
            y1 = 0,
            y2,
            cell;

        for (var i = 0; i < length; i++)
        {
            cell = cells[i];

            y2 = cell.__column_size;
            y2 = y2 > 0 ? y2 : (height / (length - i) | 0);
   
            render_header(writer, column, cell, y1, cell.__column_width || column.width, y2);

            y1 += y2;
            height -= y2;
        }
    };



    function render_header(writer, column, cell, y, width, height) {

        cell.row = null;
        cell.column = column;
        cell.__as_html = true;

        cell.renderer.render(writer, cell, 'f-grid-cell', 
            'left:' + column.left + 
            'px;top:' + y +
            'px;width:' + width + 
            'px;height:' + height + 
            'px;line-height:' + height + 'px;' + 
            (cell.__column_count > 1 ? 'z-index:1;' : ''));
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
                size = cell.size;
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


    this.show = function (fragment, writer, row, columns, start, end, y, height) {

        var cells = row.__cells || (row.__cells = []),
            cell;

        while (start < end)
        {
            if (cell = cells[start])
            {
                fragment.appendChild(cell.view);
            }
            else
            {
                cells[start] = this.render(writer, row, columns[start], y, height);
            }

            start++;
        }
    };


    this.render = function (writer, row, column, y, height) {

        var cell = column.__create_control(row),
            width = column.width,
            span,
            any;

        //自定义渲染单元格
        if (any = column.onrender)
        {
            any.call(column, cell, row, column);

            if ((any = cell.rowSpan) && (any |= 0) > 0)
            {
                span = 1;
                height += any * height;
            }

            if ((any = cell.columnSpan) && (any |= 0) > 0)
            {
                span = 1;
                width += column.__span_width(any);
            }
        }

        cell.row = row;
        cell.column = column;
        cell.__as_html = true;

        cell.renderer.render(writer, cell, 'f-grid-cell',
            'left:' + column.left + 
            'px;top:' + y + 
            'px;width:' + width + 
            'px;height:' + height + 
            'px;line-height:' + height + 'px;' +
            (span ? 'z-index:1;' : ''));

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
            cell = cells[start++];

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
    };


    this.unmount = function () {

        var cells = row.__cells,
            cell,
            node;

        while (start < end)
        {
            cell = cells[start++];
            cell.parent = null;
            cell.renderer.unmount(cell);
        }
    };


});



flyingon.renderer('GroupGridRow', 'GridRow', function (base) {

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

    //动态管理子节点的临时节点
    var dom_fragment = document.createDocumentFragment();

    //动态生成html片段的dom容器
    var dom_host = document.createElement('div');



    this.padding = 0;



    this.render = function (writer, grid, className, cssText) {

        var storage = grid.__storage || grid.__defaults,
            group = storage.group,
            header = storage.header,
            top = group + header,
            block = '<div class="f-grid-center"></div>' 
                + '<div class="f-grid-left" style="display:none;"></div>'
                + '<div class="f-grid-right" style="display:none;"></div>';

        writer.push('<div');

        this.renderDefault(writer, grid, className, cssText);

        writer.push(' onclick="flyingon.Grid.onclick.call(this)">',
            '<div class="f-grid-head" onmousedown="flyingon.Grid.onmousedown.call(this, event)">',
                '<div class="f-grid-group" style="height:', group, 'px;line-height:', group, 'px;', group < 2 ? 'display:none;' : '', '"></div>',
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
                '<div class="f-grid-top" style="display:none;">', block, '</div>',
                '<div class="f-grid-bottom" style="display:none;">', block, '</div>',
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
    };


    this.unmount = function (grid) {

        var view = grid.view.lastChild;

        flyingon.dom_off(grid.view_head);

        grid.view_group = grid.view_head = grid.view_scroll = grid.view_body = null;

        base.unmount.call(this, grid);
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
            cell;

        if (target.className.indexOf('f-grid-cell') >= 0 && 
            (cell = flyingon.findControl(target)) &&
            (grid = flyingon.findControl(this)) &&
            (column = cell.column) && column.resizable())
        {
            var dom = grid.view_head.lastChild,
                style = dom.style;

            dom.column = column;

            style.left = target.parentNode.offsetLeft + target.offsetLeft + target.offsetWidth - 3 + 'px';
            style.top = target.offsetTop + 'px';
            style.height = target.offsetHeight + 'px';
            style.display = '';
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
                width: column.width 
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

        var width = this.width;

        if (width + e.distanceX < 1)
        {
            e.distanceX = -width + 1;
        }
    };


    function resize_end(e) {

        var grid = this.grid,
            column = this.column,
            storage = column.storage(),
            any = this.width + e.distanceX;

        grid.view_head.style.cursor = '';
        grid.view.removeChild(resize_thumb);

        if (storage.size !== any)
        {
            storage.size = any;

            //触发列调整大小事件
            if (any = grid.oncolumnresize)
            {
                any.call(grid, column, storage.size, this.width);
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
                        check_drag(this, dom, any, '', cell.__column_count || 1);
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
                count: column.__column_count || 1,
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

            any =  this.groups.replace(this.name, '').replace('  ', ' ');
            grid.renderer.__render_group(grid, this.groups = storage.groups = any);
        }
        else //拖动列
        {
            style = any.style;
            style.borderWidth = '1px';
            style.left = dom.offsetLeft + dom.parentNode.offsetLeft + 'px';
            style.top = dom.offsetTop + dom.parentNode.parentNode.offsetTop + 'px';

            dom = any;

            hide_header(grid.__columns, this.index, count);
            grid.update(true);
        }

        e.dom = dom;
        dom.style.zIndex = 2;

        any = grid.view.firstChild;
        any.appendChild(thumb);
        any.appendChild(dom);
    };


    //隐藏列头
    function hide_header(columns, index, length) {

        var column;

        while (length-- > 0)
        {
            column = columns[index + length];
            column.__visible = false;
        }
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
            locked = columns.locked,
            start = locked[0],
            end = columns.length,
            offset = 0,
            left = 0,
            width = 0,
            column;

        //在左锁定区
        if (start && locked[2] > x)
        {
            end = start;
            start = 0;
        }
        else if (locked[1] && x > (offset = columns.arrangeWidth - locked[3])) //在右锁定区
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
                left = column.left;
                width = column.width;

                if (left + (width >> 1) > x)
                {
                    context.at = start - 1;
                    return left + offset;
                }

                if (left + width > x)
                {
                    break;
                }
            }
        }

        context.at = start;
        return left + width + offset;
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
            any = this.at;

            if (any > index)
            {
                any--;
            }

            list.push(any, 0);

            for (var i = 0; i < count; i++)
            {
                any = columns[index + i];
                any.__visible = true;

                list.push(any);
            }

            list.splice.call(columns, index, count);
            list.splice.apply(columns, list);

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
            grid.__column_dirty = true;

            this.__render_group(grid, storage.groups);
        }

        //计算列宽度
        if ((any = grid.__column_dirty) || columns.arrangeWidth !== width)
        {
            grid.__column_dirty = false;
            
            columns.__compute_size(width);
            columns.__compute_visible(x);
        }
        else if (columns.arrangeLeft !== x)
        {
            columns.__compute_visible(x);
        }

        //控制水平滚动条
        if (columns.width > width)
        {
            any = flyingon.hscroll_height;
            height -= any;
        }
        else
        {
            any = 1;
        }

        grid.view_body.style.bottom = any + 'px';
        grid.view_scroll.firstChild.style.width = columns.width + 'px';

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
        this.__layout_locked(grid, columns.locked, any);
    };



    //显示列头
    this.__show_header = function (grid, columns, height) {

        var view = grid.view_head.firstChild,
            dom = view.nextSibling,
            locked = columns.locked,
            any;

        //显示前锁定
        if (any = locked[0])
        {
            this.show_header(dom, columns, 0, any, height);
        }

        //显示后锁定
        if (any = locked[1])
        {
            this.show_header(dom.nextSibling, columns, columns.length - any, columns.length, height);
        }

        //显示可见区
        this.show_header(view, columns, columns.__show_start, columns.__show_end, height);
    };



    //显示列头
    this.show_header = function (view, columns, start, end, height) {

        var writer = [],
            fragment = dom_fragment,
            index = start,
            column,
            node,
            style,
            cells,
            cell,
            dirty,
            any;

        while (index < end)
        {
            if ((column = columns[index++]).__visible)
            {
                if (column.view)
                {
                    any = 0;
                    dirty = column.dirty;
                    cells = column.__cells;

                    while (cell = cells[any++])
                    {
                        node = cell.view;

                        if (dirty)
                        {
                            column.dirty = false;

                            style = node.style;
                            style.left = column.left + 'px';
                            style.width = (cell.__column_width || column.width) + 'px';
                        }

                        fragment.appendChild(node);
                    }
                }
                else
                {
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

        var view = grid.view_body,
            scroll = view.firstChild,
            top = scroll.nextSibling,
            bottom = top.nextSibling,
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
            top.style.display = '';
            top.style.height = (size = start * rowHeight) + 'px';

            height -= size;

            this.__show_rows(grid, top, rows, 0, start);
        }
        else
        {
            size = 0;
            top.style.display = 'none';
        }

        //调整滚动区位置
        scroll.style.top = -(grid.scrollTop | 0) + 'px';

        //显示底部锁定
        if ((any = grid.__locked_bottom) > 0)
        {
            bottom.style.display = '';
            bottom.style.height = (size = any * rowHeight) + 'px';

            height -= size;

            this.__show_rows(grid, bottom, rows, end - any, end);
            end -= any;
        }
        else
        {
            bottom.style.display = 'none';
        }

        //显示滚动区
        rows.__arrange_height = height;

        if (vscroll)
        {
            this.__visible_rows(grid, rows, grid.scrollTop | 0);
        }
        else
        {
            rows.__show_start = start;
            rows.__show_end = end;
        }

        this.__show_rows(grid, scroll, rows, rows.__show_start, rows.__show_end, true);

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

        any = (rows.__arrange_height / rowHeight) | 0;
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
            scroll = grid.scrollLeft | 0;

        if (vscroll = vscroll && right > 0)
        {
            right += 2;
        }

        layout_locked(view, left, vscroll ? right + flyingon.vscroll_width : right, scroll);

        view = grid.view_body.firstChild;

        layout_locked(view, left, right, scroll);
        layout_locked(view = view.nextSibling, left, right, scroll);
        layout_locked(view.nextSibling, left, right, scroll);
    };


    function layout_locked(view, left, right, scroll) {

        var dom = view.firstChild,
            style = dom.style;

        style[flyingon.rtl ? 'right' : 'left'] = -scroll + 'px';

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

        style = dom.nextSibling.style;

        if (right > 0)
        {
            style.width = right + 'px';
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
            locked = columns.locked,
            rowHeight = rows.__row_height,
            c1 = locked[0],
            c2 = columns.length,
            top = scroll ? start * rowHeight : 0,
            any;

        if (c1)
        {
            this.show_rows(view.firstChild.nextSibling, rows, start, end, columns, 0, c1, top, rowHeight);
        }

        if (any = locked[1])
        {
            this.show_rows(view.lastChild, rows, start, end, columns, c2 - any, c2, top, rowHeight);
            c2 -= any;
        }

        this.show_rows(view.firstChild, rows, start, end, columns, columns.__show_start, columns.__show_end, top, rowHeight);
    };


    //显示表格行
    this.show_rows = function (view, rows, row_start, row_end, columns, column_start, column_end, top, height) {

        var writer = [], 
            fragment = dom_fragment, 
            row, 
            any;

        for (var i = row_start; i < row_end; i++)
        {
            (row = rows[i]).renderer.show(fragment, writer, row, columns, column_start, column_end, top, height);
            top += height;
        }

        if (writer[0])
        {
            any = dom_host;
            any.innerHTML = writer.join('');

            for (var i = row_start; i < row_end; i++)
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



    //渲染分组
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