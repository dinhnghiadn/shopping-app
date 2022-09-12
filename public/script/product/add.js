$(document).ready(function () {
  $(function () {
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
          location.href = `/admin/product/${data.resource.id}`;
        },
      });
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
