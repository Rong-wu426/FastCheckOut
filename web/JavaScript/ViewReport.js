document.addEventListener("DOMContentLoaded", function() {
    var socket = io.connect('http://127.0.0.1:3000');
    var currentPage = 1;
    var itemsPerPage = 6;
    var totalPages = 1;
    var orders = [];

    // Calculate the date range
    var end_date = new Date();
    var start_date = new Date();
    start_date.setDate(start_date.getDate() - 30);

    function formatDate(date) {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [year, month, day].join('-');
    }

    document.getElementById('start_date').value = formatDate(start_date);
    document.getElementById('end_date').value = formatDate(end_date);

    socket.emit('search', { start_date: formatDate(start_date).replace(/-/g, ''), end_date: formatDate(end_date).replace(/-/g, '') });

    document.getElementById('searchBtn').addEventListener('click', function() {
        var start_date = document.getElementById('start_date').value;
        var end_date = document.getElementById('end_date').value;
        socket.emit('search', { start_date: start_date.replace(/-/g, ''), end_date: end_date.replace(/-/g, '') });
    });

    socket.on('search_results', function(data) {
        orders = data.results;
        totalPages = Math.ceil(orders.length / itemsPerPage);
        currentPage = 1;
        displayPage(currentPage);
    });

    function displayPage(page) {
        var resultsDiv = document.getElementById('results');
        resultsDiv.innerHTML = '';
        var table = document.createElement('table');
        table.className = 'table table-bordered';
        var thead = document.createElement('thead');
        var headerRow = document.createElement('tr');
        headerRow.innerHTML = '<th>訂單編號</th><th>訂單日期</th><th>金額</th>';
        thead.appendChild(headerRow);
        table.appendChild(thead);
        var tbody = document.createElement('tbody');

        var start = (page - 1) * itemsPerPage;
        var end = start + itemsPerPage;
        var paginatedItems = orders.slice(start, end);

        paginatedItems.forEach(order => {
            var row = document.createElement('tr');
            row.innerHTML = `<td><a href="#" class="order-link" data-id="${order['訂單編號']}">${order['訂單編號']}</a></td><td>${order['訂單日期']}</td><td>${order['金額']}</td>`;
            tbody.appendChild(row);
        });

        table.appendChild(tbody);
        resultsDiv.appendChild(table);

        // Create pagination controls
        var paginationControls = document.createElement('div');
        paginationControls.className = 'pagination-controls';
        if (currentPage > 1) {
            var prevButton = document.createElement('button');
            prevButton.innerText = '上一頁';
            prevButton.addEventListener('click', function() {
                displayPage(--currentPage);
            });
            paginationControls.appendChild(prevButton);
        }

        if (currentPage < totalPages) {
            var nextButton = document.createElement('button');
            nextButton.innerText = '下一頁';
            nextButton.addEventListener('click', function() {
                displayPage(++currentPage);
            });
            paginationControls.appendChild(nextButton);
        }

        resultsDiv.appendChild(paginationControls);

        document.querySelectorAll('.order-link').forEach(function(link) {
            link.addEventListener('click', function(event) {
                event.preventDefault();
                showDetails(this.getAttribute('data-id'));
            });
        });
    }

    function showDetails(orderId) {
        socket.emit('get_order_details', { o_id: orderId });
    }

    socket.on('order_details', function(data) {
        var detailsDiv = document.getElementById('orderDetails');
        detailsDiv.innerHTML = `<h3>訂單明細資料</h3><p>訂單編號: ${data.order_id}</p><p>訂單日期: ${data.order_date}</p>` + data.details;
        detailsDiv.style.display = 'block';

        document.querySelectorAll('#results tr').forEach(row => row.classList.remove('highlight'));
        document.querySelector(`#results tr td a[data-id='${data.order_id}']`).parentElement.parentElement.classList.add('highlight');
    });

    document.getElementById('downloadButton').addEventListener('click', function() {
        window.location.href = '/download';
    });
});
