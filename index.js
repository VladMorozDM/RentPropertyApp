/**
 * Created by vlad on 26.04.2019.
 */

class Item {
    constructor( { id = 0, ...rest } ) {
        this.id = id;
        this.rest = rest;

    }

    getTemplate() {
        return `<div class="rentProperty trigger">
                    <div>
                        <img src=${this.rest.thumb_url} alt="img">
                        <p>Keywords: ${this.rest.keywords}</p>
                    </div>
                    <p>Price: ${this.rest.price_formatted}</p>
                    <p>Summary: ${this.rest.summary}</p>
                </div>`;
    }
    getInfo(){

    }

    handleClick(controller, event) {
            const modal = document.querySelector(".modal");
            modal.classList.add("show-modal");

    }

}

class Service{
    constructor( callBack = 'incorrect'){
        this.callBack = callBack;
        this.state = {
            page: 0,
            countryUrl: "co.uk",
            country: "uk",
            city: ""
        };
    }
      getHouses (city) {
        if (typeof(city) === "string") {
            this.state.city = city;
            this.addScript("https://api.nestoria."
                            + this.state.countryUrl
                            + "/api?encoding=json&pretty=1&action=search_listings&country="
                            + this.state.country
                            + "&listing_type=buy&place_name="
                            + this.state.city);
        }

    }
    addScript(url){
        let script = document.createElement('script');
        script.async = false;
        script.src = `${url}&callback=${ this.callBack }.success`;
        document.head.appendChild(script);
    }

}


class View {
    constructor(root, service = {}, factory = {}){
        this.RentItems = [];
        this.pages = [];
        this.city ="brighton";
        this.root = root;
        this.service = service;
        this.factory = factory;


    }
    refresh(){
        this.pages.push(this.service.next());
    }
    success(data){
        this.RentItems = data.response.listings.map( item => {
            return new this.factory(item)});
        this.render();
    }
    onInit(){

        this.root.addEventListener("click", e => {
            if(false) {
                this.RentItems.map( item => item.handleClick(this, e) );
            }
            this.handleSubmit(e)
        })
    }
    handleSubmit(event){
        if(event.target.name === "searchCity" && event.target.type === "button"){
            const newCity = document.querySelector(`#${this.root.id} input[name="${event.target.name}"][type="text"]`).value;
            this.city = newCity.toLowerCase();
            this.getItems();
        }
    }
    getItems()  {
        this.service.getHouses(this.city, this);

    }
    getTemplate(){
        const wrapper = document.createElement("div");
        const inputs = `<input type="text" name="searchCity" placeholder="Your city...">
            <input type="button" name="searchCity" value="Find">`;
        wrapper.innerHTML = inputs;
        const ul = document.createElement("ul");
        ul.setAttribute("class", "listContainer");
        this.RentItems.forEach(item => {
            const wrapper = document.createElement("li");
            wrapper.innerHTML = item.getTemplate();
            ul.prepend(wrapper);
        });
        wrapper.append(ul);
        return wrapper
    }


    render() {
        this.root.innerHTML = '';
        const element = this.getTemplate();
        this.root.prepend(element);
    }
}



const listData = new Service("list");
const list = new View( document.getElementById("root"), listData, Item);
list.getItems();
list.onInit();
console.log(list);


