// define a global variable to store the gig list in
let gigs = [];

async function fetchCSVandConvertToJSON() {
    try {
        const response = await fetch('gigs.csv');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const csvText = await response.text();

        const rows = csvText.split('\n').map(row => row.trim()).filter(row => row);
        const headers = rows.shift().split(',');

        const jsonData = rows.map(row => {
            const values = [];
            let inQuotes = false;
            let value = '';

            for (let char of row) {
                if (char === '"' && !inQuotes) {
                    inQuotes = true;
                } else if (char === '"' && inQuotes) {
                    inQuotes = false;
                } else if (char === ',' && !inQuotes) {
                    values.push(value);
                    value = '';
                } else {
                    value += char;
                }
            }
            values.push(value);

            return headers.reduce((acc, header, index) => {
                acc[header] = values[index];
                return acc;
            }, {});
        });

        return jsonData;
    } catch (error) {
        console.error('Error fetching or processing the CSV file:', error);
        return [];
    }
}


function generateDaysOfYear() {
    const days = [];
    const year = new Date().getFullYear();
    const date = new Date(year, 0, 1);

    while (date.getFullYear() === year) {
        days.push(new Date(date));
        date.setDate(date.getDate() + 1);
    }

    return days;
}

function displayGigs(gigs) {
    const gigList = document.getElementById('gig-list');

    let today = new Date();
    //If there is a date in the querystring, in YYYYMMDD format, use that instead of today
    const urlParams = new URLSearchParams(window.location.search);
    const dateParam = urlParams.get('date');

    if (dateParam && dateParam.length === 8) {
        today = new Date(dateParam.substring(0, 4), dateParam.substring(4, 6) - 1, dateParam.substring(6, 8));
    }

    // Get the items in the gigs array that have a starting with today's day and month
    const gigsOnDay = gigs.filter(gig => {
        const gigDate = new Date(gig.Date);
    
        return gigDate.getDate() === today.getDate() && gigDate.getMonth() === today.getMonth();
    });
    
    const formattedDay = today.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    const dayDiv = document.createElement('div');
    dayDiv.classList.add('day');
    dayDiv.innerHTML = `<h3>${formattedDay}</h3>`;

    if (gigsOnDay.length > 0) {
        gigsOnDay.forEach(gig => {
            const gigDetails = document.createElement('h6');
            gigDetails.innerHTML = gig.Concatenate;
            dayDiv.appendChild(gigDetails);
        });
    } else {
        const noGigsMessage = document.createElement('h6');
        noGigsMessage.textContent = "No gigs attended today.";
        dayDiv.appendChild(noGigsMessage);
    }

    gigList.appendChild(dayDiv);

}

async function init() {
    gigs = await fetchCSVandConvertToJSON();
    displayGigs(gigs);
}

init();

/**
 * If enter is pressed in the search-input text box, or the #search-button is pressed, call a function with the value of the search-input text box
 */

document.getElementById('search-button').addEventListener('click', function() {
    search();
    
    // suppress the default form submission
    return false;
});

document.getElementById('search-input').addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        search();

        // suppress the default form submission
        return false;
    }
});

function search() {
    const searchValue = document.getElementById('search-input').value;
    if (searchValue) {
        
        // Find any gigs that contain the search value in the concatenate field
        const searchResults = gigs.filter(gig => gig.Concatenate.toLowerCase().includes(searchValue.toLowerCase()));

        // order by Gig Date
        searchResults.sort((a, b) => {
            return new Date(a.Date) - new Date(b.Date);
        });

        // Clear the current gig list
        document.getElementById('gig-list').innerHTML = '';

        // If none were found display a message
        if (searchResults.length === 0) {
            const noGigsMessage = document.createElement('h6');
            noGigsMessage.textContent = "No gigs found containing '" + searchValue + "'";
            document.getElementById('gig-list').appendChild(noGigsMessage);
        } else {
            const searchResultsHeader = document.createElement('h5');
            searchResultsHeader.textContent = "Gigs found containing '" + searchValue + "'";
            document.getElementById('gig-list').appendChild(searchResultsHeader);
        }

        // Display the search results
        searchResults.forEach(gig => {
            const gigDetails = document.createElement('h6');

            gigOutput = gig.Concatenate;

            // Remove everything before Mike saw
            gigOutput = gigOutput.substring(gigOutput.indexOf("Mike saw") )

            gigOutput = "On " + gig.Date + " " + gigOutput;

            gigDetails.innerHTML = gigOutput;
            document.getElementById('gig-list').appendChild(gigDetails);
        });

        // Remove the show-modal class from #search-modal
        document.getElementById('search-modal').classList.remove('show-modal');
    }
}