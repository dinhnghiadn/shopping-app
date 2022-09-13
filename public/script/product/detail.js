$(function () {
  $('form').on('submit', function (e) {
    e.preventDefault();
    const data = new FormData(document.getElementById('my-form'));
    const id = data.get('id');
    const categoryId = data.get('categoryId[]');
    console.log(categoryId);
    $.ajax({
      type: 'put',
      url: '/admin/product/' + id,
      data: data,
      cache: false,
      processData: false,
      contentType: false,
      success: function () {
        location.reload();
      },
    });
  });
});
