$(function () {
    $('form').on('submit', function (e) {
        e.preventDefault()
        const data = new FormData(document.getElementById('my-form'))
        $.ajax({
            type: 'post',
            url: '/admin/category/add',
            data: data,
            cache: false,
            processData: false,
            contentType: false,
            success: function (data) {
                location.href = `/admin/category/${data.resource.id}`
            },
        })
    })
})
