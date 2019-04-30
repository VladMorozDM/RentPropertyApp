/**
 * Created by vlad on 26.04.2019.
 */
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
        const info = Object.keys( this.rest ).filter( (key,i) => i%2 !==0).reduce( (acc, key, indx) => {
            return acc + `<p>${key}: ${this.rest[key]}</p>`
        }, '');
        const closeBtn = document.createElement("div");
        closeBtn.innerHTML = `<span class="close-button" key="k">&times;</span>`;
        const wrapper = document.createElement("div");
        wrapper.classList.add("modal-content");
        wrapper.innerHTML = info;
        wrapper.prepend(closeBtn);
        return wrapper;
    }
    isThis(event){
        let bubbled = event.target;
        while (bubbled.parentNode && !bubbled.getAttribute("key")) {
            bubbled = bubbled.parentNode;
        }
        return bubbled.getAttribute("key") === this.id;
    }
    handleClick(controller, event) {
                if (this.isThis(event)) {
                    if( event.target.name === "addToFavorite" ){
                        event.target.setAttribute("disabled", "true");
                        controller.state.favItems.push(this);
                    }else{
                        console.log("here");
                        controller.showModal( [this] );
                    }
                }
    }
}

class AbstractView {
    constructor(root = document.body, factory){
        this.root = root;
        this.factory = factory;
    }
    onInit(){
        this.root.addEventListener("click", e => {
            this.handleClick(e)
        })
    }
    getTemplate(items){
        const ul = document.createElement("ul");
        ul.setAttribute("class", "listContainer");
        items.forEach(item => {
            const wrapper = document.createElement("li");
            wrapper.innerHTML = item.getTemplate();
            ul.prepend(wrapper);
        });
        return ul;
    }
    render() {
        this.root.innerHTML = '';
        const element = this.getTemplate();
        this.root.append(element);
    }

}


class ModalView extends AbstractView {
    constructor( factory, root, rentItems = []) {
        super(root, factory);
        this.rentItems = rentItems;
    }
    getTemplate(items = this.rentItems){
        const modalContent = document.createElement("div");
        modalContent.classList.add("modal-content");
        const ul = super.getTemplate( items );
        const closeBtn = document.createElement("div");
        closeBtn.innerHTML = `<span class="close-button" key="k">&times;</span>`;
        ul.prepend(closeBtn);
        modalContent.append(ul);
        return modalContent
    }
    handleClick( event ){
        if(event.target.classList.contains("close-button")){
            this.root.classList.remove("show-modal");
            document.body.classList.remove("modal-open");
        }else if( event.target.name === "favorite"  ){
            this.root.classList.add("show-modal");
        }
    }
    render( item ){
        if( item  ){
            this.root.innerHTML = '';
            const element = item[0].getInfo();
            this.root.append(element);
            this.root.classList.add("show-modal")
        }else{
            super.render();
        }
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
    handleClick(event){
        if(event.target.name === "searchCity" && event.target.type === "button"){
            const newCity = document.querySelector(`#${this.root.id} input[name="${event.target.name}"][type="text"]`).value;
            this.state.city = newCity.toLowerCase();
            this.getItems();
        }else if( event.target.name === "favorite" ) {
            if(this.modalWindow.rentItems.length !== this.state.favItems.length){
                this.modalWindow.rentItems = this.state.favItems;
            }
            document.body.classList.add("modal-open");
            this.showModal();
        } else {
            this.state.rentItems.map(item => item.handleClick(this, event) );
        }
    }
    showModal( item ){
        this.modalWindow.render( item );
    }
    getItems()  {
        this.service.getHouses(this.state.city, this);
    }
    getId(item){
        return `${item.latitude}${item.longitude}${item.price}`
    }
    success(data){
        this.state.rentItems = data.response.listings.map(item => {
            return new this.factory( {id: this.getId(item), ...item} )
        });
        this.render();
    }
    createModal(){
        const modalWrapper = document.createElement("div");
        modalWrapper.classList.add("modal");
        this.root.prepend(modalWrapper);
        console.log(document.getElementById(`${this.root.id}`), modalWrapper);
        this.modalWindow.root = document.querySelector(`#${this.root.id} .modal`);
    }
    getTemplate(items = this.state.rentItems){
        const ul = super.getTemplate( items );
        const wrapper = document.createElement("div");
        const inputs = `<input type="text" name="searchCity" placeholder=${this.state.city}>
            <input type="button" name="searchCity" value="Find">
            <input type="button" name="favorite" value="favorite" >`;
        wrapper.innerHTML = inputs;
        wrapper.append(ul);
        return wrapper;
    }
    render(){
        super.render();
        this.createModal();
    }

}



const listData = new Service("list");
const modal = new ModalView( Item );
modal.onInit();
const list = new MainView(  document.getElementById("root"),
                            listData,
                            Item,
                            modal
                          );
list.getItems();
list.onInit();



