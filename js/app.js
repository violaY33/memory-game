/* 
 * 动画扩展
 */

$.fn.extend({
    animateCss(animationName, callback) {
        const animationEnd = (function (el) {
            const animations = {
                animation: 'animationend',
                OAnimation: 'oAnimationEnd',
                MozAnimation: 'mozAnimationEnd',
                WebkitAnimation: 'webkitAnimationEnd',
            };

            for (let t in animations) {
                if (el.style[t] !== undefined) {
                    return animations[t];
                }
            }
        })(document.createElement('div'));

        this.addClass('animated ' + animationName).one(animationEnd, function () {
            $(this).removeClass('animated ' + animationName);

            if (typeof callback === 'function') callback();
        });

        return this;
    },
});


/*
 * 创建一个包含所有卡片的数组
 */

const CARDS = [
    "fa fa-diamond", "fa fa-diamond",
    "fa fa-anchor", "fa fa-anchor",
    "fa fa-paper-plane-o", "fa fa-paper-plane-o",
    "fa fa-bolt", "fa fa-bolt",
    "fa fa-cube", "fa fa-cube",
    "fa fa-leaf", "fa fa-leaf",
    "fa fa-bicycle", "fa fa-bicycle",
    "fa fa-bomb", "fa fa-bomb"
];


/*
 * 显示页面上的卡片
 *   - 使用下面提供的 "shuffle" 方法对数组中的卡片进行洗牌
 *   - 循环遍历每张卡片，创建其 HTML
 *   - 将每张卡的 HTML 添加到页面
 */

// 洗牌函数来自于 http://stackoverflow.com/a/2450976
function shuffle(array) {
    let currentIndex = array.length,
        temporaryValue, randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}


//洗牌
function shuffleCards() {
    const cards = shuffle(CARDS);
    $('.card i').each(function (idx, card) {
        $(card).removeClass();
        $(card).addClass(cards[idx]);
    });
}


/*
 * 设置一张卡片的事件监听器。 如果该卡片被点击：
 *  - 显示卡片的符号（将这个功能放在你从这个函数中调用的另一个函数中）
 *  - 将卡片添加到状态为 “open” 的 *数组* 中（将这个功能放在你从这个函数中调用的另一个函数中）
 *  - 如果数组中已有另一张卡，请检查两张卡片是否匹配
 *    + 如果卡片匹配，将卡片锁定为 "open" 状态（将这个功能放在你从这个函数中调用的另一个函数中）
 *    + 如果卡片不匹配，请将卡片从数组中移除并隐藏卡片的符号（将这个功能放在你从这个函数中调用的另一个函数中）
 *    + 增加移动计数器并将其显示在页面上（将这个功能放在你从这个函数中调用的另一个函数中）
 *    + 如果所有卡都匹配，则显示带有最终分数的消息（将这个功能放在你从这个函数中调用的另一个函数中）
 */


//监听卡片
function watchCard() {
    changeCursor('pointer');
    $('.card').on('click', function () {
        if ($(this).hasClass('open')) {
            return
        } else {
            changeMoves();
            openCard($(this));
            matchCard($(this));
        }
    })
}

//解绑卡片监听
function offWatchCard() {
    $('.card').off('click');
    changeCursor('default');
}

//翻开卡片
function openCard(card) {
    card.addClass('show open temp');
    card.animateCss('flipInY rubberBand');
}

//扣上卡片
function closeCard(card) {
    card.animateCss('flipOutY', function () {
        card.removeClass('show open temp unmatch');
        watchCard();
    })
}

//匹配卡片
function matchCard(card) {
    const tempCards = $('.temp');
    if (tempCards.length === 1) {
        return;
    } else {
        offWatchCard();

        const prevCard = tempCards.eq(0);
        const curCard = tempCards.eq(1);

        if (prevCard.find('i').attr('class') === curCard.find('i').attr('class')) {
            $('.temp').removeClass('temp').addClass('match');
            changeScores();
            watchCard();
            if ($('.match').length === 16) {
                win();
            }
        } else {
            $('.temp').removeClass('temp').addClass('unmatch');
            setTimeout(() => {
                closeCard(prevCard);
                closeCard(curCard);
            }, 500);
        }
    }
}

//改变步数
function changeMoves(moves) {
    if (moves !== undefined) {
        $('.moves-num').html(moves);
    } else {
        const moves = Number($('.moves-num').html()) + 1;
        $('.moves-num').html(moves);
        changeRank(moves);
    }
}


//改变星级
function changeRank(moves) {
    if (moves < 20) {
        $('.stars li i').removeClass().addClass('fa fa-star');
    } else if (moves >= 20 && moves < 30) {
        $('.stars li').eq(2).find('i').removeClass('fa-star').addClass('fa-star-o');
    } else if (moves >= 30) {
        $('.stars li').eq(1).find('i').removeClass('fa-star').addClass('fa-star-o');
    }
}


//改变分数 
function changeScores(reset) {
    const moves = Number($('.moves-num').html());
    const scores = Number($('.scores-num').html());
    if (reset === 'reset') {
        $('.scores-num').html(0);
        return;
    }
    if (moves < 20) {
        $('.scores-num').html(scores + 1000);
    } else if (moves >= 20 && moves < 30) {
        $('.scores-num').html(scores + 500);
    } else if (moves >= 30) {
        $('.scores-num').html(scores + 100);
    }
}

//卡片不可点
function changeCursor(cursor) {
    if (cursor === 'default') {
        $('.card').removeClass('pointer').addClass('default');

    } else {
        $('.card').removeClass('default').addClass('pointer');
    }
}


//胜利 
function win() {
    offWatchCard();
    $('.modal.win-game').removeClass('hide');
    $('.modal.win-game').animateCss('bounceIn');
}


//重新开始
function restart() {
    $('.restart').on('click', () => {
        offWatchCard();
        $('.modal.restart-game').removeClass('hide');
        $('.modal.restart-game').animateCss('bounceIn');
    });
}

//解绑重新开始
function offRestart() {
    $('.restart').off('click');
}


//亮牌 
function showCards() {
    $('.card').removeClass('temp match');
    $('.card').addClass('show open');
    $('.card').animateCss('flipInY rubberBand');
    setTimeout(() => {
        $('.card').animateCss('flipOutY', () => {
            $('.card').removeClass('show open');
        });
        watchCard();
        changeCursor('pointer');
    }, 800);
}

function init() {

    offWatchCard();

    offRestart();

    //重新开始
    restart();
    //洗牌
    shuffleCards();
    //重置步数
    changeMoves(0);
    //重置等级
    changeRank(0);
    //重置分数
    changeScores('reset');
    //亮牌
    showCards();

}

//  init();

function startGame() {
    //changeCursor('default');
    $('.modal.start-game').animateCss('bounceIn');

    $('.btn-start').click(() => {
        init();
        $('.modal.start-game').addClass('hide');
    });

    $('.btn-play-again').click(() => {
        init();
        $('.modal.win-game').addClass('hide');
        $('.modal.restart-game').addClass('hide');
    });
}

startGame();