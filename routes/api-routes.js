// Requiring our models
const db = require("../models");

module.exports = (app) => {
  // GET route for getting all of the burgers
  app.get("/api/burgers", (req, res) => {
    db.Burger.findAll({}).then((data) => res.json(data));
  });

  // POST route for saving a new todo
  app.post("/api/burgers", (req, res) => {
    db.Burger.create({
      text: req.body.text,
      complete: req.body.complete,
    }).then((data) => res.json(data));
  });

  // DELETE route for deleting burgers. We can get the id of the todo to be deleted
  app.delete("/api/burgers/:id", (req, res) => {
    // Destroy takes in one argument: a "where object describing the burgers we want to destroy
    db.Burger.destroy({
      where: {
        id: req.params.id,
      },
    }).then((data) => res.json(data));
  });

  // PUT route for updating burgers. We can get the updated todo data from req.body
  app.put("/api/burgers", (req, res) => {
    // Update takes in two arguments, an object we want to update, and "where" the id = req.body.id
    db.Burger.update(
      {
        name: req.body.name,
        smashed: req.body.smashed,
      },
      {
        where: {
          id: req.body.id,
        },
      }
    ).then((data) => res.json(data));
  });
};
