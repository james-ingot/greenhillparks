const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbz2re1uG4QMv6oO57FAtIulCVLQfwoTjz3PC0A55C5N3oPTiSTF_4qoxqV7iVLsuVoB/exec';
let currentSortField = null;
let currentSortAscending = true;
let lotData = [];

document.addEventListener('DOMContentLoaded', function() {
    // Check for stage-{number}[A-Z]? in the URL (e.g., stage-25, stage-25A)
    const urlStageMatch = window.location.pathname.match(/stage-([\da-z]+)/i);
    let stageFromUrl = null;
    if (urlStageMatch) {
        stageFromUrl = urlStageMatch[1];
    }

    showLoading();

    fetch(WEB_APP_URL)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
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
                    // Only show lots for this stage, matching 'Stage 25A', 'stage25a', '25A', etc.
                    lotData = lotData.filter(item => {
                        const normalized = String(item.stage).replace(/\s+/g, '').toLowerCase();
                        const urlStage = String(stageFromUrl).replace(/\s+/g, '').toLowerCase();
                        if (normalized.includes('highdensity')) {
                            return normalized.includes(`stage${urlStage}highdensity`);
                        }
                        return (
                            normalized === `stage${urlStage}` ||
                            normalized === urlStage
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
                // Sort so 'Available' status is at the top on initial load, then by Stage ascending
                const sortedInitial = [...lotData].sort((a, b) => {
                    // Primary sort: Available first, then Contract, then Sold, then others
                    const statusOrder = status => {
                        if (status === 'Available') return 0;
                        if (status === 'Contract') return 1;
                        if (status === 'Sold') return 2;
                        return 3;
                    };
                    const orderA = statusOrder(a.status);
                    const orderB = statusOrder(b.status);
                    if (orderA !== orderB) return orderA - orderB;

                    // For Available, move High Density to bottom
                    if (a.status === 'Available' && b.status === 'Available') {
                        const aHigh = String(a.stage).toLowerCase().includes('high density');
                        const bHigh = String(b.stage).toLowerCase().includes('high density');
                        if (aHigh && !bHigh) return 1;
                        if (!aHigh && bHigh) return -1;
                    }

                    // Secondary sort: Stage ascending (same logic as in sortTable function)
                    const extractStageNumber = (stage) => {
                        const match = String(stage).match(/(\d+)/);
                        return match ? parseInt(match[1]) : 0;
                    };
                    const extractStageSuffix = (stage) => {
                        const match = String(stage).match(/\d+([A-Z]*)$/i);
                        return match ? match[1].toLowerCase() : '';
                    };
                    const numA = extractStageNumber(a.stage);
                    const numB = extractStageNumber(b.stage);
                    const suffixA = extractStageSuffix(a.stage);
                    const suffixB = extractStageSuffix(b.stage);
                    // First compare by stage number
                    if (numA !== numB) {
                        return numA - numB; // ascending order
                    }
                    // If numbers are the same, compare by suffix (no suffix comes before suffix)
                    if (suffixA === '' && suffixB !== '') return -1;
                    if (suffixA !== '' && suffixB === '') return 1;
                    // Both have suffixes or both don't, use string comparison
                    return suffixA.localeCompare(suffixB);
                });
                // Hide loading spinner and show table
                hideLoading();
                renderTable(sortedInitial);
            } else {
                // Hide loading spinner and show error
                hideLoading();
                document.getElementById('table-body').innerHTML = 
                    '<tr><td colspan="9">Error loading data: ' + data.error + '</td></tr>';
            }
        })
        .catch(error => {
            // Hide loading spinner and show error
            hideLoading();
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

    // Add event listeners for sort toggle buttons
    const areaBtn = document.getElementById('sort-area-toggle');
    if (areaBtn) {
        areaBtn.addEventListener('click', function() {
            let ascending = currentSortField === 'area' ? !currentSortAscending : true;
            currentSortField = 'area';
            currentSortAscending = ascending;
            sortTable('area', ascending);
            updateSortToggleButtons();
        });
    }
    const priceBtn = document.getElementById('sort-price-toggle');
    if (priceBtn) {
        priceBtn.addEventListener('click', function() {
            let ascending = currentSortField === 'price' ? !currentSortAscending : false;
            currentSortField = 'price';
            currentSortAscending = ascending;
            sortTable('price', ascending);
            updateSortToggleButtons();
        });
    }
    // After initial render, update button state
    updateSortToggleButtons();
});

function populateFilters() {
    let stages = [...new Set(lotData.map(item => item.stage))].filter(stage => stage);
    // Sort stages descending by number if possible
    stages = stages.sort((a, b) => {
        // Extract numbers from 'Stage 25', 'Stage 18', etc.
        const numA = parseInt(String(a).replace(/[^\d]/g, ''));
        const numB = parseInt(String(b).replace(/[^\d]/g, ''));
        if (!isNaN(numA) && !isNaN(numB)) {
            return numB - numA;
        }
        // Fallback to string comparison
        return String(b).localeCompare(String(a));
    });
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
        return '$' + Math.round(price).toLocaleString();
    }
    if (typeof price === 'string') {
        let trimmed = price.trim();
        // Handle $1.38m or 1.38m as $1,380,000
        const millionMatch = trimmed.match(/\$?([\d,.]+)m/i);
        if (millionMatch) {
            let num = parseFloat(millionMatch[1].replace(/,/g, ''));
            if (!isNaN(num)) {
                return '$' + Math.round(num * 1_000_000).toLocaleString();
            }
        }
        // Handle normal numbers, with or without $
        let num = parseFloat(trimmed.replace(/[$,]/g, ''));
        if (!isNaN(num)) {
            return '$' + Math.round(num).toLocaleString();
        }
    }
    return price;
}

function renderTable(data) {
    const tableBody = document.getElementById('table-body');
    tableBody.innerHTML = '';

    // Check for stage-{something} in the URL
    const urlStagePath = window.location.pathname.toLowerCase().includes('stage-');
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
        // Re-attach sorting event listeners
        document.querySelectorAll('th[data-sort]').forEach(th => {
            th.addEventListener('click', () => {
                const sortBy = th.getAttribute('data-sort');
                let ascending;
                if (currentSortField === sortBy) {
                    // Toggle direction if same column
                    ascending = !currentSortAscending;
                } else {
                    // Default: price sorts descending first, others ascending
                    ascending = sortBy === 'price' ? false : true;
                }
                currentSortField = sortBy;
                currentSortAscending = ascending;
                sortTable(sortBy, ascending);

                document.querySelectorAll('th[data-sort]').forEach(header => {
                    header.textContent = header.textContent.replace(' ↑', '').replace(' ↓', '');
                    header.removeAttribute('data-sort-direction');
                });

                th.textContent = th.textContent.replace(' ↕', '') + (ascending ? ' ↑' : ' ↓');
                th.setAttribute('data-sort-direction', ascending ? 'asc' : 'desc');
            });
        });
    }

    if (data.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="${showStageColumn ? 5 : 4}" class="no-results">No lots match your filters</td>`;
        tableBody.appendChild(row);
    } else {
        data.forEach(item => {
            let statusClass = 'status-available';
            if (item.status === 'Sold') statusClass = 'status-sold';
            else if (item.status === 'Contract') statusClass = 'status-contract';

            // Build the section URL for this row
            let stagePart = String(item.stage).replace(/^stage\s*/i, '').trim();
            stagePart = stagePart.replace(/\s+/g, '');
            let sectionUrl;
            if (/high\s*density/i.test(item.stage)) {
                // Extract just the number for High Density stages
                const numMatch = String(item.stage).match(/(\d+)/);
                const stageNum = numMatch ? numMatch[1] : stagePart;
                sectionUrl = `https://www.greenhillpark.co.nz/stage-${stageNum}-sections/`;
            } else {
                sectionUrl = `https://www.greenhillpark.co.nz/stage-${stagePart}-sections/`;
            }
            const row = document.createElement('tr');
            // Only make row clickable if not on a stage-specific page
            if (!urlStagePath) {
                row.style.cursor = 'pointer';
                row.addEventListener('click', () => {
                    window.open(sectionUrl, '_blank');
                });
            }
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

        if (field === 'stage') {
            // For Available, move High Density to bottom
            if (a.status === 'Available' && b.status === 'Available') {
                const aHigh = String(a.stage).toLowerCase().includes('high density');
                const bHigh = String(b.stage).toLowerCase().includes('high density');
                if (aHigh && !bHigh) return 1;
                if (!aHigh && bHigh) return -1;
            }
            // Extract numeric part from stage for proper sorting
            // Handle "Stage 25A", "Stage 18", etc.
            const extractStageNumber = (stage) => {
                const match = String(stage).match(/(\d+)/);
                return match ? parseInt(match[1]) : 0;
            };
            const extractStageSuffix = (stage) => {
                const match = String(stage).match(/\d+([A-Z]*)$/i);
                return match ? match[1].toLowerCase() : '';
            };
            const numA = extractStageNumber(valueA);
            const numB = extractStageNumber(valueB);
            const suffixA = extractStageSuffix(valueA);
            const suffixB = extractStageSuffix(valueB);
            // First compare by number
            if (numA !== numB) {
                valueA = numA;
                valueB = numB;
            } else {
                // If numbers are the same, compare by suffix (A comes after no suffix)
                if (suffixA === '' && suffixB !== '') {
                    return ascending ? -1 : 1;
                }
                if (suffixA !== '' && suffixB === '') {
                    return ascending ? 1 : -1;
                }
                // Both have suffixes or both don't, use string comparison
                valueA = suffixA;
                valueB = suffixB;
            }
        }

        if (valueA < valueB) return ascending ? -1 : 1;
        if (valueA > valueB) return ascending ? 1 : -1;
        return 0;
    });

    renderTable(sortedData);
}

