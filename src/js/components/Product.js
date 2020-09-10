import {select, templates, classNames} from '../settings.js';
import {utils} from '../utils.js';
import AmountWidget from './AmountWidget.js';

class Product{
  constructor(id, data){
    const thisProduct = this;

    thisProduct.id = id;
    thisProduct.data = data;

    thisProduct.renderInMenu();
    thisProduct.getElements();

    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();

    thisProduct.initAccordion();

    //console.log('new Product:', thisProduct);
  }

  renderInMenu(){
    const thisProduct = this;

    /* generate HTML for individual product, based on template */
    const generatedHTML = templates.menuProduct(thisProduct.data);
    // console.log(generatedHTML);
    /* generate DOM element based on product's code (utils.createElementFromHTML)*/
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);
    /* find menu container on website */
    const menuContainer = document.querySelector(select.containerOf.menu);
    /* add DOM element to menu */
    menuContainer.appendChild(thisProduct.element);
  }

  getElements(){
    const thisProduct = this;

    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    //console.log(thisProduct.accordionTrigger);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form); // '.product__order'
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs); // 'input, select'
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton); // '[href="#add-to-cart"]'
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem); // '.product__total-price .price'
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper); // '.product__images'
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget); // '.widget-amount'
  }

  initAccordion(){
    const thisProduct = this;
    //console.log(thisProduct);
    /* find the clickable trigger (the element that should react to clicking) */
    const accordionTrigger = thisProduct.accordionTrigger;
    //console.log(accordionTrigger);
    /* START: click event listener to trigger */
    accordionTrigger.addEventListener('click', function(){
      /* prevent default action for event */
      event.preventDefault();
      /* toggle active class on element of thisProduct */
      thisProduct.element.classList.toggle('active');
      /* find all active products */
      const allActiveProducts = document.querySelectorAll(select.all.menuProductsActive);
      /* START LOOP: for each active product */
      for(let activeProduct of allActiveProducts){
        /* START: if the active product isn't the element of thisProduct */
        if (thisProduct.element !== activeProduct) {
          /* remove class active for the active product */
          activeProduct.classList.remove('active');
          /* END: if the active product isn't the element of thisProduct */
        }
        /* END LOOP: for each active product */
      }
      /* END: click event listener to trigger */
    });
  }

  initOrderForm(){
    const thisProduct = this;
    // console.log('initOrderForm');
    thisProduct.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });

    for(let input of thisProduct.formInputs){
      input.addEventListener('change', function(){
        thisProduct.processOrder();
      });
    }

    thisProduct.cartButton.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }

  processOrder(){
    const thisProduct = this;
    /* const formData - creating objects that are default */
    const formData = utils.serializeFormToObject(thisProduct.form);
    // console.log('formData', formData);

    /* thisProduct.params object */
    thisProduct.params = {};

    /* const price for default price */
    let price = thisProduct.data.price;
    // console.log(price);

    /* LOOP for each param in params - iterating over parameters */
    for(let paramId in thisProduct.data.params){
      // console.log(paramId);
      const param = thisProduct.data.params[paramId];
      //console.log(param);

      /* LOOP for each optionID in param.options - iterating over options of parameters */
      for(let optionId in param.options){
        //console.log(optionID);
        const option = param.options[optionId];
        //console.log(option);
        //console.log(option.price);

        const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;
        /* START IF: if option is selected and option is not default */
        if(optionSelected && !option.default){
          /* add price of option to variable price */
          price += option.price;
          /* END IF: if option is selected and option is not default */
          /* START ELSE IF: if option is not selected and option is default */
        } else if(!optionSelected && option.default){
          /* deduct price of option from price */
          price -= option.price;
          /* END ELSE IF: if option is not selected and option is default */
        }

        /* create const for found elements */
        const imagesClass = '.'+paramId+'-'+optionId;

        /* if/else - check if option is selected */
        if(optionSelected){
          if(!thisProduct.params[paramId]){
            thisProduct.params[paramId] = {
              label: param.label,
              options: {},
            };
          }
          thisProduct.params[paramId].options[optionId] = option.label;
          for (let imageOption of thisProduct.imageWrapper.querySelectorAll(imagesClass)){
            imageOption.classList.add(classNames.menuProduct.imageVisible);
          }
        } else {
          for (let imageOption of thisProduct.imageWrapper.querySelectorAll(imagesClass)){
            imageOption.classList.remove(classNames.menuProduct.imageVisible);
          }
        }
        /* end LOOP for each optionID */
      }
      /* end LOOP for each paramID */
    }
    /* multiply price by amount */
    //console.log(thisProduct.priceElem);
    thisProduct.priceSingle = price;
    thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;

    /* set the contents of thisProduct.priceElem to be the value of variable price */
    thisProduct.priceElem.innerHTML = thisProduct.price;

    // console.log(thisProduct.params);
  }

  initAmountWidget(){
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    thisProduct.amountWidgetElem.addEventListener('updated', function(){
      thisProduct.processOrder();
    });
  }

  addToCart(){
    const thisProduct = this;

    /* simplify const's */
    thisProduct.name = thisProduct.data.name;
    thisProduct.amount = thisProduct.amountWidget.value;

    // app.cart.add(thisProduct);

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct,
      },
    });

    thisProduct.element.dispatchEvent(event);

  }
}

export default Product;
