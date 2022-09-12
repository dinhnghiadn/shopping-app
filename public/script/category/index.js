$(document).ready(function () {
  $('.delete-category').click(function () {
    var del_id = $(this).attr('id');
    $.ajax({
      type: 'DELETE',
      url: '/admin/category/' + del_id,
      success: function (data) {
        location.reload();
      },
    });
  });
});

function getDetail(id) {
  location.href = `/admin/category/${id}`;
}
