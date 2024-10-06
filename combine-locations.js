const fs = require('fs');
// const _ = require('lodash');

const locationsAll = JSON.parse(fs.readFileSync('./data/locations_all.json'));
const locations = locationsAll.map(location => ({
    id: location.pos.posId,
    city: location.pos.city,
    name: location.pos.agency,
}));
// const l2 = JSON.parse(fs.readFileSync('./data/locations2.json'));

// const combined = _.uniqWith([...l1, ...l2], _.isEqual);

fs.writeFileSync('./data/locations.json', JSON.stringify(locations, null, 4));


