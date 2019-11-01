// Call the dataTables jQuery plugin
$(document).ready(function() {
    $('#dataTable').DataTable();

    $('#myModal').on('show.bs.modal', function(e) {

        //get data-id attribute of the clicked element
        var userId = $(e.relatedTarget).data('user-id');
        $.ajax({
            contentType: 'application/json',
            data: JSON.stringify({"id": userId}),
            success: function(data){
                $('#editname').val(data.user.name);
                $('#editemail').val(data.user.email);
                $('#editcontact').val(data.user.contact);
                $('#editaddress').val(data.user.address);
            },
            error: function(){
                console.log("Device control failed");
            },
            type: 'POST',
            url: '/admin/getUserDetails'
        });
    });
});
