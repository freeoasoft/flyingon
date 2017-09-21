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
                height: 200,
                border: 1,
                padding: 4,
                layout: 'vertical-line',

                children: [
                    { 
                        Class: 'Panel', 
                        layout: 'line', 
                        height: 30, 
                        padding: 2, 
                        children: [
                            { Class: 'Title', text: '用户名', required: true },
                            { 
                                Class: 'TextBox', 
                                id: 'user', 
                                width: 200, 
                                validator: 'required|length:6:20', value: '' 
                            }
                        ]
                    },
                    { 
                        Class: 'Error', 
                        target: 'user', 
                        width: 260, 
                        style: 'text-align:right;', 
                        validator: 'required', 
                        text: '用户名不能为空'
                    },
                    {
                        Class: 'Error', 
                        target: 'user', 
                        width: 260, 
                        style: 'text-align:right;', 
                        validator: 'length', 
                        text: '用户名长度只能在{{1}}到{{2}}位之间' 
                    },
                    { 
                        Class: 'Panel', 
                        layout: 'line', 
                        height: 30, 
                        padding: 2, 
                        children: [
                            { Class: 'Title', text: '密码', required: true },
                            { Class: 'Password', id: 'password', width: 200, validator: 'password', value: '' },
                        ]
                    },
                    { 
                        Class: 'Error', 
                        target: 'password', 
                        width: 260, 
                        style: 'text-align:right;', 
                        text: '密码必须是8-20位长度且同时包含字母及数字' 
                    }
                ]
            },

            { Class: 'Code' }
        ]
    },

    created: function () {


        //自定义密码校验器
        flyingon.validator('password', function (text) {

            return text && text.length >= 8 && text.length <= 20 && /[a-zA-Z]/.test(text) && /\d/.test(text);
        });


        //自定义错误显示
        function custom_error(errors) {

            for (var i = 0, l = errors.length; i < l; i++)
            {
                var error = errors[i];

                //error.control  //control
                //error[0]       //name
                //error[1]       //第一个参数
                //error[2]       //第二个参数
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