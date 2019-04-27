/**
 * Created by vlad on 26.04.2019.
 */

class Item {
    constructor( { id = 0, ...rest } ) {
        this.id = id;
        this.rest = rest;

    }

    getTemplate() {
        return `<div class="rentProperty trigger" key="${this.id}">
                    <div>
                        <img src=${this.rest.thumb_url} alt="img">
                        <p>Keywords: ${this.rest.keywords}</p>
                    </div>
                    <p>Price: ${this.rest.price_formatted}</p>
                    <p>Summary: ${this.rest.summary}</p>
                    <input type="button" name="addToFavorite" value="Add to favorite">
                </div>`;
    }
    getInfo(){

    }

    handleClick(controller, event) {

                let bubbled = event.target;
                while (bubbled.parentNode && !bubbled.getAttribute("key")) {
                    bubbled = bubbled.parentNode;
                }
                if (parseInt(bubbled.getAttribute("key")) === this.id) {
                    if( event.target.name === "addToFavorite" ){
                        controller.state.favItems.push(this);
                        console.log(controller.state.favItems);
                    }
                }
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

class AbstractView {
    constructor(root, factory){
        this.root = root;
        this.factory = factory;
    }
    success(data){
        this.state.rentItems = data.response.listings.map(item => {
            return new this.factory( {id: this.getId(), ...item} )
        });
        this.render();
    }
    onInit(){

        this.root.addEventListener("click", e => {
            console.log(e);
            this.handleClick(e)
        })
    }
    render() {
        this.root.innerHTML = '';
        const element = this.getTemplate();
        this.root.prepend(element);
    }
}


class ModalView extends AbstractView {
    constructor(root, factory, rentItems = []) {
        super(root, factory);
        this.rentItems = rentItems;
    }
    getTemplate(items = this.rentItems){
        const closeBtn = document.createElement("div");
        closeBtn.innerHTML = `<span class="close-button">&times;</span>`;
        const ul = document.createElement("ul");
        ul.setAttribute("class", "listContainer");
        items.forEach(item => {
            const wrapper = document.createElement("li");
            wrapper.innerHTML = item.getTemplate();
            ul.prepend(wrapper);
        });
        ul.prepend(closeBtn);
        return ul
    }
    handleClick( event ){
        console.log(event.target)

    }
}
class MainView extends AbstractView {
    constructor(root, service = {}, factory = {}, modalWindow = {}){
        super(root, factory);
        this.service = service;
        this.modalWindow = modalWindow;
        this.state = {
            rentItems: [],
            favItems: [],
            city: "brighton",
            id: 0
        }
    }
    onInit(){
        super.onInit();

    }
    handleClick(event){
        if(event.target.name === "searchCity" && event.target.type === "button"){
            const newCity = document.querySelector(`#${this.root.id} input[name="${event.target.name}"][type="text"]`).value;
            this.state.city = newCity.toLowerCase();
            this.getItems();
        }else if( event.target.name === "favorite" ){
            // console.log(this.modalWindow.root);
            this.modalWindow.root.parentNode.classList.toggle("show-modal");
            this.modalWindow.rentItems.push(...this.state.favItems);
            this.modalWindow.render();
        } else {
            this.state.rentItems.map(item => item.handleClick(this, event) );
        }
    }
    getItems()  {
        this.service.getHouses(this.state.city, this);
    }
    getId(){
        this.state.id = this.state.id+1;
        return this.state.id
    }
    getTemplate(items = this.state.rentItems){
        const wrapper = document.createElement("div");
        const inputs = `<input type="text" name="searchCity" placeholder=${this.state.city}>
            <input type="button" name="searchCity" value="Find">
            <input type="button" name="favorite" value="favorite" >`;
        wrapper.innerHTML = inputs;
        const ul = document.createElement("ul");
        ul.setAttribute("class", "listContainer");
        items.forEach(item => {
            const wrapper = document.createElement("li");
            wrapper.innerHTML = item.getTemplate();
            ul.prepend(wrapper);
        });
        wrapper.append(ul);
        return wrapper
    }

}



const listData = new Service("list");
const modal = new ModalView(document.getElementById("modal-content"),  Item);
const list = new MainView(  document.getElementById("root"),
                            listData,
                            Item,
                            modal
                          );
list.getItems();
list.onInit();



