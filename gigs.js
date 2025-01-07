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
            const values = row.split(',');
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
    const daysOfYear = generateDaysOfYear();

    daysOfYear.forEach(day => {
        const formattedDay = `${day.getDate()} ${day.toLocaleString('en-US', { month: 'long' })}`;
        const gigsOnDay = gigs.filter(gig => gig.Date.startsWith(formattedDay));

        const dayDiv = document.createElement('div');
        dayDiv.classList.add('day');
        dayDiv.innerHTML = `<h3>${formattedDay}</h3>`;

        if (gigsOnDay.length > 0) {
            gigsOnDay.forEach(gig => {
                const gigDetails = document.createElement('div');
                gigDetails.classList.add('gig');
                gigDetails.innerHTML = `
                    <p><strong>Date:</strong> ${gig.Date}</p>
                    <p><strong>Band:</strong> ${gig.Band}</p>
                    <p><strong>Headline:</strong> ${gig.Headline}</p>
                    <p><strong>Support:</strong> ${gig.Support}</p>
                    <p><strong>Venue:</strong> ${gig.Venue}</p>
                    <p><strong>Notes:</strong> ${gig.Notes}</p>
                `;
                dayDiv.appendChild(gigDetails);
            });
        } else {
            const noGigsMessage = document.createElement('p');
            noGigsMessage.textContent = "No gigs attended today.";
            dayDiv.appendChild(noGigsMessage);
        }

        gigList.appendChild(dayDiv);
    });
}

async function init() {
    const gigs = await fetchCSVandConvertToJSON();
    displayGigs(gigs);
}

init();