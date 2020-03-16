# Covid-19 Charts

Felt the need to make some charts to compare contagion rates of several countries. Code is miserable, please don't look at it too hard.

## Method

`index.js` is the script to take the (John Hoptkins datasets)[https://github.com/CSSEGISandData/COVID-19/] and put them into a sqlite database. I then hammered some sql queries to get the data in the format I wanted.

`index.html` renders the charts.
