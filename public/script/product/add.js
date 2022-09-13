$(document).ready(function () {
  console.log('ready');

  $.get('/category/list', function (data) {
    data.resources.forEach((category) => {
      $('#list-category').append(
        `</br><input type="checkbox" name="categoryId[]" value="${category.id}">${category.name}</input>`
      );
    });
  });

  $('form').on('submit', function (e) {
    e.preventDefault();
    const data = new FormData(document.getElementById('my-form'));
    $.ajax({
      type: 'post',
      url: '/admin/product/add',
      data: data,
      cache: false,
      processData: false,
      contentType: false,
      success: function (data) {
        location.href = `/admin/product/${data.resource.product.id}`;
      },
    });
  });

  $('#image').change(function () {
    console.log(document.getElementById('frames'));
    $('#frames').html('');
    for (var i = 0; i < $(this)[0].files.length; i++) {
      $('#frames').append(
        '<img src="' +
          window.URL.createObjectURL(this.files[i]) +
          '" width="100px" height="100px"/>'
      );
    }
  });
});
