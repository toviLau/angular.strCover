/**
 * [手机号/固定电话/银行卡/普通数字卡号/身份证/姓名/用户名/电子邮箱]隐私保护遮挡
 * 自动匹配字符串模式类型
 *      手机号码:   {{'13563368008' | strCover:"{format:true,hidden:true}"}}        --> 136 **** 8008
 *      手机号码:   {{'13563368008' | strCover:"{format:true,hidden:false}"}}       --> 136 6336 8008
 *      手机号码:   {{'13563368008' | strCover:"{format:false,hidden:true}"}}       --> 136****8008
 *      手机号码:   {{'13563368008' | strCover:"{format:false,hidden:false}"}}      --> 13663368008
 *      16位银行卡: {{'6226431780096555' | strCover:"{format:true,hidden:true}"}}   --> 6226 **** **** 6555
 *      19位银行卡: {{'6226431780096555001' | strCover:"{format:true,hidden:true}"}}--> 6226 **** **** **** 001
 * @author ToviLau 46134256@qq.com
 * @date   2016-09-27T13:53:38+0800
 * @version 1.1.1
 * @param  {str} str 要匹配的字符串
 * @param  {json} obj 配制
 *                  hidden:是否隐藏
 *                  format:是否格式化
 * @return 输出匹配字串
 */