function updateSortToggleButtons() {
    // Status
    const areaBtn = document.getElementById('sort-area-toggle');
    if (areaBtn) {
        if (currentSortField === 'area') {
            areaBtn.classList.add('active');
            areaBtn.querySelector('.arrow').textContent = currentSortAscending ? '↑' : '↓';
        } else {
            areaBtn.classList.remove('active');
            areaBtn.querySelector('.arrow').textContent = '↑';
        }
    }
    // Price
    const priceBtn = document.getElementById('sort-price-toggle');
    if (priceBtn) {
        if (currentSortField === 'price') {
            priceBtn.classList.add('active');
            priceBtn.querySelector('.arrow').textContent = currentSortAscending ? '↑' : '↓';
        } else {
            priceBtn.classList.remove('active');
            priceBtn.querySelector('.arrow').textContent = '↑';
        }
    }
}

function showLoading() {
    const loadingContainer = document.getElementById('loading-container');
    const tableContainer = document.getElementById('table-container');
    const resultsInfo = document.querySelector('.results-info');
    const filters = document.querySelector('.filters');
    
    if (loadingContainer) {
        loadingContainer.classList.remove('hidden');
    }
    if (tableContainer) {
        tableContainer.classList.add('hidden');
    }
    if (resultsInfo) {
        resultsInfo.classList.add('hidden');
    }
    if (filters) {
        filters.classList.add('hidden');
    }
}

function hideLoading() {
    const loadingContainer = document.getElementById('loading-container');
    const tableContainer = document.getElementById('table-container');
    const resultsInfo = document.querySelector('.results-info');
    const filters = document.querySelector('.filters');
    
    if (loadingContainer) {
        loadingContainer.classList.add('hidden');
    }
    if (tableContainer) {
        tableContainer.classList.remove('hidden');
    }
    if (resultsInfo) {
        resultsInfo.classList.remove('hidden');
    }
    if (filters) {
        filters.classList.remove('hidden');
    }
}