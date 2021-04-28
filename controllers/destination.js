const Destination = require('../models/destination');
const Menu = require('../models/menu');
const User = require('../models/user');
const Comment = require('../models/user');

module.exports = {
    index,
    show,
    new: newDestination,
    create,
    delete: deleteOne,
    edit,
    update,
    addComment,
    deleteComment
};

function index(req, res) { // good
    Destination.find({}, function(err, destinations) {
        if(err) {
            console.log(err);
        } else {
            res.render('destinations/index', { 
                title: 'All Destinations', 
                destinations,
                user: req.user
            });
        }
    });
}

function show(req, res) { // good
    Destination.findById(req.params.id, function(err, destination) {
        Menu.find( { destination: destination._id }, function(err, menu) {
            if (err) return res.redirect('/destinations');
            res.render('destinations/show', { 
                title: 'Destination Detail', 
                destination, 
                menu,
                user: req.user,
                comments: destination.comments
            });
        });
    });
}

function newDestination(req, res) { // good
    const price = Destination.schema.path('price').enumValues;
    res.render('destinations/new', { 
        title: 'Add Destination', 
        price,
        user: req.user
    });
}

function create(req, res) { // good
    for (let key in req.body) {
        if (req.body[key] === '') delete req.body[key];
    }

    Destination.create(req.body, function(err, destination) {
        if (err) return res.redirect('/destinations/new');
        res.redirect('/destinations');
    })
}

function deleteOne(req, res) {
    Destination.findByIdAndDelete(req.params.id, function(err, destination) {
        res.redirect(`/destinations`)
    });
}

function update(req, res) { // works, but crashes after updating
    if(req.body.done === 'on') {
        req.body.done = true;
    } else {
        req.body.done = false;
    }
    const id = req.params.id;
    Destination.findOne( {_id: id} , function(err, destination) {
        if (err) {
            console.log(err);
            res.sendStatus(500);
            return;
        }
        if (req.body.name) {
            destination.name = req.body.name;
        }
        if (req.body.city) {
            destination.city = req.body.city;
        }
        if (req.body.state) {
            destination.state = req.body.state;
        }
        if (req.body.country) {
            destination.country = req.body.country;
        }
        if (req.body.cuisine) {
            destination.cuisine = req.body.cuisine;
        }
        if (req.body.category) {
            destination.category = req.body.category;
        }
        if (req.body.price) {
            destination.price = req.body.price;
        }
        if (req.body.image) {
            destination.image = req.body.image;
        }

        destination.save(function(err) {
            if (err) {
                return res.send();
            }
            res.redirect('/destinations/' + id);              
        });
    
    });
}

function edit(req, res) { 
    const price = Destination.schema.path('price').enumValues;
    Destination.findById(req.params.id, function(err, destination) {
        if (err) return res.redirect('/destinations/' + req.params.id);
        res.render('destinations/edit', { 
            title: 'Update Destination',
            destinationId: req.params.id, 
            destination, 
            price ,
            user: req.user
        });
    })
}

function addComment(req, res) {
    Destination.findById(req.params.id, function(err, destination) {
        Comment.find( {}, function(err, comments) {
            Comment.create(req.body, function(err, comment) {
                if (err) return res.redirect('/destinations');                
                req.user.comments.push(req.body);
                req.user.save(function(err) {
                    res.redirect(`/destinations/${destination._id}`);
                });                
            });
        });
    });
}

function deleteComment(req, res) {
    req.user.comments.pull(req.params.id);
    req.user.save(function(err) {
        res.redirect(`/destination/${destination._id}`)
    })
}