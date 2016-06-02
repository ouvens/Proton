(function($) {
    'use strict';

    $(function() {
        var $fullText = $('.admin-fullText');
        $('#admin-fullscreen').on('click', function() {
            $.AMUI.fullscreen.toggle();
        });

        $(document).on($.AMUI.fullscreen.raw.fullscreenchange, function() {
            $fullText.text($.AMUI.fullscreen.isFullscreen ? '退出全屏' : '开启全屏');
        });
    });

    $('body').on('click', '.btn-logout', function(e) {
        $.ajax({
            url: '/proton/v1/logout',
            method: 'post',
            data: {

            },
            success: function(data) {
                if (data.code === 200) {
                    window.location.href = 'login.html';
                } else {
                    alert(data.msg);
                }
            }
        })
    }).on('click', '.am-topbar-brand', function(e) {
        window.location.href = 'list-report.html';
    });

    var path = location.href;
    var router;
    $('.admin-sidebar-list li').each(function(el) {
        router = $(this).find('> a').attr('href');
        console.log(router, path);
        if (router && path.indexOf(router) >= 0) {
            $(this).addClass('active')
        }
    });


})(jQuery);