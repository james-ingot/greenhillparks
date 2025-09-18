const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbz2re1uG4QMv6oO57FAtIulCVLQfwoTjz3PC0A55C5N3oPTiSTF_4qoxqV7iVLsuVoB/exec';

let lotData = [];

document.addEventListener('DOMContentLoaded', function() {
    // Check for stage-{number} in the URL
    const urlStageMatch = window.location.pathname.match(/stage-(\d+)/i);
    let stageFromUrl = null;
    if (urlStageMatch) {
        stageFromUrl = urlStageMatch[1];
    }

    fetch(WEB_APP_URL)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Data fetched successfully:', data.data);
                // Normalize property names to match expected keys
                lotData = data.data.map(item => ({
                    lot: item.lot || item.Lot || item["Lot #"] || '',
                    status: item.status || item.Status || '',
                    area: item.area || item.Area || item["Area (m2)"] || '',
                    stage: item.stage || item.Stage || '',
                    price: item.price || item.Price || ''
                })).filter(item => {
                    // Remove any with stage 'Stage 16' or 'Stage 17' (case/whitespace insensitive)
                    const s = String(item.stage).replace(/\s+/g, '').toLowerCase();
                    return s !== 'stage16' && s !== 'stage17';
                });

                if (stageFromUrl) {
                    // Only show lots for this stage, matching 'Stage 16', 'stage16', '16', etc.
                    lotData = lotData.filter(item => {
                        const normalized = String(item.stage).replace(/\s+/g, '').toLowerCase();
                        return (
                            normalized === `stage${stageFromUrl}`.toLowerCase() ||
                            normalized === `${stageFromUrl}`
                        );
                    });
                    // Remove the stage filter dropdown
                    const stageFilterGroup = document.querySelector('.filter-group select#stage-filter')?.parentElement;
                    if (stageFilterGroup) {
                        stageFilterGroup.remove();
                    }
                } else {
                    populateFilters();
                }
                renderTable(lotData);
            } else {
                document.getElementById('table-body').innerHTML = 
                    '<tr><td colspan="9">Error loading data: ' + data.error + '</td></tr>';
            }
        })
        .catch(error => {
            document.getElementById('table-body').innerHTML = 
                '<tr><td colspan="9">Error connecting to data source: ' + error.message + '</td></tr>';
        });

    document.getElementById('apply-filters').addEventListener('click', applyFilters);
    document.getElementById('reset-filters').addEventListener('click', resetFilters);

    document.querySelectorAll('th[data-sort]').forEach(th => {
            th.addEventListener('click', () => {
                const sortBy = th.getAttribute('data-sort');
                let currentlyAscending = th.getAttribute('data-sort-direction');
                // Default: price sorts descending first, others ascending
                let ascending;
                if (currentlyAscending === null) {
                    ascending = sortBy === 'price' ? false : true;
                } else {
                    ascending = currentlyAscending === 'asc' ? false : true;
                }
                sortTable(sortBy, ascending);

                document.querySelectorAll('th[data-sort]').forEach(header => {
                    header.textContent = header.textContent.replace(' ↑', '').replace(' ↓', '');
                    header.removeAttribute('data-sort-direction');
                });

                th.textContent = th.textContent.replace(' ↕', '') + (ascending ? ' ↑' : ' ↓');
                th.setAttribute('data-sort-direction', ascending ? 'asc' : 'desc');
            });
    });
});

function populateFilters() {
    const stages = [...new Set(lotData.map(item => item.stage))].filter(stage => stage);
    const stageFilter = document.getElementById('stage-filter');
    stageFilter.innerHTML = '<option value="all">All Stages</option>';
    stages.forEach(stage => {
        const option = document.createElement('option');
        option.value = stage;
        option.textContent = stage;
        stageFilter.appendChild(option);
    });
}

function applyFilters() {
    const statusFilter = document.getElementById('status-filter').value;
    const stageFilter = document.getElementById('stage-filter').value;

    const filteredData = lotData.filter(item => {
        return (statusFilter === 'all' || item.status === statusFilter) &&
                     (stageFilter === 'all' || item.stage === stageFilter);
    });

    renderTable(filteredData);
}

