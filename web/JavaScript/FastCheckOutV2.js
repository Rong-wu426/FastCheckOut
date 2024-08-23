if ('WebSocket' in window) {
    console.log('WebSocket is supported');
}
var socket = io();

socket.on('connect', function() {
    console.log('I connect successfully');
});

socket.on('new_item_event', function(msg) {    
    console.log('got new_item_event');
    var itemlist = JSON.parse(msg['data']);
    console.log(itemlist);
    add_item(itemlist);
});

socket.on('detected_objects', function(msg) {    
    console.log('got detected_objects');
    var itemlist = JSON.parse(msg['objs']);
    console.log(itemlist);
    add_item(itemlist);
});

update_amount();

$(document).on('click', ".delete-me", function() {
    var entry = $(this).closest('tr'); 
    entry.remove();
    update_amount();
});

$(document).on('click', ".add-me", function() {
    var qtyInput = $(this).closest('tr').find('.item-quantity');
    qtyInput.val(parseInt(qtyInput.val()) + 1);
    update_amount();
});

$(document).on('click', ".decrease-qty", function() {
    var qtyInput = $(this).closest('tr').find('.item-quantity');
    var currentQty = parseInt(qtyInput.val());
    if (currentQty > 1) {
        qtyInput.val(currentQty - 1);
    } else if (currentQty == 1) {
        var entry = $(this).closest('tr');
        entry.remove();
    }
    update_amount();
});

$("#checkout").on('click', function() {
    if (confirm("確認是否結帳!")) {
        var items = [];
        $('#item-table tbody tr').each(function() {
            var productId = $(this).find("td:eq(0) a").text().trim();
            var name = $(this).find("td:eq(1)").text().trim();
            var quantity = parseInt($(this).find('.item-quantity').val().trim(), 10);
            var price = parseFloat($(this).find("td:eq(3)").text().trim());

            items.push({
                productId: productId,
                name: name,
                quantity: quantity,
                price: price
            });
        });
        console.log(items);
        socket.emit('checkout_event', {items: items});
        setTimeout("location.href='http://localhost:3000/'",1000);
    } 
});

function add_item(itemlist) {
    for (var i in itemlist) {
        var item = itemlist[i];
        var row = `<tr>
            <td><a href='#'>${item['p_id']}</a></td>
            <td>${item['p_name']}</td>
            <td><input type='number' class='item-quantity form-control' value='1' min='1' style='width: 80px;'></td>
            <td>${item['p_price']}</td>
            <td>
                <div class="btn-group" role="group">
                    <button type="button" class="btn btn-outline-primary add-me">+</button>
                    <button type="button" class="btn btn-outline-secondary decrease-qty">-</button>
                    <button type="button" class="btn btn-outline-danger delete-me">Del</button>
                </div>
            </td>
        </tr>`;
        $("#item-table tbody").append(row);
    }
    update_amount();
}

function update_amount() {
    var total = 0;
    $('#item-table tbody tr').each(function() {
        var price = parseFloat($(this).find("td:eq(3)").text());
        var quantity = parseInt($(this).find('.item-quantity').val());
        if (!isNaN(price) && !isNaN(quantity)) {
            total += price * quantity;
        }
    });
    $("#amount").text(total);
}
