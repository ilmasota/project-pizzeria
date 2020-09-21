import {settings, select, classNames} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';

const app = {

  initBooking: function(){
    const thisApp = this;
    /* find container for booking */
    const bookingContainer = document.querySelector(select.containerOf.booking);

    /* create instance of class Booking */
    thisApp.booking = new Booking(bookingContainer);
  },
  initPages: function(){
    const thisApp = this;

    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    thisApp.navLinks = document.querySelectorAll(select.nav.links);

    const idFromHash = window.location.hash.replace('#/', '');

    let pageMatchingHash = thisApp.pages[0].id;

    for(let page of thisApp.pages){
      if(page.id == idFromHash){
        pageMatchingHash = page.id;
        break;
      }
    }

    thisApp.activatePage(pageMatchingHash);

    for(let link of thisApp.navLinks){
      link.addEventListener('click', function(event){
        const clickedElement = this;
        event.preventDefault();

        /* get page id from href attribute */
        const id = clickedElement.getAttribute('href').replace('#', '');

        /* run thisApp.activatePage with page id*/
        thisApp.activatePage(id);

        /* change URL hash */
        window.location.hash = '#/' + id;
      });
    }
  },

  activatePage: function(pageId){
    const thisApp = this;

    /* add class active to matching pages, remove from non-matching */
    for(let page of thisApp.pages){
      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }

    /* add class active to matching links, remove from non-matching */

    for(let link of thisApp.navLinks){
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') == '#' + pageId
      );
    }
  },

  initMenu: function(){
    const thisApp = this;

    // instances of class Product
    for(let productData in thisApp.data.products){
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },

  initData: function(){
    const thisApp = this;
    thisApp.data = {};

    const url = settings.db.url + '/' + settings.db.product;

    fetch(url)
      .then(function(rawResponse){
        return rawResponse.json();
      })
      .then(function(parsedResponse){

        /* save parsedResponse as thisApp.data.products */
        thisApp.data.products = parsedResponse;

        /* execute initMenu() method */
        thisApp.initMenu();
      });
  },

  initCart: function(){
    const thisApp = this;
    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem); // -> outside of this function instance of cart can be called as "app.cart"

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', function(event){
      app.cart.add(event.detail.product);
    });
  },

  initCarousel: function(){

    const review = [];
    review[0] = {
      title: 'amazing service!',
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      author: '-Margaret Oswald'
    };
    review[1] ={
      title: 'great food!',
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      author: '-Margaret Thatcher'
    };
    review[2] ={
      title: 'They will feed you like your grandma!',
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      author: '-Margaret Grandma'
    };

    let i = 0;
    const indicators = document.querySelectorAll('.carousel-triggers i');

    function slider() {
      const title = document.querySelector('.review-title');
      const text = document.querySelector('.review-text');
      const author = document.querySelector('.reviewer');
      title.innerHTML = review[i].title;
      text.innerHTML = review[i].text;
      author.innerHTML = review[i].author;

      for (let indicator of indicators) {
        if (indicator.id == i + 1 ) {
          indicator.classList.add('active');
        } else {
          indicator.classList.remove('active');
        }
      }

      if(i < review.length - 1 ){
        i++;
      } else {
        i=0;
      }
    }
    slider();

    setInterval(() => {
      slider();
    }, 3000);

  },

  init: function(){
    const thisApp = this;

    thisApp.initPages();

    thisApp.initCart();
    thisApp.initData();
    thisApp.initBooking();
    thisApp.initCarousel();

  },
};

app.init();
