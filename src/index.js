const app = require('express')();
const finder = require('./finder');

app.get('/',  (req, res) => {
    (async () => {
        const address = await finder.find();
        res.status(200).send({ address });
    })()
})

app.listen(3000, () => {
    console.log('App listening on port 3000!');
});