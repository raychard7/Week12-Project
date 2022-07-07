



class Trainer{
    constructor(name) {
        this.name = name
        this.pokemon = []
    }

    addPokemon(name, level){
        this.pokemon.push(new Pokemon(name, level));
    }
}
class Pokemon {
    constructor(name, level) {
        this.name = name;
        this.level = level;
    }
}



//HouseService is where we'll keep all CRUD operations
class TrainerService {
    //static Variable made for class that points to url we'll use.
    // This url is our endpoint where we'll post.
    static url = 'https://crudcrud.com/api/6bf93b2a2c4745b68e5bdd2d9202f05e/pokemon'

    // Retrieves all house data JSON.
    static getAllTrainers() {
        //this= HouseService .url= static url inside class(houseService)
        return $.get(this.url);

    }
    //Gets a specific house from all houses based on the id in the api
    static getTrainer(id) {
        return $.get(this.url + `/${id}`);
    }

    //Takes an instance of a house we create in class House, which has a name and array in it.
    static createTrainer(trainer) {
        //post is to create new resource
        //arguments(url, house that was passed in, is posted to url api(It's the http payload))
        //return $.post(this.url, house);
        console.log(trainer)
        return $.ajax({
            url: this.url,
            data: JSON.stringify(trainer),
            dataType: "json",
            contentType: "application/json",
            type: "POST",
        })
    }

    static updateTrainer(trainer) {
        //We're having ajax just take in one object{}. Whats it doing to it?
        return $.ajax({
            //We're updating the house by grabbing its id.
            // _id because _ mongo database will automatically create it for our house.
            url: this.url + `/${trainer._id}`,
            dataType: 'json',
            //data payload.
            //JSON stringify gets an object and converts it into a string, for sending to http request.
            data: JSON.stringify({ "name": trainer.name, "pokemon": trainer.pokemon }),
            contentType: 'application/json',
            //This is a PUT request similiar to our GET and POST requests. Happens downstream of $.AJAX method
            type: 'PUT'

        })
    }

    //Whichever house matches id Delete it.
    static deleteTrainer(id) {

        return $.ajax({
            url: this.url + `/${id}`,
            type: 'DELETE'

        });
    }
}


//Code flow for DOM Manager
// 1. CRUD: houseservice Create/read/update/delete to api
// 2. Get from api: Get all houses from url
// 3. Render changes to page


class DOMManager {
    //houses is all houses in this class.
    //static= a method or property that belongs to a class and not any one object.
    //house= is the object that is each individual house in api storage.
    static trainers;
    
    static getAllTrainers() {
        //HS class. HSmethod       . Promise()
        TrainerService.getAllTrainers()

            //pass houses array from api into our render method.
            .then(trainers => this.render(trainers));
    }

    //creates createHOUSe service post the "new House" created to our api.
    static createTrainer(name) {
        TrainerService.createTrainer(new Trainer(name))
            .then(() => {
                return TrainerService.getAllTrainers();
            })
            .then((trainers) => this.render(trainers));
    }

    static deleteTrainer(id) {

        //delete houses from api
        TrainerService.deleteTrainer(id)
            //sent http request to api to get all houses again
            .then(() => {
                return TrainerService.getAllTrainers();
            })
            //we have the api data now render it on screen.
            .then((trainers) => this.render(trainers));
    }

    static addPokemon(id) {
       
        //first find house before adding room
        for (let trainer of this.trainers) {
           
            //if house id in loop matches id we pass in this.addRoom(id)
            if (trainer._id == id) {
                //new Room takes in 2 arg, id room name, id house room area.
                //we're pushing a new room to our rooms array within that house object.
                trainer.pokemon.push(new Pokemon($(`#${trainer._id}-pokemon-name`).val(), $(`#${trainer._id}-pokemon-level`).val()));
               
                //Then we call the api and wanna update the house on there with our changes.
                TrainerService.updateTrainer(trainer)
                    //after houses updated, grab all houses info and re-render them onscreen.
                    .then(() => {
                        return TrainerService.getAllTrainers();
                    })
                    .then((trainers) => this.render(trainers));
            }


        }
    }

    static deletePokemon(trainerId, pokemonName) {
       

        for (let trainer of this.trainers) {
            if (trainer._id == trainerId) {
                for (let pokemon of trainer.pokemon) {
                    //Crud example had a room(pokemon id), I don't so I use pokemon name instead.
                    //pokemon vs pokemons?
                    if (pokemon.name == pokemonName) {
                        trainer.pokemon.splice(trainer.pokemon.indexOf(pokemon), 1);
                        TrainerService.updateTrainer(Trainer)
                            .then(() => {
                                return TrainerService.getAllTrainers();
                            })
                            .then((trainers) => this.render(trainers))
                    }
                }
            }
        }
    }

    // On the Dom adds/renders houses down the list.
    static render(trainers) {
        this.trainers = trainers;
        //Grabs our empty div app,
        //empty clears it everytime we render.
        $('#app').empty();
        //loop through all the houses.
        for (let trainer of trainers) {
            //prepend puts newest house on top
            $('#app').prepend(
                `<div id="${trainer._id}" class="card">
                    <div class="card-header">
                        <h2>${trainer.name}</h2>
                        <button class= "btn btn-danger" onclick="DOMManager.deleteTrainer('${trainer._id}')">Delete</button>
                    </div>
                    <div class="card-body">
                      <div class="card">
                        <div class="row">
                          <div class="col-sm">
                            <input type="text" id="${trainer._id}-pokemon-name" class="form-control" placeholder="Pokemon Name">
                          </div>
                          <div class="col-sm">
                            <input type="text" id="${trainer._id}-pokemon-level" class="form-control" placeholder="Pokemon Level">
                          </div>
                        </div>
                        <button id="${trainer._id}-new-room" onclick="DOMManager.addPokemon('${trainer._id}')" class="btn btn-primary form-control">Add</button>
                      </div>  
                    </div>
                    </div><br>`
            );
            //nested loop renders info for rooms in the selected house.
            for (let pokemon of trainer.pokemon) {
                
                $(`#${trainer._id}`).find('.card-body').append(
                    `<p>
                      <span id="name-${pokemon.name}"><strong>Name: </strong> ${pokemon.name}</span>
                      <span id="name-${pokemon.name}"><strong>Level: </strong> ${pokemon.level}</span>
                      <button class="btn btn-danger" onclick="DOMManager.deletePokemon('${trainer._id}', '${pokemon.name}')">Delete Room</button>`
                )
            }


        }
    }
}

//selects new house button. click() doesn't work desecrated.
$('#create-new-trainer').on("click", () => {
    DOMManager.createTrainer($('#new-trainer-name').val());
    $('#new-trainer-name').val('')
});

DOMManager.getAllTrainers();




