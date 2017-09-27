var url_base = 'flyingon/samples/base/';

var url_layout = 'flyingon/samples/layout/';

var url_controls = 'flyingon/samples/controls/';

var url_grid = 'flyingon/samples/grid/';


var menuList = [

    {
        text: 'flyingon基础', 
        children: [
            { text: 'js插件', url: url_base + 'plugin-js.js' },
            { text: 'widget插件', url: url_base + 'plugin-widget.js' },
            { text: 'html插件', url: url_base + 'plugin.html' },
            { text: '序列化', url: url_base + 'serialize.html' },
            { text: '数据绑定', url: url_base + 'data-bind.html' },
            { text: '选择器', url: url_base + 'selector.js' },
            { text: 'widget', url: url_base + 'widget.html' },
            { text: '多级路由', url: url_base + 'route.js' },
            { text: '校验', url: url_base + 'validate.js' }
        ]
    },

    {
        text: '布局', 
        children: [
            { text: '线性布局', url: url_layout + 'line.js' },
            { text: '流式布局', url: url_layout + 'flow.js' },
            { text: '停靠布局', url: url_layout + 'dock.js' },
            { text: '表格布局', url: url_layout + 'table.js' },
            { text: '自适应', url: url_layout + 'adaption.js' },
            { text: '子布局', url: url_layout + 'sublayout.js' }
        ]
    },

    {
        text: '控件', 
        children: [
            { text: 'Label', url: url_controls + 'label.js' },
            { text: 'Button', url: url_controls + 'button.js' },
            { text: 'LinkButton', url: url_controls + 'linkbutton.js' },
            { text: 'Image', url: url_controls + 'image.js' },
            { text: 'Slider', url: url_controls + 'slider.js' },
            { text: 'ProgressBar', url: url_controls + 'progressbar.js' },
            { text: 'RadioButton', url: url_controls + 'radiobutton.js' },
            { text: 'CheckBox', url: url_controls + 'checkbox.js' },
            { text: 'TextBox', url: url_controls + 'textbox.js' },
            { text: 'Memo', url: url_controls + 'memo.js' },
            { text: 'TextButton', url: url_controls + 'textbutton.js' },
            { text: 'ListBox', url: url_controls + 'listbox.js' },
            { text: 'ComboBox', url: url_controls + 'combobox.js' },
            { text: 'Number', url: url_controls + 'number.js' },
            { text: 'Calendar', url: url_controls + 'calendar.js' },
            { text: 'Date', url: url_controls + 'date.js' },
            { text: 'Time', url: url_controls + 'time.js' },
            { text: 'Month', url: url_controls + 'month.js' },
            { text: 'Panel', url: url_controls + 'panel.js' },
            { text: 'GroupBox', url: url_controls + 'groupbox.js' },
            { text: 'Tab', url: url_controls + 'tab.js' },
            { text: 'Tree', url: url_controls + 'tree.js' },
            { text: 'Popup', url: url_controls + 'popup.js' },
            { text: 'ToolTip', url: url_controls + 'tooltip.js' },
            { text: 'Dialog', url: url_controls + 'dialog.js' },
            { text: 'Message', url: url_controls + 'showmessage.js' },
            { text: 'Menu', url: url_controls + 'menu.js' },
            { text: 'ToolBar', url: url_controls + 'toolbar.js' },
            {
                text: 'Grid', 
                children: [
                    { text: '多行列头', url: url_grid + 'multi-title.js' },
                    { text: '自定义列头', url: url_grid + 'custom-title.js' },
                    { text: '自定义渲染', url: url_grid + 'custom-render.js' },
                    { text: '单元格合并', url: url_grid + 'cell-merge.js' },
                    { text: '分页', url: url_grid + 'pagination.js' },
                    { text: '锁定', url: url_grid + 'locked.js' },
                    { text: '分组', url: url_grid + 'group.js' },
                    { text: '树表', url: url_grid + 'tree-grid.js' },
                    { text: '一万列测试', url: url_grid + 'demo1.js' },
                    { text: '十万行测试', url: url_grid + 'demo2.js' },
                    { text: '行号列', url: url_grid + 'column-no.js' },
                    { text: '选择列', url: url_grid + 'column-check.js' },
                    { text: '编辑列', url: url_grid + 'column-edit.js' }
                ]
            }
        ]
    }
    

];

