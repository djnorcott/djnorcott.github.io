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
    const gigs = await fetchCSVandConvertToJSON();
    displayGigs(gigs);
}

init();