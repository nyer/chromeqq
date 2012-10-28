var PROTOCOL = null;
(function(){
        //qq http request header config
        var headerConfig = {};
        headerConfig.Connection = "Keep-Alive";
        headerConfig.Accept-Language = "zh-cn";
        headerConfig.Accept-Encoding = "gzip,deflate";
        headerConfig.Cache-Control = "no-cache";
        headerConfig.Accept-Charset = "UTF-8";
        headerConfig.Host = "d.web2.qq.com";

        PROTOCOL.qqRequest = function(url,config,callback){
            config = config || {};
            if(!config.headers)
                config.headers = {};
            objOverride(config.headers,headerConfig);
            xhrRequest(url,config,callback);
        } 
        var appid = "10033903";
        
        //friend category
        function Category(index,sort,name){
            this.index = index;
            this.sort = sort;
            this.name = name;
            this.onlineCount = 0;
            this.memberMgr = new DataMgr(Member);
        }

        function Member(){
            this.uin = -2;
            this.account = "";
            this.password = "";
            this.loginDate = 0;
            this.nickname = "";//昵称
            this.markname = "";//备注
            this.lnick = "";//个性签名
            this.face = "";//头像url
            this.level = "";//等级
            this.gender = "";//性别
            this.birthday = null;//出生日期
            this.phone = "";//电话
            this.mobile = "";//手机
            this.email = "";//邮箱
            this.college = "";//毕业院校
            this.regTime = 0;//注册时间
            this.constel = -1;//星座
            this.blood = -1;//血型
            this.homepage = "";//个人主页 
            this.stat = -1;//统计信息
            this.vipInfo = -1;//vip信息
            this.country = "";//国家
            this.province = "";//省
            this.city = "";//城市
            this.personal = "";//个人说明
            this.occupation = "";//职业
            this.chineseZodic = -1;//生肖
            this.allow = -1;//允许
            this.client_type = -1;//客户端类型
            this.flag = -1;
            this.category = null;
            this.cip = -1;
            this.infoLoaded = false;
        }
        
        function AuthInfo(){
            this.member = new Member();
            this.member.uin = -2;
            this.psessionid = "";
            this.ptwebqq = "";
            this.vfwebqq = "";
            this.clientid = appid;
        }

        PROTOCOL = function(){
            this.authInfo = new AuthInfo();
            this.categoryMgr = new DataMgr(Category);
            //this.memberMgr = new DataMgr(Member);
            this.onlineMemberMgr = new DataMgr(Member);
        }

        //verify check 
        var checkUrl = "http://check.ptlogin2.qq.com/check";
        var checkReg = /'[^']+'/g;
        var CheckParams = function(uin){
            this.uin = uin;
            this.appid = appid;
            this.r = Math.random();
        };

        var checkCodeImageUrl = "http://captcha.qq.com/getimage";
        var ImgParams = function(uin){
            this.uin = uin;
            this.appid = appid;
            this.r = Math.random();
        };
        PROTOCOL.onNeedVerify = function(){
        };
        PROTOCOL.prototype.checkIfNeedVerify = function(account,callback){
            var checkParams = new CheckParams(account);
            var me = this;
            qqRequest(checkUrl,{params:checkParams},function(responseText){
                var checkType = "";
                var vCode = "";
                var enVerifyCode = "";
                var verifycodeHex = "";
                
                checkType = checkReg.exec(responseText)[0].replace(/'/g,'');
                enVerifyCode = checkReg.exec(responseText)[0].replace(/'/g,'');
                verifycodeHex = checkReg.exec(responseText)[0].replace(/'/g,'');

                var verifyResult = {};
                me.verifyResult = verifyResult;
                verifyResult.checkType = checkType;
                verifyResult.vCode = enVerifyCode;
                verifyResult.verifycodeHex = verifycodeHex;
                if(enVerifyCode.indexOf("!") != 0){//need verify check code
                    var imgParams = new ImgParams(account);
                    var url = addQueryParam(checkCodeImageUrl,imgParams);
                    verifyResult.vCode = "";;
                    verifyResult.url = url;
                    PROTOCOL.onNeedVerify.call(me);
                }
                me.authInfo.member.account = account;
            });
        }

        //login
        var loginUrl = "http://ptlogin2.qq.com/login";
        var loginStr = "http%3A%2F%2Fweb3.qq.com%2Floginproxy.html%3Flogin2qq%3D1%26webqq_type%3D10";
        var LoginParams = function(account,password,verifycode){
            this.u = account;
            this.p = password;
            this.verifycode = verifycode;
            this.webqq_type = 10;
            this.remember_uin = 1;
            this.login2qq = 1;
            this.aid = appid;
            this.u1 = loginStr;
            this.ptredirect = 0;
            this.ptlang = 2052;
            this.from_ui = 1;
            this.pttype = 1;
            this.dumy = "";
            this.fp = "loginerroralert";
            this.action = "7-24-1937704";
            this.mibao_css = "m_webqq";
            this.t = 1;
            this.g = 1;
        }

        PROTOCOL.onLoginSuccess = function(){
        }
        PROTOCOL.onLoginFailure = function(){
        }

        PROTOCOL.prototype.login = function(account,password,status){
            password = passwordEncoding(password,this.verifyResult.verifycodeHex,this.verifyResult.vCode.toUpperCase());
            var loginParams = new LoginParams(account,password,this.verifyResult.vCode.toUpperCase());
            var me = this;
            qqRequest(loginUrl,{params:loginParams},function(responseTxt){
                if(responseTxt.indexOf("登录成功") >= 0){
                    me.member.status = status;
                    onLoginSuccess.call(me);
                }else{
                    onLoginFailure.call(me);
                }
            });
        }

        var channelLoginUrl = "http://d.web2.qq.com/channel/login2";
        PROTOCOL.prototype.auth = function(){
            var me = this;
            authorInfo.clientId = 73937875;
            chrome.cookies.get({url:"qq.com",name:"ptwebqq"},function(cookie){
                authInfo.ptwebqq = cookie.value;
                chrome.cookie.get({url:"qq.com",name:"skey"},function(cookie){
                    author.skey = cookie.value;
                    var content = {};
                    content.status = authorInfo.member.status;
                    content.ptwebqq = authInfo.ptwebqq;
                    content.passwd_sig = "";
                    content.clientid = authorInfo.clientId;

                    var contentstr = encodeURIComponent(JSON.stringify(content));
                    qqRequest(channelLoginUrl,{method:"POST",body:"r=" + contentstr},function(response){
                        var obj = JSON.parse(response);
                        if(obj.retcode == 0){
                            authInfo.member.cip = obj.cip;
                            authInfo.member.status = obj.status;
                            authInfo.member.uin = obj.uin;

                            authInfo.psessionid = obj.psessionid;
                            authInfo.vfwebqq = obj.vfwebqq;
                            me.authInfo = authInfo;

                            me.loadUserInfo();
                            me.loadFriends();
                            me.loadOnlineFriends();
                        }else{
                        }
                    });
                }
            }
        }

        var userInfoUrl = "http://s.web2.qq.com/api/get_friend_info2";
        var UserInfoParams = function(uin,vfwebqq){
            this.tuin = uin;
            this.verifysession = "";
            this.code = "";
            this.vfwebqq = vfwebqq;
            this.t = new Date().getTime();
        }

        var userFaceUrl = "http://face10.qun.qq.com/cgi/svr/face/getface";
        var userFaceParams = function(uin,vfwebqq){
            this.cache = 1;
            this.type = 1;
            this.fid = 0;
            this.uin = uin;
            this.vfwebqq = vfwebqq;
            this.t = new Date().getTime();
        }
        PROTOCOL.prototype.loadUserInfo = function(){
            var userInfoParams = new UserInfoParams(this.authInfo.member.account,this.authInfo.vfwebqq);
            var member = this.authInfo.member;
            var me = this;
            qqRequest(userInfoUrl,{params:userInfoParams},function(responseText){
                var obj = JSON.parse(responseText);
                if(obj.retcode == 0){
                    objOverride(member,obj);
                    me.member.face = addQueryParam(userFaceUrl,userInfoParams);
                    me.onCompleteUserInfo(member);
                }
            });
        }
        PROTOCOL.prototype.onCompleteUserInfo = function(userInfo){

        }
        
        var friendsLoadUrl = "http://s.web2.qq.com/api/get_user_friends2";

        PROTOCOL.prototype.loadFriends = function(){
            var body = {};
            body.h = "hello";
            body.vfwebqq = this.authInfo.vfwebqq;
            body = encodeURIComponent(JSON.stringify(body));
            var me = this;
            qqRequest(friendsLoadUrl,{method:"POST",body:"r=" + body},function(responseText){
                var ret = JSON.parse(responseText);
                if(ret.retcode == 0){
                    var result = ret.result;
                    var categories = ret.categories;
                    var friends = ret.friends;
                    var info = ret.info;
                    var marknames = ret.marknames;
                    var vipinfo = ret.vipinfo;

                    for(var i=0,j=categories.length;i < j;i ++){
                        var category = categories[i];
                        var cate = new Category(category.index,category.sort,category.name);

                        for(var l = 0,k = friends.length;l <k;l++){
                            var friend = friends[l];
                            if(friend.categories == cate.index){
                                var m = new Member();
                                m.uin = friend.uin;
                                m.flag = friend.flag;
                                m.category = cate;
                                m.nickname = info[l].nick;

                                for(var e = 0,h = marknames.length; e < h;e++){
                                    var markname = marknames[e];
                                    if(m.uin == markname.uin){
                                        m.markname = markname.markname;
                                    }
                                }
                                cate.add(m);
                            }
                        }
                        
                        var temp = me.categoryMgr.get(function(el){
                            return el.index == cate.index;
                        });
                        if(temp == null){
                            me.categoryMgr.add(cate);
                        }
                }
                me.onFriendsLoaded(me.categoryMgr);
            });
        }
        PROTOCOL.prototype.onFriendsLoaded = function(categoryMgr){
        }

        var onlineFriendsUrl = "http://d.web2.qq.com/channel/get_online_buddies2";
        var OnlineFriendsParams = function(clientid,psessionid){
            this.clientid = clientid;
            this.psessionid = psessionid;
            this.t = new Date().getTime();
        }
        PROTOCOL.prototype.loadOnlineFriends = function(){
            var params = new OnlineFriendsParams(this.authInfo.clientid,this.authInfo.psessionid);
            var me = this;
            qqRequest(onlineFriendsUrl,{params:params},function(responseText){
                var ret = JSON.parse(responseText);
                if(ret.retcode == 0){
                    var statuses = ret.result;
                    for(var i=0,j = categoryMgr.size();i < j;i ++){
                        var category = categoryMgr.getAt(i);
                        for(var k =0, l = category.memberMgr.size(); k < l;k ++){
                            var categoryMemMgr = category.memberMgr;
                            var m = categoryMemMgr.getAt(k);
                            for(var s = 0,e = statuses.length;s < e;s++){
                                var status = statuses[s];
                                if(m.uin == status.uin){
                                    m.status = status.status;
                                    if(categoryMemMgr.getAt(0).uin != m.uin){
                                        categoryMemMgr.delAt(k);
                                        categoryMemMgr.unshift(m);
                                        category.onlineCount++;
                                    }
                                    me.onlineMemberMgr.add(m);
                                }
                            }
                        }
                    }
                    me.onOnlineFriendsLoaded(me.onlineMemberMgr);
                }
            });
        }

        PROTOCOL.prototype.onOnlineFriendsLoaded = function(onlineMemberMgr){
        }

        var pollUrl = "http://d.web2.qq.com/channel/poll2";
        var PollParams = function(clientid,psessionid){
            this.clientid = clientid;
            this.psessionid = psessionid;
        }
        var pollInterval = 2000;
        PROTOCOL.prototype.pollEvent = function(){
            var pollParams = new PollParams(this.authInfo.clientid,this.authorInfo.psessionid);
            this.pollid = setInterval(function(){
                qqRequest(pollUrl,{params:pollParams},function(responseText){
                    var ret = JSON.parse(responseText);
                    if(ret.retcode == 0){
                        var result = ret.result;
                        for(var i=0,j=result.length;i < j;i ++){
                            var msg = result[i];
                            
                            var poll_type = msg.poll_type;
                            var value = msg.value;
                            if("message" == poll_type){//好友消息
                            }else if("buddies_status_change" == poll_type){//好友上下线
                            }else if("group_message" == poll_type){//群消息
                            }else if("kick_message" == poll_type){//下线
                            }
                        }
                    }
                });
            },pollInterval);
        }

}

