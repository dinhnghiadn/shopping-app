$(document).ready(function () {
    $('.block-user').click(function () {
        var block_id = $(this).attr('id')
        $.ajax({
            type: 'POST',
            url: '/admin/user/block/' + block_id,
            success: function (data) {
                location.reload()
            },
        })
    })

    $('.unblock-user').click(function () {
        var unblock_id = $(this).attr('id')
        $.ajax({
            type: 'POST',
            url: '/admin/user/unblock/' + unblock_id,
            success: function (data) {
                location.reload()
            },
        })
    })

    $('.delete-user').click(function () {
        var del_id = $(this).attr('id')
        $.ajax({
            type: 'DELETE',
            url: '/admin/user/' + del_id,
            success: function (data) {
                location.reload()
            },
        })
    })
})
function getDetail(id) {
    location.href = `/admin/user/${id}`
}
