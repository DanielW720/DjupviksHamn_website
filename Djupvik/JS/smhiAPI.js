// This module handles the API call to SMHI

// Call API
export async function SMHI_data() {
    // Return: list of lists. Each inner list contains all necessary data for a specific time.
    return fetch('https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/18.1489/lat/57.3081/data.json')
    .then(response => {
        return response.json();
    })
    .then (data => {
        return collectData(data);
    })
}

function collectData(dataObject) {
    // För klockslagen 6:00, 12:00 och 18:00, hämta:
    //     dag = idag eller imorgon
    //     klockslag = 06, 12 eller 18
    //     air tempature = t (celsius)
    //     wind direction = wd (degree)
    //     wind speed = ws (m/s)
    //     weather symbol = Wsymb2 (integer)
    dataObject = find_correct_dateTime(dataObject.timeSeries)  // filter for correct times and dates
    let data = [] // data to be returned

    let dataLength = dataObject.length;
    for (var i=0; i<dataLength; i++) {
        let row = [0, 0, 0, 0, 0, 0]  // store data for row i

        let dag = dataObject[i].dag
        row[0] = dag
        
        let klockslag = dataObject[i].klockslag
        row[1] = klockslag

        // The index of the parameters is unfortunately not static
        for (var j=0; j<dataObject[i].parameters.length; j++) {
            var par_name = dataObject[i].parameters[j].name
            if (par_name == 't') {
                let airTempature = dataObject[i].parameters[j].values[0]
                row[2] = airTempature
            } else if (par_name == 'wd') {
                let wind_direction = dataObject[i].parameters[j].values[0]
                row[3] = wind_direction
            } else if (par_name == 'ws') {
                let wind_speed = dataObject[i].parameters[j].values[0]
                row[4] = wind_speed
            } else if (par_name == 'tcc_mean') {
                let tcc = dataObject[i].parameters[j].values[0]
                row[5] = tcc
            }
        }
        data.push(row) // push row i to data
    }
    return data;
}

const todaysDate = new Date().getDate()
var tomorrow = new Date()
tomorrow.setDate(new Date().getDate()+1);
const tomorrowsDate = tomorrow.getDate()

let t1 = todaysDate + 'T' + '06:00';
let t2 = todaysDate + 'T' + '12:00';
let t3 = todaysDate + 'T' + '18:00';
let t4 = tomorrowsDate + 'T' + '06:00';
let t5 = tomorrowsDate + 'T' + '12:00';
let t6 = tomorrowsDate + 'T' + '18:00';

var times = [t1, t2, t3, t4, t5, t6];

function find_correct_dateTime(timeSeriesData) {
    // Väljer ut data för endast de korrekta tiderna
    let data = []
    let dataLength = timeSeriesData.length;
    loop1:
    for (var i=0; i<dataLength; i++) {
        var time = timeSeriesData[i].validTime;
        for (var j=0; j<6; j++) {
            if (time.includes(times[j])) {
                if (j==0) {
                    timeSeriesData[i].dag = 'idag'
                    timeSeriesData[i].klockslag = '06'
                    data.push(timeSeriesData[i])
                    continue loop1; // When one is found, stop nested loop and continue with next ith iteration
                } else if (j==1) {
                    timeSeriesData[i].dag = 'idag'
                    timeSeriesData[i].klockslag = '12'
                    data.push(timeSeriesData[i])
                    continue loop1;
                } else if (j==2) {
                    timeSeriesData[i].dag = 'idag'
                    timeSeriesData[i].klockslag = '18'
                    data.push(timeSeriesData[i])
                    continue loop1;
                } else if (j==3) {
                    timeSeriesData[i].dag = 'imorgon'
                    timeSeriesData[i].klockslag = '06'
                    data.push(timeSeriesData[i])
                    continue loop1;
                } else if (j==4) {
                    timeSeriesData[i].dag = 'imorgon'
                    timeSeriesData[i].klockslag = '12'
                    data.push(timeSeriesData[i])
                    continue loop1;
                } else if (j==5) {
                    timeSeriesData[i].dag = 'imorgon'
                    timeSeriesData[i].klockslag = '18'
                    data.push(timeSeriesData[i])
                    continue loop1;
                }
            }
        }   
    }
    return data;
}
