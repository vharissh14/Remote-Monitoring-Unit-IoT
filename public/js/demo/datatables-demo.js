// Call the dataTables jQuery plugin
$(document).ready(function() {
  $('#dataTable').DataTable();

  $('#myModal').on('show.bs.modal', function(e) {

    //get data-id attribute of the clicked element
    var bookId = $(e.relatedTarget).data('book-id');
    //populate the textbox
    $('#mypid').text('1233');
});
});
