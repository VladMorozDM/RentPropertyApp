/**
 * Created by vlad on 26.04.2019.
 */




class Model{
    constructor(){
        this.state = {
            page: 0,
        };
    }
    getItems(){
        const result =
    }
}

class View {
    constructor(root, model = {}){
        this.RentItems = [];
        this.root = root;
        this.model = model;
        this.pages = []
    }
    refresh(){
        this.pages.push(this.model.next());
    }
    getTemplate(){
        const wrapper = document.createElement("div");
        const inputs = `<input type="text" name="searchCity" placeholder="Your city...">
            <input type="button" name="searchCity" value="Find">`;
        wrapper.innerHTML = inputs;
        const ul = document.createElement("ul");
        ul.setAttribute("class", "listContainer");
        this.RentItems.forEach(item => {
            console.log(item);
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

class Item {
    constructor({RentProperty = '', text = '', id = 0, done = false}) {
        this.RentProperty = RentProperty;
        this.text = text;
        this.id = id;
        this.done = done;
    }

    getTemplate() {
        return `<div class="rentProperty">Some City</div>`;
    }

    handleClick(controller, event) {

    }
}

const someProperties = [ {}, {}, {}, {} ];
const parsedProperties = someProperties.map( item => new Item(item) );

const list = new View( document.getElementById("root"));
list.RentItems = parsedProperties;
list.render();
// console.log(list);