define(['./module'], function(filters) {
    'use strict';
    filters.filter('strCover', function() {
        return function(str, conf) {
            var server = {
                init: function() { // 初始化
                    if (!str) return '--';  // 空对象反回 '--';
                    this._str   = str;      // 原字符串
                    this.str    = this._str.toString().replace(/\s/ig, ''); // 去除字符串之间空字符(空格/制表位/回车)
                    this.oType  = this.macthType(this.str, this.patten);    // 匹配字符串所属的类型
                    this.isFormat = this.strToJson.format == 'true' || !!parseInt(this.strToJson.format) ? true : false; // 是否格式化(默认false)
                    this.isHidden = this.strToJson.hidden == 'true' || !!parseInt(this.strToJson.hidden) ? true : false; // 是否保护隐私(默认false)
                    return this.opStrFn(this.oType);    //处理当前类型的字符串格式化与隐藏操作
                },
                patten: { // 正则匹配字符串(可用于字符(折分/切割)转为数组规则
                    mobile      : /^(((\+\d{1,4})|(0))?1\s*[3|4|5|7|8|9]\s*\d\s*)(\d{4}\s*)(\d{4}\s*)$/i,   // 匹配可带国际区号的大陆手机号(+8613612345678) or (17112345678)
                    telephone   : /^((((\+86)|0)?[1-9]{2,4}[-])?)([^0^1]\d{1})(\d{3,4})(\d{2})(([-\s]\d{3,4})?)$/,  // 固话
                    email       : /^([\w-\.]+)((@[\w\-]+)(.[\-\w]+){0,2}(.[a-z]{2,5}))$/ig, // 电子邮箱
                    idNo_       : /^((11|12|13|14|15|21|22|23|31|32|33|34|35|36|37|41|42|43|44|45|46|50|51|52|53|54|61|62|63|64|65|71|81|82)\d{4})(((19)|(20))\d{2}([0][1-9]|[1][012])([0][1-9]|[12][0-9]|[3][01])\d)(\d{2}[\d|x])$/i,  //匹配身份证
                    bankCard    : /^(35|37|40|41|42|43|45|47|48|49|51|52|53|54|55|60|62|64|91|95|99)(\d{14}|\d{17})$/i, //匹配(16位|19位) 银行卡
                    otherCard   : /^(\d{5,35})$/i, //期它数字卡号
                },
                strToJson: JSON.parse(conf.toString().replace(/['"]?(\w+)['"]?/ig, '"$1"')),    // 把配制参数转成JSON对象
                // isFormat: function() {
                //  return this.strToJson.format == 'true' || !!parseInt(this.strToJson.format) ? true : false; // 是否格式化(默认false)
                // },
                // isHidden: function() {
                //  return this.strToJson.hidden == 'true' || !!parseInt(this.strToJson.hidden) ? true : false; // 是否保护隐私(默认false)
                // },
                macthType: function(a, b) { // 自动检测字符串正则匹配模式(要匹配的对象,正则对象),默认:defualt
                    for (var a in b) {
                        if (b[a].test(this.str) == true) return a;
                    }
                    return 'default';
                },
                /**
                 * 隐私保护：把字符串替换成"*"
                 * @author ToviLau 46134256@qq.com
                 * @date   2016-09-22T09:54:17+0800
                 * @param  {str}    str     被替换字符串
                 * @param  {bool}   type    是否显示首尾部分，中间用替代符号
                 * @param  {str}    hStr    替代符号[默认:*]
                 * @return 替换成功字符
                 */
                strHiddenFn: function(str, type, hStr) {
                    if(!this.isHidden) return str;
                    var strArr      = str.split(''),
                        strLen      = strArr.length,
                        showStr     = Math.round(strLen * .26), //首尾显示字符数(百分比)
                        diffStr     = strLen - showStr * 2,
                        hStr        = hStr ? hStr : '*',
                        succ        = '';
                    for (var i = 0; i < strLen; i++) {
                        succ += (!!type || type == 1) ? hStr : ((i >= showStr && i < showStr + diffStr) ? hStr : strArr[i]);
                    }
                    return succ;
                },

                /**
                 * 处理姓名方法
                 * @author ToviLau 46134256@qq.com
                 * @date   2016-08-26T17:46:58+0800
                 * @update 2016-09-22T10:26:58+0800
                 * @param  {str}    _str     被替换的字符串
                 * @param  {str}    hddenStr 替代字符串
                 * @param  {int}    index    当前字串索引
                 * @param  {int}    arrLen   数组长度
                 */
                nameFn : function(_str, hiddenStr, index, arrLen) {
                    var nameCnExp       = /[\u4e00-\u9fa5]/ig, // 中文汉字正则不含标点符号
                        nameSubExp      = /(((\s*[A-Za-z])|[A-Z])[a-z0-9]*)/g, //姓名单个单词正则
                        newreplacestr   = '',
                        _this = this,
                        strType         = nameCnExp.test(_str) ? 'CN' : 'EN',
                        idx             = index <= 0 || isNaN(index) ? 0 : index,
                        arrLen          = !!parseInt(arrLen) ? parseInt(arrLen) : 1;
                    switch (strType) {
                        //英文名处理方式
                        case 'EN':
                            var obj = _str.match(nameSubExp), //当前单词这单字符为单拆成数组
                                objLen = obj.length,
                                hiddenStr = hiddenStr ? hiddenStr : '*';
                            angular.forEach(obj, function(v, i) { //Fn(当前单词拆分后的字符串,当前字符串所在单词的索引)
                            console.log('--------:nameEn:'+_str+'('+v+')--------');
                                if (arrLen == 1) {
                                    newreplacestr += _this.strHiddenFn(obj[i], 0,hiddenStr) //单个单词处理隐藏
                                } else {
                                    if (idx == 0 && i == 0) { //英文名在前第一个单词全显
                                        newreplacestr += obj[i];
                                    } else { //单词【首、尾】各保留26%字符显示，中间以星号(*)填充。
                                        var succ = _this.strHiddenFn(obj[i], 0,hiddenStr);
                                        newreplacestr += _this.isFormat ? ' ' + succ : succ;
                                    }
                                }
                            });
                            break;

                        //中文名处理方式(默认)
                        case 'CN':
                        default:
                            var strArr  = _str.match(nameCnExp), //以单个汉字为单位切割
                                nameLen = strArr.length - 1,
                                newName = this.isFormat ? ' ' : '',
                                hiddenStr = hiddenStr ? hiddenStr : '×';
                            for (var i = 0; i < nameLen; i++) { //从[第一个汉字-->倒数第二个汉字]开始匹配星号(×)，尾汉字保留。
                                console.log('--------:nameCn:'+_str+'('+strArr[i]+')--------');
                                newName += _this.isHidden ? hiddenStr : strArr[i];
                            }

                            newreplacestr += newName + strArr[nameLen];
                            newreplacestr = _this.isFormat ? ' ' + newreplacestr : newreplacestr;
                    }
                    return newreplacestr;
                },
                /**
                 * 开始操作
                 * @author ToviLau 46134256@qq.com
                 * @date   2016-09-27T10:56:02+0800
                 * @param  {str}    oType 正则匹配后的字符串类型
                 * @return 格式化式隐藏后字符
                 */
                opStrFn: function(oType) {
                    var _this = this;
                    var newStr = '';
                    switch (oType) {
                        case 'mobile':
                            console.log('--------:mobile:'+this.str+'--------');
                            /**
                             * 手机号格式化或隐藏
                             * @return && example
                             *  13 623 456 789 --- strCover:"{}" or strCover:"{'hidden':false,format:false} or '' ---> 13623456789
                             *  13 62 34567 89 --- strCover:"{'hidden':true,format:true}"    ---> 136 **** 6789
                             *  13623 456 7 89 --- strCover:"{'hidden':false,format:true}"   ---> 136 2345 6789
                             *  136 234 5678 9 --- strCover:"{'hidden':true,format:false}"   ---> 136****6789
                             */
                            newStr      = this.str.replace(this.patten.mobile, '$1,$5,$6').split(',');
                            newStr[1]   = this.isFormat ? ' ' + this.strHiddenFn(newStr[1], 1) + ' ' : this.strHiddenFn(newStr[1], 1);
                            this.result = newStr.toString().replace(/,/g, '');
                            break;

                        case 'telephone':
                            console.log('--------:telephone:'+this.str+'--------');
                            /**
                             *固定电话格式化或隐藏
                             * @return && example
                             * +86755-34565678-8789 --- strCover:"{}" or strCover:"{'hidden':false} ---> +86755-34565678-8789
                             * 0755-34565678-8789   --- strCover:"{'hidden':true}"    ---> 0755-34****78-8789
                             * 0755-3456567-8789    --- strCover:"{'hidden':true}"    ---> 0755-34***67-8789
                             * 0755-3456567         --- strCover:"{'hidden':true}"    ---> 0755-34***67
                             * 34565678-8789        --- strCover:"{'hidden':true}"    ---> 34****78-8789
                             * (国际区号{2-5})(区号{3-5})-2位(弹性{3-4位})2位 -分机号
                             * 主机号码显示7-8位隐藏中间三四位
                             */
                            newStr      = this.str.replace(this.patten.telephone, '$1,$4,$5,$6,$7').split(',');
                            this.result = newStr[0] + newStr[2] + this.strHiddenFn(newStr[3], 1) + newStr[4];
                            break;

                        //卡号合并处理16位19位银行卡 与 其它卡号
                        case 'bankCard':
                            console.log('--------:bankCard:'+this.str+'--------');
                            /**
                             * 16,19位数字卡号(通用银行卡号)
                             * 银行卡格式化或隐藏
                             * @return && example
                             *  2345345645675678    --> {'hidden':false,format:false} or {'hidden':false} or {format:false} or {} --> 2345345645675678
                             *  2345345645675678    --> {'hidden':false,format:true}    --> 2345 3456 4567 5678
                             *  2345345645675678    --> {'hidden':true,format:true}     --> 2345 **** **** 5678
                             *  2345345645675678    --> {'hidden':true,format:false}    --> 2345********5678
                             *  2345345645675678123 --> {'hidden':false,format:false} or {'hidden':false} or {format:false} or {} --> 2345345645675678123
                             *  2345345645675678123 --> {'hidden':false,format:true}    --> 2345 3456 4567 5678 123
                             *  2345345645675678123 --> {'hidden':true,format:true}     --> 2345 **** **** **** 123
                             *  2345345645675678123 --> {'hidden':true,format:false}    --> 2345************123
                             */
                            var splitExp = /\d{1,4}/ig;
                            //--------- no break-----------;
                        case 'otherCard':
                            console.log('--------:otherCard:'+this.str+'--------');
                            /**
                             * 其它数字卡号(非通用银行卡号)
                             * 银行卡格式化或隐藏
                             * @return && example
                             *  23453456456     --> {'hidden':false,format:false} or {'hidden':false} or {format:false} or {} --> 2345345645675678
                             *  234534564567    --> {'hidden':false,format:true}    --> 234 534 564 56
                             *  2345345645675   --> {'hidden':true,format:true}     --> 234 *** *** 567
                             *  23453456456756  --> {'hidden':true,format:false}    --> 234********756
                             */
                            var splitObj = splitExp || /\d{1,3}/ig, //普通卡号3位分组 银行卡4位一分组
                                strArr = this.str.match(splitObj), //把卡号格式化成数组
                                strArrLen = strArr.length; //卡号数组长度

                            if (strArrLen > 3) { //卡号分组长度大于3(3*3=9)
                                var result = '';
                                angular.forEach(strArr, function(v, i) {
                                    switch (i) {
                                        case 0:
                                        case strArrLen - 1:
                                            result += v;
                                            break;
                                        default:
                                            result += _this.isFormat == true ? ' ' + _this.strHiddenFn(v, 1) + ' ' : _this.strHiddenFn(v, 1);
                                    }
                                });
                                this.result = result;
                            } else {
                                this.result = this.strHiddenFn(this.str, 0);
                            }
                            break;

                        case 'email':
                            console.log('--------:email:'+this.str+'--------');
                            /**
                             * 电子邮箱格式化或隐藏
                             * 1、保留@与域名部分
                             * 2、帐户部分首尾各显示26%，最低显示1个字符
                             * liutaowei2001@163.com    ----- liu*******001@163.com
                             * 46134256@qq.com          ----- 46****56@QQ.com
                             * tovi@vip.qq.com          ----- t**i@vip.qq.com
                             * ltw@vip.qq.com           ----- l*w@vip.qq.com
                             */
                            newStr = this.str.replace(this.patten.email, '$1,$2').split(',');
                            this.result = (this.isHidden ? this.strHiddenFn(newStr[0]) : newStr[0]) + newStr[1];
                            break;

                        case 'idNo_':
                            console.log('--------:idNo_:'+this.str+'--------');
                            /**
                             * 身份证号格式化或隐藏[18位]
                             * @return && example
                             *  110101198901010013      -- strCover :"{'hidden':false}" or strCover:"{'hidden':false}" or ''    --> 110101198901010013
                             *  11010 11989 01010013    -- strCover :"{'hidden':true}"      --> 110101*********013
                             *  110101 19890101 0013    -- strCover :"{'hidden':false}"     --> 110101198901010013
                             *  110101198 90101 0013    -- strCover :"{'hidden':true}"      --> 110101*********013
                             *  隐藏出生年月日与1位身份识别号
                             */
                            newStr = this.str.replace(this.patten.idNo_, '$1,$3,$9').split(',');
                            this.result = newStr[0] + this.strHiddenFn(newStr[1], 1) + newStr[2];
                            break;

                        case 'normal':
                        default:
                            // console.log('--------:default:--------');
                            /**
                             * 姓名格式化
                             * @return && example
                             * ***********************
                             *      英文名处理方式
                             * ***********************
                             *      1、以【单词后空格】或【首字母大写】为单位拆分，【首】单词全显不隐藏。
                             *      2、从【第二个单词】开始匹配，每个单词【首、尾】各保留26%字符显示，中间以星号(*)填充。
                             *
                             *      例: 1.原文: Tovi Lau               返回匹配结果: Tovi L*u
                             *          2.原文: Thomas Alva Edison    返回匹配结果: Thomas A**a Ed**on
                             *          3.原文: WilliamHenryGates     返回匹配结果: William H***y G***s
                             *          4.原文: Michael Jackson       返回匹配结果: Michael Ja***on
                             *
                             * ***********************
                             *      中文名处理方式
                             * ***********************
                             *      1、以单个汉字为单位拆分，【尾】汉字保留。
                             *      2、从【第一个汉字开始 --> 倒数第二个汉字结束】 以星号(×)替换。
                             *
                             *      例: 1.原文: 桃伟          返回匹配结果: ×伟
                             *          2.原文: 爱迪生        返回匹配结果: ××生
                             *          3.原文: 比尔盖茨      返回匹配结果: ×××茨
                             *          4.原文: 迈克尔杰克逊   返回匹配结果: ×××××逊
                             *
                             * ***********************
                             *   中英文混合名处理方式
                             * ***********************
                             *   中文在前:
                             *      1、中文名：
                             *          1)、以【单个汉字】为单位拆分，【尾】汉字保留显示。
                             *          2)、从【第一个汉字开始 --> 倒数第二个汉字结束】 以星号(×)替换。
                             *      2、英文名：
                             *          1)、以【单词后空格】或【首字母大写】为单位拆分，【首】单词全显不隐藏。
                             *          2)、所有单词【首、尾】各保留26%字符显示，中间以星号(*)填充。
                             *      例：
                             *          原文: 迈克尔杰克逊 Michael Jackson      返回匹配结果: ×××××逊 Mi***el Ja***on
                             *
                             *   英文在前:
                             *      1、中文名：
                             *          1)、以单个汉字为单位切割，【尾】汉字保留。
                             *          2)、从【第一个汉字开始 --> 倒数第二个汉字结束】 以星号(×)替换。
                             *      2、英文名：
                             *          1)、以【单词后空格】或【首字母大写】为单位拆分
                             *          2)、【首】单词全显。从【第二个单词】开始匹配，每个单词【首、尾】各保留26%字符显示，中间以星号(*)填充。
                             *      例：
                             *           原文: Michael Jackson 迈克尔杰克逊     返回匹配结果: Michael Ja***on ×××××逊
                             */

                            var nameExp = /(([\u4e00-\u9fa5]+\d*)|([A-Z]([a-z]*\d*))|([a-z]([a-z]*\d*)\s*))/g, // 切割姓名字串正则
                                nameArr = this._str.replace('\s+',' ').match(nameExp); // 把姓名切割成数组

                            //分别处理分割好的姓名数组下标内的字符串保护用户隐私
                            _this.result = '';
                            angular.forEach(nameArr, function(v, i) {
                                _this.result += _this.nameFn(v, false, i, nameArr.length); //Fn(当前姓名字串,替换的字符,下标,切割后的数组长组)
                            });
                    }
                    return this.result;
                }
            }
            return server.init();
        }
    });
});
