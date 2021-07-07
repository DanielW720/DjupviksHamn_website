import {SMHI_data} from './smhiAPI.js';

const SMHI_WIDGET = document.querySelector('#smhi-widget') // <div> for tables to show up

// Class for tables. This way we can easily add more days of weather 
// to our sight if we would like to!
class Table {
    label = document.createElement('h3')
    table = document.createElement('table')
    thead = document.createElement('thead')
    tr = document.createElement('tr')
    th_kl = document.createElement('th')
    th_temp = document.createElement('th')
    th_vind = document.createElement('th')
    th_himmel = document.createElement('th')
    tbody = document.createElement('tbody')
    constructor(dayStr) {
        this.label.innerHTML = dayStr; // exempelvis "Idag" eller "Imorgon"
        SMHI_WIDGET.appendChild(this.label)
        this.table.classList.add('vaderdata')
        SMHI_WIDGET.appendChild(this.table)
        this.table.appendChild(this.thead)
        this.thead.appendChild(this.tr)
        this.th_kl.innerHTML = 'KL'
        this.th_temp.innerHTML = 'Temp'
        this.th_vind.innerHTML = 'Vind'
        this.th_himmel.innerHTML = 'Himmel'
        this.th_himmel.id = "th_himmel"
        this.tr.appendChild(this.th_kl)
        this.tr.appendChild(this.th_temp)
        this.tr.appendChild(this.th_vind)
        this.tr.appendChild(this.th_himmel)
        this.tbody.id = "smhi_" + dayStr.toLowerCase();
        this.table.appendChild(this.tbody)
    }
}

// create Table instances for todays and tomorrows weather
const tabell_idag = new Table("Idag");
const tabell_imorgon = new Table("Imorgon");

// -----------------------------------------------------------

// Get data from SMHI and add to tables
SMHI_data().then(data => {
    for (var i=0; i<data.length; i++) {
        if (data[i][0] == 'idag') {
            addTableData(data[i], tabell_idag)
        } else if (data[i][0] == 'imorgon') {
            addTableData(data[i], tabell_imorgon)
        }
    }
})

function addTableData(rowData, tableObject) {
    const newTR = document.createElement('tr')  // tr element for a new table row
    
    // Go ahead and create td (table data) elements. Add innerHTML too
    var KL = document.createElement('td')
    KL.innerHTML = rowData[1]
    newTR.appendChild(KL)
    
    var Temp = document.createElement('td')
    Temp.innerHTML = rowData[2]
    newTR.appendChild(Temp)

    var wind_direction = rowData[3] // integer (degree), 0 <= degree < 360. (0 points to perfectly to east)
    var arrow = '';

    // Decide what direction the wind arrow should point at
    for (var i=0; i<8; i++) {
        var lower = degree_intervals[i][0]
        var upper = degree_intervals[i][1]
        if (lower <= wind_direction && wind_direction <= upper) {
            arrow = arrows[i] // choose correct UTF-8 arrow
        } else if (i == 6 && ((lower <= wind_direction && wind_direction <= 359) || (0 <= wind_direction && wind_direction <= upper))) {
            // special case because degree 0 is in between degree 330 and degree 29
            arrow = arrows[i]
        }
    }

    var wind_dir_speed = document.createElement('td')
    wind_dir_speed.innerHTML = arrow + ' ' + "(" + rowData[4] + ")";
    newTR.appendChild(wind_dir_speed)

    var tcc = document.createElement('td')
    tcc.innerHTML = sky[rowData[5]]
    newTR.appendChild(tcc)

    // add the new row to the table instance
    tableObject.tbody.appendChild(newTR)
}

// sky består av molnighetsbeskrivningar
const sky = 
    [
        'Klart', 'Nästan klart', 'Enstaka moln', 'Viss molnighet',
        'Varierad molnighet', 'Molnigt', 'Mulet', 'Mycket molnigt', 'Tung molnighet'
    ]

// degree intervals for a full circle
const degree_intervals = [[60, 119], [120, 149], [150, 209], [210, 239], [240, 299], [300, 329], [330, 29], [30, 60]]
// order: north, north-west, west, south-west, south, south-east, east, north-east
const arrows = ['&#8593', '&#8598', '&#8592', '&#8601', '&#8595', '&#8600', '&#8594', '&#8599']
