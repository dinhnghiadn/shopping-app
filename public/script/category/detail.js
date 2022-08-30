$(function () {
    $('form').on('submit', function (e) {
        console.log('abc')
        e.preventDefault()
        const data = new FormData(document.getElementById('my-form'))
        const id = data.get('id')
        $.ajax({
            type: 'put',
            url: '/admin/category/' + id,
            data: data,
            cache: false,
            processData: false,
            contentType: false,
            success: function () {
                location.reload()
            },
        })
    })
})
