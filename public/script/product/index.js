$(document).ready(function () {
  $('.delete-product').click(function () {
    var del_id = $(this).attr('id');
    $.ajax({
      type: 'DELETE',
      url: '/admin/product/' + del_id,
      success: function (data) {
        location.reload();
      },
    });
  });
});

function getDetail(id) {
  location.href = `/admin/product/${id}`;
}
