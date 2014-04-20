$(document).ready(function() {

    var submitAnswer = function(e) {
        getCellImage();
        return;
        if (e !== undefined) {
            e.preventDefault();
        }

        var ans = $('#ans').val();

        if ($(this).hasClass("confirm")) {
            ans = $('.cell-info').data('ans');
        }

        if ($(this).hasClass("quick-answer")) {
            ans = $(this).data('answer');
        }

        if (ans === "" && $(this).hasClass("no-content") === false && $(this).hasClass("confirm") === false) {
            return;
        }

        var page = $('.cell-info').data('page');
        var x = $('.cell-info').data('x');
        var y = $('.cell-info').data('y');

        $('#submit,#no-content').attr('disabled', 'disabled');

        var url = ['/api/fillcell/', page, "/", x, "/", y].join("");
        $.post(url, {ans: ans}, function(res) {
            getCellImage();
            $('#submit,#no-content').removeAttr('disabled');
        });
    };

    var img_data;
    var currentCell = {
        row: 0,
        col: 0
    };
    var currentPage = {};

    var getRandomPage = function() {
        $.get('page.json', function(res) {
            currentPage = res;
            currentPage.id = 2579;
            currentPage.lineCount = 0;
            for (x in res.data.tables) {
                ++currentPage.lineCount;
            }
            getCellImage();
        });
    }

    var getCellImage = function() {
        $('#ans').val("").focus();
        $('.cell-info').text("圖片載入中...");
        $('.confirm').hide();

        var lefttop = currentPage.data.tables[currentCell.row][currentCell.col]['left_top'];
        var rightdown = currentPage.data.tables[currentCell.row][currentCell.col]['right_down'];
        var source_width = parseInt(rightdown[0] - lefttop[0]);
        var source_height = parseInt(rightdown[1] - lefttop[1]);
        var target_width = (source_width > source_height) ? 400 : Math.floor(400 * source_width / source_height);
        var target_height = (source_height > source_width) ? 400 : Math.floor(400 * source_height / source_width);

        img_data = new Image;
        img_data.src = currentPage.data.meta.pic_url;
        img_data.onload = function() {
            $('#canvas')[0].getContext('2d').clearRect(0, 0, 400, 400);
            $('#canvas')[0].getContext('2d').drawImage(
                    img_data,
                    lefttop[0], // source_x
                    lefttop[1], // source_y
                    source_width, // source_width
                    source_height, // source_height
                    0, // target_x
                    0, // target_y
                    target_width,
                    target_height);
        };

        $('.cell-info').data({
            page: currentPage.id,
            x: currentCell.row,
            y: currentCell.col,
            ans: ''
        })
                .text("")
                .append($('<span></span>').text("第 " + currentPage.id + " 頁 (" + currentCell.row + ", " + currentCell.col + " )"));

//        if (res.ans !== null) {
//            $('.cell-info').append($('<span></span>').text(" 已經有" + res.count + "人填寫確認了，目前答案：").append($('<code></code>').text(res.ans)));
//            $('.confirm').show();
//        }

        ++currentCell.row;
        if (currentCell.row > currentPage.lineCount - 1) {
            currentCell.row = 0;
            ++currentCell.col;
            if (currentCell.col > 8) {
                currentCell.row = 0;
                currentCell.col = 0;
                getRandomPage();
            }
        }
    };
    if ('undefined' === typeof (currentPage.data)) {
        getRandomPage();
    } else {
        getCellImage();
    }

    $('#submit').click(submitAnswer);
    $('#no-content').click(submitAnswer);
    $('#confirm').click(submitAnswer);
    $('.quick-answer').click(submitAnswer);
    $('#quick-trigger').click(function() {
        $('.quick-answer').toggle();
        $('.open-close').text($('.quick-answer').is(':visible') ? "關閉" : "開啟");
    });

    $('#next').click(getCellImage);

    $('#ans').keypress(function(e) {
        if (e.which == 13) {
            if (e.shiftKey) {
                submitAnswer.apply($("#no-content")[0]);
            }
            e.preventDefault();
            submitAnswer();
        }
    });

});
