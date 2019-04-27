/**
 * Created by vlad on 26.04.2019.
 */

function onSubmit()  {
    addScript('https://api.nestoria.co.uk/' +
        'api?encoding=json&pretty=1&action=search_listings&country=uk&listing_type=buy&place_name=brighton');
}

function addScript(url) {
    let script = document.createElement('script');
    script.async = true;
    script.src = url + '&callback=succsess';
    console.log(script);
    document.head.appendChild(script);
}

function succsess(data) {
    console.log(data)
}

function toggleModal() {
    modal.classList.toggle("show-modal");
}

function windowOnClick(event) {
    if (event.target === modal) {
        toggleModal();
    }
}



onSubmit();




const modal = document.querySelector(".modal");
const trigger = document.querySelector(".trigger");
const closeButton = document.querySelector(".close-button");



trigger.addEventListener("click", toggleModal);
closeButton.addEventListener("click", toggleModal);
window.addEventListener("click", windowOnClick);