function resetFilters() {
    document.getElementById('status-filter').value = 'all';
    document.getElementById('stage-filter').value = 'all';

    renderTable(lotData);
}

function formatPrice(price) {
    if (typeof price === 'number') {
        return '$' + price.toLocaleString();
    }
    if (typeof price === 'string') {
        let trimmed = price.trim();
        // Handle $1.38m or 1.38m as $1,380,000
        const millionMatch = trimmed.match(/\$?([\d,.]+)m/i);
        if (millionMatch) {
            let num = parseFloat(millionMatch[1].replace(/,/g, ''));
            if (!isNaN(num)) {
                return '$' + (num * 1_000_000).toLocaleString();
            }
        }
        // Handle normal numbers, with or without $
        let num = parseFloat(trimmed.replace(/[$,]/g, ''));
        if (!isNaN(num)) {
            return '$' + num.toLocaleString();
        }
    }
    return price;
}

function renderTable(data) {
    const tableBody = document.getElementById('table-body');
    tableBody.innerHTML = '';

    // Check for stage-{number} in the URL
    const urlStageMatch = window.location.pathname.match(/stage-(\d+)/i);
    const showStageColumn = !urlStageMatch;

    // Update table header
    const tableHeadRow = document.querySelector('#lots-table thead tr');
    if (tableHeadRow) {
        tableHeadRow.innerHTML = showStageColumn
            ? `<th data-sort="lot">Lot # ↕</th>
               <th data-sort="status">Status ↕</th>
               <th data-sort="area">Area (m²) ↕</th>
               <th data-sort="stage">Stage ↕</th>
               <th data-sort="price">Price ↕</th>`
            : `<th data-sort="lot">Lot # ↕</th>
               <th data-sort="status">Status ↕</th>
               <th data-sort="area">Area (m²) ↕</th>
               <th data-sort="price">Price ↕</th>`;
    }

    if (data.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="${showStageColumn ? 5 : 4}" class="no-results">No lots match your filters</td>`;
        tableBody.appendChild(row);
    } else {
        data.forEach(item => {
            const row = document.createElement('tr');
            const statusClass = item.status === 'Sold' ? 'status-sold' : 'status-available';
            row.innerHTML = showStageColumn
                ? `
                    <td>${item.lot}</td>
                    <td class="${statusClass}">${item.status}</td>
                    <td>${item.area}</td>
                    <td>${item.stage}</td>
                    <td>${formatPrice(item.price)}</td>
                  `
                : `
                    <td>${item.lot}</td>
                    <td class="${statusClass}">${item.status}</td>
                    <td>${item.area}</td>
                    <td>${formatPrice(item.price)}</td>
                  `;
            tableBody.appendChild(row);
        });
    }

    document.getElementById('results-count').textContent = data.length;
    document.getElementById('total-count').textContent = lotData.length;
}

function parsePriceForSort(price) {
    if (typeof price === 'number') return price;
    if (typeof price === 'string') {
        let trimmed = price.trim();
        // $1.38m or 1.38m
        const millionMatch = trimmed.match(/\$?([\d,.]+)m/i);
        if (millionMatch) {
            let num = parseFloat(millionMatch[1].replace(/,/g, ''));
            if (!isNaN(num)) return num * 1_000_000;
        }
        // Normal number
        let num = parseFloat(trimmed.replace(/[$,]/g, ''));
        if (!isNaN(num)) return num;
    }
    return 0;
}

function sortTable(field, ascending) {
    const sortedData = [...lotData].sort((a, b) => {
        let valueA = a[field];
        let valueB = b[field];

        if (field === 'lot' || field === 'area') {
            valueA = parseFloat(valueA) || 0;
            valueB = parseFloat(valueB) || 0;
        }

        if (field === 'price') {
            valueA = parsePriceForSort(valueA);
            valueB = parsePriceForSort(valueB);
        }

        if (valueA < valueB) return ascending ? -1 : 1;
        if (valueA > valueB) return ascending ? 1 : -1;
        return 0;
    });

    renderTable(sortedData);
}