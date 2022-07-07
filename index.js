
class House {
    constructor(name) {
        this.name = name;
        this.rooms = [];
    }

    addRoom(name, area) {
        this.rooms.push(new Room(name, area));
    }
}

class Room {
    constructor(name, area) {
        this.name = name;
        this.area = area;
    }
}




//HouseService is where we'll keep all CRUD operations
class HouseService {
    //static Variable made for class that points to url we'll use.
    // This url is our endpoint where we'll post.
    static url = 'https://crudcrud.com/api/7952ae91b4c34c9d83bac1ce3cf90c86/pokemon'

    // Retrieves all house data JSON.
    static getAllHouses() {
        //this= HouseService .url= static url inside class(houseService)
        return $.get(this.url);

    }
    //Gets a specific house from all houses based on the id in the api
    static getHouse(id) {
        return $.get(this.url + `/${id}`);
    }

    //Takes an instance of a house we create in class House, which has a name and array in it.
    static createHouse(house) {
        //post is to create new resource
        //arguments(url, house that was passed in, is posted to url api(It's the http payload))
        //return $.post(this.url, house);
        return $.ajax({
            url: this.url,
            data: JSON.stringify(house),
            dataType: "json",
            contentType: "application/json",
            type: "POST",
        })


    }


    static updateHouse(house) {
        //We're having ajax just take in one object{}. Whats it doing to it?
        return $.ajax({
            //We're updating the house by grabbing its id.
            // _id because _ mongo database will automatically create it for our house.
            url: this.url + `/${house._id}`,
            dataType: 'json',
            //data payload.
            //JSON stringify gets an object and converts it into a string, for sending to http request.
            data: JSON.stringify({ "name": house.name, "rooms": house.rooms }),
            contentType: 'application/json',
            //This is a PUT request similiar to our GET and POST requests. Happens downstream of $.AJAX method
            type: 'PUT'

        })
    }

    //Whichever house matches id Delete it.
    static deleteHouse(id) {

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
    static houses;

    static getAllHouses() {
        //HS class. HSmethod       . Promise()
        HouseService.getAllHouses()

            //pass houses array from api into our render method.
            .then(houses => this.render(houses));
    }

    //creates createHOUSe service post the "new House" created to our api.
    static createHouse(name) {
        HouseService.createHouse(new House(name))
            .then(() => {
                return HouseService.getAllHouses();
            })
            .then((houses) => this.render(houses));
    }

    static deleteHouse(id) {

        //delete houses from api
        HouseService.deleteHouse(id)
            //sent http request to api to get all houses again
            .then(() => {
                return HouseService.getAllHouses();
            })
            //we have the api data now render it on screen.
            .then((houses) => this.render(houses));
    }

    static addRoom(id) {
        //first find house before adding room
        for (let house of this.houses) {
            //if house id in loop matches id we pass in this.addRoom(id)
            if (house._id == id) {
                //new Room takes in 2 arg, id room name, id house room area.
                //we're pushing a new room to our rooms array within that house object.
                house.rooms.push(new Room($(`#${house._id}-room-name`).val(), $(`#${house._id}-room-area`).val()));
                console.log(house);
                //Then we call the api and wanna update the house on there with our changes.
                HouseService.updateHouse(house)
                    //after houses updated, grab all houses info and re-render them onscreen.
                    .then(() => {
                        return HouseService.getAllHouses();
                    })
                    .then((houses) => this.render(houses));
            }


        }
    }

    static deleteRoom(houseId, roomId) {
        for (let house of this.houses) {
            if (house._id == houseId) {
                for (let room of house.rooms) {
                    if (room._id == roomId) {
                        house.rooms.splice(house.rooms.indexOf(room), 1);
                        HouseService.updateHouse(house)
                            .then(() => {
                                return HouseService.getAllHouses();
                            })
                            .then((houses) => this.render(houses))
                    }
                }
            }
        }
    }

    // On the Dom adds/renders houses down the list.
    static render(houses) {
        this.houses = houses;
        //Grabs our empty div app,
        //empty clears it everytime we render.
        $('#app').empty();
        //loop through all the houses.
        for (let house of houses) {
            //prepend puts newest house on top
            $('#app').prepend(
                `<div id="${house._id}" class="card">
                    <div class="card-header">
                        <h2>${house.name}</h2>
                        <button class= "btn btn-danger" onclick="DOMManager.deleteHouse('${house._id}')">Delete</button>
                    </div>
                    <div class="card-body">
                      <div class="card">
                        <div class="row">
                          <div class="col-sm">
                            <input type="text" id="${house._id}-room-name" class="form-control" placeholder="Room Name">
                          </div>
                          <div class="col-sm">
                            <input type="text" id="${house._id}-room-area" class="form-control" placeholder="Room Area">
                          </div>
                        </div>
                        <button id="${house._id}-new-room" onclick="DOMManager.addRoom('${house._id}')" class="btn btn-primary form-control">Add</button>
                      </div>  
                    </div>
                    </div><br>`
            );
            //nested loop renders info for rooms in the selected house.
            for (let room of house.rooms) {
                console.log('lolwut')
                $(`#${house._id}`).find('.card-body').append(
                    `<p>
                      <span id="name-${room._id}"><strong>Name: </strong> ${room.name}</span>
                      <span id="name-${room._id}"><strong>Area: </strong> ${room.area}</span>
                      <button class="btn btn-danger" onclick="DOMManager.deleteRoom('${house._id}', '${room._id}')">Delete Room</button>`
                )
            }


        }
    }
}

//selects new house button. click() doesn't work desecrated.
$('#create-new-house').on("click", () => {
    DOMManager.createHouse($('#new-house-name').val());
    $('#new-house-name').val('')
});

DOMManager.getAllHouses();




