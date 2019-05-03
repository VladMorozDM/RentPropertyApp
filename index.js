/**
 * Created by vlad on 26.04.2019.
 */
class AbstractService{
    constructor( callbackName ){
        this.callbackName = callbackName;
    }
    addScript(url){
        let script = document.createElement('script');
        script.async = true;
        script.src = `${url}&callback=${ this.callbackName }.success`;
        document.head.appendChild(script);
    }
}
class NestoriaService extends AbstractService{
    constructor( callbackName = 'incorrect'){
        super( callbackName );
        this.state = {
            numberOfResults: 5,
            page: 1,
            countryUrl: "co.uk",
            country: "uk",
            city: "york"
        };
    }
    getHouses ( city, page, numOfResults = this.state.numberOfResults ) {
            this.state.city = city || this.state.city;
            this.state.page = page || this.state.page;
            this.state.numberOfResults = numOfResults;
            this.addScript("https://api.nestoria."
                + this.state.countryUrl
                + "/api?encoding=json&pretty=1&action=search_listings&country="
                + this.state.country
                + "&listing_type=buy&place_name="
                + this.state.city
                + "&page="
                + this.state.page
                + "&number_of_results="
                + this.state.numberOfResults
            );


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
    constructor(  root, rentItems = []) {
        super(root);
        this.rentItems = rentItems;
    }
    getTemplate(items = this.rentItems){
        const modalContent = document.createElement("div");
        modalContent.classList.add("modal-content");
        const ul = super.getTemplate( items );
        modalContent.append(ul);
        return modalContent
    }
    handleClick( controller, event ){
        if( event.target.classList.contains("close-button")
            || event.target.classList.contains("modal")
                && !event.target.classList.contains("modal-content") ){
            this.root.classList.remove("show-modal");
            document.body.classList.remove("modal-open");
            controller.state.isModal = false;
            controller.render();
        }else if( event.target.name === "favorite"  ){
            this.root.classList.add("show-modal");
        }
    }
    render( item ){
        if( item  ){
            this.root.innerHTML = '';
            const element = item.getInfo();
            this.root.append(element);
            const closeBtn = document.createElement("div");
            closeBtn.innerHTML = `<span class="close-button" key="k">&times;</span>`;
            this.root.append(closeBtn);
            this.root.classList.add("show-modal")
        }
        else{
            super.render();
            const closeBtn = document.createElement("div");
            closeBtn.innerHTML = `<span class="close-button" key="k">&times;</span>`;
            this.root.append(closeBtn);
            this.root.classList.add("show-modal");
        }
    }
}
class MainView extends AbstractView {
    constructor(root, service = {}, factory = {}, modalWindow = {}){
        super(root, factory);
        this.service = service;
        this.modalWindow = modalWindow;
        this.state = {
            numberOfResults: 5,
            rentItems: [],
            favItems: [],
            isModal: false,
            id: 0
        }
    }
    handleClick(event){
        if(event.target.name === "searchCity" && event.target.type === "button"){
            const newCity = document.querySelector(`#${this.root.id} input[name="${event.target.name}"][type="text"]`)
                            .value.toLowerCase();
            this.getItems( newCity );
        }
        else if( event.target.name === "favorite" ) {
            this.modalWindow.rentItems = this.state.favItems;
            this.showModal();
        }
        else if( event.target.classList.contains("more") ) {
            this.state.numberOfResults += parseInt( event.target.getAttribute("data-numbers") );
            this.getItems( '', '', this.state.numberOfResults );
        }
        else if(  event.target.classList.contains("pageNumber") ){
            this.getItems('',  parseInt(event.target.getAttribute("data-page")) );

        }
        else if( this.state.isModal ){
            this.modalWindow.handleClick( this, event );
            this.state.favItems.map(item => item.handleClick(this, event))
        }
        else {
            if( !this.state.favItems.map(item => item.handleClick(this, event)).filter(Boolean).length ) {
                this.state.rentItems.map(item => item.handleClick(this, event));
            }
        }
    }
    showModal( item ){
        this.modalWindow.render( item );
        document.body.classList.add("modal-open");
        this.state.isModal = true;
    }
    getItems(searchFor,  pageNumber, numberOfResults )  {
        this.service.getHouses(searchFor, pageNumber, numberOfResults);
    }
    success(data){
        this.state.rentItems = data.response.listings.map(rentItem => {
            return this.state.favItems.length ===0
                ? new this.factory({ addedToFav: false, ...rentItem})
                : ( this.state.favItems.filter( favItem => favItem.id === new this.factory(rentItem).id ).length === 0
                    ? new this.factory({ addedToFav: false, ...rentItem})
                    : new this.factory({ addedToFav: true, ...rentItem}) )
        });
        this.render();
    }
    createModal(){
        const modalWrapper = document.createElement("div");
        modalWrapper.classList.add("modal");
        this.root.prepend(modalWrapper);
        this.modalWindow.root = document.querySelector(`#${this.root.id} .modal`);
    }
    getTemplate(items = this.state.rentItems){
        const inputs =
            `<div class="root-forms">
                <input type="text" name="searchCity" placeholder="Your city...">
                <input type="button" name="searchCity" value="Find">
                <input type="button" name="favorite" value="favorite" >
             </div>`;
        const wrapper = document.createElement("div");
        wrapper.innerHTML = inputs;
        const ul = super.getTemplate( items );
        wrapper.append(ul);
        const paginationWrapper = document.createElement("div");
        paginationWrapper.classList.add("pagination");
        paginationWrapper.innerHTML = [ ...new Array(8)].reduce( (acc,pageNumer, i) => {
            return acc+`<span class="pageNumber" data-page="${i+1}"> ${i+1} </span>`
        }, `<div class="show-more">
                <span class="more" data-numbers="5">SHOW MORE</span>
                <span class="more" data-numbers="-5">SHOW LESS</span>
            </div>` );
        wrapper.append(paginationWrapper);
        return wrapper;
    }
    render(){
        super.render();
        this.createModal();
    }
}
class NestoriaPropertyItem {
    constructor( { addedToFav = false, ...rest} ) {
        this.state = {
            added: addedToFav
        };
        this.rest = rest;
        this.id = `${this.rest.latitude}${this.rest.longitude}${this.rest.price}`;

    }
    getTemplate() {
        return `<div class="rent-property trigger" key="${this.id}">
                    <div>
                        <img src=${this.rest.thumb_url} alt="img">
                        <p>Keywords: ${this.rest.keywords}</p>
                    </div>
                    <div>
                        <p>Price: ${this.rest.price_formatted}</p>
                    </div>
                    <div class="summary-add">
                        <p>Summary: ${this.rest.summary}</p>
                        <div>
                            <input 
                                type="button" class="${ this.state.added ? "added" : ""}" 
                                name="addToFavorite"
                                value="${this.state.added ? "Remove from favorite" : "Add to favorite"}" />
                            <a href="${this.rest.lister_url}" target="_blank">Purchase</a>
                        </div>
                    </div>
                </div>`;
    }
    getInfo(){
        const info = Object.keys( this.rest ).filter( (key,i) => i%3 === 0 ).reduce( (acc, key) => {
            return acc + `<p>${key}: ${this.rest[key]}</p>`
        }, '');
        const wrapper = document.createElement("div");
        wrapper.classList.add("modal-content");
        wrapper.innerHTML = info;
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
                if( this.state.added ){
                    controller.state.favItems = controller.state.favItems.filter( item => item.id !== this.id);
                    event.target.classList.remove("added");
                    event.target.value = "Add to favorite";
                    this.state.added = false;
                } else{
                    controller.state.favItems.push(this);
                    event.target.classList.add("added");
                    event.target.value = "Remove from favorite";
                    this.state.added = true;
                }
                return "It was in favorite"
            }
            else if( event.target.tagName !== "A" ){
                controller.showModal( this );
            }

        }
    }
}


const modal = new ModalView();
const listData = new NestoriaService("list");
const list = new MainView(  document.getElementById("root"), listData, NestoriaPropertyItem, modal  );
list.getItems();
list.onInit();



