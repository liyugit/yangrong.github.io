/******
从qwrap 移至jquery，修改1.1.1大家建议的修改点，完成向左移，向右移的两边的动画，用插入当前画面的前面或者后面，解决1.3版本出现的从1——5快速滑动，太快，有点晕

此版本修改点
1. 修改代码细节
2. 添加lazyload
3. 判断是否在可视区域,再执行动画.

*****/

(function() {
	function Slide(wraperBox, next, pre, ulcontent, ulNavlist, wraper, opt) {
		//最外层的div
		this.wraper = wraper;
		//把ul隐藏起来的div
		this.wraperBox = wraperBox;
		this.nextBtn = next;
		this.preBtn = pre;
		// 存放图片的ul
		this.ulContent = ulcontent;
		// 存放图片的ul的li
		this.ulContentLi = ulcontent.find('li');
		this.Lilength = this.ulContentLi.length;
		// 存放菜单页的ul
		this.ulList = ulNavlist;
		this.navli = this.ulList.find('li');
		$.extend(this, this.option(opt));
		this.t = null;
		//显示区域宽度
		this.cellwidth = wraperBox.width();
		//slide元素在浏览器的位置
		this.slideSize = {
			left: wraper.offset().left,
			top: wraper.offset().top,
			width: wraper.width(),
			height: wraper.height()
		};
	}
	Slide.prototype.option = function(options) {
		this.option = {
			//记录第一张聚焦的图片在哪里。
			fouseNum: 0,
			speed: 3000,
			autoplay: true,
			hasList: true,
			lazyloadType: 'img',
			animateTime : 500

		};
		return $.extend(this.option, options || {})
	};
	Slide.prototype.firstShow = function(index) {
		if (this.lazyloadType == 'img') {
			this.imgLazyload();
		}
		this.ulContent.css('margin-left', '-' + index * this.cellwidth + 'px');
		this.changeClass(this.fouseNum, 'on');
	}
	//向右运动
	Slide.prototype.rightMove = function(index) {
		if (index > this.Lilength - 1) index = 0;
		if (this.ulContentLi[this.fouseNum].offsetLeft < this.ulContentLi[index].offsetLeft) {
			var changeLeft = parseInt(this.ulContent.css('margin-left')) - parseInt(this.cellwidth);
			this.ulContent.css('margin-left', changeLeft + 'px');
		}
		$(this.ulContentLi[index]).insertBefore(this.ulContentLi[this.fouseNum]);
		this.fouseNum = index;
		this.moveSlide('right');
		this.changeClass(this.fouseNum, 'on');
	}
	//向左运动
	Slide.prototype.leftMove = function(index) {
		if (index < 0) index = this.Lilength - 1;
		if (this.ulContentLi[this.fouseNum].offsetLeft > this.ulContentLi[index].offsetLeft) {
			var changeLeft = parseInt(this.ulContent.css('margin-left')) + parseInt(this.cellwidth);
			this.ulContent.css('margin-left', changeLeft + 'px');
		}
		$(this.ulContentLi[index]).insertAfter(this.ulContentLi[this.fouseNum]);
		this.fouseNum = index;
		this.moveSlide('left');
		this.changeClass(this.fouseNum, 'on');
	}
	Slide.prototype.moveSlide = function(direction) {
		if (this.lazyloadType == 'img') {
			this.imgLazyload();
		}
		if (direction === 'left') {
			this.ulContent.animate({
				'margin-left': '-=' + this.cellwidth + 'px'
			},this.animateTime);
		}
		if (direction === 'right') {
			this.ulContent.animate({
				'margin-left': '+=' + this.cellwidth + 'px'
			},this.animateTime);
		}
	}
	//后面显示的图片延迟加载
	Slide.prototype.imgLazyload = function() {
		var curSrcImg = $(this.ulContentLi[this.fouseNum]).find('img');
		for (var i = 0; i < curSrcImg.length; i++) {
			var imgDatasrc = $(curSrcImg[i]).attr("data-src");
			if (imgDatasrc) {
				$(curSrcImg[i]).attr('src', imgDatasrc);
			}
		};
	}
	Slide.prototype.changeClass = function(next, classname) {
		this.ulList.find('.' + classname).removeClass(classname);
		$(this.navli[next]).addClass(classname);
	}
	//自动轮播
	Slide.prototype.doSlide = function() {
		var _this = this;
		this.t = setInterval(function() {
			var windowSize = {
				left: $(window).scrollLeft(),
				top: $(window).scrollTop(),
				width: $(window).width(),
				height: $(window).height()
			};
			if (_this.isOverlapped(windowSize, _this.slideSize)) {
				_this.rightMove(_this.fouseNum + 1);
			}
		}, _this.speed);
	};
	//计算当前的slide与视图窗口是否有交集
	Slide.prototype.isOverlapped = function(idOne, idTwo) {
		var leftTop = idTwo.left > idOne.left && idTwo.left < idOne.left + idOne.width && idTwo.top > idOne.top && idTwo.top < idOne.top + idOne.height,
			rightTop = idTwo.left + idTwo.width > idOne.left && idTwo.left + idTwo.width < idOne.left + idOne.width && idTwo.top > idOne.top && idTwo.top < idOne.top + idOne.height,
			leftBottom = idTwo.left > idOne.left && idTwo.left < idOne.left + idOne.width && idTwo.top + idTwo.height > idOne.top && idTwo.top + idTwo.height < idOne.top + idOne.height,
			rightBottom = idTwo.left + idTwo.width > idOne.left && idTwo.left + idTwo.width < idOne.left + idOne.width && idTwo.top + idTwo.height > idOne.top && idTwo.top + idTwo.height < idOne.top + idOne.height;
		return leftTop || rightTop || leftBottom || rightBottom;
	}
	//绑定方法,把所有的方法绑定在一起方便管理。
	Slide.prototype.bindEvent = function() {
		var _this = this;
		// 点击按钮向上翻
		_this.preBtn.on('click', function() {
			_this.ulContent.stop(true, true);
			_this.leftMove(_this.fouseNum - 1);
		})
		// 点击按钮向下翻
		_this.nextBtn.on('click', function() {
			_this.ulContent.stop(true, true);
			_this.rightMove(_this.fouseNum + 1);
		})
		_this.wraper.on('mouseenter', function() {
			// 鼠标移入停止动画
			clearInterval(_this.t);
			_this.preBtn.show();
			_this.nextBtn.show();
		})
		_this.wraper.on('mouseleave', function() {
			// 鼠标移出开始动画
			_this.doSlide();
			_this.preBtn.hide();
			_this.nextBtn.hide();
		});
		//鼠标移入nav的li
		_this.navli.on('mouseenter', function() {
			_this.ulContent.stop(true, true);
			var curli = _this.ulList.find('.on')
			var preindex = _this.navli.index(curli);
			var curindex = _this.navli.index($(this));
			if (preindex < curindex) {
				_this.rightMove(parseInt(curindex));
			} else if (preindex > curindex) {
				_this.leftMove(parseInt(curindex));
			}
		})
		$(document).on('scroll', function() {
			if (this.autoplay) {
				this.doSlide();
			}
		})
	}
	// 执行函数
	Slide.prototype.init = function() {
		this.firstShow(this.fouseNum);

		if (this.autoplay) {
			this.doSlide();
		}
		this.bindEvent();
	};
	window.Slide = Slide;
})();