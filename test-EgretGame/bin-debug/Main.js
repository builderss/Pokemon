//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-present, Egret Technology.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////
var Main = (function (_super) {
    __extends(Main, _super);
    function Main() {
        _super.call(this);
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }
    var d = __define,c=Main,p=c.prototype;
    p.onAddToStage = function (event) {
        //加载地图资源
        /*初始化资源加载路径*/
        this.url = "resource/map/test1.tmx";
        /*初始化请求*/
        this.request = new egret.HttpRequest();
        /*监听资源加载完成事件*/
        this.request.once(egret.Event.COMPLETE, this.onMapComplete, this);
        /*发送请求*/
        this.request.open(this.url, egret.HttpMethod.GET);
        this.request.send();
        //设置加载进度界面
        //Config to load process interface
        this.loadingView = new LoadingUI();
        this.stage.addChild(this.loadingView);
        //初始化Resource资源加载库
        //initiate Resource loading library
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig("resource/default.res.json", "resource/");
    };
    /*地图加载完成*/
    p.onMapComplete = function (event) {
        /*获取到地图数据*/
        var data = egret.XML.parse(event.currentTarget.response);
        /*初始化地图*/
        var tmxTileMap = new tiled.TMXTilemap(2000, 2000, data, this.url);
        tmxTileMap.render();
        /*将地图添加到显示列表*/
        this.addChild(tmxTileMap);
    };
    /**
     * 配置文件加载完成,开始预加载preload资源组。
     * configuration file loading is completed, start to pre-load the preload resource group
     */
    p.onConfigComplete = function (event) {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        RES.addEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
        RES.loadGroup("preload");
    };
    /**
     * preload资源组加载完成
     * Preload resource group is loaded
     */
    p.onResourceLoadComplete = function (event) {
        if (event.groupName == "preload") {
            this.stage.removeChild(this.loadingView);
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
            RES.removeEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
            this.createGameScene();
        }
    };
    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    p.onItemLoadError = function (event) {
        console.warn("Url:" + event.resItem.url + " has failed to load");
    };
    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    p.onResourceLoadError = function (event) {
        //TODO
        console.warn("Group:" + event.groupName + " has failed to load");
        //忽略加载失败的项目
        //Ignore the loading failed projects
        this.onResourceLoadComplete(event);
    };
    /**
     * preload资源组加载进度
     * Loading process of preload resource group
     */
    p.onResourceProgress = function (event) {
        if (event.groupName == "preload") {
            this.loadingView.setProgress(event.itemsLoaded, event.itemsTotal);
        }
    };
    /**
     * 创建游戏场景
     * Create a game scene
     */
    p.createGameScene = function () {
        //var _myGrid:MyGrid = new MyGrid();
        //this.addChild(_myGrid);     
        this.touchAndMove();
    };
    /**
     * 切换描述内容
     * Switch to described content
     */
    p.changeDescription = function (textfield, textFlow) {
        textfield.textFlow = textFlow;
    };
    p.touchAndMove = function () {
        var container = new egret.DisplayObjectContainer();
        container.x = 200;
        container.y = 200;
        this.addChild(container);
        //画一个红色的圆，添加到 container 中
        var circle = new egret.Shape();
        circle.graphics.beginFill(0xff0000);
        circle.graphics.drawCircle(25, 25, 25);
        circle.graphics.endFill();
        container.addChild(circle);
        //给圆增加触碰事件
        circle.touchEnabled = true;
        //点击
        circle.addEventListener(egret.TouchEvent.TOUCH_TAP, onClick, this);
        function onClick() {
            //把舞台左上角的坐标(0,0)转换为 container 内部的坐标
            var targetPoint = container.globalToLocal(0, 0);
            //重新定位圆，可以看到圆形移到了屏幕的左上角
            circle.x = targetPoint.x;
            circle.y = targetPoint.y;
            //移动
            //设定2个偏移量
            var offsetX;
            var offsetY;
            //手指离开屏幕，触发 stopMove 方法
            circle.addEventListener(egret.TouchEvent.TOUCH_BEGIN, startMove, this);
            circle.addEventListener(egret.TouchEvent.TOUCH_END, stopMove, this);
            circle.addEventListener(egret.TouchEvent.TOUCH_MOVE, onMove, this);
            function startMove(e) {
                //计算手指和圆形的距离
                offsetX = e.stageX - circle.x;
                offsetY = e.stageY - circle.y;
                //手指在屏幕上移动，会触发 onMove 方法
            }
            function stopMove(e) {
                console.log(22);
                //手指离开屏幕，移除手指移动的监听
                this.stage.removeEventListener(egret.TouchEvent.TOUCH_MOVE, onMove, this);
            }
            function onMove(e) {
                //通过计算手指在屏幕上的位置，计算当前对象的坐标，达到跟随手指移动的效果
                circle.x = e.stageX - offsetX;
                circle.y = e.stageY - offsetY;
            }
        }
    };
    return Main;
}(egret.DisplayObjectContainer));
egret.registerClass(Main,'Main');
var startTickerTest = (function (_super) {
    __extends(startTickerTest, _super);
    function startTickerTest() {
        _super.call(this);
        this.speed = 0.05;
        this.timeOnEnterFrame = 0;
        this.touchAndMove();
    }
    var d = __define,c=startTickerTest,p=c.prototype;
    p.touchAndMove = function () {
        var container = new egret.DisplayObjectContainer();
        container.x = 200;
        container.y = 200;
        this.addChild(container);
        //画一个红色的圆，添加到 container 中
        var circle = new egret.Shape();
        circle.graphics.beginFill(0xff0000);
        circle.graphics.drawCircle(25, 25, 25);
        circle.graphics.endFill();
        container.addChild(circle);
        //给圆增加触碰事件
        circle.touchEnabled = true;
        //点击
        circle.addEventListener(egret.TouchEvent.TOUCH_TAP, onClick, this);
        function onClick() {
            //把舞台左上角的坐标(0,0)转换为 container 内部的坐标
            var targetPoint = container.globalToLocal(0, 0);
            //重新定位圆，可以看到圆形移到了屏幕的左上角
            circle.x = targetPoint.x;
            circle.y = targetPoint.y;
            //移动
            //设定2个偏移量
            var offsetX;
            var offsetY;
            //手指离开屏幕，触发 stopMove 方法
            circle.addEventListener(egret.TouchEvent.TOUCH_BEGIN, startMove, this);
            circle.addEventListener(egret.TouchEvent.TOUCH_END, stopMove, this);
            circle.addEventListener(egret.TouchEvent.TOUCH_MOVE, onMove, this);
            function startMove(e) {
                //计算手指和圆形的距离
                offsetX = e.stageX - circle.x;
                offsetY = e.stageY - circle.y;
                //手指在屏幕上移动，会触发 onMove 方法
            }
            function stopMove(e) {
                console.log(22);
                //手指离开屏幕，移除手指移动的监听
                this.stage.removeEventListener(egret.TouchEvent.TOUCH_MOVE, onMove, this);
            }
            function onMove(e) {
                //通过计算手指在屏幕上的位置，计算当前对象的坐标，达到跟随手指移动的效果
                circle.x = e.stageX - offsetX;
                circle.y = e.stageY - offsetY;
            }
        }
    };
    return startTickerTest;
}(egret.DisplayObjectContainer));
egret.registerClass(startTickerTest,'startTickerTest');
//# sourceMappingURL=Main.js.map