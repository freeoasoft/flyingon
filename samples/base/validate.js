flyingon.widget({

    template: {

        Class: 'Plugin',
        padding: 8,
        layout: 'vertical-line',

        children: [
            {
                Class: 'Panel',
                width: 780,
                height: 32,

                children: [
                    { Class: 'Button', text: '校验' }
                ]
            },
            {
                Class: 'Panel',
                className: 'f-border',
                width: 780,
                height: 'auto',
                border: 1,
                padding: 4,
                layout: 'vertical-line',

                children: [
                    {
                        Class: 'Box', 
                        width: 265,
                        // children: [
                        //     {
                        //         Class: 'Title',
                        //         text: '用户名'
                        //     },
                        //     {
                        //         Class: 'TextBox', 
                        //         required: true,
                        //         validator: 'length:6:20'
                        //     },
                        //     {
                        //         Class: 'Error', 
                        //         line: true,
                        //         style: 'text-align:right;'
                        //     }
                        // ]
                    },
                    { 
                        Class: 'Box',
                        width: 265,
                        children: [
                            {
                                Class: 'Title',
                                text: '密码'
                            },
                            {
                                Class: 'Password', 
                                required: true,
                                validator: 'minLength:2|password:6'
                            },
                            {
                                Class: 'Error', 
                                line: true,
                                style: 'text-align:right;'
                            }
                        ]
                    },
                    {
                        Class: 'Box', 
                        children: [
                            {
                                Class: 'Title',
                                text: '邮件地址'
                            },
                            {
                                Class: 'TextBox', 
                                required: true,
                                validator: 'email' 
                            },
                            {
                                Class: 'Error', 
                                type: 'warn'
                            }
                        ]
                    },
                    {
                        Class: 'Box', 
                        children: [
                            {
                                Class: 'Title',
                                text: '说明'
                            },
                            {
                                Class: 'TextBox', 
                                //required: true,
                                validator: 'minLength:10' 
                            }
                        ]
                    }
                ]
            },

            { Class: 'Code' }
        ]
    },

    created: function () {

        var text = new flyingon.TextBox().validator('length:6:20');

        this[1][0].push({ Class: 'Title', text: '用户名' }, text);

        //自定义密码校验器
        flyingon.validator('password', function (text, length) {

            if (text.length < length || text.length > 20 || !/[a-zA-Z]/.test(text) && /\d/.test(text))
            {
                return '密码长度必须在6-20之间且同时包含字母及数字';
            }
        });


        //自定义错误显示
        function custom_error(errors) {

            for (var i = 0, l = errors.length; i < l; i++)
            {
                var error = errors[i];

                //error.control  //control
                //error.name     //规则名称
                //error.text     //错误信息
            }
        };


        this[0][0].on('click', function (e) {

            var errors = flyingon.validate(this.parent.parent[1]);

            if (errors.length > 0)
            {
                custom_error(errors);
            }
        });


        this.on('change', function (e) {

            flyingon.validate(e.target);
        });

    }


});